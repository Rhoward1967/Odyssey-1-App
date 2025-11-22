-- ============================================================================
-- POST-DEPLOYMENT VALIDATION
-- Run after Step 2 (RLS + Indexes) to verify everything is correct
-- ============================================================================

DO $$
DECLARE
  table_name TEXT;
  rls_enabled BOOLEAN;
  policy_count INTEGER;
  index_count INTEGER;
  total_policies INTEGER := 0;
  total_indexes INTEGER := 0;
  func_exists BOOLEAN;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'POST-DEPLOYMENT VALIDATION';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  
  -- Check helper functions
  RAISE NOTICE 'HELPER FUNCTIONS:';
  RAISE NOTICE '----------------------------------------';
  
  SELECT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'is_org_member' 
    AND pronamespace = 'public'::regnamespace
  ) INTO func_exists;
  
  IF func_exists THEN
    RAISE NOTICE '✅ is_org_member() exists';
  ELSE
    RAISE WARNING '❌ is_org_member() MISSING';
  END IF;
  
  SELECT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'is_org_admin' 
    AND pronamespace = 'public'::regnamespace
  ) INTO func_exists;
  
  IF func_exists THEN
    RAISE NOTICE '✅ is_org_admin() exists';
  ELSE
    RAISE WARNING '❌ is_org_admin() MISSING';
  END IF;
  
  SELECT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'get_days_in_month' 
    AND pronamespace = 'public'::regnamespace
  ) INTO func_exists;
  
  IF func_exists THEN
    RAISE NOTICE '✅ get_days_in_month() exists';
  ELSE
    RAISE WARNING '❌ get_days_in_month() MISSING';
  END IF;
  
  SELECT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'generate_schedules_from_template' 
    AND pronamespace = 'public'::regnamespace
  ) INTO func_exists;
  
  IF func_exists THEN
    RAISE NOTICE '✅ generate_schedules_from_template() exists';
  ELSE
    RAISE WARNING '❌ generate_schedules_from_template() MISSING';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE 'RLS STATUS & POLICY COUNT:';
  RAISE NOTICE '----------------------------------------';
  
  FOR table_name IN 
    SELECT unnest(ARRAY[
      'shift_templates',
      'work_locations',
      'employee_schedules',
      'teams',
      'team_members',
      'schedule_modifications',
      'training_assignments',
      'schedule_templates',
      'schedule_template_details'
    ])
  LOOP
    -- Check if RLS is enabled
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class
    WHERE relname = table_name AND relnamespace = 'public'::regnamespace;
    
    -- Count policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = table_name;
    
    total_policies := total_policies + policy_count;
    
    IF rls_enabled THEN
      RAISE NOTICE '✅ % | RLS: ON | Policies: %', 
        table_name, 
        policy_count;
    ELSE
      RAISE WARNING '❌ % | RLS: OFF | Policies: %', 
        table_name, 
        policy_count;
    END IF;
    
    IF policy_count < 4 THEN
      RAISE WARNING '   ⚠️  Expected at least 4 policies (SELECT/INSERT/UPDATE/DELETE), found %', policy_count;
    END IF;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE 'PERFORMANCE INDEXES:';
  RAISE NOTICE '----------------------------------------';
  
  FOR table_name IN 
    SELECT unnest(ARRAY[
      'shift_templates',
      'work_locations',
      'employee_schedules',
      'teams',
      'team_members',
      'schedule_modifications',
      'training_assignments',
      'schedule_templates',
      'schedule_template_details'
    ])
  LOOP
    -- Count indexes (excluding primary key)
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = table_name
      AND indexname NOT LIKE '%_pkey';
    
    total_indexes := total_indexes + index_count;
    
    RAISE NOTICE '% | Indexes: %', table_name, index_count;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SUMMARY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total Helper Functions: 4/4 (is_org_member, is_org_admin, get_days_in_month, generate_schedules_from_template)';
  RAISE NOTICE 'Total RLS Policies: % (expected: 36+)', total_policies;
  RAISE NOTICE 'Total Performance Indexes: % (expected: 25+)', total_indexes;
  RAISE NOTICE '';
  
  -- Critical indexes check
  RAISE NOTICE 'CRITICAL INDEXES CHECK:';
  RAISE NOTICE '----------------------------------------';
  
  SELECT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'employee_schedules' 
    AND indexname LIKE '%org%date%'
  ) INTO func_exists;
  
  IF func_exists THEN
    RAISE NOTICE '✅ employee_schedules(org, date) indexed';
  ELSE
    RAISE WARNING '❌ MISSING: employee_schedules(organization_id, schedule_date)';
  END IF;
  
  SELECT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'employee_schedules' 
    AND indexname LIKE '%employee%date%'
  ) INTO func_exists;
  
  IF func_exists THEN
    RAISE NOTICE '✅ employee_schedules(employee, date) indexed';
  ELSE
    RAISE WARNING '❌ MISSING: employee_schedules(employee_id, schedule_date)';
  END IF;
  
  RAISE NOTICE '';
  
  IF total_policies >= 36 AND total_indexes >= 20 THEN
    RAISE NOTICE '✅ DEPLOYMENT SUCCESSFUL!';
    RAISE NOTICE '';
    RAISE NOTICE 'NEXT STEPS:';
    RAISE NOTICE '1. Run RLS tests from: 20250118000004_test_rls_validation.sql';
    RAISE NOTICE '2. Test anonymous access (should fail)';
    RAISE NOTICE '3. Test non-member access (empty results)';
    RAISE NOTICE '4. Test member access (can read org data)';
    RAISE NOTICE '5. Test admin access (can write)';
  ELSE
    RAISE WARNING '⚠️  DEPLOYMENT INCOMPLETE';
    RAISE NOTICE 'Expected: 36+ policies, 25+ indexes';
    RAISE NOTICE 'Found: % policies, % indexes', total_policies, total_indexes;
  END IF;
  
  RAISE NOTICE '========================================';
END $$;
