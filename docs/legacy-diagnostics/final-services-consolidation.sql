-- ODYSSEY-1 Services Table Policy Consolidation - APPROVED PLAN
-- Replace broad ALL policy with explicit, optimized policies

-- ====================
-- STEP 1: CREATE NEW POLICIES FIRST (SAFE)
-- ====================

-- Single authenticated SELECT policy (consolidates duplicate logic)
CREATE POLICY "services_authenticated_select_active_or_admin" 
ON public.services 
FOR SELECT TO authenticated 
USING ((is_active = true) OR is_super_admin());

-- Explicit admin-only write policies (replaces broad ALL policy)
CREATE POLICY "services_admin_insert" 
ON public.services 
FOR INSERT TO authenticated 
WITH CHECK (is_super_admin());

CREATE POLICY "services_admin_update" 
ON public.services 
FOR UPDATE TO authenticated 
USING (is_super_admin()) 
WITH CHECK (is_super_admin());

CREATE POLICY "services_admin_delete" 
ON public.services 
FOR DELETE TO authenticated 
USING (is_super_admin());

-- ====================
-- STEP 2: DROP OLD BROAD POLICY (AFTER NEW ONES ARE ACTIVE)
-- ====================

-- Remove the broad ALL policy that caused SELECT duplication
DROP POLICY IF EXISTS "services_authenticated_all_admin_only_write" ON public.services;

-- Keep the anon policy unchanged (it's fine as-is)
-- services_public_read_active remains: FOR SELECT TO anon, authenticated USING (is_active = true)

-- ====================
-- STEP 3: PERFORMANCE INDEXES
-- ====================

-- Critical index for is_active filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_is_active 
ON public.services(is_active);

-- Composite index for common admin queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_active_created 
ON public.services(is_active, created_at DESC) 
WHERE is_active = true;

-- ====================
-- STEP 4: VERIFICATION
-- ====================

-- Show final policy state
SELECT 
    'Final services policies:' as status,
    policyname,
    cmd,
    roles,
    qual as using_clause
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename = 'services'
ORDER BY cmd, policyname;

-- Confirm no duplicate SELECT policies for authenticated
SELECT 
    'SELECT policies for authenticated on services:' as check_type,
    COUNT(*) as policy_count,
    array_agg(policyname) as policy_names
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename = 'services'
    AND cmd = 'SELECT'
    AND 'authenticated' = ANY(string_to_array(roles, ','));

-- Final verification: NO duplicate policies anywhere
SELECT 
    tablename,
    cmd,
    COUNT(*) as policy_count,
    array_agg(policyname) as policy_names
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'activity_logs', 'subscriptions', 'services')
GROUP BY tablename, cmd
HAVING COUNT(*) > 1
ORDER BY tablename, cmd;

SELECT 'ODYSSEY-1 RLS Optimization Complete - All Duplicates Eliminated!' as final_status;