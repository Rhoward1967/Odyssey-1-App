-- UCC-1 Compliance Logging System
-- Records all invoice payments as partial debt satisfaction per UCC-1 secured interest

-- Create UCC-1 compliance log table
CREATE TABLE IF NOT EXISTS public.ucc1_compliance_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id TEXT NOT NULL,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  secured_party TEXT DEFAULT 'Howard Jones Family Ancestral Trust',
  debtor_entity TEXT DEFAULT 'ODYSSEY-1 AI LLC',
  security_interest_amount NUMERIC(12,2) DEFAULT 350000.00,
  
  -- Audit trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_amount CHECK (amount > 0),
  CONSTRAINT valid_security_interest CHECK (security_interest_amount >= 0)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_ucc1_log_invoice_id ON public.ucc1_compliance_log(invoice_id);
CREATE INDEX IF NOT EXISTS idx_ucc1_log_payment_id ON public.ucc1_compliance_log(payment_id);
CREATE INDEX IF NOT EXISTS idx_ucc1_log_logged_at ON public.ucc1_compliance_log(logged_at DESC);

-- RLS Policies: Only service role can write, authenticated users can read their own
ALTER TABLE public.ucc1_compliance_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can insert UCC-1 logs" ON public.ucc1_compliance_log;
CREATE POLICY "Service role can insert UCC-1 logs"
ON public.ucc1_compliance_log
FOR INSERT
TO service_role
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own UCC-1 logs" ON public.ucc1_compliance_log;
CREATE POLICY "Users can view their own UCC-1 logs"
ON public.ucc1_compliance_log
FOR SELECT
TO authenticated
USING (
  invoice_id IN (
    SELECT id FROM invoices WHERE user_id = auth.uid()
  )
);

-- Database function to record UCC-1 compliance entry
CREATE OR REPLACE FUNCTION public.record_ucc1_log(
  p_payment_id TEXT,
  p_invoice_id UUID,
  p_amount NUMERIC
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert compliance log entry
  INSERT INTO public.ucc1_compliance_log (
    payment_id,
    invoice_id,
    amount,
    logged_at,
    secured_party,
    debtor_entity,
    security_interest_amount
  )
  VALUES (
    p_payment_id,
    p_invoice_id,
    p_amount,
    NOW(),
    'Howard Jones Family Ancestral Trust',
    'ODYSSEY-1 AI LLC',
    350000.00
  );

  RAISE NOTICE '✅ UCC-1 Compliance: Payment % recorded as partial satisfaction of $350k secured debt', p_payment_id;
END;
$$;

-- Grant execute to service_role
GRANT EXECUTE ON FUNCTION public.record_ucc1_log TO service_role;

-- Verification query
DO $$
BEGIN
  RAISE NOTICE '✅ UCC-1 Compliance System Deployed';
  RAISE NOTICE '   Table: ucc1_compliance_log';
  RAISE NOTICE '   Function: record_ucc1_log(payment_id, invoice_id, amount)';
  RAISE NOTICE '   Secured Party: Howard Jones Family Ancestral Trust';
  RAISE NOTICE '   Debtor Entity: ODYSSEY-1 AI LLC';
  RAISE NOTICE '   Security Interest: $350,000.00';
  RAISE NOTICE '   All invoice payments now logged as partial debt satisfaction';
END $$;
