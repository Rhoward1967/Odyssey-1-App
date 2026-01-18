-- Credit Inquiries Tracker
-- Track unauthorized credit report pulls (FCRA violations)
-- Created: January 17, 2026

CREATE TABLE IF NOT EXISTS credit_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Inquiry Details
    inquiry_date DATE NOT NULL,
    creditor_name TEXT NOT NULL,
    inquiry_type TEXT NOT NULL CHECK (inquiry_type IN ('hard', 'soft', 'account_review', 'promotional', 'unknown')),
    inquiry_purpose TEXT, -- 'Account Review Inquiry', 'CONS RPT', etc.
    
    -- Authorization Status
    was_authorized BOOLEAN DEFAULT FALSE,
    authorization_notes TEXT,
    
    -- FCRA Violation Tracking
    is_violation BOOLEAN DEFAULT FALSE,
    violation_type TEXT, -- 'Unauthorized pull', 'No permissible purpose', etc.
    dispute_sent BOOLEAN DEFAULT FALSE,
    dispute_date DATE,
    dispute_method TEXT, -- 'Mail', 'Online', 'Phone'
    
    -- Resolution
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'disputed', 'removed', 'verified', 'settled')),
    removed_date DATE,
    settlement_amount DECIMAL(10, 2),
    
    -- Statutory Damages
    statutory_damages DECIMAL(10, 2) DEFAULT 0, -- FCRA: $100-$1000 per violation
    
    -- Metadata
    bureau TEXT CHECK (bureau IN ('equifax', 'experian', 'transunion', 'all')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_credit_inquiries_user ON credit_inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_inquiries_date ON credit_inquiries(inquiry_date);
CREATE INDEX IF NOT EXISTS idx_credit_inquiries_violation ON credit_inquiries(is_violation);
CREATE INDEX IF NOT EXISTS idx_credit_inquiries_status ON credit_inquiries(status);

-- RLS Policies
ALTER TABLE credit_inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_inquiries" ON credit_inquiries;
CREATE POLICY "users_own_inquiries"
    ON credit_inquiries FOR ALL
    USING (auth.uid() = user_id);

-- Timestamp trigger
DROP FUNCTION IF EXISTS update_credit_inquiries_timestamp() CASCADE;
CREATE OR REPLACE FUNCTION update_credit_inquiries_timestamp()
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

DROP TRIGGER IF EXISTS set_credit_inquiries_timestamp ON credit_inquiries;
CREATE TRIGGER set_credit_inquiries_timestamp
    BEFORE UPDATE ON credit_inquiries
    FOR EACH ROW
    EXECUTE FUNCTION update_credit_inquiries_timestamp();

-- Comments
COMMENT ON TABLE credit_inquiries IS 'Track credit report inquiries and FCRA violations (15 USC §1681)';
COMMENT ON COLUMN credit_inquiries.was_authorized IS 'Whether user authorized this credit check';
COMMENT ON COLUMN credit_inquiries.statutory_damages IS 'FCRA statutory damages: $100-$1000 per violation, up to $1000 total or actual damages';
