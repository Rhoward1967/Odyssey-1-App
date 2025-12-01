-- AUTO-GENERATED: FINAL DUPLICATE POLICY AND INDEX CLEANUP
-- This migration safely removes legacy/duplicate policies and adds missing indexes ONLY if needed.
-- All changes use IF EXISTS/IF NOT EXISTS to avoid breaking app, AI, or user access.

-- =====================
-- USER_SESSIONS POLICIES
-- =====================
DO $$
BEGIN
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
END$$;

-- =====================
-- WORK_LOCATIONS POLICIES
-- =====================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='work_locations' AND policyname='wl_all_admins') THEN
    DROP POLICY "wl_all_admins" ON public.work_locations;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='work_locations' AND policyname='wl_select_members') THEN
    DROP POLICY "wl_select_members" ON public.work_locations;
  END IF;
END$$;

-- =====================
-- USER_ORGANIZATIONS POLICIES
-- =====================
DROP POLICY IF EXISTS user_organizations_select ON public.user_organizations;
DROP POLICY IF EXISTS user_orgs_select_policy ON public.user_organizations;
DROP POLICY IF EXISTS user_organizations_insert ON public.user_organizations;
DROP POLICY IF EXISTS user_orgs_insert_policy ON public.user_organizations;
DROP POLICY IF EXISTS user_organizations_update ON public.user_organizations;
DROP POLICY IF EXISTS user_orgs_update_policy ON public.user_organizations;
DROP POLICY IF EXISTS user_organizations_delete ON public.user_organizations;
DROP POLICY IF EXISTS user_orgs_delete_policy ON public.user_organizations;

-- =====================
-- INDEXES (SAFE, IF NOT EXISTS)
-- =====================
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_org ON public.documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_orgs_user_org ON public.user_organizations(user_id, organization_id);

-- =====================
-- END OF CLEANUP
-- =====================
