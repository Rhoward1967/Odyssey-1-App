-- ================================================================================
-- ODYSSEY-1 COMPLETE BACKEND DIAGNOSTIC QUERY
-- Run this to get EVERYTHING we need to know about the Supabase backend
-- ================================================================================

-- ============================================================================
-- SECTION 1: ALL TABLES AND THEIR ROW COUNTS
-- ============================================================================
SELECT 
    'TABLE_INVENTORY' as section,
    schemaname,
    tablename,
    (SELECT COUNT(*) FROM pg_class WHERE relname = tablename) as table_exists,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================================================
-- SECTION 2: ROW LEVEL SECURITY (RLS) STATUS FOR ALL TABLES
-- ============================================================================
SELECT 
    'RLS_STATUS' as section,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================================================
-- SECTION 3: ALL RLS POLICIES (WHAT THEY DO AND WHO CAN ACCESS)
-- ============================================================================
SELECT 
    'RLS_POLICIES' as section,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command_type,
    qual as using_expression,
    with_check as check_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- SECTION 4: ALL COLUMNS FOR EACH TABLE (COMPLETE SCHEMA)
-- ============================================================================
SELECT 
    'COLUMN_DETAILS' as section,
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- ============================================================================
-- SECTION 5: ALL FOREIGN KEY RELATIONSHIPS
-- ============================================================================
SELECT 
    'FOREIGN_KEYS' as section,
    tc.table_name as from_table,
    kcu.column_name as from_column,
    ccu.table_name as to_table,
    ccu.column_name as to_column,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- ============================================================================
-- SECTION 6: ALL INDEXES (PERFORMANCE OPTIMIZATION)
-- ============================================================================
SELECT 
    'INDEXES' as section,
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================================================
-- SECTION 7: ALL FUNCTIONS (INCLUDING RLS HELPER FUNCTIONS)
-- ============================================================================
SELECT 
    'FUNCTIONS' as section,
    n.nspname as schema,
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_functiondef(p.oid) as definition
FROM pg_proc p
LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY p.proname;

-- ============================================================================
-- SECTION 8: ALL VIEWS (INCLUDING SECURITY DEFINER VIEWS)
-- ============================================================================
SELECT 
    'VIEWS' as section,
    table_name as view_name,
    view_definition
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================================================================
-- SECTION 9: TRIGGERS (AUTO-UPDATE, AUDIT, ETC.)
-- ============================================================================
SELECT 
    'TRIGGERS' as section,
    trigger_schema,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ============================================================================
-- SECTION 10: MISSING TABLES DIAGNOSTIC (WHY IS 'BIDS' MISSING?)
-- ============================================================================
SELECT 
    'MISSING_TABLE_CHECK' as section,
    'bids' as table_name,
    EXISTS(SELECT 1 FROM pg_tables WHERE tablename = 'bids' AND schemaname = 'public') as table_exists,
    EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'bids' AND schemaname = 'public') as has_policies;

-- Check user_organizations table specifically (error mentions it)
SELECT 
    'USER_ORGANIZATIONS_CHECK' as section,
    'user_organizations' as table_name,
    EXISTS(SELECT 1 FROM pg_tables WHERE tablename = 'user_organizations' AND schemaname = 'public') as table_exists,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'user_organizations' AND table_schema = 'public') as column_count,
    EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'user_organizations' AND schemaname = 'public') as has_policies;

-- ============================================================================
-- SECTION 11: CURRENT DATABASE ROLES AND PERMISSIONS
-- ============================================================================
SELECT 
    'DATABASE_ROLES' as section,
    rolname as role_name,
    rolsuper as is_superuser,
    rolinherit as can_inherit,
    rolcreaterole as can_create_roles,
    rolcreatedb as can_create_db,
    rolcanlogin as can_login
FROM pg_roles
ORDER BY rolname;

-- ============================================================================
-- SECTION 12: TABLE GRANTS (WHO CAN ACCESS WHAT)
-- ============================================================================
SELECT 
    'TABLE_PERMISSIONS' as section,
    grantee,
    table_schema,
    table_name,
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
ORDER BY table_name, grantee, privilege_type;

-- ============================================================================
-- SECTION 13: SEQUENCE INFO (FOR AUTO-INCREMENT IDS)
-- ============================================================================
SELECT 
    'SEQUENCES' as section,
    sequence_schema,
    sequence_name,
    data_type,
    numeric_precision,
    start_value,
    minimum_value,
    maximum_value,
    increment
FROM information_schema.sequences
WHERE sequence_schema = 'public'
ORDER BY sequence_name;

-- ============================================================================
-- SECTION 14: EXTENSIONS INSTALLED (LIKE UUID, PGCRYPTO, ETC.)
-- ============================================================================
SELECT 
    'EXTENSIONS' as section,
    extname as extension_name,
    extversion as version
FROM pg_extension
ORDER BY extname;

-- ============================================================================
-- SECTION 15: ACTUAL DATA SAMPLES (RECENT RECORDS)
-- ============================================================================

-- System Configuration
SELECT 'SAMPLE_DATA_system_config' as section, * FROM system_config ORDER BY updated_at DESC LIMIT 5;

