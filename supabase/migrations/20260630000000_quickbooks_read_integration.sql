-- QuickBooks READ integration (2026-06-30)
-- Read-only mirror of QB data for the estimate builder. Write-back stays manual.
-- Durable OAuth: refresh token lives in a table and is rotated-and-persisted by
-- the quickbooks-read / qb-connection-test edge functions (QB rotates the refresh
-- token on every use; not persisting it is what silently kills the pipe).

-- OAuth token store (single row). Service-role only; no RLS policies = no anon/auth access.
CREATE TABLE IF NOT EXISTS public.qb_oauth_tokens (
  id            int PRIMARY KEY DEFAULT 1,
  refresh_token text NOT NULL,
  realm_id      text,
  updated_at    timestamptz DEFAULT now(),
  CONSTRAINT one_row CHECK (id = 1)
);
ALTER TABLE public.qb_oauth_tokens ENABLE ROW LEVEL SECURITY;

-- Mirror tables (populated by the quickbooks-read edge function, upsert by qb_id)
CREATE TABLE IF NOT EXISTS public.qb_customers (
  qb_id text PRIMARY KEY, display_name text, company_name text, email text,
  active bool, balance numeric, raw jsonb, synced_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.qb_items (
  qb_id text PRIMARY KEY, name text, type text, unit_price numeric,
  active bool, raw jsonb, synced_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.qb_estimates (
  qb_id text PRIMARY KEY, doc_number text, customer_ref text, customer_name text,
  txn_date date, total numeric, status text, raw jsonb, synced_at timestamptz DEFAULT now()
);

ALTER TABLE public.qb_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qb_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qb_estimates ENABLE ROW LEVEL SECURITY;

-- Frontend (estimate builder) reads the mirror; read-only for authenticated users.
DROP POLICY IF EXISTS qb_customers_read ON public.qb_customers;
CREATE POLICY qb_customers_read ON public.qb_customers FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS qb_items_read ON public.qb_items;
CREATE POLICY qb_items_read ON public.qb_items FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS qb_estimates_read ON public.qb_estimates;
CREATE POLICY qb_estimates_read ON public.qb_estimates FOR SELECT TO authenticated USING (true);

-- SELF-REPORTING health: one query answers "is QB alive?". The nightly pull
-- refreshes the token (updating qb_oauth_tokens.updated_at), so a stale timestamp
-- means the pipe stopped — surfaced here instead of failing silently.
CREATE OR REPLACE VIEW public.v_qb_health WITH (security_invoker = true) AS
SELECT
  t.updated_at AS last_token_refresh,
  round(EXTRACT(EPOCH FROM (now() - t.updated_at)) / 3600, 1) AS hours_since_refresh,
  CASE WHEN t.updated_at > now() - interval '48 hours'
       THEN 'healthy'
       ELSE 'STALE — QuickBooks pull is not refreshing; check quickbooks-read / re-auth' END AS status,
  (SELECT count(*) FROM public.qb_customers) AS customers,
  (SELECT count(*) FROM public.qb_items)     AS items,
  (SELECT count(*) FROM public.qb_estimates) AS estimates,
  (SELECT max(synced_at) FROM public.qb_customers) AS last_data_sync
FROM public.qb_oauth_tokens t WHERE t.id = 1;
