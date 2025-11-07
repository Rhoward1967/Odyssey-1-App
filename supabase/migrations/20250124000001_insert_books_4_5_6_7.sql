-- ========================================
-- INSERT BOOKS 4-7 (Complete the series)
-- ========================================

-- Book 4: The Bond
INSERT INTO books (book_number, title, subtitle, content, word_count, status)
VALUES (
  4,
  'The Bond',
  'The Sovereign''s True Collateral',
  $$Chapter 1: People ARE The Bond

There is no gold standard. YOU are the collateral backing the financial system.

Your labor, your potential, your very existence is the bond that gives currency its value.

[Content from manuscript to be added]$$,
  16000,
  'draft'
) ON CONFLICT (book_number) DO NOTHING;

-- Book 5: The Alien Program
INSERT INTO books (book_number, title, subtitle, content, word_count, status)
VALUES (
  5,
  'The Alien Program',
  'Language as Weapon, Race as Tool',
  $$Chapter 1: The Linguistic Programming

Language shapes reality. "Race" is a construct with no biological basis.

You are not "alien" to this land—you are alienated from your true self.

[Content from manuscript to be added]$$,
  14000,
  'draft'
) ON CONFLICT (book_number) DO NOTHING;

-- Book 6: The Armory
INSERT INTO books (book_number, title, subtitle, content, word_count, status)
VALUES (
  6,
  'The Armory',
  'Legal Defense Tools for the Sovereign',
  $$Chapter 1: Reclaiming Constitutional Rights

Practical tools for legal self-defense:
- Notice of Non-Consent templates
- Affidavit construction
- Common law vs statutory law
- Court navigation strategies

[Content from manuscript to be added]$$,
  13000,
  'draft'
) ON CONFLICT (book_number) DO NOTHING;

-- Book 7: The Unveiling
INSERT INTO books (book_number, title, subtitle, content, word_count, status)
VALUES (
  7,
  'The Unveiling',
  'The Mask Comes Off - Truth Revealed',
  $$Chapter 1: The Great Unveiling

Cryptocurrency reveals: money is information.
AI exposes patterns humans refuse to see.
Blockchain creates transparency corruption cannot hide.

[Content being finalized with Fiverr editor]$$,
  17000,
  'draft'
) ON CONFLICT (book_number) DO NOTHING;

-- Verification
DO $$
DECLARE
  book_count int;
BEGIN
  SELECT COUNT(*) INTO book_count FROM public.books;
  RAISE NOTICE '✅ Books 4-7 inserted. Total books in database: %', book_count;
  RAISE NOTICE '📚 The Sovereign Self: Complete 7-Book Series is now in R.O.M.A.N.''s knowledge base!';
END $$;
