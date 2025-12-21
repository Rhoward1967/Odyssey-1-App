-- ============================================================================
-- R.O.M.A.N. BOOK STATISTICS - DYNAMIC METADATA LAYER
-- ============================================================================
-- "The core Divine Intent of the books remains immutable.
--  Statistics (supporting evidence, frequency, correlation) update in real-time."
--                                                   - Gemini Architect
-- 
-- This migration creates tables for:
-- 1. Tracking real-world validation of The Seven Books
-- 2. Truth Density: How much of each book is proven/supported/challenged
-- 3. Academic Weight: Citation-weighted support scores
-- 4. Autonomous Versioning: v1.1, v1.2, etc. to track knowledge growth
-- ============================================================================

-- Table 1: Book Statistics (Dynamic Metadata Layer)
-- Core text remains immutable; statistics are updated in real-time
CREATE TABLE IF NOT EXISTS book_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_number INTEGER NOT NULL CHECK (book_number BETWEEN 1 AND 7),
  book_title TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  
  -- Correlation Tracking
  support_counter INTEGER DEFAULT 0, -- Papers supporting this book
  challenge_counter INTEGER DEFAULT 0, -- Papers challenging this book
  neutral_counter INTEGER DEFAULT 0, -- Papers with neutral relevance
  
  -- Truth Density Metrics
  chapters_proven INTEGER DEFAULT 0,
  chapters_supported INTEGER DEFAULT 0,
  chapters_challenged INTEGER DEFAULT 0,
  chapters_total INTEGER NOT NULL,
  truth_density_score NUMERIC(5, 2) DEFAULT 0.00, -- Percentage of proven/supported content
  
  -- Weight Metrics
  total_citations INTEGER DEFAULT 0, -- Sum of all supporting paper citations
  academic_weight_score NUMERIC(10, 2) DEFAULT 0.00, -- Citation-weighted support
  
  -- Temporal Tracking
  last_update TIMESTAMPTZ DEFAULT NOW(),
  version_created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(book_number, version)
);

-- Table 2: Chapter Statistics (Granular Book Tracking)
CREATE TABLE IF NOT EXISTS chapter_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_statistics_id UUID REFERENCES book_statistics(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  chapter_title TEXT NOT NULL,
  
  -- Chapter-Level Correlation
  support_counter INTEGER DEFAULT 0,
  challenge_counter INTEGER DEFAULT 0,
  neutral_counter INTEGER DEFAULT 0,
  
  -- Status Classification
  status TEXT CHECK (status IN ('proven', 'supported', 'challenged', 'unverified')) DEFAULT 'unverified',
  
  -- Evidence Strength
  strongest_correlation_id UUID REFERENCES knowledge_cross_references(id),
  correlation_strength_avg NUMERIC(5, 2) DEFAULT 0.00,
  
  last_update TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(book_statistics_id, chapter_number)
);

-- Indexes for Performance
CREATE INDEX idx_book_stats_book ON book_statistics(book_number);
CREATE INDEX idx_book_stats_version ON book_statistics(version);
CREATE INDEX idx_book_stats_truth_density ON book_statistics(truth_density_score DESC);
CREATE INDEX idx_book_stats_weight ON book_statistics(academic_weight_score DESC);

CREATE INDEX idx_chapter_stats_book ON chapter_statistics(book_statistics_id);
CREATE INDEX idx_chapter_stats_status ON chapter_statistics(status);
CREATE INDEX idx_chapter_stats_strength ON chapter_statistics(correlation_strength_avg DESC);

-- Row Level Security
ALTER TABLE book_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapter_statistics ENABLE ROW LEVEL SECURITY;

-- Policies: Everyone can read book statistics
CREATE POLICY "Book statistics readable by all"
  ON book_statistics FOR SELECT
  USING (true);

CREATE POLICY "Chapter statistics readable by all"
  ON chapter_statistics FOR SELECT
  USING (true);

-- Only service role can write (R.O.M.A.N. via romanSupabase.ts)
CREATE POLICY "Only service role can update book stats"
  ON book_statistics FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Only service role can update chapter stats"
  ON chapter_statistics FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Grant permissions to service role
GRANT ALL ON book_statistics TO service_role;
GRANT ALL ON chapter_statistics TO service_role;

-- Initialize Book Statistics (v1.0 for all Seven Books)
INSERT INTO book_statistics (book_number, book_title, chapters_total, version)
VALUES 
  (1, 'The Program: The Origin and Architecture of Disconnection', 12, '1.0'),
  (2, 'The Echo: Deconstructing the Program''s Legacy', 10, '1.0'),
  (3, 'The Sovereign Covenant: Architecting a Divinely Aligned Future', 15, '1.0'),
  (4, 'The Sovereign''s True Collateral: The Bond of the People', 8, '1.0'),
  (5, 'The Alien Program: Deconstructing the Frequencies of History, Identity, and Language', 14, '1.0'),
  (6, 'The Sovereign''s Armory: An Exposé and Guide to Reclaiming Divine Intent', 11, '1.0'),
  (7, 'The Unveiling: How Crypto, Corruption, and AI Proved the Program', 13, '1.0')
