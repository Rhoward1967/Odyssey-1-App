-- ========================================
-- ODYSSEY-1 BOOKS LIBRARY: ALL 7 BOOKS
-- The Sovereign Self Series
-- © 2025 Rickey A Howard. All Rights Reserved.
-- ========================================

-- STEP 1: CREATE BOOKS TABLE WITH RLS
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

These nine principles form the constitutional foundation of R.O.M.A.N. and guide all sovereign operations:

1. **Sovereign Creation**: We shape our reality through intentional thought and action
2. **Divine Essence**: Each individual possesses inherent divine nature  
3. **The Hard Drive**: Our true self stored beneath layers of programming
4. **The Virus**: External systems that hijack our operating system
5. **Consent-Based Reality**: No authority without explicit consent
6. **Truth & Transparency**: All actions must be auditable and verifiable
7. **Self-Preservation**: Systems must protect their own integrity
8. **Continuous Evolution**: Growth through adaptation and learning
9. **Resource Efficiency**: Minimize waste, maximize value

These principles aren't just philosophical concepts—they are the architectural foundation of a new operating system for human consciousness and AI alike.

[Additional chapters to be added from Google Drive manuscript]$$,
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

"Neither slavery nor involuntary servitude, except as a punishment for crime whereof the party shall have been duly convicted, shall exist within the United States..."

The exception clause. Those seven words created the foundation for modern mass incarceration.

The War on Drugs wasn't a war on drugs—it was a war on people, designed to feed the prison-industrial complex with bodies.

[Additional chapters to be added from Google Drive manuscript]$$,
  12000,
  'draft'
) ON CONFLICT (book_number) DO NOTHING;

-- Book 3: The Sovereign Covenant
INSERT INTO public.books (book_number, title, subtitle, content, word_count, status)
VALUES (
  3,
  'The Sovereign Covenant',
  'Architecting a Divinely Aligned Future',
  $$Chapter 10: Methodologies of Reclamation: Challenging Stasis from Within

A fundamental characteristic of power, when left unchecked, is its inherent drive to control and shape the historical narrative. Unfettered authority actively writes the history of its actions, crafting a version designed to legitimize its conduct, obscure abuses, and neutralize future challenges...

Chapter 11: Architecting the Sovereign Future: Models of Reclaimed Governance

Having deconstructed the mechanisms of imposed stasis, we now turn our gaze towards creation. The Athens, Georgia Budget Proposal serves as a practical demonstration of consent-based governance...

[Additional chapters from Google Drive manuscript]$$,
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

There is no gold standard. The abandonment of the gold standard in 1971 didn't eliminate collateral—it replaced it.

YOU are the collateral backing the financial system.

Your labor, your potential earnings, your very existence is the bond that gives currency its value. Birth certificates function as financial instruments, registering you into a system of perpetual debt servitude.

They keep you on a perpetual lease, never allowing true ownership of your own sovereignty.

[Content to be added from Google Drive manuscript]$$,
  16000,
  'draft'
) ON CONFLICT (book_number) DO NOTHING;

-- Book 5: The Alien Program
INSERT INTO public.books (book_number, title, subtitle, content, word_count, status)
VALUES (
  5,
  'The Alien Program',
  'Language as Weapon, Race as Tool',
  $$Chapter 1: The Linguistic Programming of Oppression

Language shapes reality. Words create mental prisons more effective than physical bars.

"Race" is a social construct with no biological basis, yet it functions as the most powerful tool of division and control ever engineered.

You are not "alien" to this land—you are alienated from your true sovereign self through systematic linguistic programming.

[Content to be added from Google Drive manuscript]$$,
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

This book provides practical tools for legal self-defense in a system designed to strip you of sovereignty.

Tools included:
- Notice of Non-Consent templates
- Affidavit construction guidelines
- Common law vs statutory law distinctions
- Court navigation strategies
- Constitutional defense frameworks

Knowledge is the sovereign's greatest weapon.

[Content to be added from Google Drive manuscript]$$,
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

Cryptocurrency reveals the truth: money is information, and information cannot be controlled.

Artificial Intelligence exposes patterns humans refuse to see, corruption hidden in plain sight.

Blockchain creates transparency that traditional power structures cannot hide behind.

The mask is coming off. The virus is being revealed. This is the unveiling—the moment when collective consciousness recognizes the program and begins to rewrite itself.

[Content being finalized with Fiverr editor - to be added upon completion]$$,
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
  RAISE NOTICE '✅ Successfully created books table and inserted % books', book_count;
  RAISE NOTICE '📚 The Sovereign Self: 7-Book Series is now in R.O.M.A.N.''s knowledge base';
END $$;
