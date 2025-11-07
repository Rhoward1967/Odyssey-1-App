-- ========================================
-- AUTO-SET published_at WHEN STATUS BECOMES 'published'
-- ========================================

CREATE OR REPLACE FUNCTION public.set_books_published_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  -- If status changed to 'published' and published_at is null
  IF NEW.status = 'published' AND OLD.status != 'published' AND NEW.published_at IS NULL THEN
    NEW.published_at := now();
  END IF;
  
  -- If status changed from 'published' to something else, clear published_at
  IF NEW.status != 'published' AND OLD.status = 'published' THEN
    NEW.published_at := NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_books_published_at ON public.books;
CREATE TRIGGER trg_books_published_at
BEFORE UPDATE ON public.books
FOR EACH ROW EXECUTE FUNCTION public.set_books_published_at();

-- Verification
DO $$
BEGIN
  RAISE NOTICE '✅ Published_at trigger installed. Books will auto-timestamp when status becomes published.';
END $$;
