-- =============================================================================
-- COMPREHENSIVE DATABASE CLEANUP MIGRATION
-- =============================================================================
-- Purpose: Fix all 29 Supabase linter warnings (1 error + 28 warnings)
-- Date: 2024-11-22
-- Strategy: Option A - Preserve existing signatures, add security hardening
-- =============================================================================

-- Priority 1: Security (CRITICAL)
-- Enable RLS and add policies on public.user_roles

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Drop existing policies if they conflict in name
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' AND policyname='Admins can manage roles') THEN
    EXECUTE 'DROP POLICY "Admins can manage roles" ON public.user_roles';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' AND policyname='Users can view own role') THEN
    EXECUTE 'DROP POLICY "Users can view own role" ON public.user_roles';
  END IF;

  -- Create consolidated policies
  CREATE POLICY "Admins can manage roles"
    ON public.user_roles FOR ALL
    TO authenticated
    USING ((SELECT public.is_admin()))
    WITH CHECK ((SELECT public.is_admin()));

  CREATE POLICY "Users can view own role"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (((SELECT auth.uid()) = user_id));
END$$;

-- Priority 2: New Telemetry Tables (OUR MIGRATION)

-- Consolidate user_sessions policies
DO $$
DECLARE
  pol RECORD;
BEGIN
  -- Drop known duplicate/select/insert/update policies by name if present
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname='public' AND tablename='user_sessions'
      AND policyname IN (
        'Users view own sessions',
        'Admins view all sessions',
        'System insert sessions',
        'System update sessions'
      )
  LOOP
    EXECUTE format('DROP POLICY %I ON public.user_sessions', pol.policyname);
  END LOOP;

  -- Create a single consolidated SELECT policy (admins OR owner)
  CREATE POLICY "sessions_select_consolidated"
    ON public.user_sessions
    FOR SELECT
    TO authenticated
    USING ( (SELECT public.is_admin()) OR ((SELECT auth.uid()) = user_id) );

  -- Create a single consolidated INSERT policy (system/admin or owner)
  CREATE POLICY "sessions_insert_consolidated"
    ON public.user_sessions
    FOR INSERT
    TO authenticated
    WITH CHECK ( (SELECT public.is_admin()) OR ((SELECT auth.uid()) = user_id) );

  -- Create a single consolidated UPDATE policy (admins or owner)
  CREATE POLICY "sessions_update_consolidated"
    ON public.user_sessions
    FOR UPDATE
    TO authenticated
    USING ( (SELECT public.is_admin()) OR ((SELECT auth.uid()) = user_id) )
    WITH CHECK ( (SELECT public.is_admin()) OR ((SELECT auth.uid()) = user_id) );
END$$;

-- Consolidate feature_usage policies
DO $$
DECLARE
  pol RECORD;
BEGIN
  -- Drop known duplicates
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname='public' AND tablename='feature_usage'
      AND policyname IN (
        'Users view own feature usage',
        'Admins view all feature usage',
        'System track feature usage'
      )
  LOOP
    EXECUTE format('DROP POLICY %I ON public.feature_usage', pol.policyname);
  END LOOP;

  -- Single consolidated SELECT policy (admins OR owner)
  CREATE POLICY "feature_usage_select_consolidated"
    ON public.feature_usage
    FOR SELECT
    TO authenticated
    USING ( (SELECT public.is_admin()) OR ((SELECT auth.uid()) = user_id) );

  -- Single INSERT policy (allow app to track usage; keep owner binding)
  CREATE POLICY "feature_usage_insert_consolidated"
    ON public.feature_usage
    FOR INSERT
    TO authenticated
    WITH CHECK ( (SELECT public.is_admin()) OR ((SELECT auth.uid()) = user_id) );
END$$;

-- Priority 3: Pre-existing Function Warnings
-- Add SET search_path = public, pg_temp to 8 functions
-- OPTION A: Preserve existing signatures, only add security

-- 1) upsert_system_knowledge
CREATE OR REPLACE FUNCTION public.upsert_system_knowledge(
  p_category text,
  p_key text,
  p_value jsonb,
  p_confidence int DEFAULT 100
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.system_knowledge(category, knowledge_key, value, confidence_level)
  VALUES (p_category, p_key, p_value, p_confidence)
  ON CONFLICT (category, knowledge_key) DO UPDATE
  SET value = EXCLUDED.value,
      confidence_level = EXCLUDED.confidence_level,
      updated_at = now();
END;
$$;

-- 2) is_org_member(bigint) - PRESERVE EXISTING SIGNATURE
CREATE OR REPLACE FUNCTION public.is_org_member(org_id BIGINT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_organizations uo
    WHERE uo.organization_id = org_id
      AND uo.user_id = (SELECT auth.uid())
  );
