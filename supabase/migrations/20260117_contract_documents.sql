-- Contract Documents - Store creditor agreements for AI legal analysis
-- R.O.M.A.N. analyzes contracts to find exploitable flaws
-- Created: January 17, 2026

CREATE TABLE IF NOT EXISTS contract_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    debt_account_id UUID REFERENCES legal_defense_accounts(id) ON DELETE CASCADE,
    business_debt_id UUID REFERENCES business_debt_accounts(id) ON DELETE CASCADE,
    
    -- Document Metadata
    document_name TEXT NOT NULL,
    document_type TEXT NOT NULL CHECK (document_type IN (
        'original_contract',
        'credit_agreement',
        'promissory_note',
        'personal_guarantee',
        'collection_letter',
        'demand_letter',
        'lawsuit_complaint',
        'judgment',
        'affidavit',
        'assignment_agreement',
        'other'
    )),
    
    -- File Storage
    file_url TEXT, -- Supabase Storage URL
    file_size_bytes INTEGER,
    mime_type TEXT,
    
    -- OCR/Extracted Text
    extracted_text TEXT, -- Full text extracted from document
    ocr_completed BOOLEAN DEFAULT FALSE,
    ocr_date TIMESTAMPTZ,
    
    -- AI Analysis Results
    ai_analysis_completed BOOLEAN DEFAULT FALSE,
    ai_analysis_date TIMESTAMPTZ,
    ai_model_used TEXT, -- 'claude-sonnet-4.5', 'gemini-2.0-flash', etc.
    
    -- Exploitability Analysis (0-100%)
    exploitability_score INTEGER CHECK (exploitability_score >= 0 AND exploitability_score <= 100),
    exploitability_level TEXT CHECK (exploitability_level IN ('NONE', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
    
    -- Contract Flaws Detected
    flaws_detected JSONB, -- Array of legal flaws found
    /*
    Example structure:
    {
      "missing_signatures": true,
      "ambiguous_terms": ["payment due date", "interest rate calculation"],
      "contradictory_clauses": [{"section_3": "30 days", "section_7": "60 days"}],
      "missing_essential_terms": ["price", "delivery date"],
      "void_for_vagueness": false,
      "statute_of_frauds_violation": true,
      "unconscionable_terms": ["427% APR", "confession of judgment"],
      "procedural_defects": ["not notarized", "missing witness"],
      "robo_signed": true,
      "no_chain_of_title": true
    }
    */
    
    -- Standing Issues
    standing_defects JSONB,
    /*
    {
      "no_original_creditor_assignment": true,
      "missing_chain_of_title": true,
      "insufficient_documentation": true,
      "robo_signed_affidavit": true,
      "affiant_no_personal_knowledge": true
    }
    */
    
    -- Affirmative Defenses Available
    affirmative_defenses JSONB,
    /*
    [
      {"defense": "Statute of Limitations", "strength": "HIGH", "basis": "Last payment 7 years ago"},
      {"defense": "Lack of Standing", "strength": "CRITICAL", "basis": "No assignment agreement provided"},
      {"defense": "Statute of Frauds", "strength": "MODERATE", "basis": "No written contract for $5000 debt"},
      {"defense": "Payment in Full", "strength": "HIGH", "basis": "Check cashed marked 'payment in full'"},
      {"defense": "Accord and Satisfaction", "strength": "MODERATE", "basis": "Prior settlement agreement"},
      {"defense": "Laches", "strength": "LOW", "basis": "7-year delay prejudiced defendant"}
    ]
    */
    
    -- Counterclaim Opportunities
    counterclaim_potential JSONB,
    /*
    [
      {"claim": "FDCPA Violation", "damages": 1000, "basis": "False threat of arrest"},
      {"claim": "FCRA Violation", "damages": 5000, "basis": "Inaccurate credit reporting"},
      {"claim": "Fraud", "damages": 10000, "basis": "Misrepresented debt amount"},
      {"claim": "Harassment", "damages": 2500, "basis": "Called 47 times in one week"},
      {"claim": "Emotional Distress", "damages": 7500, "basis": "Severe anxiety, medical bills"}
    ]
    */
    
    -- AI-Generated Documents
    motion_to_dismiss_draft TEXT, -- AI-generated motion based on flaws
    answer_with_defenses_draft TEXT, -- AI-generated answer + affirmative defenses
    counterclaim_draft TEXT, -- AI-generated counterclaim
    discovery_requests_draft TEXT, -- AI-generated interrogatories/document requests
    
    -- Strategic Recommendations
    recommended_strategy TEXT, -- 'AGGRESSIVE', 'DEFENSIVE', 'SETTLE', 'IGNORE'
    strategy_reasoning TEXT, -- Why this strategy is recommended
    estimated_success_probability INTEGER CHECK (estimated_success_probability >= 0 AND estimated_success_probability <= 100),
    
    -- Settlement Analysis
    original_debt_amount DECIMAL(15, 2),
    recommended_settlement_amount DECIMAL(15, 2),
    settlement_reasoning TEXT,
    
    -- Critical Warnings
    personal_liability_risk TEXT CHECK (personal_liability_risk IN ('NONE', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
    judgment_risk TEXT CHECK (judgment_risk IN ('NONE', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
    asset_seizure_risk TEXT CHECK (asset_seizure_risk IN ('NONE', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
    
    -- Notes
    notes TEXT,
    attorney_review_required BOOLEAN DEFAULT FALSE,
    attorney_notes TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_contract_docs_user ON contract_documents(user_id);
CREATE INDEX idx_contract_docs_debt ON contract_documents(debt_account_id);
CREATE INDEX idx_contract_docs_business ON contract_documents(business_debt_id);
CREATE INDEX idx_contract_docs_type ON contract_documents(document_type);
CREATE INDEX idx_contract_docs_exploitability ON contract_documents(exploitability_score);
CREATE INDEX idx_contract_docs_analysis ON contract_documents(ai_analysis_completed);

-- RLS Policies
ALTER TABLE contract_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contract documents"
    ON contract_documents FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contract documents"
    ON contract_documents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contract documents"
    ON contract_documents FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contract documents"
    ON contract_documents FOR DELETE
    USING (auth.uid() = user_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_contract_docs_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_contract_docs_timestamp
    BEFORE UPDATE ON contract_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_contract_docs_timestamp();

-- Comments
COMMENT ON TABLE contract_documents IS 'AI-analyzed creditor contracts - find legal flaws, generate defenses, identify counterclaim opportunities';
COMMENT ON COLUMN contract_documents.exploitability_score IS 'How exploitable is this contract? 0=airtight, 100=completely void';
COMMENT ON COLUMN contract_documents.flaws_detected IS 'Legal flaws found: missing signatures, ambiguous terms, contradictions, procedural defects';
COMMENT ON COLUMN contract_documents.standing_defects IS 'Can they even sue? Missing assignments, robo-signing, no personal knowledge';
COMMENT ON COLUMN contract_documents.affirmative_defenses IS 'What defenses can you raise? SOL, standing, statute of frauds, payment, etc.';
COMMENT ON COLUMN contract_documents.counterclaim_potential IS 'Can you sue THEM? FDCPA, FCRA, fraud, harassment damages';
