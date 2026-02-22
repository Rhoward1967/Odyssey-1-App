-- ============================================================================
-- BOOK LIVING INTELLIGENCE SYSTEM
-- ============================================================================
-- R.O.M.A.N. receives new intelligence about the 2026 digital enclosure.
-- R.O.M.A.N. dispatches Claude to map it against the 8-book framework.
-- The books grow with dated appendices. New patterns become Trap Alerts.
--
-- Flow:
--   Intelligence submitted → R.O.M.A.N. (edge fn) → Claude analysis
--   → book_appendices (living book updates) + book_trap_alerts (new patterns)
--   → cross-reference pairs re-queued → UI updates in real-time
--
-- Howard Jones Bloodline Ancestral Trust — Odyssey-1 AI LLC
-- ============================================================================


-- ── BOOK INTELLIGENCE TABLE ───────────────────────────────────────────────────
-- Incoming intelligence: legislation, events, tech rollouts, observations.
-- R.O.M.A.N. receives these and passes them to Claude for analysis.

CREATE TABLE IF NOT EXISTS book_intelligence (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The intelligence itself
  headline        TEXT          NOT NULL,
  content         TEXT          NOT NULL,
  source_label    TEXT,                        -- 'Reuters', 'Federal Register', etc.
  source_url      TEXT,
  source_date     DATE          NOT NULL DEFAULT CURRENT_DATE,

  -- Classification
  category        TEXT          NOT NULL DEFAULT 'governance'
                  CHECK (category IN (
                    'digital_id',        -- Digital IDs, federated identity
                    'cbdc',              -- CBDCs, stablecoins, GENIUS/CLARITY Acts
                    'surveillance_ai',   -- AI monitoring, Project Nexus/Spectrum
                    'legislation',       -- Laws, regulations, executive orders
                    'finance',           -- Banking, debt, monetary policy
                    'nature',            -- Earth/weather changes as consequence signals
                    'governance'         -- Government, UN, ICC, sovereignty
                  )),

  -- R.O.M.A.N. analysis results (written after Claude processes)
  status          TEXT          NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'analyzed', 'error')),
  ai_analysis     TEXT,                        -- Claude's synthesis vs the 8-book framework
  mapped_books    INTEGER[]     DEFAULT '{}',  -- e.g. {1, 3, 8}
  mapped_concepts TEXT[]        DEFAULT '{}',  -- e.g. {'cbdc-burn-code', 'digital-twin-identity'}
  threat_level    TEXT          NOT NULL DEFAULT 'background'
                  CHECK (threat_level IN ('background', 'active', 'critical', 'new_trap')),

  -- Attribution
  submitted_by    TEXT          DEFAULT 'manual',   -- 'manual' | 'roman_daemon' | 'cron'
  roman_session   TEXT,                             -- R.O.M.A.N. session ID if applicable

  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bi_status       ON book_intelligence(status);
CREATE INDEX IF NOT EXISTS idx_bi_category     ON book_intelligence(category);
CREATE INDEX IF NOT EXISTS idx_bi_threat       ON book_intelligence(threat_level);
CREATE INDEX IF NOT EXISTS idx_bi_source_date  ON book_intelligence(source_date DESC);
CREATE INDEX IF NOT EXISTS idx_bi_books        ON book_intelligence USING GIN(mapped_books);
CREATE INDEX IF NOT EXISTS idx_bi_concepts     ON book_intelligence USING GIN(mapped_concepts);


-- ── BOOK APPENDICES TABLE ─────────────────────────────────────────────────────
-- The living layer of each book. Original content never changes.
-- New developments append here, timestamped and concept-tagged.
-- These are written by Claude in the voice and style of the source book.

