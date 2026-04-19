import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const { session_id, book_id } = await req.json();
    if (!session_id || !book_id) throw new Error('session_id and book_id required');

    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')?.trim();
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY)
      throw new Error('Missing environment variables');

    // Verify payment with Stripe
    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== 'paid') throw new Error('Payment not completed');

    // Get the book's file_url
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { data: book, error } = await supabase
      .from('books')
      .select('id, title, file_url')
      .eq('id', book_id)
      .single();
    if (error || !book) throw new Error('Book not found');
    if (!book.file_url) throw new Error('No file uploaded for this book yet');

    // Generate 1-hour signed download URL
    const { data: signed, error: signErr } = await supabase.storage
      .from('sovereign-books')
      .createSignedUrl(book.file_url, 3600, { download: book.title + '.pdf' });
    if (signErr) throw signErr;

    return new Response(
      JSON.stringify({ url: signed.signedUrl, title: book.title }),
      { headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }
});
