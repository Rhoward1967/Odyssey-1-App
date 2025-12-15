-- Introspection: Find what Advisor is flagging as SECURITY DEFINER
-- Author: Supabase Advisor + GitHub Copilot
-- Date: 2025-12-15

-- ============================================================================
-- 1) Check if these are views or materialized views
-- ============================================================================
SELECT 
  schemaname,
  tablename AS viewname,
  'materialized view' AS object_type
FROM pg_matviews
WHERE schemaname = 'public' 
  AND tablename IN ('ops_roman_events', 'view_user_bids', 'health_summary')

UNION ALL

SELECT 
  schemaname,
  viewname,
  'view' AS object_type
FROM pg_views
WHERE schemaname = 'public' 
  AND viewname IN ('ops_roman_events', 'view_user_bids', 'health_summary');


-- ============================================================================
-- 2) Get actual view definitions
-- ============================================================================
SELECT 
  viewname,
  pg_get_viewdef(('public.' || viewname)::regclass, true) AS definition
FROM pg_views
WHERE schemaname = 'public' 
  AND viewname IN ('ops_roman_events', 'view_user_bids', 'health_summary');


-- ============================================================================
-- 3) Find SECURITY DEFINER functions referenced by these views
-- ============================================================================
-- This query finds all functions used in view dependencies
SELECT DISTINCT
  v.viewname,
  p.proname AS function_name,
  n.nspname AS function_schema,
  CASE WHEN prosecdef THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END AS security_type,
  pg_get_functiondef(p.oid) AS function_definition
FROM pg_views v
JOIN pg_depend d ON d.refobjid = (SELECT oid FROM pg_class WHERE relname = v.viewname AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public'))
JOIN pg_proc p ON d.objid = p.oid
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE v.schemaname = 'public'
  AND v.viewname IN ('ops_roman_events', 'view_user_bids', 'health_summary')
  AND p.prosecdef = true  -- Only show SECURITY DEFINER functions
ORDER BY v.viewname, p.proname;


-- ============================================================================
-- 4) Check for any rules on these views (rare, but possible)
-- ============================================================================
SELECT 
  schemaname,
  tablename,
  rulename,
  definition
FROM pg_rules
WHERE schemaname = 'public'
  AND tablename IN ('ops_roman_events', 'view_user_bids', 'health_summary');