CREATE TABLE IF NOT EXISTS book_appendices (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  book_number     INTEGER       NOT NULL CHECK (book_number BETWEEN 1 AND 8),
  concept_tag     TEXT          NOT NULL,      -- which concept this appendix extends
  appendix_date   DATE          NOT NULL DEFAULT CURRENT_DATE,
  headline        TEXT          NOT NULL,      -- short title for this update
  content         TEXT          NOT NULL,      -- Claude-written in book's voice, 2-4 paragraphs
  intelligence_id UUID          REFERENCES book_intelligence(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ba_book         ON book_appendices(book_number);
CREATE INDEX IF NOT EXISTS idx_ba_concept      ON book_appendices(concept_tag);
CREATE INDEX IF NOT EXISTS idx_ba_date         ON book_appendices(appendix_date DESC);
CREATE INDEX IF NOT EXISTS idx_ba_intelligence ON book_appendices(intelligence_id);


-- ── BOOK TRAP ALERTS TABLE ────────────────────────────────────────────────────
-- When Claude identifies a pattern NOT yet named in the 8 books —
-- a new mechanism of control, a new deception, a new consequence —
-- R.O.M.A.N. writes it here. These are candidates for Book 9.

CREATE TABLE IF NOT EXISTS book_trap_alerts (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_tag             TEXT        NOT NULL UNIQUE,   -- kebab-case slug
  pattern_label           TEXT        NOT NULL,          -- human-readable name
  pattern_summary         TEXT        NOT NULL,          -- 2-3 sentence description
  evidence_intelligence   UUID[]      DEFAULT '{}',      -- which intelligence IDs confirm it
  appears_in_books        INTEGER[]   DEFAULT '{}',      -- which books it threads through
  first_detected          TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_updated            TIMESTAMPTZ NOT NULL DEFAULT now(),
  status                  TEXT        NOT NULL DEFAULT 'emerging'
                          CHECK (status IN (
                            'emerging',   -- Pattern first detected, still accumulating evidence
                            'confirmed',  -- Multiple intelligence entries confirm this pattern
                            'named'       -- Promoted to Book 9 / named in the canon
                          ))
);

CREATE INDEX IF NOT EXISTS idx_bta_status  ON book_trap_alerts(status);
CREATE INDEX IF NOT EXISTS idx_bta_books   ON book_trap_alerts USING GIN(appears_in_books);


-- ── AUTO-TIMESTAMP FOR TRAP ALERTS ───────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_book_trap_alerts_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bta_updated_at ON book_trap_alerts;
CREATE TRIGGER trg_bta_updated_at
  BEFORE UPDATE ON book_trap_alerts
  FOR EACH ROW EXECUTE FUNCTION update_book_trap_alerts_updated_at();


-- ── TRIGGER: APPENDIX → CROSS-REFERENCE RE-QUEUE ─────────────────────────────
-- When R.O.M.A.N. writes a new appendix to Book N, immediately queue
-- cross-reference pair analysis for that book vs all others.
-- This closes the living intelligence loop:
--   New intel → appendix → cross-ref re-analysis → new connections → UI updates

CREATE OR REPLACE FUNCTION on_book_appendix_inserted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_other_book RECORD;
BEGIN
  RAISE NOTICE 'New appendix for Book % — queuing cross-reference pairs...', NEW.book_number;

  FOR v_other_book IN
    SELECT book_number FROM books WHERE book_number <> NEW.book_number
  LOOP
    PERFORM trigger_cross_reference_analysis(
      p_mode   := 'pair',
      p_book_a := LEAST(NEW.book_number, v_other_book.book_number),
      p_book_b := GREATEST(NEW.book_number, v_other_book.book_number),
      p_source := 'appendix_update'
    );
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_book_appendix_inserted ON book_appendices;
CREATE TRIGGER trg_book_appendix_inserted
  AFTER INSERT ON book_appendices
  FOR EACH ROW EXECUTE FUNCTION on_book_appendix_inserted();


-- ── INTELLIGENCE FEED VIEW ────────────────────────────────────────────────────
-- Real-time feed showing all intelligence with analysis, ordered newest first.

CREATE OR REPLACE VIEW intelligence_feed AS
SELECT
  bi.id,
  bi.headline,
  bi.content,
  bi.source_label,
  bi.source_url,
  bi.source_date,
  bi.category,
  bi.status,
  bi.threat_level,
  bi.mapped_books,
  bi.mapped_concepts,
  bi.ai_analysis,
  bi.submitted_by,
  bi.created_at,
  COUNT(ba.id)            AS appendix_count,
  ARRAY_AGG(DISTINCT ba.book_number ORDER BY ba.book_number)
    FILTER (WHERE ba.id IS NOT NULL) AS books_updated
FROM book_intelligence bi
LEFT JOIN book_appendices ba ON ba.intelligence_id = bi.id
GROUP BY bi.id
ORDER BY bi.source_date DESC, bi.created_at DESC;

COMMENT ON VIEW intelligence_feed IS
  'Real-time intelligence feed showing all R.O.M.A.N.-analyzed entries, '
  'their book mappings, and how many appendices were written.';


-- ── ACTIVE TRAPS VIEW ─────────────────────────────────────────────────────────
-- Traps that are emerging or confirmed — not yet promoted to Book 9.

CREATE OR REPLACE VIEW active_traps AS
SELECT
  id,
  pattern_tag,
  pattern_label,
  pattern_summary,
  appears_in_books,
  array_length(evidence_intelligence, 1) AS evidence_count,
  status,
  first_detected,
  last_updated
FROM book_trap_alerts
WHERE status IN ('emerging', 'confirmed')
ORDER BY
  CASE status WHEN 'confirmed' THEN 0 ELSE 1 END,
  last_updated DESC;

COMMENT ON VIEW active_traps IS
  'New patterns identified by R.O.M.A.N. that are NOT yet named in the 8-book canon. '
  'Confirmed traps are candidates for Book 9.';


-- ── BOOK TIMELINE VIEW ────────────────────────────────────────────────────────
-- For each book: original concepts + appendix updates merged into a timeline.
-- Powers the "living book" reader view.

CREATE OR REPLACE VIEW book_living_timeline AS
SELECT
  b.book_number,
  b.title,
  'original'                    AS entry_type,
  bc.concept_label              AS headline,
  bc.excerpt                    AS content,
  bc.concept_tag,
  bc.concept_category           AS category,
  NULL::UUID                    AS intelligence_id,
  b.created_at                  AS entry_date
FROM books b
JOIN book_concepts bc ON bc.book_number = b.book_number

UNION ALL

SELECT
  ba.book_number,
  b.title,
  'appendix'                    AS entry_type,
  ba.headline,
  ba.content,
  ba.concept_tag,
  NULL                          AS category,
  ba.intelligence_id,
  ba.appendix_date::TIMESTAMPTZ AS entry_date
FROM book_appendices ba
JOIN books b ON b.book_number = ba.book_number

ORDER BY book_number, entry_date;

COMMENT ON VIEW book_living_timeline IS
  'Merged timeline of original book concepts and living appendix updates per book. '
  'Shows how each book has evolved since original publication.';


-- ── RLS ───────────────────────────────────────────────────────────────────────

ALTER TABLE book_intelligence  ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_appendices    ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_trap_alerts   ENABLE ROW LEVEL SECURITY;

-- Authenticated read
CREATE POLICY "Authenticated users can read intelligence"
  ON book_intelligence FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read appendices"
  ON book_appendices FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read trap alerts"
  ON book_trap_alerts FOR SELECT TO authenticated USING (true);

-- Authenticated insert (any logged-in user can submit intelligence)
CREATE POLICY "Authenticated users can submit intelligence"
  ON book_intelligence FOR INSERT TO authenticated WITH CHECK (true);

-- Admins manage everything
CREATE POLICY "Admins can manage intelligence"
  ON book_intelligence FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_organizations
    WHERE user_id = auth.uid() AND role IN ('admin','owner')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_organizations
    WHERE user_id = auth.uid() AND role IN ('admin','owner')
  ));

