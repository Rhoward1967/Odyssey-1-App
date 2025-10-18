-- ODYSSEY-1 Performance Index Optimization for RLS
-- Creates indexes to support fast RLS policy evaluation

-- Check what indexes currently exist on our RLS-critical columns
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'activity_logs', 'subscriptions', 'services')
    AND (indexdef ILIKE '%user_id%' OR indexdef ILIKE '%id%')
ORDER BY tablename, indexname;

-- ==================== 
-- PROFILES TABLE INDEXES
-- ====================

-- Primary key on id should already exist, but let's ensure it's optimal
-- (This supports: id = auth.uid() in RLS policies)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_id_auth 
ON profiles (id) 
WHERE id IS NOT NULL;

-- If profiles has user relationships, add composite index
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_user_lookup 
-- ON profiles (id, created_at) WHERE id IS NOT NULL;

-- ====================
-- ACTIVITY_LOGS TABLE INDEXES  
-- ====================

-- Critical: user_id index for RLS policy (user_id = auth.uid())
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_logs_user_id 
ON activity_logs (user_id) 
WHERE user_id IS NOT NULL;

-- Performance: user_id + created_at for time-based queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_logs_user_time 
ON activity_logs (user_id, created_at DESC) 
WHERE user_id IS NOT NULL;

-- ====================
-- SUBSCRIPTIONS TABLE INDEXES
-- ====================

-- Critical: user_id index for RLS policy (user_id = auth.uid())  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_user_id 
ON subscriptions (user_id) 
WHERE user_id IS NOT NULL;

-- Performance: user_id + status for active subscription lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_user_status 
ON subscriptions (user_id, status) 
WHERE user_id IS NOT NULL AND status IS NOT NULL;

-- Performance: Stripe subscription ID lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_stripe_id 
ON subscriptions (stripe_subscription_id) 
WHERE stripe_subscription_id IS NOT NULL;

-- ====================
-- SERVICES TABLE INDEXES (if needed)
-- ====================

-- If services table has user-specific data, add user_id index
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_user_id 
-- ON services (user_id) WHERE user_id IS NOT NULL;

-- Performance: active services lookup (for public access)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_active 
ON services (active, created_at DESC) 
WHERE active = true;

-- ====================
-- VERIFICATION
-- ====================

-- Show all indexes on our critical columns
SELECT 
    schemaname,
    tablename, 
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'activity_logs', 'subscriptions', 'services')
    AND (indexdef ILIKE '%user_id%' OR indexdef ILIKE '%id%' OR indexdef ILIKE '%active%')
ORDER BY tablename, indexname;

-- Check index usage statistics (run after some usage)
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as times_used,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'activity_logs', 'subscriptions', 'services')
ORDER BY tablename, times_used DESC;

SELECT 'RLS Performance Indexes Created Successfully!' as status;