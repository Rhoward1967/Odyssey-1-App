-- Business Entities & Legal Structures
-- Track trusts, LLCs, UCC filings, patents for asset protection strategy
-- Created: January 17, 2026

CREATE TABLE IF NOT EXISTS business_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Entity Details
    entity_name TEXT NOT NULL,
    entity_type TEXT NOT NULL CHECK (entity_type IN (
        'trust',
        'llc',
        'corporation',
        'partnership',
        'sole_proprietorship',
        'ucc_filing',
        'patent',
        'trademark',
        'copyright',
        'other'
    )),
    
    -- Identification
    ein_tax_id TEXT,
    state_registration TEXT,
    registration_number TEXT,
    filing_date DATE,
    
    -- Trust-Specific Fields
    trust_type TEXT CHECK (trust_type IN ('revocable', 'irrevocable', 'family', 'asset_protection', 'special_needs', 'other', NULL)),
    trustee_name TEXT,
    beneficiaries TEXT[],
    
    -- LLC/Corporation Fields
    formation_state TEXT,
    registered_agent TEXT,
    operating_agreement_on_file BOOLEAN DEFAULT FALSE,
    corporate_formalities_maintained BOOLEAN DEFAULT TRUE,
    
    -- UCC Filing Fields
    ucc_filing_number TEXT,
    ucc_filing_state TEXT,
    secured_party TEXT,
    debtor_name TEXT,
    collateral_description TEXT, -- What assets are secured (R.O.M.A.N., Patent, etc.)
    
    -- Patent/IP Fields
    patent_number TEXT,
    patent_title TEXT,
    patent_status TEXT CHECK (patent_status IN ('pending', 'granted', 'expired', 'abandoned', NULL)),
    estimated_value DECIMAL(15, 2),
    
    -- Asset Protection Strategy
    holds_assets TEXT[], -- Array of assets held by this entity
    protects_from TEXT[], -- What this shields from: 'personal_liability', 'business_debt', 'creditor_claims', etc.
    veil_piercing_risk TEXT CHECK (veil_piercing_risk IN ('low', 'medium', 'high', NULL)),
    
    -- Strategic Value
    primary_purpose TEXT, -- 'Asset protection', 'IP holding', 'Operating entity', etc.
    strategic_notes TEXT,
    
    -- Relationship to Debt
    associated_debts TEXT[], -- Which debts might be attributed to this entity
    shields_personal_assets BOOLEAN DEFAULT FALSE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    dissolution_date DATE,
    
    -- Documents
    formation_documents_on_file BOOLEAN DEFAULT FALSE,
    annual_filings_current BOOLEAN DEFAULT TRUE,
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_entities_user ON business_entities(user_id);
CREATE INDEX IF NOT EXISTS idx_entities_type ON business_entities(entity_type);
CREATE INDEX IF NOT EXISTS idx_entities_active ON business_entities(is_active);
CREATE INDEX IF NOT EXISTS idx_entities_name ON business_entities(entity_name);

-- RLS Policies
ALTER TABLE business_entities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_business_entities" ON business_entities;
CREATE POLICY "users_own_business_entities"
    ON business_entities FOR ALL
    USING (auth.uid() = user_id);

-- Timestamp trigger
DROP FUNCTION IF EXISTS update_business_entities_timestamp() CASCADE;
CREATE OR REPLACE FUNCTION update_business_entities_timestamp()
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

DROP TRIGGER IF EXISTS set_business_entities_timestamp ON business_entities;
CREATE TRIGGER set_business_entities_timestamp
    BEFORE UPDATE ON business_entities
    FOR EACH ROW
    EXECUTE FUNCTION update_business_entities_timestamp();

-- Comments
COMMENT ON TABLE business_entities IS 'Track trusts, LLCs, UCC filings, patents, and other legal structures for comprehensive asset protection strategy';
COMMENT ON COLUMN business_entities.veil_piercing_risk IS 'Risk that creditors could pierce corporate veil - low if formalities maintained';
COMMENT ON COLUMN business_entities.corporate_formalities_maintained IS 'Whether proper corporate procedures followed (minutes, separate accounts, etc.)';
COMMENT ON COLUMN business_entities.collateral_description IS 'For UCC filings: what assets are secured (R.O.M.A.N., patents, IP, etc.)';
COMMENT ON COLUMN business_entities.shields_personal_assets IS 'Whether this entity protects personal assets from business/entity liabilities';
