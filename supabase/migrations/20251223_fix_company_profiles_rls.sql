-- Fix company_profiles RLS policy
-- Date: December 23, 2025
-- Issue: 403 Forbidden on company_profiles SELECT queries

-- Enable RLS on company_profiles table
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (idempotent)
DROP POLICY IF EXISTS "Users can view their own company profile" ON company_profiles;
DROP POLICY IF EXISTS "Users can insert their own company profile" ON company_profiles;
DROP POLICY IF EXISTS "Users can update their own company profile" ON company_profiles;
DROP POLICY IF EXISTS "Users can delete their own company profile" ON company_profiles;

-- SELECT policy: Users can view their own company profile
CREATE POLICY "Users can view their own company profile"
ON company_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- INSERT policy: Users can create their own company profile
CREATE POLICY "Users can insert their own company profile"
ON company_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- UPDATE policy: Users can update their own company profile
CREATE POLICY "Users can update their own company profile"
ON company_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE policy: Users can delete their own company profile
CREATE POLICY "Users can delete their own company profile"
ON company_profiles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON company_profiles TO authenticated;

-- Verification
DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies created for company_profiles table';
  RAISE NOTICE '✅ Authenticated users can now access their own company profiles';
END $$;
