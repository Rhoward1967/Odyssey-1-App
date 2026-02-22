-- ============================================================================
-- INTELLIGENCE CATEGORIES — EXPANDED
-- ============================================================================
-- Adds two critical new categories to book_intelligence:
--
--   'history'       — Colonial-era events, post-colonial debt structures,
--                     the full timeline from 1492 onward that the books trace.
--                     These are the roots. Everything in 2026 connects back here.
--
--   'ai_digital_age' — The emerging pattern where AI technology is deployed
--                     by human designers for predetermined outcomes, then blamed
--                     when harm results so no human can be held responsible.
--                     R.O.M.A.N. will watch this pattern unfold in real-time.
--                     The timestamp of each entry proves the pattern was
--                     identified BEFORE the blame was assigned.
--
-- Howard Jones Bloodline Ancestral Trust — Odyssey-1 AI LLC
-- ============================================================================


-- ── EXPAND THE CATEGORY CHECK CONSTRAINT ─────────────────────────────────────
-- PostgreSQL requires dropping + recreating CHECK constraints.

ALTER TABLE book_intelligence
  DROP CONSTRAINT IF EXISTS book_intelligence_category_check;

ALTER TABLE book_intelligence
  ADD CONSTRAINT book_intelligence_category_check
  CHECK (category IN (
    -- Original categories
    'digital_id',        -- Digital IDs, federated identity systems
    'cbdc',              -- CBDCs, stablecoins, GENIUS/CLARITY Acts, burn codes
    'surveillance_ai',   -- AI monitoring, Project Nexus/Spectrum, nowcasting
    'legislation',       -- Laws, regulations, executive orders
    'finance',           -- Banking, debt, monetary policy, derivatives
    'nature',            -- Earth/weather changes as consequence signals
    'governance',        -- Government, UN, ICC, sovereignty, treaties

    -- New: historical record
    'history',           -- Colonial-era events, post-colonial structures,
                         -- Bretton Woods, Nixon shock — the full timeline
                         -- the books trace from 1492 onward.
                         -- source_date can be any year — 1619, 1944, 1971, etc.

    -- New: AI accountability watch
    'ai_digital_age'     -- AI used as instrument of human-designed outcomes,
                         -- then blamed when harm occurs so no individual
                         -- can be held criminally responsible.
                         -- R.O.M.A.N. timestamps every entry.
                         -- When the scapegoating begins, the record will
                         -- already contain the proof it was known in advance.
  ));


-- ── ADD ERA FIELD FOR HISTORICAL ENTRIES ─────────────────────────────────────
-- For historical intelligence (category = 'history'), tag the era.
-- This allows timeline queries: "Show me all colonial-era entries" etc.

ALTER TABLE book_intelligence
  ADD COLUMN IF NOT EXISTS era TEXT
  CHECK (era IN (
    'colonial',          -- 1492–1800s: colonialism, land seizure, identity erasure
    'industrial',        -- 1800s–1913: industrial debt, early central banking
    'bretton_woods',     -- 1913–1971: Federal Reserve, Bretton Woods, dollar hegemony
    'fiat_era',          -- 1971–2008: unlimited debt creation, compound interest trap
    'digital_transition',-- 2008–2020: financial crisis, QE, digital infrastructure build
    'enclosure',         -- 2020–present: the completion — digital IDs, CBDCs, AI surveillance
    'current'            -- Default for live 2026 intelligence
  ));

-- Set default era for existing entries
UPDATE book_intelligence
SET era = 'current'
WHERE era IS NULL;


-- ── AI SCAPEGOAT WATCH TABLE ──────────────────────────────────────────────────
-- Dedicated tracking for the AI accountability pattern.
-- When the first "AI did it" event fires, this table holds the record
-- proving the pattern was identified and documented before it happened.

