-- Active Credit Accounts Tracker
-- Monitor current credit accounts for violations and unfair practices
-- Created: January 17, 2026

CREATE TABLE IF NOT EXISTS active_credit_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Account Details
    creditor_name TEXT NOT NULL,
    account_number_last4 TEXT NOT NULL, -- Last 4 digits
    account_type TEXT NOT NULL CHECK (account_type IN ('credit_card', 'personal_loan', 'auto_loan', 'mortgage', 'store_card', 'other')),
    account_status TEXT NOT NULL CHECK (account_status IN ('open', 'closed', 'charged_off', 'in_collections')),
    
    -- Balances & Limits
    reported_balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
    credit_limit DECIMAL(10, 2),
    utilization_percent INTEGER, -- 0-100+
    
    -- Interest & Fees
    current_apr DECIMAL(5, 2), -- e.g., 29.99%
    original_apr DECIMAL(5, 2), -- Original rate when opened
    penalty_apr DECIMAL(5, 2), -- Rate after violations
    annual_fee DECIMAL(10, 2) DEFAULT 0,
    late_fees_total DECIMAL(10, 2) DEFAULT 0,
    over_limit_fees_total DECIMAL(10, 2) DEFAULT 0,
    
    -- Account Age & Payment History
    account_opened DATE NOT NULL,
    account_closed DATE,
    age_years INTEGER,
    age_months INTEGER,
    late_payments_count INTEGER DEFAULT 0,
    on_time_payments_count INTEGER DEFAULT 0,
    
    -- Violation Tracking
    has_violations BOOLEAN DEFAULT FALSE,
    violation_types JSONB, -- Array of violation types
    potential_damages DECIMAL(10, 2) DEFAULT 0,
    
    -- TILA/CARD Act Compliance
    terms_disclosed_properly BOOLEAN DEFAULT TRUE,
    rate_increases_justified BOOLEAN DEFAULT TRUE,
    notice_of_changes_received BOOLEAN DEFAULT TRUE,
    
    -- Dispute Status
    disputed BOOLEAN DEFAULT FALSE,
    dispute_date DATE,
    dispute_method TEXT, -- 'Mail', 'Online', 'CFPB Complaint'
    dispute_notes TEXT,
    
    -- Strategy
    recommended_action TEXT, -- 'Pay down', 'Dispute rate', 'Request hardship', 'Close account', etc.
    priority TEXT CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
    
    -- Metadata
    bureau TEXT CHECK (bureau IN ('equifax', 'experian', 'transunion', 'all')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_active_credit_user ON active_credit_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_active_credit_status ON active_credit_accounts(account_status);
CREATE INDEX IF NOT EXISTS idx_active_credit_violations ON active_credit_accounts(has_violations);
CREATE INDEX IF NOT EXISTS idx_active_credit_priority ON active_credit_accounts(priority);

-- RLS Policies
ALTER TABLE active_credit_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_credit_accounts" ON active_credit_accounts;
CREATE POLICY "users_own_credit_accounts"
    ON active_credit_accounts FOR ALL
    USING (auth.uid() = user_id);

-- Timestamp trigger
DROP FUNCTION IF EXISTS update_active_credit_timestamp() CASCADE;
CREATE OR REPLACE FUNCTION update_active_credit_timestamp()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_active_credit_timestamp ON active_credit_accounts;
CREATE TRIGGER set_active_credit_timestamp
    BEFORE UPDATE ON active_credit_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_active_credit_timestamp();

-- Comments
COMMENT ON TABLE active_credit_accounts IS 'Track active credit accounts and identify violations of TILA, CARD Act, and unfair practices';
COMMENT ON COLUMN active_credit_accounts.current_apr IS 'Current Annual Percentage Rate - track for unfair increases';
COMMENT ON COLUMN active_credit_accounts.violation_types IS 'Array of violations: rate_increase_no_notice, unfair_fees, deceptive_practices, etc.';
COMMENT ON COLUMN active_credit_accounts.potential_damages IS 'Estimated damages from violations for settlement leverage';
