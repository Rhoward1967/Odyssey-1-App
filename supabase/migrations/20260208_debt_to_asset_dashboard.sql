-- ═══════════════════════════════════════════════════════════════════
-- DEBT-TO-ASSET RATIO DASHBOARD
-- Created: February 8, 2026
-- Purpose: Real-time financial strength analysis - proves creditor status
-- ═══════════════════════════════════════════════════════════════════

-- Drop existing tables to ensure clean schema
DROP TABLE IF EXISTS public.liability_payments CASCADE;
DROP TABLE IF EXISTS public.business_liabilities CASCADE;

-- Liabilities tracking table
CREATE TABLE public.business_liabilities (
    liability_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Liability details
    liability_type TEXT NOT NULL, -- 'ACCOUNTS_PAYABLE', 'LOAN', 'UTILITY', 'RENT', 'PAYROLL', 'TAX'
    creditor_name TEXT NOT NULL,
    description TEXT,
    
    -- Financial
    principal_amount NUMERIC(20, 2) NOT NULL,
    current_balance NUMERIC(20, 2) NOT NULL,
    interest_rate NUMERIC(5, 4) DEFAULT 0,
    
    -- Dates
    origination_date DATE NOT NULL,
    due_date DATE,
    maturity_date DATE,
    
    -- Status
    status TEXT DEFAULT 'CURRENT', -- 'CURRENT', 'PAST_DUE', 'PAID', 'DISPUTED'
    payment_frequency TEXT, -- 'MONTHLY', 'QUARTERLY', 'ANNUAL', 'ONE_TIME'
    
    -- Priority
    secured BOOLEAN DEFAULT FALSE,
    security_interest TEXT, -- Description of collateral if secured
    priority_rank INTEGER DEFAULT 99, -- Lower number = higher priority
    
    -- Audit trail
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT DEFAULT 'SYSTEM'
);

