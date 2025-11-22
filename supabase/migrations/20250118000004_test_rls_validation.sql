-- ============================================================================
-- RLS VALIDATION TEST SUITE
-- Run these queries to test security policies
-- ============================================================================

-- ============================================================================
-- TEST 1: Anonymous Access (Should FAIL)
-- ============================================================================
-- Run these queries WITHOUT authentication in Supabase SQL Editor
-- Expected: Permission denied or empty results

-- Uncommment to test as anonymous:
-- SET ROLE anon;
-- SELECT * FROM public.employee_schedules LIMIT 1;
-- SELECT * FROM public.shift_templates LIMIT 1;
-- SELECT * FROM public.work_locations LIMIT 1;
-- RESET ROLE;

-- Expected Results: 
-- - Error: "permission denied for table employee_schedules"
-- - OR: Empty results with no error (RLS silently filters)


-- ============================================================================
-- TEST 2: Authenticated Non-Member Access (Should Return Empty)
-- ============================================================================
-- Run these queries as a user NOT in any organization
-- Expected: 200 OK with empty array []

-- Create test user (if doesn't exist)
-- You'll need to do this in Supabase Auth Dashboard first
-- Test User: test_nonmember@example.com

-- As non-member user, run:
-- SELECT * FROM public.employee_schedules;
-- SELECT * FROM public.shift_templates;
-- SELECT * FROM public.work_locations;

-- Expected Results:
-- All queries return: []
-- No cross-org data leakage


-- ============================================================================
-- TEST 3: Organization Member Read Access (Should SUCCEED)
-- ============================================================================
-- Run as an authenticated user in an organization (e.g., rhoward@hjsservices.us)

-- First, get your organization ID
SELECT 
  uo.organization_id,
  o.name as org_name,
  uo.role
FROM public.user_organizations uo
JOIN public.organizations o ON o.id = uo.organization_id
WHERE uo.user_id = auth.uid();

-- Store the organization_id from above, then test:

-- Test 1: Can read shift templates in my org
SELECT 
  id,
  name,
  shift_type,
  organization_id
FROM public.shift_templates
WHERE organization_id = '<YOUR_ORG_ID>'
ORDER BY name;

-- Test 2: Can read work locations in my org
SELECT 
  id,
  name,
  location_code,
  organization_id
FROM public.work_locations
WHERE organization_id = '<YOUR_ORG_ID>'
ORDER BY name;

-- Test 3: Can read schedules in my org
SELECT 
  id,
  schedule_date,
  employee_id,
  organization_id
FROM public.employee_schedules
WHERE organization_id = '<YOUR_ORG_ID>'
ORDER BY schedule_date DESC
LIMIT 10;

-- Expected Results:
-- All queries return data from YOUR organization only
-- No data from other organizations visible


-- ============================================================================
-- TEST 4: Cross-Organization Access Prevention (Should Return Empty)
-- ============================================================================
-- As an org member, try to access ANOTHER organization's data

-- Get a different org ID (not yours)
SELECT id, name 
FROM public.organizations 
WHERE id NOT IN (
  SELECT organization_id 
  FROM public.user_organizations 
  WHERE user_id = auth.uid()
)
LIMIT 1;

-- Try to read that org's data (should fail/return empty)
-- Replace <OTHER_ORG_ID> with ID from above query

-- Should return empty:
SELECT * FROM public.shift_templates 
WHERE organization_id = '<OTHER_ORG_ID>';

SELECT * FROM public.employee_schedules 
WHERE organization_id = '<OTHER_ORG_ID>';

-- Expected Results:
-- All queries return: []
-- RLS prevents cross-org data access


-- ============================================================================
-- TEST 5: Write Access - Regular Member (Should FAIL)
-- ============================================================================
-- As a regular member (non-admin), try to create/update/delete
-- Expected: RLS policy violation

-- Try to insert a shift template (should fail if not admin)
INSERT INTO public.shift_templates (
  organization_id,
  name,
  shift_type,
  start_time,
  end_time
) VALUES (
  '<YOUR_ORG_ID>',
  'Test Shift',
  'regular',
  '09:00:00',
  '17:00:00'
);

-- Expected Results:
-- Error: "new row violates row-level security policy"
-- Only admins can insert


-- ============================================================================
-- TEST 6: Write Access - Admin (Should SUCCEED)
-- ============================================================================
-- As an admin/manager user in the org, try to create/update/delete
-- Expected: Success

-- Check if you're an admin
SELECT 
  uo.role,
  uo.organization_id
FROM public.user_organizations uo
WHERE uo.user_id = auth.uid();

-- If role = 'admin' or 'manager' or 'owner', this should work:
INSERT INTO public.shift_templates (
  organization_id,
  name,
  shift_type,
  start_time,
  end_time,
  regular_hours,
  is_active
) VALUES (
  '<YOUR_ORG_ID>',
  'Admin Test Shift',
  'regular',
  '08:00:00',
  '16:00:00',
  8.0,
  true
) RETURNING id, name;

-- Clean up test data
DELETE FROM public.shift_templates 
WHERE name = 'Admin Test Shift' 
  AND organization_id = '<YOUR_ORG_ID>';

-- Expected Results:
-- INSERT succeeds and returns the new row
-- DELETE succeeds


-- ============================================================================
-- TEST 7: Helper Function Validation
-- ============================================================================

-- Test is_org_member function
SELECT 
  uo.organization_id,
  o.name,
  public.is_org_member(uo.organization_id) as is_member
FROM public.user_organizations uo
JOIN public.organizations o ON o.id = uo.organization_id
WHERE uo.user_id = auth.uid();

-- Should return TRUE for your orgs

-- Test with a random org you're NOT in
SELECT public.is_org_member('<OTHER_ORG_ID>') as should_be_false;

-- Should return FALSE


-- Test is_org_admin function
SELECT 
  uo.organization_id,
  o.name,
  uo.role,
  public.is_org_admin(uo.organization_id) as is_admin
FROM public.user_organizations uo
JOIN public.organizations o ON o.id = uo.organization_id
WHERE uo.user_id = auth.uid();

-- Should return TRUE if role is owner/admin/manager, FALSE otherwise


-- ============================================================================
-- TEST 8: Performance Index Validation
-- ============================================================================

-- Check if indexes exist
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'employee_schedules',
    'shift_templates',
    'work_locations',
    'teams',
    'team_members'
  )
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Expected: Should see 20+ indexes


