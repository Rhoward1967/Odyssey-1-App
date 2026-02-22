-- ============================================================================
-- BOOK CROSS-REFERENCES — Real-Time Concept Threading
-- ============================================================================
-- Tracks concept connections BETWEEN the 7 books of the Sovereign Self Series.
-- Unlike knowledge_cross_references (external → books), this table maps
-- book ↔ book: where the same concept thread runs through multiple volumes.
--
-- A concept in Book 1 that is reinforced in Book 3 and concluded in Book 7
-- creates a "thread" — a living idea that evolves across the series.
--
-- Howard Jones Bloodline Ancestral Trust — Odyssey-1 AI LLC
-- ============================================================================


-- ── BOOK CONCEPTS TABLE ───────────────────────────────────────────────────────
-- Each concept identified within a specific book.
-- These become the nodes in the cross-reference graph.

CREATE TABLE IF NOT EXISTS book_concepts (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  book_number     INTEGER     NOT NULL CHECK (book_number BETWEEN 1 AND 7),
  concept_tag     TEXT        NOT NULL,   -- slug: 'sovereign-identity', 'chain-of-title'
  concept_label   TEXT        NOT NULL,   -- Human-readable: 'Sovereign Identity'
  concept_category TEXT,                  -- 'law' | 'identity' | 'finance' | 'history' | 'spirituality' | 'governance'
  excerpt         TEXT,                   -- Representative passage from the book
  chapter_ref     TEXT,                   -- Chapter reference if applicable
  weight          INTEGER     DEFAULT 50 CHECK (weight BETWEEN 0 AND 100),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(book_number, concept_tag)
);


-- ── BOOK CROSS-REFERENCES TABLE ───────────────────────────────────────────────
-- The connections between concepts across books.
-- book_a introduces/states a concept; book_b reinforces/evolves/challenges it.

