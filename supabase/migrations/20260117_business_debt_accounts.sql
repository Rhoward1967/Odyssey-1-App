-- Business Debt Accounts - Commercial debt tracking (NOT covered by FDCPA)
-- FDCPA only protects consumers - business debt has different rules
-- Created: January 17, 2026

CREATE TABLE IF NOT EXISTS business_debt_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_entity_id UUID REFERENCES business_entities(id) ON DELETE SET NULL,
    
    -- Account Information
    creditor TEXT NOT NULL,
    creditor_type TEXT CHECK (creditor_type IN (
        'bank',
        'supplier',
        'vendor',
        'landlord',
        'equipment_lease',
        'business_loan',
        'merchant_cash_advance',
        'factoring',
        'line_of_credit',
        'other'
    )),
    
    -- Debt Details
    original_amount DECIMAL(15, 2) NOT NULL,
    current_amount DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(5, 2),
    account_number TEXT NOT NULL,
    
    -- Contract Details
    contract_type TEXT NOT NULL CHECK (contract_type IN ('written', 'oral', 'implied')),
    contract_signed_date DATE,
    personal_guarantee BOOLEAN DEFAULT FALSE, -- DID YOU PERSONALLY GUARANTEE?
    corporate_veil_intact BOOLEAN DEFAULT TRUE, -- LLC protection still valid?
    
    -- Dates
    last_payment_date TIMESTAMPTZ NOT NULL,
    date_of_default TIMESTAMPTZ NOT NULL,
    demand_letter_received TIMESTAMPTZ,
    lawsuit_filed TIMESTAMPTZ,
    judgment_date TIMESTAMPTZ,
    
    -- Collection Activity
    collection_agency TEXT,
    collection_attorney TEXT,
    collection_attorney_bar_number TEXT,
    collection_method TEXT CHECK (collection_method IN (
        'letters',
        'phone_calls',
        'lawsuit',
        'judgment',
        'garnishment',
        'lien',
        'levy',
        'none'
    )),
    
    -- Legal Tracking
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
        'active',
        'statute_expired',
        'disputed',
        'settled',
        'paid',
        'judgment',
        'discharged_bankruptcy'
    )),
    
    -- Defense Strategy
    statute_expired BOOLEAN DEFAULT FALSE,
    statute_expiry_date DATE,
    
    -- Georgia Commercial SOL: 6 years written, 4 years oral (O.C.G.A. §9-3-24, §9-3-25)
    georgia_sol_years INTEGER CHECK (georgia_sol_years IN (4, 6)),
    
    -- Defense Strength Analysis
    defense_strength INTEGER CHECK (defense_strength >= 0 AND defense_strength <= 100),
    risk_level TEXT CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    
    -- Key Defense Issues
    lack_of_consideration BOOLEAN DEFAULT FALSE, -- Did you get what was promised?
    breach_by_creditor BOOLEAN DEFAULT FALSE, -- Did THEY breach first?
    fraudulent_inducement BOOLEAN DEFAULT FALSE, -- Were you tricked into contract?
    unconscionable_terms BOOLEAN DEFAULT FALSE, -- Contract grossly unfair?
    failure_to_mitigate BOOLEAN DEFAULT FALSE, -- Did they make losses worse?
    accord_and_satisfaction BOOLEAN DEFAULT FALSE, -- Already settled?
    payment_in_full BOOLEAN DEFAULT FALSE, -- Already paid?
    
    -- Counterclaim Potential
    has_counterclaim BOOLEAN DEFAULT FALSE,
    counterclaim_amount DECIMAL(15, 2),
    counterclaim_basis TEXT,
    
    -- Strategic Analysis (JSON)
    applicable_defenses JSONB, -- UCC, contract law, statute of frauds, etc.
    creditor_violations JSONB, -- Collection violations (harassment, fraud, etc.)
    asset_protection_strategy JSONB, -- How to shield assets
    
    -- Settlement Tracking
    settlement_offer_amount DECIMAL(15, 2),
    settlement_offer_date TIMESTAMPTZ,
    settlement_accepted BOOLEAN DEFAULT FALSE,
    settlement_paid_date TIMESTAMPTZ,
    
    -- Bankruptcy Considerations
    dischargeable_in_bankruptcy BOOLEAN DEFAULT TRUE,
    bankruptcy_chapter INTEGER CHECK (bankruptcy_chapter IN (7, 11, 13, NULL)),
    
    -- Document Tracking
    contract_on_file BOOLEAN DEFAULT FALSE,
    proof_of_debt_received BOOLEAN DEFAULT FALSE, -- Did they prove you owe it?
    account_stated_sent BOOLEAN DEFAULT FALSE,
    
    -- Notes
    notes TEXT,
    attorney_recommendations TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_business_debt_user ON business_debt_accounts(user_id);
CREATE INDEX idx_business_debt_entity ON business_debt_accounts(business_entity_id);
CREATE INDEX idx_business_debt_status ON business_debt_accounts(status);
CREATE INDEX idx_business_debt_statute ON business_debt_accounts(statute_expired);
CREATE INDEX idx_business_debt_guarantee ON business_debt_accounts(personal_guarantee);

-- RLS Policies
ALTER TABLE business_debt_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own business debt accounts"
    ON business_debt_accounts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own business debt accounts"
    ON business_debt_accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own business debt accounts"
    ON business_debt_accounts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own business debt accounts"
    ON business_debt_accounts FOR DELETE
    USING (auth.uid() = user_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_business_debt_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_business_debt_timestamp
    BEFORE UPDATE ON business_debt_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_business_debt_timestamp();

-- Comments
COMMENT ON TABLE business_debt_accounts IS 'Business/commercial debt tracking - NOT protected by FDCPA consumer laws';
COMMENT ON COLUMN business_debt_accounts.personal_guarantee IS 'CRITICAL: Did you personally guarantee the business debt? This pierces LLC protection.';
COMMENT ON COLUMN business_debt_accounts.corporate_veil_intact IS 'Is LLC/Corp shield still protecting your personal assets?';
COMMENT ON COLUMN business_debt_accounts.georgia_sol_years IS 'Georgia SOL: 6 years for written contracts, 4 years for oral (O.C.G.A. §9-3-24, §9-3-25)';
