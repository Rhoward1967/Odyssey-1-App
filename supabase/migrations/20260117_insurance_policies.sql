-- Insurance Policies Tracking
-- Track commercial and personal insurance for strategic debt defense
-- Created: January 17, 2026

CREATE TABLE IF NOT EXISTS insurance_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Policy Details
    policy_number TEXT NOT NULL,
    insurance_carrier TEXT NOT NULL,
    policy_type TEXT NOT NULL CHECK (policy_type IN (
        'general_liability',
        'professional_liability',
        'directors_officers',
        'key_person',
        'business_interruption',
        'commercial_auto',
        'umbrella',
        'life_insurance',
        'disability',
        'other'
    )),
    
    -- Coverage Details
    coverage_amount DECIMAL(15, 2),
    deductible DECIMAL(10, 2),
    premium_annual DECIMAL(10, 2),
    
    -- Covered Entities
    covers_individual BOOLEAN DEFAULT FALSE,
    covers_spouse BOOLEAN DEFAULT FALSE,
    covers_company BOOLEAN DEFAULT FALSE,
    covered_entities TEXT[], -- Array of entity names (HJS LLC, Odyssey-1 AI LLC, etc.)
    
    -- Policy Dates
    policy_start DATE NOT NULL,
    policy_end DATE,
    renewal_date DATE,
    
    -- Legal Defense Coverage
    includes_legal_defense BOOLEAN DEFAULT FALSE,
    legal_defense_limit DECIMAL(10, 2),
    legal_defense_notes TEXT,
    
    -- Strategic Notes
    protects_against TEXT[], -- Array of what this protects: 'business_debt', 'liability_claims', 'asset_seizure', etc.
    claim_history JSONB, -- Past claims filed
    strategic_value TEXT, -- How this policy helps in debt defense
    
    -- Contact Info
    agent_name TEXT,
    agent_phone TEXT,
    agent_email TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_insurance_user ON insurance_policies(user_id);
CREATE INDEX IF NOT EXISTS idx_insurance_type ON insurance_policies(policy_type);
CREATE INDEX IF NOT EXISTS idx_insurance_active ON insurance_policies(is_active);
CREATE INDEX IF NOT EXISTS idx_insurance_renewal ON insurance_policies(renewal_date);

-- RLS Policies
ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_insurance_policies" ON insurance_policies;
CREATE POLICY "users_own_insurance_policies"
    ON insurance_policies FOR ALL
    USING (auth.uid() = user_id);

-- Timestamp trigger
DROP FUNCTION IF EXISTS update_insurance_timestamp() CASCADE;
CREATE OR REPLACE FUNCTION update_insurance_timestamp()
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

DROP TRIGGER IF EXISTS set_insurance_timestamp ON insurance_policies;
CREATE TRIGGER set_insurance_timestamp
    BEFORE UPDATE ON insurance_policies
    FOR EACH ROW
    EXECUTE FUNCTION update_insurance_timestamp();

-- Comments
COMMENT ON TABLE insurance_policies IS 'Track insurance coverage for strategic debt defense and liability protection';
COMMENT ON COLUMN insurance_policies.includes_legal_defense IS 'Whether policy includes legal defense costs (critical for debt litigation)';
COMMENT ON COLUMN insurance_policies.covered_entities IS 'Business entities covered (LLCs, trusts, etc.)';
COMMENT ON COLUMN insurance_policies.protects_against IS 'What this policy shields from: business debt, personal liability, asset seizure, etc.';
COMMENT ON COLUMN insurance_policies.strategic_value IS 'How this policy provides leverage in debt negotiations';
