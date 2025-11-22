-- ============================================================================
-- SCHEDULING SYSTEM: RLS POLICIES + PERFORMANCE INDEXES
-- Applies secure row-level security and optimizes query performance
-- ============================================================================

-- ============================================================================
-- PART 1: HELPER FUNCTION FOR ORGANIZATION MEMBERSHIP
-- ============================================================================

-- Drop existing function if it exists (both UUID and BIGINT versions)
DROP FUNCTION IF EXISTS public.is_org_member(uuid);
DROP FUNCTION IF EXISTS public.is_org_member(bigint);

-- Create helper function for cleaner RLS policies (BIGINT for organization_id)
CREATE OR REPLACE FUNCTION public.is_org_member(org bigint)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_organizations uo
    WHERE uo.user_id = auth.uid()
      AND uo.organization_id = org
  );
$$;

-- Restrict access to authenticated users only
REVOKE EXECUTE ON FUNCTION public.is_org_member(bigint) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_org_member(bigint) TO authenticated;

COMMENT ON FUNCTION public.is_org_member(bigint) IS 
  'Security definer function to check if current user is a member of the given organization (BIGINT)';


-- Helper function to check if user is admin/manager in org
DROP FUNCTION IF EXISTS public.is_org_admin(uuid);
DROP FUNCTION IF EXISTS public.is_org_admin(bigint);

CREATE OR REPLACE FUNCTION public.is_org_admin(org bigint)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_organizations uo
    WHERE uo.user_id = auth.uid()
      AND uo.organization_id = org
      AND uo.role IN ('owner', 'admin', 'manager')
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_org_admin(bigint) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_org_admin(bigint) TO authenticated;

COMMENT ON FUNCTION public.is_org_admin(bigint) IS 
  'Security definer function to check if current user is an admin/manager in the given organization (BIGINT)';


-- ============================================================================
-- PART 2: DROP EXISTING POLICIES (Clean slate)
-- ============================================================================

-- shift_templates
DROP POLICY IF EXISTS "Users can view shift templates in their org" ON public.shift_templates;
DROP POLICY IF EXISTS "Admins can manage shift templates" ON public.shift_templates;

-- work_locations
DROP POLICY IF EXISTS "Users can view work locations in their org" ON public.work_locations;
DROP POLICY IF EXISTS "Admins can manage work locations" ON public.work_locations;

-- employee_schedules
DROP POLICY IF EXISTS "Users can view schedules in their org" ON public.employee_schedules;
DROP POLICY IF EXISTS "Managers can manage schedules" ON public.employee_schedules;

-- teams
DROP POLICY IF EXISTS "Users can view teams in their org" ON public.teams;
DROP POLICY IF EXISTS "Admins can manage teams" ON public.teams;

-- team_members
DROP POLICY IF EXISTS "Users can view team members in their org" ON public.team_members;
DROP POLICY IF EXISTS "Admins can manage team members" ON public.team_members;

-- schedule_modifications
DROP POLICY IF EXISTS "Users can view modifications in their org" ON public.schedule_modifications;
DROP POLICY IF EXISTS "Employees can request modifications" ON public.schedule_modifications;
DROP POLICY IF EXISTS "Managers can manage modifications" ON public.schedule_modifications;

-- training_assignments
DROP POLICY IF EXISTS "Users can view training in their org" ON public.training_assignments;
DROP POLICY IF EXISTS "Managers can manage training" ON public.training_assignments;

-- schedule_templates
DROP POLICY IF EXISTS "Users can view schedule templates in their org" ON public.schedule_templates;
DROP POLICY IF EXISTS "Admins can manage schedule templates" ON public.schedule_templates;

-- schedule_template_details
DROP POLICY IF EXISTS "Users can view template details" ON public.schedule_template_details;
DROP POLICY IF EXISTS "Admins can manage template details" ON public.schedule_template_details;


