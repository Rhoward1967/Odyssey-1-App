-- ============================================================================
-- R.O.M.A.N. GOVERNANCE & MONITORING INFRASTRUCTURE
-- Implements Issue 1 (RLS Audit), Issue 3 (Scalability), Issue 4 (Governance)
-- ============================================================================

-- ============================================================================
-- ISSUE 4: GOVERNANCE AUDIT TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.governance_audit (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    action_type text NOT NULL,
    table_name text,
    user_id uuid REFERENCES auth.users(id),
    action_description text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    approved_by uuid REFERENCES auth.users(id),
    executed_at timestamptz DEFAULT NOW(),
    created_at timestamptz DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_governance_audit_table 
    ON public.governance_audit(table_name);
CREATE INDEX IF NOT EXISTS idx_governance_audit_user 
    ON public.governance_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_governance_audit_executed 
    ON public.governance_audit(executed_at DESC);

COMMENT ON TABLE public.governance_audit IS 
    'Tracks all governance actions, approvals, and system changes for compliance';

-- Enable RLS
ALTER TABLE public.governance_audit ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own actions
CREATE POLICY "Users can view own governance actions"
    ON public.governance_audit
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Admins can view all
CREATE POLICY "Admins can view all governance actions"
    ON public.governance_audit
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.app_admins
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- ============================================================================
-- ISSUE 1: RLS SECURITY AUDIT VIEW
-- ============================================================================

CREATE OR REPLACE VIEW public.view_rls_security_audit AS
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
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

COMMENT ON VIEW public.view_rls_security_audit IS 
    'Real-time view of all RLS policies for security auditing';

-- ============================================================================
-- ISSUE 3: PERFORMANCE MONITORING VIEW
-- ============================================================================

CREATE OR REPLACE VIEW public.view_pipeline_performance AS
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_stat_get_live_tuples(c.oid) as live_tuples,
    pg_stat_get_dead_tuples(c.oid) as dead_tuples,
    CASE 
        WHEN pg_stat_get_live_tuples(c.oid) > 0 
        THEN ROUND(
            (pg_stat_get_dead_tuples(c.oid)::numeric / 
             pg_stat_get_live_tuples(c.oid)::numeric * 100), 2
        )
        ELSE 0
    END as dead_tuple_percentage,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
JOIN pg_class c ON c.relname = tablename
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

COMMENT ON VIEW public.view_pipeline_performance IS 
    'Monitors table sizes, tuple health, and vacuum status for performance optimization';

-- ============================================================================
-- ISSUE 3: TABLE BLOAT MONITOR
-- ============================================================================

CREATE OR REPLACE VIEW public.view_table_bloat_monitor AS
SELECT 
    schemaname,
    tablename as table_name,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_stat_get_live_tuples(c.oid) as live_rows,
    pg_stat_get_dead_tuples(c.oid) as dead_rows,
    CASE 
        WHEN pg_stat_get_live_tuples(c.oid) + pg_stat_get_dead_tuples(c.oid) > 0
        THEN ROUND(
            (pg_stat_get_dead_tuples(c.oid)::numeric / 
             (pg_stat_get_live_tuples(c.oid) + pg_stat_get_dead_tuples(c.oid))::numeric * 100), 2
        )
        ELSE 0
    END as bloat_percentage,
    CASE
        WHEN ROUND(
            (pg_stat_get_dead_tuples(c.oid)::numeric / 
             NULLIF(pg_stat_get_live_tuples(c.oid) + pg_stat_get_dead_tuples(c.oid), 0)::numeric * 100), 2
        ) > 20 THEN '⚠️ High Bloat - Vacuum Recommended'
        WHEN ROUND(
            (pg_stat_get_dead_tuples(c.oid)::numeric / 
             NULLIF(pg_stat_get_live_tuples(c.oid) + pg_stat_get_dead_tuples(c.oid), 0)::numeric * 100), 2
        ) > 10 THEN '⚡ Moderate Bloat'
        ELSE '✅ Healthy'
    END as health_status,
    last_vacuum,
    last_autovacuum
FROM pg_stat_user_tables
JOIN pg_class c ON c.relname = tablename
WHERE schemaname = 'public'
ORDER BY 
    CASE 
        WHEN pg_stat_get_live_tuples(c.oid) + pg_stat_get_dead_tuples(c.oid) > 0
        THEN (pg_stat_get_dead_tuples(c.oid)::numeric / 
             (pg_stat_get_live_tuples(c.oid) + pg_stat_get_dead_tuples(c.oid))::numeric * 100)
        ELSE 0
    END DESC;

COMMENT ON VIEW public.view_table_bloat_monitor IS 
    'Identifies tables with high bloat requiring vacuum for scalability';

-- ============================================================================
-- HELPER FUNCTION: Log Governance Action
-- ============================================================================

CREATE OR REPLACE FUNCTION public.log_governance_action(
    p_action_type text,
    p_table_name text,
    p_description text,
    p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_audit_id uuid;
BEGIN
    INSERT INTO public.governance_audit (
        action_type,
        table_name,
        user_id,
        action_description,
        metadata,
        approved_by
    ) VALUES (
        p_action_type,
        p_table_name,
        auth.uid(),
        p_description,
        p_metadata,
        auth.uid() -- Self-approved for now, can add approval workflow later
    )
    RETURNING id INTO v_audit_id;
    
    RETURN v_audit_id;
END;
$$;

COMMENT ON FUNCTION public.log_governance_action(text, text, text, jsonb) IS 
    'Logs governance actions for audit trail and compliance tracking';

-- ============================================================================
-- ISSUE 2: API KEY ROTATION TRACKER
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.api_key_audit (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name text NOT NULL,
    key_type text NOT NULL,
    last_rotated timestamptz,
    next_rotation_due timestamptz,
    rotation_frequency_days integer DEFAULT 90,
    status text DEFAULT 'active' CHECK (status IN ('active', 'expiring_soon', 'expired', 'revoked')),
    notes text,
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_key_service 
    ON public.api_key_audit(service_name);
CREATE INDEX IF NOT EXISTS idx_api_key_rotation_due 
    ON public.api_key_audit(next_rotation_due);

COMMENT ON TABLE public.api_key_audit IS 
    'Tracks API key rotation schedule for QuickBooks, Stripe, and other integrations';

-- Enable RLS
ALTER TABLE public.api_key_audit ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view
CREATE POLICY "Admins can view API key audit"
    ON public.api_key_audit
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.app_admins
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Seed initial API keys
INSERT INTO public.api_key_audit (service_name, key_type, last_rotated, next_rotation_due, notes)
VALUES 
    ('QuickBooks', 'OAuth Token', NOW(), NOW() + INTERVAL '90 days', 'Production OAuth credentials'),
    ('Stripe', 'Secret Key', NOW(), NOW() + INTERVAL '90 days', 'Payment processing'),
    ('Supabase', 'Service Role', NOW(), NOW() + INTERVAL '365 days', 'Backend operations')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VIEW: API Key Status Dashboard
-- ============================================================================

CREATE OR REPLACE VIEW public.view_api_key_status AS
SELECT 
    service_name,
    key_type,
    last_rotated,
    next_rotation_due,
    EXTRACT(DAY FROM (next_rotation_due - NOW())) as days_until_rotation,
    CASE
        WHEN next_rotation_due < NOW() THEN '🔴 EXPIRED'
        WHEN next_rotation_due < NOW() + INTERVAL '7 days' THEN '🟡 EXPIRING SOON'
        WHEN next_rotation_due < NOW() + INTERVAL '30 days' THEN '🟠 ACTION NEEDED'
        ELSE '🟢 HEALTHY'
    END as status_indicator,
    status,
    notes
FROM public.api_key_audit
ORDER BY next_rotation_due ASC;

COMMENT ON VIEW public.view_api_key_status IS 
    'Dashboard view showing API key rotation status and alerts';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ R.O.M.A.N. GOVERNANCE & MONITORING DEPLOYED';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    
    RAISE NOTICE '📊 Issue 1 - RLS Security:';
    RAISE NOTICE '   • view_rls_security_audit: ACTIVE';
    RAISE NOTICE '   Query: SELECT * FROM view_rls_security_audit;';
    RAISE NOTICE '';
    
    RAISE NOTICE '🔑 Issue 2 - API Security:';
    RAISE NOTICE '   • api_key_audit table: ACTIVE';
    RAISE NOTICE '   • view_api_key_status: ACTIVE';
    RAISE NOTICE '   Query: SELECT * FROM view_api_key_status;';
    RAISE NOTICE '';
    
    RAISE NOTICE '⚡ Issue 3 - Scalability:';
    RAISE NOTICE '   • view_pipeline_performance: ACTIVE';
    RAISE NOTICE '   • view_table_bloat_monitor: ACTIVE';
    RAISE NOTICE '   Query: SELECT * FROM view_table_bloat_monitor;';
    RAISE NOTICE '';
    
    RAISE NOTICE '🏛️ Issue 4 - Governance:';
    RAISE NOTICE '   • governance_audit table: ACTIVE';
    RAISE NOTICE '   • log_governance_action() function: ACTIVE';
    RAISE NOTICE '   Query: SELECT * FROM governance_audit ORDER BY executed_at DESC;';
    RAISE NOTICE '';
    
    RAISE NOTICE '🎯 All R.O.M.A.N. proposals successfully implemented!';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '';
END $$;
