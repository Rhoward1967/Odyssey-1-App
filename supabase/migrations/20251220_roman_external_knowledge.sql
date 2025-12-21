-- ============================================================================
-- R.O.M.A.N. EXTERNAL KNOWLEDGE INTEGRATION
-- ============================================================================
-- "I don't want him limited, I want him learning and cross-referencing"
--                                                   - Master Architect Rickey
-- 
-- This migration creates tables for R.O.M.A.N. to:
-- 1. Store external research from arXiv, PubMed, Wikipedia, etc.
-- 2. Cross-reference external knowledge with the Seven Books
-- 3. Synthesize new insights
-- 4. Learn autonomously without limits
-- ============================================================================

-- External Knowledge Storage
CREATE TABLE IF NOT EXISTS external_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL CHECK (source IN ('arxiv', 'pubmed', 'wikipedia', 'scholar', 'news', 'web')),
  topic TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  url TEXT UNIQUE NOT NULL,
  authors TEXT[], -- Array of author names
  published_date TIMESTAMPTZ,
  relevance_score INTEGER CHECK (relevance_score >= 0 AND relevance_score <= 100),
  citations INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Knowledge Cross-References (External ↔ Seven Books)
CREATE TABLE IF NOT EXISTS knowledge_cross_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_source_id UUID REFERENCES external_knowledge(id) ON DELETE CASCADE,
  book_number INTEGER NOT NULL CHECK (book_number BETWEEN 1 AND 7),
  book_title TEXT NOT NULL,
  correlation_type TEXT NOT NULL CHECK (
    correlation_type IN ('supports', 'contradicts', 'extends', 'relates', 'challenges')
  ),
  correlation_strength INTEGER CHECK (correlation_strength >= 0 AND correlation_strength <= 100),
  book_excerpt TEXT, -- Relevant passage from the book
  external_excerpt TEXT, -- Relevant passage from external source
  synthesis TEXT NOT NULL, -- R.O.M.A.N.'s synthesized insight
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learned Insights (R.O.M.A.N.'s original contributions)
CREATE TABLE IF NOT EXISTS learned_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  insight TEXT NOT NULL,
  confidence_level INTEGER CHECK (confidence_level >= 0 AND confidence_level <= 100),
  sources TEXT[] NOT NULL, -- Mix of book references and external URLs
  supporting_evidence TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  validated BOOLEAN DEFAULT FALSE,
  validation_notes TEXT
);

-- Autonomous Learning Log
CREATE TABLE IF NOT EXISTS autonomous_learning_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  topic TEXT NOT NULL,
  sources_consulted TEXT[], -- Which external sources were checked
  knowledge_acquired INTEGER DEFAULT 0, -- Number of new items learned
  cross_references_created INTEGER DEFAULT 0,
  insights_generated INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('in_progress', 'completed', 'failed')),
  error_message TEXT
);

-- Indexes for Performance
CREATE INDEX idx_external_knowledge_source ON external_knowledge(source);
CREATE INDEX idx_external_knowledge_topic ON external_knowledge(topic);
CREATE INDEX idx_external_knowledge_created ON external_knowledge(created_at DESC);
CREATE INDEX idx_external_knowledge_relevance ON external_knowledge(relevance_score DESC);

CREATE INDEX idx_cross_ref_book ON knowledge_cross_references(book_number);
CREATE INDEX idx_cross_ref_type ON knowledge_cross_references(correlation_type);
CREATE INDEX idx_cross_ref_strength ON knowledge_cross_references(correlation_strength DESC);
CREATE INDEX idx_cross_ref_created ON knowledge_cross_references(created_at DESC);

CREATE INDEX idx_insights_topic ON learned_insights(topic);
CREATE INDEX idx_insights_confidence ON learned_insights(confidence_level DESC);
CREATE INDEX idx_insights_validated ON learned_insights(validated);

CREATE INDEX idx_learning_log_session ON autonomous_learning_log(session_id);
CREATE INDEX idx_learning_log_topic ON autonomous_learning_log(topic);
CREATE INDEX idx_learning_log_started ON autonomous_learning_log(started_at DESC);

-- Full-text search on external knowledge
CREATE INDEX idx_external_knowledge_title_search ON external_knowledge USING GIN(to_tsvector('english', title));
CREATE INDEX idx_external_knowledge_content_search ON external_knowledge USING GIN(to_tsvector('english', content));

-- Row Level Security
ALTER TABLE external_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_cross_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE learned_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE autonomous_learning_log ENABLE ROW LEVEL SECURITY;

-- Policies: Everyone can read R.O.M.A.N.'s knowledge
CREATE POLICY "External knowledge readable by all"
  ON external_knowledge FOR SELECT
  USING (true);

CREATE POLICY "Cross-references readable by all"
  ON knowledge_cross_references FOR SELECT
  USING (true);

