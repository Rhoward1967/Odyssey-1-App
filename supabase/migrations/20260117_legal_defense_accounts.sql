-- Legal Defense Accounts - Debt tracking with FDCPA/FCRA compliance
-- Created: January 17, 2026

CREATE TABLE IF NOT EXISTS legal_defense_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Account Information
    creditor TEXT NOT NULL,
    original_amount DECIMAL(10, 2) NOT NULL,
    current_amount DECIMAL(10, 2) NOT NULL,
    account_number TEXT NOT NULL,
    
    -- Dates
    last_payment_date TIMESTAMPTZ NOT NULL,
    date_of_default TIMESTAMPTZ NOT NULL,
    collection_letter_received TIMESTAMPTZ,
    
    -- Collection Agency Info
    collection_agency TEXT,
    collection_agency_address TEXT,
    collection_agency_phone TEXT,
    
    -- Legal Tracking
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'statute_expired', 'validation_pending', 'disputed', 'settled', 'paid')),
    certified_mail_tracking TEXT,
    validation_letter_sent TIMESTAMPTZ,
    credit_dispute_sent TIMESTAMPTZ,
    response_received TIMESTAMPTZ,
    response_text TEXT,
    
    -- Settlement Tracking
    settlement_offer_amount DECIMAL(10, 2),
    settlement_offer_date TIMESTAMPTZ,
    settlement_accepted BOOLEAN DEFAULT FALSE,
    settlement_paid_date TIMESTAMPTZ,
    
    -- Analysis Results (JSON)
    statute_expired BOOLEAN DEFAULT FALSE,
    defense_strength INTEGER, -- 0-100%
    risk_level TEXT CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    applicable_laws JSONB,
    detected_violations JSONB,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_legal_defense_user ON legal_defense_accounts(user_id);
CREATE INDEX idx_legal_defense_status ON legal_defense_accounts(status);
CREATE INDEX idx_legal_defense_statute ON legal_defense_accounts(statute_expired);

-- RLS Policies
ALTER TABLE legal_defense_accounts ENABLE ROW LEVEL SECURITY;

-- Users can only see their own accounts
CREATE POLICY "Users can view own legal defense accounts"
    ON legal_defense_accounts FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own accounts
CREATE POLICY "Users can insert own legal defense accounts"
    ON legal_defense_accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own accounts
CREATE POLICY "Users can update own legal defense accounts"
    ON legal_defense_accounts FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own accounts
CREATE POLICY "Users can delete own legal defense accounts"
    ON legal_defense_accounts FOR DELETE
    USING (auth.uid() = user_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_legal_defense_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_legal_defense_timestamp
    BEFORE UPDATE ON legal_defense_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_legal_defense_timestamp();

-- Comments
COMMENT ON TABLE legal_defense_accounts IS 'Debt account tracking with FDCPA/FCRA compliance monitoring';
COMMENT ON COLUMN legal_defense_accounts.statute_expired IS 'Georgia 6-year statute of limitations expired';
COMMENT ON COLUMN legal_defense_accounts.defense_strength IS 'Legal defense strength percentage (0-100)';
COMMENT ON COLUMN legal_defense_accounts.detected_violations IS 'FDCPA violations detected in collection activity';
