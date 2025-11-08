-- ========================================
-- COMPLETE INDEX MIGRATION
-- Combined: Claude Analysis + Supabase Recommendations
-- January 8, 2025 - Infrastructure Audit
-- ========================================
-- SAFETY: All indexes use CONCURRENTLY for zero-downtime creation
-- ========================================

-- ========================================
-- ORGANIZATION SCOPING (MOST CRITICAL!)
-- ========================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_employees_org_id 
ON public.employees(organization_id) 
WHERE organization_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payroll_runs_org_id 
ON public.payroll_runs(organization_id) 
WHERE organization_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_paystubs_org_id 
ON public.paystubs(organization_id) 
WHERE organization_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bids_org_id 
ON public.bids(organization_id) 
WHERE organization_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_spending_categories_org_id 
ON public.spending_categories(organization_id) 
WHERE organization_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_messages_org_id 
ON public.chat_messages(organization_id) 
WHERE organization_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feature_flags_org_id 
ON public.feature_flags(organization_id);

-- ========================================
-- USER LOOKUPS (VERY COMMON!)
-- ========================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_time_entries_employee_id 
ON public.time_entries(employee_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_roman_commands_user_id 
ON public.roman_commands(user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_messages_user_id 
ON public.chat_messages(user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_employees_user_id 
ON public.employees(user_id) 
WHERE user_id IS NOT NULL;

-- ========================================
-- USER_ORGANIZATIONS (CRITICAL FOR RLS!)
-- Supabase Recommendation: Composite index
-- ========================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_org_user_org 
ON public.user_organizations(user_id, organization_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_orgs_user_id 
ON public.user_organizations(user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_orgs_org_id 
ON public.user_organizations(organization_id);

-- ========================================
-- FOREIGN KEY INDEXES
-- ========================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_paystubs_employee_id 
ON public.paystubs(employee);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_employee_schedules_employee_id 
ON public.employee_schedules(employee_id);

-- ========================================
-- DATE-BASED QUERIES (COMMON!)
-- ========================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_time_entries_clock_in 
ON public.time_entries(clock_in) 
WHERE clock_in IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_time_entries_dates 
ON public.time_entries(clock_in, clock_out) 
WHERE clock_in IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payroll_runs_period 
ON public.payroll_runs(period_start, period_end);

-- ========================================
-- TIMESTAMP INDEXES (Supabase Addition)
-- ========================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_messages_created_at 
ON public.chat_messages(created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_roman_commands_created_at 
ON public.roman_commands(created_at);

-- ========================================
-- FULL-TEXT SEARCH (CRITICAL!)
-- Supabase Confirmed Missing
-- ========================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_books_search_vector 
ON public.books USING gin(search_vector);

-- ========================================
-- STATUS-BASED QUERIES
-- ========================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_time_entries_status 
ON public.time_entries(status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_paystubs_status 
ON public.paystubs(status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payroll_runs_status 
ON public.payroll_runs(status);

-- ========================================
-- COMPOSITE INDEXES (COMMON QUERY PATTERNS)
-- ========================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_time_entries_emp_status 
ON public.time_entries(employee_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_employees_org_status 
ON public.employees(organization_id, status) 
WHERE organization_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_roman_commands_user_org 
ON public.roman_commands(user_id, organization_id, created_at);

-- ========================================
-- VERIFICATION QUERY
-- Run after migration to confirm all indexes created
-- ========================================

DO $$
BEGIN
  RAISE NOTICE 'Index migration complete. Verifying...';
END$$;

SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
  AND tablename IN (
    'employees', 'payroll_runs', 'paystubs', 'time_entries',
    'user_organizations', 'chat_messages', 'roman_commands',
    'books', 'bids', 'feature_flags', 'spending_categories'
  )
ORDER BY tablename, indexname;
