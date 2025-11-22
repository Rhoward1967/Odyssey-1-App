-- ============================================================================
-- SCHEMA INTROSPECTION - Check ID column types
-- Run this to see what types your existing tables use
-- ============================================================================

DO $$
DECLARE
  table_info RECORD;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'EXISTING TABLE ID TYPES';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  
  -- Check organizations.id
  SELECT 
    table_name,
    column_name,
    data_type,
    udt_name
  INTO table_info
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'organizations'
    AND column_name = 'id';
  
  IF FOUND THEN
    RAISE NOTICE 'organizations.id: % (%)', table_info.data_type, table_info.udt_name;
  ELSE
    RAISE NOTICE 'organizations.id: NOT FOUND';
  END IF;
  
  -- Check employees.id
  SELECT 
    table_name,
    column_name,
    data_type,
    udt_name
  INTO table_info
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'employees'
    AND column_name = 'id';
  
  IF FOUND THEN
    RAISE NOTICE 'employees.id: % (%)', table_info.data_type, table_info.udt_name;
  ELSE
    RAISE NOTICE 'employees.id: NOT FOUND';
  END IF;
  
  -- Check employees.organization_id
  SELECT 
    table_name,
    column_name,
    data_type,
    udt_name
  INTO table_info
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'employees'
    AND column_name = 'organization_id';
  
  IF FOUND THEN
    RAISE NOTICE 'employees.organization_id: % (%)', table_info.data_type, table_info.udt_name;
  ELSE
    RAISE NOTICE 'employees.organization_id: NOT FOUND';
  END IF;
  
  -- Check employees.user_id
  SELECT 
    table_name,
    column_name,
    data_type,
    udt_name
  INTO table_info
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'employees'
    AND column_name = 'user_id';
  
  IF FOUND THEN
    RAISE NOTICE 'employees.user_id: % (%)', table_info.data_type, table_info.udt_name;
  ELSE
    RAISE NOTICE 'employees.user_id: NOT FOUND';
  END IF;
  
  -- Check user_organizations.organization_id
  SELECT 
    table_name,
    column_name,
    data_type,
    udt_name
  INTO table_info
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'user_organizations'
    AND column_name = 'organization_id';
  
  IF FOUND THEN
    RAISE NOTICE 'user_organizations.organization_id: % (%)', table_info.data_type, table_info.udt_name;
  ELSE
    RAISE NOTICE 'user_organizations.organization_id: NOT FOUND';
  END IF;
  
  -- Check user_organizations.user_id
  SELECT 
    table_name,
    column_name,
    data_type,
    udt_name
  INTO table_info
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'user_organizations'
    AND column_name = 'user_id';
  
  IF FOUND THEN
    RAISE NOTICE 'user_organizations.user_id: % (%)', table_info.data_type, table_info.udt_name;
  ELSE
    RAISE NOTICE 'user_organizations.user_id: NOT FOUND';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RECOMMENDATION';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Option A: Use BIGINT for all organization_id columns';
  RAISE NOTICE '  - Keep existing schema intact';
  RAISE NOTICE '  - Rewrite scheduling tables to use BIGINT';
  RAISE NOTICE '  - Fastest deployment';
  RAISE NOTICE '';
  RAISE NOTICE 'Option B: Migrate to UUID everywhere';
  RAISE NOTICE '  - Consistent ID types';
  RAISE NOTICE '  - Requires migration of existing tables';
  RAISE NOTICE '  - More future-proof';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END $$;
