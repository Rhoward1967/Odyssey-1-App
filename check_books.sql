-- Check Books Table Status
-- Run this in Supabase SQL Editor to see what books exist

SELECT 
  book_number,
  title,
  substring(subtitle, 1, 50) as subtitle,
  word_count,
  status,
  created_at
FROM public.books
ORDER BY book_number;

-- Count total books
SELECT COUNT(*) as total_books FROM public.books;

-- Check if Book 1 specifically exists
SELECT * FROM public.books WHERE book_number = 1;

-- If no results, run this to insert Book 1:
/*
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
*/
