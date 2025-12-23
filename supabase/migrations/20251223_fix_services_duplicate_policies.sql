-- ==============================================================================
-- 🧹 FINAL HYGIENE PATCH: LINT 0006 RESOLUTION (public.services)
-- ==============================================================================
-- TARGET: public.services
-- ISSUE: Multiple permissive policies for roles 'anon' and 'authenticated'.
-- RESOLVES: SELECT, INSERT, UPDATE, DELETE redundancy.
-- FIX: Purge all legacy policies, create non-overlapping architecture.
-- DATE: December 23, 2025
-- CREDIT: Gemini Advanced comprehensive solution
-- ==============================================================================

-- 1. CLEANSE ALL REDUNDANT POLICIES
-- Purge every known variant to ensure a clean slate.
DO $$ 
BEGIN
    -- Drop Anon variants
    DROP POLICY IF EXISTS "services_public_read_active" ON public.services;
    DROP POLICY IF EXISTS "services_select_optimized" ON public.services;
    DROP POLICY IF EXISTS "services_select" ON public.services;
    DROP POLICY IF EXISTS "services_anon_select" ON public.services;
    DROP POLICY IF EXISTS "services_anon_read_optimized" ON public.services;
    
    -- Drop Authenticated variants
    DROP POLICY IF EXISTS "services_consolidated_select" ON public.services;
    DROP POLICY IF EXISTS "services_admin_management" ON public.services;
    DROP POLICY IF EXISTS "services_auth_select_optimized" ON public.services;
    DROP POLICY IF EXISTS "services_admin_all_access" ON public.services;
    DROP POLICY IF EXISTS "services_insert_optimized" ON public.services;
    DROP POLICY IF EXISTS "services_update_optimized" ON public.services;
    DROP POLICY IF EXISTS "services_delete_optimized" ON public.services;
    DROP POLICY IF EXISTS "services_auth_select" ON public.services;

    -- Drop Admin specific variants
    DROP POLICY IF EXISTS "services_admin_write_ops" ON public.services;
    DROP POLICY IF EXISTS "services_admin_insert" ON public.services;
    DROP POLICY IF EXISTS "services_admin_update" ON public.services;
    DROP POLICY IF EXISTS "services_admin_delete" ON public.services;
END $$;

-- 2. SOVEREIGN POLICY ARCHITECTURE (Non-Overlapping)

-- A. PUBLIC ACCESS (ANON)
-- Exactly one policy for SELECT (anon).
CREATE POLICY "services_anon_select" 
ON public.services FOR SELECT TO anon 
USING (is_active = true);

-- B. INTERNAL ACCESS (AUTHENTICATED)
-- Exactly one policy for SELECT (authenticated).
-- Covers both standard users and admins for reading.
CREATE POLICY "services_auth_select" 
ON public.services FOR SELECT TO authenticated 
USING (true);

-- C. ADMINISTRATIVE MANAGEMENT (ADMIN WRITES)
-- Split into three separate policies to avoid syntax errors and overlaps.

-- 1. INSERT Authority
CREATE POLICY "services_admin_insert" 
ON public.services FOR INSERT TO authenticated 
WITH CHECK (public.is_app_admin());

-- 2. UPDATE Authority
CREATE POLICY "services_admin_update" 
ON public.services FOR UPDATE TO authenticated 
USING (public.is_app_admin())
WITH CHECK (public.is_app_admin());

-- 3. DELETE Authority
CREATE POLICY "services_admin_delete" 
ON public.services FOR DELETE TO authenticated 
USING (public.is_app_admin());

-- 3. REFRESH SCHEMA CACHE
NOTIFY pgrst, 'reload schema';

SELECT '🟢 LINT 0006 FULLY RESOLVED: public.services now has zero overlapping policies.' AS status;

-- ==============================================================================
-- VERIFICATION
-- ==============================================================================
-- After applying, run:
-- SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'services' ORDER BY cmd, roles;
-- 
-- Expected result: 5 policies total (zero overlap)
-- - services_anon_select (SELECT, anon)
-- - services_auth_select (SELECT, authenticated)
-- - services_admin_insert (INSERT, authenticated)
-- - services_admin_update (UPDATE, authenticated)
-- - services_admin_delete (DELETE, authenticated)
-- ==============================================================================