$$;

-- 3) is_org_member(uuid) - Second overload if exists
CREATE OR REPLACE FUNCTION public.is_org_member(org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_organizations uo
    JOIN public.organizations o ON o.id = uo.organization_id
    WHERE o.id::uuid = org_id
      AND uo.user_id = (SELECT auth.uid())
  );
$$;

-- 4) is_org_admin(bigint) - PRESERVE EXISTING SIGNATURE
CREATE OR REPLACE FUNCTION public.is_org_admin(org_id BIGINT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_organizations uo
    WHERE uo.organization_id = org_id
      AND uo.user_id = (SELECT auth.uid())
      AND uo.role IN ('owner','admin','manager')
  );
$$;

-- 5) is_org_admin(uuid) - Second overload
CREATE OR REPLACE FUNCTION public.is_org_admin(org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_organizations uo
    JOIN public.organizations o ON o.id = uo.organization_id
    WHERE o.id::uuid = org_id
      AND uo.user_id = (SELECT auth.uid())
      AND uo.role IN ('owner','admin','manager')
  );
$$;

-- 6) _create_policy_if_missing helper
CREATE OR REPLACE FUNCTION public._create_policy_if_missing(
  p_policy_name text,
  p_table regclass,
  p_cmd text,
  p_to_role text,
  p_using text,
  p_check text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  t_schema text := split_part(p_table::text, '.', 1);
  t_name   text := split_part(p_table::text, '.', 2);
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = t_schema AND tablename = t_name AND policyname = p_policy_name
  ) THEN
    EXECUTE format(
      'CREATE POLICY %I ON %s FOR %s TO %I %s %s;',
      p_policy_name,
      p_table::text,
      p_cmd,
      p_to_role,
      CASE WHEN p_using IS NOT NULL THEN format('USING (%s)', p_using) ELSE '' END,
      CASE WHEN p_check IS NOT NULL THEN format('WITH CHECK (%s)', p_check) ELSE '' END
    );
  END IF;
END;
$$;

-- 7) get_days_in_month
CREATE OR REPLACE FUNCTION public.get_days_in_month(p_date date)
RETURNS int
LANGUAGE sql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXTRACT(DAY FROM (date_trunc('month', p_date) + interval '1 month - 1 day'))::int;
$$;

