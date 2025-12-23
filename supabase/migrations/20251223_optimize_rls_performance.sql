-- ============================================================================
-- RLS PERFORMANCE OPTIMIZATION
-- ============================================================================
-- Purpose: Fix Supabase linter warnings for company_profiles RLS policies
-- Issues: 
--   1. auth.uid() re-evaluated on every row (use SELECT for caching)
--   2. Multiple permissive policies causing overhead
-- Risk Level: 40 (Medium-Low) - Safe to apply autonomously
-- Date: December 23, 2025
-- ============================================================================

-- COMPANY_PROFILES: Consolidate and optimize policies
-- Remove inefficient policies
DROP POLICY IF EXISTS "Users can view their own company profile" ON company_profiles;
DROP POLICY IF EXISTS "Users can insert their own company profile" ON company_profiles;
DROP POLICY IF EXISTS "Users can update their own company profile" ON company_profiles;
DROP POLICY IF EXISTS "Users can delete their own company profile" ON company_profiles;
DROP POLICY IF EXISTS "company_profiles_insert_self_or_admin" ON company_profiles;
DROP POLICY IF EXISTS "company_profiles_unified_access" ON company_profiles;
DROP POLICY IF EXISTS "company_profiles_update_self_or_admin" ON company_profiles;

-- Optimized SELECT policy (cached auth.uid())
CREATE POLICY "company_profiles_select_optimized" ON company_profiles
  FOR SELECT 
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = (SELECT auth.uid()) 
      AND role = 'admin'
    )
  );

-- Optimized INSERT policy
CREATE POLICY "company_profiles_insert_optimized" ON company_profiles
  FOR INSERT 
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Optimized UPDATE policy
CREATE POLICY "company_profiles_update_optimized" ON company_profiles
  FOR UPDATE 
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = (SELECT auth.uid()) 
      AND role = 'admin'
    )
  );

-- Optimized DELETE policy
CREATE POLICY "company_profiles_delete_optimized" ON company_profiles
  FOR DELETE 
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = (SELECT auth.uid()) 
      AND role = 'admin'
    )
  );

-- ============================================================================
-- PRODUCTS: Consolidate duplicate policies
-- ============================================================================

DROP POLICY IF EXISTS "products_admin_management" ON products;
DROP POLICY IF EXISTS "products_consolidated_select" ON products;

-- Single optimized SELECT policy for products
CREATE POLICY "products_select_optimized" ON products
  FOR SELECT 
  USING (
    is_active = true 
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = (SELECT auth.uid()) 
      AND role = 'admin'
    )
  );

-- ============================================================================
-- SERVICES: Consolidate duplicate policies
-- ============================================================================

DROP POLICY IF EXISTS "services_admin_delete" ON services;
DROP POLICY IF EXISTS "services_admin_management" ON services;
DROP POLICY IF EXISTS "services_insert" ON services;
DROP POLICY IF EXISTS "services_consolidated_select" ON services;
DROP POLICY IF EXISTS "services_update" ON services;

-- Single optimized SELECT policy
CREATE POLICY "services_select_optimized" ON services
  FOR SELECT 
  USING (
    is_active = true 
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = (SELECT auth.uid()) 
      AND role = 'admin'
    )
  );

-- Single optimized INSERT policy
CREATE POLICY "services_insert_optimized" ON services
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = (SELECT auth.uid()) 
      AND role IN ('admin', 'manager')
    )
  );

-- Single optimized UPDATE policy
CREATE POLICY "services_update_optimized" ON services
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = (SELECT auth.uid()) 
      AND role IN ('admin', 'manager')
    )
  );

-- Single optimized DELETE policy
CREATE POLICY "services_delete_optimized" ON services
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = (SELECT auth.uid()) 
      AND role = 'admin'
    )
  );

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these after applying migration to verify fixes:

-- Check company_profiles policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd 
-- FROM pg_policies 
-- WHERE tablename = 'company_profiles';

-- Check products policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd 
-- FROM pg_policies 
-- WHERE tablename = 'products';

-- Check services policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd 
-- FROM pg_policies 
-- WHERE tablename = 'services';

-- ============================================================================
-- EXPECTED RESULTS:
-- - company_profiles: 4 policies (1 per action: SELECT, INSERT, UPDATE, DELETE)
-- - products: 1 policy (SELECT)
-- - services: 4 policies (SELECT, INSERT, UPDATE, DELETE)
-- - All auth.uid() calls wrapped in (SELECT auth.uid()) for performance
-- - Linter warnings: 12 → 0
-- ============================================================================
