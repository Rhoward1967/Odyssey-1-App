-- ═══════════════════════════════════════════════════════════════════
-- ACCOUNTS RECEIVABLE → ROYALTY PAYMENT ENGINE
-- Created: February 8, 2026
-- Purpose: Automate royalty calculations when business revenue is collected
-- ═══════════════════════════════════════════════════════════════════

-- Enhanced AR tracking with royalty calculation
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS royalty_calculated BOOLEAN DEFAULT FALSE;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS royalty_payment_id UUID REFERENCES public.trust_royalty_payments(payment_id);
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS licensing_agreement_id UUID REFERENCES public.trust_licensing_agreements(agreement_id);

-- Function: Calculate and record royalty payment when invoice is paid
CREATE OR REPLACE FUNCTION public.calculate_invoice_royalty()
RETURNS TRIGGER AS $$
DECLARE
    v_agreement_id UUID;
    v_royalty_rate NUMERIC(5,4);
    v_royalty_amount NUMERIC(20,2);
    v_payment_id UUID;
BEGIN
    -- Only process when invoice status changes to 'paid'
    IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') AND NEW.royalty_calculated = FALSE THEN
        
        -- Find active licensing agreement for this customer/service
        SELECT agreement_id, royalty_rate 
        INTO v_agreement_id, v_royalty_rate
        FROM public.trust_licensing_agreements
        WHERE licensee = 'HJS Services LLC'  -- The operating business
          AND status = 'ACTIVE'
          AND (term_end_date IS NULL OR term_end_date > CURRENT_DATE)
        LIMIT 1;
        
        -- If agreement exists, calculate royalty
        IF v_agreement_id IS NOT NULL THEN
            v_royalty_amount := NEW.total * v_royalty_rate;
            
            -- Create royalty payment record
            INSERT INTO public.trust_royalty_payments (
                agreement_id,
                payment_period_start,
                payment_period_end,
                gross_revenue,
                royalty_base_amount,
                royalty_rate,
                royalty_amount,
                payment_due_date,
                payment_date,
                payment_method,
                status,
                created_by
            ) VALUES (
                v_agreement_id,
                DATE_TRUNC('month', COALESCE(NEW.issue_date, CURRENT_DATE)),
                DATE_TRUNC('month', COALESCE(NEW.issue_date, CURRENT_DATE)) + INTERVAL '1 month' - INTERVAL '1 day',
                NEW.total,
                NEW.total,
                v_royalty_rate,
                v_royalty_amount,
                CURRENT_DATE + INTERVAL '15 days',  -- Due in 15 days
                CURRENT_DATE,  -- Paid immediately (internal transfer)
                'INTERNAL_TRANSFER',
                'PAID',
                'AR_ROYALTY_ENGINE'
            ) RETURNING payment_id INTO v_payment_id;
            
            -- Link invoice to royalty payment
            UPDATE public.invoices 
            SET royalty_calculated = TRUE,
                royalty_payment_id = v_payment_id,
                licensing_agreement_id = v_agreement_id
            WHERE id = NEW.id;
            
            -- Log the royalty generation
            INSERT INTO public.system_logs (source, level, message, metadata)
            VALUES (
                'royalty_engine',
                'info',
                'Royalty payment generated from invoice',
                json_build_object(
                    'invoice_id', NEW.id,
                    'invoice_total', NEW.total,
                    'royalty_amount', v_royalty_amount,
                    'royalty_rate', v_royalty_rate,
                    'payment_id', v_payment_id
                )
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-calculate royalty when invoice is paid
DROP TRIGGER IF EXISTS trigger_invoice_royalty ON public.invoices;
CREATE TRIGGER trigger_invoice_royalty
    AFTER INSERT OR UPDATE ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION public.calculate_invoice_royalty();

-- Create initial licensing agreement: Trust → HJS Services
-- This is the legal bridge that allows royalty payments
INSERT INTO public.trust_licensing_agreements (
    licensor,
    licensee,
    license_type,
    territory,
    term_start_date,
    royalty_rate,
    royalty_base,
    minimum_royalty,
    payment_frequency,
    status,
    executed_date,
    notes
) VALUES (
    'Howard Jones Bloodline Ancestral Trust',
    'HJS Services LLC',
    'EXCLUSIVE',
    'WORLDWIDE',
    '2026-02-01',
    0.35,  -- 35% royalty rate (business expense, reduces taxable income)
    'GROSS_REVENUE',
    0,
    'MONTHLY',
    'ACTIVE',
    '2026-02-01',
    'Master licensing agreement for use of Odyssey-1 IP, R.O.M.A.N. systems, and operational methodologies in janitorial services business'
) ON CONFLICT DO NOTHING;

-- Link existing assets to the licensing agreement
DO $$
DECLARE
    v_agreement_id UUID;
BEGIN
    -- Get the agreement we just created
    SELECT agreement_id INTO v_agreement_id
    FROM public.trust_licensing_agreements
    WHERE licensee = 'HJS Services LLC' AND status = 'ACTIVE'
    LIMIT 1;
    
    -- Link R.O.M.A.N. and Odyssey-1 assets to this agreement
    UPDATE public.trust_licensing_agreements
    SET notes = notes || E'\n\nLicensed Assets: R.O.M.A.N. 2.0, Odyssey-1 Platform, Universal Math Engine, Constitutional AI Framework, Sovereign Induction Protocol, Pattern Learning Engine'
    WHERE agreement_id = v_agreement_id;
END $$;

-- Monthly royalty summary view
CREATE OR REPLACE VIEW public.monthly_royalty_summary AS
SELECT 
    DATE_TRUNC('month', payment_period_start) as month,
    agreement_id,
    COUNT(*) as payment_count,
    SUM(gross_revenue) as total_gross_revenue,
    AVG(royalty_rate) as avg_royalty_rate,
    SUM(royalty_amount) as total_royalty_paid,
    SUM(CASE WHEN status = 'PAID' THEN royalty_amount ELSE 0 END) as paid_royalties,
    SUM(CASE WHEN status = 'PENDING' THEN royalty_amount ELSE 0 END) as pending_royalties
FROM public.trust_royalty_payments
GROUP BY DATE_TRUNC('month', payment_period_start), agreement_id
ORDER BY month DESC;

-- YTD royalty performance
CREATE OR REPLACE VIEW public.ytd_royalty_performance AS
SELECT 
    EXTRACT(YEAR FROM payment_period_start) as year,
    agreement_id,
    COUNT(*) as payment_count,
    SUM(gross_revenue) as ytd_gross_revenue,
    SUM(royalty_amount) as ytd_royalty_income,
    AVG(royalty_rate) as avg_royalty_rate,
    (SUM(royalty_amount) / NULLIF(SUM(gross_revenue), 0))::NUMERIC(5,4) as effective_royalty_rate
FROM public.trust_royalty_payments
WHERE EXTRACT(YEAR FROM payment_period_start) = EXTRACT(YEAR FROM CURRENT_DATE)
GROUP BY EXTRACT(YEAR FROM payment_period_start), agreement_id;

COMMENT ON FUNCTION public.calculate_invoice_royalty IS 
'AR → Royalty Engine: Automatically calculates and records trust royalty payments when business invoices are paid. Enforces IP licensing agreements.';