-- 8) generate_schedules_from_template
CREATE OR REPLACE FUNCTION public.generate_schedules_from_template(
  p_template_id uuid,
  p_org_id bigint,
  p_start_date date,
  p_days int
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.employee_schedules (organization_id, schedule_date, shift_template_id, work_location_id, created_at)
  SELECT p_org_id, p_start_date + (n || ' days')::interval, std.shift_template_id, std.work_location_id, now()
  FROM generate_series(0, GREATEST(p_days,0)) AS n
  JOIN public.schedule_template_details std ON std.template_id = p_template_id;
END;
$$;

-- Revoke public access to security-sensitive functions
REVOKE ALL ON FUNCTION public.is_org_member(BIGINT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_org_admin(BIGINT) FROM PUBLIC, anon, authenticated;

-- Priority 4: Pre-existing Performance Issues

-- Fix activity_logs auth RLS initplan: ensure (SELECT auth.uid()) pattern
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='public' AND tablename='activity_logs'
      AND (policyname ILIKE '%select%' OR policyname ILIKE '%read%')
  LOOP
    EXECUTE format('DROP POLICY %I ON public.activity_logs', pol.policyname);
  END LOOP;

  -- Allow users to view their own logs; admins can view all
  CREATE POLICY "activity_logs_select_consolidated"
    ON public.activity_logs
    FOR SELECT
    TO authenticated
    USING (
      (SELECT public.is_admin()) OR (user_id IS NOT NULL AND user_id = (SELECT auth.uid()))
    );
END$$;

-- Priority 5: Consolidate duplicate permissive policies on existing tables
-- Helper function to drop policies by name

CREATE OR REPLACE FUNCTION public._drop_policies_if_exists(p_table regclass, p_names text[])
RETURNS void
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = split_part(p_table::text, '.', 1)
      AND tablename  = split_part(p_table::text, '.', 2)
      AND policyname = ANY (p_names)
  LOOP
    EXECUTE format('DROP POLICY %I ON %s', pol.policyname, p_table::text);
  END LOOP;
END;
$$;

-- Consolidations for listed tables

-- Bids
SELECT public._drop_policies_if_exists('public.bids', ARRAY[
  'bids_select_1','bids_select_2','bids_insert_1','bids_insert_2'
]);
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='bids' AND policyname='bids_select_consolidated') THEN
    CREATE POLICY "bids_select_consolidated" ON public.bids FOR SELECT TO authenticated
    USING ((SELECT public.is_admin()) OR ((SELECT auth.uid()) = user_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='bids' AND policyname='bids_insert_consolidated') THEN
    CREATE POLICY "bids_insert_consolidated" ON public.bids FOR INSERT TO authenticated
    WITH CHECK ((SELECT public.is_admin()) OR ((SELECT auth.uid()) = user_id));
  END IF;
END$$;

-- Employee-related tables
SELECT public._drop_policies_if_exists('public.employee_schedules', ARRAY[
  'employee_schedules_select_1','employee_schedules_select_2','employee_schedules_insert_1','employee_schedules_insert_2'
]);
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='employee_schedules' AND policyname='employee_schedules_select_consolidated') THEN
    CREATE POLICY "employee_schedules_select_consolidated" ON public.employee_schedules FOR SELECT TO authenticated
    USING ((SELECT public.is_admin()) OR ((SELECT auth.uid()) = created_by) OR ((SELECT auth.uid()) = supervisor_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='employee_schedules' AND policyname='employee_schedules_insert_consolidated') THEN
    CREATE POLICY "employee_schedules_insert_consolidated" ON public.employee_schedules FOR INSERT TO authenticated
    WITH CHECK ((SELECT public.is_admin()) OR ((SELECT auth.uid()) = created_by));
  END IF;
END$$;

SELECT public._drop_policies_if_exists('public.schedule_modifications', ARRAY[
  'schedule_modifications_select_1','schedule_modifications_select_2','schedule_modifications_insert_1','schedule_modifications_insert_2'
]);
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='schedule_modifications' AND policyname='schedule_modifications_select_consolidated') THEN
    CREATE POLICY "schedule_modifications_select_consolidated" ON public.schedule_modifications FOR SELECT TO authenticated
    USING ((SELECT public.is_admin()) OR ((SELECT auth.uid()) = reviewed_by) OR ((SELECT auth.uid()) = employee_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='schedule_modifications' AND policyname='schedule_modifications_insert_consolidated') THEN
    CREATE POLICY "schedule_modifications_insert_consolidated" ON public.schedule_modifications FOR INSERT TO authenticated
    WITH CHECK ((SELECT public.is_admin()) OR ((SELECT auth.uid()) = employee_id));
  END IF;
END$$;

-- schedule_template_details, schedule_templates, shift_templates
SELECT public._drop_policies_if_exists('public.schedule_template_details', ARRAY[
  'schedule_template_details_select_1','schedule_template_details_select_2'
]);
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='schedule_template_details' AND policyname='schedule_template_details_select_consolidated') THEN
    CREATE POLICY "schedule_template_details_select_consolidated" ON public.schedule_template_details FOR SELECT TO authenticated
    USING ((SELECT public.is_admin()) OR true);
  END IF;
END$$;

SELECT public._drop_policies_if_exists('public.schedule_templates', ARRAY[
  'schedule_templates_select_1','schedule_templates_select_2'
]);
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='schedule_templates' AND policyname='schedule_templates_select_consolidated') THEN
    CREATE POLICY "schedule_templates_select_consolidated" ON public.schedule_templates FOR SELECT TO authenticated
    USING ((SELECT public.is_admin()) OR true);
  END IF;
END$$;

SELECT public._drop_policies_if_exists('public.shift_templates', ARRAY[
  'shift_templates_select_1','shift_templates_select_2'
]);
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='shift_templates' AND policyname='shift_templates_select_consolidated') THEN
    CREATE POLICY "shift_templates_select_consolidated" ON public.shift_templates FOR SELECT TO authenticated
    USING ((SELECT public.is_admin()) OR true);
  END IF;
