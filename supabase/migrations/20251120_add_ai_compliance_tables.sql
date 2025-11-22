-- ============================================================================
-- AI COMPLIANCE & FUTURE-PROOFING MIGRATION
-- ============================================================================
-- Purpose: Prepare ODYSSEY-1 for 2030 regulatory landscape
-- Compliance: EU AI Act, GDPR, CCPA, future regulations
-- Created: November 20, 2025
-- 
-- What This Enables:
-- 1. AI Decision Audit Trails (7-year retention for legal compliance)
-- 2. User Consent Management (GDPR Article 7 - explicit consent)
-- 3. Bias Detection & Mitigation (EU AI Act High-Risk requirements)
-- 4. Payment System Flexibility (CBDC, crypto, traditional support)
-- ============================================================================

-- ============================================================================
-- TABLE 1: AI Decision Audit Log
-- ============================================================================
-- Purpose: Track every AI decision for transparency & compliance
-- Retention: 7 years (standard for legal/financial records)
-- Use Case: User requests "Right to Explanation" under GDPR Article 15
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- AI System Identification
  ai_system VARCHAR(50) NOT NULL, -- 'document_review', 'academic_search', 'research_bot', etc.
  model_version VARCHAR(100), -- 'gpt-4-0613', 'claude-3-opus-20240229', etc.
  
  -- Input/Output Data (for audit purposes)
  input_data JSONB NOT NULL, -- What user provided
  output_data JSONB NOT NULL, -- What AI returned
  
  -- Transparency & Explainability (EU AI Act requirement)
  confidence_score NUMERIC(5,2), -- 0.00 to 100.00
  explanation TEXT, -- Human-readable reasoning for decision
  reasoning_chain JSONB, -- Chain-of-Thought steps (XAI)
  
  -- Compliance Flags
  human_oversight BOOLEAN DEFAULT FALSE, -- Was this reviewed by a human?
  user_consent BOOLEAN DEFAULT FALSE, -- Did user explicitly consent?
  bias_check_passed BOOLEAN, -- Did bias detection pass?
  compliance_flags TEXT[] DEFAULT '{}', -- ['gdpr_compliant', 'eu_ai_act_compliant', 'hipaa_compliant']
  
  -- Audit Trail
  ip_address INET, -- For legal proof of origin
  user_agent TEXT,
  session_id UUID,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  retention_until TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 years',
  
  -- Cost Tracking (link to usage system)
  cost_usd NUMERIC(10,6), -- API cost for this decision
  
  -- Metadata (flexible for future needs)
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_decisions_user ON ai_decisions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_decisions_system ON ai_decisions(ai_system);
CREATE INDEX IF NOT EXISTS idx_ai_decisions_created ON ai_decisions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_decisions_retention ON ai_decisions(retention_until) 
  WHERE retention_until < NOW(); -- For auto-deletion jobs

-- RLS Policies
ALTER TABLE ai_decisions ENABLE ROW LEVEL SECURITY;

-- Users can view their own AI decisions
CREATE POLICY ai_decisions_user_select ON ai_decisions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only system can insert (via service role)
CREATE POLICY ai_decisions_service_insert ON ai_decisions
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Admins can view all (for compliance audits)
CREATE POLICY ai_decisions_admin_select ON ai_decisions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================================================
-- TABLE 2: AI Consent Records
-- ============================================================================
-- Purpose: Track user consent for AI usage (GDPR Article 7)
-- Retention: Indefinite (legal proof of consent)
-- Use Case: User revokes consent, we must stop AI processing
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Consent Scope
  ai_system VARCHAR(50) NOT NULL, -- 'document_review', 'academic_search', etc.
  purpose TEXT NOT NULL, -- "Analyze your resume for job matching"
  
  -- Consent Status
  consent_given BOOLEAN NOT NULL,
  consent_timestamp TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ, -- When user withdrew consent
  
  -- Data Handling Terms
  data_retention_days INTEGER DEFAULT 30, -- How long we keep their data
  data_usage_scope TEXT[] DEFAULT '{}', -- ['training', 'inference', 'analytics']
  
  -- Legal Proof (GDPR requirement)
  ip_address INET NOT NULL,
  user_agent TEXT,
  consent_version VARCHAR(20), -- "v1.0" (track changes to terms)
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  UNIQUE(user_id, ai_system) -- One consent record per system per user
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_consents_user ON ai_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_consents_system ON ai_consents(ai_system);
CREATE INDEX IF NOT EXISTS idx_ai_consents_active ON ai_consents(user_id, ai_system) 
  WHERE consent_given = TRUE AND revoked_at IS NULL;

