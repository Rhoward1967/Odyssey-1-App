-- Verification Query: Check User-Organization Linkage
-- Run this in your Supabase SQL Editor to verify database linkage

-- Step 1: Check if your user exists in user_organizations table
SELECT
    uo.role,
    p.email,
    p.full_name,
    o.slug as organization_slug,
    uo.created_at
FROM public.user_organizations uo
LEFT JOIN public.profiles p ON p.id = uo.user_id
JOIN public.organizations o ON o.id = uo.organization_id
WHERE uo.user_id = 'eca49ca9-b4ae-4e0e-b78a-fa1811024781'::uuid; -- Your User ID

-- Step 2: Check all users in the acme organization
SELECT
    uo.user_id,
    uo.role,
    p.email,
    p.full_name
FROM public.user_organizations uo
LEFT JOIN public.profiles p ON p.id = uo.user_id
JOIN public.organizations o ON o.id = uo.organization_id
WHERE o.slug = 'acme'
ORDER BY uo.created_at;

-- Step 3: Check if your user exists in profiles table
SELECT 
    id,
    email,
    full_name,
    is_super_admin,
    created_at
FROM public.profiles 
WHERE id = 'eca49ca9-b4ae-4e0e-b78a-fa1811024781'::uuid;

-- Step 4: Check current RLS policies on feature_flags table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'feature_flags';