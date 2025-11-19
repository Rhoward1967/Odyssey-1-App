-- Fix user_organizations table RLS policies
-- This table is critical for org-scoped access checks across the app

-- Enable RLS
ALTER TABLE public.user_organizations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "user_organizations_select" ON public.user_organizations;
DROP POLICY IF EXISTS "user_organizations_insert" ON public.user_organizations;
DROP POLICY IF EXISTS "user_organizations_update" ON public.user_organizations;
DROP POLICY IF EXISTS "user_organizations_delete" ON public.user_organizations;

-- Allow users to see their own organization memberships
CREATE POLICY "user_organizations_select"
ON public.user_organizations
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow users to insert their own memberships (for initial org creation)
CREATE POLICY "user_organizations_insert"
ON public.user_organizations
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Allow users to update their own memberships
CREATE POLICY "user_organizations_update"
ON public.user_organizations
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Allow users to delete their own memberships (leave organization)
CREATE POLICY "user_organizations_delete"
ON public.user_organizations
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Grant proper permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_organizations TO authenticated;
REVOKE ALL ON public.user_organizations FROM anon;

-- Add helpful comment
COMMENT ON TABLE public.user_organizations IS 'User-organization membership with role-based access';
COMMENT ON POLICY "user_organizations_select" ON public.user_organizations IS 'Users can view their own organization memberships';