-- RLS Policies
ALTER TABLE ai_consents ENABLE ROW LEVEL SECURITY;

-- Users can view their own consents
CREATE POLICY ai_consents_user_select ON ai_consents
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own consents
CREATE POLICY ai_consents_user_insert ON ai_consents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update (revoke) their own consents
CREATE POLICY ai_consents_user_update ON ai_consents
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- TABLE 3: Bias Detection Results
-- ============================================================================
-- Purpose: Log bias checks on AI outputs (EU AI Act requirement)
-- Use Case: Prove AI system doesn't discriminate
-- ============================================================================

CREATE TABLE IF NOT EXISTS bias_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_decision_id UUID REFERENCES ai_decisions(id) ON DELETE CASCADE,
  
  -- Detection Results
  bias_detected BOOLEAN NOT NULL,
  protected_terms_found TEXT[] DEFAULT '{}', -- ['race', 'gender', 'religion']
  
  -- Scoring
  decolonization_score NUMERIC(5,2), -- 0-100 (Book 5 framework)
  fairness_metrics JSONB, -- Statistical parity, equalized odds, etc.
  
  -- Recommendation
  recommendation VARCHAR(50), -- 'APPROVED', 'FLAG_FOR_REVIEW', 'REJECTED'
  
  -- Human Review (if flagged)
  reviewed_by UUID REFERENCES auth.users(id),
  review_notes TEXT,
  review_timestamp TIMESTAMPTZ,
  
  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bias_checks_decision ON bias_checks(ai_decision_id);
CREATE INDEX IF NOT EXISTS idx_bias_checks_flagged ON bias_checks(bias_detected, recommendation)
  WHERE bias_detected = TRUE;

-- RLS Policies
ALTER TABLE bias_checks ENABLE ROW LEVEL SECURITY;

-- Users can view bias checks for their own AI decisions
CREATE POLICY bias_checks_user_select ON bias_checks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ai_decisions 
      WHERE id = bias_checks.ai_decision_id 
      AND user_id = auth.uid()
    )
  );

-- Only service role can insert
CREATE POLICY bias_checks_service_insert ON bias_checks
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Reviewers can update (add review notes)
CREATE POLICY bias_checks_reviewer_update ON bias_checks
  FOR UPDATE
  USING (auth.uid() = reviewed_by OR auth.role() = 'service_role');

-- ============================================================================
-- TABLE 4: Payment Methods (Future-Proof)
-- ============================================================================
-- Purpose: Support multiple payment types (traditional, CBDC, crypto)
-- Use Case: User pays subscription in USDC stablecoin
-- ============================================================================

CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Payment Type
  method_type VARCHAR(50) NOT NULL, -- 'stripe', 'cbdc', 'crypto_wallet', 'smart_contract'
  
  -- Traditional Payments (Stripe)
  stripe_payment_method_id VARCHAR(255), -- 'pm_xxx'
  stripe_customer_id VARCHAR(255),
  
  -- CBDC (Central Bank Digital Currency)
  cbdc_wallet_address VARCHAR(255), -- FedNow or ECB digital euro wallet
  cbdc_network VARCHAR(50), -- 'fednow', 'ecb_digital_euro', 'digital_yuan'
  
  -- Crypto Payments
  blockchain_network VARCHAR(50), -- 'ethereum', 'bitcoin', 'solana', 'polygon'
  wallet_address VARCHAR(255), -- '0x...' or 'bc1...'
  wallet_type VARCHAR(50), -- 'metamask', 'coinbase_wallet', 'phantom'
  
  -- Smart Contract Subscriptions
  smart_contract_address VARCHAR(255), -- Ethereum subscription contract
  
  -- Status
  is_default BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_default ON payment_methods(user_id) 
  WHERE is_default = TRUE;

-- RLS Policies
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY payment_methods_user_all ON payment_methods
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- TABLE 5: Payments (Extended for Multiple Currencies)
-- ============================================================================
-- Purpose: Track payments in any currency (USD, BTC, USDC, CBDC)
-- ============================================================================