-- Test query performance with EXPLAIN ANALYZE
-- This shows if indexes are being used

-- Query 1: Calendar month view (should use idx_schedules_org_date)
EXPLAIN ANALYZE
SELECT 
  es.*,
  e.first_name,
  e.last_name
FROM public.employee_schedules es
JOIN public.employees e ON e.id = es.employee_id
WHERE es.organization_id = '<YOUR_ORG_ID>'
  AND es.schedule_date >= '2025-01-01'
  AND es.schedule_date <= '2025-01-31'
ORDER BY es.schedule_date, e.last_name;

-- Look for: "Index Scan using idx_schedules_org_date"
-- Execution time should be < 50ms


-- Query 2: Employee schedule lookup (should use idx_schedules_employee_date)
EXPLAIN ANALYZE
SELECT *
FROM public.employee_schedules
WHERE employee_id = '<SOME_EMPLOYEE_ID>'
  AND schedule_date >= '2025-01-01'
  AND schedule_date <= '2025-01-31'
ORDER BY schedule_date;

-- Look for: "Index Scan using idx_schedules_employee_date"


-- ============================================================================
-- TEST 9: Bulk Schedule Creation Performance
-- ============================================================================

-- Create test schedules (as admin)
-- This tests the performance of bulk inserts

-- Get employee IDs in your org
SELECT 
  e.id,
  e.first_name,
  e.last_name
FROM public.employees e
WHERE e.organization_id = '<YOUR_ORG_ID>'
  AND e.is_active = true
LIMIT 5;

