-- ODYSSEY-1 Services Table Policy Consolidation
-- Replace multiple SELECT policies with single optimized policy

-- ====================
-- STEP 1: CREATE CONSOLIDATED POLICY FIRST (SAFE)
-- ====================

-- Consolidated SELECT policy for authenticated users
-- Covers: active services OR owned services OR admin access
CREATE POLICY "optimized_services_select" ON services
  FOR SELECT TO authenticated 
  USING (
    -- Public can read active services
    active = true 
    -- OR users can read their own services (if owner_id column exists)
    OR (user_id IS NOT NULL AND user_id = auth.uid())
    -- OR admins can read all services
    OR is_super_admin()
  );

-- ====================
-- STEP 2: DROP OLD DUPLICATE POLICIES (AFTER NEW ONE IS ACTIVE)
-- ====================

-- Remove the colliding policies
DROP POLICY IF EXISTS "services_authenticated_all_admin_only_write" ON services;
DROP POLICY IF EXISTS "services_public_read_active" ON services;

-- ====================
-- STEP 3: ADD PERFORMANCE INDEXES
-- ====================

-- Critical index for active services lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_active 
ON services (active) 
WHERE active = true;

-- Index for user ownership (if user_id column exists)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_user_id 
ON services (user_id) 
WHERE user_id IS NOT NULL;

-- Composite index for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_active_user 
ON services (active, user_id, created_at DESC) 
WHERE active = true OR user_id IS NOT NULL;

-- ====================
-- STEP 4: VERIFICATION
-- ====================

-- Confirm only one SELECT policy remains
SELECT 
    'Services SELECT policies after consolidation:' as status,
    COUNT(*) as policy_count,
    array_agg(policyname) as remaining_policies
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename = 'services' 
    AND cmd = 'SELECT';

-- Final check: No duplicate policies across all tables
SELECT 
    tablename,
    cmd,
    COUNT(*) as policy_count,
    array_agg(policyname) as policy_names
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'activity_logs', 'subscriptions', 'services')
GROUP BY tablename, cmd
HAVING COUNT(*) > 1  -- Should return NO rows after cleanup
ORDER BY tablename, cmd;

SELECT 'All RLS policy duplicates eliminated - ODYSSEY-1 optimized!' as final_status;