-- ODYSSEY-1 Final Policy Cleanup - Remove Remaining Duplicate
-- Fix the subscriptions table policy collision

-- ====================
-- IDENTIFY THE COLLISION
-- ====================

-- First, let's see exactly what we have
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename = 'subscriptions' 
    AND cmd = 'UPDATE'
ORDER BY policyname;

-- ====================
-- REMOVE THE OLD POLICY
-- ====================

-- Remove the broad "Enable full access for owners or admins" policy
-- (Keep our clean "optimized_subscriptions_update" policy)
DROP POLICY IF EXISTS "Enable full access for owners or admins" ON subscriptions;

-- ====================
-- VERIFICATION
-- ====================

-- Confirm only one UPDATE policy remains
SELECT 
    'Subscriptions UPDATE policies after cleanup:' as status,
    COUNT(*) as policy_count,
    array_agg(policyname) as remaining_policies
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename = 'subscriptions' 
    AND cmd = 'UPDATE';

-- Final check: No more duplicate policy warnings
SELECT 
    tablename,
    cmd,
    COUNT(*) as policy_count,
    array_agg(policyname) as policy_names
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'activity_logs', 'subscriptions', 'services')
GROUP BY tablename, cmd
HAVING COUNT(*) > 1  -- Should return NO rows
ORDER BY tablename, cmd;

SELECT 'Policy cleanup complete - no duplicates remaining!' as final_status;