-- System Knowledge (R.O.M.A.N.'s brain)
SELECT 'SAMPLE_DATA_system_knowledge' as section, category, knowledge_key, learned_from, updated_at 
FROM system_knowledge ORDER BY updated_at DESC LIMIT 10;

-- System Logs (Recent activity)
SELECT 'SAMPLE_DATA_system_logs' as section, source, message, level, created_at 
FROM system_logs ORDER BY created_at DESC LIMIT 10;

-- Governance Changes (Audit trail)
SELECT 'SAMPLE_DATA_governance_changes' as section, actor, action, reason, occurred_at 
FROM governance_changes ORDER BY occurred_at DESC LIMIT 10;

-- Roman Commands (R.O.M.A.N.'s actions)
SELECT 'SAMPLE_DATA_roman_commands' as section, action, target, status, created_at, completed_at 
FROM roman_commands ORDER BY created_at DESC LIMIT 10;

-- Employees (Workforce data)
SELECT 'SAMPLE_DATA_employees' as section, COUNT(*) as total_count FROM employees;

-- Time Entries (Payroll tracking)
SELECT 'SAMPLE_DATA_time_entries' as section, COUNT(*) as total_count FROM time_entries;

-- Organizations
SELECT 'SAMPLE_DATA_organizations' as section, id, name, created_at FROM organizations ORDER BY created_at DESC LIMIT 5;

-- User Organizations (Multi-tenant mapping)
SELECT 'SAMPLE_DATA_user_organizations' as section, COUNT(*) as total_count FROM user_organizations;

-- ============================================================================
-- SECTION 16: API KEYS CONFIGURATION CHECK (FROM SECRETS)
-- ============================================================================

-- Check if secrets/vault table exists for API keys
SELECT 
    'API_KEYS_STORAGE' as section,
    EXISTS(SELECT 1 FROM pg_tables WHERE tablename = 'secrets' OR tablename = 'vault' AND schemaname = 'public') as secrets_table_exists;

-- Check environment configuration in system_config
SELECT 
    'API_KEYS_IN_CONFIG' as section,
    key,
    CASE 
        WHEN key LIKE '%KEY%' OR key LIKE '%SECRET%' OR key LIKE '%TOKEN%' 
        THEN 'REDACTED' 
        ELSE value::text 
    END as value_status
FROM system_config
WHERE key ILIKE '%api%' OR key ILIKE '%key%' OR key ILIKE '%token%'
ORDER BY key;

-- ============================================================================
-- SECTION 17: EDGE FUNCTIONS CONFIGURATION
-- ============================================================================

-- This would need to be checked via Supabase CLI or Dashboard
-- Adding a placeholder to remind us
SELECT 
    'EDGE_FUNCTIONS_NOTE' as section,
    'Check via: supabase functions list' as command,
    'Or via Supabase Dashboard > Edge Functions' as alternative;

-- ============================================================================
-- SECTION 18: STORAGE BUCKETS (IF ANY)
-- ============================================================================
SELECT 
    'STORAGE_BUCKETS' as section,
    id,
    name,
    public,
    created_at
FROM storage.buckets
ORDER BY created_at DESC;

-- ============================================================================
-- SECTION 19: AUTH USERS COUNT AND STATUS
-- ============================================================================
SELECT 
    'AUTH_USERS_SUMMARY' as section,
    COUNT(*) as total_users,
    COUNT(CASE WHEN confirmed_at IS NOT NULL THEN 1 END) as confirmed_users,
    COUNT(CASE WHEN last_sign_in_at > NOW() - INTERVAL '30 days' THEN 1 END) as active_last_30_days
FROM auth.users;

-- ============================================================================
-- SECTION 20: SPECIFIC ISSUE DIAGNOSTICS
-- ============================================================================

-- Why is bids table failing?
DO $$
BEGIN
    IF EXISTS(SELECT 1 FROM pg_tables WHERE tablename = 'bids' AND schemaname = 'public') THEN
        RAISE NOTICE 'BIDS TABLE EXISTS - Checking permissions...';
        -- Check what policies exist
        PERFORM * FROM pg_policies WHERE tablename = 'bids';
    ELSE
        RAISE NOTICE 'BIDS TABLE DOES NOT EXIST - Need to create it';
    END IF;
END $$;

-- Check for SECURITY DEFINER functions (security risk)
SELECT 
    'SECURITY_DEFINER_FUNCTIONS' as section,
    n.nspname as schema,
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    prosecdef as is_security_definer,
    proowner::regrole as owner
FROM pg_proc p
LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE prosecdef = true  -- SECURITY DEFINER
  AND n.nspname = 'public'
ORDER BY p.proname;

-- ============================================================================
-- SECTION 21: CRITICAL ERRORS AND WARNINGS
-- ============================================================================

-- Check for tables without RLS when they should have it
SELECT 
    'TABLES_WITHOUT_RLS' as section,
    tablename,
    'WARNING: Public table without RLS' as issue
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = false
  AND tablename NOT IN ('migrations', 'schema_migrations')
ORDER BY tablename;

-- Check for policies that might be too permissive
SELECT 
    'PERMISSIVE_POLICIES_CHECK' as section,
    tablename,
    policyname,
    CASE 
        WHEN qual IS NULL THEN 'WARNING: No USING clause (allows all)'
        WHEN qual = 'true' THEN 'WARNING: Always true policy'
        ELSE 'OK'
    END as policy_status
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================================================
-- END OF DIAGNOSTIC QUERY
-- ================================================================================

SELECT 
    '================================================================================',
    'DIAGNOSTIC COMPLETE - Review all sections above',
    'Total sections: 21',
    'Generated at: ' || NOW()::text,
    '================================================================================';
