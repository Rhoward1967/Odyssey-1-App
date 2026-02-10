-- ═══════════════════════════════════════════════════════════════════
-- ACCOUNTANT DASHBOARD FOR ARCHANA
-- Created: February 8, 2026
-- Purpose: Simplified views for monthly/quarterly accounting tasks
-- Access: Authenticated users (Archana has read-only on most, read/write on liabilities)
-- ═══════════════════════════════════════════════════════════════════

-- ╔══════════════════════════════════════════════════════════════════╗
-- ║ MONTHLY ACCOUNTING DASHBOARD                                     ║
-- ╚══════════════════════════════════════════════════════════════════╝

CREATE OR REPLACE VIEW public.accountant_monthly_summary AS
WITH current_month AS (
    SELECT 
        DATE_TRUNC('month', CURRENT_DATE) as month_start,
        DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day' as month_end
),
monthly_stats AS (
    SELECT 
        -- Revenue data (from invoices)
        0::numeric as gross_revenue, -- Will be populated when invoices table exists
        
        -- Royalty data
        (SELECT COALESCE(SUM(royalty_amount), 0)
         FROM public.trust_royalty_payments
         WHERE payment_period_start >= (SELECT month_start FROM current_month)
           AND payment_period_start <= (SELECT month_end FROM current_month)
        ) as royalty_expense,
        
        -- Liability data
        (SELECT COALESCE(SUM(current_balance), 0)
         FROM public.business_liabilities
         WHERE status IN ('CURRENT', 'PAST_DUE')
        ) as total_liabilities,
        
        -- Distribution data
        (SELECT COALESCE(SUM(distribution_amount), 0)
         FROM public.trust_distributions
         WHERE EXTRACT(MONTH FROM distribution_date) = EXTRACT(MONTH FROM CURRENT_DATE)
           AND EXTRACT(YEAR FROM distribution_date) = EXTRACT(YEAR FROM CURRENT_DATE)
           AND status = 'PAID'
        ) as distributions_paid_mtd
)
SELECT 
    TO_CHAR(CURRENT_DATE, 'Month YYYY') as accounting_period,
    
    -- Revenue section
    gross_revenue as monthly_gross_revenue,
    royalty_expense as monthly_royalty_expense,
    gross_revenue - royalty_expense as monthly_net_revenue,
    CASE 
        WHEN gross_revenue > 0 THEN ROUND((royalty_expense / gross_revenue) * 100, 2)
        ELSE 35.00
    END as royalty_percentage,
    
    -- Liability section  
    total_liabilities as current_liabilities,
    
    -- Distribution section
    distributions_paid_mtd as distributions_paid_this_month,
    
    -- Trust health
    (SELECT total_valuation_usd FROM public.trust_total_valuation) as trust_total_assets,
    (SELECT asset_to_debt_ratio FROM public.financial_position) as creditor_ratio,
    
    -- Next distribution date (calculate directly: Jan 15, Apr 15, Jul 15, Oct 15)
    CASE 
        WHEN EXTRACT(MONTH FROM CURRENT_DATE) < 1 OR (EXTRACT(MONTH FROM CURRENT_DATE) = 1 AND EXTRACT(DAY FROM CURRENT_DATE) < 15) 
            THEN MAKE_DATE(EXTRACT(YEAR FROM CURRENT_DATE)::INT, 1, 15)
        WHEN EXTRACT(MONTH FROM CURRENT_DATE) < 4 OR (EXTRACT(MONTH FROM CURRENT_DATE) = 4 AND EXTRACT(DAY FROM CURRENT_DATE) < 15)
            THEN MAKE_DATE(EXTRACT(YEAR FROM CURRENT_DATE)::INT, 4, 15)
        WHEN EXTRACT(MONTH FROM CURRENT_DATE) < 7 OR (EXTRACT(MONTH FROM CURRENT_DATE) = 7 AND EXTRACT(DAY FROM CURRENT_DATE) < 15)
            THEN MAKE_DATE(EXTRACT(YEAR FROM CURRENT_DATE)::INT, 7, 15)
        WHEN EXTRACT(MONTH FROM CURRENT_DATE) < 10 OR (EXTRACT(MONTH FROM CURRENT_DATE) = 10 AND EXTRACT(DAY FROM CURRENT_DATE) < 15)
            THEN MAKE_DATE(EXTRACT(YEAR FROM CURRENT_DATE)::INT, 10, 15)
        ELSE MAKE_DATE(EXTRACT(YEAR FROM CURRENT_DATE)::INT + 1, 1, 15)
    END as next_distribution_date,
    
    -- Days until next distribution
    CASE 
        WHEN EXTRACT(MONTH FROM CURRENT_DATE) < 1 OR (EXTRACT(MONTH FROM CURRENT_DATE) = 1 AND EXTRACT(DAY FROM CURRENT_DATE) < 15) 
            THEN MAKE_DATE(EXTRACT(YEAR FROM CURRENT_DATE)::INT, 1, 15) - CURRENT_DATE
        WHEN EXTRACT(MONTH FROM CURRENT_DATE) < 4 OR (EXTRACT(MONTH FROM CURRENT_DATE) = 4 AND EXTRACT(DAY FROM CURRENT_DATE) < 15)
            THEN MAKE_DATE(EXTRACT(YEAR FROM CURRENT_DATE)::INT, 4, 15) - CURRENT_DATE
        WHEN EXTRACT(MONTH FROM CURRENT_DATE) < 7 OR (EXTRACT(MONTH FROM CURRENT_DATE) = 7 AND EXTRACT(DAY FROM CURRENT_DATE) < 15)
            THEN MAKE_DATE(EXTRACT(YEAR FROM CURRENT_DATE)::INT, 7, 15) - CURRENT_DATE
        WHEN EXTRACT(MONTH FROM CURRENT_DATE) < 10 OR (EXTRACT(MONTH FROM CURRENT_DATE) = 10 AND EXTRACT(DAY FROM CURRENT_DATE) < 15)
            THEN MAKE_DATE(EXTRACT(YEAR FROM CURRENT_DATE)::INT, 10, 15) - CURRENT_DATE
        ELSE MAKE_DATE(EXTRACT(YEAR FROM CURRENT_DATE)::INT + 1, 1, 15) - CURRENT_DATE
    END as days_until_distribution
