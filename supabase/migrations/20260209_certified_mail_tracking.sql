-- ═══════════════════════════════════════════════════════════════════
-- MIGRATION: Certified Mail Tracking System
-- ═══════════════════════════════════════════════════════════════════
-- Date: February 9, 2026
-- Purpose: Create tracking table for FCRA dispute letters and enable
--          R.O.M.A.N. to auto-monitor delivery status and response deadlines
-- Campaign: Trust Creditor Standing - 17 entities notified
-- ═══════════════════════════════════════════════════════════════════

-- Create certified mail tracking table
CREATE TABLE IF NOT EXISTS certified_mail_tracking (
  id SERIAL PRIMARY KEY,
  entity_name TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('financial_institution', 'credit_bureau')),
  tracking_number TEXT UNIQUE NOT NULL,
  account_numbers TEXT[] NOT NULL,
  date_mailed DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery DATE,
  actual_delivery DATE,
  return_receipt_received BOOLEAN DEFAULT FALSE,
  return_receipt_date DATE,
  response_deadline DATE NOT NULL,
  response_received BOOLEAN DEFAULT FALSE,
  response_date DATE,
  response_type TEXT CHECK (response_type IN ('validation', 'deletion', 'verification', 'dispute', 'no_response')),
  fcra_compliant BOOLEAN,
  follow_up_sent BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,
  legal_action_required BOOLEAN DEFAULT FALSE,
  notes TEXT,
  mailing_address JSONB,
  campaign_id TEXT DEFAULT 'TRUST_CREDITOR_STANDING_FEB_2026',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS idx_certified_mail_tracking_number ON certified_mail_tracking(tracking_number);
CREATE INDEX IF NOT EXISTS idx_certified_mail_response_deadline ON certified_mail_tracking(response_deadline);
CREATE INDEX IF NOT EXISTS idx_certified_mail_entity_type ON certified_mail_tracking(entity_type);