-- Liability payments tracking
CREATE TABLE public.liability_payments (
    payment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    liability_id UUID REFERENCES public.business_liabilities(liability_id),
    
    payment_date DATE NOT NULL,
    payment_amount NUMERIC(20, 2) NOT NULL,
    principal_paid NUMERIC(20, 2),
    interest_paid NUMERIC(20, 2),
    payment_method TEXT,
    payment_reference TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Real-time financial position view
CREATE OR REPLACE VIEW public.financial_position AS
WITH assets AS (
    SELECT COALESCE(SUM(valuation_usd), 0) as total_assets
    FROM public.trust_asset_portfolio
    WHERE status = 'ACTIVE'
),
liabilities AS (
    SELECT 
        COALESCE(SUM(current_balance), 0) as total_liabilities,
        COALESCE(SUM(CASE WHEN secured = TRUE THEN current_balance ELSE 0 END), 0) as secured_debt,
        COALESCE(SUM(CASE WHEN secured = FALSE THEN current_balance ELSE 0 END), 0) as unsecured_debt
    FROM public.business_liabilities
    WHERE status IN ('CURRENT', 'PAST_DUE')
),
revenue AS (
    -- Note: Requires invoices table with columns: status, total, issue_date
    -- If table doesn't exist yet, this will default to 0
    SELECT 
        0::numeric as ytd_revenue,
        0::bigint as paid_invoice_count
),
royalties AS (
    SELECT COALESCE(SUM(royalty_amount), 0) as ytd_royalty_income
    FROM public.trust_royalty_payments
    WHERE EXTRACT(YEAR FROM payment_period_start) = EXTRACT(YEAR FROM CURRENT_DATE)
      AND status = 'PAID'
)
SELECT 
    -- Assets
    COALESCE(a.total_assets, 0) as total_assets,
    
    -- Liabilities
    COALESCE(l.total_liabilities, 0) as total_liabilities,
    COALESCE(l.secured_debt, 0) as secured_debt,
    COALESCE(l.unsecured_debt, 0) as unsecured_debt,
    
    -- Net Worth
    COALESCE(a.total_assets, 0) - COALESCE(l.total_liabilities, 0) as net_worth,
    
    -- Ratios
    CASE 
        WHEN COALESCE(l.total_liabilities, 0) = 0 THEN 999999999.99
        ELSE ROUND(COALESCE(a.total_assets, 0) / NULLIF(l.total_liabilities, 0), 2)
    END as asset_to_debt_ratio,
    
    CASE 
        WHEN COALESCE(a.total_assets, 0) = 0 THEN 0
        ELSE ROUND(COALESCE(l.total_liabilities, 0) / NULLIF(a.total_assets, 0), 6)
    END as debt_to_asset_ratio,
    
    -- Revenue
    COALESCE(r.ytd_revenue, 0) as ytd_revenue,
    COALESCE(roy.ytd_royalty_income, 0) as ytd_royalty_income,
    COALESCE(r.ytd_revenue, 0) + COALESCE(roy.ytd_royalty_income, 0) as ytd_total_income,
    
    -- Solvency indicators
    CASE 
        WHEN COALESCE(a.total_assets, 0) > COALESCE(l.total_liabilities, 0) THEN 'SOLVENT'
        WHEN COALESCE(a.total_assets, 0) = COALESCE(l.total_liabilities, 0) THEN 'BREAK_EVEN'
        ELSE 'INSOLVENT'
    END as solvency_status,
    
    CASE
        WHEN COALESCE(a.total_assets, 0) >= (COALESCE(l.total_liabilities, 0) * 1000) THEN 'CREDITOR_STATUS'
        WHEN COALESCE(a.total_assets, 0) >= (COALESCE(l.total_liabilities, 0) * 100) THEN 'HIGHLY_SOLVENT'
        WHEN COALESCE(a.total_assets, 0) >= (COALESCE(l.total_liabilities, 0) * 10) THEN 'WELL_CAPITALIZED'
        WHEN COALESCE(a.total_assets, 0) > COALESCE(l.total_liabilities, 0) THEN 'SOLVENT'
        ELSE 'UNDERCAPITALIZED'
    END as financial_strength,
    
    -- Timestamp
    NOW() as calculated_at
FROM assets a
CROSS JOIN liabilities l
CROSS JOIN revenue r
CROSS JOIN royalties roy;

-- Detailed liability breakdown by type
CREATE OR REPLACE VIEW public.liability_breakdown AS
SELECT 
    liability_type,
    COUNT(*) as count,
    SUM(current_balance) as total_balance,
    AVG(current_balance) as avg_balance,
    SUM(CASE WHEN secured = TRUE THEN current_balance ELSE 0 END) as secured_balance,
    SUM(CASE WHEN secured = FALSE THEN current_balance ELSE 0 END) as unsecured_balance,
    SUM(CASE WHEN status = 'CURRENT' THEN current_balance ELSE 0 END) as current_balance_total,
    SUM(CASE WHEN status = 'PAST_DUE' THEN current_balance ELSE 0 END) as past_due_balance
FROM public.business_liabilities
WHERE status IN ('CURRENT', 'PAST_DUE')
GROUP BY liability_type
ORDER BY total_balance DESC;

-- Monthly financial trend
-- Note: Currently excludes invoice data until invoices table schema is confirmed
CREATE OR REPLACE VIEW public.monthly_financial_trend AS
WITH monthly_royalties AS (
    SELECT 
        DATE_TRUNC('month', payment_period_start) as month,
        SUM(CASE WHEN status = 'PAID' THEN royalty_amount ELSE 0 END) as royalties
    FROM public.trust_royalty_payments
    GROUP BY DATE_TRUNC('month', payment_period_start)
),
monthly_liabilities AS (
    SELECT 
        DATE_TRUNC('month', updated_at) as month,
        SUM(current_balance) as liabilities
    FROM public.business_liabilities
    WHERE status IN ('CURRENT', 'PAST_DUE')
    GROUP BY DATE_TRUNC('month', updated_at)
)
SELECT 
    COALESCE(roy.month, l.month) as month,
    0::numeric as revenue, -- Invoice tracking to be added later
    COALESCE(roy.royalties, 0) as royalties,
    COALESCE(roy.royalties, 0) as total_income,
    COALESCE(l.liabilities, 0) as liabilities,
    COALESCE(roy.royalties, 0) - COALESCE(l.liabilities, 0) as net_cash_flow
FROM monthly_royalties roy
FULL OUTER JOIN monthly_liabilities l ON roy.month = l.month
ORDER BY month DESC;

-- Sample liabilities (utilities, overhead) - UPDATE WITH ACTUAL DATA
INSERT INTO public.business_liabilities (
    liability_type, creditor_name, description, principal_amount, current_balance, 
    origination_date, due_date, payment_frequency, secured, priority_rank
) VALUES
('UTILITY', 'Georgia Power', 'Commercial electricity', 200.00, 200.00, '2026-02-01', '2026-02-25', 'MONTHLY', FALSE, 50),
('UTILITY', 'Athens Water', 'Commercial water service', 75.00, 75.00, '2026-02-01', '2026-02-25', 'MONTHLY', FALSE, 50),
('RENT', 'Office Lease', 'Business office space', 1500.00, 1500.00, '2026-02-01', '2026-03-01', 'MONTHLY', FALSE, 30)
ON CONFLICT DO NOTHING;

-- Credit score calculation (simplified FICO-style)
CREATE OR REPLACE FUNCTION public.calculate_credit_strength()
RETURNS TABLE (
    credit_strength TEXT,
    score NUMERIC,
    asset_component NUMERIC,
    liability_component NUMERIC,
    ratio_component NUMERIC,
    interpretation TEXT
) AS $$
SELECT 
    CASE 
        WHEN asset_to_debt_ratio >= 1000 THEN 'SOVEREIGN_CREDITOR'
        WHEN asset_to_debt_ratio >= 100 THEN 'INSTITUTIONAL_GRADE'
        WHEN asset_to_debt_ratio >= 10 THEN 'INVESTMENT_GRADE'
        WHEN asset_to_debt_ratio >= 2 THEN 'CREDITWORTHY'
        WHEN asset_to_debt_ratio >= 1 THEN 'MARGINAL'
        ELSE 'DISTRESSED'
    END as credit_strength,
    
    -- Simplified scoring (0-1000 scale)
    LEAST(1000, asset_to_debt_ratio * 10) as score,
    
    total_assets / 1000000 as asset_component,
    total_liabilities as liability_component,
    asset_to_debt_ratio as ratio_component,
    
    CASE 
        WHEN asset_to_debt_ratio >= 1000 THEN 
            'Assets exceed liabilities by ' || TO_CHAR(asset_to_debt_ratio, 'FM999,999,999') || 
            'x. Sovereign creditor status - mathematically impossible to be insolvent.'
        WHEN asset_to_debt_ratio >= 100 THEN 
            'Assets exceed liabilities by ' || TO_CHAR(asset_to_debt_ratio, 'FM999,999') || 
            'x. Institutional-grade financial strength.'
        WHEN asset_to_debt_ratio >= 10 THEN 
            'Assets exceed liabilities by ' || TO_CHAR(asset_to_debt_ratio, 'FM999') || 
            'x. Investment-grade financial position.'
        ELSE 
            'Debt-to-asset ratio: ' || TO_CHAR(debt_to_asset_ratio, 'FM0.999999')
    END as interpretation
FROM public.financial_position;
$$ LANGUAGE SQL;

COMMENT ON VIEW public.financial_position IS 
'Real-time debt-to-asset dashboard. When ratio > 1000:1, entity is sovereign creditor - bankruptcy mathematically impossible.';
