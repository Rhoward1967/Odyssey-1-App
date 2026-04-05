-- ============================================================
-- SOVEREIGN VAULT — Vector Search Function
-- R.O.M.A.N. Semantic Search over Howard Jones Trust Documents
--
-- The sovereign_vault table was created via Supabase mobile editor.
-- This migration adds:
--   1. The match function for semantic similarity search
--   2. An index for fast vector lookups
--   3. A service-role policy so R.O.M.A.N. can read the vault
--
-- © 2026 Rickey Allan Howard / Howard Jones Bloodline Ancestral Trust
-- ============================================================

-- Ensure pgvector is enabled (was already done, idempotent)
CREATE EXTENSION IF NOT EXISTS vector;

-- Ensure sovereign_vault exists with correct schema
-- (Safe to run even if table already exists from mobile session)
CREATE TABLE IF NOT EXISTS public.sovereign_vault (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_name TEXT,
  filing_id TEXT,
  content TEXT,
  metadata JSONB,
  embedding VECTOR(768),  -- nomic-embed-text produces 768-dim vectors
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Upsert conflict key on document_name
CREATE UNIQUE INDEX IF NOT EXISTS sovereign_vault_document_name_idx
  ON public.sovereign_vault (document_name)
  WHERE document_name IS NOT NULL;

-- IVFFlat index for fast approximate nearest-neighbor search
-- Lists = sqrt(expected_rows) — start at 10, increase when vault grows
CREATE INDEX IF NOT EXISTS sovereign_vault_embedding_idx
  ON public.sovereign_vault
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 10);

-- ============================================================
-- MATCH FUNCTION — R.O.M.A.N.'s semantic search engine
-- Called by romanOllamaService.sovereignQuery()
-- ============================================================
CREATE OR REPLACE FUNCTION match_sovereign_vault(
  query_embedding VECTOR(768),
  match_count INT DEFAULT 5,
  match_threshold FLOAT DEFAULT 0.3
)
RETURNS TABLE (
  id uuid,
  document_name TEXT,
  filing_id TEXT,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sv.id,
    sv.document_name,
    sv.filing_id,
    sv.content,
    sv.metadata,
    1 - (sv.embedding <=> query_embedding) AS similarity
  FROM public.sovereign_vault sv
  WHERE sv.embedding IS NOT NULL
    AND 1 - (sv.embedding <=> query_embedding) > match_threshold
  ORDER BY sv.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================================
-- RLS POLICIES
-- Authenticated users can read
-- Service role (R.O.M.A.N.) can read and write
-- ============================================================
ALTER TABLE public.sovereign_vault ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they were created from mobile (avoid conflict)
DROP POLICY IF EXISTS "Allow individual read access" ON public.sovereign_vault;
DROP POLICY IF EXISTS "Allow individual insert access" ON public.sovereign_vault;
DROP POLICY IF EXISTS "Service role full access" ON public.sovereign_vault;
DROP POLICY IF EXISTS "Authenticated read" ON public.sovereign_vault;
DROP POLICY IF EXISTS "Authenticated insert" ON public.sovereign_vault;

-- Authenticated users (Rickey) can read
CREATE POLICY "Authenticated read"
  ON public.sovereign_vault FOR SELECT
  USING (auth.role() = 'authenticated');

-- Authenticated users can insert
CREATE POLICY "Authenticated insert"
  ON public.sovereign_vault FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Service role (R.O.M.A.N.) has full access for autonomous operations
CREATE POLICY "Service role full access"
  ON public.sovereign_vault FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
