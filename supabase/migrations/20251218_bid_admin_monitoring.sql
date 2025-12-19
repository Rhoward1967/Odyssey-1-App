-- ============================================================================
-- BID-TO-INVOICE MINOR ENHANCEMENTS & ADMIN VIEWS
-- Optional improvements for monitoring and oversight
-- ============================================================================
-- Safe to run: Adds admin capabilities without breaking existing functionality
-- ============================================================================

-- ============================================================================
-- ENHANCEMENT 1: Admin Policy for Conversion Audit Oversight
-- ============================================================================

-- Allow app admins to view all conversion logs for oversight
CREATE POLICY "App admins can view all conversion logs"
  ON public.bid_conversion_audit
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.app_admins
      WHERE user_id = auth.uid()
      AND is_active = true
    )
  );

COMMENT ON POLICY "App admins can view all conversion logs" 
  ON public.bid_conversion_audit IS 
  'Allows active app admins to view all conversion logs for oversight and compliance monitoring';

-- ============================================================================
-- ENHANCEMENT 2: Comprehensive Admin Dashboard View
-- ============================================================================

-- Create a SECURITY DEFINER view for admin oversight
-- Shows full conversion details with customer info
CREATE OR REPLACE VIEW public.view_admin_conversion_dashboard 
WITH (security_invoker = false) AS
SELECT 
    -- Conversion timing
    a.id as audit_id,
    a.converted_at,
    a.conversion_duration_ms,
    
    -- Bid details
    b.id as bid_id,
    b.bid_number,
    b.title as bid_title,
    b.status as bid_status,
    b.total_cents as bid_total_cents,
    
    -- Invoice details
    i.id as invoice_id,
    i.invoice_number,
    i.status as invoice_status,
    i.total_cents as invoice_total_cents,
    
    -- Customer info
    c.id as customer_id,
    c.customer_name,
    c.company_name,
    c.email as customer_email,
    
    -- User info
    u.email as user_email,
    u.id as user_id,
    
    -- Validation
    a.line_items_count,
    CASE 
        WHEN a.bid_total_cents = a.invoice_total_cents THEN '✅ Match'
        ELSE '⚠️ Mismatch: ' || (a.invoice_total_cents - a.bid_total_cents)::text || ' cents'
    END as total_validation,
    
    -- Performance
    CASE 
        WHEN a.conversion_duration_ms < 100 THEN '🚀 Fast'
        WHEN a.conversion_duration_ms < 500 THEN '✅ Normal'
        ELSE '⚠️ Slow'
    END as performance_rating,
    
    -- Metadata
    a.ip_address,
    a.user_agent
    
FROM public.bid_conversion_audit a
JOIN public.bids b ON a.bid_id = b.id
JOIN public.invoices i ON a.invoice_id = i.id
LEFT JOIN public.customers c ON b.customer_id = c.id
LEFT JOIN auth.users u ON a.user_id = u.id
ORDER BY a.converted_at DESC;

-- Grant SELECT to app_admins via RLS
ALTER VIEW public.view_admin_conversion_dashboard OWNER TO postgres;

