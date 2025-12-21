-- ==============================================================================
-- 🚀 R.O.M.A.N. ACTIVATION BUNDLE: INFRASTRUCTURE DEPLOYMENT (v3.2 - Final)
-- ==============================================================================
-- DESCRIPTION: Consolidates Authorized Topics, External Knowledge, and 
-- Truth Density tracking into a single execution block.
-- TARGET SCHEMA: knowledge (Research) / public (Statistics)
-- UPDATES: Added Activation Confirmation Directive for Front/Backend Teams.
-- ==============================================================================

-- 0. SCHEMA INITIALIZATION
CREATE SCHEMA IF NOT EXISTS knowledge;

-- 1. AUTHORIZED TOPICS (The Research Queue)
CREATE TABLE IF NOT EXISTS knowledge.authorized_topics (
    id bigserial PRIMARY KEY,
    topic text NOT NULL UNIQUE,
    category text,
    is_active boolean NOT NULL DEFAULT true,
    last_researched_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_authorized_topics_active ON knowledge.authorized_topics(is_active);

-- 2. EXTERNAL KNOWLEDGE (The Ingestion Hub)
CREATE TABLE IF NOT EXISTS knowledge.external_knowledge (
    id bigserial PRIMARY KEY,
    source text NOT NULL CHECK (source IN ('arxiv', 'wikipedia', 'pubmed')),
    title text NOT NULL,
    topic text NOT NULL,
    url text,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Search Index
CREATE INDEX IF NOT EXISTS idx_external_knowledge_topic_gin ON knowledge.external_knowledge USING gin (to_tsvector('simple', coalesce(topic, '')));

-- Recency Index for performant research queries
CREATE INDEX IF NOT EXISTS idx_external_knowledge_created_at ON knowledge.external_knowledge(created_at DESC);

-- 3. LEARNED INSIGHTS (The Cognitive Output)
CREATE TABLE IF NOT EXISTS knowledge.learned_insights (
    id bigserial PRIMARY KEY,
    insight_summary text NOT NULL,
    details jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. BOOK STATISTICS (The Truth Density Monitor)
CREATE TABLE IF NOT EXISTS public.book_statistics (
    id bigserial PRIMARY KEY,
    book_number int NOT NULL CHECK (book_number BETWEEN 1 AND 7),
    truth_density numeric(5,2) NOT NULL DEFAULT 0.00 CHECK (truth_density >= 0 AND truth_density <= 100),
    academic_weight numeric(6,2) NOT NULL DEFAULT 0.00 CHECK (academic_weight >= 0),
    support_counter int DEFAULT 0,
    challenge_counter int DEFAULT 0,
    version text DEFAULT '1.0',
    last_updated timestamptz DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. AUTONOMOUS LEARNING LOG (The Audit Trail)
CREATE TABLE IF NOT EXISTS knowledge.autonomous_learning_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    topics_covered text[] NOT NULL DEFAULT '{}',
    status text NOT NULL CHECK (status IN ('in_progress', 'completed', 'failed')),
    counts jsonb NOT NULL DEFAULT '{}'::jsonb,
    error_log text,
    started_at timestamptz NOT NULL DEFAULT now(),
    finished_at timestamptz
);

-- 6. SECURITY HARDENING (RLS)
ALTER TABLE knowledge.authorized_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge.external_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge.learned_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge.autonomous_learning_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_statistics ENABLE ROW LEVEL SECURITY;

-- 7. GRANT PERMISSIONS TO SERVICE ROLE
GRANT ALL ON SCHEMA knowledge TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA knowledge TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA knowledge TO service_role;
GRANT ALL ON public.book_statistics TO service_role;

-- 8. RLS POLICIES (Service role bypass for autonomous operations)
CREATE POLICY "Service role full access on topics" ON knowledge.authorized_topics
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on knowledge" ON knowledge.external_knowledge
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on insights" ON knowledge.learned_insights
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on log" ON knowledge.autonomous_learning_log
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on stats" ON public.book_statistics
    FOR ALL USING (true) WITH CHECK (true);

-- 9. SEEDING INITIAL TOPIC: 13TH AMENDMENT
INSERT INTO knowledge.authorized_topics (topic, category, is_active)
VALUES ('13th Amendment', 'constitutional', true)
ON CONFLICT (topic) DO UPDATE SET is_active = true;

-- 10. SEEDING INITIAL BOOK STATS (Books 1-7)
INSERT INTO public.book_statistics (book_number)
SELECT generate_series(1, 7)
ON CONFLICT DO NOTHING;

-- 11. ACTIVATION CONFIRMATION DIRECTIVE (MANDATORY)
-- ==============================================================================
-- BACKEND CONFIRMATION: Execute the following query to verify table readiness.
-- SELECT 
--    (SELECT count(*) FROM knowledge.authorized_topics) as topic_count,
--    (SELECT count(*) FROM public.book_statistics) as book_count,
--    '🟢 INFRASTRUCTURE VERIFIED' as status;
--
-- FRONTEND CONFIRMATION: Verify the 'RomanKnowledgeDashboard' displays:
-- [X] Connection Status: ONLINE / AUTONOMOUS
-- [X] Book Statistics: 7 active monitors
-- [X] Research Queue: '13th Amendment' identified as Priority 1.
-- ==============================================================================

SELECT 'R.O.M.A.N. Infrastructure v3.2 - ACTIVATION DIRECTIVE ISSUED. Ready for deployment.' AS status;
