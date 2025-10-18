-- Check Current RLS Policies Script
-- Run this in Supabase SQL Editor to see what policies exist

-- 1. Check all current policies
SELECT 
    schemaname,
    tablename, 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'activity_logs', 'subscriptions', 'services')
ORDER BY tablename, cmd, policyname;

-- 2. Count policies per table and action
SELECT 
    tablename,
    cmd,
    COUNT(*) as policy_count,
    array_agg(policyname) as policy_names
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'activity_logs', 'subscriptions', 'services')
GROUP BY tablename, cmd
HAVING COUNT(*) > 1  -- Only show duplicates
ORDER BY tablename, cmd;