-- Migration: Invoice Payment Infrastructure
-- Creates tables for tracking Stripe payment intents and processing

-- 1. Payment Intents Log (tracks Stripe payment intent creation)
CREATE TABLE IF NOT EXISTS public.payment_intents_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id uuid REFERENCES public.invoices(id) ON DELETE CASCADE,
    stripe_payment_intent_id text UNIQUE NOT NULL,
    amount numeric(10,2) NOT NULL,
    status text NOT NULL DEFAULT 'created', -- created, processing, succeeded, failed, canceled
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_intents_invoice_id 
    ON public.payment_intents_log(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_stripe_id 
    ON public.payment_intents_log(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_status 
    ON public.payment_intents_log(status);

COMMENT ON TABLE public.payment_intents_log IS 
    'Tracks Stripe PaymentIntent objects for invoice payments';

-- Enable RLS
ALTER TABLE public.payment_intents_log ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view payment intents for their own invoices
CREATE POLICY "Users can view own payment intents"
    ON public.payment_intents_log
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.invoices
            WHERE invoices.id = payment_intents_log.invoice_id
            AND invoices.user_id = auth.uid()
        )
    );

-- Policy: Admins can view all
CREATE POLICY "Admins can view all payment intents"
    ON public.payment_intents_log
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.app_admins
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- 2. Create or update payments_v2 table for invoice payments
CREATE TABLE IF NOT EXISTS public.payments_v2 (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
    invoice_id uuid REFERENCES public.invoices(id) ON DELETE SET NULL,
    
    -- Amount
    amount numeric(20, 8) NOT NULL,
    currency_code varchar(10) DEFAULT 'USD',
    
    -- Payment method
    payment_method text, -- 'credit_card', 'ach', 'check', 'cash', 'wire'
    payment_date date DEFAULT NOW()::date,
    
    -- Stripe integration
    stripe_payment_intent_id text,
    stripe_charge_id text,
    
    -- Payment details
    notes text,
    status text DEFAULT 'confirmed', -- 'pending', 'confirmed', 'failed', 'refunded'
    
    -- Timestamps
    created_at timestamptz DEFAULT NOW(),
    confirmed_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW(),
    
    -- Metadata
    metadata jsonb DEFAULT '{}'::jsonb
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payments_v2_user_id 
    ON public.payments_v2(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_v2_customer_id 
    ON public.payments_v2(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_v2_invoice_id 
    ON public.payments_v2(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_v2_stripe_payment_intent_id 
    ON public.payments_v2(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_v2_payment_date 
    ON public.payments_v2(payment_date DESC);

COMMENT ON TABLE public.payments_v2 IS 
    'Payment records for invoices and other transactions';
COMMENT ON COLUMN public.payments_v2.invoice_id IS 
    'Links payment to specific invoice';
COMMENT ON COLUMN public.payments_v2.stripe_payment_intent_id IS 
    'Stripe PaymentIntent ID for credit card payments';

-- Enable RLS
ALTER TABLE public.payments_v2 ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own payments
CREATE POLICY "Users can view own payments"
    ON public.payments_v2
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Admins can view all payments
CREATE POLICY "Admins can view all payments"
    ON public.payments_v2
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.app_admins
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- 3. Function to record payment and update invoice status
CREATE OR REPLACE FUNCTION public.record_invoice_payment(
    p_invoice_id uuid,
    p_stripe_payment_intent_id text,
    p_amount numeric,
    p_payment_method text DEFAULT 'credit_card',
    p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_payment_id uuid;
    v_invoice invoices%ROWTYPE;
BEGIN
    -- Get invoice details
    SELECT * INTO v_invoice
    FROM invoices
    WHERE id = p_invoice_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invoice not found: %', p_invoice_id;
    END IF;
    
    -- Check if invoice is already paid
    IF v_invoice.status = 'paid' THEN
        RAISE EXCEPTION 'Invoice already paid: %', v_invoice.invoice_number;
    END IF;
    
    -- Record payment in payments_v2
    INSERT INTO payments_v2 (
        invoice_id,
        stripe_payment_intent_id,
        amount,
        payment_method,
        payment_date,
        customer_id,
        user_id,
        notes,
        metadata
    ) VALUES (
        p_invoice_id,
        p_stripe_payment_intent_id,
        p_amount,
        p_payment_method,
        NOW()::date,
        v_invoice.customer_id,
        v_invoice.user_id,
        'Payment for Invoice #' || v_invoice.invoice_number,
        p_metadata
    )
    RETURNING id INTO v_payment_id;
    
    -- Update invoice status to paid
    UPDATE invoices
    SET status = 'paid',
        updated_at = NOW()
    WHERE id = p_invoice_id;
    
    -- Update payment intent log
    UPDATE payment_intents_log
    SET status = 'succeeded',
        updated_at = NOW()
    WHERE stripe_payment_intent_id = p_stripe_payment_intent_id;
    
    -- Log governance action
    INSERT INTO governance_audit (
        action_type,
        table_name,
        user_id,
        action_description,
        metadata
    ) VALUES (
        'payment_received',
        'invoices',
        v_invoice.user_id,
        'Payment received for invoice #' || v_invoice.invoice_number,
        jsonb_build_object(
            'invoice_id', p_invoice_id,
            'payment_id', v_payment_id,
            'amount', p_amount,
            'payment_method', p_payment_method
        )
    );
    
    RETURN v_payment_id;
END;
$$;

COMMENT ON FUNCTION public.record_invoice_payment(uuid, text, numeric, text, jsonb) IS 
    'Records payment and updates invoice status to paid';

-- 4. View for invoice payment status
CREATE OR REPLACE VIEW public.view_invoice_payment_status AS
SELECT 
    i.id as invoice_id,
    i.invoice_number,
    i.total_amount,
    i.status as invoice_status,
    i.due_date,
    c.company_name as customer_name,
    COALESCE(SUM(p.amount), 0) as total_paid,
    i.total_amount - COALESCE(SUM(p.amount), 0) as balance_due,
    CASE 
        WHEN i.status = 'paid' THEN '✅ Paid'
        WHEN i.due_date < NOW()::date AND i.status != 'paid' THEN '🔴 Overdue'
        WHEN i.status = 'sent' THEN '🟡 Awaiting Payment'
        ELSE '⚪ ' || i.status
    END as payment_status,
    MAX(p.payment_date) as last_payment_date,
    COUNT(p.id) as payment_count
FROM invoices i
LEFT JOIN customers c ON c.id = i.customer_id
LEFT JOIN payments_v2 p ON p.invoice_id = i.id
GROUP BY i.id, i.invoice_number, i.total_amount, i.status, i.due_date, c.company_name
ORDER BY i.created_at DESC;

COMMENT ON VIEW public.view_invoice_payment_status IS 
    'Comprehensive invoice payment tracking and status';

-- Verification
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ INVOICE PAYMENT INFRASTRUCTURE DEPLOYED';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Tables Created:';
    RAISE NOTICE '   • payment_intents_log (tracks Stripe PaymentIntents)';
    RAISE NOTICE '   • payments_v2 updated (invoice_id, stripe_payment_intent_id)';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Functions:';
    RAISE NOTICE '   • record_invoice_payment() - Records payment & updates invoice';
    RAISE NOTICE '';
    RAISE NOTICE '👁️ Views:';
    RAISE NOTICE '   • view_invoice_payment_status - Payment tracking dashboard';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Next Steps:';
    RAISE NOTICE '   1. Deploy invoice-payment-intent Edge Function';
    RAISE NOTICE '   2. Add Stripe Elements to invoice UI';
    RAISE NOTICE '   3. Update stripe-webhook to call record_invoice_payment()';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
END;
$$;
