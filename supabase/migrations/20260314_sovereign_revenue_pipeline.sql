-- ============================================================
-- Sovereign Revenue Pipeline — War Room Console
-- Mission: Acquire 5 units at $1,300+ each
-- Freedom Number Gap: $6,423.09 (after Eye MD at $1,376.91)
-- Howard Jones Bloodline Ancestral Trust / HJS SERVICES LLC
-- Deployed live: March 14, 2026
-- ============================================================

BEGIN;

-- 1) Schema
CREATE SCHEMA IF NOT EXISTS sovereign_bank AUTHORIZATION postgres;

-- 2) Revenue Pipeline Table
CREATE TABLE IF NOT EXISTS sovereign_bank.revenue_pipeline (
  lead_id                  BIGSERIAL PRIMARY KEY,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  client_name              TEXT NOT NULL,
  estimated_monthly_value  NUMERIC(12,2) NOT NULL DEFAULT 1300.00,
  probability_pct          INTEGER CHECK (probability_pct BETWEEN 0 AND 100),
  status                   TEXT NOT NULL DEFAULT 'prospect'
                             CHECK (status IN ('prospect','negotiation','contract_sent','closed','lost')),
  next_action_date         DATE,
  notes                    TEXT
);

-- 3) Freedom Velocity View
--    weighted_pipeline_value  = mathematical likelihood of closing (value × probability)
--    remaining_gap_to_freedom = distance from $7,800/month Freedom Number
--    active_leads             = everything not lost
--    closed_units             = confirmed contracts
--    closed_monthly_value     = locked-in recurring revenue added
CREATE OR REPLACE VIEW sovereign_bank.v_freedom_velocity AS
SELECT
  COALESCE(SUM(estimated_monthly_value * (probability_pct::numeric / 100)), 0)
    AS weighted_pipeline_value,
  6423.09 - COALESCE(SUM(estimated_monthly_value * (probability_pct::numeric / 100)), 0)
    AS remaining_gap_to_freedom,
  COUNT(*) FILTER (WHERE status != 'lost')
    AS active_leads,
  COUNT(*) FILTER (WHERE status = 'closed')
    AS closed_units,
  COALESCE(SUM(estimated_monthly_value) FILTER (WHERE status = 'closed'), 0)
    AS closed_monthly_value
FROM sovereign_bank.revenue_pipeline;

-- 4) Grants
GRANT USAGE ON SCHEMA sovereign_bank TO service_role;
GRANT ALL ON sovereign_bank.revenue_pipeline TO service_role;
GRANT SELECT ON sovereign_bank.v_freedom_velocity TO service_role;

COMMIT;
