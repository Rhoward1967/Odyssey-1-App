// deno-lint-ignore-file no-import-prefix
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🚀 Checkout session request received');
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');

    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }

    const body = await req.json();
    console.log('📦 Full request body:', JSON.stringify(body, null, 2));

    // CRITICAL: We added userId and userEmail to the destructive body read
    const { tier, price, userId, userEmail } = body;

    const priceId99 = Deno.env.get('STRIPE_PRICE_ID_99');
    const priceId299 = Deno.env.get('STRIPE_PRICE_ID_299');
    const priceId999 = Deno.env.get('STRIPE_PRICE_ID_999');

    let priceId: string;

    // Mapping logic (Hardened)
    if (price === '99' || tier === 'Basic' || tier === 'ODYSSEY Basic' || tier === 'basic') {
      priceId = priceId99!;
    } else if (price === '299' || tier === 'Professional' || tier === 'ODYSSEY Professional' || tier === 'pro') {
      priceId = priceId299!;
    } else if (price === '999' || tier === 'Enterprise' || tier === 'ODYSSEY Enterprise' || tier === 'enterprise') {
      priceId = priceId999!;
    } else {
      throw new Error(`Invalid tier: ${tier}`);
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Create checkout session with TRUST METADATA
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: userEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${req.headers.get('origin')}/app?subscription=success`,
      cancel_url: `${req.headers.get('origin')}/subscribe`,
      // This block ensures the database knows WHO paid and WHERE the royalty goes
      metadata: {
        supabase_user_id: userId,
        tier_name: tier,
        trust_beneficiary: "Howard Jones Bloodline Ancestral Trust",
        royalty_trigger: "35_percent_mastery_tax"
      },
      subscription_data: {
        metadata: {
          supabase_user_id: userId,
          tier_name: tier
        }
      }
    });

    console.log('✅ Session created for:', userEmail);

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
