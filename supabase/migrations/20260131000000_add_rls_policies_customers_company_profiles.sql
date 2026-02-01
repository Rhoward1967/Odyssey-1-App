-- Migration: Add RLS policies for customers and company_profiles tables
-- Generated: 2026-01-31
-- Issue: Frontend getting 400/500 errors because RLS enabled but no SELECT policies

BEGIN;

-- ==================== CUSTOMERS TABLE POLICIES ====================

-- Drop existing policies if they exist (to make this migration idempotent)
DROP POLICY IF EXISTS "Users can view own customers" ON customers;
DROP POLICY IF EXISTS "Users can insert own customers" ON customers;
DROP POLICY IF EXISTS "Users can update own customers" ON customers;

-- Allow users to view their own customers + legacy customers with null user_id
CREATE POLICY "Users can view own customers" 
ON customers
FOR SELECT 
TO authenticated
USING (user_id = auth.uid() OR user_id IS NULL);

-- Allow users to insert their own customers
CREATE POLICY "Users can insert own customers" 
ON customers
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Allow users to update their own customers
CREATE POLICY "Users can update own customers" 
ON customers
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ==================== COMPANY_PROFILES TABLE POLICIES ====================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON company_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON company_profiles;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" 
ON company_profiles
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
ON company_profiles
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

COMMIT;