FROM monthly_stats;

-- ╔══════════════════════════════════════════════════════════════════╗
-- ║ QUARTERLY K-1 PREPARATION VIEW                                   ║
-- ╚══════════════════════════════════════════════════════════════════╝

CREATE OR REPLACE VIEW public.accountant_k1_preparation AS
SELECT 
    EXTRACT(YEAR FROM distribution_period_start)::INTEGER as tax_year,
    EXTRACT(QUARTER FROM distribution_period_start)::INTEGER as quarter,
    
    -- Distribution details
    distribution_id,
    beneficiary_name,
    beneficiary_role,
    
    -- Income amounts
    trust_income as total_trust_income,
    taxable_income as k1_taxable_income,
    tax_exempt_income as k1_tax_exempt_income,
    distribution_amount as k1_distribution_amount,
    distribution_percentage,
    
    -- Dates
    distribution_period_start as period_start,
    distribution_period_end as period_end,
    distribution_date as payment_date,
    
    -- Payment details
    payment_method,
    payment_reference,
    status,
    
    -- For Form 1041
    CASE 
        WHEN status = 'PAID' THEN 'INCLUDE_IN_K1'
        ELSE 'NOT_YET_DISTRIBUTED'
    END as k1_status
    
FROM public.trust_distributions
ORDER BY distribution_period_start DESC;

-- ╔══════════════════════════════════════════════════════════════════╗
-- ║ ROYALTY EXPENSE JOURNAL ENTRY VIEW                               ║
-- ╚══════════════════════════════════════════════════════════════════╝

CREATE OR REPLACE VIEW public.accountant_royalty_journal_entries AS
SELECT 
    payment_id,
    TO_CHAR(payment_date, 'YYYY-MM-DD') as entry_date,
    TO_CHAR(payment_period_start, 'Month YYYY') as accounting_period,
    
    -- Journal entry components
    'IP Licensing Royalty Expense' as account_dr,
    'Due to Trust - Royalty Payable' as account_cr,
    royalty_amount as entry_amount,
    
    -- Supporting details
    gross_revenue as invoice_total,
    royalty_rate * 100 as royalty_rate_pct,
    
    -- Reconciliation
    payment_method,
    status,
    created_at,
    
    -- Memo line
    FORMAT('Royalty payment - %s%% of $%s gross revenue per licensing agreement',
        (royalty_rate * 100)::TEXT,
        TO_CHAR(gross_revenue, 'FM999,999.99')
    ) as journal_memo
    