-- ============================================================================
-- PART 3: IMPROVED RLS POLICIES USING HELPER FUNCTIONS
-- ============================================================================

-- ===========================
-- SHIFT TEMPLATES
-- ===========================
ALTER TABLE public.shift_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member_read_shift_templates" ON public.shift_templates
FOR SELECT TO authenticated
USING (is_org_member(organization_id));

CREATE POLICY "admin_insert_shift_templates" ON public.shift_templates
FOR INSERT TO authenticated
WITH CHECK (is_org_admin(organization_id));

CREATE POLICY "admin_update_shift_templates" ON public.shift_templates
FOR UPDATE TO authenticated
USING (is_org_admin(organization_id))
WITH CHECK (is_org_admin(organization_id));

CREATE POLICY "admin_delete_shift_templates" ON public.shift_templates
FOR DELETE TO authenticated
USING (is_org_admin(organization_id));


-- ===========================
-- WORK LOCATIONS
-- ===========================
ALTER TABLE public.work_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member_read_locations" ON public.work_locations
FOR SELECT TO authenticated
USING (is_org_member(organization_id));

CREATE POLICY "admin_insert_locations" ON public.work_locations
FOR INSERT TO authenticated
WITH CHECK (is_org_admin(organization_id));

CREATE POLICY "admin_update_locations" ON public.work_locations
FOR UPDATE TO authenticated
USING (is_org_admin(organization_id))
WITH CHECK (is_org_admin(organization_id));

CREATE POLICY "admin_delete_locations" ON public.work_locations
FOR DELETE TO authenticated
USING (is_org_admin(organization_id));


-- ===========================
-- EMPLOYEE SCHEDULES
-- ===========================
ALTER TABLE public.employee_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member_read_schedules" ON public.employee_schedules
FOR SELECT TO authenticated
USING (is_org_member(organization_id));

CREATE POLICY "admin_insert_schedules" ON public.employee_schedules
FOR INSERT TO authenticated
WITH CHECK (is_org_admin(organization_id));

CREATE POLICY "admin_update_schedules" ON public.employee_schedules
FOR UPDATE TO authenticated
USING (is_org_admin(organization_id))
WITH CHECK (is_org_admin(organization_id));

CREATE POLICY "admin_delete_schedules" ON public.employee_schedules
FOR DELETE TO authenticated
USING (is_org_admin(organization_id));


-- ===========================
-- TEAMS
-- ===========================
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member_read_teams" ON public.teams
FOR SELECT TO authenticated
USING (is_org_member(organization_id));

CREATE POLICY "admin_insert_teams" ON public.teams
FOR INSERT TO authenticated
WITH CHECK (is_org_admin(organization_id));

CREATE POLICY "admin_update_teams" ON public.teams
FOR UPDATE TO authenticated
USING (is_org_admin(organization_id))
WITH CHECK (is_org_admin(organization_id));

CREATE POLICY "admin_delete_teams" ON public.teams
FOR DELETE TO authenticated
USING (is_org_admin(organization_id));


-- ===========================
-- TEAM MEMBERS
-- ===========================
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member_read_team_members" ON public.team_members
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.teams t
    WHERE t.id = team_members.team_id
      AND is_org_member(t.organization_id)
  )
);

CREATE POLICY "admin_insert_team_members" ON public.team_members
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.teams t
    WHERE t.id = team_members.team_id
      AND is_org_admin(t.organization_id)
  )
);

CREATE POLICY "admin_update_team_members" ON public.team_members
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.teams t
    WHERE t.id = team_members.team_id
      AND is_org_admin(t.organization_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.teams t
    WHERE t.id = team_members.team_id
      AND is_org_admin(t.organization_id)
  )
);

CREATE POLICY "admin_delete_team_members" ON public.team_members
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.teams t
    WHERE t.id = team_members.team_id
      AND is_org_admin(t.organization_id)
  )
);


