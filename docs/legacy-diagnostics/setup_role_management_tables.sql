-- Create organizations and user_organizations tables if they don't exist
-- This sets up the role management data structure

-- 1. Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. Create user_organizations table for role management
CREATE TABLE IF NOT EXISTS public.user_organizations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'member',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id, organization_id)
);

-- 3. Enable RLS on both tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_organizations ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for organizations
DROP POLICY IF EXISTS "organizations_select_policy" ON public.organizations;
CREATE POLICY "organizations_select_policy" ON public.organizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_organizations 
            WHERE user_organizations.organization_id = organizations.id 
            AND user_organizations.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_super_admin = true
        )
    );

-- 5. Create RLS policies for user_organizations
DROP POLICY IF EXISTS "user_organizations_select_policy" ON public.user_organizations;
CREATE POLICY "user_organizations_select_policy" ON public.user_organizations
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_organizations AS uo2
            WHERE uo2.organization_id = user_organizations.organization_id
            AND uo2.user_id = auth.uid()
            AND uo2.role IN ('admin', 'owner', 'super-admin')
        ) OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_super_admin = true
        )
    );

-- 6. Grant permissions
GRANT SELECT ON public.organizations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;
GRANT ALL ON public.user_organizations TO service_role;

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_organizations_user_id ON public.user_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_org_id ON public.user_organizations(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_role ON public.user_organizations(role);

-- 8. Insert default organization if none exists
INSERT INTO public.organizations (id, name, description)
SELECT 
    '00000000-0000-0000-0000-000000000001'::uuid,
    'ODYSSEY-1 Default Organization',
    'Default organization for ODYSSEY-1 system users'
WHERE NOT EXISTS (SELECT 1 FROM public.organizations);

-- 9. Insert current user as super admin of default organization
-- We'll use a placeholder that needs to be replaced with actual user ID
INSERT INTO public.user_organizations (user_id, organization_id, role)
SELECT 
    'eca49ca0-b2b4-4ca0-9f46-a6d8f4f6df4e'::uuid, -- Replace with actual user ID
    '00000000-0000-0000-0000-000000000001'::uuid,
    'super-admin'
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_organizations 
    WHERE user_id = 'eca49ca0-b2b4-4ca0-9f46-a6d8f4f6df4e'::uuid
    AND organization_id = '00000000-0000-0000-0000-000000000001'::uuid
);

-- 10. Add some sample users for testing (optional)
-- These would be actual user IDs from your auth.users table
-- INSERT INTO public.user_organizations (user_id, organization_id, role)
-- VALUES 
--   ('user-id-2', '00000000-0000-0000-0000-000000000001', 'admin'),
--   ('user-id-3', '00000000-0000-0000-0000-000000000001', 'member');