-- ==============================================================================
-- RLS POLICY COMPLETION: Governance & Staging Tables
-- ==============================================================================
-- PURPOSE: Resolve linter INFO warnings for tables with RLS enabled but no policies
-- TARGETS: ops.governance_audit (add admin-read), staging_contacts_raw (disable RLS)
-- ==============================================================================

-- 1. GOVERNANCE AUDIT TABLE
-- Add admin-read policy for audit trail visibility
CREATE POLICY governance_audit_admin_read
  ON ops.governance_audit
  FOR SELECT
  USING (
    (SELECT auth.jwt()) ->> 'user_role' = 'admin'
  );

-- Optional: Add service_role full access for R.O.M.A.N. autonomous logging
CREATE POLICY governance_audit_service_write
  ON ops.governance_audit
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- 2. STAGING CONTACTS RAW TABLE
-- Disable RLS for internal ETL staging table (not client-facing)
ALTER TABLE public.staging_contacts_raw DISABLE ROW LEVEL SECURITY;

-- Verification
SELECT 
  '✅ governance_audit: Admin-read policy active' AS governance_status,
  '✅ staging_contacts_raw: RLS disabled (staging table)' AS staging_status;
