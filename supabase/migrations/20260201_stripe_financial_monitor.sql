-- Stripe Financial Monitoring System
-- Tracks all income (subscriptions, invoices) and expenses (contractor payouts) through Stripe

-- 1. Create stripe_transactions table for unified tracking
CREATE TABLE IF NOT EXISTS public.stripe_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Transaction identification
    stripe_id text UNIQUE NOT NULL, -- payment_intent_id, payout_id, charge_id, etc.
    transaction_type text NOT NULL, -- 'subscription_payment', 'invoice_payment', 'contractor_payout', 'refund'
    
    -- Financial details
    amount_cents bigint NOT NULL, -- Amount in cents (Stripe format)
    amount_usd numeric(12,2) GENERATED ALWAYS AS (amount_cents / 100.0) STORED,
    currency text DEFAULT 'usd',
    net_amount_cents bigint, -- After Stripe fees
    fee_cents bigint, -- Stripe processing fee
    
    -- Direction
    flow_direction text NOT NULL, -- 'inbound' (income) or 'outbound' (expense)
    
    -- Related entities
    customer_id uuid REFERENCES public.customers(id),
    contractor_id uuid REFERENCES public.contractors(id),
    invoice_id uuid REFERENCES public.invoices(id),
    subscription_id text, -- Stripe subscription ID
    
    -- Status
    status text NOT NULL DEFAULT 'pending', -- 'pending', 'succeeded', 'failed', 'refunded'
    
    -- Metadata
    description text,
    metadata jsonb DEFAULT '{}'::jsonb,
    
    -- Timestamps
    stripe_created_at timestamptz NOT NULL,
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_stripe_transactions_type ON public.stripe_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_stripe_transactions_direction ON public.stripe_transactions(flow_direction);
CREATE INDEX IF NOT EXISTS idx_stripe_transactions_status ON public.stripe_transactions(status);
CREATE INDEX IF NOT EXISTS idx_stripe_transactions_date ON public.stripe_transactions(stripe_created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stripe_transactions_customer ON public.stripe_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_stripe_transactions_contractor ON public.stripe_transactions(contractor_id);

COMMENT ON TABLE public.stripe_transactions IS 
    'Unified tracking of all Stripe income (subscriptions, invoices) and expenses (contractor payouts)';

-- 2. Create view for daily financial summary
CREATE OR REPLACE VIEW public.stripe_daily_summary AS
SELECT 
    DATE(stripe_created_at) as transaction_date,
    
    -- Income breakdown
    SUM(CASE WHEN flow_direction = 'inbound' AND transaction_type = 'subscription_payment' AND status = 'succeeded' THEN amount_cents ELSE 0 END) / 100.0 as subscription_income_usd,
    SUM(CASE WHEN flow_direction = 'inbound' AND transaction_type = 'invoice_payment' AND status = 'succeeded' THEN amount_cents ELSE 0 END) / 100.0 as invoice_income_usd,
    SUM(CASE WHEN flow_direction = 'inbound' AND status = 'succeeded' THEN amount_cents ELSE 0 END) / 100.0 as total_income_usd,
    
    -- Expense breakdown
    SUM(CASE WHEN flow_direction = 'outbound' AND transaction_type = 'contractor_payout' AND status = 'succeeded' THEN amount_cents ELSE 0 END) / 100.0 as contractor_expenses_usd,
    SUM(CASE WHEN flow_direction = 'outbound' AND status = 'succeeded' THEN amount_cents ELSE 0 END) / 100.0 as total_expenses_usd,
    
    -- Net and fees
    SUM(CASE WHEN status = 'succeeded' THEN fee_cents ELSE 0 END) / 100.0 as stripe_fees_usd,
    SUM(CASE WHEN status = 'succeeded' THEN net_amount_cents ELSE 0 END) / 100.0 as net_revenue_usd,
    
    -- Transaction counts
    COUNT(CASE WHEN flow_direction = 'inbound' AND status = 'succeeded' THEN 1 END) as income_transaction_count,
    COUNT(CASE WHEN flow_direction = 'outbound' AND status = 'succeeded' THEN 1 END) as expense_transaction_count,
    
    -- Customer metrics
    COUNT(DISTINCT CASE WHEN flow_direction = 'inbound' AND transaction_type = 'subscription_payment' AND status = 'succeeded' THEN customer_id END) as paying_subscribers,
    COUNT(DISTINCT CASE WHEN flow_direction = 'outbound' AND transaction_type = 'contractor_payout' AND status = 'succeeded' THEN contractor_id END) as paid_contractors
    
FROM public.stripe_transactions
WHERE status != 'failed'
GROUP BY DATE(stripe_created_at)
ORDER BY transaction_date DESC;

COMMENT ON VIEW public.stripe_daily_summary IS 
    'Daily rollup of Stripe income vs expenses with growth metrics';

-- 3. Create view for month-to-date summary
CREATE OR REPLACE VIEW public.stripe_mtd_summary AS
SELECT 
    DATE_TRUNC('month', stripe_created_at) as month,
    
    -- Income
    SUM(CASE WHEN flow_direction = 'inbound' AND transaction_type = 'subscription_payment' AND status = 'succeeded' THEN amount_cents ELSE 0 END) / 100.0 as subscription_income_usd,
    SUM(CASE WHEN flow_direction = 'inbound' AND transaction_type = 'invoice_payment' AND status = 'succeeded' THEN amount_cents ELSE 0 END) / 100.0 as invoice_income_usd,
    SUM(CASE WHEN flow_direction = 'inbound' AND status = 'succeeded' THEN amount_cents ELSE 0 END) / 100.0 as total_income_usd,
    
    -- Expenses
    SUM(CASE WHEN flow_direction = 'outbound' AND transaction_type = 'contractor_payout' AND status = 'succeeded' THEN amount_cents ELSE 0 END) / 100.0 as contractor_expenses_usd,
    SUM(CASE WHEN flow_direction = 'outbound' AND status = 'succeeded' THEN amount_cents ELSE 0 END) / 100.0 as total_expenses_usd,
    
    -- Profitability
    (SUM(CASE WHEN flow_direction = 'inbound' AND status = 'succeeded' THEN amount_cents ELSE 0 END) - 
     SUM(CASE WHEN flow_direction = 'outbound' AND status = 'succeeded' THEN amount_cents ELSE 0 END)) / 100.0 as gross_profit_usd,
    
    SUM(CASE WHEN status = 'succeeded' THEN fee_cents ELSE 0 END) / 100.0 as stripe_fees_usd,
    SUM(CASE WHEN status = 'succeeded' THEN net_amount_cents ELSE 0 END) / 100.0 as net_revenue_usd,
    
    -- Growth metrics
    COUNT(DISTINCT CASE WHEN flow_direction = 'inbound' AND transaction_type = 'subscription_payment' AND status = 'succeeded' THEN customer_id END) as unique_subscribers,
    COUNT(DISTINCT CASE WHEN flow_direction = 'outbound' AND transaction_type = 'contractor_payout' AND status = 'succeeded' THEN contractor_id END) as contractors_paid
    
FROM public.stripe_transactions
WHERE status != 'failed'
GROUP BY DATE_TRUNC('month', stripe_created_at)
ORDER BY month DESC;

-- 4. Function to log subscription payments from webhooks
CREATE OR REPLACE FUNCTION public.log_stripe_subscription_payment(
    p_stripe_id text,
    p_amount_cents bigint,
    p_fee_cents bigint,
    p_customer_id uuid,
    p_subscription_id text,
    p_stripe_created_at timestamptz
) RETURNS uuid AS $$
DECLARE
    v_transaction_id uuid;
BEGIN
    INSERT INTO public.stripe_transactions (
        stripe_id,
        transaction_type,
        amount_cents,
        currency,
        net_amount_cents,
        fee_cents,
        flow_direction,
        customer_id,
        subscription_id,
        status,
        description,
        stripe_created_at
    ) VALUES (
        p_stripe_id,
        'subscription_payment',
        p_amount_cents,
        'usd',
        p_amount_cents - p_fee_cents,
        p_fee_cents,
        'inbound',
        p_customer_id,
        p_subscription_id,
        'succeeded',
        'Monthly subscription payment',
        p_stripe_created_at
    )
    ON CONFLICT (stripe_id) DO UPDATE SET
        status = 'succeeded',
        updated_at = NOW()
    RETURNING id INTO v_transaction_id;
    
    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Function to log contractor payouts
CREATE OR REPLACE FUNCTION public.log_stripe_contractor_payout(
    p_stripe_id text,
    p_amount_cents bigint,
    p_contractor_id uuid,
    p_description text,
    p_stripe_created_at timestamptz
) RETURNS uuid AS $$
DECLARE
    v_transaction_id uuid;
BEGIN
    INSERT INTO public.stripe_transactions (
        stripe_id,
        transaction_type,
        amount_cents,
        currency,
        net_amount_cents,
        fee_cents,
        flow_direction,
        contractor_id,
        status,
        description,
        stripe_created_at
    ) VALUES (
        p_stripe_id,
        'contractor_payout',
        p_amount_cents,
        'usd',
        p_amount_cents, -- Full amount to contractor
        0, -- No fee on outbound
        'outbound',
        p_contractor_id,
        'succeeded',
        p_description,
        p_stripe_created_at
    )
    ON CONFLICT (stripe_id) DO UPDATE SET
        status = 'succeeded',
        updated_at = NOW()
    RETURNING id INTO v_transaction_id;
    
    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RLS Policies
ALTER TABLE public.stripe_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all transactions"
    ON public.stripe_transactions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.app_admins
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Grant permissions
GRANT SELECT ON public.stripe_transactions TO authenticated;
GRANT SELECT ON public.stripe_daily_summary TO authenticated;
GRANT SELECT ON public.stripe_mtd_summary TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Stripe Financial Monitor created successfully';
    RAISE NOTICE '📊 Tables: stripe_transactions';
    RAISE NOTICE '📈 Views: stripe_daily_summary, stripe_mtd_summary';
    RAISE NOTICE '🔧 Functions: log_stripe_subscription_payment(), log_stripe_contractor_payout()';
    RAISE NOTICE '';
    RAISE NOTICE '💡 Usage:';
    RAISE NOTICE '   SELECT * FROM stripe_daily_summary WHERE transaction_date >= CURRENT_DATE - 30;';
    RAISE NOTICE '   SELECT * FROM stripe_mtd_summary;';
END $$;
