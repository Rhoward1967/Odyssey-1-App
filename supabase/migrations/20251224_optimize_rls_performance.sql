-- ==============================================================================
-- RLS PERFORMANCE OPTIMIZATION: Auth Function Caching
-- ==============================================================================
-- PURPOSE: Optimize audit_trail RLS policy to evaluate auth.jwt() once per query
-- IMPACT: Prevents re-evaluation for each row, improves query performance at scale
-- REFERENCE: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select
-- ==============================================================================

-- Drop existing policy
DROP POLICY IF EXISTS audit_trail_admin_read ON public.audit_trail;

-- Recreate with SELECT wrapper for query-level caching
CREATE POLICY audit_trail_admin_read
  ON public.audit_trail
  FOR SELECT
  USING (
    (SELECT auth.jwt()) ->> 'user_role' = 'admin'
  );

-- Verification comment
SELECT 'RLS performance optimized: auth.jwt() now cached per query, not per row' AS status;
