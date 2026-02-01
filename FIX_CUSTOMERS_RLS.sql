-- FIX: Add RLS policies for customers and company_profiles tables
-- The frontend queries are failing because these tables have RLS enabled
-- but NO SELECT policies defined

-- ==================== CUSTOMERS TABLE POLICIES ====================

-- Allow users to view their own customers + any customers with null user_id (legacy/shared)
CREATE POLICY "Users can view own customers" ON customers
FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()) OR user_id IS NULL);

-- Allow users to insert their own customers
CREATE POLICY "Users can insert own customers" ON customers
FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

-- Allow users to update their own customers
CREATE POLICY "Users can update own customers" ON customers
FOR UPDATE
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- ==================== COMPANY_PROFILES TABLE POLICIES ====================

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON company_profiles
FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON company_profiles
FOR UPDATE
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- ==================== VERIFICATION ====================

-- Check policies were created
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('customers', 'company_profiles')
ORDER BY tablename, cmd;
