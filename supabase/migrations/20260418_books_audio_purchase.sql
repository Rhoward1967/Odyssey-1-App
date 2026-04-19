-- ─────────────────────────────────────────────────────────────────────────────
-- BOOKS: Audio + Purchase URL columns
-- Howard Jones Bloodline Ancestral Trust — Odyssey-1
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.books
  ADD COLUMN IF NOT EXISTS audio_url    TEXT,
  ADD COLUMN IF NOT EXISTS purchase_url TEXT,
  ADD COLUMN IF NOT EXISTS price_cents  INTEGER DEFAULT 999;

-- Storage bucket for book audio files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'sovereign-books',
  'sovereign-books',
  false,
  52428800,  -- 50 MB
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: service role full access
DROP POLICY IF EXISTS "service_role_books_all" ON storage.objects;
CREATE POLICY "service_role_books_all" ON storage.objects
  FOR ALL TO service_role
  USING (bucket_id = 'sovereign-books')
  WITH CHECK (bucket_id = 'sovereign-books');

-- Authenticated users can read
DROP POLICY IF EXISTS "authed_books_read" ON storage.objects;
CREATE POLICY "authed_books_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'sovereign-books');
