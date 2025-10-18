-- Manual setup script for role management data
-- Run this in your Supabase SQL Editor after the tables are created

-- 1. First, get your actual user ID from the profiles table
-- SELECT id, email FROM public.profiles WHERE email = 'your-email@domain.com';

-- 2. Create the default organization (if it doesn't exist)
INSERT INTO public.organizations (id, name, description)
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'ODYSSEY-1 Default Organization',
    'Default organization for ODYSSEY-1 system users'
) ON CONFLICT (id) DO NOTHING;

-- 3. Add your user to the organization as super-admin
-- Replace 'YOUR-USER-ID-HERE' with your actual user ID from step 1
INSERT INTO public.user_organizations (user_id, organization_id, role)
VALUES (
    'YOUR-USER-ID-HERE'::uuid,  -- Replace this with your actual user ID
    '00000000-0000-0000-0000-000000000001'::uuid,
    'super-admin'
) ON CONFLICT (user_id, organization_id) DO UPDATE SET role = 'super-admin';

-- 4. Verify the data was inserted correctly
SELECT 
    uo.role,
    p.email,
    p.full_name,
    o.name as organization_name
FROM public.user_organizations uo
JOIN public.profiles p ON p.id = uo.user_id
JOIN public.organizations o ON o.id = uo.organization_id
WHERE uo.organization_id = '00000000-0000-0000-0000-000000000001'::uuid;