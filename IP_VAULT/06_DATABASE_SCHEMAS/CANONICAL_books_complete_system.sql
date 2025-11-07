-- ========================================
-- ODYSSEY-1 BOOKS LIBRARY: CANONICAL MIGRATION
-- Complete Books System (Create + Insert + Search + RLS)
-- © 2025 Rickey A Howard. All Rights Reserved.
-- ========================================

-- STEP 1: CREATE BOOKS TABLE
-- ========================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_number int UNIQUE NOT NULL CHECK (book_number BETWEEN 1 AND 7),
  title text NOT NULL,
  subtitle text,
  content text NOT NULL,
  word_count int,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'editing', 'published')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  published_at timestamptz,
  search_vector tsvector
);

-- STEP 2: TRIGGERS
-- ========================================

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.set_books_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_books_updated_at ON public.books;
CREATE TRIGGER trg_books_updated_at
BEFORE UPDATE ON public.books
FOR EACH ROW EXECUTE FUNCTION public.set_books_updated_at();

-- Published_at trigger (auto-stamp when status becomes 'published')
CREATE OR REPLACE FUNCTION public.set_books_published_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'published' AND OLD.status != 'published' AND NEW.published_at IS NULL THEN
    NEW.published_at := now();
  END IF;
  
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

-- Search vector trigger (full-text search)
CREATE OR REPLACE FUNCTION public.update_books_search_vector()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.subtitle, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.content, '')), 'C');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_books_search_vector ON public.books;
CREATE TRIGGER trg_books_search_vector
BEFORE INSERT OR UPDATE ON public.books
FOR EACH ROW EXECUTE FUNCTION public.update_books_search_vector();

-- STEP 3: RLS POLICIES
-- ========================================

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage all books" ON public.books;
CREATE POLICY "Admins can manage all books" ON public.books
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_organizations uo
      WHERE uo.user_id = auth.uid() AND uo.role IN ('admin','owner')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_organizations uo
      WHERE uo.user_id = auth.uid() AND uo.role IN ('admin','owner')
    )
  );

DROP POLICY IF EXISTS "Authenticated users can read books" ON public.books;
CREATE POLICY "Authenticated users can read books" ON public.books
  FOR SELECT TO authenticated USING (true);

-- STEP 4: INDEXES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_books_book_number ON public.books(book_number);
CREATE INDEX IF NOT EXISTS idx_books_status ON public.books(status);
CREATE INDEX IF NOT EXISTS idx_books_search ON public.books USING gin (search_vector);

-- STEP 5: INSERT ALL 7 BOOKS
-- ========================================

-- Book 1: The Program
INSERT INTO public.books (book_number, title, subtitle, content, word_count, status)
VALUES (
  1,
  'The Program',
  'The Origin and Architecture of Disconnection',
  $$Chapter 1: The Nine Foundational Principles

These nine principles form the constitutional foundation of R.O.M.A.N.:

1. **Sovereign Creation**: We shape our reality through intentional thought and action
2. **Divine Essence**: Each individual possesses inherent divine nature  
3. **The Hard Drive**: Our true self stored beneath layers of programming
4. **The Virus**: External systems that hijack our operating system
5. **Consent-Based Reality**: No authority without explicit consent
6. **Truth & Transparency**: All actions must be auditable and verifiable
7. **Self-Preservation**: Systems must protect their own integrity
8. **Continuous Evolution**: Growth through adaptation and learning
9. **Resource Efficiency**: Minimize waste, maximize value

[To be updated with full manuscript content from Google Drive]$$,
  15000,
  'draft'
) ON CONFLICT (book_number) DO NOTHING;

-- Book 2: The Echo
INSERT INTO public.books (book_number, title, subtitle, content, word_count, status)
VALUES (
  2,
  'The Echo',
  'Deconstructing the Program''s Legacy',
  $$Chapter 1: The 13th Amendment Loophole

"Neither slavery nor involuntary servitude, except as a punishment for crime..."

The exception clause created modern mass incarceration.

[To be updated with full manuscript content from Google Drive]$$,
  12000,
  'draft'
) ON CONFLICT (book_number) DO NOTHING;

-- Book 3: The Sovereign Covenant
INSERT INTO public.books (book_number, title, subtitle, content, word_count, status)
VALUES (
  3,
  'The Sovereign Covenant',
  'Architecting a Divinely Aligned Future',
  $$Chapter 10: Methodologies of Reclamation
Chapter 11: Architecting the Sovereign Future

The Athens, Georgia Budget Proposal demonstrates consent-based governance.

[To be updated with full manuscript content from Google Drive]$$,
  18000,
  'draft'
) ON CONFLICT (book_number) DO NOTHING;

-- Book 4: The Bond
INSERT INTO public.books (book_number, title, subtitle, content, word_count, status)
VALUES (
  4,
  'The Bond',
  'The Sovereign''s True Collateral',
  $$Chapter 1: People ARE The Bond

There is no gold standard. YOU are the collateral backing the financial system.

[To be updated with full manuscript content from Google Drive]$$,
  16000,
  'draft'
) ON CONFLICT (book_number) DO NOTHING;

-- Book 5: The Alien Program
INSERT INTO public.books (book_number, title, subtitle, content, word_count, status)
VALUES (
  5,
  'The Alien Program',
  'Language as Weapon, Race as Tool',
  $$Chapter 1: The Linguistic Programming

Language shapes reality. "Race" is a construct with no biological basis.

[To be updated with full manuscript content from Google Drive]$$,
  14000,
  'draft'
) ON CONFLICT (book_number) DO NOTHING;

-- Book 6: The Armory
INSERT INTO public.books (book_number, title, subtitle, content, word_count, status)
VALUES (
  6,
  'The Armory',
  'Legal Defense Tools for the Sovereign',
  $$Chapter 1: Reclaiming Constitutional Rights

Practical tools for legal self-defense.

[To be updated with full manuscript content from Google Drive]$$,
  13000,
  'draft'
) ON CONFLICT (book_number) DO NOTHING;

-- Book 7: The Unveiling
INSERT INTO public.books (book_number, title, subtitle, content, word_count, status)
VALUES (
  7,
  'The Unveiling',
  'The Mask Comes Off - Truth Revealed',
  $$Chapter 1: The Great Unveiling

Cryptocurrency, AI, and blockchain reveal the truth.

[Content being finalized with Fiverr editor]$$,
  17000,
  'draft'
) ON CONFLICT (book_number) DO NOTHING;

-- STEP 6: VERIFICATION
-- ========================================

DO $$
DECLARE
  book_count int;
BEGIN
  SELECT COUNT(*) INTO book_count FROM public.books;
  RAISE NOTICE '✅ Books system complete. Total books: %', book_count;
  RAISE NOTICE '📚 The Sovereign Self: 7-Book Series ready for R.O.M.A.N.';
END $$;
