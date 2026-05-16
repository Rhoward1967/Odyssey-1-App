/**
 * OSC Stripe Webhook — Payment Confirmation & OSC Minting
 * Receives Stripe payment confirmation → mints OSC to user account
 * * © 2026 Rickey Allan Howard / Howard Jones Bloodline Ancestral Trust
 * Patent Pending: USPTO #63/913,134
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

// Fixed 'req' type error by explicitly typing it
serve(async (req: Request) => {
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

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response('No signature', { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;

  try {
    // FIXED: constructEventAsync for Deno/SubtleCrypto compatibility
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      STRIPE_OSC_WEBHOOK_SECRET
    );
  } catch (err) {
    // Fixed 'err' type error
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', message);
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }

  if (event.type !== 'checkout.session.completed') {
    return new Response('Event type not handled', { status: 200 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (session.metadata?.type !== 'OSC_ACQUISITION') {
    return new Response('Not an OSC acquisition event', { status: 200 });
  }

  if (session.payment_status !== 'paid') {
    return new Response('Payment not completed', { status: 200 });
  }

  const userId = session.metadata?.user_id;
  const oscAmount = parseInt(session.metadata?.osc_amount || '0');
  const usdAmount = parseFloat(session.metadata?.usd_amount || '0');

  if (!userId || oscAmount <= 0) {
    return new Response('Invalid session metadata', { status: 400 });
  }

  // Idempotency check
  const { data: existingTx } = await supabase
    .from('osc_transactions')
    .select('id')
    .eq('reference', `stripe:${session.id}`)
    .maybeSingle();

  if (existingTx) {
    return new Response('Already processed', { status: 200 });
  }

  try {
    const { data: supply } = await supabase
      .from('osc_supply')
      .select('public_forge_remaining')
      .single();

    if (!supply || supply.public_forge_remaining < oscAmount) {
      throw new Error('Insufficient Public Forge supply');
    }

    const { data: existingAccount } = await supabase
      .from('osc_accounts')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const currentBalance = existingAccount?.balance || 0;
    const currentAcquired = existingAccount?.total_acquired || 0;

    if (existingAccount) {
      await supabase
        .from('osc_accounts')
        .update({
          balance: currentBalance + oscAmount,
          total_acquired: currentAcquired + oscAmount,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
    } else {
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

    await supabase.rpc('reduce_public_forge', { amount: oscAmount });

    return new Response(
      JSON.stringify({ success: true, userId, oscMinted: oscAmount }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // Fixed 'error' type error
    const message = error instanceof Error ? error.message : 'Minting failed';
    console.error('OSC minting failed:', message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});