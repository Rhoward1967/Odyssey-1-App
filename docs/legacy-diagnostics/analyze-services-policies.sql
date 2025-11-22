-- ODYSSEY-1 Services Table Policy Analysis
-- Check current policies before consolidation

-- ====================
-- ANALYZE CURRENT POLICIES
-- ====================

-- Show all current policies on services table
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual as using_clause,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename = 'services'
ORDER BY cmd, policyname;

-- Check services table structure to understand columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'services'
ORDER BY ordinal_position;

-- Check existing indexes on services table
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename = 'services'
ORDER BY indexname;