-- Time bulk insert
-- Replace employee_id values with IDs from above
DO $$
DECLARE
  start_time TIMESTAMP;
  end_time TIMESTAMP;
  duration INTERVAL;
  rows_inserted INTEGER;
BEGIN
  start_time := clock_timestamp();
  
  INSERT INTO public.employee_schedules (
    organization_id,
    employee_id,
    schedule_date,
    schedule_type,
    status
  )
  SELECT 
    '<YOUR_ORG_ID>'::uuid,
    emp_id,
    date_val,
    'regular',
    'scheduled'
  FROM unnest(ARRAY[
    '<EMPLOYEE_ID_1>'::uuid,
    '<EMPLOYEE_ID_2>'::uuid,
    '<EMPLOYEE_ID_3>'::uuid
  ]) AS emp_id
  CROSS JOIN generate_series(
    '2025-02-01'::date,
    '2025-02-28'::date,
    '1 day'::interval
  ) AS date_val
  WHERE EXTRACT(DOW FROM date_val) BETWEEN 1 AND 5; -- Mon-Fri only
  
  GET DIAGNOSTICS rows_inserted = ROW_COUNT;
  
  end_time := clock_timestamp();
  duration := end_time - start_time;
  
  RAISE NOTICE 'Inserted % schedules in %', rows_inserted, duration;
  
  -- Clean up test data
  DELETE FROM public.employee_schedules
  WHERE schedule_date BETWEEN '2025-02-01' AND '2025-02-28'
    AND organization_id = '<YOUR_ORG_ID>';
    
  RAISE NOTICE 'Test data cleaned up';
END $$;

-- Expected: < 2 seconds for ~60 schedules


-- ============================================================================
-- TEST 10: Security Summary
-- ============================================================================

-- View all policies on scheduling tables
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual IS NOT NULL as has_using,
  with_check IS NOT NULL as has_with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'shift_templates',
    'work_locations',
    'employee_schedules',
    'teams',
    'team_members',
    'schedule_modifications',
    'training_assignments',
    'schedule_templates',
    'schedule_template_details'
  )
ORDER BY tablename, cmd, policyname;

-- Count policies per table
SELECT 
  tablename,
  COUNT(*) as policy_count,
  array_agg(DISTINCT cmd ORDER BY cmd) as operations
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'shift_templates',
    'work_locations',
    'employee_schedules',
    'teams',
    'team_members',
    'schedule_modifications',
    'training_assignments',
    'schedule_templates',
    'schedule_template_details'
  )
GROUP BY tablename
ORDER BY tablename;

-- Expected: 4+ policies per table (SELECT, INSERT, UPDATE, DELETE)


-- ============================================================================
-- VALIDATION CHECKLIST
-- ============================================================================

/*
✅ CHECKLIST: Mark as complete after testing

□ TEST 1: Anonymous access blocked/returns empty
□ TEST 2: Non-member returns empty arrays (no data leakage)
□ TEST 3: Member can read own org data
□ TEST 4: Member cannot read other org data
□ TEST 5: Regular member cannot write (blocked by RLS)
□ TEST 6: Admin can write (INSERT/UPDATE/DELETE work)
□ TEST 7: Helper functions return correct boolean values
□ TEST 8: Indexes exist and are being used (EXPLAIN shows Index Scan)
□ TEST 9: Bulk insert performance < 5 seconds for 100+ records
□ TEST 10: All tables have 4+ RLS policies

SECURITY STATUS:
□ All 9 tables have RLS enabled
□ All tables use is_org_member() helper
□ Admins have is_org_admin() check for writes
□ No direct auth.uid() comparisons (centralized via helpers)

PERFORMANCE STATUS:
□ Organization ID indexed on all tables
□ Date ranges indexed for schedules
□ Employee lookups indexed
□ EXPLAIN ANALYZE shows index usage
□ Calendar queries < 100ms
□ Bulk inserts < 5 seconds

PRODUCTION READINESS:
□ All tests pass
□ No data leakage between orgs
□ Performance acceptable
□ Error handling works
□ Helper functions secured with SECURITY DEFINER

*/
