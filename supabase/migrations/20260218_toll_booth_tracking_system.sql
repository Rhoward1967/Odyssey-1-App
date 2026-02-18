-- ═══════════════════════════════════════════════════════════════════
-- TOLL BOOTH TRACKING SYSTEM
-- Date: February 18, 2026
-- Purpose: Track three-tier sovereign revenue distribution
-- ═══════════════════════════════════════════════════════════════════
--
-- THE THREE TOLL BOOTHS:
-- 1. Admin Fee (5%) - Overhead recovery → HJS Operations
-- 2. Mastery Tax (35%) - Royalty → Trust (Truist account)
-- 3. Compliance Tax (1.8-3%) - Annual rate escalation
--
-- ═══════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════
-- TABLE: Monthly Revenue Tracking
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.hjs_monthly_revenue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Period tracking
    month_year DATE NOT NULL, -- First day of month (e.g., 2026-03-01)

    -- Customer info
    customer_name TEXT NOT NULL,
    customer_id TEXT, -- QuickBooks customer ID (optional)

    -- Revenue breakdown
    gross_revenue NUMERIC(10, 2) NOT NULL,
    admin_fee_5pct NUMERIC(10, 2) GENERATED ALWAYS AS (gross_revenue * 0.05) STORED,
    net_after_admin NUMERIC(10, 2) GENERATED ALWAYS AS (gross_revenue * 0.95) STORED,
    mastery_tax_35pct NUMERIC(10, 2) GENERATED ALWAYS AS (gross_revenue * 0.95 * 0.35) STORED,
    net_operations_60pct NUMERIC(10, 2) GENERATED ALWAYS AS (gross_revenue * 0.95 * 0.65) STORED,

    -- Transfer tracking
    mastery_tax_transferred BOOLEAN DEFAULT false,
    transfer_date DATE,
    transfer_confirmation TEXT, -- Bank confirmation number

    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    UNIQUE(month_year, customer_name)
);

CREATE INDEX IF NOT EXISTS idx_hjs_revenue_month ON public.hjs_monthly_revenue(month_year DESC);
CREATE INDEX IF NOT EXISTS idx_hjs_revenue_customer ON public.hjs_monthly_revenue(customer_name);
CREATE INDEX IF NOT EXISTS idx_hjs_revenue_transfer ON public.hjs_monthly_revenue(mastery_tax_transferred);

COMMENT ON TABLE public.hjs_monthly_revenue IS
    'Tracks monthly revenue per customer with automatic toll booth calculations';

-- ═══════════════════════════════════════════════════════════════════
-- TABLE: Mastery Tax Transfer Log
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.mastery_tax_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Period
    month_year DATE NOT NULL,

    -- Transfer details
    total_mastery_tax NUMERIC(10, 2) NOT NULL,
    transfer_date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Account details
    source_account TEXT DEFAULT 'Peach State FCU',
    destination_account TEXT DEFAULT 'Truist Trust Account',
    confirmation_number TEXT,

    -- Debt application
    applied_to_350k_debt BOOLEAN DEFAULT true,
    debt_balance_before NUMERIC(10, 2),
    debt_balance_after NUMERIC(10, 2),

    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(month_year)
);

CREATE INDEX IF NOT EXISTS idx_mastery_transfers_date ON public.mastery_tax_transfers(transfer_date DESC);

COMMENT ON TABLE public.mastery_tax_transfers IS
    'Logs monthly Mastery Tax transfers from Peach State FCU to Truist Trust account';

-- ═══════════════════════════════════════════════════════════════════
-- TABLE: Annual Compliance Tax (Rate Increases)
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.annual_rate_increases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Customer
    customer_name TEXT NOT NULL,

    -- Rate history
    effective_year INTEGER NOT NULL, -- e.g., 2027
    previous_rate NUMERIC(10, 2) NOT NULL,
    increase_percent NUMERIC(5, 2) NOT NULL, -- e.g., 2.50 for 2.5%
    new_rate NUMERIC(10, 2) NOT NULL,

    -- Impact calculations
    estimated_annual_visits INTEGER,
    estimated_annual_revenue_increase NUMERIC(10, 2),

    -- Customer notification
    notification_sent BOOLEAN DEFAULT false,
    notification_date DATE,
    customer_accepted BOOLEAN,
    acceptance_date DATE,

    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(customer_name, effective_year)
);

CREATE INDEX IF NOT EXISTS idx_rate_increases_year ON public.annual_rate_increases(effective_year DESC);
CREATE INDEX IF NOT EXISTS idx_rate_increases_customer ON public.annual_rate_increases(customer_name);

