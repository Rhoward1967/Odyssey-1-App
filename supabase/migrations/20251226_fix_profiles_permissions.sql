-- Fix profiles table permissions for payroll reconciliation
-- Date: 2025-12-26
-- Issue: RLS policies on payroll tables need to query profiles table

-- Grant SELECT on profiles to authenticated users
GRANT SELECT ON public.profiles TO authenticated;

-- Enable RLS on profiles if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create policy allowing users to view their own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());