CREATE TABLE IF NOT EXISTS book_cross_references (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The two books being linked
  book_a_number    INTEGER     NOT NULL CHECK (book_a_number BETWEEN 1 AND 7),
  book_b_number    INTEGER     NOT NULL CHECK (book_b_number BETWEEN 1 AND 7),
  CHECK (book_a_number <> book_b_number),

  -- The shared concept
  concept_tag      TEXT        NOT NULL,
  concept_label    TEXT        NOT NULL,
  concept_category TEXT,                  -- 'law' | 'identity' | 'finance' | 'history' | 'spirituality' | 'governance'
  concept_summary  TEXT        NOT NULL,  -- Brief description of the shared concept

  -- Excerpts from each book
  book_a_excerpt   TEXT,
  book_b_excerpt   TEXT,

  -- Nature of the connection
  connection_type  TEXT        NOT NULL DEFAULT 'reinforces'
    CHECK (connection_type IN (
      'reinforces',   -- Book B confirms / strengthens Book A's claim
      'evolves',      -- Book B takes Book A's concept further
      'introduces',   -- Book A introduces; Book B expands
      'concludes',    -- Book B resolves / completes what Book A began
      'contrasts',    -- Book B presents a different angle on same concept
      'mirrors'       -- Both books address same concept independently
    )),

  -- Strength of connection (0-100, Claude-scored)
  strength         INTEGER     DEFAULT 70 CHECK (strength BETWEEN 0 AND 100),

  -- AI analysis metadata
  ai_model         TEXT        DEFAULT 'claude-3-5-sonnet',
  ai_analysis      TEXT,       -- Claude's full synthesis of the connection
  last_analyzed    TIMESTAMPTZ DEFAULT now(),

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ── INDEXES ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_bcr_book_a       ON book_cross_references(book_a_number);
CREATE INDEX IF NOT EXISTS idx_bcr_book_b       ON book_cross_references(book_b_number);
CREATE INDEX IF NOT EXISTS idx_bcr_concept      ON book_cross_references(concept_tag);
CREATE INDEX IF NOT EXISTS idx_bcr_category     ON book_cross_references(concept_category);
CREATE INDEX IF NOT EXISTS idx_bcr_strength     ON book_cross_references(strength DESC);
CREATE INDEX IF NOT EXISTS idx_bcr_type         ON book_cross_references(connection_type);
CREATE INDEX IF NOT EXISTS idx_bc_book          ON book_concepts(book_number);
CREATE INDEX IF NOT EXISTS idx_bc_concept       ON book_concepts(concept_tag);
CREATE INDEX IF NOT EXISTS idx_bc_category      ON book_concepts(concept_category);


-- ── AUTO-TIMESTAMP ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_book_cross_references_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bcr_updated_at ON book_cross_references;
CREATE TRIGGER trg_bcr_updated_at
  BEFORE UPDATE ON book_cross_references
  FOR EACH ROW EXECUTE FUNCTION update_book_cross_references_updated_at();


-- ── CONCEPT THREAD VIEW ───────────────────────────────────────────────────────
-- Shows each concept and which books it threads through, ordered by strength.
-- "The Program concept appears in Books 1, 3, 5, 7 with avg strength 84."

CREATE OR REPLACE VIEW concept_threads AS
WITH concept_books AS (
  SELECT concept_tag, book_a_number AS book_number FROM book_cross_references
  UNION
  SELECT concept_tag, book_b_number  FROM book_cross_references
),
book_lists AS (
  SELECT concept_tag,
         ARRAY_AGG(DISTINCT book_number ORDER BY book_number) AS books
  FROM   concept_books
  GROUP  BY concept_tag
)
SELECT
  r.concept_tag,
  r.concept_label,
  r.concept_category,
  COUNT(DISTINCT r.book_a_number)
    + COUNT(DISTINCT r.book_b_number)          AS book_count_approx,
  bl.books                                     AS appears_in_books,
  ROUND(AVG(r.strength), 1)                   AS avg_strength,
  COUNT(*)                                    AS connection_count,
  MAX(r.last_analyzed)                        AS last_analyzed
FROM book_cross_references r
JOIN book_lists bl ON bl.concept_tag = r.concept_tag
GROUP BY r.concept_tag, r.concept_label, r.concept_category, bl.books
ORDER BY avg_strength DESC, connection_count DESC;


-- ── BOOK CONNECTION MATRIX VIEW ───────────────────────────────────────────────
-- For each pair of books, how many concepts connect them and at what strength.
-- Powers the visual connection matrix in the dashboard.

CREATE OR REPLACE VIEW book_connection_matrix AS
SELECT
  book_a_number,
  book_b_number,
  COUNT(*)                    AS shared_concepts,
  ROUND(AVG(strength), 1)     AS avg_strength,
  MAX(strength)               AS max_strength,
  ARRAY_AGG(concept_label ORDER BY strength DESC) AS concept_labels,
  ARRAY_AGG(concept_tag   ORDER BY strength DESC) AS concept_tags
FROM book_cross_references
GROUP BY book_a_number, book_b_number
ORDER BY book_a_number, book_b_number;


-- ── BOOK CONCEPT SUMMARY VIEW ─────────────────────────────────────────────────
-- Per-book summary: how many concepts, which categories, top connections.

CREATE OR REPLACE VIEW book_concept_summary AS
SELECT
  b.book_number,
  b.title                                     AS book_title,
  COUNT(DISTINCT bcr.concept_tag)             AS total_concepts,
  COUNT(DISTINCT bcr.id)                      AS total_connections,
  ROUND(AVG(bcr.strength), 1)                 AS avg_connection_strength,
  COUNT(DISTINCT CASE WHEN bcr.connection_type = 'reinforces' THEN bcr.id END)  AS reinforces_count,
  COUNT(DISTINCT CASE WHEN bcr.connection_type = 'evolves'    THEN bcr.id END)  AS evolves_count,
  COUNT(DISTINCT CASE WHEN bcr.connection_type = 'concludes'  THEN bcr.id END)  AS concludes_count
FROM books b
LEFT JOIN book_cross_references bcr
  ON bcr.book_a_number = b.book_number OR bcr.book_b_number = b.book_number
GROUP BY b.book_number, b.title
ORDER BY b.book_number;


-- ── FIND RELATED PASSAGES FUNCTION ───────────────────────────────────────────
-- Given a book number and concept tag, returns all passages from OTHER books
-- that share that concept. Powers the "Related Passages" panel.

CREATE OR REPLACE FUNCTION get_related_passages(
  p_book_number  INTEGER,
  p_concept_tag  TEXT
)
RETURNS TABLE (
  related_book_number    INTEGER,
  related_book_title     TEXT,
  connection_type        TEXT,
  strength               INTEGER,
  excerpt                TEXT,
  concept_summary        TEXT,
  ai_analysis            TEXT
) LANGUAGE sql STABLE AS $$
  SELECT
    CASE
      WHEN bcr.book_a_number = p_book_number THEN bcr.book_b_number
      ELSE bcr.book_a_number
    END                   AS related_book_number,
    b.title               AS related_book_title,
    bcr.connection_type,
    bcr.strength,
    CASE
      WHEN bcr.book_a_number = p_book_number THEN bcr.book_b_excerpt
      ELSE bcr.book_a_excerpt
    END                   AS excerpt,
    bcr.concept_summary,
    bcr.ai_analysis
  FROM book_cross_references bcr
  JOIN books b ON b.book_number = (
    CASE
      WHEN bcr.book_a_number = p_book_number THEN bcr.book_b_number
      ELSE bcr.book_a_number
    END
  )
  WHERE
    (bcr.book_a_number = p_book_number OR bcr.book_b_number = p_book_number)
    AND bcr.concept_tag = p_concept_tag
  ORDER BY bcr.strength DESC;
$$;


-- ── RLS ───────────────────────────────────────────────────────────────────────

ALTER TABLE book_cross_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_concepts          ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read cross references"
  ON book_cross_references FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage cross references"
  ON book_cross_references FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_organizations
    WHERE user_id = auth.uid() AND role IN ('admin','owner')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_organizations
    WHERE user_id = auth.uid() AND role IN ('admin','owner')
  ));

CREATE POLICY "Authenticated users can read concepts"
  ON book_concepts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage concepts"
  ON book_concepts FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_organizations
    WHERE user_id = auth.uid() AND role IN ('admin','owner')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_organizations
    WHERE user_id = auth.uid() AND role IN ('admin','owner')
  ));


-- ── COMMENTS ──────────────────────────────────────────────────────────────────

COMMENT ON TABLE book_cross_references IS
  'Real-time concept connections BETWEEN the 7 books of the Sovereign Self Series. '
  'Powered by Claude AI analysis. Each row = a concept thread linking two books. '
  'Howard Jones Bloodline Ancestral Trust.';

COMMENT ON VIEW concept_threads IS
  'Each concept and the books it appears in across the series. '
  'A concept with book_count=5 threads through 5 of the 7 books.';

COMMENT ON VIEW book_connection_matrix IS
  'N×N matrix showing how strongly each book pair is conceptually connected. '
  'Used for the visual connection matrix in the Odyssey-1 dashboard.';

COMMENT ON FUNCTION get_related_passages IS
  'Given a book and concept, returns all passages from other books sharing that concept. '
  'Powers the "Related Passages" side panel in the book reader.';