-- ===========================
-- SCHEDULE MODIFICATIONS
-- ===========================
ALTER TABLE public.schedule_modifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member_read_modifications" ON public.schedule_modifications
FOR SELECT TO authenticated
USING (is_org_member(organization_id));

-- Employees can request their own modifications
CREATE POLICY "employee_request_modification" ON public.schedule_modifications
FOR INSERT TO authenticated
WITH CHECK (
  is_org_member(organization_id) AND
  employee_id IN (
    SELECT id FROM public.employees e
    WHERE e.user_id = auth.uid()
  )
);

-- Admins can create any modification
CREATE POLICY "admin_insert_modifications" ON public.schedule_modifications
FOR INSERT TO authenticated
WITH CHECK (is_org_admin(organization_id));

-- Admins can update/approve modifications
CREATE POLICY "admin_update_modifications" ON public.schedule_modifications
FOR UPDATE TO authenticated
USING (is_org_admin(organization_id))
WITH CHECK (is_org_admin(organization_id));

CREATE POLICY "admin_delete_modifications" ON public.schedule_modifications
FOR DELETE TO authenticated
USING (is_org_admin(organization_id));


-- ===========================
-- TRAINING ASSIGNMENTS
-- ===========================
ALTER TABLE public.training_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member_read_training" ON public.training_assignments
FOR SELECT TO authenticated
USING (is_org_member(organization_id));

CREATE POLICY "admin_insert_training" ON public.training_assignments
FOR INSERT TO authenticated
WITH CHECK (is_org_admin(organization_id));

CREATE POLICY "admin_update_training" ON public.training_assignments
FOR UPDATE TO authenticated
USING (is_org_admin(organization_id))
WITH CHECK (is_org_admin(organization_id));

CREATE POLICY "admin_delete_training" ON public.training_assignments
FOR DELETE TO authenticated
USING (is_org_admin(organization_id));


-- ===========================
-- SCHEDULE TEMPLATES
-- ===========================
ALTER TABLE public.schedule_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member_read_schedule_templates" ON public.schedule_templates
FOR SELECT TO authenticated
USING (is_org_member(organization_id));

CREATE POLICY "admin_insert_schedule_templates" ON public.schedule_templates
FOR INSERT TO authenticated
WITH CHECK (is_org_admin(organization_id));

CREATE POLICY "admin_update_schedule_templates" ON public.schedule_templates
FOR UPDATE TO authenticated
USING (is_org_admin(organization_id))
WITH CHECK (is_org_admin(organization_id));

CREATE POLICY "admin_delete_schedule_templates" ON public.schedule_templates
FOR DELETE TO authenticated
USING (is_org_admin(organization_id));


-- ===========================
-- SCHEDULE TEMPLATE DETAILS
-- ===========================
ALTER TABLE public.schedule_template_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member_read_template_details" ON public.schedule_template_details
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.schedule_templates st
    WHERE st.id = schedule_template_details.template_id
      AND is_org_member(st.organization_id)
  )
);

CREATE POLICY "admin_insert_template_details" ON public.schedule_template_details
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.schedule_templates st
    WHERE st.id = schedule_template_details.template_id
      AND is_org_admin(st.organization_id)
  )
);

CREATE POLICY "admin_update_template_details" ON public.schedule_template_details
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.schedule_templates st
    WHERE st.id = schedule_template_details.template_id
      AND is_org_admin(st.organization_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.schedule_templates st
    WHERE st.id = schedule_template_details.template_id
      AND is_org_admin(st.organization_id)
  )
);

CREATE POLICY "admin_delete_template_details" ON public.schedule_template_details
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.schedule_templates st
    WHERE st.id = schedule_template_details.template_id
      AND is_org_admin(st.organization_id)
  )
);


-- ============================================================================
-- PART 4: PERFORMANCE INDEXES
-- ============================================================================

