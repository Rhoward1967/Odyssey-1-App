// R.O.M.A.N. Health Monitor — REAL autonomous detection (not a heartbeat).
// Every run: calls fn_roman_health_scan() (failing cron jobs + stale pipes like
// QuickBooks), records open alerts in roman_health_alerts, and PUSHES new problems
// to Discord so they surface to a human instead of failing silently for months.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async () => {
  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data, error } = await sb.rpc("fn_roman_health_scan");
    if (error) return json({ ok: false, error: error.message }, 200);

    const problems = (data?.problems ?? []) as Array<{ source: string; signature: string; detail: string }>;
    const webhook = Deno.env.get("DISCORD_WEBHOOK_URL");
    let alerted = false;

    if (problems.length && webhook) {
      const lines = problems
        .map((p) => `• [${p.source}] ${p.signature}: ${String(p.detail).split("\n")[0].slice(0, 150)}`)
        .join("\n");
      const content = `🚨 R.O.M.A.N. Health Monitor — ${problems.length} issue(s) detected:\n${lines}`.slice(0, 1900);
      const r = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      alerted = r.ok;
    }

    return json({ ok: true, problem_count: problems.length, alerted, problems }, 200);
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : String(e) }, 200);
  }
});

function json(o: unknown, s: number): Response {
  return new Response(JSON.stringify(o), { status: s, headers: { "Content-Type": "application/json" } });
}
