-- ============================================================================
-- PRE-DEPLOYMENT VALIDATION
-- Run this first to check current state before deployment
-- ============================================================================

DO $$
DECLARE
  table_name TEXT;
  table_exists BOOLEAN;
  tables_found INTEGER := 0;
  tables_missing INTEGER := 0;
  column_type TEXT;
  org_column_type TEXT;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'PRE-DEPLOYMENT VALIDATION';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  
  -- Check if employees table exists
  SELECT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'employees'
  ) INTO table_exists;
  
  IF NOT table_exists THEN
    RAISE EXCEPTION 'CRITICAL: employees table does not exist. Required for FK constraints.';
  END IF;
  
  -- Check if organizations table exists
  SELECT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'organizations'
  ) INTO table_exists;
  
  IF NOT table_exists THEN
    RAISE EXCEPTION 'CRITICAL: organizations table does not exist. Required for FK constraints.';
  END IF;
  
  -- Check if user_organizations table exists
  SELECT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'user_organizations'
  ) INTO table_exists;
  
  IF NOT table_exists THEN
    RAISE EXCEPTION 'CRITICAL: user_organizations table does not exist. Required for RLS policies.';
  END IF;
  
  RAISE NOTICE '✅ Required base tables exist (employees, organizations, user_organizations)';
  RAISE NOTICE '';
  
  -- Check organization_id column type in employees table
  SELECT data_type INTO column_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'employees'
    AND column_name = 'organization_id';
  
  RAISE NOTICE 'employees.organization_id type: %', column_type;
  
  -- Check organization_id column type in user_organizations table
  SELECT data_type INTO column_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'user_organizations'
    AND column_name = 'organization_id';
  
  RAISE NOTICE 'user_organizations.organization_id type: %', column_type;
  RAISE NOTICE '';
  
  IF column_type != 'uuid' THEN
    RAISE WARNING 'WARNING: organization_id is not UUID type. This may require type casting in RLS policies.';
  END IF;
  
  -- Check scheduling tables
  RAISE NOTICE 'SCHEDULING TABLES STATUS:';
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
    SELECT EXISTS (
      SELECT FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename = table_name
    ) INTO table_exists;
    
    IF table_exists THEN
      RAISE NOTICE '✅ % EXISTS', table_name;
      tables_found := tables_found + 1;
      
      -- Check if RLS is already enabled
      SELECT relrowsecurity INTO table_exists
      FROM pg_class
      WHERE relname = table_name AND relnamespace = 'public'::regnamespace;
      
      IF table_exists THEN
        RAISE NOTICE '   ⚠️  RLS already enabled on %', table_name;
      END IF;
    ELSE
      RAISE NOTICE '❌ % MISSING', table_name;
      tables_missing := tables_missing + 1;
    END IF;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SUMMARY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables Found: %/9', tables_found;
  RAISE NOTICE 'Tables Missing: %/9', tables_missing;
  RAISE NOTICE '';
  
  IF tables_missing = 9 THEN
    RAISE NOTICE '✅ READY FOR STEP 1: Create all base tables';
    RAISE NOTICE '   Run: 20250118000002_create_scheduling_system.sql';
  ELSIF tables_missing > 0 THEN
    RAISE WARNING '⚠️  PARTIAL STATE: % tables exist, % missing', tables_found, tables_missing;
    RAISE NOTICE '   You may need to drop existing tables or handle conflicts';
  ELSE
    RAISE NOTICE '✅ All tables exist!';
    RAISE NOTICE '   READY FOR STEP 2: Apply RLS and indexes';
    RAISE NOTICE '   Run: 20250118000003_apply_rls_and_indexes.sql';
  END IF;
  
  RAISE NOTICE '========================================';
END $$;
