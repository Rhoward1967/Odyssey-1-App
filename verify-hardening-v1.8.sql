-- ==============================================================================
-- VERIFICATION QUERIES FOR MASTER HARDENING v1.8
-- ==============================================================================
-- Run these in Supabase SQL Editor to confirm security hardening

-- 1. CHECK FUNCTION SECURITY SETTINGS
SELECT 
    proname AS function_name,
    prosecdef AS is_security_definer,
    proconfig AS search_path_config
FROM pg_proc
WHERE proname IN ('capture_performance_snapshot', 'log_deployment', 'trigger_log_deployment')
ORDER BY proname;
-- Expected: All show prosecdef=true and search_path in proconfig

-- 2. CHECK TRIGGER EXISTS
SELECT 
    t.tgname AS trigger_name,
    c.relname AS table_name,
    p.proname AS trigger_function
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE t.tgname = 'deployment_logger';
-- Expected: 1 row showing deployment_logger on system_knowledge → trigger_log_deployment

-- 3. CHECK PERFORMANCE SNAPSHOTS STILL COLLECTING
SELECT 
    COUNT(*) AS total_snapshots,
    MAX(timestamp) AS latest_snapshot,
    EXTRACT(EPOCH FROM (NOW() - MAX(timestamp)))/60 AS minutes_since_last
FROM performance_snapshots;
-- Expected: Growing count, latest within 5 minutes

-- 4. CHECK INDEXES CREATED
SELECT 
    schemaname,
    tablename,
    indexname
FROM pg_indexes
WHERE indexname IN (
    'idx_system_metrics_telemetry',
    'idx_user_sessions_active', 
    'idx_invoices_revenue_stats'
)
ORDER BY tablename;
-- Expected: 3 rows

-- 5. CHECK commit_sha COLUMN ADDED
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'deployments'
  AND column_name IN ('version', 'commit_sha', 'environment', 'initiated_by', 'metadata')
ORDER BY column_name;
-- Expected: 5 rows including commit_sha

-- ==============================================================================
-- FINAL STATUS: Run Database → Linter in Supabase UI
-- Expected: 0 security warnings
-- ==============================================================================
