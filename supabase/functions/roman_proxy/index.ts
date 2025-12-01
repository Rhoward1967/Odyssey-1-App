import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve((req) => {
  // Accept either x-roman-secret header or Authorization: Bearer <secret>
  const expected = Deno.env.get("ROMAN_TO_VERCEL_SECRET");
  let sent = req.headers.get("x-roman-secret");
  if (!sent) {
    const auth = req.headers.get("authorization");
    if (auth && auth.startsWith("Bearer ")) {
      sent = auth.substring(7);
    }
  }
  if (sent !== expected) {
    return new Response(
      JSON.stringify({
        ok: false,
        reason: "Unauthorized",
        received: sent,
        expected: expected,
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
