-- ═══════════════════════════════════════════════════════════════════
-- QUARTERLY DISTRIBUTION AUTOMATION
-- Created: February 8, 2026
-- Purpose: Automated fiduciary reminders and distribution generation
-- Schedule: Runs daily, generates distributions on Jan 15, Apr 15, Jul 15, Oct 15
-- ═══════════════════════════════════════════════════════════════════

-- Upcoming distributions view (next 12 months)
CREATE OR REPLACE VIEW public.upcoming_distributions AS
WITH distribution_dates AS (
    -- Generate next 12 months of quarterly distribution dates
    SELECT 
        CASE 
            WHEN EXTRACT(MONTH FROM d) IN (1) THEN 1
            WHEN EXTRACT(MONTH FROM d) IN (4) THEN 2
            WHEN EXTRACT(MONTH FROM d) IN (7) THEN 3
            WHEN EXTRACT(MONTH FROM d) IN (10) THEN 4
        END as quarter,
        EXTRACT(YEAR FROM d)::INTEGER as year,
        d::DATE as distribution_date,
        d::DATE - INTERVAL '3 months' as period_start,
        d::DATE - INTERVAL '1 day' as period_end
    FROM generate_series(
        DATE_TRUNC('month', CURRENT_DATE),
        DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '12 months',
        INTERVAL '1 month'
    ) as d
    WHERE EXTRACT(DAY FROM d) = 1 AND EXTRACT(MONTH FROM d) IN (1, 4, 7, 10)
)
SELECT 
    dd.quarter,
    dd.year,
    dd.distribution_date,
    dd.period_start,
    dd.period_end,
    dd.distribution_date - CURRENT_DATE as days_until_distribution,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM public.trust_distributions td
            WHERE EXTRACT(QUARTER FROM td.distribution_period_start) = dd.quarter
              AND EXTRACT(YEAR FROM td.distribution_period_start) = dd.year
        ) THEN 'GENERATED'
        WHEN dd.distribution_date <= CURRENT_DATE THEN 'OVERDUE'
        WHEN dd.distribution_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'DUE_SOON'
        ELSE 'SCHEDULED'
    END as status,
    (SELECT SUM(royalty_amount) 
     FROM public.trust_royalty_payments
     WHERE payment_period_start >= dd.period_start
       AND payment_period_start <= dd.period_end
       AND status = 'PAID'
    ) as estimated_royalty_income
FROM distribution_dates dd
ORDER BY dd.distribution_date;

-- Distribution reminder notification function
CREATE OR REPLACE FUNCTION public.send_distribution_reminder()
RETURNS TABLE (
    reminder_type TEXT,
    distribution_date DATE,
    days_until INTEGER,
    message TEXT
) AS $$
DECLARE
    v_next_distribution RECORD;
    v_overdue_count INTEGER;