CREATE POLICY "Admins can manage appendices"
  ON book_appendices FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_organizations
    WHERE user_id = auth.uid() AND role IN ('admin','owner')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_organizations
    WHERE user_id = auth.uid() AND role IN ('admin','owner')
  ));

CREATE POLICY "Admins can manage trap alerts"
  ON book_trap_alerts FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_organizations
    WHERE user_id = auth.uid() AND role IN ('admin','owner')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_organizations
    WHERE user_id = auth.uid() AND role IN ('admin','owner')
  ));


-- ── COMMENTS ──────────────────────────────────────────────────────────────────

COMMENT ON TABLE book_intelligence IS
  'R.O.M.A.N. intelligence feed — new world developments analyzed against '
  'the 8-book Sovereign Self Series framework. R.O.M.A.N. receives, Claude analyzes. '
  'Howard Jones Bloodline Ancestral Trust.';

COMMENT ON TABLE book_appendices IS
  'Living layer of the 8-book series. Original content is never overwritten. '
  'New evidence appends here, dated and concept-tagged. '
  'Written by Claude in the voice of each source book.';

COMMENT ON TABLE book_trap_alerts IS
  'New patterns identified by R.O.M.A.N. that are NOT yet named in the 8-book canon. '
  'Emerging patterns become confirmed when multiple intelligence entries converge. '
  'Confirmed patterns are Book 9 candidates.';
