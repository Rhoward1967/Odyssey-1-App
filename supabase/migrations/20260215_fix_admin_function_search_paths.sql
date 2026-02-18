-- ═══════════════════════════════════════════════════════════════════
-- FIX SECURITY WARNING: Mutable search_path in Admin Functions
-- Date: February 15, 2026
-- Purpose: Set immutable search_path on 3 admin functions
-- ═══════════════════════════════════════════════════════════════════
--
-- SECURITY ISSUE:
-- Functions with SECURITY DEFINER and mutable search_path can be
-- exploited via SQL injection attacks. Setting search_path immutably
-- prevents malicious users from manipulating function behavior.
--
-- FUNCTIONS TO FIX:
-- 1. emergency_restore_rickey_access
-- 2. auto_add_archana_to_app_admins
-- 3. protect_permanent_app_admins
--
-- ═══════════════════════════════════════════════════════════════════

-- First, check if these functions exist and get their signatures
DO $$
DECLARE
    func_record RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════════════';
    RAISE NOTICE '🔍 CHECKING FOR ADMIN FUNCTIONS WITH MUTABLE SEARCH_PATH';
    RAISE NOTICE '═══════════════════════════════════════════════════════════════════';
    RAISE NOTICE '';

    -- List all three functions if they exist
    FOR func_record IN
        SELECT
            n.nspname AS schema,
            p.proname AS function_name,
            pg_get_function_identity_arguments(p.oid) AS args,
            COALESCE(pg_catalog.array_to_string(p.proconfig, ', '), 'NONE') AS current_settings,
            p.prosecdef AS is_security_definer
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public'
          AND p.proname IN (
              'emergency_restore_rickey_access',
              'auto_add_archana_to_app_admins',
              'protect_permanent_app_admins'
          )
        ORDER BY p.proname
    LOOP
        RAISE NOTICE '   Found: %.%(%)', func_record.schema, func_record.function_name, func_record.args;
        RAISE NOTICE '   Security Definer: %', func_record.is_security_definer;
        RAISE NOTICE '   Current Settings: %', func_record.current_settings;
        RAISE NOTICE '';
    END LOOP;

END $$;

-- ═══════════════════════════════════════════════════════════════════
-- FIX 1: emergency_restore_rickey_access
-- ═══════════════════════════════════════════════════════════════════

DO $$
BEGIN
    -- Check if function exists before altering
    IF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public'
        AND p.proname = 'emergency_restore_rickey_access'
    ) THEN
        -- Set immutable search_path
        ALTER FUNCTION public.emergency_restore_rickey_access()
            SET search_path = public;

        RAISE NOTICE '✅ Fixed: emergency_restore_rickey_access()';
    ELSE
        RAISE NOTICE '⚠️  Function emergency_restore_rickey_access() not found';
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════
-- FIX 2: auto_add_archana_to_app_admins
-- ═══════════════════════════════════════════════════════════════════

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public'
        AND p.proname = 'auto_add_archana_to_app_admins'
    ) THEN
        ALTER FUNCTION public.auto_add_archana_to_app_admins()
            SET search_path = public;

        RAISE NOTICE '✅ Fixed: auto_add_archana_to_app_admins()';
    ELSE
        RAISE NOTICE '⚠️  Function auto_add_archana_to_app_admins() not found';
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════
-- FIX 3: protect_permanent_app_admins
-- ═══════════════════════════════════════════════════════════════════

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public'
        AND p.proname = 'protect_permanent_app_admins'
    ) THEN
        ALTER FUNCTION public.protect_permanent_app_admins()
            SET search_path = public;

        RAISE NOTICE '✅ Fixed: protect_permanent_app_admins()';
    ELSE
        RAISE NOTICE '⚠️  Function protect_permanent_app_admins() not found';
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════
-- VERIFICATION
-- ═══════════════════════════════════════════════════════════════════

DO $$
DECLARE
    func_record RECORD;
    fixed_count INTEGER := 0;
    missing_count INTEGER := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ ADMIN FUNCTION SEARCH_PATH FIX COMPLETE';
    RAISE NOTICE '═══════════════════════════════════════════════════════════════════';
    RAISE NOTICE '';

    -- Verify all three functions now have immutable search_path
    FOR func_record IN
        SELECT
            p.proname AS function_name,
            pg_get_function_identity_arguments(p.oid) AS args,
            pg_catalog.array_to_string(p.proconfig, ', ') AS settings
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public'
          AND p.proname IN (
              'emergency_restore_rickey_access',
              'auto_add_archana_to_app_admins',
              'protect_permanent_app_admins'
          )
        ORDER BY p.proname
    LOOP
        IF func_record.settings LIKE '%search_path%' THEN
            RAISE NOTICE '✅ %(%): %', func_record.function_name, func_record.args, func_record.settings;
            fixed_count := fixed_count + 1;
        ELSE
            RAISE NOTICE '⚠️  %(%): No search_path set', func_record.function_name, func_record.args;
        END IF;
    END LOOP;

    -- Check for missing functions
    IF fixed_count < 3 THEN
        missing_count := 3 - fixed_count;
        RAISE NOTICE '';
        RAISE NOTICE '⚠️  % function(s) not found in database', missing_count;
        RAISE NOTICE '   These may have been deleted or never existed.';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '🔒 Security Status:';
    RAISE NOTICE '   Functions fixed: %', fixed_count;
    RAISE NOTICE '   Functions missing: %', missing_count;
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════════════';
    RAISE NOTICE '';
END $$;

-- ═══════════════════════════════════════════════════════════════════
-- SECURITY NOTES
-- ═══════════════════════════════════════════════════════════════════
--
-- WHY THIS MATTERS:
-- Functions with SECURITY DEFINER run with the privileges of the
-- function owner, not the caller. If search_path is mutable, an
-- attacker can manipulate which schema is searched for objects,
-- potentially executing malicious code.
--
-- THE FIX:
-- Setting search_path = public (or search_path = '') makes it
-- immutable, preventing exploitation.
--
-- BEST PRACTICE:
-- ALL SECURITY DEFINER functions should have:
-- SET search_path = public
-- or
-- SET search_path = ''
--
-- ═══════════════════════════════════════════════════════════════════
