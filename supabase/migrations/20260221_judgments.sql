-- ============================================================================
-- JUDGMENT TRACKER — Phase 4 Schema
-- ============================================================================
-- R.O.M.A.N. 2.0 — Post-Judgment Enforcement & Garnishment Tracking
--
-- Extends the debt enforcement pipeline after a civil complaint is filed:
--   Phase 1 → debt_vectors: status = 'Validation Sent'
--   Phase 2 → debt_vectors: status = 'Non-Response'
--   Phase 3 → debt_vectors: status = 'Legal Action Pending'
--   Phase 4 → judgments:    status = 'filed' → 'judgment_obtained' → 'satisfied'
--
-- Legal Basis:
--   15 U.S.C. § 1692k    — FDCPA civil judgment
--   O.C.G.A. § 18-4-1   — Georgia Post-Judgment Garnishment
--   O.C.G.A. § 7-4-12   — 7% post-judgment interest rate
--   O.C.G.A. § 9-12-80  — Judgment lien on real property (7 years)
--   O.C.G.A. § 9-12-91  — Judgment lien on personal property
--
-- Howard Jones Bloodline Ancestral Trust — Odyssey-1 AI LLC
-- ============================================================================


-- ── EXPAND debt_vectors STATUS CONSTRAINT ──────────────────────────────────
-- Add new statuses for judgment lifecycle. Drop the old constraint, re-add
-- with expanded values. IF it doesn't exist yet that's fine too.

ALTER TABLE debt_vectors
  DROP CONSTRAINT IF EXISTS debt_vectors_status_check;

ALTER TABLE debt_vectors
  ADD CONSTRAINT debt_vectors_status_check
  CHECK (status IN (
    'Pending',
    'Validation Sent',
    'Validated',
    'Non-Response',
    'Legal Action Pending',
    'Judgment Obtained',
    'Collecting',
    'Satisfied',
    'Resolved',
    'Dismissed'
  ));


