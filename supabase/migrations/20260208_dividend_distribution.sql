-- ═══════════════════════════════════════════════════════════════════
-- TRUST DIVIDEND DISTRIBUTION ENGINE
-- Created: February 8, 2026
-- Purpose: Automate quarterly distributions from trust to beneficiary
-- Fiduciary-compliant, tax-efficient, fully documented
-- ═══════════════════════════════════════════════════════════════════

-- Drop existing tables to ensure clean schema
DROP TABLE IF EXISTS public.trust_distributions CASCADE;

-- Trust distributions tracking
CREATE TABLE public.trust_distributions (
    distribution_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Distribution details
    distribution_type TEXT NOT NULL, -- 'INCOME_DISTRIBUTION', 'PRINCIPAL_DISTRIBUTION', 'CAPITAL_GAIN'
    distribution_period_start DATE NOT NULL,
    distribution_period_end DATE NOT NULL,
    distribution_date DATE NOT NULL,
    
    -- Financial
    trust_income NUMERIC(20, 2), -- Total income earned by trust (royalties, etc.)
    distribution_percentage NUMERIC(5, 4) DEFAULT 1.0000, -- 100% unless partial distribution
    distribution_amount NUMERIC(20, 2) NOT NULL,
    
    -- Beneficiary
    beneficiary_name TEXT DEFAULT 'Rickey A. Howard',
    beneficiary_role TEXT DEFAULT 'Primary Beneficiary / Trustee',
    
    -- Documentation
    board_approval_date DATE,
    authorization_document_url TEXT,
    payment_method TEXT, -- 'ACH', 'WIRE', 'CHECK'
    payment_reference TEXT,
    
    -- Tax tracking
    tax_year INTEGER NOT NULL,
    form_k1_generated BOOLEAN DEFAULT FALSE,
    taxable_income NUMERIC(20, 2),
    tax_exempt_income NUMERIC(20, 2),
    
    -- Status
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'PAID', 'CANCELLED'
    
    -- Audit trail
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT DEFAULT 'SYSTEM',
    notes TEXT
);

-- Quarterly distribution calculation function
CREATE OR REPLACE FUNCTION public.calculate_quarterly_distribution(
    p_quarter INTEGER, -- 1, 2, 3, or 4
    p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
)
RETURNS TABLE (
    quarter INTEGER,
    year INTEGER,
    period_start DATE,
    period_end DATE,
    total_royalty_income NUMERIC,
    total_licensing_fees NUMERIC,
    total_trust_income NUMERIC,
    recommended_distribution NUMERIC,
    distribution_percentage NUMERIC
) AS $$
DECLARE
    v_period_start DATE;
    v_period_end DATE;
    v_royalty_income NUMERIC;
    v_licensing_fees NUMERIC;
    v_total_income NUMERIC;
    v_distribution_amt NUMERIC;
BEGIN
    -- Calculate quarter date range
    v_period_start := DATE_TRUNC('quarter', MAKE_DATE(p_year, (p_quarter - 1) * 3 + 1, 1));
    v_period_end := v_period_start + INTERVAL '3 months' - INTERVAL '1 day';
    
    -- Calculate total royalty income for quarter
    SELECT COALESCE(SUM(royalty_amount), 0)
    INTO v_royalty_income
    FROM public.trust_royalty_payments
    WHERE payment_period_start >= v_period_start
      AND payment_period_start <= v_period_end
      AND status = 'PAID';
    
    -- Calculate licensing fees (upfront fees paid in quarter)
    SELECT COALESCE(SUM(upfront_fee), 0)
    INTO v_licensing_fees
    FROM public.trust_licensing_agreements
    WHERE executed_date >= v_period_start
      AND executed_date <= v_period_end;
    
    -- Total trust income
    v_total_income := v_royalty_income + v_licensing_fees;
    
    -- Recommended distribution (90% of income, retain 10% for trust operations)
    v_distribution_amt := v_total_income * 0.90;
    
    RETURN QUERY SELECT 
        p_quarter,
        p_year,
        v_period_start,
        v_period_end,
        v_royalty_income,
        v_licensing_fees,
        v_total_income,
        v_distribution_amt,
        0.90::NUMERIC;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate quarterly distribution records