-- Drop existing indexes if they exist (avoid conflicts)
DROP INDEX IF EXISTS idx_shift_templates_org;
DROP INDEX IF EXISTS idx_work_locations_org;
DROP INDEX IF EXISTS idx_work_locations_active;
DROP INDEX IF EXISTS idx_schedules_org;
DROP INDEX IF EXISTS idx_schedules_employee;
DROP INDEX IF EXISTS idx_schedules_date;
DROP INDEX IF EXISTS idx_schedules_location;
DROP INDEX IF EXISTS idx_schedules_supervisor;
DROP INDEX IF EXISTS idx_schedules_date_range;
DROP INDEX IF EXISTS idx_teams_org;
DROP INDEX IF EXISTS idx_teams_lead;
DROP INDEX IF EXISTS idx_team_members_team;
DROP INDEX IF EXISTS idx_team_members_employee;
DROP INDEX IF EXISTS idx_modifications_org;
DROP INDEX IF EXISTS idx_modifications_employee;
DROP INDEX IF EXISTS idx_modifications_date;
DROP INDEX IF EXISTS idx_modifications_status;
DROP INDEX IF EXISTS idx_training_org;
DROP INDEX IF EXISTS idx_training_employee;
DROP INDEX IF EXISTS idx_training_status;
DROP INDEX IF EXISTS idx_training_expiration;
DROP INDEX IF EXISTS idx_schedule_templates_org;
DROP INDEX IF EXISTS idx_template_details_template;

-- Shift Templates
CREATE INDEX idx_shift_templates_org 
  ON public.shift_templates(organization_id) 
  WHERE is_active = true;

CREATE INDEX idx_shift_templates_org_type 
  ON public.shift_templates(organization_id, shift_type) 
  WHERE is_active = true;

-- Work Locations
CREATE INDEX idx_work_locations_org 
  ON public.work_locations(organization_id) 
  WHERE is_active = true;

CREATE INDEX idx_work_locations_org_type 
  ON public.work_locations(organization_id, location_type) 
  WHERE is_active = true;

-- Employee Schedules (CRITICAL for calendar performance)
CREATE INDEX idx_schedules_org_date 
  ON public.employee_schedules(organization_id, schedule_date);

CREATE INDEX idx_schedules_employee_date 
  ON public.employee_schedules(employee_id, schedule_date);

CREATE INDEX idx_schedules_date_status 
  ON public.employee_schedules(schedule_date, status);

CREATE INDEX idx_schedules_location_date 
  ON public.employee_schedules(work_location_id, schedule_date) 
  WHERE work_location_id IS NOT NULL;

CREATE INDEX idx_schedules_supervisor_date 
  ON public.employee_schedules(supervisor_id, schedule_date) 
  WHERE supervisor_id IS NOT NULL;

-- Composite index for calendar date range queries
CREATE INDEX idx_schedules_org_date_range 
  ON public.employee_schedules(organization_id, schedule_date, employee_id, status);

-- Teams
CREATE INDEX idx_teams_org_active 
  ON public.teams(organization_id) 
  WHERE is_active = true;

CREATE INDEX idx_teams_lead 
  ON public.teams(team_lead_id) 
  WHERE team_lead_id IS NOT NULL;

CREATE INDEX idx_teams_supervisor 
  ON public.teams(supervisor_id) 
  WHERE supervisor_id IS NOT NULL;

-- Team Members
CREATE INDEX idx_team_members_team_active 
  ON public.team_members(team_id) 
  WHERE is_active = true;

CREATE INDEX idx_team_members_employee_active 
  ON public.team_members(employee_id) 
  WHERE is_active = true;

CREATE INDEX idx_team_members_composite 
  ON public.team_members(team_id, employee_id, is_active);

-- Schedule Modifications
CREATE INDEX idx_modifications_org_status 
  ON public.schedule_modifications(organization_id, status);

CREATE INDEX idx_modifications_employee_date 
  ON public.schedule_modifications(employee_id, modification_date);