-- Insert all 17 certified mailings with tracking numbers
INSERT INTO certified_mail_tracking (
  entity_name, entity_type, tracking_number, account_numbers, date_mailed, 
  expected_delivery, response_deadline, mailing_address, notes
) VALUES
  (
    'Peach State Federal Credit Union',
    'financial_institution',
    '9589 0710 5270 2244 1697 93',
    ARRAY['139209-71', '139209-72', '139209-73'],
    '2026-02-09',
    '2026-02-12',
    '2026-03-11',
    '{"city": "Lawrenceville", "state": "GA"}'::jsonb,
    'Three business accounts - FCRA debt validation request'
  ),
  (
    'JPMorgan Chase Bank',
    'financial_institution',
    '9589 0710 5270 2244 1698 78',
    ARRAY['4147 4004 0372 4568'],
    '2026-02-09',
    '2026-02-12',
    '2026-03-11',
    '{"city": "Wilmington", "state": "DE"}'::jsonb,
    'Credit card account - FCRA debt validation request'
  ),
  (
    'Capital One - Spark Business',
    'financial_institution',
    '9589 0710 5270 2244 1850 45',
    ARRAY['4802 1398 29566031'],
    '2026-02-09',
    '2026-02-14',
    '2026-03-11',
    '{"city": "Salt Lake City", "state": "UT"}'::jsonb,
    'Business credit card - FCRA debt validation request'
  ),
  (
    'Capital One - Consumer',
    'financial_institution',
    '9589 0710 5270 2244 1850 38',
    ARRAY['5178 0588 0973 0768'],
    '2026-02-09',
    '2026-02-14',
    '2026-03-11',
    '{"city": "Salt Lake City", "state": "UT"}'::jsonb,
    'Consumer credit card - FCRA debt validation request'
  ),
  (
    'Citibank',
    'financial_institution',
    '9589 0710 5270 2244 1698 23',
    ARRAY['5424 1815 7366 2751'],
    '2026-02-09',
    '2026-02-14',
    '2026-03-11',
    '{"city": "Sioux Falls", "state": "SD"}'::jsonb,
    'Credit card account - FCRA debt validation request'
  ),
  (
    'American Express - Legal & Compliance (Account 1)',
    'financial_institution',
    '[TRACKING_NUMBER_TO_BE_ADDED]',
    ARRAY['...21007'],
    '2026-02-09',
    '2026-02-14',
    '2026-03-11',
    '{"city": "El Paso", "state": "TX"}'::jsonb,
    'Amex account 1 - FCRA debt validation request'
  ),
  (
    'American Express - Legal & Compliance (Account 2)',
    'financial_institution',
    '[TRACKING_NUMBER_TO_BE_ADDED]',
    ARRAY['...61001'],
    '2026-02-09',
    '2026-02-14',
    '2026-03-11',
    '{"city": "El Paso", "state": "TX"}'::jsonb,
    'Amex account 2 - FCRA debt validation request'
  ),
  (
    'American Express - Business Prime',
    'financial_institution',
    '[TRACKING_NUMBER_TO_BE_ADDED]',
    ARRAY['3792 3675 1681 001'],
    '2026-02-09',
    '2026-02-14',
    '2026-03-11',
    '{"city": "El Paso", "state": "TX"}'::jsonb,
    'Amex Business Prime - FCRA debt validation request'
  ),
  (
    'Synchrony Bank / Sams Club Mastercard',
    'financial_institution',
    '[TRACKING_NUMBER_TO_BE_ADDED]',
    ARRAY['5213 3314 1207 1798'],
    '2026-02-09',
    '2026-02-14',
    '2026-03-11',
    '{"city": "Orlando", "state": "FL"}'::jsonb,
    'Store credit card - FCRA debt validation request'
  ),
  (
    'Intuit Financing (QuickBooks Capital)',
    'financial_institution',
    '9589 0710 5270 2244 1850 21',
    ARRAY['Loan ID: 5ddbbef49b4406fb36932294a4c676a'],
    '2026-02-09',
    '2026-02-14',
    '2026-03-11',
    '{"city": "Mountain View", "state": "CA"}'::jsonb,
    'QB Capital loan - FCRA debt validation + MOSA restructuring notice'
  ),
  (
    'Equifax (Consumer)',
    'credit_bureau',
    '[TRACKING_NUMBER_TO_BE_ADDED]',
    ARRAY['CONSUMER_CREDIT_PROFILE'],
    '2026-02-09',
    '2026-02-12',
    '2026-03-11',
    '{"city": "Atlanta", "state": "GA"}'::jsonb,
    'Consumer credit report dispute - Sovereign Creditor standing'
  ),
  (
    'Equifax Business',
    'credit_bureau',
    '9589 0710 5270 2244 1697 48',
    ARRAY['BUSINESS_CREDIT_PROFILE'],
    '2026-02-09',
    '2026-02-12',
    '2026-03-11',
    '{"city": "Atlanta", "state": "GA"}'::jsonb,
    'Business credit report dispute - Sovereign Creditor standing'
  ),
  (
    'Experian (Consumer)',
    'credit_bureau',
    '[TRACKING_NUMBER_TO_BE_ADDED]',
    ARRAY['CONSUMER_CREDIT_PROFILE'],
    '2026-02-09',
    '2026-02-13',
    '2026-03-11',
    '{"city": "Allen", "state": "TX"}'::jsonb,
    'Consumer credit report dispute - Sovereign Creditor standing'
  ),
  (
    'Experian Business',
    'credit_bureau',
    '9589 0710 5270 2244 1697 31',
    ARRAY['BUSINESS_CREDIT_PROFILE'],
    '2026-02-09',
    '2026-02-13',
    '2026-03-11',
    '{"city": "Allen", "state": "TX"}'::jsonb,
    'Business credit report dispute - Sovereign Creditor standing'
  ),
  (
    'TransUnion',
    'credit_bureau',
    '9589 0710 5270 2244 1697 79',
    ARRAY['CONSUMER_CREDIT_PROFILE'],
    '2026-02-09',
    '2026-02-13',
    '2026-03-11',
    '{"city": "Chester", "state": "PA"}'::jsonb,
    'Consumer credit report dispute - Sovereign Creditor standing'
  ),
  (
    'Dun & Bradstreet',
    'credit_bureau',
    '9589 0710 5270 2244 1697 24',
    ARRAY['BUSINESS_CREDIT_PROFILE'],
    '2026-02-09',
    '2026-02-13',
    '2026-03-11',
    '{"city": "Short Hills", "state": "NJ"}'::jsonb,
    'Business credit report dispute - Sovereign Creditor standing'
  ),
  (
    'Bank of America - Vehicle Loan Servicing',
    'financial_institution',
    '9589 0710 5270 2244 1850 52',
    ARRAY['Jeep Wrangler Loan #63010066944180'],
    '2026-02-09',
    '2026-02-14',
    '2026-03-11',
    '{"street": "PO Box 982235", "city": "El Paso", "state": "TX", "zip": "79998-2235", "department": "Legal Department"}'::jsonb,
    'Corrected address from Wilmington DE to El Paso TX. MOSA senior lien notice + FCRA validation'
  )
