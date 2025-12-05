-- Rollback: Remove placeholder views
DROP VIEW IF EXISTS public.company_bank_accounts;
DROP VIEW IF EXISTS public.stripe_events;
DROP VIEW IF EXISTS public.cost_metrics;
DROP VIEW IF EXISTS public.governance_log;
DROP VIEW IF EXISTS public.handbook_content;

-- Rollback: Remove RLS policy for employees
DROP POLICY IF EXISTS select_employees_by_org ON public.employees;
-- Optionally disable RLS if it was not enabled before
-- ALTER TABLE public.employees DISABLE ROW LEVEL SECURITY;

-- Rollback: Remove safe_update_paystubs RPC
DROP FUNCTION IF EXISTS public.safe_update_paystubs;
