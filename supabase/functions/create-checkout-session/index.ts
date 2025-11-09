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
    console.log('📍 Origin:', req.headers.get('origin'));
    console.log('📍 Method:', req.method);

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    
    if (!stripeSecretKey) {
      console.error('❌ STRIPE_SECRET_KEY not found in environment');
      throw new Error('STRIPE_SECRET_KEY not configured');
    }

    console.log('✅ Stripe key exists:', stripeSecretKey.substring(0, 7) + '...');
    console.log('🔑 Key starts with sk_?', stripeSecretKey.startsWith('sk_'));

    const body = await req.json();
    console.log('📦 Full request body:', JSON.stringify(body, null, 2));

    const { tier, price } = body;
    console.log('🎯 Tier:', tier);
    console.log('💵 Price:', price);

    // Map tiers to your actual Stripe price IDs
    let priceId: string;
    
    if (price === '99' || tier === 'Professional') {
      priceId = 'price_1S45KEDPqeWRzwCXi6awuzd4';
      console.log('💰 Selected $99 tier');
    } else if (price === '299' || tier === 'Business') {
      priceId = 'price_1S45LLDPqeWRzwCXNSNtLlm0';
      console.log('💰 Selected $299 tier');
    } else if (price === '999' || tier === 'Enterprise') {
      priceId = 'price_1S45NMDPqeWRzwCXMTAOnP5b';
      console.log('💰 Selected $999 tier');
    } else {
      console.error('❌ Invalid tier/price combination:', { tier, price });
      throw new Error(`Invalid tier: ${tier} / price: ${price}`);
    }

    console.log('💰 Final price ID:', priceId);
    console.log('🔌 Initializing Stripe...');

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    console.log('✅ Stripe initialized');
    console.log('💳 Creating checkout session...');

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get('origin')}/app?subscription=success`,
      cancel_url: `${req.headers.get('origin')}/app/subscription`,
    });

    console.log('✅ Session created successfully!');
    console.log('🆔 Session ID:', session.id);
    console.log('🔗 Checkout URL:', session.url);

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const err = error as Error;
    console.error('❌❌❌ FATAL ERROR ❌❌❌');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    console.error('Error type:', typeof err);
    console.error('Full error object:', JSON.stringify(err, null, 2));
    
    return new Response(
      JSON.stringify({ 
        error: err.message,
        name: err.name,
        type: typeof err,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

