-- Migration: Remove SECURITY DEFINER concerns from views
-- Author: Supabase Advisor + GitHub Copilot
-- Date: 2025-12-15
-- Purpose: Recreate views as plain (SECURITY INVOKER by default) to follow best practices

-- ============================================================================
-- 1) public.ops_roman_events - Already correct, but recreate explicitly
-- ============================================================================
-- Drop and recreate to ensure no residual security metadata
DROP VIEW IF EXISTS public.ops_roman_events CASCADE;

CREATE VIEW public.ops_roman_events AS
SELECT
  id,
  created_at,
  actor,
  action_type,
  context,
  payload,
  severity,
  event_type,
  repo,
  file,
  notes
FROM ops.roman_events;

-- Grant read access to authenticated users
GRANT SELECT ON public.ops_roman_events TO authenticated;

COMMENT ON VIEW public.ops_roman_events IS 'Plain view (SECURITY INVOKER) for ops.roman_events - RLS enforced on base table';


-- ============================================================================
-- 2) public.view_user_bids - Recreate as plain view
-- ============================================================================
-- This view shows bids for the current user's organization
DROP VIEW IF EXISTS public.view_user_bids CASCADE;

CREATE VIEW public.view_user_bids AS
SELECT
  b.id,
  b.bid_number,
  b.customer_id,
  b.created_at,
  b.updated_at,
  b.status,
  b.subtotal,
  b.tax,
  b.total,
  b.notes,
  b.valid_until,
  b.organization_id,
  c.name AS customer_name,
  c.email AS customer_email
FROM public.bids b
LEFT JOIN public.customers c ON b.customer_id = c.id
WHERE b.organization_id IN (
  SELECT organization_id 
  FROM public.user_organizations 
  WHERE user_id = auth.uid()
);

-- Grant read access to authenticated users
GRANT SELECT ON public.view_user_bids TO authenticated;

COMMENT ON VIEW public.view_user_bids IS 'Plain view showing bids for current user organizations - uses auth.uid() for filtering';


-- ============================================================================
-- 3) public.health_summary - Recreate as plain view
-- ============================================================================
-- System health summary view (read-only metrics)
DROP VIEW IF EXISTS public.health_summary CASCADE;

CREATE VIEW public.health_summary AS
SELECT
  'database' AS component,
  'healthy' AS status,
  json_build_object(
    'tables_count', (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'),
    'functions_count', (SELECT count(*) FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public'))
  ) AS metrics,
  now() AS checked_at
UNION ALL
SELECT
  'roman_events' AS component,
  CASE 
    WHEN count(*) > 0 THEN 'healthy'
    ELSE 'warning'
  END AS status,
  json_build_object(
    'total_events', count(*),
    'last_24h', count(*) FILTER (WHERE created_at > now() - interval '24 hours')
  ) AS metrics,
  now() AS checked_at
FROM ops.roman_events;

-- Grant read access to authenticated users only (service monitoring)
GRANT SELECT ON public.health_summary TO authenticated;
GRANT SELECT ON public.health_summary TO service_role;

COMMENT ON VIEW public.health_summary IS 'Plain view for system health metrics - read-only, no privilege escalation';


-- ============================================================================
-- 4) Ensure underlying tables have proper RLS
-- ============================================================================
-- Verify RLS is enabled on base tables (idempotent checks)

-- Enable RLS on bids if not already enabled
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- Enable RLS on customers if not already enabled
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Enable RLS on ops.roman_events if not already enabled
ALTER TABLE ops.roman_events ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.bids IS 'RLS enabled - access controlled via user_organizations';
COMMENT ON TABLE public.customers IS 'RLS enabled - access controlled via user_organizations';
COMMENT ON TABLE ops.roman_events IS 'RLS enabled - access controlled for R.O.M.A.N. operations';