CREATE OR REPLACE FUNCTION public.generate_quarterly_distribution()
RETURNS UUID AS $$
DECLARE
    v_current_quarter INTEGER;
    v_current_year INTEGER;
    v_distribution_data RECORD;
    v_distribution_id UUID;
BEGIN
    -- Determine current quarter
    v_current_quarter := EXTRACT(QUARTER FROM CURRENT_DATE)::INTEGER;
    v_current_year := EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER;
    
    -- Get distribution calculation
    SELECT * INTO v_distribution_data
    FROM public.calculate_quarterly_distribution(v_current_quarter, v_current_year);
    
    -- Only create distribution if there's income to distribute
    IF v_distribution_data.total_trust_income > 0 THEN
        -- Create distribution record
        INSERT INTO public.trust_distributions (
            distribution_type,
            distribution_period_start,
            distribution_period_end,
            distribution_date,
            trust_income,
            distribution_percentage,
            distribution_amount,
            beneficiary_name,
            beneficiary_role,
            tax_year,
            taxable_income,
            status,
            created_by,
            notes
        ) VALUES (
            'INCOME_DISTRIBUTION',
            v_distribution_data.period_start,
            v_distribution_data.period_end,
            CURRENT_DATE + INTERVAL '15 days', -- Due in 15 days
            v_distribution_data.total_trust_income,
            v_distribution_data.distribution_percentage,
            v_distribution_data.recommended_distribution,
            'Rickey A. Howard',
            'Primary Beneficiary / Trustee',
            v_current_year,
            v_distribution_data.recommended_distribution, -- All income is taxable to beneficiary
            'PENDING',
            'QUARTERLY_AUTO_GENERATOR',
            FORMAT('Q%s %s automatic distribution based on trust income of $%s (royalties: $%s, licensing fees: $%s)',
                v_current_quarter,
                v_current_year,
                v_distribution_data.total_trust_income,
                v_distribution_data.total_royalty_income,
                v_distribution_data.total_licensing_fees
            )
        ) RETURNING distribution_id INTO v_distribution_id;
        
        -- Log the generation
        INSERT INTO public.system_logs (source, level, message, metadata)
        VALUES (
            'quarterly_distribution',
            'info',
            'Quarterly trust distribution generated',
            json_build_object(
                'distribution_id', v_distribution_id,
                'quarter', v_current_quarter,
                'year', v_current_year,
                'income', v_distribution_data.total_trust_income,
                'distribution', v_distribution_data.recommended_distribution
            )
        );
        
        RETURN v_distribution_id;
    ELSE
        -- No income to distribute
        INSERT INTO public.system_logs (source, level, message, metadata)
        VALUES (
            'quarterly_distribution',
            'info',
            'No trust income to distribute this quarter',
            json_build_object(
                'quarter', v_current_quarter,
                'year', v_current_year,
                'income', v_distribution_data.total_trust_income
            )
        );
        
        RETURN NULL;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Approve distribution (moves from PENDING to APPROVED)
