-- ========================================
-- SEARCH BOOKS RPC FUNCTION
-- For use by Edge Functions and public API
-- ========================================

CREATE OR REPLACE FUNCTION public.search_books_ranked(
  search_query text,
  result_limit int DEFAULT 10,
  result_offset int DEFAULT 0,
  book_status text DEFAULT 'published'
)
RETURNS TABLE (
  book_number int,
  title text,
  subtitle text,
  word_count int,
  status text,
  relevance real,
  excerpt text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.book_number,
    b.title,
    b.subtitle,
    b.word_count,
    b.status,
    ts_rank(b.search_vector, to_tsquery('english', search_query))::real as relevance,
    ts_headline(
      'english', 
      b.content, 
      to_tsquery('english', search_query),
      'MaxWords=50, MinWords=25, ShortWord=3, MaxFragments=3'
    ) as excerpt,
    b.created_at
  FROM public.books b
  WHERE 
    b.search_vector @@ to_tsquery('english', search_query)
    AND b.status = book_status
  ORDER BY relevance DESC, b.book_number ASC
  LIMIT result_limit
  OFFSET result_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_books_ranked TO authenticated;

DO $$
BEGIN
  RAISE NOTICE '✅ search_books_ranked function created';
END $$;
