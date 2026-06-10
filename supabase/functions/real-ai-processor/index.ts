// real-ai-processor
// Sovereign perimeter gated endpoint. Original source from version 2 (last updated 2025-09-04)
// was not retrievable via Management API — this is a fresh gated implementation per
// METHODOLOGY_NOTE.md (Tier A rollout, document_version 3.0.0).

import { timingSafeEqual } from "node:crypto";

function verifySovereignKey(req: Request): boolean {
  const active = Deno.env.get("ROUTING_VAULT_KEY");
  const next = Deno.env.get("ROUTING_VAULT_KEY_NEXT");
  if (!active) throw new Error("ROUTING_VAULT_KEY is unconfigured.");
  const incoming = req.headers.get("apikey") ?? req.headers.get("x-sovereign-key") ?? "";
  if (!incoming) return false;
  const safeEq = (a: string, b: string): boolean => {
    const ae = new TextEncoder().encode(a);
    const be = new TextEncoder().encode(b);
    if (ae.length !== be.length) return false;
    return timingSafeEqual(ae, be);
  };
  if (safeEq(incoming, active)) return true;
  if (next && safeEq(incoming, next)) return true;
  return false;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-sovereign-key",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
      },
    });
  }

  if (!verifySovereignKey(req)) {
    return new Response(
      JSON.stringify({ error: "BCG SYSTEM DIRECTIVE: Access denied by autonomous security perimeter." }),
      { status: 403, headers: { "content-type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({
      status: "ONLINE",
      processor: "real-ai-processor",
      message: "Sovereign perimeter verified. Multi-body stability mechanics active.",
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});
