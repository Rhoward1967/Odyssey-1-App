-- ODYSSEY-1 Safe RLS Policy Optimization - Phase A
-- CREATE new consolidated policies FIRST (no lockout risk)

-- ====================
-- PROFILES TABLE - Optimized Policies
-- ====================

-- Optimized SELECT: Self or admins only
CREATE POLICY "optimized_profiles_select" ON profiles
  FOR SELECT TO authenticated 
  USING ((id = auth.uid()) OR is_super_admin());

-- Optimized INSERT: Self or admins only  
CREATE POLICY "optimized_profiles_insert" ON profiles
  FOR INSERT TO authenticated 
  WITH CHECK ((id = auth.uid()) OR is_super_admin());

-- Optimized UPDATE: Self or admins only
CREATE POLICY "optimized_profiles_update" ON profiles
  FOR UPDATE TO authenticated 
  USING ((id = auth.uid()) OR is_super_admin())
  WITH CHECK ((id = auth.uid()) OR is_super_admin());

-- ====================
-- ACTIVITY_LOGS TABLE - Optimized Policies  
-- ====================

-- Optimized SELECT: Own logs or admins
CREATE POLICY "optimized_activity_logs_select" ON activity_logs
  FOR SELECT TO authenticated
  USING ((user_id = auth.uid()) OR is_super_admin());

-- Optimized INSERT: Own activity or admins
CREATE POLICY "optimized_activity_logs_insert" ON activity_logs
  FOR INSERT TO authenticated
  WITH CHECK ((user_id = auth.uid()) OR is_super_admin());

-- ====================
-- SUBSCRIPTIONS TABLE - Optimized Policies
-- ====================

-- Optimized SELECT: Own subscriptions only
CREATE POLICY "optimized_subscriptions_select" ON subscriptions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Optimized INSERT: Own subscriptions only
CREATE POLICY "optimized_subscriptions_insert" ON subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Optimized UPDATE: Own subscriptions only  
CREATE POLICY "optimized_subscriptions_update" ON subscriptions
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Verification: Check that new policies are created
SELECT 'Phase A Complete - New optimized policies created' as status;
SELECT tablename, policyname, cmd FROM pg_policies 
WHERE schemaname = 'public' 
  AND policyname LIKE 'optimized_%'
ORDER BY tablename, cmd;