BEGIN
    -- Check for overdue distributions
    SELECT COUNT(*) INTO v_overdue_count
    FROM public.upcoming_distributions
    WHERE status = 'OVERDUE';
    
    IF v_overdue_count > 0 THEN
        RETURN QUERY
        SELECT 
            'OVERDUE'::TEXT,
            ud.distribution_date,
            ud.days_until_distribution::INTEGER,
            FORMAT('🚨 OVERDUE: Q%s %s distribution was due on %s (%s days ago). Estimated income: $%s',
                ud.quarter,
                ud.year,
                TO_CHAR(ud.distribution_date, 'Month DD, YYYY'),
                ABS(ud.days_until_distribution),
                TO_CHAR(COALESCE(ud.estimated_royalty_income, 0), 'FM999,999,999.99')
            )
        FROM public.upcoming_distributions ud
        WHERE ud.status = 'OVERDUE'
        ORDER BY ud.distribution_date;
    END IF;
    
    -- Check for upcoming distributions (within 7 days)
    FOR v_next_distribution IN
        SELECT * FROM public.upcoming_distributions
        WHERE status = 'DUE_SOON'
        ORDER BY distribution_date
        LIMIT 1
    LOOP
        RETURN QUERY
        SELECT 
            'DUE_SOON'::TEXT,
            v_next_distribution.distribution_date,
            v_next_distribution.days_until_distribution::INTEGER,
            FORMAT('📅 REMINDER: Q%s %s distribution due on %s (in %s days). Estimated income: $%s',
                v_next_distribution.quarter,
                v_next_distribution.year,
                TO_CHAR(v_next_distribution.distribution_date, 'Month DD, YYYY'),
                v_next_distribution.days_until_distribution,
                TO_CHAR(COALESCE(v_next_distribution.estimated_royalty_income, 0), 'FM999,999,999.99')
            );
    END LOOP;
    
    -- If today is a distribution date, remind to generate
    FOR v_next_distribution IN
        SELECT * FROM public.upcoming_distributions
        WHERE distribution_date = CURRENT_DATE
          AND status != 'GENERATED'
    LOOP
        RETURN QUERY
        SELECT 
            'GENERATE_NOW'::TEXT,
            v_next_distribution.distribution_date,
            0::INTEGER,
            FORMAT('🎯 ACTION REQUIRED: Today is Q%s %s distribution date! Run: SELECT generate_quarterly_distribution();',
                v_next_distribution.quarter,
                v_next_distribution.year
            );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Automated daily distribution check (called by edge function or cron)
CREATE OR REPLACE FUNCTION public.daily_distribution_check()
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
    v_reminders JSONB;
    v_generation_result UUID;
