-- ============================================================================
-- BANK ACCOUNTS & PAYMENT METHODS
-- © 2025 Rickey A Howard. All Rights Reserved.
-- ============================================================================

-- Company Bank Accounts (for paying FROM)
CREATE TABLE IF NOT EXISTS company_bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Account Details
  account_name TEXT NOT NULL, -- e.g., "Payroll Account", "Operating Account"
  bank_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('checking', 'savings', 'money_market')),
  
  -- Encrypted Banking Info (NEVER log these)
  routing_number TEXT NOT NULL,
  account_number_encrypted TEXT NOT NULL, -- Store encrypted, show last 4 only
  account_number_last4 TEXT NOT NULL, -- For display: ****1234
  
  -- Account Status
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  verification_date TIMESTAMPTZ,
  
  -- Balance Tracking (optional - can sync with bank API)
  current_balance NUMERIC(12, 2),
  last_sync_date TIMESTAMPTZ,
  
  -- Payment Types Enabled
  supports_ach BOOLEAN DEFAULT true,
  supports_wire BOOLEAN DEFAULT false,
  supports_check_printing BOOLEAN DEFAULT true,
  
  -- Plaid/Bank Integration (if using)
  plaid_access_token TEXT,
  plaid_account_id TEXT,
  
  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employee Payment Methods (for paying TO)
CREATE TABLE IF NOT EXISTS employee_payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Payment Method Type
  payment_type TEXT NOT NULL CHECK (payment_type IN ('direct_deposit', 'paper_check', 'paycard')),
  is_primary BOOLEAN DEFAULT true,
  
  -- Direct Deposit Info (encrypted)
  bank_name TEXT,
  routing_number TEXT,
  account_number_encrypted TEXT,
  account_number_last4 TEXT,
  account_type TEXT CHECK (account_type IN ('checking', 'savings')),
  
  -- Paper Check Info
  mailing_address TEXT,
  mailing_city TEXT,
  mailing_state TEXT,
  mailing_zip TEXT,
  
  -- Paycard Info (if using paycard service)
  paycard_provider TEXT,
  paycard_last4 TEXT,
  
  -- Verification
  is_verified BOOLEAN DEFAULT false,
  verification_method TEXT, -- 'microdeposit', 'plaid', 'manual'
  verified_at TIMESTAMPTZ,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Transactions (tracking actual payments)
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Related Records
  paystub_id UUID REFERENCES paystubs(id),
  employee_id UUID REFERENCES employees(id),
  from_account_id UUID REFERENCES company_bank_accounts(id),
  to_payment_method_id UUID REFERENCES employee_payment_methods(id),
  
  -- Payment Details
  payment_type TEXT NOT NULL CHECK (payment_type IN ('ach', 'wire', 'check', 'paycard', 'cash')),
  payment_method TEXT, -- 'direct_deposit', 'paper_check'
  amount NUMERIC(12, 2) NOT NULL,
  
  -- Payment Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',      -- Queued for processing
    'processing',   -- Sent to bank
    'completed',    -- Successfully paid
    'failed',       -- Payment failed
    'cancelled',    -- Cancelled before processing
    'returned'      -- ACH return
  )),
  
  -- Transaction Details
  transaction_date TIMESTAMPTZ DEFAULT NOW(),
  effective_date DATE, -- When funds should arrive
  confirmation_number TEXT, -- Bank confirmation
  check_number TEXT, -- If paper check
  
  -- Error Handling
  error_code TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- ACH/Wire Details
  trace_number TEXT,
  batch_id TEXT,
  
  -- Audit
  initiated_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Batches (group payments together)