CREATE TABLE IF NOT EXISTS payments_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_method_id UUID REFERENCES payment_methods(id),
  
  -- Amount (8 decimals for crypto support)
  amount NUMERIC(20, 8) NOT NULL,
  currency_code VARCHAR(10) NOT NULL, -- 'USD', 'BTC', 'ETH', 'USDC', 'CBDC-USD'
  
  -- Blockchain Payments
  blockchain_network VARCHAR(50), -- 'ethereum', 'bitcoin', 'solana'
  transaction_hash VARCHAR(128), -- On-chain tx ID
  block_number BIGINT,
  gas_fee NUMERIC(20, 8), -- Gas cost in native token
  
  -- Smart Contract Payments
  smart_contract_address VARCHAR(128),
  smart_contract_function VARCHAR(50), -- 'subscribe', 'renew', 'cancel'
  
  -- Traditional Payments
  stripe_payment_intent_id VARCHAR(255),
  stripe_charge_id VARCHAR(255),
  
  -- CBDC Payments
  cbdc_transaction_id VARCHAR(255),
  cbdc_network VARCHAR(50),
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'failed', 'refunded'
  confirmations INTEGER DEFAULT 0, -- Blockchain confirmations
  
  -- Purpose
  description TEXT,
  subscription_tier VARCHAR(50),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_v2_user ON payments_v2(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_v2_blockchain ON payments_v2(blockchain_network, transaction_hash);
CREATE INDEX IF NOT EXISTS idx_payments_v2_status ON payments_v2(status);

-- RLS Policies
ALTER TABLE payments_v2 ENABLE ROW LEVEL SECURITY;

CREATE POLICY payments_v2_user_select ON payments_v2
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY payments_v2_service_insert ON payments_v2
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Check if user has given consent for AI system
CREATE OR REPLACE FUNCTION has_ai_consent(
  p_user_id UUID,
  p_ai_system VARCHAR(50)
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM ai_consents
    WHERE user_id = p_user_id
    AND ai_system = p_ai_system
    AND consent_given = TRUE
    AND revoked_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get active payment method for user
CREATE OR REPLACE FUNCTION get_default_payment_method(
  p_user_id UUID
) RETURNS TABLE (
  id UUID,
  method_type VARCHAR(50),
  wallet_address VARCHAR(255),
  blockchain_network VARCHAR(50)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pm.id,
    pm.method_type,
    pm.wallet_address,
    pm.blockchain_network
  FROM payment_methods pm
  WHERE pm.user_id = p_user_id
  AND pm.is_default = TRUE
  AND pm.is_verified = TRUE
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-delete expired AI decisions (run nightly)
CREATE OR REPLACE FUNCTION cleanup_expired_ai_decisions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM ai_decisions
  WHERE retention_until < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON ai_decisions, ai_consents, bias_checks, payment_methods, payments_v2 TO authenticated;

-- ============================================================================
-- COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE ai_decisions IS 'AI decision audit log for EU AI Act compliance (7-year retention)';
COMMENT ON TABLE ai_consents IS 'User consent records for AI usage (GDPR Article 7)';
COMMENT ON TABLE bias_checks IS 'Bias detection results for AI outputs (EU AI Act High-Risk requirement)';
COMMENT ON TABLE payment_methods IS 'Multi-currency payment methods (traditional, CBDC, crypto)';
COMMENT ON TABLE payments_v2 IS 'Payment transactions supporting any currency (USD, BTC, USDC, CBDC)';

COMMENT ON COLUMN ai_decisions.reasoning_chain IS 'Chain-of-Thought steps for Explainable AI (XAI)';
COMMENT ON COLUMN ai_consents.consent_version IS 'Track changes to consent terms over time';
COMMENT ON COLUMN bias_checks.decolonization_score IS 'Score based on Book 5 decolonization framework (0-100)';
COMMENT ON COLUMN payments_v2.confirmations IS 'Number of blockchain confirmations (Bitcoin: 6, Ethereum: 12)';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '🚀 AI Compliance & Future-Proof Migration Complete!';
  RAISE NOTICE '✅ ai_decisions table created (7-year audit trail)';
  RAISE NOTICE '✅ ai_consents table created (GDPR consent management)';
  RAISE NOTICE '✅ bias_checks table created (EU AI Act compliance)';
  RAISE NOTICE '✅ payment_methods table created (CBDC + crypto support)';
  RAISE NOTICE '✅ payments_v2 table created (multi-currency)';
  RAISE NOTICE '🎯 ODYSSEY-1 is now 2030-ready!';
END $$;