ON CONFLICT (tracking_number) DO NOTHING;

-- Create function to check for overdue responses
CREATE OR REPLACE FUNCTION check_overdue_fcra_responses()
RETURNS TABLE (
  entity_name TEXT,
  tracking_number TEXT,
  days_overdue INTEGER,
  response_deadline DATE,
  follow_up_required BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cm.entity_name,
    cm.tracking_number,
    (CURRENT_DATE - cm.response_deadline)::INTEGER as days_overdue,
    cm.response_deadline,
    NOT cm.follow_up_sent as follow_up_required
  FROM certified_mail_tracking cm
  WHERE 
    cm.response_deadline < CURRENT_DATE
    AND cm.response_received = FALSE
    AND cm.campaign_id = 'TRUST_CREDITOR_STANDING_FEB_2026'
  ORDER BY days_overdue DESC;
END;
$$ LANGUAGE plpgsql;

-- Create view for R.O.M.A.N. dashboard
CREATE OR REPLACE VIEW certified_mail_status AS
SELECT 
  entity_name,
  entity_type,
  tracking_number,
  date_mailed,
  expected_delivery,
  actual_delivery,
  return_receipt_received,
  response_deadline,
  response_received,
  response_type,
  fcra_compliant,
  CASE 
    WHEN response_deadline < CURRENT_DATE AND NOT response_received THEN 'OVERDUE'
    WHEN actual_delivery IS NOT NULL AND NOT response_received THEN 'AWAITING_RESPONSE'
    WHEN return_receipt_received AND NOT response_received THEN 'DELIVERED_AWAITING_RESPONSE'
    WHEN response_received AND fcra_compliant THEN 'COMPLIANT'
    WHEN response_received AND NOT fcra_compliant THEN 'NON_COMPLIANT'
    ELSE 'IN_TRANSIT'
  END as status,
  (response_deadline - CURRENT_DATE)::INTEGER as days_until_deadline,
  notes
FROM certified_mail_tracking
WHERE campaign_id = 'TRUST_CREDITOR_STANDING_FEB_2026'
ORDER BY response_deadline ASC, entity_name ASC;

-- ═══════════════════════════════════════════════════════════════════
-- R.O.M.A.N. AUTO-MONITORING QUERIES
-- ═══════════════════════════════════════════════════════════════════
-- 
-- Get all overdue responses:
--   SELECT * FROM check_overdue_fcra_responses();
--
-- Get current status:
--   SELECT * FROM certified_mail_status;
--
-- Get delivery confirmations needed:
--   SELECT entity_name, tracking_number, expected_delivery 
--   FROM certified_mail_tracking 
--   WHERE actual_delivery IS NULL 
--   ORDER BY expected_delivery;
--
-- ═══════════════════════════════════════════════════════════════════

COMMENT ON TABLE certified_mail_tracking IS 'FCRA dispute campaign tracking - Howard Jones Bloodline Ancestral Trust (Feb 9, 2026)';
COMMENT ON FUNCTION check_overdue_fcra_responses IS 'R.O.M.A.N. monitoring function - identifies non-responders requiring follow-up';
COMMENT ON VIEW certified_mail_status IS 'Real-time dashboard for Trust creditor standing enforcement campaign';
