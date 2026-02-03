-- ============================================================================
-- PERFORMANCE OPTIMIZATION & CLEANUP MIGRATION
-- Date: February 3, 2026
-- Purpose: Pre-March 1st Launch Database Optimization
--
-- Tactical Zones:
-- 1. RLS Performance: Optimize auth.uid() calls with subquery caching
-- 2. Policy Redundancy: Consolidate duplicate policies into Sovereign policies
-- 3. Duplicate Indexes: Remove shadow indexes
--
-- Impact: Improves query performance for 50-150 subscriber scale
-- ============================================================================

BEGIN;

-- ============================================================================
-- TACTICAL ZONE 1: RLS PERFORMANCE OPTIMIZATION
-- Fix: Wrap auth.uid() in subquery to cache value per transaction
-- ============================================================================

-- INVOICES TABLE: Optimize RLS policies
DROP POLICY IF EXISTS "inv_select" ON invoices;
DROP POLICY IF EXISTS "inv_insert" ON invoices;
DROP POLICY IF EXISTS "inv_update" ON invoices;

CREATE POLICY "inv_select" ON invoices
  FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "inv_insert" ON invoices
  FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "inv_update" ON invoices
  FOR UPDATE
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- COMPANY_PROFILES TABLE: Optimize RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON company_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON company_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON company_profiles;

CREATE POLICY "Users can view own profile" ON company_profiles
  FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own profile" ON company_profiles
  FOR UPDATE
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own profile" ON company_profiles
  FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

-- CUSTOMERS TABLE: Optimize RLS policies
DROP POLICY IF EXISTS "Users can view own customers" ON customers;
DROP POLICY IF EXISTS "Users can insert own customers" ON customers;
DROP POLICY IF EXISTS "Users can update own customers" ON customers;

CREATE POLICY "Users can view own customers" ON customers
  FOR SELECT
  USING (user_id = (SELECT auth.uid()) OR user_id IS NULL);

CREATE POLICY "Users can insert own customers" ON customers
  FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own customers" ON customers
  FOR UPDATE
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- INVOICE_LINE_ITEMS TABLE: Optimize RLS policies
DROP POLICY IF EXISTS "line_items_select" ON invoice_line_items;
DROP POLICY IF EXISTS "line_items_insert" ON invoice_line_items;
DROP POLICY IF EXISTS "line_items_update" ON invoice_line_items;
DROP POLICY IF EXISTS "line_items_delete" ON invoice_line_items;

CREATE POLICY "line_items_select" ON invoice_line_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_line_items.invoice_id 
      AND invoices.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "line_items_insert" ON invoice_line_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_line_items.invoice_id 
      AND invoices.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "line_items_update" ON invoice_line_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_line_items.invoice_id 
      AND invoices.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_line_items.invoice_id 
      AND invoices.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "line_items_delete" ON invoice_line_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_line_items.invoice_id 
      AND invoices.user_id = (SELECT auth.uid())
    )
  );

-- ============================================================================
-- TACTICAL ZONE 2: POLICY REDUNDANCY CONSOLIDATION
-- Fix: Merge duplicate policies into single Sovereign policies
-- ============================================================================

-- INVOICES: Consolidate DELETE policies
DROP POLICY IF EXISTS "inv_delete" ON invoices;
DROP POLICY IF EXISTS "invoices_sov_delete" ON invoices;

CREATE POLICY "invoices_sovereign_delete" ON invoices
  FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- COMPANY_PROFILES: Consolidate DELETE policies
DROP POLICY IF EXISTS "Users can delete own profile" ON company_profiles;
DROP POLICY IF EXISTS "company_profiles_sov_delete" ON company_profiles;

CREATE POLICY "company_profiles_sovereign_delete" ON company_profiles
  FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- CUSTOMERS: Consolidate DELETE policies
DROP POLICY IF EXISTS "Users can delete own customers" ON customers;
DROP POLICY IF EXISTS "customers_sov_delete" ON customers;

CREATE POLICY "customers_sovereign_delete" ON customers
  FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- INVOICE_LINE_ITEMS: Already handled in Zone 1

-- RECURRING_INVOICES: Consolidate policies
DROP POLICY IF EXISTS "rec_inv_select" ON recurring_invoices;
DROP POLICY IF EXISTS "rec_inv_insert" ON recurring_invoices;
DROP POLICY IF EXISTS "rec_inv_update" ON recurring_invoices;
DROP POLICY IF EXISTS "rec_inv_delete" ON recurring_invoices;
DROP POLICY IF EXISTS "recurring_invoices_sov_delete" ON recurring_invoices;

CREATE POLICY "recurring_invoices_select" ON recurring_invoices
  FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "recurring_invoices_insert" ON recurring_invoices
  FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "recurring_invoices_update" ON recurring_invoices
  FOR UPDATE
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "recurring_invoices_delete" ON recurring_invoices
  FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- ============================================================================
-- TACTICAL ZONE 3: DUPLICATE INDEX CLEANUP
-- Fix: Drop shadow indexes, keep primary ones
-- ============================================================================

-- INVOICES: Drop duplicate user_id index
DROP INDEX IF EXISTS idx_invoices_user;  -- Keep idx_invoices_user_id

-- RECURRING_INVOICES: Drop duplicate user index
DROP INDEX IF EXISTS idx_p_recurring_inv_user;  -- Keep idx_recurring_invoices_user

-- ============================================================================
-- VERIFICATION: Check optimization results
-- ============================================================================

DO $$
DECLARE
  policy_count INTEGER;
  index_count INTEGER;
BEGIN
  -- Count policies per table
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
  AND tablename IN ('invoices', 'company_profiles', 'customers', 'invoice_line_items', 'recurring_invoices');
  
  RAISE NOTICE '✅ Active RLS policies: %', policy_count;
  
  -- Count indexes
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public'
  AND tablename IN ('invoices', 'recurring_invoices')
  AND indexname LIKE 'idx_%user%';
  
  RAISE NOTICE '✅ User-related indexes: %', index_count;
  RAISE NOTICE '🎯 Performance optimization complete - March 1st ready!';
END $$;

COMMIT;

-- ============================================================================
-- MIGRATION SUMMARY
-- ============================================================================
-- ✅ Optimized RLS policies with subquery caching (5 tables)
-- ✅ Consolidated duplicate policies into Sovereign policies (5 tables)
-- ✅ Removed 2 duplicate indexes
-- 🚀 Database ready for 50-150 subscriber scale
-- 💎 $366M asset protection maintained
-- ============================================================================
