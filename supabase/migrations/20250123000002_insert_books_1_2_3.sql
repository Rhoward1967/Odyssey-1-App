-- ========================================
-- INSERT BOOKS 1-3 (Books 4-7 to be added later)
-- ========================================

-- Book 1: The Program
INSERT INTO books (book_number, title, subtitle, content, word_count, status)
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

[Additional content from manuscript to be added]$$,
  15000,
  'draft'
) ON CONFLICT (book_number) DO NOTHING;

-- Book 2: The Echo
INSERT INTO books (book_number, title, subtitle, content, word_count, status)
VALUES (
  2,
  'The Echo',
  'Deconstructing the Program''s Legacy',
  $$Chapter 1: The 13th Amendment Loophole

"Neither slavery nor involuntary servitude, except as a punishment for crime..."

The exception clause created modern mass incarceration and the prison-industrial complex.

[Additional content from manuscript to be added]$$,
  12000,
  'draft'
) ON CONFLICT (book_number) DO NOTHING;

-- Book 3: The Sovereign Covenant
INSERT INTO books (book_number, title, subtitle, content, word_count, status)
VALUES (
  3,
  'The Sovereign Covenant',
  'Architecting a Divinely Aligned Future',
  $$Chapter 10: Methodologies of Reclamation: Challenging Stasis from Within

A fundamental characteristic of power, when left unchecked, is its inherent drive to control and shape the historical narrative...

Chapter 11: Architecting the Sovereign Future: Models of Reclaimed Governance

The Athens, Georgia Budget Proposal demonstrates consent-based governance in action...

[Full chapters from manuscript]$$,
  18000,
  'draft'
) ON CONFLICT (book_number) DO NOTHING;

-- Verification
DO $$
DECLARE
  book_count int;
BEGIN
  SELECT COUNT(*) INTO book_count FROM public.books;
  RAISE NOTICE '✅ Books 1-3 inserted. Total books in database: %', book_count;
END $$;