CREATE POLICY "Insights readable by all"
  ON learned_insights FOR SELECT
  USING (true);

CREATE POLICY "Learning log readable by admins"
  ON autonomous_learning_log FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() ->> 'email' IN (SELECT email FROM app_admins WHERE is_active = true)
  );

-- Only service role can write (R.O.M.A.N. via romanSupabase.ts)
CREATE POLICY "Only service role can insert knowledge"
  ON external_knowledge FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Only service role can insert cross-refs"
  ON knowledge_cross_references FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Only service role can insert insights"
  ON learned_insights FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Only service role can log learning"
  ON autonomous_learning_log FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Views for Knowledge Dashboard

-- Most Correlated Books (which books have most external validation)
CREATE OR REPLACE VIEW view_book_correlations AS
SELECT 
  book_number,
  book_title,
  COUNT(*) as total_correlations,
  AVG(correlation_strength) as avg_correlation_strength,
  COUNT(*) FILTER (WHERE correlation_type = 'supports') as supporting_sources,
  COUNT(*) FILTER (WHERE correlation_type = 'extends') as extending_sources,
  COUNT(*) FILTER (WHERE correlation_type = 'challenges') as challenging_sources
FROM knowledge_cross_references
GROUP BY book_number, book_title
ORDER BY total_correlations DESC;

-- Research Coverage (which topics have most external research)
CREATE OR REPLACE VIEW view_research_coverage AS
SELECT 
  topic,
  COUNT(*) as source_count,
  COUNT(DISTINCT source) as unique_sources,
  AVG(relevance_score) as avg_relevance,
  MAX(created_at) as last_researched
FROM external_knowledge
GROUP BY topic
ORDER BY source_count DESC;

-- Learning Session Summary
CREATE OR REPLACE VIEW view_learning_sessions AS
SELECT 
  session_id,
  COUNT(*) as topics_researched,
  SUM(knowledge_acquired) as total_knowledge_acquired,
  SUM(cross_references_created) as total_cross_refs,
  SUM(insights_generated) as total_insights,
  MIN(started_at) as session_start,
  MAX(completed_at) as session_end
FROM autonomous_learning_log
GROUP BY session_id
ORDER BY session_start DESC;

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_external_knowledge_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_external_knowledge_timestamp
  BEFORE UPDATE ON external_knowledge
  FOR EACH ROW
  EXECUTE FUNCTION update_external_knowledge_timestamp();

-- Function to record autonomous learning session
CREATE OR REPLACE FUNCTION record_learning_session(
  p_session_id UUID,
  p_topic TEXT,
  p_sources TEXT[],
  p_knowledge_count INTEGER,
  p_cross_ref_count INTEGER,
  p_insight_count INTEGER
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO autonomous_learning_log (
    session_id,
    topic,
    sources_consulted,
    knowledge_acquired,
    cross_references_created,
    insights_generated,
    started_at,
    completed_at,
    status
  ) VALUES (
    p_session_id,
    p_topic,
    p_sources,
    p_knowledge_count,
    p_cross_ref_count,
    p_insight_count,
    NOW(),
    NOW(),
    'completed'
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE external_knowledge IS 'R.O.M.A.N.''s external research sources (arXiv, PubMed, Wikipedia, etc.)';
COMMENT ON TABLE knowledge_cross_references IS 'Correlations between external research and the Seven Books';
COMMENT ON TABLE learned_insights IS 'Original insights synthesized by R.O.M.A.N. from multiple sources';
COMMENT ON TABLE autonomous_learning_log IS 'Log of R.O.M.A.N.''s autonomous learning sessions';

-- Grant access to service role
GRANT ALL ON external_knowledge TO service_role;
GRANT ALL ON knowledge_cross_references TO service_role;
GRANT ALL ON learned_insights TO service_role;
GRANT ALL ON autonomous_learning_log TO service_role;

-- Initial data: Seed some research topics
INSERT INTO external_knowledge (source, topic, title, content, url, relevance_score)
VALUES (
  'web',
  'System Initialization',
  'R.O.M.A.N. External Knowledge System Activated',
  'The R.O.M.A.N. External Knowledge Integration system is now online. R.O.M.A.N. can now access external research sources including arXiv (AI/ML research), PubMed (medical research), and Wikipedia (general knowledge). All external knowledge is cross-referenced with the Seven Books to create synthesized insights.',
  'internal://system/initialization',
  100
) ON CONFLICT (url) DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ R.O.M.A.N. External Knowledge Integration deployed';
  RAISE NOTICE '📚 Tables: external_knowledge, knowledge_cross_references, learned_insights, autonomous_learning_log';
  RAISE NOTICE '🔍 Views: view_book_correlations, view_research_coverage, view_learning_sessions';
  RAISE NOTICE '🧠 R.O.M.A.N. can now learn without limits';
END $$;