CREATE TABLE IF NOT EXISTS payment_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Batch Details
  batch_name TEXT NOT NULL, -- e.g., "Payroll 12/01/24 - 12/15/24"
  batch_type TEXT NOT NULL CHECK (batch_type IN ('payroll', 'contractor', 'bonus', 'expense_reimbursement')),
  
  -- Counts & Totals
  total_transactions INTEGER DEFAULT 0,
  total_amount NUMERIC(12, 2) DEFAULT 0,
  successful_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft',        -- Being prepared
    'pending_approval', -- Awaiting approval
    'approved',     -- Approved, ready to send
    'processing',   -- Sent to bank
    'completed',    -- All payments completed
    'partially_completed', -- Some failed
    'cancelled'     -- Cancelled
  )),
  
  -- Dates
  scheduled_date DATE,
  submitted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Approval
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  
  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link transactions to batches
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES payment_batches(id);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_company_bank_accounts_org ON company_bank_accounts(organization_id);
CREATE INDEX idx_company_bank_accounts_active ON company_bank_accounts(organization_id, is_active);

CREATE INDEX idx_employee_payment_methods_emp ON employee_payment_methods(employee_id);
CREATE INDEX idx_employee_payment_methods_org ON employee_payment_methods(organization_id);
CREATE INDEX idx_employee_payment_methods_primary ON employee_payment_methods(employee_id, is_primary) WHERE is_primary = true;

CREATE INDEX idx_payment_transactions_org ON payment_transactions(organization_id);
CREATE INDEX idx_payment_transactions_paystub ON payment_transactions(paystub_id);
CREATE INDEX idx_payment_transactions_batch ON payment_transactions(batch_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_payment_transactions_date ON payment_transactions(transaction_date);

CREATE INDEX idx_payment_batches_org ON payment_batches(organization_id);
CREATE INDEX idx_payment_batches_status ON payment_batches(status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE company_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_batches ENABLE ROW LEVEL SECURITY;

-- Company Bank Accounts: Only admins can view/manage
CREATE POLICY "Admins can manage company bank accounts"
ON company_bank_accounts FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('owner', 'admin')
  )
);

-- Employee Payment Methods: Employees see their own, admins see all
CREATE POLICY "Users can view own payment methods"
ON employee_payment_methods FOR SELECT
USING (
  employee_id IN (SELECT id FROM employees WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  OR
  organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('owner', 'admin')
  )
);

CREATE POLICY "Admins can manage payment methods"
ON employee_payment_methods FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('owner', 'admin')
  )
);

-- Payment Transactions: Admins only
CREATE POLICY "Admins can manage payment transactions"
ON payment_transactions FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('owner', 'admin')
  )
);

-- Payment Batches: Admins only
CREATE POLICY "Admins can manage payment batches"
ON payment_batches FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('owner', 'admin')
  )
);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to get available company balance
CREATE OR REPLACE FUNCTION get_company_account_balance(
  p_organization_id BIGINT,
  p_account_id UUID DEFAULT NULL
)
RETURNS TABLE (
  account_id UUID,
  account_name TEXT,
  current_balance NUMERIC,
  pending_payments NUMERIC,
  available_balance NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cba.id,
    cba.account_name,
    COALESCE(cba.current_balance, 0),
    COALESCE(SUM(pt.amount) FILTER (WHERE pt.status IN ('pending', 'processing')), 0) as pending,
    COALESCE(cba.current_balance, 0) - COALESCE(SUM(pt.amount) FILTER (WHERE pt.status IN ('pending', 'processing')), 0) as available
  FROM company_bank_accounts cba
  LEFT JOIN payment_transactions pt ON pt.from_account_id = cba.id
  WHERE cba.organization_id = p_organization_id
    AND cba.is_active = true
    AND (p_account_id IS NULL OR cba.id = p_account_id)
  GROUP BY cba.id, cba.account_name, cba.current_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SAMPLE DATA (for testing)
-- ============================================================================

-- Note: In production, account numbers should be encrypted
-- For now, we'll just store last 4 digits for demo purposes

COMMENT ON TABLE company_bank_accounts IS 'Company bank accounts for paying employees (ACH, checks, wire)';
COMMENT ON TABLE employee_payment_methods IS 'Employee payment preferences (direct deposit, paper check, paycard)';
COMMENT ON TABLE payment_transactions IS 'Individual payment transactions with status tracking';
COMMENT ON TABLE payment_batches IS 'Grouped payments for batch processing';
