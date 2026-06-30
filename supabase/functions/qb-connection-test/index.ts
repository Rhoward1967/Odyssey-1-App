// Read-only QuickBooks connectivity test with DURABLE token rotation.
// Reads the current refresh token from public.qb_oauth_tokens, refreshes,
// and PERSISTS the rotated refresh token back — so the pipe never dies after
// one use. Returns status/metadata only (never tokens).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (_req: Request) => {
  try {
    const clientId     = Deno.env.get("QUICKBOOKS_CLIENT_ID") ?? Deno.env.get("QBO_CLIENT_ID");
    const clientSecret = Deno.env.get("QUICKBOOKS_CLIENT_SECRET") ?? Deno.env.get("QBO_CLIENT_SECRET");
    const baseUrl      = Deno.env.get("QB_API_URL") ?? "https://quickbooks.api.intuit.com";
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    if (!clientId || !clientSecret) return json({ ok: false, stage: "config", error: "missing_client_creds" }, 200);

    const { data: row } = await sb.from("qb_oauth_tokens").select("refresh_token, realm_id").eq("id", 1).single();
    if (!row?.refresh_token) return json({ ok: false, stage: "config", error: "no_stored_refresh_token" }, 200);
    const realmId = row.realm_id;

    // Refresh (rotates the token)
    const r = await fetch("https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer", {
      method: "POST",
      headers: { "Authorization": `Basic ${btoa(`${clientId}:${clientSecret}`)}`, "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json" },
      body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: row.refresh_token }),
    });
    const rJson = await r.json().catch(() => ({}));
    if (!r.ok) return json({ ok: false, stage: "refresh", status: r.status, error: rJson.error ?? "refresh_failed", error_description: rJson.error_description ?? null }, 200);

    // PERSIST the rotated refresh token immediately
    let persisted = false;
    if (typeof rJson.refresh_token === "string") {
      const { error } = await sb.from("qb_oauth_tokens").update({ refresh_token: rJson.refresh_token, updated_at: new Date().toISOString() }).eq("id", 1);
      persisted = !error;
    }

    // companyinfo read with the fresh access token
    const info = await fetch(`${baseUrl}/v3/company/${realmId}/companyinfo/${realmId}?minorversion=70`, {
      headers: { "Authorization": `Bearer ${rJson.access_token}`, "Accept": "application/json" },
    });
    const iJson = await info.json().catch(() => ({}));
    if (!info.ok) return json({ ok: false, stage: "companyinfo", status: info.status, fault: iJson.Fault ?? null, refresh_persisted: persisted }, 200);
    const ci = (iJson.CompanyInfo ?? {}) as Record<string, unknown>;

    return json({
      ok: true, stage: "complete", realm_id: realmId,
      company_name: ci.CompanyName ?? null, legal_name: ci.LegalName ?? null, country: ci.Country ?? null,
      refresh_persisted: persisted,
    }, 200);
  } catch (err) {
    return json({ ok: false, stage: "runtime", error: err instanceof Error ? err.message : String(err) }, 200);
  }
});

function json(o: unknown, s: number): Response {
  return new Response(JSON.stringify(o), { status: s, headers: { "Content-Type": "application/json" } });
}
