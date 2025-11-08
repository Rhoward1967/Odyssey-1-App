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

    // Get Stripe secret key
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    
    if (!stripeSecretKey) {
      console.error('❌ STRIPE_SECRET_KEY not found in environment');
      throw new Error('Stripe not configured - STRIPE_SECRET_KEY missing');
    }

    if (!stripeSecretKey.startsWith('sk_')) {
      console.error('❌ Invalid STRIPE_SECRET_KEY format:', stripeSecretKey.substring(0, 10));
      throw new Error('Invalid Stripe secret key format');
    }

    console.log('✅ Stripe secret key found:', stripeSecretKey.substring(0, 7) + '...');

    // Parse request body
    const body = await req.json();
    console.log('📦 Request body:', JSON.stringify(body, null, 2));

    const { tier, price, industry, userId, successUrl, cancelUrl } = body;

    // Get price ID
    let priceId: string | undefined;
    
    if (price === '99' || tier === 'Professional') {
      priceId = Deno.env.get('STRIPE_PRICE_ID_99');
      console.log('💰 Using $99 price ID:', priceId);
    } else if (price === '299' || tier === 'Business') {
      priceId = Deno.env.get('STRIPE_PRICE_ID_299');
      console.log('💰 Using $299 price ID:', priceId);
    } else if (price === '999' || tier === 'Enterprise') {
      priceId = Deno.env.get('STRIPE_PRICE_ID_999');
      console.log('💰 Using $999 price ID:', priceId);
    } else {
      throw new Error(`Invalid tier/price: ${tier} - $${price}`);
    }

    if (!priceId) {
      console.error('❌ Price ID not found for tier:', tier);
      throw new Error(`Price ID not configured for tier: ${tier}`);
    }

    if (!priceId.startsWith('price_')) {
      console.error('❌ Invalid price ID format:', priceId);
      throw new Error('Invalid price ID format');
    }

    console.log('✅ Price ID validated:', priceId);

    // Initialize Stripe
    console.log('🔌 Initializing Stripe...');
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });
    console.log('✅ Stripe initialized successfully');

    // Create checkout session
    console.log('💳 Creating Stripe checkout session...');
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${req.headers.get('origin')}/app?subscription=success`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/app/subscription`,
      client_reference_id: userId,
      metadata: {
        userId,
        tier,
        industry: industry || 'not-specified',
      },
      subscription_data: {
        metadata: {
          userId,
          tier,
          industry: industry || 'not-specified',
        },
      },
    });

    console.log('✅ Checkout session created successfully:', session.id);
    console.log('🔗 Checkout URL:', session.url);

    return new Response(
      JSON.stringify({ 
        url: session.url, 
        sessionId: session.id 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const err = error as Error;
    console.error('❌ Checkout error:', err);
    console.error('❌ Error type:', err.constructor.name);
    console.error('❌ Error message:', err.message);
    console.error('❌ Error stack:', err.stack);
    
    return new Response(
      JSON.stringify({
        error: err.message,
        type: err.constructor.name,
        details: err.toString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

