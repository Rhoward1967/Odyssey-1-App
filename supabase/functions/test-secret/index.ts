// supabase/functions/test-secret/index.ts
// Minimal Edge Function to confirm secret access
// Does NOT log or return the secret value

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve((req) => {
  // Try to read the secret
  const token = Deno.env.get("REPLICATE_API_TOKEN");
  if (token && token.length > 0) {
    return new Response(
      JSON.stringify({ success: true, message: "Secret is accessible to Edge Function." }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } else {
    return new Response(
      JSON.stringify({ success: false, message: "Secret is NOT accessible. Check supabase secrets." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
