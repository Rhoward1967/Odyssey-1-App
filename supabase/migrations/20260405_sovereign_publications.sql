-- ─────────────────────────────────────────────────────────────────────────────
-- SOVEREIGN PUBLICATIONS
-- Tracks every Lulu print job and distribution submission.
-- Howard Jones Bloodline Ancestral Trust — Odyssey-1
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sovereign_publications (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  lulu_job_id    TEXT        UNIQUE,
  book_title     TEXT        NOT NULL,
  job_type       TEXT        NOT NULL CHECK (job_type IN ('print', 'distribution')),
  status         TEXT        NOT NULL DEFAULT 'CREATED',
  quantity       INTEGER,
  lulu_response  JSONB,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_sovereign_publications_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sovereign_publications_updated ON sovereign_publications;
CREATE TRIGGER sovereign_publications_updated
  BEFORE UPDATE ON sovereign_publications
  FOR EACH ROW EXECUTE FUNCTION update_sovereign_publications_timestamp();

-- Index for R.O.M.A.N. status queries
CREATE INDEX IF NOT EXISTS idx_sovereign_publications_status
  ON sovereign_publications (status, job_type);

-- RLS: service role only (R.O.M.A.N. uses service role key)
ALTER TABLE sovereign_publications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON sovereign_publications
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- View: publishing dashboard
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW publishing_dashboard AS
SELECT
  sp.book_title,
  sp.job_type,
  sp.status,
  sp.quantity,
  sp.lulu_job_id,
  sp.created_at,
  sp.updated_at,
  b.book_number,
  b.subtitle
FROM sovereign_publications sp
LEFT JOIN books b ON b.title = sp.book_title
ORDER BY sp.created_at DESC;