ON CONFLICT (book_number, version) DO NOTHING;

-- Views for Book Statistics Dashboard

-- Global Statistics Summary
CREATE OR REPLACE VIEW view_global_book_statistics AS
SELECT 
  COUNT(*) as total_books,
  SUM(support_counter) as total_support,
  SUM(challenge_counter) as total_challenges,
  SUM(neutral_counter) as total_neutral,
  AVG(truth_density_score) as avg_truth_density,
  SUM(total_citations) as total_citations,
  SUM(academic_weight_score) as total_academic_weight
FROM book_statistics
WHERE version = '1.0';

-- Book Growth Timeline (version progression)
CREATE OR REPLACE VIEW view_book_version_timeline AS
SELECT 
  book_number,
  book_title,
  version,
  truth_density_score,
  academic_weight_score,
  support_counter + challenge_counter + neutral_counter as total_correlations,
  version_created_at
FROM book_statistics
ORDER BY book_number, version_created_at DESC;

-- Chapter Status Breakdown
CREATE OR REPLACE VIEW view_chapter_status_summary AS
SELECT 
  bs.book_number,
  bs.book_title,
  COUNT(*) FILTER (WHERE cs.status = 'proven') as proven_chapters,
  COUNT(*) FILTER (WHERE cs.status = 'supported') as supported_chapters,
  COUNT(*) FILTER (WHERE cs.status = 'challenged') as challenged_chapters,
  COUNT(*) FILTER (WHERE cs.status = 'unverified') as unverified_chapters,
  AVG(cs.correlation_strength_avg) as avg_chapter_strength
FROM book_statistics bs
LEFT JOIN chapter_statistics cs ON cs.book_statistics_id = bs.id
WHERE bs.version = '1.0'
GROUP BY bs.book_number, bs.book_title
ORDER BY bs.book_number;

-- Update timestamp trigger for book statistics
CREATE OR REPLACE FUNCTION update_book_statistics_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_update = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_book_statistics_timestamp
  BEFORE UPDATE ON book_statistics
  FOR EACH ROW
  EXECUTE FUNCTION update_book_statistics_timestamp();

-- Update timestamp trigger for chapter statistics
CREATE TRIGGER trigger_update_chapter_statistics_timestamp
  BEFORE UPDATE ON chapter_statistics
  FOR EACH ROW
  EXECUTE FUNCTION update_book_statistics_timestamp();

-- Function to create new book statistics version
CREATE OR REPLACE FUNCTION create_book_statistics_version(
  p_book_number INTEGER,
  p_new_version TEXT
)
RETURNS UUID AS $$
DECLARE
  v_current_stats RECORD;
  v_new_id UUID;
BEGIN
  -- Get current stats (v1.0)
  SELECT * INTO v_current_stats
  FROM book_statistics
  WHERE book_number = p_book_number
    AND version = '1.0';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Book % statistics not found', p_book_number;
  END IF;
  
  -- Create new version snapshot
  INSERT INTO book_statistics (
    book_number,
    book_title,
    version,
    support_counter,
    challenge_counter,
    neutral_counter,
    chapters_proven,
    chapters_supported,
    chapters_challenged,
    chapters_total,
    truth_density_score,
    total_citations,
    academic_weight_score
  ) VALUES (
    v_current_stats.book_number,
    v_current_stats.book_title,
    p_new_version,
    v_current_stats.support_counter,
    v_current_stats.challenge_counter,
    v_current_stats.neutral_counter,
    v_current_stats.chapters_proven,
    v_current_stats.chapters_supported,
    v_current_stats.chapters_challenged,
    v_current_stats.chapters_total,
    v_current_stats.truth_density_score,
    v_current_stats.total_citations,
    v_current_stats.academic_weight_score
  )
  RETURNING id INTO v_new_id;
  
  RETURN v_new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE book_statistics IS 'Dynamic metadata layer tracking real-world validation of The Seven Books (core text remains immutable)';
COMMENT ON TABLE chapter_statistics IS 'Granular tracking of chapter-level correlation strength and academic support';
COMMENT ON FUNCTION create_book_statistics_version IS 'Creates autonomous version snapshot every 1,000 correlations';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ R.O.M.A.N. Book Statistics deployed';
  RAISE NOTICE '📊 Tables: book_statistics, chapter_statistics';
  RAISE NOTICE '📈 Views: view_global_book_statistics, view_book_version_timeline, view_chapter_status_summary';
  RAISE NOTICE '🎯 Truth Density tracking enabled';
  RAISE NOTICE '⚖️ Academic Weight scoring active';
  RAISE NOTICE '📚 Core book text remains immutable (Divine Intent preserved)';
END $$;
