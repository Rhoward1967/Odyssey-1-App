-- ============================================================================
-- FIX SERVICES TABLE DUPLICATE POLICIES
-- ============================================================================
-- Purpose: Remove services_admin_all_access policy causing duplicate warnings
-- Issue: services_admin_all_access conflicts with optimized policies
-- Warnings: 4 remaining (all on services table)
-- Date: December 23, 2025
-- ============================================================================

-- Remove the catch-all admin policy that's causing duplicates
DROP POLICY IF EXISTS "services_admin_all_access" ON services;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After applying, run:
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'services' AND roles::text LIKE '%authenticated%' ORDER BY cmd;
-- 
-- Expected result: 4 policies only
-- - services_auth_select_optimized (SELECT)
-- - services_delete_optimized (DELETE)
-- - services_insert_optimized (INSERT)
-- - services_update_optimized (UPDATE)
-- ============================================================================
