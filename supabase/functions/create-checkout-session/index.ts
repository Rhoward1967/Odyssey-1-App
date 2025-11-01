import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { tier, userId, email, successUrl, cancelUrl } = body ?? {};

    // Replace these with your real Stripe Price IDs
    const PRICE_IDS: Record<string, string> = {
      basic: "price_XXXXX",    // $99/month
      pro: "price_XXXXX",      // $299/month
      ultimate: "price_XXXXX", // $999/month
    };

    const priceId = PRICE_IDS[tier];
    if (!priceId) {
      return new Response(
        JSON.stringify({ error: "Invalid tier selected" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecret) {
      return new Response(
        JSON.stringify({ error: "Server misconfigured: STRIPE_SECRET_KEY missing" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Build form-encoded body per Stripe API
    const params = new URLSearchParams();
    params.append("mode", "subscription");
    params.append("success_url", successUrl);
    params.append("cancel_url", cancelUrl);
    params.append("customer_email", email);
    // line_items[0][price]=priceId and quantity
    params.append("line_items[0][price]", priceId);
    params.append("line_items[0][quantity]", "1");
    // metadata
    if (userId) params.append("metadata[userId]", userId);
    if (tier) params.append("metadata[tier]", tier);

    const resp = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecret}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const respJson = await resp.json();

    if (!resp.ok) {
      const errorMessage = respJson?.error?.message || "Stripe API error";
      return new Response(JSON.stringify({ error: errorMessage }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: resp.status || 400,
      });
    }

    // Stripe returns a "url" property for Checkout Sessions; include it
    return new Response(
      JSON.stringify({ sessionId: respJson.id, sessionUrl: respJson.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
