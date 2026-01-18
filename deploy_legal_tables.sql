-- Deploy Legal Defense System Tables
-- Run with: supabase db execute --file deploy_legal_tables.sql

-- Table 1: Legal Defense Accounts
CREATE TABLE IF NOT EXISTS legal_defense_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    creditor TEXT NOT NULL,
    original_amount DECIMAL(10, 2) NOT NULL,
    current_amount DECIMAL(10, 2) NOT NULL,
    account_number TEXT NOT NULL,
    last_payment_date TIMESTAMPTZ NOT NULL,
    date_of_default TIMESTAMPTZ NOT NULL,
    collection_letter_received TIMESTAMPTZ,
    collection_agency TEXT,
    collection_agency_address TEXT,
    collection_agency_phone TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'statute_expired', 'validation_pending', 'disputed', 'settled', 'paid')),
    certified_mail_tracking TEXT,
    validation_letter_sent TIMESTAMPTZ,
    credit_dispute_sent TIMESTAMPTZ,
    response_received TIMESTAMPTZ,
    response_text TEXT,
    settlement_offer_amount DECIMAL(10, 2),
    settlement_offer_date TIMESTAMPTZ,
    settlement_accepted BOOLEAN DEFAULT FALSE,
    settlement_paid_date TIMESTAMPTZ,
    statute_expired BOOLEAN DEFAULT FALSE,
    defense_strength INTEGER,
    risk_level TEXT CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    applicable_laws JSONB,
    detected_violations JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_legal_defense_user ON legal_defense_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_legal_defense_status ON legal_defense_accounts(status);
CREATE INDEX IF NOT EXISTS idx_legal_defense_statute ON legal_defense_accounts(statute_expired);

ALTER TABLE legal_defense_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own legal defense accounts" ON legal_defense_accounts;
DROP POLICY IF EXISTS "Users can insert own legal defense accounts" ON legal_defense_accounts;
DROP POLICY IF EXISTS "Users can update own legal defense accounts" ON legal_defense_accounts;
DROP POLICY IF EXISTS "Users can delete own legal defense accounts" ON legal_defense_accounts;

CREATE POLICY "Users can view own legal defense accounts"
    ON legal_defense_accounts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own legal defense accounts"
    ON legal_defense_accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own legal defense accounts"
    ON legal_defense_accounts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own legal defense accounts"
    ON legal_defense_accounts FOR DELETE
    USING (auth.uid() = user_id);

DROP FUNCTION IF EXISTS update_legal_defense_timestamp() CASCADE;
CREATE OR REPLACE FUNCTION update_legal_defense_timestamp()
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

DROP TRIGGER IF EXISTS set_legal_defense_timestamp ON legal_defense_accounts;
CREATE TRIGGER set_legal_defense_timestamp
    BEFORE UPDATE ON legal_defense_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_legal_defense_timestamp();

-- Table 2: Evidence Log
CREATE TABLE IF NOT EXISTS evidence_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES legal_defense_accounts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('usps_receipt', 'collection_letter', 'validation_response', 'court_document', 'credit_report', 'other')),
    file_url TEXT NOT NULL,
    file_size_bytes BIGINT,
    mime_type TEXT,
    ocr_text TEXT,
    ocr_confidence DECIMAL(5, 2),
    ocr_processed_at TIMESTAMPTZ,
    detected_violations JSONB,
    violation_count INTEGER DEFAULT 0,
    statutory_damages_total DECIMAL(10, 2) DEFAULT 0,
    document_date TIMESTAMPTZ,
    delivery_date TIMESTAMPTZ,
    response_deadline TIMESTAMPTZ,
    notes TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evidence_account ON evidence_log(account_id);
CREATE INDEX IF NOT EXISTS idx_evidence_user ON evidence_log(user_id);
CREATE INDEX IF NOT EXISTS idx_evidence_type ON evidence_log(file_type);
CREATE INDEX IF NOT EXISTS idx_evidence_deadline ON evidence_log(response_deadline);

ALTER TABLE evidence_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_evidence" ON evidence_log;
CREATE POLICY "users_own_evidence"
    ON evidence_log FOR ALL
    USING (auth.uid() = user_id);

DROP FUNCTION IF EXISTS update_evidence_log_timestamp() CASCADE;
CREATE OR REPLACE FUNCTION update_evidence_log_timestamp()
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

DROP TRIGGER IF EXISTS set_evidence_log_timestamp ON evidence_log;
CREATE TRIGGER set_evidence_log_timestamp
    BEFORE UPDATE ON evidence_log
    FOR EACH ROW
    EXECUTE FUNCTION update_evidence_log_timestamp();