-- ── JUDGMENTS TABLE ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS judgments (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to the underlying debt
  debt_vector_id          UUID        REFERENCES debt_vectors(id) ON DELETE SET NULL,

  -- Case identification
  case_number             TEXT        NOT NULL,
  court_name              TEXT        NOT NULL,  -- e.g. 'Magistrate Court of Clarke County'
  court_division          TEXT,                  -- 'Small Claims' | 'General Civil' | 'Federal'
  filing_date             DATE        NOT NULL,

  -- Defendant (the collector being sued)
  defendant_name          TEXT        NOT NULL,
  defendant_address       TEXT,
  defendant_registered_agent TEXT,

  -- Hearing / Trial
  hearing_date            DATE,
  hearing_result          TEXT,  -- 'default_judgment' | 'contested' | 'settled' | 'dismissed'

  -- Judgment
  judgment_date           DATE,
  judgment_amount         NUMERIC(12,2),   -- What the court actually awarded
  fdcpa_damages_awarded   NUMERIC(12,2),
  fcra_damages_awarded    NUMERIC(12,2),
  actual_damages_awarded  NUMERIC(12,2),
  attorney_fees_awarded   NUMERIC(12,2),
  interest_rate           NUMERIC(5,4)  DEFAULT 0.07,  -- O.C.G.A. § 7-4-12: 7% p.a.
  interest_accrual_start  DATE,

  -- Status lifecycle
  status                  TEXT        NOT NULL DEFAULT 'filed'
    CHECK (status IN (
      'filed',            -- Complaint submitted to court
      'served',           -- Defendant served with summons
      'pending_hearing',  -- Hearing date set, awaiting result
      'default_judgment', -- Defendant failed to answer; clerk/judge entered default
      'contested',        -- Defendant filed answer; going to trial
      'judgment_obtained',-- Court entered judgment in plaintiff's favor
      'settled',          -- Settled before/after judgment
      'collecting',       -- Garnishment / collection in progress
      'satisfied',        -- Judgment paid in full
      'dismissed',        -- Case dismissed (without prejudice or with)
      'appealed'          -- Defendant filed appeal
    )),

  -- Garnishment tracking
  garnishment_filed       BOOLEAN     NOT NULL DEFAULT FALSE,
  garnishment_filing_date DATE,
  garnishment_target      TEXT,   -- Bank name or employer being garnished
  garnishment_target_addr TEXT,
  garnishment_amount_collected NUMERIC(12,2) DEFAULT 0,
  garnishment_satisfied   BOOLEAN     NOT NULL DEFAULT FALSE,

  -- Credit reporting clean-up after victory
  cra_deletion_demanded   BOOLEAN     NOT NULL DEFAULT FALSE,
  cra_deletion_confirmed  BOOLEAN     NOT NULL DEFAULT FALSE,

  -- Settlement details (if applicable)
  settlement_amount       NUMERIC(12,2),
  settlement_date         DATE,
  settlement_includes_deletion BOOLEAN DEFAULT FALSE,

  notes                   TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ── INDEXES ────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_judgments_debt_vector
  ON judgments(debt_vector_id);

CREATE INDEX IF NOT EXISTS idx_judgments_status
  ON judgments(status);

CREATE INDEX IF NOT EXISTS idx_judgments_case_number
  ON judgments(case_number);

CREATE INDEX IF NOT EXISTS idx_judgments_defendant
  ON judgments(defendant_name);

CREATE INDEX IF NOT EXISTS idx_judgments_garnishment_active
  ON judgments(garnishment_filed, garnishment_satisfied)
  WHERE garnishment_filed = TRUE AND garnishment_satisfied = FALSE;


-- ── AUTO-TIMESTAMP TRIGGER ─────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_judgments_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_judgments_updated_at ON judgments;
CREATE TRIGGER trg_judgments_updated_at
  BEFORE UPDATE ON judgments
  FOR EACH ROW EXECUTE FUNCTION update_judgments_updated_at();


-- ── POST-JUDGMENT INTEREST VIEW ────────────────────────────────────────────
-- Real-time interest accrual at 7% per annum (O.C.G.A. § 7-4-12)

CREATE OR REPLACE VIEW judgment_interest_view AS
SELECT
  j.id,
  j.case_number,
  j.defendant_name,
  j.court_name,
  j.judgment_amount,
  j.interest_rate,
  j.interest_accrual_start,
  j.status,
  j.garnishment_filed,
  j.garnishment_satisfied,
  j.garnishment_amount_collected,

  -- Days since judgment
  CASE
    WHEN j.interest_accrual_start IS NOT NULL
    THEN (CURRENT_DATE - j.interest_accrual_start)
    ELSE 0
  END AS days_since_judgment,

  -- Accrued interest = Principal × Rate × (Days / 365)
  CASE
    WHEN j.judgment_amount IS NOT NULL AND j.interest_accrual_start IS NOT NULL
    THEN ROUND(
      j.judgment_amount
      * j.interest_rate
      * ((CURRENT_DATE - j.interest_accrual_start)::NUMERIC / 365),
      2
    )
    ELSE 0
  END AS accrued_interest,

  -- Total now owed
  CASE
    WHEN j.judgment_amount IS NOT NULL AND j.interest_accrual_start IS NOT NULL
    THEN ROUND(
      j.judgment_amount
      + (j.judgment_amount * j.interest_rate
         * ((CURRENT_DATE - j.interest_accrual_start)::NUMERIC / 365)),
      2
    )
    ELSE j.judgment_amount
  END AS total_now_owed,

  -- Remaining to collect (after garnishment)
  CASE
    WHEN j.judgment_amount IS NOT NULL AND j.interest_accrual_start IS NOT NULL
    THEN ROUND(
      (j.judgment_amount
       + (j.judgment_amount * j.interest_rate
          * ((CURRENT_DATE - j.interest_accrual_start)::NUMERIC / 365)))
      - COALESCE(j.garnishment_amount_collected, 0),
      2
    )
    ELSE j.judgment_amount - COALESCE(j.garnishment_amount_collected, 0)
  END AS remaining_to_collect

FROM judgments j
WHERE j.status IN ('judgment_obtained', 'collecting', 'default_judgment');


-- ── GARNISHMENT CANDIDATES FUNCTION ───────────────────────────────────────
-- Returns judgments where: judgment obtained, not yet satisfied, no active garnishment

CREATE OR REPLACE FUNCTION get_garnishment_candidates()
RETURNS TABLE (
  judgment_id       UUID,
  case_number       TEXT,
  defendant_name    TEXT,
  court_name        TEXT,
  judgment_amount   NUMERIC,
  accrued_interest  NUMERIC,
  total_now_owed    NUMERIC,
  days_since_judgment INTEGER,
  debt_vector_id    UUID,
  creditor_name     TEXT
) LANGUAGE sql STABLE AS $$
  SELECT
    j.id,
    j.case_number,
    j.defendant_name,
    j.court_name,
    j.judgment_amount,
    ROUND(
      j.judgment_amount * j.interest_rate
      * ((CURRENT_DATE - j.interest_accrual_start)::NUMERIC / 365), 2
    ),
    ROUND(
      j.judgment_amount
      + (j.judgment_amount * j.interest_rate
         * ((CURRENT_DATE - j.interest_accrual_start)::NUMERIC / 365)), 2
    ),
    (CURRENT_DATE - j.interest_accrual_start)::INTEGER,
    j.debt_vector_id,
    dv.creditor_name
  FROM judgments j
  LEFT JOIN debt_vectors dv ON dv.id = j.debt_vector_id
  WHERE
    j.status IN ('judgment_obtained', 'default_judgment')
    AND j.garnishment_filed = FALSE
    AND j.garnishment_satisfied = FALSE
  ORDER BY j.judgment_date ASC;
$$;


-- ── ROMAN ENFORCEMENT SUMMARY VIEW ────────────────────────────────────────
-- Full pipeline status view for R.O.M.A.N. dashboard

CREATE OR REPLACE VIEW roman_enforcement_summary AS
SELECT
  dv.id             AS debt_vector_id,
  dv.creditor_name,
  dv.amount         AS alleged_amount,
  dv.status         AS debt_status,
  dv.certified_mail_number,
  dv.response_deadline,

  j.id              AS judgment_id,
  j.case_number,
  j.court_name,
  j.filing_date,
  j.hearing_date,
  j.judgment_date,
  j.judgment_amount,
  j.status          AS judgment_status,
  j.garnishment_filed,
  j.garnishment_satisfied,
  j.garnishment_amount_collected,
  j.settlement_amount,

  -- Pipeline phase
  CASE
    WHEN j.status = 'satisfied'                          THEN '✅ Phase 4: Satisfied'
    WHEN j.status = 'collecting'                         THEN '⚙️  Phase 4: Garnishment Active'
    WHEN j.status IN ('judgment_obtained','default_judgment') THEN '⚖️  Phase 4: Judgment — File Garnishment'
    WHEN j.status = 'settled'                            THEN '🤝 Phase 4: Settled'
    WHEN j.status IN ('filed','served','pending_hearing') THEN '📋 Phase 3: Civil Action Filed'
    WHEN dv.status = 'Legal Action Pending'              THEN '📋 Phase 3: Complaint Ready'
    WHEN dv.status = 'Non-Response'                      THEN '⚠️  Phase 2: Enforcement Sent'
    WHEN dv.status = 'Validation Sent'                   THEN '📬 Phase 1: Awaiting Response'
    ELSE '🔍 Phase 0: Pending'
  END AS pipeline_phase

FROM debt_vectors dv
LEFT JOIN judgments j ON j.debt_vector_id = dv.id
ORDER BY dv.created_at DESC;


-- ── COMMENTS ──────────────────────────────────────────────────────────────

COMMENT ON TABLE judgments IS
  'R.O.M.A.N. Phase 4 — FDCPA civil judgment and post-judgment garnishment tracking. '
  'O.C.G.A. § 18-4-1 (garnishment), § 7-4-12 (7% interest), § 9-12-80 (lien). '
  'Howard Jones Bloodline Ancestral Trust.';

COMMENT ON VIEW judgment_interest_view IS
  'Live post-judgment interest accrual at 7% per annum (O.C.G.A. § 7-4-12). '
  'Updates daily as CURRENT_DATE advances. Use this for garnishment amount calculation.';

COMMENT ON VIEW roman_enforcement_summary IS
  'Full pipeline view: debt_vectors + judgments joined with phase labels. '
  'R.O.M.A.N. dashboard — shows every debt from Phase 0 through Phase 4 Satisfied.';
