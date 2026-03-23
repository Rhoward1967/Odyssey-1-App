/**
 * OSC Stripe Webhook — Payment Confirmation & OSC Minting
 * Receives Stripe payment confirmation → mints OSC to user account
 *
 * © 2026 Rickey Allan Howard / Howard Jones Bloodline Ancestral Trust
 * Patent Pending: USPTO #63/913,134
 */

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

  const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
  const STRIPE_OSC_WEBHOOK_SECRET = Deno.env.get('STRIPE_OSC_WEBHOOK_SECRET');
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!STRIPE_SECRET_KEY || !STRIPE_OSC_WEBHOOK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return new Response('Missing environment variables', { status: 500 });
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Verify Stripe webhook signature
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response('No signature', { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      STRIPE_OSC_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Only process OSC acquisition events
  if (event.type !== 'checkout.session.completed') {
    return new Response('Event type not handled', { status: 200 });
  }

  const session = event.data.object as Stripe.CheckoutSession;

  // Verify this is an OSC acquisition
  if (session.metadata?.type !== 'OSC_ACQUISITION') {
    return new Response('Not an OSC acquisition event', { status: 200 });
  }

  // Verify payment was successful
  if (session.payment_status !== 'paid') {
    console.error(`Payment not completed. Status: ${session.payment_status}`);
    return new Response('Payment not completed', { status: 200 });
  }

  const userId = session.metadata?.user_id;
  const oscAmount = parseInt(session.metadata?.osc_amount || '0');
  const usdAmount = parseFloat(session.metadata?.usd_amount || '0');

  if (!userId || oscAmount <= 0) {
    console.error('Invalid metadata:', session.metadata);
    return new Response('Invalid session metadata', { status: 400 });
  }

  // Idempotency check — prevent double-minting
  const { data: existingTx } = await supabase
    .from('osc_transactions')
    .select('id')
    .eq('reference', `stripe:${session.id}`)
    .single();

  if (existingTx) {
    console.log(`Already processed session ${session.id} — skipping`);
    return new Response('Already processed', { status: 200 });
  }

  try {
    // 1. Verify Public Forge has sufficient supply
    const { data: supply } = await supabase
      .from('osc_supply')
      .select('public_forge_remaining')
      .single();

    if (!supply || supply.public_forge_remaining < oscAmount) {
      throw new Error('Insufficient Public Forge supply');
    }

    // 2. Get or create user OSC account
    const { data: existingAccount } = await supabase
      .from('osc_accounts')
      .select('*')
      .eq('user_id', userId)
      .single();

    const currentBalance = existingAccount?.balance || 0;
    const currentAcquired = existingAccount?.total_acquired || 0;

    if (existingAccount) {
      // Update existing account
      await supabase
        .from('osc_accounts')
        .update({
          balance: currentBalance + oscAmount,
          total_acquired: currentAcquired + oscAmount,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
    } else {
      // Create new account
      await supabase
        .from('osc_accounts')
        .insert({
          user_id: userId,
          balance: oscAmount,
          total_acquired: oscAmount,
          total_spent: 0,
          total_burned: 0,
        });
    }

    // 3. Record acquisition transaction
    await supabase
      .from('osc_transactions')
      .insert({
        user_id: userId,
        type: 'ACQUIRE',
        amount: oscAmount,
        burn_amount: 0,
        payment_method: 'USD',
        payment_amount: usdAmount,
        payment_currency: 'USD',
        reference: `stripe:${session.id}`,
      });

    // 4. Reduce Public Forge supply
    await supabase.rpc('reduce_public_forge', { amount: oscAmount });

    // 5. Log the mint event
    console.log(`OSC MINTED: ${oscAmount} OSC → user ${userId} | Stripe session ${session.id} | $${usdAmount} USD`);

    return new Response(
      JSON.stringify({
        success: true,
        userId,
        oscMinted: oscAmount,
        newBalance: currentBalance + oscAmount,
        stripeSession: session.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('OSC minting failed:', error);
    // Return 500 so Stripe retries the webhook
    return new Response(
      JSON.stringify({ error: 'Minting failed — will retry' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
