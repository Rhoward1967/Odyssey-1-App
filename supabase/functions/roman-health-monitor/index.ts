// R.O.M.A.N. Health Monitor + bounded AUTO-REMEDIATION.
// Every run: detect failures (fn_roman_health_scan), attempt ONLY safe/idempotent/
// reversible self-heals, then escalate whatever remains to Discord for a human.
//
// SAFETY DOCTRINE (deliberate): R.O.M.A.N. may auto-fix ONLY read-only/idempotent
// actions that cannot make anything worse (e.g. re-run a stale read-sync). It must
// NEVER autonomously change schema/code, send mail or money, or delete data — those
// are ESCALATED to a human, never attempted. This is bounded autonomy by design.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PROJECT = "https://tvsxloejfsrdganemsmg.supabase.co";

Deno.serve(async () => {
  try {
    const SR = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, SR);
    const remediations: string[] = [];

    let scan = await sb.rpc("fn_roman_health_scan");
    if (scan.error) return json({ ok: false, error: scan.error.message }, 200);
    let problems = (scan.data?.problems ?? []) as Array<{ source: string; signature: string; detail: string }>;

    // ── SAFE auto-remediation whitelist ──────────────────────────────────────
    // qb_stale: the QuickBooks pipe stopped refreshing → re-run the READ-ONLY,
    // idempotent sync (upsert by id). Cannot corrupt anything; worst case it fails
    // again and we escalate. This is the only currently-whitelisted self-heal.
    if (problems.some((p) => p.signature === "qb_stale")) {
      try {
        const r = await fetch(`${PROJECT}/functions/v1/quickbooks-read`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${SR}`, "Content-Type": "application/json" },
          body: "{}",
        });
        const rj = await r.json().catch(() => ({}));
        remediations.push(r.ok && rj?.ok ? "qb_stale → auto-healed: re-ran quickbooks-read" : "qb_stale → re-sync attempted, still failing (needs re-auth)");
      } catch (e) {
        remediations.push(`qb_stale → re-sync threw: ${e instanceof Error ? e.message : String(e)}`);
      }
      // Re-scan: anything healed is auto-resolved by fn_roman_health_scan
      scan = await sb.rpc("fn_roman_health_scan");
      problems = (scan.data?.problems ?? []) as typeof problems;
    }

    // ── Escalate whatever remains (NO risky auto-fix — human decision) ────────
    const webhook = Deno.env.get("DISCORD_WEBHOOK_URL");
    let alerted = false;
    if ((problems.length || remediations.length) && webhook) {
      const parts: string[] = [];
      if (remediations.length) parts.push("🔧 R.O.M.A.N. auto-remediation:\n" + remediations.map((m) => `• ${m}`).join("\n"));
      if (problems.length) {
        parts.push(`🚨 Needs a human — ${problems.length} issue(s) R.O.M.A.N. will NOT auto-fix:\n` +
          problems.map((p) => `• [${p.source}] ${p.signature}: ${String(p.detail).split("\n")[0].slice(0, 140)}`).join("\n"));
      }
      const r = await fetch(webhook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: parts.join("\n\n").slice(0, 1900) }) });
      alerted = r.ok;
    }

    return json({ ok: true, remediations, escalated: problems.length, alerted, problems }, 200);
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : String(e) }, 200);
  }
});

function json(o: unknown, s: number): Response {
  return new Response(JSON.stringify(o), { status: s, headers: { "Content-Type": "application/json" } });
}