COMMENT ON TABLE public.annual_rate_increases IS
    'Tracks annual Compliance Tax (1.8-3% rate increases) per customer';

-- ═══════════════════════════════════════════════════════════════════
-- TABLE: 5-Week Month Revenue Tracking
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.five_week_month_revenue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Month identification
    month_year DATE NOT NULL, -- First day of 5-week month
    month_name TEXT NOT NULL, -- 'May 2026', 'August 2026', 'October 2026'

    -- Customer
    customer_name TEXT NOT NULL,

    -- Visit tracking
    standard_visits INTEGER NOT NULL,
    extra_visits INTEGER NOT NULL,
    rate_per_visit NUMERIC(10, 2) NOT NULL,

    -- Revenue calculations
    extra_revenue NUMERIC(10, 2) GENERATED ALWAYS AS (extra_visits * rate_per_visit) STORED,
    admin_fee_5pct NUMERIC(10, 2) GENERATED ALWAYS AS (extra_visits * rate_per_visit * 0.05) STORED,
    mastery_tax_35pct NUMERIC(10, 2) GENERATED ALWAYS AS (extra_visits * rate_per_visit * 0.95 * 0.35) STORED,
    net_operations NUMERIC(10, 2) GENERATED ALWAYS AS (extra_visits * rate_per_visit * 0.95 * 0.65) STORED,

    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(month_year, customer_name)
);

CREATE INDEX IF NOT EXISTS idx_five_week_month ON public.five_week_month_revenue(month_year);

COMMENT ON TABLE public.five_week_month_revenue IS
    'Tracks extra revenue opportunities during 5-week months (May, August, October)';

-- ═══════════════════════════════════════════════════════════════════
-- TABLE: Capacity Monitoring
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.capacity_monitoring (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Period
    week_starting DATE NOT NULL,

    -- Capacity metrics
    available_labor_hours NUMERIC(5, 1) NOT NULL,
    committed_hours NUMERIC(5, 1) NOT NULL,
    utilization_rate NUMERIC(5, 2) GENERATED ALWAYS AS (
        CASE
            WHEN available_labor_hours > 0
            THEN (committed_hours / available_labor_hours * 100)
            ELSE 0
        END
    ) STORED,

    -- Status determination
    status TEXT GENERATED ALWAYS AS (
        CASE
            WHEN (committed_hours / NULLIF(available_labor_hours, 0) * 100) >= 95 THEN 'EXTREME MODE'
            WHEN (committed_hours / NULLIF(available_labor_hours, 0) * 100) >= 85 THEN 'APPROACHING'
            ELSE 'NORMAL'
        END
    ) STORED,

    -- Pricing multiplier
    pricing_multiplier NUMERIC(3, 2) GENERATED ALWAYS AS (
        CASE
            WHEN (committed_hours / NULLIF(available_labor_hours, 0) * 100) >= 95 THEN 1.50
            ELSE 1.00
        END
    ) STORED,

    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(week_starting)
);

CREATE INDEX IF NOT EXISTS idx_capacity_week ON public.capacity_monitoring(week_starting DESC);

COMMENT ON TABLE public.capacity_monitoring IS
    'Tracks weekly capacity utilization and triggers Extreme Bidding Mode at 95%';

-- ═══════════════════════════════════════════════════════════════════
-- VIEW: Monthly Toll Booth Summary
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW public.view_toll_booth_monthly_summary AS
SELECT
    month_year,
    TO_CHAR(month_year, 'Month YYYY') as month_name,
    COUNT(DISTINCT customer_name) as customer_count,
    SUM(gross_revenue) as total_gross_revenue,
    SUM(admin_fee_5pct) as total_admin_fee,
    SUM(net_after_admin) as total_net_after_admin,
    SUM(mastery_tax_35pct) as total_mastery_tax,
    SUM(net_operations_60pct) as total_net_operations,
    COUNT(*) FILTER (WHERE mastery_tax_transferred = true) as transfers_completed,
    COUNT(*) FILTER (WHERE mastery_tax_transferred = false) as transfers_pending
FROM public.hjs_monthly_revenue
GROUP BY month_year
ORDER BY month_year DESC;

COMMENT ON VIEW public.view_toll_booth_monthly_summary IS
    'Aggregated monthly toll booth performance across all customers';

