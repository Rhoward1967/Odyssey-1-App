// roman-status — real system counts, computed server-side with the service role
// (bypasses RLS). The R.O.M.A.N. execution engine runs in the browser under RLS
// and cannot read these tables directly, so SYSTEM_STATUS calls this for true numbers.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async () => {
  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const dayAgo = new Date(Date.now() - 86_400_000).toISOString();

    // Per-table graceful count (a missing table returns 0, never breaks the whole status)
    const c = async (table: string, mod?: (q: any) => any): Promise<number> => {
      try {
        let q = sb.from(table).select("*", { count: "exact", head: true });
        if (mod) q = mod(q);
        const { count } = await q;
        return count ?? 0;
      } catch { return 0; }
    };

    const [customers, contractors, schedules, knowledge_files, agents_active, commands_today] = await Promise.all([
      c("customers"),
      c("contractors"),
      c("recurring_invoices"),
      c("roman_knowledge_base"),
      c("agents", (q) => q.eq("status", "active")),
      c("roman_commands", (q) => q.gte("created_at", dayAgo)),
    ]);

    return new Response(
      JSON.stringify({ ok: true, customers, contractors, schedules, knowledge_files, agents_active, commands_today }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }), {
      status: 200, headers: { "Content-Type": "application/json" },
    });
  }
});