CREATE INDEX idx_modifications_date_status 
  ON public.schedule_modifications(modification_date, status);

CREATE INDEX idx_modifications_pending 
  ON public.schedule_modifications(organization_id, status, requested_at) 
  WHERE status = 'pending';

-- Training Assignments
CREATE INDEX idx_training_org_status 
  ON public.training_assignments(organization_id, status);

CREATE INDEX idx_training_employee_status 
  ON public.training_assignments(employee_id, status);

CREATE INDEX idx_training_expiring 
  ON public.training_assignments(expiration_date, status) 
  WHERE expiration_date IS NOT NULL AND status = 'completed';

CREATE INDEX idx_training_due 
  ON public.training_assignments(organization_id, due_date, status) 
  WHERE due_date IS NOT NULL AND status IN ('assigned', 'in_progress');

-- Schedule Templates
CREATE INDEX idx_schedule_templates_org_active 
  ON public.schedule_templates(organization_id) 
  WHERE is_active = true;

CREATE INDEX idx_schedule_templates_type 
  ON public.schedule_templates(organization_id, template_type) 
  WHERE is_active = true;

-- Schedule Template Details
CREATE INDEX idx_template_details_template 
  ON public.schedule_template_details(template_id, day_number);

CREATE INDEX idx_template_details_shift 
  ON public.schedule_template_details(template_id, shift_template_id) 
  WHERE shift_template_id IS NOT NULL;


-- ============================================================================
-- PART 5: VALIDATION & SUMMARY
-- ============================================================================

-- Verify RLS is enabled on all tables
DO $$
DECLARE
  tbl TEXT;
  rls_enabled BOOLEAN;
  policy_count INTEGER;
BEGIN
  FOR tbl IN 
    SELECT unnest(ARRAY[
      'shift_templates',
      'work_locations',
      'employee_schedules',
      'teams',
      'team_members',
      'schedule_modifications',
      'training_assignments',
      'schedule_templates',
      'schedule_template_details'
    ])
  LOOP
    -- Check if RLS is enabled
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class
    WHERE relname = tbl AND relnamespace = 'public'::regnamespace;
    
    -- Count policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = tbl;
    
    RAISE NOTICE 'Table: % | RLS: % | Policies: %', 
      tbl, 
      CASE WHEN rls_enabled THEN '✓ Enabled' ELSE '✗ DISABLED' END,
      policy_count;
  END LOOP;
END $$;

-- Summary
DO $$
DECLARE
  total_policies INTEGER;
  total_indexes INTEGER;
BEGIN
  -- Count policies
  SELECT COUNT(*) INTO total_policies
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN (
      'shift_templates', 'work_locations', 'employee_schedules',
      'teams', 'team_members', 'schedule_modifications',
      'training_assignments', 'schedule_templates', 'schedule_template_details'
    );
  
  -- Count indexes
  SELECT COUNT(*) INTO total_indexes
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND tablename IN (
      'shift_templates', 'work_locations', 'employee_schedules',
      'teams', 'team_members', 'schedule_modifications',
      'training_assignments', 'schedule_templates', 'schedule_template_details'
    )
    AND indexname LIKE 'idx_%';
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SCHEDULING SYSTEM RLS + INDEXES APPLIED';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total RLS Policies: %', total_policies;
  RAISE NOTICE 'Total Performance Indexes: %', total_indexes;
  RAISE NOTICE 'Helper Functions: 2 (is_org_member, is_org_admin)';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '1. Test anonymous access (should get 401/403)';
  RAISE NOTICE '2. Test non-member access (should get empty arrays)';
  RAISE NOTICE '3. Test member access (should see org data)';
  RAISE NOTICE '4. Test bulk schedule creation';
  RAISE NOTICE '5. Monitor query performance with EXPLAIN ANALYZE';
  RAISE NOTICE '========================================';
END $$;
