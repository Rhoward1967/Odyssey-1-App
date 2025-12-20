import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response('No signature', { status: 400 });
  }

  const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
  const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return new Response('Missing environment variables', { status: 500 });
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);

      // Idempotency: log event and skip if already processed
      const eventId = event.id;
      const { data: existingEvent } = await supabase
        .from('stripe_event_log')
        .select('event_id')
        .eq('event_id', eventId)
        .single();

      if (existingEvent) {
        return new Response(JSON.stringify({ received: true, duplicate: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Log event for audit
      await supabase.from('stripe_event_log').insert({
        event_id: eventId,
        event_type: event.type,
        payload: event,
        received_at: new Date().toISOString()
      });

    switch (event.type) {
      case 'payment_intent.succeeded': {
        // Handle invoice payment success
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const invoiceId = paymentIntent.metadata?.invoice_id;

        if (invoiceId) {
          // Call record_invoice_payment function
          const { error: recordError } = await supabase.rpc('record_invoice_payment', {
            p_invoice_id: invoiceId,
            p_stripe_payment_intent_id: paymentIntent.id,
            p_amount: paymentIntent.amount / 100, // Convert cents to dollars
            p_payment_method: 'credit_card',
            p_metadata: {
              payment_intent_status: paymentIntent.status,
              charge_id: paymentIntent.latest_charge,
              timestamp: new Date().toISOString()
            }
          });

          if (recordError) {
            console.error('Error recording invoice payment:', recordError);
          } else {
            console.log(`Invoice payment recorded: ${invoiceId} - $${paymentIntent.amount / 100}`);
          }
        }
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const tier = session.metadata?.tier;
        const industry = session.metadata?.industry;
        const subscriptionId = session.subscription as string;

        if (userId && tier) {
          // Create subscription record
          await supabase.from('subscriptions').insert({
            user_id: userId,
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: session.customer,
            tier,
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          });

          // Update profile with industry and tier
          await supabase.from('profiles').update({
            subscription_tier: tier,
            industry,
            subscription_status: 'active'
          }).eq('id', userId);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        // Recurring payment succeeded - extend subscription
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = String(invoice.subscription || '');
        const customerId = String(invoice.customer || '');

        // Get period from invoice lines or invoice itself
        const line = invoice.lines?.data?.[0];
        const periodStart = line?.period?.start ?? invoice.period_start;
        const periodEnd = line?.period?.end ?? invoice.period_end;

        // Update subscription with new period
        await supabase.from('subscriptions').update({
          status: 'active',
          current_period_start: new Date((periodStart ?? invoice.created) * 1000).toISOString(),
          current_period_end: new Date((periodEnd ?? invoice.created) * 1000).toISOString(),
        }).or(`stripe_subscription_id.eq.${subscriptionId},stripe_customer_id.eq.${customerId}`);

        // Get user_id for payment record
        const { data: sub } = await supabase.from('subscriptions')
          .select('user_id')
          .or(`stripe_subscription_id.eq.${subscriptionId},stripe_customer_id.eq.${customerId}`)
          .single();

        if (sub) {
          // Update profile status
          await supabase.from('profiles').update({
            subscription_status: 'active'
          }).eq('id', sub.user_id);

          // Log payment in payments_v2 table
          await supabase.from('payments_v2').upsert({
            user_id: sub.user_id,
            amount: invoice.amount_paid / 100, // Convert cents to dollars
            currency_code: invoice.currency.toUpperCase(),
            stripe_payment_intent_id: invoice.payment_intent as string,
            stripe_charge_id: invoice.charge as string,
            status: 'confirmed',
            description: `Subscription renewal - ${invoice.lines?.data?.[0]?.description || 'Monthly payment'}`,
            subscription_tier: sub.user_id ? undefined : 'unknown',
            confirmed_at: new Date().toISOString(),
            created_at: new Date(invoice.created * 1000).toISOString(),
            metadata: {
              invoice_id: invoice.id,
              subscription_id: subscriptionId,
              invoice_url: invoice.hosted_invoice_url,
              billing_reason: invoice.billing_reason
            }
          }, { onConflict: 'stripe_payment_intent_id' });
        }
        break;
      }

      case 'invoice.payment_failed': {
        // Payment failed - mark subscription as past_due
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = String(invoice.subscription || '');
        const customerId = String(invoice.customer || '');

        await supabase.from('subscriptions').update({
          status: 'past_due'
        }).or(`stripe_subscription_id.eq.${subscriptionId},stripe_customer_id.eq.${customerId}`);

        // Get user for notification
        const { data: sub } = await supabase.from('subscriptions')
          .select('user_id')
          .or(`stripe_subscription_id.eq.${subscriptionId},stripe_customer_id.eq.${customerId}`)
          .single();

        if (sub) {
          // Update profile status
          await supabase.from('profiles').update({
            subscription_status: 'past_due'
          }).eq('id', sub.user_id);

          // Log failed payment
          await supabase.from('payments_v2').insert({
            user_id: sub.user_id,
            amount: invoice.amount_due / 100,
            currency_code: invoice.currency.toUpperCase(),
            stripe_payment_intent_id: invoice.payment_intent as string,
            status: 'failed',
            description: `Failed payment - ${invoice.lines?.data?.[0]?.description || 'Monthly payment'}`,
            created_at: new Date(invoice.created * 1000).toISOString(),
            metadata: {
              invoice_id: invoice.id,
              subscription_id: subscriptionId,
              failure_reason: invoice.last_finalization_error?.message || 'Payment failed',
              attempt_count: invoice.attempt_count
            }
          });

          // TODO: Send email notification to user about failed payment
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await supabase.from('subscriptions').update({
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        }).eq('stripe_subscription_id', subscription.id);

        // Update profile subscription status
        const { data: sub } = await supabase.from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (sub) {
          await supabase.from('profiles')
            .update({ subscription_status: subscription.status })
            .eq('id', sub.user_id);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await supabase.from('subscriptions').update({
          status: 'canceled'
        }).eq('stripe_subscription_id', subscription.id);

        // Update profile subscription status
        const { data: sub } = await supabase.from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (sub) {
          await supabase.from('profiles')
            .update({ subscription_status: 'canceled' })
            .eq('id', sub.user_id);
        }
        break;
      }

      case 'invoice.upcoming': {
        // 3 days before renewal - send reminder email
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = String(invoice.subscription || '');

        const { data: sub } = await supabase.from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscriptionId)
          .single();

        if (sub) {
          // TODO: Send renewal reminder email
          console.log(`Upcoming renewal for user ${sub.user_id}: $${invoice.amount_due / 100} on ${new Date(invoice.period_end * 1000).toLocaleDateString()}`);
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Webhook error:', errorMessage);
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
