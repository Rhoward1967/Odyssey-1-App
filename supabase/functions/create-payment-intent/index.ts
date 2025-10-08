// @ts-expect-error: Supabase Edge Functions provide global serve and Deno types at runtime
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @ts-expect-error: Stripe import for Deno Edge Functions, types provided at runtime
import Stripe from 'https://esm.sh/stripe@10.12.0?target=deno&no-check';

// Get secret key safely for both Deno and Edge runtime
// @ts-expect-error: Deno global is available at runtime in Supabase Edge Functions
const STRIPE_SECRET_KEY = typeof Deno !== 'undefined' && Deno.env && typeof Deno.env.get === 'function'
  ? Deno.env.get('STRIPE_SECRET_KEY')
  : undefined;

if (!STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in the environment.');
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req: Request): Promise<Response> => {
  try {
    // Note: This is a simplified example. In a real application, you would
    // calculate the amount based on the items in the user's cart.
    const amount = 1000; // $10.00 USD

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    let message = 'Unknown error';
    if (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
      message = (error as any).message;
    }
    return new Response(JSON.stringify({ error: message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
