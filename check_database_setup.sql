-- Check existing organizations and user_organizations data
-- This script will help us understand what data we have

-- 1. Check if organizations table exists and view its data
SELECT 'Organizations table content:' as info;
SELECT * FROM public.organizations LIMIT 5;

-- 2. Check if user_organizations table exists and view its data  
SELECT 'User organizations table content:' as info;
SELECT * FROM public.user_organizations LIMIT 5;

-- 3. Check profiles table to see current users
SELECT 'Profiles table content:' as info;
SELECT id, email, full_name, is_super_admin FROM public.profiles LIMIT 5;

-- 4. If no organizations exist, we'll need to create one
-- First check if any exist
SELECT 'Organization count:' as info;
SELECT COUNT(*) as organization_count FROM public.organizations;