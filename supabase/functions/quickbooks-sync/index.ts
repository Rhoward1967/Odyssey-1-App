import { createClient } from "npm:@supabase/supabase-js@2.47.10";

// --- Configuration ---
const QB_API_URL = Deno.env.get("QB_API_URL") ?? "https://sandbox-quickbooks.api.intuit.com";
const COMPANY_ID = Deno.env.get("QB_COMPANY_ID");
const ACCESS_TOKEN = Deno.env.get("QB_ACCESS_TOKEN");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!COMPANY_ID || !ACCESS_TOKEN || !SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Critical: Missing required environment variables.");
}

const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

// Helper for standardized JSON responses with CORS
const json = (body: unknown, status = 200, extraHeaders: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-request-id",
      ...extraHeaders,
    },
  });

// Utility to keep numbers within safe bounds
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

// Soft-null normalization: Empty strings become null for cleaner DB storage
const asString = (v: unknown) => (typeof v === "string" && v.trim().length > 0 ? v : null);

// Retry wrapper with exponential backoff for 429/5xx errors
async function fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options);
      
      // Success or client error that shouldn't be retried (e.g., 400, 401, 403)
      // We explicitly retry 429 (Too Many Requests) and 5xx (Server Errors)
      if (res.ok || (res.status < 500 && res.status !== 429)) {
        return res;
      }

      if (i === retries) return res; // Return the final error if max retries reached

      // Exponential backoff: 500ms, 1000ms, 2000ms
      const delay = 500 * Math.pow(2, i);
      console.warn(`Attempt ${i + 1} failed (Status ${res.status}). Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    } catch (err) {
      if (i === retries) throw err; // Re-throw network errors after max retries
      
      const delay = 500 * Math.pow(2, i);
      console.warn(`Attempt ${i + 1} network error. Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Unreachable code in retry loop");
}

// --- Main Handler ---

Deno.serve(async (req) => {
  // 1. Handle CORS Preflight
  if (req.method === "OPTIONS") return json({}, 200);

  // 2. Restrict to POST
  if (req.method !== "POST") {
    return json({ success: false, error: "Method not allowed" }, 405);
  }

  const requestId = crypto.randomUUID();
  const header = { "x-request-id": requestId };

  try {
    if (!COMPANY_ID || !ACCESS_TOKEN) {
      return json({ success: false, error: "QuickBooks configuration missing" }, 500, header);
    }

    // 3. Parse inputs (tolerant to empty body)
    let startPosition = 1;
    let batchSize = 100;

    try {
      if (req.headers.get("content-type")?.includes("application/json")) {
        const body = await req.json();
        if (body.start_position) startPosition = Number(body.start_position);
        if (body.batch_size) batchSize = Number(body.batch_size);
      }
    } catch {
      // ignore malformed body, use defaults
    }

    // 4. Validate and clamp inputs
    startPosition = Number.isFinite(startPosition) ? Math.max(1, Math.floor(startPosition)) : 1;
    // QuickBooks MAXRESULTS is 1000; default safe batch is 100
    batchSize = Number.isFinite(batchSize) ? clamp(Math.floor(batchSize), 1, 1000) : 100;

    console.log(`[${requestId}] QB fetch start=${startPosition} size=${batchSize}`);

    // 5. Fetch from QuickBooks (with Retry)
    const qbQuery = `select * from Customer STARTPOSITION ${startPosition} MAXRESULTS ${batchSize}`;
    const url = `${QB_API_URL}/v3/company/${encodeURIComponent(COMPANY_ID)}/query?query=${encodeURIComponent(qbQuery)}`;

    const qbResponse = await fetchWithRetry(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        Accept: "application/json",
      },
    });

    if (!qbResponse.ok) {
      const errText = await qbResponse.text();
      console.error(`[${requestId}] QuickBooks API Error:`, qbResponse.status, errText.slice(0, 500));
      
      if (qbResponse.status === 401) {
          return json({ success: false, error: "QuickBooks Access Token expired", request_id: requestId }, 401, header);
      }
      return json({ success: false, error: "QuickBooks API request failed", request_id: requestId }, 502, header);
    }

    const qbData = await qbResponse.json();
    const qbCustomers = qbData?.QueryResponse?.Customer || [];

    console.log(`[${requestId}] Fetched ${qbCustomers.length} customers`);

    if (qbCustomers.length === 0) {
      return json({
        success: true,
        message: "No more customers found.",
        imported_count: 0,
        has_more: false,
        next_start_position: startPosition,
        request_id: requestId,
      }, 200, header);
    }

    // 6. Map Data
    const now = new Date().toISOString();
    
    type QuickBooksCustomer = {
      Id: string;
      DisplayName?: string;
      GivenName?: string;
      FamilyName?: string;
      CompanyName?: string;
      PrimaryEmailAddr?: { Address?: string };
      PrimaryPhone?: { FreeFormNumber?: string };
      BillAddr?: {
        Line1?: string;
        City?: string;
        CountrySubDivisionCode?: string;
        PostalCode?: string;
      };
    };

    type MappedCustomer = {
      external_id: string | null;
      first_name: string | undefined;
      last_name: string | undefined;
      company_name: string | null;
      email: string | null;
      phone: string | null;
      billing_address_line1: string | null;
      billing_city: string | null;
      billing_state: string | null;
      billing_zip: string | null;
      source: string;
      updated_at: string;
    };

    const mappedCustomers: MappedCustomer[] = (qbCustomers as QuickBooksCustomer[])
      .filter((c) => c?.Id)
      .map((c) => {
        const displayName = asString(c?.DisplayName) || "";
        const parts = displayName.split(" ").filter(Boolean);
        const firstName = asString(c?.GivenName) || parts[0];
        const lastName = asString(c?.FamilyName) || (parts.length > 1 ? parts.slice(1).join(" ") : undefined);

        return {
          external_id: asString(c?.Id),
          first_name: firstName,
          last_name: lastName,
          company_name: asString(c?.CompanyName),
          email: asString(c?.PrimaryEmailAddr?.Address),
          phone: asString(c?.PrimaryPhone?.FreeFormNumber),
          billing_address_line1: asString(c?.BillAddr?.Line1),
          billing_city: asString(c?.BillAddr?.City),
          billing_state: asString(c?.BillAddr?.CountrySubDivisionCode),
          billing_zip: asString(c?.BillAddr?.PostalCode),
          source: "quickbooks_migration",
          updated_at: now,
        };
      })
      .filter((r) => r.external_id);

    console.log(`[${requestId}] Upserting ${mappedCustomers.length} records`);

    // 7. Upsert to Supabase
    if (mappedCustomers.length > 0) {
      const { data: _data, error } = await supabase
        .from("customers")
        .upsert(mappedCustomers, {
          onConflict: "external_id",
          ignoreDuplicates: false,
        })
        .select();

      if (error) {
        console.error(`[${requestId}] Supabase Upsert Error:`, error);
        return json({ success: false, error: "Database synchronization failed", request_id: requestId }, 500, header);
      }
    }

    const nextStartPosition = startPosition + qbCustomers.length;
    const hasMore = qbCustomers.length === batchSize;

    return json({
      success: true,
      message: `Successfully synced ${mappedCustomers.length} clients from QuickBooks.`,
      imported_count: mappedCustomers.length,
      next_start_position: nextStartPosition,
      has_more: hasMore,
      request_id: requestId,
    }, 200, header);

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[${requestId}] Migration Failed:`, errorMsg);
    return json({ 
      success: false, 
      error: "Internal Server Error", 
      request_id: requestId 
    }, 500, header);
  }
});
