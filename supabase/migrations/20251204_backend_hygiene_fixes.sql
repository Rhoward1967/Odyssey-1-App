-- Migration: Backend Hygiene and Security Fixes (2025-12-04)
-- 1. Recreate views without SECURITY DEFINER and set owner to postgres
DROP VIEW IF EXISTS public.v_paystub_outgoing_links;
CREATE OR REPLACE VIEW public.v_paystub_outgoing_links AS
SELECT
  ps.id AS paystub_id,
  ps.organization_id,
  ps.payperiodstart,
  ps.payperiodend,
  ps.status AS paystub_status,
  ppl.id AS link_id,
  ppl.link_type,
  ppl.amount_cents,
  op.id AS outgoing_payment_id,
  op.company_id,
  op.payee_id,
  op.method_id,
  op.status AS payment_status,
  op.amount_cents AS payment_amount_cents,
  op.currency AS payment_currency,
  op.scheduled_for,
  op.created_at AS payment_created_at
FROM public.paystubs ps
JOIN public.payroll_payment_links ppl ON ppl.paystub_id = ps.id
JOIN ops.outgoing_payments op ON op.id = ppl.outgoing_payment_id;
ALTER VIEW public.v_paystub_outgoing_links OWNER TO postgres;

DROP VIEW IF EXISTS public.v_payroll_outgoing_links_by_run;
CREATE OR REPLACE VIEW public.v_payroll_outgoing_links_by_run AS
SELECT
  pr.id AS payroll_run_id,
  pr.organization_id,
  pr.period_start,
  pr.period_end,
  pr.status AS payroll_run_status,
  ppl.id AS link_id,
  ppl.link_type,
  ppl.amount_cents,
  op.id AS outgoing_payment_id,
  op.company_id,
  op.payee_id,
  op.method_id,
  op.status AS payment_status,
  op.amount_cents AS payment_amount_cents,
  op.currency AS payment_currency,
  op.scheduled_for,
  op.created_at AS payment_created_at
FROM public.payroll_runs pr
JOIN public.payroll_payment_links ppl ON ppl.payroll_run_id = pr.id
JOIN ops.outgoing_payments op ON op.id = ppl.outgoing_payment_id;
ALTER VIEW public.v_payroll_outgoing_links_by_run OWNER TO postgres;

-- 2. Harden trigger function search_path
CREATE OR REPLACE FUNCTION public.set_ppl_org_from_sources() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM set_config('search_path', 'pg_temp,public', true);
  IF NEW.organization_id IS NULL THEN
    IF NEW.paystub_id IS NOT NULL THEN
      SELECT organization_id INTO NEW.organization_id FROM public.paystubs WHERE id = NEW.paystub_id;
    ELSIF NEW.payroll_run_id IS NOT NULL THEN
      SELECT organization_id INTO NEW.organization_id FROM public.payroll_runs WHERE id = NEW.payroll_run_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- 3. Add missing FK indexes
CREATE INDEX IF NOT EXISTS idx_outgoing_payments_method_id ON ops.outgoing_payments(method_id);
CREATE INDEX IF NOT EXISTS idx_outgoing_payments_payee_id ON ops.outgoing_payments(payee_id);
CREATE INDEX IF NOT EXISTS idx_outgoing_payments_provider_account_id ON ops.outgoing_payments(provider_account_id);
CREATE INDEX IF NOT EXISTS idx_recurring_rules_payee_id ON ops.recurring_rules(payee_id);
CREATE INDEX IF NOT EXISTS idx_contractor_profiles_user_id ON public.contractor_profiles(user_id);

-- 4. Normalize RLS policies to use (SELECT auth.uid())
DROP POLICY IF EXISTS contractor_profiles_select ON public.contractor_profiles;
CREATE POLICY contractor_profiles_select ON public.contractor_profiles
  FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.user_organizations WHERE user_id = (SELECT auth.uid())
    )
  );
DROP POLICY IF EXISTS contractor_profiles_modify ON public.contractor_profiles;
CREATE POLICY contractor_profiles_modify ON public.contractor_profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.user_organizations WHERE user_id = (SELECT auth.uid())
    )
  );
DROP POLICY IF EXISTS contractor_profiles_update ON public.contractor_profiles;
CREATE POLICY contractor_profiles_update ON public.contractor_profiles
  FOR UPDATE TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.user_organizations WHERE user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.user_organizations WHERE user_id = (SELECT auth.uid())
    )
  );
-- Repeat for contractor_engagements and payroll_payment_links as needed

-- 5. Drop duplicate employees org index
DROP INDEX IF EXISTS idx_employees_org;
-- idx_employees_organization_id remains

-- 6. (Optional) Add minimal RLS policies or disable RLS for system-only tables
-- Example: ALTER TABLE public.document_versions DISABLE ROW LEVEL SECURITY;
-- Or add minimal policy if needed

-- End of migration