-- ═══════════════════════════════════════════════════════════════════
-- VIEW: Current Month Dashboard
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW public.view_current_month_dashboard AS
SELECT
    customer_name,
    gross_revenue,
    admin_fee_5pct,
    mastery_tax_35pct,
    net_operations_60pct,
    mastery_tax_transferred,
    transfer_date,
    CASE
        WHEN mastery_tax_transferred THEN '✅ Transferred'
        ELSE '⏳ Pending'
    END as transfer_status
FROM public.hjs_monthly_revenue
WHERE month_year = DATE_TRUNC('month', CURRENT_DATE)
ORDER BY customer_name;

COMMENT ON VIEW public.view_current_month_dashboard IS
    'Real-time view of current month toll booth tracking';

-- ═══════════════════════════════════════════════════════════════════
-- VIEW: Debt Payoff Tracker
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW public.view_350k_debt_payoff AS
SELECT
    month_year,
    TO_CHAR(month_year, 'Month YYYY') as month_name,
    total_mastery_tax as payment_amount,
    debt_balance_before,
    debt_balance_after,
    (debt_balance_before - debt_balance_after) as debt_reduction,
    transfer_date,
    confirmation_number
FROM public.mastery_tax_transfers
ORDER BY month_year DESC;

COMMENT ON VIEW public.view_350k_debt_payoff IS
    'Tracks $350k debt payoff progress from HJS to Odyssey-1';

-- ═══════════════════════════════════════════════════════════════════
-- VIEW: 5-Week Month Opportunities
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW public.view_five_week_opportunities AS
SELECT
    month_name,
    COUNT(DISTINCT customer_name) as customers_affected,
    SUM(extra_visits) as total_extra_visits,
    SUM(extra_revenue) as total_extra_revenue,
    SUM(admin_fee_5pct) as total_admin_fee,
    SUM(mastery_tax_35pct) as total_mastery_tax,
    SUM(net_operations) as total_net_operations
FROM public.five_week_month_revenue
GROUP BY month_name, month_year
ORDER BY month_year;

COMMENT ON VIEW public.view_five_week_opportunities IS
    'Summary of extra revenue from 5-week months (May, August, October)';

-- ═══════════════════════════════════════════════════════════════════
-- VIEW: Capacity Status
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW public.view_capacity_status AS
SELECT
    week_starting,
    TO_CHAR(week_starting, 'Mon DD, YYYY') as week,
    available_labor_hours,
    committed_hours,
    (available_labor_hours - committed_hours) as remaining_hours,
    utilization_rate,
    status,
    pricing_multiplier,
    CASE
        WHEN status = 'EXTREME MODE' THEN '🚨 Activate 50% Premium Pricing'
        WHEN status = 'APPROACHING' THEN '⚠️ Monitor Closely'
        ELSE '✅ Normal Operations'
    END as recommendation
FROM public.capacity_monitoring
WHERE week_starting >= CURRENT_DATE - INTERVAL '4 weeks'
ORDER BY week_starting DESC;

COMMENT ON VIEW public.view_capacity_status IS
    'Real-time capacity utilization with Extreme Bidding Mode triggers';

-- ═══════════════════════════════════════════════════════════════════
-- FUNCTION: Calculate Toll Booth Distribution
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.calculate_toll_booth(
    p_gross_revenue NUMERIC
)
RETURNS TABLE(
    gross_revenue NUMERIC,
    admin_fee NUMERIC,
    net_after_admin NUMERIC,
    mastery_tax NUMERIC,
    net_operations NUMERIC
)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p_gross_revenue as gross_revenue,
        ROUND(p_gross_revenue * 0.05, 2) as admin_fee,
        ROUND(p_gross_revenue * 0.95, 2) as net_after_admin,
        ROUND(p_gross_revenue * 0.95 * 0.35, 2) as mastery_tax,
        ROUND(p_gross_revenue * 0.95 * 0.65, 2) as net_operations;
END;
$$;

COMMENT ON FUNCTION public.calculate_toll_booth(NUMERIC) IS
    'Calculates toll booth distribution for any gross revenue amount';

-- Example usage:
-- SELECT * FROM calculate_toll_booth(10000.00);

-- ═══════════════════════════════════════════════════════════════════
-- FUNCTION: Get Current Month Summary
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_current_month_toll_booth_summary()
RETURNS TABLE(
    month TEXT,
    total_customers INTEGER,
    total_gross NUMERIC,
    total_admin_fee NUMERIC,
    total_mastery_tax NUMERIC,
    total_net_ops NUMERIC,
    transfer_status TEXT
)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
    v_month_year DATE;
