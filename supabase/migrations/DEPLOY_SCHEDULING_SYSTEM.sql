-- ============================================================================
-- SCHEDULING SYSTEM DEPLOYMENT SCRIPT
-- Run this entire file in Supabase SQL Editor (all at once)
-- ============================================================================

-- ============================================================================
-- STEP 1: DISCOVERY - Check which tables exist
-- ============================================================================

DO $$
DECLARE
  table_name TEXT;
  table_exists BOOLEAN;
  tables_found INTEGER := 0;
  tables_missing INTEGER := 0;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'STEP 1: SCHEDULING TABLES STATUS CHECK';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  
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
      RAISE NOTICE '✅ % - EXISTS', table_name;
      tables_found := tables_found + 1;
    ELSE
      RAISE NOTICE '❌ % - MISSING', table_name;
      tables_missing := tables_missing + 1;
    END IF;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE 'Summary: % found, % missing', tables_found, tables_missing;
  RAISE NOTICE '';
END $$;


-- ============================================================================
-- STEP 2: CREATE BASE TABLES (if they don't exist)
-- Run the full contents of 20250118000002_create_scheduling_system.sql
-- ============================================================================

-- NOTE: Since this file is 654 lines, you need to either:
-- 1. Copy/paste 20250118000002_create_scheduling_system.sql into SQL Editor first
-- 2. Or use Supabase CLI: supabase db push
-- 3. Or run it via the Migration UI in Supabase Dashboard

-- For now, I'll create a simplified version checker:

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'shift_templates') THEN
    RAISE EXCEPTION 'Base tables not created yet. Please run: 20250118000002_create_scheduling_system.sql first';
  END IF;
  
  RAISE NOTICE '✅ STEP 2: Base tables exist, proceeding...';
END $$;


-- ============================================================================
-- STEP 3: APPLY RLS + INDEXES
-- Run the full contents of 20250118000003_apply_rls_and_indexes.sql
-- ============================================================================

-- NOTE: This is a 400+ line file. For deployment, you need to:
-- 1. Run 20250118000003_apply_rls_and_indexes.sql in SQL Editor
-- OR
-- 2. Continue with the manual approach below (simplified version)

RAISE NOTICE '========================================';
RAISE NOTICE 'DEPLOYMENT INSTRUCTIONS';
RAISE NOTICE '========================================';
RAISE NOTICE '';
RAISE NOTICE 'To complete the scheduling system setup:';
RAISE NOTICE '';
RAISE NOTICE '1. Go to Supabase Dashboard > SQL Editor';
RAISE NOTICE '2. Create a new query';
RAISE NOTICE '3. Copy/paste each migration file in order:';
RAISE NOTICE '   a) 20250118000002_create_scheduling_system.sql';
RAISE NOTICE '   b) 20250118000003_apply_rls_and_indexes.sql';
RAISE NOTICE '4. Run each one and verify success messages';
RAISE NOTICE '5. Then run: 20250118000004_test_rls_validation.sql';
RAISE NOTICE '';
RAISE NOTICE 'OR use Supabase CLI:';
RAISE NOTICE '   supabase db reset (resets and runs all migrations)';
RAISE NOTICE '';
RAISE NOTICE '========================================';
