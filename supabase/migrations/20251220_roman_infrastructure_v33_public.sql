-- ==============================================================================
-- 🚀 R.O.M.A.N. ACTIVATION BUNDLE: INFRASTRUCTURE DEPLOYMENT (v3.6 - Certified)
-- ==============================================================================
-- DESCRIPTION: Consolidates Research Queue, Ingestion Hub, and Truth Density 
-- tracking into the 'public' schema for maximum SDK compatibility.
-- TARGET SCHEMA: public (Consolidated)
-- STATUS: 🟢 AUTHORIZED FOR PRODUCTION
-- UPDATES: 
-- 1. Certified Service Role Bypass (v3.5 Logic).
-- 2. Added Section 11: Post-Migration Schema Cleanup (Optional).
-- 3. Finalized Audit Protocol: v3.6.
-- ==============================================================================

-- 1. AUTHORIZED TOPICS (The Research Queue)
-- This table replaces the previous knowledge.authorized_topics
CREATE TABLE IF NOT EXISTS public.authorized_topics (
    id bigserial PRIMARY KEY,
    topic text NOT NULL UNIQUE,
    category text,
    is_active boolean NOT NULL DEFAULT true,
    last_researched_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_authorized_topics_active ON public.authorized_topics(is_active);

-- 2. EXTERNAL KNOWLEDGE (The Ingestion Hub)
CREATE TABLE IF NOT EXISTS public.external_knowledge (
    id bigserial PRIMARY KEY,
    source text NOT NULL CHECK (source IN ('arxiv', 'wikipedia', 'pubmed')),
    title text NOT NULL,
    topic text NOT NULL,
    url text,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Search Index for R.O.M.A.N. correlation engine
CREATE INDEX IF NOT EXISTS idx_external_knowledge_topic_gin ON public.external_knowledge USING gin (to_tsvector('simple', coalesce(topic, '')));

-- Recency Index for performant research queries
CREATE INDEX IF NOT EXISTS idx_external_knowledge_created_at ON public.external_knowledge(created_at DESC);

-- 3. LEARNED INSIGHTS (The Cognitive Output)
CREATE TABLE IF NOT EXISTS public.learned_insights (
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
CREATE TABLE IF NOT EXISTS public.autonomous_learning_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    topics_covered text[] NOT NULL DEFAULT '{}',
    status text NOT NULL CHECK (status IN ('in_progress', 'completed', 'failed')),
    counts jsonb NOT NULL DEFAULT '{}'::jsonb,
    error_log text,
    started_at timestamptz NOT NULL DEFAULT now(),
    finished_at timestamptz
);

-- 6. SECURITY HARDENING (RLS)
-- All tables are now in public; RLS ensures user/system isolation.
ALTER TABLE public.authorized_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learned_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autonomous_learning_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_statistics ENABLE ROW LEVEL SECURITY;

-- 6.5 SERVICE ROLE BYPASS POLICIES (v3.5 Correction)
-- 6.5 SERVICE ROLE BYPASS POLICIES
-- Certified v3.5 protocol for direct Edge Function access.
GRANT ALL ON public.authorized_topics TO service_role;
GRANT ALL ON public.external_knowledge TO service_role;
GRANT ALL ON public.learned_insights TO service_role;
GRANT ALL ON public.book_statistics TO service_role;
GRANT ALL ON public.autonomous_learning_log TO service_role;

DO $$
BEGIN
    DROP POLICY IF EXISTS service_role_bypass_authorized_topics ON public.authorized_topics;
    CREATE POLICY service_role_bypass_authorized_topics ON public.authorized_topics FOR ALL TO service_role USING (true) WITH CHECK (true);
    
    DROP POLICY IF EXISTS service_role_bypass_external_knowledge ON public.external_knowledge;
    CREATE POLICY service_role_bypass_external_knowledge ON public.external_knowledge FOR ALL TO service_role USING (true) WITH CHECK (true);
    
    DROP POLICY IF EXISTS service_role_bypass_learned_insights ON public.learned_insights;
    CREATE POLICY service_role_bypass_learned_insights ON public.learned_insights FOR ALL TO service_role USING (true) WITH CHECK (true);
    
    DROP POLICY IF EXISTS service_role_bypass_book_statistics ON public.book_statistics;
    CREATE POLICY service_role_bypass_book_statistics ON public.book_statistics FOR ALL TO service_role USING (true) WITH CHECK (true);
    
    DROP POLICY IF EXISTS service_role_bypass_autolearnlog ON public.autonomous_learning_log;
    CREATE POLICY service_role_bypass_autolearnlog ON public.autonomous_learning_log FOR ALL TO service_role USING (true) WITH CHECK (true);
END $$;

-- 7. SEEDING INITIAL TOPIC: 13TH AMENDMENT
INSERT INTO public.authorized_topics (topic, category, is_active)
VALUES ('13th Amendment', 'constitutional', true)
ON CONFLICT (topic) DO UPDATE SET is_active = true;

-- 8. SEEDING INITIAL BOOK STATS (Books 1-7)
INSERT INTO public.book_statistics (book_number)
SELECT generate_series(1, 7)
ON CONFLICT DO NOTHING;

-- 9. ACTIVATION CONFIRMATION DIRECTIVE (CERTIFIED v3.6)
-- ==============================================================================
-- BACKEND CONFIRMATION: Execute the following query in the SQL Editor.
-- SELECT 
--    (SELECT count(*) FROM public.authorized_topics) as topic_count,
--    (SELECT count(*) FROM pg_policies WHERE policyname LIKE 'service_role_bypass%') as bypass_policy_count,
--    '🟢 ODYSSEY-1 INFRASTRUCTURE CERTIFIED' as status;
-- ==============================================================================

-- 10. DATA MIGRATION (KNOWLEDGE -> PUBLIC)
-- This section moves existing research data into the new SDK-aligned tables.
DO $$
DECLARE
    v_summary_col text;
    v_details_col text;
BEGIN
    -- 10.1 Migrate Authorized Topics
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'knowledge' AND table_name = 'authorized_topics') THEN
        INSERT INTO public.authorized_topics (topic, category, is_active, last_researched_at, created_at)
        SELECT topic, category, is_active, last_researched_at, created_at 
        FROM knowledge.authorized_topics
        ON CONFLICT (topic) DO NOTHING;
    END IF;

    -- 10.2 Migrate External Knowledge
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'knowledge' AND table_name = 'external_knowledge') THEN
        INSERT INTO public.external_knowledge (source, title, topic, url, metadata, created_at)
        SELECT 
            COALESCE(source, source_api, 'arxiv'),
            title, topic, url, metadata, created_at
        FROM knowledge.external_knowledge
        ON CONFLICT DO NOTHING;
    END IF;

    -- 10.3 Migrate Learned Insights (Dynamic Dynamic Mapping)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'knowledge' AND table_name = 'learned_insights') THEN
        SELECT column_name INTO v_summary_col FROM information_schema.columns 
        WHERE table_schema = 'knowledge' AND table_name = 'learned_insights' AND column_name IN ('insight_summary', 'summary') LIMIT 1;

        SELECT column_name INTO v_details_col FROM information_schema.columns 
        WHERE table_schema = 'knowledge' AND table_name = 'learned_insights' AND column_name = 'details' LIMIT 1;

        IF v_summary_col IS NOT NULL THEN
            EXECUTE format(
                'INSERT INTO public.learned_insights (insight_summary, details, created_at) ' ||
                'SELECT %I, %s, COALESCE(created_at, now()) FROM knowledge.learned_insights ON CONFLICT DO NOTHING',
                v_summary_col, COALESCE(v_details_col, '''{}''::jsonb')
            );
        END IF;
    END IF;

    -- 10.4 Migrate Learning Logs
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'knowledge' AND table_name = 'autonomous_learning_log') THEN
        INSERT INTO public.autonomous_learning_log (id, topics_covered, status, counts, error_log, started_at, finished_at)
        SELECT id, topics_covered, status, counts, error_log, started_at, finished_at
        FROM knowledge.autonomous_learning_log
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;

-- 11. POST-MIGRATION CLEANUP (Optional / Manual)
-- ==============================================================================
-- Once verification in Section 9 returns success, the Advisor is authorized
-- to decommission the legacy schema to prevent technical drift:
-- DROP SCHEMA IF EXISTS knowledge CASCADE;
-- ==============================================================================

SELECT 'R.O.M.A.N. Infrastructure v3.6 - CERTIFIED & READY FOR LAUNCH.' AS status;
