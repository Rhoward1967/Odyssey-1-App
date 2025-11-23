-- =============================================================================
-- FINAL POLICY CLEANUP - Remove Legacy Duplicate Policies
-- =============================================================================
-- Purpose: Fix remaining 4 "multiple_permissive_policies" advisor warnings
-- Date: 2024-11-22
-- Tables affected: user_sessions, work_locations
-- =============================================================================

-- user_sessions: Remove legacy policies, keep consolidated ones from Phase 2
DO $$
BEGIN
  -- DROP legacy INSERT policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_sessions' AND policyname='Enable insert for own session') THEN
    DROP POLICY "Enable insert for own session" ON public.user_sessions;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_sessions' AND policyname='System insert sessions') THEN
    DROP POLICY "System insert sessions" ON public.user_sessions;
  END IF;

  -- DROP legacy SELECT policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_sessions' AND policyname='Admins view all sessions') THEN
    DROP POLICY "Admins view all sessions" ON public.user_sessions;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_sessions' AND policyname='Enable read for self or admins') THEN
    DROP POLICY "Enable read for self or admins" ON public.user_sessions;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_sessions' AND policyname='Users view own sessions') THEN
    DROP POLICY "Users view own sessions" ON public.user_sessions;
  END IF;

  -- DROP legacy UPDATE policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_sessions' AND policyname='Enable update for self or admins') THEN
    DROP POLICY "Enable update for self or admins" ON public.user_sessions;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_sessions' AND policyname='System update sessions') THEN
    DROP POLICY "System update sessions" ON public.user_sessions;
  END IF;

  RAISE NOTICE 'user_sessions: Dropped 7 legacy policies. Consolidated policies remain.';
END$$;

-- work_locations: Remove legacy policies, keep consolidated one
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='work_locations' AND policyname='wl_all_admins') THEN
    DROP POLICY "wl_all_admins" ON public.work_locations;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='work_locations' AND policyname='wl_select_members') THEN
    DROP POLICY "wl_select_members" ON public.work_locations;
  END IF;

  RAISE NOTICE 'work_locations: Dropped 2 legacy policies. Consolidated policy remains.';
END$$;

-- =============================================================================
-- VERIFICATION: List remaining policies on affected tables
-- =============================================================================
-- Run these queries after migration to verify cleanup:
-- 
-- SELECT policyname, cmd FROM pg_policies 
-- WHERE schemaname='public' AND tablename='user_sessions' 
-- ORDER BY cmd, policyname;
-- 
-- Expected result (3 policies):
-- - sessions_insert_consolidated (INSERT)
-- - sessions_select_consolidated (SELECT)
-- - sessions_update_consolidated (UPDATE)
--
-- SELECT policyname, cmd FROM pg_policies 
-- WHERE schemaname='public' AND tablename='work_locations' 
-- ORDER BY cmd, policyname;
-- 
-- Expected result (1 policy):
-- - work_locations_select_consolidated (SELECT)
-- =============================================================================
-- Expected Outcome: 0 multiple_permissive_policies warnings on these tables
-- =============================================================================