CREATE OR REPLACE FUNCTION public.approve_distribution(p_distribution_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.trust_distributions
    SET status = 'APPROVED',
        board_approval_date = CURRENT_DATE,
        updated_at = NOW(),
        updated_by = 'TRUSTEE_APPROVAL'
    WHERE distribution_id = p_distribution_id
      AND status = 'PENDING';
    
    IF FOUND THEN
        INSERT INTO public.system_logs (source, level, message, metadata)
        VALUES (
            'distribution_approval',
            'info',
            'Trust distribution approved',
            json_build_object('distribution_id', p_distribution_id)
        );
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Mark distribution as paid
CREATE OR REPLACE FUNCTION public.mark_distribution_paid(
    p_distribution_id UUID,
    p_payment_method TEXT,
    p_payment_reference TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.trust_distributions
    SET status = 'PAID',
        distribution_date = CURRENT_DATE,
        payment_method = p_payment_method,
        payment_reference = p_payment_reference,
        updated_at = NOW(),
        updated_by = 'PAYMENT_PROCESSOR'
    WHERE distribution_id = p_distribution_id
      AND status = 'APPROVED';
    
    IF FOUND THEN
        INSERT INTO public.system_logs (source, level, message, metadata)
        VALUES (
            'distribution_payment',
            'info',
            'Trust distribution paid',
            json_build_object(
                'distribution_id', p_distribution_id,
                'payment_method', p_payment_method,
                'payment_reference', p_payment_reference
            )
        );
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- YTD distribution summary view
CREATE OR REPLACE VIEW public.ytd_distribution_summary AS
SELECT 
    EXTRACT(YEAR FROM distribution_period_start) as year,
    COUNT(*) as distribution_count,
    SUM(trust_income) as total_trust_income,
    SUM(distribution_amount) as total_distributions,
    SUM(CASE WHEN status = 'PAID' THEN distribution_amount ELSE 0 END) as paid_distributions,
    SUM(CASE WHEN status = 'PENDING' THEN distribution_amount ELSE 0 END) as pending_distributions,
    SUM(CASE WHEN status = 'APPROVED' THEN distribution_amount ELSE 0 END) as approved_distributions,
    AVG(distribution_percentage) as avg_distribution_rate
FROM public.trust_distributions
WHERE EXTRACT(YEAR FROM distribution_period_start) = EXTRACT(YEAR FROM CURRENT_DATE)
GROUP BY EXTRACT(YEAR FROM distribution_period_start);

-- Tax reporting view (K-1 data)
CREATE OR REPLACE VIEW public.tax_reporting_k1_data AS
SELECT 
    tax_year,
    beneficiary_name,
    COUNT(*) as distribution_count,
    SUM(distribution_amount) as total_distributions,
    SUM(taxable_income) as total_taxable_income,
    SUM(tax_exempt_income) as total_tax_exempt_income,
    STRING_AGG(distribution_id::TEXT, ', ') as distribution_ids
FROM public.trust_distributions
WHERE status = 'PAID'
GROUP BY tax_year, beneficiary_name
ORDER BY tax_year DESC;

-- Schedule automatic quarterly distribution generation
-- This would typically be called via cron/scheduled task on these dates:
-- Q1: April 15 (for Jan-Mar)
-- Q2: July 15 (for Apr-Jun)
-- Q3: October 15 (for Jul-Sep)
-- Q4: January 15 (for Oct-Dec)

CREATE OR REPLACE FUNCTION public.check_and_generate_distribution()
RETURNS TEXT AS $$
DECLARE
    v_current_day INTEGER;
    v_current_month INTEGER;
    v_should_generate BOOLEAN := FALSE;
    v_distribution_id UUID;
BEGIN
    v_current_day := EXTRACT(DAY FROM CURRENT_DATE)::INTEGER;
    v_current_month := EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER;
    
    -- Check if today is a quarterly distribution date
    IF (v_current_month IN (1, 4, 7, 10) AND v_current_day = 15) THEN
        v_should_generate := TRUE;
    END IF;
    
    IF v_should_generate THEN
        v_distribution_id := public.generate_quarterly_distribution();
        IF v_distribution_id IS NOT NULL THEN
            RETURN 'GENERATED: ' || v_distribution_id::TEXT;
        ELSE
            RETURN 'NO_INCOME_TO_DISTRIBUTE';
        END IF;
    ELSE
        RETURN 'NOT_DISTRIBUTION_DATE';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE public.trust_distributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Distributions readable by authenticated" ON public.trust_distributions
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Distributions writable by service role" ON public.trust_distributions
    FOR ALL USING (auth.role() = 'service_role');

COMMENT ON TABLE public.trust_distributions IS 
'Trust-to-beneficiary distribution tracking. Automated quarterly distributions based on trust income (royalties, licensing fees). Fiduciary-compliant, tax-documented, fully auditable.';

COMMENT ON FUNCTION public.generate_quarterly_distribution IS 
'Auto-generates quarterly trust distribution record. Called on 15th of Jan/Apr/Jul/Oct. Distributes 90% of trust income to beneficiary, retains 10% for operations.';
