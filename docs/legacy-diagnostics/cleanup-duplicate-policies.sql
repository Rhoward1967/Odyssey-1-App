-- ODYSSEY-1 Database Policy Cleanup Script
-- Removes duplicate RLS policies for optimal performance
-- Run this in your Supabase SQL Editor

-- 1. Clean up PROFILES table policies
-- Drop old/duplicate policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile." ON profiles;
DROP POLICY IF EXISTS "Enable insert for own profile" ON profiles;  
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Enable update for self or admins" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON profiles;

-- Keep only the clean, efficient policies from our setup-database.sql
-- (The "Users can view own profile", "Users can insert own profile", "Users can update own profile" policies should remain)

-- 2. Clean up ACTIVITY_LOGS table policies  
-- Drop old/duplicate policies
DROP POLICY IF EXISTS "Allow authenticated users to read activity logs" ON activity_logs;
DROP POLICY IF EXISTS "Enable read for own logs or admins" ON activity_logs;

-- Keep only: "Users can view own activity", "Users can insert own activity"

-- 3. Clean up SUBSCRIPTIONS table policies
-- Drop old/duplicate policies  
DROP POLICY IF EXISTS "Enable full access for owners or admins" ON subscriptions;

-- Keep only: "Users can view own subscriptions", "Users can insert own subscriptions", "Users can update own subscriptions"

-- 4. Clean up SERVICES table policies
-- Drop old/duplicate policies
DROP POLICY IF EXISTS "services_authenticated_all_admin_only_write" ON services;
DROP POLICY IF EXISTS "services_public_read_active" ON services;

-- Create a single, efficient services policy
CREATE POLICY "services_read_access" ON services
  FOR SELECT TO authenticated 
  USING (active = true OR auth.uid() IN (
    SELECT id FROM profiles WHERE is_admin = true
  ));

-- 5. Verify policies are clean
-- You can run these queries to check remaining policies:
-- SELECT schemaname, tablename, policyname, cmd FROM pg_policies WHERE schemaname = 'public';

COMMENT ON SCHEMA public IS 'ODYSSEY-1 Database - Optimized RLS policies for performance';