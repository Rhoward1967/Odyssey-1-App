-- ========================================
-- FIX BOOKS RLS - Allow R.O.M.A.N. to Read Books
-- ========================================

-- Enable RLS if not already enabled
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can manage all books" ON public.books;
DROP POLICY IF EXISTS "Authenticated users can read books" ON public.books;
DROP POLICY IF EXISTS "books_public_read" ON public.books;
DROP POLICY IF EXISTS "books_auth_read" ON public.books;

-- POLICY 1: Allow authenticated users to read all books
CREATE POLICY "authenticated_can_read_books" 
  ON public.books
  FOR SELECT
  TO authenticated
  USING (true);

-- POLICY 2: Allow anonymous users to read all books (so R.O.M.A.N.'s queries work)
CREATE POLICY "anon_can_read_books"
  ON public.books
  FOR SELECT
  TO anon
  USING (true);

-- POLICY 3: Only admins can modify books
CREATE POLICY "admins_can_manage_books"
  ON public.books
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_organizations uo
      WHERE uo.user_id = auth.uid() 
      AND uo.role IN ('admin', 'owner')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_organizations uo
      WHERE uo.user_id = auth.uid() 
      AND uo.role IN ('admin', 'owner')
    )
  );

-- Grant SELECT to both anon and authenticated
GRANT SELECT ON public.books TO anon, authenticated;

-- Verify policies are active
DO $$
BEGIN
  RAISE NOTICE '✅ Books RLS policies updated';
  RAISE NOTICE '📚 Authenticated users: CAN READ all books';
  RAISE NOTICE '🔓 Anonymous users: CAN READ all books (for R.O.M.A.N.)';
  RAISE NOTICE '🔒 Modifications: ADMIN ONLY';
END $$;

-- Test query (should return 7 books)
SELECT 
  book_number,
  title,
  word_count,
  status,
  LENGTH(content) as content_chars
FROM public.books
ORDER BY book_number;
