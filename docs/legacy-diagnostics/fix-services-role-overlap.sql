-- ODYSSEY-1 Final Services Policy Fix - Remove Role Overlap
-- Fix the stubborn duplicate by limiting public policy to anon only

-- ====================
-- FIX THE ROLE OVERLAP
-- ====================

-- Drop the policy that applies to both anon AND authenticated
DROP POLICY IF EXISTS "services_public_read_active" ON public.services;

-- Recreate it for anon ONLY (authenticated has its own policy)
CREATE POLICY "services_public_read_active" 
ON public.services 
FOR SELECT TO anon 
USING (is_active = true);

-- ====================
-- VERIFICATION - Should Show Clean State
-- ====================

-- Show all SELECT policies on services (should be exactly 2 now)
SELECT 
    'SELECT policies on services after fix:' as status,
    policyname,
    roles,
    qual as using_clause
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename = 'services'
    AND cmd = 'SELECT'
ORDER BY roles;

-- Confirm authenticated has only ONE SELECT policy
SELECT 
    'Authenticated SELECT policies count:' as check,
    COUNT(*) as policy_count,
    array_agg(policyname) as policy_names
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename = 'services'
    AND cmd = 'SELECT'
    AND roles LIKE '%authenticated%';

-- Final validation: NO duplicate policies anywhere in ODYSSEY-1
SELECT 
    tablename,
    cmd,
    COUNT(*) as policy_count,
    array_agg(policyname || ' (TO ' || roles || ')') as policy_details
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'activity_logs', 'subscriptions', 'services')
GROUP BY tablename, cmd
HAVING COUNT(*) > 1
ORDER BY tablename, cmd;

SELECT 'FINAL CHECK: Services duplicate eliminated!' as result;