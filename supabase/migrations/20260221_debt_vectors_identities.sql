-- ═══════════════════════════════════════════════════════════════════
-- MIGRATION: Debt Validation Vectors & Identity Profiles
-- ═══════════════════════════════════════════════════════════════════
-- Date: February 21, 2026
-- Purpose: Create tables for securitization audit engine
--          (§1692g FDCPA + UCC § 3-301/302 chain of title demands)
-- System: R.O.M.A.N. 2.0 / Odyssey-1 / Howard Jones Bloodline Ancestral Trust
-- ═══════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────
-- TABLE: identities
-- Trust or individual profiles for letter sender block
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Trust / Legal Entity
    trust_name TEXT,          -- e.g. "Howard Jones Bloodline Ancestral Trust"

    -- Trustee / Individual Signatory
    full_name TEXT,           -- Trustee or individual name (appears under trust_name)

    -- Mailing Address
    address TEXT,             -- Street address (used in letter sender + signature block)
    city TEXT,
    state TEXT,
    zip TEXT,

    -- Contact
    email TEXT,
    phone TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE identities IS 'Identity profiles for §1692g dispute letter sender block';
COMMENT ON COLUMN identities.trust_name IS 'Legal trust name — primary sender line (e.g. Howard Jones Bloodline Ancestral Trust)';
COMMENT ON COLUMN identities.full_name IS 'Trustee or individual — signatory line below trust name';

-- Seed the default Trust identity (update address fields via Supabase dashboard)
INSERT INTO identities (trust_name, full_name, address, city, state, zip)
VALUES (
    'Howard Jones Bloodline Ancestral Trust',
    'Rickey Allan Howard',
    '[TRUST MAILING ADDRESS]',
    '[CITY]',
    'GA',
    '[ZIP]'
) ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────
-- TABLE: debt_vectors
-- Individual debts tracked through the securitization audit engine
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS debt_vectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Debt Info (from original creditor records)
    creditor_name TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    account_number_masked TEXT,   -- Last 4 digits or masked account reference
    cusip_id TEXT,                -- If securitized — triggers Section 3 (SPV/CUSIP demands)

    -- Status Lifecycle
    -- Pending Audit → Validation Sent → Non-Response | Responded | Discharged | Settled
    status TEXT NOT NULL DEFAULT 'Pending Audit'
        CHECK (status IN (
            'Pending Audit',
            'Validation Sent',
            'Non-Response',
            'Responded',
            'Discharged',
            'Settled'
        )),

    -- Identity Link (who is sending the letter)
    identity_id UUID REFERENCES identities(id) ON DELETE SET NULL,

    -- Certified Mail Tracking (links to certified_mail_tracking table)
    certified_mail_number TEXT,       -- USPS tracking number (populated after mailing)
    validation_sent_at TIMESTAMPTZ,   -- Timestamp when letter was generated
    response_deadline DATE,           -- 30 days from delivery confirmation

    -- Notes
    notes TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_debt_vectors_status   ON debt_vectors(status);
CREATE INDEX IF NOT EXISTS idx_debt_vectors_identity  ON debt_vectors(identity_id);
CREATE INDEX IF NOT EXISTS idx_debt_vectors_tracking  ON debt_vectors(certified_mail_number);

COMMENT ON TABLE debt_vectors IS 'Consumer debt accounts tracked through FDCPA §1692g securitization audit engine';
COMMENT ON COLUMN debt_vectors.cusip_id IS 'Populated if debt was securitized — triggers SPV/Trust/Servicer standing demands in letter';
COMMENT ON COLUMN debt_vectors.certified_mail_number IS 'USPS certified mail number — links to certified_mail_tracking for R.O.M.A.N. deadline monitoring';
COMMENT ON COLUMN debt_vectors.response_deadline IS '30-day FDCPA validation deadline (calculated from delivery confirmation date)';

-- ─────────────────────────────────────────────────────────────────
-- Timestamp auto-update triggers
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_debt_vectors_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_debt_vectors_timestamp
    BEFORE UPDATE ON debt_vectors
    FOR EACH ROW
    EXECUTE FUNCTION update_debt_vectors_timestamp();

CREATE OR REPLACE FUNCTION update_identities_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_identities_timestamp
    BEFORE UPDATE ON identities
    FOR EACH ROW
    EXECUTE FUNCTION update_identities_timestamp();

-- ─────────────────────────────────────────────────────────────────
-- VIEW: debt_validation_dashboard
-- R.O.M.A.N. monitoring view — debts + deadline status
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW debt_validation_dashboard AS
SELECT
    dv.id,
    dv.creditor_name,
    dv.amount,
    dv.account_number_masked,
    dv.cusip_id,
    dv.status,
    dv.certified_mail_number,
    dv.validation_sent_at,
    dv.response_deadline,
    i.trust_name,
    i.full_name AS trustee_name,
    CASE
        WHEN dv.response_deadline < CURRENT_DATE AND dv.status = 'Validation Sent' THEN 'NON_RESPONSE'
        WHEN dv.response_deadline IS NOT NULL AND (dv.response_deadline - CURRENT_DATE) <= 7
             AND dv.status = 'Validation Sent' THEN 'DEADLINE_IMMINENT'
        WHEN dv.status = 'Validation Sent' THEN 'AWAITING_RESPONSE'
        ELSE dv.status
    END AS monitoring_status,
    (dv.response_deadline - CURRENT_DATE)::INTEGER AS days_until_deadline,
    dv.notes,
    dv.created_at
FROM debt_vectors dv
LEFT JOIN identities i ON dv.identity_id = i.id
ORDER BY dv.response_deadline ASC NULLS LAST, dv.created_at DESC;

COMMENT ON VIEW debt_validation_dashboard IS 'R.O.M.A.N. real-time monitoring for §1692g 30-day response deadlines';

-- ─────────────────────────────────────────────────────────────────
-- FUNCTION: get_non_responders()
-- Returns debts past deadline with no response — escalation trigger
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_non_responders()
RETURNS TABLE (
    debt_id UUID,
    creditor_name TEXT,
    amount DECIMAL,
    certified_mail_number TEXT,
    days_overdue INTEGER,
    response_deadline DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        dv.id,
        dv.creditor_name,
        dv.amount,
        dv.certified_mail_number,
        (CURRENT_DATE - dv.response_deadline)::INTEGER AS days_overdue,
        dv.response_deadline
    FROM debt_vectors dv
    WHERE
        dv.response_deadline < CURRENT_DATE
        AND dv.status = 'Validation Sent'
    ORDER BY days_overdue DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_non_responders IS 'R.O.M.A.N. escalation trigger — identifies collectors past §1692g deadline with no valid response';

-- ═══════════════════════════════════════════════════════════════════
-- R.O.M.A.N. MONITORING QUERIES
-- ═══════════════════════════════════════════════════════════════════
--
-- All debts pending audit:
--   SELECT * FROM debt_vectors WHERE status = 'Pending Audit';
--
-- Dashboard (with deadlines):
--   SELECT * FROM debt_validation_dashboard;
--
-- Escalation list (past deadline):
--   SELECT * FROM get_non_responders();
--
-- Link to certified mail status:
--   SELECT dv.creditor_name, dv.amount, cm.actual_delivery, cm.response_received
--   FROM debt_vectors dv
--   JOIN certified_mail_tracking cm ON dv.certified_mail_number = cm.tracking_number;
-- ═══════════════════════════════════════════════════════════════════
