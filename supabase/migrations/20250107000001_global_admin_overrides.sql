-- ========================================
-- ADD GLOBAL ADMIN OVERRIDES TO CRITICAL TABLES
-- ========================================

-- EMPLOYEES TABLE: Global admins can see all employees
CREATE POLICY "employees_global_admin_all"
ON employees
FOR ALL
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
  )
  OR public.is_global_admin()
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() AND role = 'admin'
  )
  OR public.is_global_admin()
);

-- PAYROLL_RUNS TABLE: Global admins can manage all payroll
CREATE POLICY "payroll_runs_global_admin_all"
ON payroll_runs
FOR ALL
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
  )
  OR public.is_global_admin()
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() AND role = 'admin'
  )
  OR public.is_global_admin()
);

-- PAYSTUBS TABLE: Global admins can see all paystubs
CREATE POLICY "paystubs_global_admin_all"
ON paystubs
FOR ALL
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
  )
  OR public.is_global_admin()
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() AND role = 'admin'
  )
  OR public.is_global_admin()
);

-- TIME_ENTRIES TABLE: Global admins can audit all time entries
CREATE POLICY "time_entries_global_admin_all"
ON time_entries
FOR ALL
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
  )
  OR user_id = auth.uid()
  OR public.is_global_admin()
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() AND role = 'admin'
  )
  OR user_id = auth.uid()
  OR public.is_global_admin()
);

-- FEATURE_FLAGS TABLE: Global admins can toggle all features
CREATE POLICY "feature_flags_global_admin_all"
ON feature_flags
FOR ALL
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
  )
  OR public.is_global_admin()
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() AND role = 'admin'
  )
  OR public.is_global_admin()
);

-- ACTIVITY_LOGS TABLE: Global admins can see all audit logs
CREATE POLICY "activity_logs_global_admin_all"
ON activity_logs
FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
  )
  OR user_id = auth.uid()
  OR public.is_global_admin()
);

-- VERIFY POLICIES CREATED
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE policyname LIKE '%global_admin%'
ORDER BY tablename, policyname;