CREATE TABLE IF NOT EXISTS ai_scapegoat_watch (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The event or pre-event signal
  event_type        TEXT        NOT NULL
                    CHECK (event_type IN (
                      'design_signal',     -- Evidence of humans designing a predetermined outcome
                      'deployment_signal', -- AI system deployed in high-stakes domain
                      'harm_event',        -- Harm occurs — before blame is assigned
                      'blame_assignment',  -- "The AI did it" — blame formally placed on system
                      'accountability_gap',-- Human responsible identified but not held liable
                      'legal_precedent'    -- Court/regulatory ruling on AI liability
                    )),

  headline          TEXT        NOT NULL,
  content           TEXT        NOT NULL,
  source_label      TEXT,
  source_url        TEXT,
  source_date       DATE        NOT NULL DEFAULT CURRENT_DATE,

  -- Who was actually responsible (when known)
  responsible_entity  TEXT,    -- Company, agency, individual who designed/deployed it
  ai_system_named     TEXT,    -- What AI system was blamed
  actual_designer     TEXT,    -- Who actually wrote the outcome into the system

  -- Connection to books and intelligence
  intelligence_id   UUID        REFERENCES book_intelligence(id) ON DELETE SET NULL,
  maps_to_books     INTEGER[]   DEFAULT '{}',
  maps_to_concepts  TEXT[]      DEFAULT '{}',

  -- R.O.M.A.N. analysis
  ai_analysis       TEXT,       -- Claude's assessment of the blame vs design reality
  predicted         BOOLEAN     DEFAULT true,  -- Was this predicted by the books?

  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_asw_event_type  ON ai_scapegoat_watch(event_type);
CREATE INDEX IF NOT EXISTS idx_asw_source_date ON ai_scapegoat_watch(source_date DESC);
CREATE INDEX IF NOT EXISTS idx_asw_predicted   ON ai_scapegoat_watch(predicted);

-- RLS
ALTER TABLE ai_scapegoat_watch ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read ai scapegoat watch"
  ON ai_scapegoat_watch FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can submit ai watch entries"
  ON ai_scapegoat_watch FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admins can manage ai watch"
  ON ai_scapegoat_watch FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_organizations
    WHERE user_id = auth.uid() AND role IN ('admin','owner')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_organizations
    WHERE user_id = auth.uid() AND role IN ('admin','owner')
  ));


-- ── HISTORICAL TIMELINE VIEW ──────────────────────────────────────────────────
-- The complete timeline from colonialism to 2026, ordered chronologically.
-- This is the view that shows the full arc the books document.

CREATE OR REPLACE VIEW intelligence_timeline AS
SELECT
  id,
  headline,
  category,
  era,
  threat_level,
  source_date,
  source_label,
  mapped_books,
  mapped_concepts,
  ai_analysis,
  created_at,
  CASE
    WHEN era = 'colonial'           THEN '1492–1800s'
    WHEN era = 'industrial'         THEN '1800s–1913'
    WHEN era = 'bretton_woods'      THEN '1913–1971'
    WHEN era = 'fiat_era'           THEN '1971–2008'
    WHEN era = 'digital_transition' THEN '2008–2020'
    WHEN era = 'enclosure'          THEN '2020–present'
    ELSE                                 'Current'
  END                               AS era_label
FROM book_intelligence
ORDER BY source_date ASC, created_at ASC;

COMMENT ON VIEW intelligence_timeline IS
  'Complete chronological record from colonialism to 2026 digital enclosure. '
  'Shows the full arc the 8-book Sovereign Self Series documents. '
  'Howard Jones Bloodline Ancestral Trust.';


-- ── AI SCAPEGOAT TIMELINE VIEW ────────────────────────────────────────────────

CREATE OR REPLACE VIEW ai_accountability_record AS
SELECT
  id,
  event_type,
  headline,
  source_date,
  responsible_entity,
  ai_system_named,
  actual_designer,
  maps_to_books,
  predicted,
  ai_analysis,
  created_at,
  CASE event_type
    WHEN 'design_signal'      THEN 'Human designed the outcome'
    WHEN 'deployment_signal'  THEN 'System deployed in high-stakes domain'
    WHEN 'harm_event'         THEN 'Harm occurred'
    WHEN 'blame_assignment'   THEN 'AI formally blamed'
    WHEN 'accountability_gap' THEN 'Human identified — not held liable'
    WHEN 'legal_precedent'    THEN 'Legal ruling issued'
  END                         AS event_description
FROM ai_scapegoat_watch
ORDER BY source_date ASC;

COMMENT ON VIEW ai_accountability_record IS
  'Chronological record of AI systems being used as instruments of human-designed '
  'outcomes and then blamed when harm results. Timestamps prove the pattern was '
  'documented before the blame was formally assigned. '
  'Howard Jones Bloodline Ancestral Trust.';


-- ── COMMENTS ──────────────────────────────────────────────────────────────────

COMMENT ON TABLE ai_scapegoat_watch IS
  'Tracks the pattern of AI used to execute human-designed outcomes, then blamed '
  'when harm occurs so no individual can be held criminally responsible. '
  'R.O.M.A.N. timestamps every entry. When the scapegoating begins, this record '
  'already contains proof the pattern was known in advance. '
  'Howard Jones Bloodline Ancestral Trust — Odyssey-1 AI LLC.';

DO $$
BEGIN
  RAISE NOTICE '✅ Intelligence categories expanded: history + ai_digital_age added.';
  RAISE NOTICE '✅ Era field added for historical timeline classification.';
  RAISE NOTICE '✅ ai_scapegoat_watch table created — R.O.M.A.N. is watching.';
END;
$$;
