-- ============================================================================
-- DISCOVERY: Check which scheduling tables exist
-- ============================================================================

DO $$
DECLARE
  table_name TEXT;
  table_exists BOOLEAN;
  tables_found INTEGER := 0;
  tables_missing INTEGER := 0;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SCHEDULING TABLES STATUS CHECK';
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
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SUMMARY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables Found: %', tables_found;
  RAISE NOTICE 'Tables Missing: %', tables_missing;
  RAISE NOTICE '';
  
  IF tables_missing > 0 THEN
    RAISE NOTICE '⚠️  ACTION REQUIRED:';
    RAISE NOTICE 'Run migration: 20250118000002_create_scheduling_system.sql';
    RAISE NOTICE 'Then run: 20250118000003_apply_rls_and_indexes.sql';
  ELSE
    RAISE NOTICE '✅ All scheduling tables exist!';
    RAISE NOTICE 'Ready to apply RLS and indexes.';
  END IF;
  
  RAISE NOTICE '========================================';
END $$;