FROM public.trust_royalty_payments
ORDER BY payment_date DESC;

-- ╔══════════════════════════════════════════════════════════════════╗
-- ║ LIABILITIES AGING REPORT                                         ║
-- ╚══════════════════════════════════════════════════════════════════╝

CREATE OR REPLACE VIEW public.accountant_liabilities_aging AS
SELECT 
    liability_id,
    liability_type,
    creditor_name,
    description,
    
    -- Amounts
    principal_amount,
    current_balance,
    current_balance - principal_amount as accrued_interest,
    
    -- Aging buckets
    CURRENT_DATE - origination_date as days_outstanding,
    CASE 
        WHEN due_date IS NULL THEN 'NO_DUE_DATE'
        WHEN due_date > CURRENT_DATE THEN 'CURRENT'
        WHEN due_date >= CURRENT_DATE - INTERVAL '30 days' THEN '1_30_DAYS_PAST_DUE'
        WHEN due_date >= CURRENT_DATE - INTERVAL '60 days' THEN '31_60_DAYS_PAST_DUE'
        WHEN due_date >= CURRENT_DATE - INTERVAL '90 days' THEN '61_90_DAYS_PAST_DUE'
        ELSE 'OVER_90_DAYS_PAST_DUE'
    END as aging_bucket,
    
    -- Dates
    origination_date,
    due_date,
    maturity_date,
    
    -- Status
    status,
    payment_frequency,
    secured,
    priority_rank
    
FROM public.business_liabilities
WHERE status IN ('CURRENT', 'PAST_DUE')
ORDER BY 
    CASE status 
        WHEN 'PAST_DUE' THEN 1 
        ELSE 2 
    END,
    due_date ASC NULLS LAST;

-- ╔══════════════════════════════════════════════════════════════════╗
-- ║ YTD INCOME STATEMENT VIEW                                        ║
-- ╚══════════════════════════════════════════════════════════════════╝

CREATE OR REPLACE VIEW public.accountant_ytd_income_statement AS
WITH ytd_data AS (
    SELECT 
        EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER as fiscal_year,
        
        -- Revenue (placeholder until invoices table exists)
        0::numeric as ytd_gross_revenue,
        
        -- Royalty expense
        (SELECT COALESCE(SUM(royalty_amount), 0)
         FROM public.trust_royalty_payments
         WHERE EXTRACT(YEAR FROM payment_period_start) = EXTRACT(YEAR FROM CURRENT_DATE)
           AND status = 'PAID'
        ) as ytd_royalty_expense
)
SELECT 
    fiscal_year,
    
    -- Income Statement
    ytd_gross_revenue as revenue_gross,
    ytd_royalty_expense as expenses_ip_royalty,
    ytd_gross_revenue - ytd_royalty_expense as net_operating_income,
    
    -- Percentages
    CASE 
        WHEN ytd_gross_revenue > 0 THEN ROUND((ytd_royalty_expense / ytd_gross_revenue) * 100, 2)
        ELSE 0
    END as royalty_expense_pct,
    
    -- Tax savings estimate (assuming 21% corporate tax rate)
    (ytd_royalty_expense * 0.21) as estimated_tax_savings
    
FROM ytd_data;

-- ╔══════════════════════════════════════════════════════════════════╗
-- ║ TRUST DISTRIBUTION PAYMENT TRACKER                               ║
-- ╚══════════════════════════════════════════════════════════════════╝

