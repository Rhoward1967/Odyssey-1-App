-- ODYSSEY-1 Safe RLS Policy Optimization - Phase B  
-- DROP duplicate policies AFTER new ones are created (safe)

-- ====================
-- PROFILES TABLE - Remove Duplicates
-- ====================

-- Remove the broad "true" policy (least secure)
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;

-- Remove duplicate self-only policies (keep optimized version)
DROP POLICY IF EXISTS "Users can view their own profile." ON profiles;
DROP POLICY IF EXISTS "Enable insert for own profile" ON profiles;  
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON profiles;

-- Keep the admin-enabled policy but rename for consistency
DROP POLICY IF EXISTS "Enable update for self or admins" ON profiles;

-- ====================
-- ACTIVITY_LOGS TABLE - Remove Duplicates  
-- ====================

-- Remove the broad "true" policy (least secure)
DROP POLICY IF EXISTS "Allow authenticated users to read activity logs" ON activity_logs;

-- Remove duplicate admin policy (keep optimized version)
DROP POLICY IF EXISTS "Enable read for own logs or admins" ON activity_logs;

-- ====================
-- SUBSCRIPTIONS TABLE - Keep Current
-- ====================

-- Note: You mentioned subscriptions already have good granular policies
-- and no "Enable full access for owners or admins" exists
-- So we'll keep the existing ones alongside optimized ones for now

-- Optional: If you want to clean up subscriptions too, uncomment these:
-- DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
-- DROP POLICY IF EXISTS "Users can insert own subscriptions" ON subscriptions;  
-- DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;

-- ====================
-- VERIFICATION
-- ====================

-- Check remaining policies (should only show optimized ones + any we kept)
SELECT 'Phase B Complete - Duplicate policies removed' as status;

SELECT 
    tablename,
    cmd,
    COUNT(*) as policy_count,
    array_agg(policyname) as remaining_policies
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'activity_logs', 'subscriptions')
GROUP BY tablename, cmd
ORDER BY tablename, cmd;

-- Final performance check - should show no duplicates
SELECT 
    tablename,
    cmd,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'activity_logs', 'subscriptions')
GROUP BY tablename, cmd
HAVING COUNT(*) > 1;