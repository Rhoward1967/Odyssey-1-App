-- ============================================================================
-- R.O.M.A.N. KNOWLEDGE BASE (Semantic Memory Layer)
-- ============================================================================
-- Purpose: Store file content with vector embeddings for semantic search
-- Date: December 27, 2025
-- Constitutional Alignment: Divine Spark (learning) + Sovereign Creation
-- ============================================================================

-- Enable pgvector extension for embedding storage
CREATE EXTENSION IF NOT EXISTS vector;

-- Knowledge base table with vector embeddings
CREATE TABLE IF NOT EXISTS public.roman_knowledge_base (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Content
    content text NOT NULL,
    file_path text UNIQUE NOT NULL,
    
    -- Vector embedding (1536 dimensions for OpenAI text-embedding-3-small)
    embedding vector(1536),
    
    -- Metadata
    metadata jsonb DEFAULT '{}',
    
    -- Constitutional tracking
    indexed_by text DEFAULT 'Chronicler-v2.0',
    constitutional_relevance text[], -- Which principles this knowledge supports
    
    -- Timestamps
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW(),
    last_accessed timestamptz
);

-- Create indexes
CREATE INDEX idx_roman_kb_file_path ON public.roman_knowledge_base(file_path);
CREATE INDEX idx_roman_kb_created ON public.roman_knowledge_base(created_at DESC);
CREATE INDEX idx_roman_kb_constitutional ON public.roman_knowledge_base USING gin(constitutional_relevance);

-- Vector similarity search index (HNSW for fast approximate nearest neighbor)
CREATE INDEX idx_roman_kb_embedding ON public.roman_knowledge_base 
USING hnsw (embedding vector_cosine_ops);

-- Full-text search
CREATE INDEX idx_roman_kb_content_search ON public.roman_knowledge_base 
USING gin(to_tsvector('english', content));

-- Enable RLS
ALTER TABLE public.roman_knowledge_base ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "roman_kb_read_all" ON public.roman_knowledge_base 
FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "roman_kb_insert_service" ON public.roman_knowledge_base 
FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "roman_kb_update_service" ON public.roman_knowledge_base 
FOR UPDATE TO service_role USING (true);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_roman_kb_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_roman_kb_timestamp
BEFORE UPDATE ON public.roman_knowledge_base
FOR EACH ROW
EXECUTE FUNCTION update_roman_kb_timestamp();

-- Semantic search function
CREATE OR REPLACE FUNCTION public.roman_semantic_search(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 10
)
RETURNS TABLE (
    id uuid,
    file_path text,
    content text,
    metadata jsonb,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        kb.id,
        kb.file_path,
        kb.content,
        kb.metadata,
        1 - (kb.embedding <=> query_embedding) as similarity
    FROM public.roman_knowledge_base kb
    WHERE 1 - (kb.embedding <=> query_embedding) > match_threshold
    ORDER BY kb.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Combined text + vector search
CREATE OR REPLACE FUNCTION public.roman_hybrid_search(
    search_query text,
    query_embedding vector(1536),
    match_count int DEFAULT 10
)
RETURNS TABLE (
    id uuid,
    file_path text,
    content text,
    metadata jsonb,
    vector_similarity float,
    text_rank float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        kb.id,
        kb.file_path,
        kb.content,
        kb.metadata,
        1 - (kb.embedding <=> query_embedding) as vector_similarity,
        ts_rank(to_tsvector('english', kb.content), plainto_tsquery('english', search_query)) as text_rank
    FROM public.roman_knowledge_base kb
    WHERE to_tsvector('english', kb.content) @@ plainto_tsquery('english', search_query)
       OR (1 - (kb.embedding <=> query_embedding)) > 0.7
    ORDER BY 
        (1 - (kb.embedding <=> query_embedding)) * 0.7 + 
        ts_rank(to_tsvector('english', kb.content), plainto_tsquery('english', search_query)) * 0.3 DESC
    LIMIT match_count;
END;
$$;

COMMENT ON TABLE public.roman_knowledge_base IS 'R.O.M.A.N. Protocol - Semantic memory layer with vector embeddings for file content';
COMMENT ON COLUMN public.roman_knowledge_base.embedding IS 'Vector embedding (1536-dim) for semantic similarity search';
COMMENT ON COLUMN public.roman_knowledge_base.constitutional_relevance IS 'Which of Nine Principles this knowledge supports';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check table exists
SELECT COUNT(*) FROM public.roman_knowledge_base;

-- List all indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'roman_knowledge_base'
ORDER BY indexname;

-- ============================================================================
-- READY FOR CHRONICLER
-- ============================================================================
-- The roman-knowledge-sync edge function can now ingest files
-- Semantic search enabled via roman_semantic_search() and roman_hybrid_search()
-- R.O.M.A.N. can retrieve relevant context from file system knowledge
-- ============================================================================