CREATE OR REPLACE VIEW public.accountant_distribution_payment_tracker AS
SELECT 
    distribution_id,
    
    -- Quarter identification
    CONCAT('Q', EXTRACT(QUARTER FROM distribution_period_start), ' ', EXTRACT(YEAR FROM distribution_period_start)) as quarter,
    distribution_period_start as period_start,
    distribution_period_end as period_end,
    
    -- Payment tracking
    status,
    CASE status
        WHEN 'PENDING' THEN 'AWAITING_TRUSTEE_APPROVAL'
        WHEN 'APPROVED' THEN 'READY_FOR_ACH_PAYMENT'
        WHEN 'PAID' THEN 'PAYMENT_COMPLETED'
        WHEN 'CANCELLED' THEN 'DISTRIBUTION_CANCELLED'
    END as accountant_action,
    
    -- Financial details
    trust_income,
    distribution_amount,
    distribution_percentage * 100 as distribution_rate_pct,
    
    -- Payment information
    beneficiary_name,
    payment_method,
    payment_reference,
    distribution_date,
    
    -- Tax information
    tax_year,
    form_k1_generated,
    taxable_income as k1_taxable_amount,
    
    -- Audit trail
    created_at,
    updated_at,
    notes
    
FROM public.trust_distributions
ORDER BY distribution_period_start DESC;

-- ╔══════════════════════════════════════════════════════════════════╗
-- ║ ACCOUNTANT QUICK ACCESS FUNCTION                                 ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- Helper function: Get accounting summary for any month
CREATE OR REPLACE FUNCTION public.accountant_get_month_summary(
    p_year INTEGER,
    p_month INTEGER
)
RETURNS TABLE (
    accounting_period TEXT,
    gross_revenue NUMERIC,
    royalty_expense NUMERIC,
    net_revenue NUMERIC,
    royalty_pct NUMERIC,
    liabilities NUMERIC,
    distributions_paid NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        TO_CHAR(MAKE_DATE(p_year, p_month, 1), 'Month YYYY')::TEXT,
        0::NUMERIC, -- Placeholder for gross revenue
        (SELECT COALESCE(SUM(royalty_amount), 0)
         FROM public.trust_royalty_payments
         WHERE EXTRACT(YEAR FROM payment_period_start) = p_year
           AND EXTRACT(MONTH FROM payment_period_start) = p_month
           AND status = 'PAID'
        ),
        0::NUMERIC, -- Will calculate when revenue exists
        35.00::NUMERIC, -- Default royalty rate
        (SELECT COALESCE(SUM(current_balance), 0)
         FROM public.business_liabilities
         WHERE status IN ('CURRENT', 'PAST_DUE')
        ),
        (SELECT COALESCE(SUM(distribution_amount), 0)
         FROM public.trust_distributions
         WHERE EXTRACT(YEAR FROM distribution_date) = p_year
           AND EXTRACT(MONTH FROM distribution_date) = p_month
           AND status = 'PAID'
        );
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════
-- GRANT PERMISSIONS TO AUTHENTICATED USERS (ARCHANA)
-- ═══════════════════════════════════════════════════════════════════

GRANT SELECT ON public.accountant_monthly_summary TO authenticated;
GRANT SELECT ON public.accountant_k1_preparation TO authenticated;
GRANT SELECT ON public.accountant_royalty_journal_entries TO authenticated;
GRANT SELECT ON public.accountant_liabilities_aging TO authenticated;
GRANT SELECT ON public.accountant_ytd_income_statement TO authenticated;
GRANT SELECT ON public.accountant_distribution_payment_tracker TO authenticated;

-- ═══════════════════════════════════════════════════════════════════
-- COMMENTS FOR DOCUMENTATION
-- ═══════════════════════════════════════════════════════════════════

COMMENT ON VIEW public.accountant_monthly_summary IS
'Archana''s monthly accounting dashboard - revenue, royalties, liabilities, distributions';

COMMENT ON VIEW public.accountant_k1_preparation IS
'K-1 tax form preparation data for trust income distributions (Form 1041 Schedule K-1)';

COMMENT ON VIEW public.accountant_royalty_journal_entries IS
'Pre-formatted journal entries for IP licensing royalty expense recording';

COMMENT ON VIEW public.accountant_liabilities_aging IS
'Aging report for business liabilities (utilities, rent, loans) with due date tracking';

COMMENT ON VIEW public.accountant_ytd_income_statement IS
'Year-to-date income statement showing gross revenue, royalty expense, and tax savings';

COMMENT ON VIEW public.accountant_distribution_payment_tracker IS
'Trust distribution payment tracking for quarterly ACH transfers to beneficiary';

COMMENT ON FUNCTION public.accountant_get_month_summary IS
'Helper function for Archana - get accounting summary for any specific month';