-- Create RLS-enabled wrapper for app_admins
CREATE OR REPLACE FUNCTION public.get_conversion_dashboard(
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    audit_id uuid,
    converted_at timestamptz,
    conversion_duration_ms integer,
    bid_id uuid,
    bid_number text,
    bid_title text,
    bid_status text,
    bid_total_cents bigint,
    invoice_id uuid,
    invoice_number text,
    invoice_status text,
    invoice_total_cents bigint,
    customer_id uuid,
    customer_name text,
    company_name text,
    customer_email text,
    user_email text,
    user_id uuid,
    line_items_count integer,
    total_validation text,
    performance_rating text,
    ip_address inet,
    user_agent text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if user is an app admin
    IF NOT EXISTS (
        SELECT 1 FROM public.app_admins
        WHERE user_id = auth.uid()
        AND is_active = true
    ) THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;
    
    -- Return dashboard data
    RETURN QUERY
    SELECT * FROM public.view_admin_conversion_dashboard
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

COMMENT ON FUNCTION public.get_conversion_dashboard(INTEGER, INTEGER) IS 
'Admin-only function: Returns comprehensive conversion dashboard with customer and user details';

-- ============================================================================
-- ENHANCEMENT 3: Conversion Statistics View
-- ============================================================================

CREATE OR REPLACE VIEW public.view_conversion_statistics AS
SELECT 
    -- Daily stats
    DATE(converted_at) as conversion_date,
    COUNT(*) as total_conversions,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT customer_id) as unique_customers,
    
    -- Financial totals (in cents)
    SUM(bid_total_cents) as total_bid_value_cents,
    SUM(invoice_total_cents) as total_invoice_value_cents,
    AVG(bid_total_cents) as avg_bid_value_cents,
    
    -- Validation
    COUNT(CASE WHEN bid_total_cents = invoice_total_cents THEN 1 END) as validated_conversions,
    COUNT(CASE WHEN bid_total_cents != invoice_total_cents THEN 1 END) as mismatched_conversions,
    
    -- Performance
    AVG(conversion_duration_ms) as avg_duration_ms,
    MIN(conversion_duration_ms) as fastest_ms,
    MAX(conversion_duration_ms) as slowest_ms,
    
    -- Line items
    AVG(line_items_count) as avg_line_items,
    MAX(line_items_count) as max_line_items
    
FROM public.bid_conversion_audit
WHERE user_id = auth.uid() -- Users see their own stats
GROUP BY DATE(converted_at)
ORDER BY conversion_date DESC;

COMMENT ON VIEW public.view_conversion_statistics IS 
'Daily conversion statistics per user. Shows volume, value, validation, and performance metrics';