BEGIN
    v_month_year := DATE_TRUNC('month', CURRENT_DATE);

    RETURN QUERY
    SELECT
        TO_CHAR(v_month_year, 'Month YYYY') as month,
        COUNT(DISTINCT customer_name)::INTEGER as total_customers,
        SUM(gross_revenue) as total_gross,
        SUM(admin_fee_5pct) as total_admin_fee,
        SUM(mastery_tax_35pct) as total_mastery_tax,
        SUM(net_operations_60pct) as total_net_ops,
        CASE
            WHEN COUNT(*) FILTER (WHERE mastery_tax_transferred = false) = 0
            THEN '✅ All Transferred'
            ELSE '⏳ ' || COUNT(*) FILTER (WHERE mastery_tax_transferred = false) || ' Pending'
        END as transfer_status
    FROM public.hjs_monthly_revenue
    WHERE month_year = v_month_year;
END;
$$;

COMMENT ON FUNCTION public.get_current_month_toll_booth_summary() IS
    'Quick summary of current month toll booth performance';

-- ═══════════════════════════════════════════════════════════════════
-- RLS POLICIES (Admin Only Access)
-- ═══════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE public.hjs_monthly_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mastery_tax_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annual_rate_increases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.five_week_month_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capacity_monitoring ENABLE ROW LEVEL SECURITY;

-- Admin-only access policies
CREATE POLICY "Admin only - hjs_monthly_revenue"
    ON public.hjs_monthly_revenue
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.app_admins
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Admin only - mastery_tax_transfers"
    ON public.mastery_tax_transfers
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.app_admins
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Admin only - annual_rate_increases"
    ON public.annual_rate_increases
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.app_admins
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Admin only - five_week_month_revenue"
    ON public.five_week_month_revenue
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.app_admins
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Admin only - capacity_monitoring"
    ON public.capacity_monitoring
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.app_admins
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- ═══════════════════════════════════════════════════════════════════
-- SEED DATA: Initialize 2026 Tracking
-- ═══════════════════════════════════════════════════════════════════

-- Initialize March 2026 (First operational month)
DO $$
BEGIN
    -- Placeholder for first month (will be populated with real data)
    INSERT INTO public.hjs_monthly_revenue (month_year, customer_name, gross_revenue, notes)
    VALUES (
        '2026-03-01',
        'PLACEHOLDER_CUSTOMER',
        0.00,
        'Initial setup - replace with real QuickBooks data'
    ) ON CONFLICT (month_year, customer_name) DO NOTHING;

    -- Initialize capacity monitoring for March
    INSERT INTO public.capacity_monitoring (week_starting, available_labor_hours, committed_hours, notes)
    VALUES (
        DATE_TRUNC('week', '2026-03-01'::DATE),
        40.0,
        0.0,
        'Initial week - update with actual brotherhood capacity'
    ) ON CONFLICT (week_starting) DO NOTHING;
END $$;

-- ═══════════════════════════════════════════════════════════════════
-- VERIFICATION
-- ═══════════════════════════════════════════════════════════════════

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ TOLL BOOTH TRACKING SYSTEM DEPLOYED';
    RAISE NOTICE '═══════════════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Tables Created:';
    RAISE NOTICE '   • hjs_monthly_revenue (per-customer monthly tracking)';
    RAISE NOTICE '   • mastery_tax_transfers (monthly transfer log)';
    RAISE NOTICE '   • annual_rate_increases (compliance tax tracking)';
    RAISE NOTICE '   • five_week_month_revenue (May/Aug/Oct extra revenue)';
    RAISE NOTICE '   • capacity_monitoring (Extreme Bidding trigger)';
    RAISE NOTICE '';
    RAISE NOTICE '📈 Views Created:';
    RAISE NOTICE '   • view_toll_booth_monthly_summary';
    RAISE NOTICE '   • view_current_month_dashboard';
    RAISE NOTICE '   • view_350k_debt_payoff';
    RAISE NOTICE '   • view_five_week_opportunities';
    RAISE NOTICE '   • view_capacity_status';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Functions Created:';
    RAISE NOTICE '   • calculate_toll_booth(gross_revenue)';
    RAISE NOTICE '   • get_current_month_toll_booth_summary()';
    RAISE NOTICE '';
    RAISE NOTICE '🔒 Security: Admin-only RLS policies active';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Ready for March 1, 2026 Launch';
    RAISE NOTICE '═══════════════════════════════════════════════════════════════════';
    RAISE NOTICE '';
END $$;
