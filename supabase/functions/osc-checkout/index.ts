/**
 * OSC Checkout — Stripe Session Generator
 * Creates a Stripe Checkout session for OSC acquisition (USD flow)
 *
 * © 2026 Rickey Allan Howard / Howard Jones Bloodline Ancestral Trust
 * Patent Pending: USPTO #63/913,134
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OSC_GENESIS_PRICE_USD = 1.00;   // $1.00 per OSC
const BURN_RATE = 0.005;              // 0.5% deflationary burn

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const APP_URL = Deno.env.get('APP_URL') || 'http://localhost:8080';

    if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error('Missing environment variables');
    }

    // Verify user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request
    const { usdAmount } = await req.json();

    if (!usdAmount || usdAmount < 1 || usdAmount > 10000) {
      return new Response(JSON.stringify({ error: 'Invalid amount. Min $1, Max $10,000.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate OSC to be issued
    const oscAmount = Math.floor(usdAmount / OSC_GENESIS_PRICE_USD);
    const burnAmount = Math.ceil(oscAmount * BURN_RATE);

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(usdAmount * 100), // Stripe uses cents
            product_data: {
              name: `${oscAmount.toLocaleString()} O-1 Sovereignty Credits (OSC)`,
              description: [
                `Pre-paid utility credits for Odyssey-1 AI system access.`,
                `Backed by $7.6B IP portfolio — USPTO #63/913,134.`,
                `${oscAmount} OSC at $${OSC_GENESIS_PRICE_USD.toFixed(2)} per credit.`,
                `0.5% deflationary burn: ${burnAmount} OSC burned on first use.`,
                `Non-refundable. Closed-loop utility. Not a security or currency.`,
              ].join(' '),
              images: [],
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        user_id: user.id,
        osc_amount: oscAmount.toString(),
        burn_amount: burnAmount.toString(),
        usd_amount: usdAmount.toString(),
        type: 'OSC_ACQUISITION',
        issuer: 'Odyssey-1 AI LLC',
        backing: 'USPTO #63/913,134',
      },
      success_url: `${APP_URL}/osc-wallet?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/osc-wallet?status=cancelled`,
      payment_intent_data: {
        description: `OSC Acquisition — ${oscAmount} O-1 Sovereignty Credits — Odyssey-1 AI LLC`,
        metadata: {
          user_id: user.id,
          osc_amount: oscAmount.toString(),
          type: 'OSC_ACQUISITION',
        },
      },
    });

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        sessionUrl: session.url,
        oscAmount,
        burnAmount,
        usdAmount,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('OSC Checkout error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Checkout failed' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
