// QuickBooks READ-pull (paginated): mirrors ALL Customers, Items, and Estimates
// from QB into public.qb_customers / qb_items / qb_estimates. READ-ONLY against QB
// (no write-back — that stays manual). Durable token rotation via qb_oauth_tokens.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PAGE = 1000;

Deno.serve(async (_req: Request) => {
  try {
    const clientId     = Deno.env.get("QUICKBOOKS_CLIENT_ID") ?? Deno.env.get("QBO_CLIENT_ID");
    const clientSecret = Deno.env.get("QUICKBOOKS_CLIENT_SECRET") ?? Deno.env.get("QBO_CLIENT_SECRET");
    const baseUrl      = Deno.env.get("QB_API_URL") ?? "https://quickbooks.api.intuit.com";
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: row } = await sb.from("qb_oauth_tokens").select("refresh_token, realm_id").eq("id", 1).single();
    if (!row?.refresh_token) return json({ ok: false, stage: "config", error: "no_stored_refresh_token" }, 200);
    const realmId = row.realm_id;

    const r = await fetch("https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer", {
      method: "POST",
      headers: { "Authorization": `Basic ${btoa(`${clientId}:${clientSecret}`)}`, "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json" },
      body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: row.refresh_token }),
    });
    const rJson = await r.json().catch(() => ({}));
    if (!r.ok) return json({ ok: false, stage: "refresh", error: rJson.error ?? "refresh_failed", error_description: rJson.error_description ?? null }, 200);
    if (typeof rJson.refresh_token === "string") {
      await sb.from("qb_oauth_tokens").update({ refresh_token: rJson.refresh_token, updated_at: new Date().toISOString() }).eq("id", 1);
    }
    const accessToken = rJson.access_token;
    const num = (v: unknown) => (v == null ? null : Number(v));
    const now = () => new Date().toISOString();

    // Page through an entity, upserting each page; returns total rows synced.
    async function syncEntity(entity: string, table: string, map: (x: any) => Record<string, unknown>): Promise<number> {
      let start = 1, total = 0;
      while (true) {
        const query = `SELECT * FROM ${entity} STARTPOSITION ${start} MAXRESULTS ${PAGE}`;
        const res = await fetch(`${baseUrl}/v3/company/${realmId}/query?query=${encodeURIComponent(query)}&minorversion=70`,
          { headers: { "Authorization": `Bearer ${accessToken}`, "Accept": "application/json" } });
        const j = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(`${entity} query failed (${res.status}): ${JSON.stringify(j.Fault ?? j).slice(0, 200)}`);
        const rows = (j.QueryResponse ?? {})[entity] ?? [];
        if (!rows.length) break;
        const { error } = await sb.from(table).upsert(rows.map(map), { onConflict: "qb_id" });
        if (error) throw new Error(`${table} upsert failed: ${error.message}`);
        total += rows.length;
        if (rows.length < PAGE) break;   // last page
        start += PAGE;
      }
      return total;
    }

    const customers = await syncEntity("Customer", "qb_customers", (c: any) => ({
      qb_id: c.Id, display_name: c.DisplayName, company_name: c.CompanyName ?? null,
      email: c.PrimaryEmailAddr?.Address ?? null, active: c.Active ?? null, balance: num(c.Balance), raw: c, synced_at: now(),
    }));
    const items = await syncEntity("Item", "qb_items", (i: any) => ({
      qb_id: i.Id, name: i.Name, type: i.Type ?? null, unit_price: num(i.UnitPrice), active: i.Active ?? null, raw: i, synced_at: now(),
    }));
    const estimates = await syncEntity("Estimate", "qb_estimates", (e: any) => ({
      qb_id: e.Id, doc_number: e.DocNumber ?? null, customer_ref: e.CustomerRef?.value ?? null, customer_name: e.CustomerRef?.name ?? null,
      txn_date: e.TxnDate ?? null, total: num(e.TotalAmt), status: e.TxnStatus ?? null, raw: e, synced_at: now(),
    }));

    return json({ ok: true, pulled: { customers, items, estimates }, realm_id: realmId }, 200);
  } catch (err) {
    return json({ ok: false, stage: "runtime", error: err instanceof Error ? err.message : String(err) }, 200);
  }
});

function json(o: unknown, s: number): Response {
  return new Response(JSON.stringify(o), { status: s, headers: { "Content-Type": "application/json" } });
}
