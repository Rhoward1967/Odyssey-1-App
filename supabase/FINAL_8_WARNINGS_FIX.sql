-- ============================================================================
-- FINAL FIX: Remaining 8 Advisor Warnings
-- 7 unindexed foreign keys + 1 RLS initplan issue
-- ============================================================================

BEGIN;
SET LOCAL statement_timeout = '60s';

-- ============================================================================
-- Part 1: Add Missing Foreign Key Indexes (7 items)
-- ============================================================================

-- employee_schedules
CREATE INDEX IF NOT EXISTS idx_employee_schedules_created_by
  ON public.employee_schedules(created_by);

CREATE INDEX IF NOT EXISTS idx_employee_schedules_shift_template_id
  ON public.employee_schedules(shift_template_id);

-- feature_flags
CREATE INDEX IF NOT EXISTS idx_feature_flags_updated_by
  ON public.feature_flags(updated_by);

-- global_admins
CREATE INDEX IF NOT EXISTS idx_global_admins_granted_by
  ON public.global_admins(granted_by);

-- handbook_quiz_results
CREATE INDEX IF NOT EXISTS idx_handbook_quiz_results_section_id
  ON public.handbook_quiz_results(section_id);

-- handbook_section_history
CREATE INDEX IF NOT EXISTS idx_handbook_section_history_changed_by
  ON public.handbook_section_history(changed_by);

CREATE INDEX IF NOT EXISTS idx_handbook_section_history_section_id
  ON public.handbook_section_history(section_id);

-- ============================================================================
-- Part 2: Fix activity_logs RLS Policy (wrap auth calls in SELECT)
-- ============================================================================

DROP POLICY IF EXISTS activity_logs_select_policy ON public.activity_logs;

CREATE POLICY activity_logs_select_policy
ON public.activity_logs
FOR SELECT
TO authenticated
USING (
  -- Wrap auth.uid() in SELECT to prevent re-evaluation per row
  user_id = (SELECT auth.uid())
  OR organization_id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = (SELECT auth.uid())
  )
);

COMMIT;

-- ============================================================================
-- All 8 warnings fixed!
-- ============================================================================
