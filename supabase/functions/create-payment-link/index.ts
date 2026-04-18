import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')?.trim();
    if (!STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not configured');

    const { name, price_cents, description, item_type = 'music' } = await req.json();
    if (!name || !price_cents) throw new Error('name and price_cents are required');

    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

    // 1. Create Product
    const product = await stripe.products.create({
      name,
      description: description ?? `${item_type === 'book' ? 'Digital book' : 'MP3 download'} — Believing Self Creations`,
      metadata: { item_type, source: 'odyssey-1' },
    });

    // 2. Create Price
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: price_cents,
      currency: 'usd',
    });

    // 3. Create Payment Link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
      after_completion: {
        type: 'redirect',
        redirect: { url: 'https://odyssey-1.ai/thank-you' },
      },
      metadata: { item_type, source: 'odyssey-1' },
    });

    return new Response(
      JSON.stringify({ url: paymentLink.url, payment_link_id: paymentLink.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