BEGIN
    -- Collect all reminders
    SELECT COALESCE(jsonb_agg(row_to_json(r)), '[]'::jsonb)
    INTO v_reminders
    FROM public.send_distribution_reminder() r;
    
    -- If today is a distribution date (15th of Jan/Apr/Jul/Oct), auto-generate
    IF EXTRACT(DAY FROM CURRENT_DATE) = 15 
       AND EXTRACT(MONTH FROM CURRENT_DATE) IN (1, 4, 7, 10) THEN
        
        v_generation_result := public.generate_quarterly_distribution();
        
        v_result := jsonb_build_object(
            'date', CURRENT_DATE,
            'action', 'AUTO_GENERATED',
            'distribution_id', v_generation_result,
            'reminders', v_reminders,
            'message', 'Quarterly distribution automatically generated'
        );
    ELSE
        v_result := jsonb_build_object(
            'date', CURRENT_DATE,
            'action', 'REMINDER_CHECK',
            'distribution_id', NULL,
            'reminders', v_reminders,
            'message', 'Daily reminder check completed'
        );
    END IF;
    
    -- Log the daily check
    INSERT INTO public.system_logs (source, level, message, metadata)
    VALUES (
        'distribution_automation',
        CASE 
            WHEN v_generation_result IS NOT NULL THEN 'info'
            WHEN jsonb_array_length(v_reminders) > 0 THEN 'warning'
            ELSE 'debug'
        END,
        'Daily distribution check completed',
        v_result
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Distribution dashboard summary
CREATE OR REPLACE VIEW public.distribution_dashboard AS
SELECT 
    -- Current quarter info
    EXTRACT(QUARTER FROM CURRENT_DATE)::INTEGER as current_quarter,
    EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER as current_year,
    
    -- Next distribution
    (SELECT distribution_date FROM public.upcoming_distributions WHERE status != 'GENERATED' ORDER BY distribution_date LIMIT 1) as next_distribution_date,
    (SELECT days_until_distribution FROM public.upcoming_distributions WHERE status != 'GENERATED' ORDER BY distribution_date LIMIT 1) as days_until_next,
    
    -- YTD stats
    (SELECT COUNT(*) FROM public.trust_distributions WHERE EXTRACT(YEAR FROM distribution_period_start) = EXTRACT(YEAR FROM CURRENT_DATE)) as ytd_distributions,
    (SELECT SUM(distribution_amount) FROM public.trust_distributions WHERE EXTRACT(YEAR FROM distribution_period_start) = EXTRACT(YEAR FROM CURRENT_DATE) AND status = 'PAID') as ytd_paid_amount,
    (SELECT SUM(distribution_amount) FROM public.trust_distributions WHERE EXTRACT(YEAR FROM distribution_period_start) = EXTRACT(YEAR FROM CURRENT_DATE) AND status = 'PENDING') as ytd_pending_amount,
    
    -- Trust health
    (SELECT total_valuation_usd FROM public.trust_total_valuation) as trust_total_assets,
    (SELECT asset_to_debt_ratio FROM public.financial_position) as creditor_ratio,
    (SELECT financial_strength FROM public.financial_position) as financial_strength;

-- Notification payload builder (for Discord/email)
CREATE OR REPLACE FUNCTION public.build_distribution_notification(
    p_distribution_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_distribution RECORD;
    v_notification JSONB;
BEGIN
    SELECT * INTO v_distribution
    FROM public.trust_distributions
    WHERE distribution_id = p_distribution_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Distribution not found');
    END IF;
    
    v_notification := jsonb_build_object(
        'title', FORMAT('Q%s %s Trust Distribution', 
            EXTRACT(QUARTER FROM v_distribution.distribution_period_start),
            EXTRACT(YEAR FROM v_distribution.distribution_period_start)
        ),
        'distribution_id', v_distribution.distribution_id,
        'status', v_distribution.status,
        'beneficiary', v_distribution.beneficiary_name,
        'amount', v_distribution.distribution_amount,
        'distribution_date', v_distribution.distribution_date,
        'trust_income', v_distribution.trust_income,
        'distribution_percentage', v_distribution.distribution_percentage * 100,
        'message', CASE v_distribution.status
            WHEN 'PENDING' THEN FORMAT('Distribution of $%s is pending trustee approval',
                TO_CHAR(v_distribution.distribution_amount, 'FM999,999,999.99')
            )
            WHEN 'APPROVED' THEN FORMAT('Distribution of $%s approved, awaiting payment processing',
                TO_CHAR(v_distribution.distribution_amount, 'FM999,999,999.99')
            )
            WHEN 'PAID' THEN FORMAT('Distribution of $%s successfully paid on %s',
                TO_CHAR(v_distribution.distribution_amount, 'FM999,999,999.99'),
                TO_CHAR(v_distribution.distribution_date, 'Month DD, YYYY')
            )
        END,
        'actions', jsonb_build_array(
            CASE v_distribution.status
                WHEN 'PENDING' THEN jsonb_build_object(
                    'action', 'APPROVE',
                    'sql', FORMAT('SELECT approve_distribution(''%s''::UUID);', v_distribution.distribution_id)
                )
                WHEN 'APPROVED' THEN jsonb_build_object(
                    'action', 'MARK_PAID',
                    'sql', FORMAT('SELECT mark_distribution_paid(''%s''::UUID, ''ACH'', ''Transfer-2026-Q%s'');', 
                        v_distribution.distribution_id,
                        EXTRACT(QUARTER FROM v_distribution.distribution_period_start)
                    )
                )
                ELSE NULL
            END
        )
    );
    
    RETURN v_notification;
END;
$$ LANGUAGE plpgsql;

COMMENT ON VIEW public.upcoming_distributions IS
'Shows next 12 months of quarterly distribution dates with status and estimated income';

COMMENT ON FUNCTION public.daily_distribution_check IS
'Automated daily check for distribution dates. Auto-generates on Jan 15, Apr 15, Jul 15, Oct 15. Returns reminder JSON for notifications.';

COMMENT ON VIEW public.distribution_dashboard IS
'Real-time fiduciary dashboard showing next distribution date, YTD stats, and trust health metrics';