-- ============================================================================
-- ENHANCEMENT 4: Real-time Conversion Monitoring Helper
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_recent_conversions(
    p_hours INTEGER DEFAULT 24,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    converted_at timestamptz,
    bid_number text,
    invoice_number text,
    customer_name text,
    total_cents bigint,
    duration_ms integer,
    validation_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.converted_at,
        b.bid_number,
        i.invoice_number,
        c.customer_name,
        a.bid_total_cents as total_cents,
        a.conversion_duration_ms as duration_ms,
        CASE 
            WHEN a.bid_total_cents = a.invoice_total_cents THEN '✅'
            ELSE '⚠️'
        END as validation_status
    FROM public.bid_conversion_audit a
    JOIN public.bids b ON a.bid_id = b.id
    JOIN public.invoices i ON a.invoice_id = i.id
    LEFT JOIN public.customers c ON b.customer_id = c.id
    WHERE a.user_id = auth.uid()
      AND a.converted_at > NOW() - (p_hours || ' hours')::INTERVAL
    ORDER BY a.converted_at DESC
    LIMIT p_limit;
END;
$$;

COMMENT ON FUNCTION public.get_recent_conversions(INTEGER, INTEGER) IS 
'Returns recent conversions for current user. Default: last 24 hours, max 20 records';

-- ============================================================================
-- ENHANCEMENT 5: Sanity Check Queries (Embedded as Functions)
-- ============================================================================

-- Check for duplicate conversion attempts (should be blocked by unique indexes)
CREATE OR REPLACE FUNCTION public.check_duplicate_conversions()
RETURNS TABLE (
    bid_id uuid,
    conversion_count bigint,
    invoice_ids uuid[]
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        bid_id,
        COUNT(*) as conversion_count,
        ARRAY_AGG(invoice_id) as invoice_ids
    FROM public.bid_conversion_audit
    GROUP BY bid_id
    HAVING COUNT(*) > 1;
$$;

COMMENT ON FUNCTION public.check_duplicate_conversions() IS 
'Sanity check: Returns bids that were converted multiple times (should be impossible with unique indexes)';

-- Verify totals match between bids and invoices
CREATE OR REPLACE FUNCTION public.check_conversion_integrity()
RETURNS TABLE (
    audit_id uuid,
    bid_id uuid,
    invoice_id uuid,
    bid_total bigint,
    invoice_total bigint,
    difference bigint,
    converted_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        a.id as audit_id,
        a.bid_id,
        a.invoice_id,
        a.bid_total_cents as bid_total,
        a.invoice_total_cents as invoice_total,
        (a.invoice_total_cents - a.bid_total_cents) as difference,
        a.converted_at
    FROM public.bid_conversion_audit a
    WHERE a.bid_total_cents != a.invoice_total_cents
    ORDER BY a.converted_at DESC;
$$;

COMMENT ON FUNCTION public.check_conversion_integrity() IS 
'Sanity check: Returns conversions where bid and invoice totals do not match';

-- ============================================================================
-- ENHANCEMENT 6: Conversion Summary Function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_conversion_summary()
RETURNS TABLE (
    metric_name text,
    metric_value text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_total_conversions bigint;
    v_total_value_cents bigint;
    v_avg_duration_ms numeric;
    v_validation_rate numeric;
BEGIN
    -- Get user's conversion stats
    SELECT 
        COUNT(*),
        SUM(bid_total_cents),
        AVG(conversion_duration_ms),
        (COUNT(CASE WHEN bid_total_cents = invoice_total_cents THEN 1 END)::numeric / 
         NULLIF(COUNT(*), 0) * 100)
    INTO 
        v_total_conversions,
        v_total_value_cents,
        v_avg_duration_ms,
        v_validation_rate
    FROM public.bid_conversion_audit
    WHERE user_id = auth.uid();
    
    -- Return formatted results
    RETURN QUERY
    SELECT 'Total Conversions'::text, COALESCE(v_total_conversions::text, '0');
    
    RETURN QUERY
    SELECT 'Total Value'::text, 
           '$' || (COALESCE(v_total_value_cents, 0) / 100.0)::numeric(10,2)::text;
    
    RETURN QUERY
    SELECT 'Avg Duration'::text, 
           ROUND(COALESCE(v_avg_duration_ms, 0), 0)::text || ' ms';
    
    RETURN QUERY
    SELECT 'Validation Rate'::text, 
           ROUND(COALESCE(v_validation_rate, 100), 1)::text || '%';
END;
$$;

COMMENT ON FUNCTION public.get_conversion_summary() IS 
'Returns summary statistics for current user: conversions, value, performance, validation';

-- ============================================================================
-- VERIFICATION & SUMMARY
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ ADMIN ENHANCEMENTS DEPLOYED';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    
    RAISE NOTICE '🔑 Admin Capabilities:';
    RAISE NOTICE '   • get_conversion_dashboard() - Full oversight view';
    RAISE NOTICE '   • view_admin_conversion_dashboard - Comprehensive details';
    RAISE NOTICE '   • App admin policy for audit logs';
    RAISE NOTICE '';
    
    RAISE NOTICE '📊 User Views & Functions:';
    RAISE NOTICE '   • view_conversion_statistics - Daily metrics';
    RAISE NOTICE '   • get_recent_conversions() - Last 24 hours';
    RAISE NOTICE '   • get_conversion_summary() - Quick stats';
    RAISE NOTICE '';
    
    RAISE NOTICE '🔍 Sanity Check Functions:';
    RAISE NOTICE '   • check_duplicate_conversions() - Should return 0 rows';
    RAISE NOTICE '   • check_conversion_integrity() - Should return 0 rows';
    RAISE NOTICE '';
    
    RAISE NOTICE '📋 Quick Test Queries:';
    RAISE NOTICE '   SELECT * FROM get_conversion_summary();';
    RAISE NOTICE '   SELECT * FROM get_recent_conversions(24, 10);';
    RAISE NOTICE '   SELECT * FROM view_conversion_statistics;';
    RAISE NOTICE '';
    RAISE NOTICE '🔒 Admin Only (requires app_admins role):';
    RAISE NOTICE '   SELECT * FROM get_conversion_dashboard(50, 0);';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 System ready for production monitoring!';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '';
END $$;
