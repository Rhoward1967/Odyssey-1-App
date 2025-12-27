-- Fix Payroll Reconciliation Permissions
-- Date: 2025-12-26
-- Issue: v_payroll_outgoing_links_by_run view permission denied

-- Grant SELECT on the payroll reconciliation view to authenticated users
GRANT SELECT ON public.v_payroll_outgoing_links_by_run TO authenticated;
GRANT SELECT ON public.v_payroll_outgoing_links_by_run TO anon;

-- Grant SELECT on the underlying tables used by the view
GRANT SELECT ON public.payroll_runs TO authenticated;
GRANT SELECT ON public.payroll_payment_links TO authenticated;
GRANT SELECT ON ops.outgoing_payments TO authenticated;

-- Ensure RLS is enabled but create a permissive policy for admins
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_payment_links ENABLE ROW LEVEL SECURITY;

-- Allow users to see payroll data for their organization
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'payroll_runs' 
    AND policyname = 'Users can view payroll runs for their org'
  ) THEN
    CREATE POLICY "Users can view payroll runs for their org"
      ON public.payroll_runs
      FOR SELECT
      TO authenticated
      USING (
        organization_id IN (
          SELECT organization_id 
          FROM public.profiles 
          WHERE id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'payroll_payment_links' 
    AND policyname = 'Users can view payment links for their org'
  ) THEN
    CREATE POLICY "Users can view payment links for their org"
      ON public.payroll_payment_links
      FOR SELECT
      TO authenticated
      USING (
        organization_id IN (
          SELECT organization_id 
          FROM public.profiles 
          WHERE id = auth.uid()
        )
      );
  END IF;
END $$;