END$$;

-- team_members, teams, training_assignments, work_locations
SELECT public._drop_policies_if_exists('public.team_members', ARRAY[
  'team_members_select_1','team_members_select_2'
]);
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='team_members' AND policyname='team_members_select_consolidated') THEN
    CREATE POLICY "team_members_select_consolidated" ON public.team_members FOR SELECT TO authenticated
    USING ((SELECT public.is_admin()) OR true);
  END IF;
END$$;

SELECT public._drop_policies_if_exists('public.teams', ARRAY[
  'teams_select_1','teams_select_2'
]);
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='teams' AND policyname='teams_select_consolidated') THEN
    CREATE POLICY "teams_select_consolidated" ON public.teams FOR SELECT TO authenticated
    USING ((SELECT public.is_admin()) OR true);
  END IF;
END$$;

SELECT public._drop_policies_if_exists('public.training_assignments', ARRAY[
  'training_assignments_select_1','training_assignments_select_2'
]);
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='training_assignments' AND policyname='training_assignments_select_consolidated') THEN
    CREATE POLICY "training_assignments_select_consolidated" ON public.training_assignments FOR SELECT TO authenticated
    USING ((SELECT public.is_admin()) OR ((SELECT auth.uid()) = employee_id));
  END IF;
END$$;

SELECT public._drop_policies_if_exists('public.work_locations', ARRAY[
  'work_locations_select_1','work_locations_select_2'
]);
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='work_locations' AND policyname='work_locations_select_consolidated') THEN
    CREATE POLICY "work_locations_select_consolidated" ON public.work_locations FOR SELECT TO authenticated
    USING ((SELECT public.is_admin()) OR true);
  END IF;
END$$;

-- user_organizations: multiple duplicates (DELETE, INSERT, SELECT, UPDATE)
-- NOTE: user_organizations.organization_id is UUID, so we use the UUID overload
SELECT public._drop_policies_if_exists('public.user_organizations', ARRAY[
  'user_orgs_delete_1','user_orgs_delete_2',
  'user_orgs_insert_1','user_orgs_insert_2',
  'user_orgs_select_1','user_orgs_select_2',
  'user_orgs_update_1','user_orgs_update_2'
]);
DO $$
BEGIN
  -- SELECT: members can view org memberships
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_organizations' AND policyname='user_orgs_select_consolidated') THEN
    CREATE POLICY "user_orgs_select_consolidated" ON public.user_organizations FOR SELECT TO authenticated
    USING (
      (SELECT auth.uid()) = user_id OR
      (SELECT public.is_org_member(organization_id)) OR
      (SELECT public.is_admin())
    );
  END IF;
  -- INSERT: allow org admins to add members, or self-join if allowed
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_organizations' AND policyname='user_orgs_insert_consolidated') THEN
    CREATE POLICY "user_orgs_insert_consolidated" ON public.user_organizations FOR INSERT TO authenticated
    WITH CHECK (
      (SELECT public.is_org_admin(organization_id)) OR
      (SELECT public.is_admin())
    );
  END IF;
  -- UPDATE: allow org admins to modify roles
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_organizations' AND policyname='user_orgs_update_consolidated') THEN
    CREATE POLICY "user_orgs_update_consolidated" ON public.user_organizations FOR UPDATE TO authenticated
    USING (
      (SELECT public.is_org_admin(organization_id)) OR
      (SELECT public.is_admin())
    )
    WITH CHECK (
      (SELECT public.is_org_admin(organization_id)) OR
      (SELECT public.is_admin())
    );
  END IF;
  -- DELETE: allow org admins to remove members
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_organizations' AND policyname='user_orgs_delete_consolidated') THEN
    CREATE POLICY "user_orgs_delete_consolidated" ON public.user_organizations FOR DELETE TO authenticated
    USING (
      (SELECT public.is_org_admin(organization_id)) OR
      (SELECT public.is_admin())
    );
  END IF;
END$$;

-- =============================================================================
-- END OF COMPREHENSIVE CLEANUP MIGRATION
-- =============================================================================
-- Expected Outcome: 0 security errors, 0 function warnings, 0 performance warnings
-- Next Steps: Enable pg_cron extension and schedule automated telemetry
-- =============================================================================
