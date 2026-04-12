/**
 * KROGER TOKEN EDGE FUNCTION
 * ==========================
 * Server-side OAuth2 token exchange for Kroger Products API.
 * Keeps client_secret off the frontend bundle entirely.
 *
 * Called by: sovereignCouponEngine.ts
 * Returns:   { access_token, expires_in }
 *
 * © 2026 Rickey Allan Howard / Howard Jones Bloodline Ancestral Trust
 */

const KROGER_CLIENT_ID     = Deno.env.get('KROGER_CLIENT_ID')!;
const KROGER_CLIENT_SECRET = Deno.env.get('KROGER_CLIENT_SECRET')!;
const KROGER_TOKEN_URL     = 'https://api.kroger.com/v1/connect/oauth2/token';

Deno.serve(async (req: Request) => {
  // CORS — allow Odyssey-1 domains only
  const origin  = req.headers.get('origin') || '';
  const allowed = ['https://odyssey-1.ai', 'https://odyssey-1-app.vercel.app', 'http://localhost:8080'];
  const corsOrigin = allowed.includes(origin) ? origin : allowed[0];

  const corsHeaders = {
    'Access-Control-Allow-Origin':  corsOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const creds = btoa(`${KROGER_CLIENT_ID}:${KROGER_CLIENT_SECRET}`);

    const res = await fetch(KROGER_TOKEN_URL, {
      method:  'POST',
      headers: {
        'Authorization': `Basic ${creds}`,
        'Content-Type':  'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials&scope=product.compact',
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[kroger-token] Kroger auth failed:', err);
      return new Response(
        JSON.stringify({ error: 'Kroger auth failed', detail: err }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await res.json();

    return new Response(
      JSON.stringify({
        access_token: data.access_token,
        expires_in:   data.expires_in,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('[kroger-token] Error:', err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
