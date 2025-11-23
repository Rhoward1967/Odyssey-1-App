-- =============================================================================
-- FINAL POLICY CONSOLIDATION - Correct Version
-- =============================================================================
-- Purpose: Remove ALL legacy policies and create consolidated ones
-- Issue: Phase 2 migration missed some policy names, creating duplicates
-- Date: 2024-11-22
-- =============================================================================

-- ============================================================================
-- USER_SESSIONS: Drop all legacy policies, create 3 consolidated
-- ============================================================================
DO $$
BEGIN
  -- Drop ALL existing policies on user_sessions (legacy names)
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_sessions' AND policyname='Enable insert for own session') THEN
    DROP POLICY "Enable insert for own session" ON public.user_sessions;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_sessions' AND policyname='System insert sessions') THEN
    DROP POLICY "System insert sessions" ON public.user_sessions;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_sessions' AND policyname='Admins view all sessions') THEN
    DROP POLICY "Admins view all sessions" ON public.user_sessions;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_sessions' AND policyname='Enable read for self or admins') THEN
    DROP POLICY "Enable read for self or admins" ON public.user_sessions;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_sessions' AND policyname='Users view own sessions') THEN
    DROP POLICY "Users view own sessions" ON public.user_sessions;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_sessions' AND policyname='Enable update for self or admins') THEN
    DROP POLICY "Enable update for self or admins" ON public.user_sessions;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_sessions' AND policyname='System update sessions') THEN
    DROP POLICY "System update sessions" ON public.user_sessions;
  END IF;

  -- Drop any previously created consolidated policies (in case Phase 2 partially ran)
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_sessions' AND policyname='sessions_select_consolidated') THEN
    DROP POLICY "sessions_select_consolidated" ON public.user_sessions;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_sessions' AND policyname='sessions_insert_consolidated') THEN
    DROP POLICY "sessions_insert_consolidated" ON public.user_sessions;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_sessions' AND policyname='sessions_update_consolidated') THEN
    DROP POLICY "sessions_update_consolidated" ON public.user_sessions;
  END IF;

  RAISE NOTICE 'user_sessions: Dropped all legacy policies';

  -- Create consolidated policies (single policy per action)
  CREATE POLICY "sessions_select_consolidated"
    ON public.user_sessions
    FOR SELECT
    TO authenticated
    USING (
      (user_id = (SELECT auth.uid())) OR 
      (SELECT public.is_admin()) OR 
      (SELECT public.is_super_admin())
    );

  CREATE POLICY "sessions_insert_consolidated"
    ON public.user_sessions
    FOR INSERT
    TO authenticated
    WITH CHECK (
      (user_id = (SELECT auth.uid())) OR 
      (SELECT public.is_super_admin())
    );

  CREATE POLICY "sessions_update_consolidated"
    ON public.user_sessions
    FOR UPDATE
    TO authenticated
    USING (
      (user_id = (SELECT auth.uid())) OR 
      (SELECT public.is_super_admin())
    )
    WITH CHECK (
      (user_id = (SELECT auth.uid())) OR 
      (SELECT public.is_super_admin())
    );

  RAISE NOTICE 'user_sessions: Created 3 consolidated policies';
END$$;

-- ============================================================================
-- WORK_LOCATIONS: Drop legacy policies, keep consolidated
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='work_locations' AND policyname='wl_all_admins') THEN
    DROP POLICY "wl_all_admins" ON public.work_locations;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='work_locations' AND policyname='wl_select_members') THEN
    DROP POLICY "wl_select_members" ON public.work_locations;
  END IF;

  RAISE NOTICE 'work_locations: Dropped 2 legacy policies. Consolidated policy "work_locations_select_consolidated" remains.';
END$$;

-- =============================================================================
-- VERIFICATION QUERIES (run after migration)
-- =============================================================================
-- SELECT policyname, cmd FROM pg_policies 
-- WHERE schemaname='public' AND tablename='user_sessions' 
-- ORDER BY cmd, policyname;
-- 
-- Expected: 3 policies (sessions_insert_consolidated, sessions_select_consolidated, sessions_update_consolidated)
--
-- SELECT policyname, cmd FROM pg_policies 
-- WHERE schemaname='public' AND tablename='work_locations' 
-- ORDER BY cmd, policyname;
-- 
-- Expected: 1 policy (work_locations_select_consolidated)
-- =============================================================================
