-- Fix both Advisor issues: view ownership + function search_path
-- Author: Supabase Advisor + GitHub Copilot
-- Date: 2025-12-15

-- ============================================================================
-- PART 1: Fix view ownership to prevent SECURITY DEFINER behavior
-- ============================================================================
-- Views owned by superuser/postgres can bypass RLS, which Advisor flags as SECURITY DEFINER
-- Solution: Change ownership to 'authenticated' role so views run with caller's privileges

-- First, get current function signatures for the ops functions
SELECT
  p.pronamespace::regnamespace::text AS schema,
  p.proname AS name,
  pg_get_function_identity_arguments(p.oid) AS args,
  p.prosecdef AS security_definer
FROM pg_proc p
WHERE p.pronamespace = 'ops'::regnamespace
  AND p.proname IN ('fn_log_change','insert_heartbeat_alert');
