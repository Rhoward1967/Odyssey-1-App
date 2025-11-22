-- ============================================================================
-- MANUAL FIX: Apply all Supabase linter warning fixes
-- Run this directly in Supabase SQL Editor
-- ============================================================================

-- Part 1: Fix Function Search Paths (SECURITY)
-- ============================================================================

ALTER FUNCTION public.upsert_system_knowledge(text, jsonb, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.is_org_member(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.is_org_admin(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public._create_policy_if_missing(text, text, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_days_in_month(integer, integer) SET search_path = public, pg_temp;
ALTER FUNCTION public.generate_schedules_from_template(uuid, date, date) SET search_path = public, pg_temp;

-- Part 2: Fix Activity Logs RLS Performance
-- ============================================================================

DROP POLICY IF EXISTS activity_logs_select_policy ON public.activity_logs;

CREATE POLICY activity_logs_select_policy
ON public.activity_logs
FOR SELECT
TO authenticated
USING (
  user_id = (SELECT auth.uid())
  OR organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = (SELECT auth.uid())
  )
);

-- Part 3: Consolidate Duplicate Policies
-- ============================================================================

-- user_organizations
DROP POLICY IF EXISTS user_organizations_select ON public.user_organizations;
DROP POLICY IF EXISTS user_orgs_select_policy ON public.user_organizations;
CREATE POLICY user_organizations_select_consolidated ON public.user_organizations
FOR SELECT TO authenticated
USING (user_id = (SELECT auth.uid()) OR organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = (SELECT auth.uid()) AND role = 'admin'));

DROP POLICY IF EXISTS user_organizations_insert ON public.user_organizations;
DROP POLICY IF EXISTS user_orgs_insert_policy ON public.user_organizations;
CREATE POLICY user_organizations_insert_consolidated ON public.user_organizations
FOR INSERT TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()) OR organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = (SELECT auth.uid()) AND role = 'admin'));

DROP POLICY IF EXISTS user_organizations_update ON public.user_organizations;
DROP POLICY IF EXISTS user_orgs_update_policy ON public.user_organizations;
CREATE POLICY user_organizations_update_consolidated ON public.user_organizations
FOR UPDATE TO authenticated
USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = (SELECT auth.uid()) AND role = 'admin'));

DROP POLICY IF EXISTS user_organizations_delete ON public.user_organizations;
DROP POLICY IF EXISTS user_orgs_delete_policy ON public.user_organizations;
CREATE POLICY user_organizations_delete_consolidated ON public.user_organizations
FOR DELETE TO authenticated
USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = (SELECT auth.uid()) AND role = 'admin'));

-- bids
DROP POLICY IF EXISTS bids_org_read ON public.bids;
DROP POLICY IF EXISTS bids_select ON public.bids;
CREATE POLICY bids_select_consolidated ON public.bids
FOR SELECT TO authenticated
USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = (SELECT auth.uid())));

-- employee_schedules
DROP POLICY IF EXISTS es_all_admins ON public.employee_schedules;
DROP POLICY IF EXISTS es_select_members ON public.employee_schedules;
CREATE POLICY employee_schedules_select_consolidated ON public.employee_schedules
FOR SELECT TO authenticated
USING (user_id = (SELECT auth.uid()) OR organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = (SELECT auth.uid()) AND role = 'admin'));

-- schedule_modifications
DROP POLICY IF EXISTS sm_all_admins ON public.schedule_modifications;
DROP POLICY IF EXISTS sm_employee_insert_own ON public.schedule_modifications;
CREATE POLICY schedule_modifications_insert_consolidated ON public.schedule_modifications
FOR INSERT TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()) OR organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = (SELECT auth.uid()) AND role = 'admin'));

DROP POLICY IF EXISTS sm_select_members ON public.schedule_modifications;
CREATE POLICY schedule_modifications_select_consolidated ON public.schedule_modifications
FOR SELECT TO authenticated
USING (user_id = (SELECT auth.uid()) OR organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = (SELECT auth.uid())));

-- schedule_template_details
DROP POLICY IF EXISTS std_all_admins ON public.schedule_template_details;
DROP POLICY IF EXISTS std_select_members ON public.schedule_template_details;
CREATE POLICY schedule_template_details_select_consolidated ON public.schedule_template_details
FOR SELECT TO authenticated
USING (template_id IN (SELECT id FROM schedule_templates st WHERE st.organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = (SELECT auth.uid()))));

-- schedule_templates
DROP POLICY IF EXISTS stpl_all_admins ON public.schedule_templates;
DROP POLICY IF EXISTS stpl_select_members ON public.schedule_templates;
CREATE POLICY schedule_templates_select_consolidated ON public.schedule_templates
FOR SELECT TO authenticated
USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = (SELECT auth.uid())));

-- shift_templates
DROP POLICY IF EXISTS st_all_admins ON public.shift_templates;
DROP POLICY IF EXISTS st_select_members ON public.shift_templates;
CREATE POLICY shift_templates_select_consolidated ON public.shift_templates
FOR SELECT TO authenticated
USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = (SELECT auth.uid())));

-- team_members
DROP POLICY IF EXISTS tm_all_admins ON public.team_members;
DROP POLICY IF EXISTS tm_select_members ON public.team_members;
CREATE POLICY team_members_select_consolidated ON public.team_members
FOR SELECT TO authenticated
USING (user_id = (SELECT auth.uid()) OR team_id IN (SELECT id FROM teams t WHERE t.organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = (SELECT auth.uid()))));

-- teams
DROP POLICY IF EXISTS t_all_admins ON public.teams;
DROP POLICY IF EXISTS t_select_members ON public.teams;
CREATE POLICY teams_select_consolidated ON public.teams
FOR SELECT TO authenticated
USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = (SELECT auth.uid())));

-- training_assignments
DROP POLICY IF EXISTS ta_all_admins ON public.training_assignments;
DROP POLICY IF EXISTS ta_select_members ON public.training_assignments;
CREATE POLICY training_assignments_select_consolidated ON public.training_assignments
FOR SELECT TO authenticated
USING (user_id = (SELECT auth.uid()) OR organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = (SELECT auth.uid())));

-- work_locations
DROP POLICY IF EXISTS wl_all_admins ON public.work_locations;
DROP POLICY IF EXISTS wl_select_members ON public.work_locations;
CREATE POLICY work_locations_select_consolidated ON public.work_locations
FOR SELECT TO authenticated
USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = (SELECT auth.uid())));

-- ============================================================================
-- Done! All warnings should be fixed.
-- ============================================================================
