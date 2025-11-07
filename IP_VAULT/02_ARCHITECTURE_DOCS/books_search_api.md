# Books Search API - SQL Queries

© 2025 Rickey A Howard. All Rights Reserved.

## Full-Text Search with Pagination

### Basic Search Query
```sql
-- Search books by keyword with relevance ranking
SELECT 
  book_number,
  title,
  subtitle,
  word_count,
  status,
  ts_rank(search_vector, to_tsquery('english', :search_query)) as relevance,
  ts_headline('english', content, to_tsquery('english', :search_query), 
    'MaxWords=50, MinWords=25, ShortWord=3, MaxFragments=3') as excerpt
FROM public.books
WHERE search_vector @@ to_tsquery('english', :search_query)
  AND status = 'published' -- Only show published books to public
ORDER BY relevance DESC, book_number ASC
LIMIT :limit OFFSET :offset;
```

**Parameters:**
- `:search_query` - Search terms (e.g., 'sovereign & constitutional')
- `:limit` - Results per page (default: 10)
- `:offset` - Pagination offset (page * limit)

---

### Phrase Search Query
```sql
-- Search for exact phrases
SELECT 
  book_number,
  title,
  subtitle,
  phraseto_tsquery('english', :phrase) as query,
  ts_rank(search_vector, phraseto_tsquery('english', :phrase)) as relevance
FROM public.books
WHERE search_vector @@ phraseto_tsquery('english', :phrase)
  AND status = 'published'
ORDER BY relevance DESC;
```

**Example:** `:phrase` = 'sovereign creation'

---

### Multi-Field Search
```sql
-- Search across title, subtitle, and content with different weights
SELECT 
  book_number,
  title,
  subtitle,
  CASE 
    WHEN title ILIKE '%' || :keyword || '%' THEN 3.0
    WHEN subtitle ILIKE '%' || :keyword || '%' THEN 2.0
    ELSE ts_rank(search_vector, plainto_tsquery('english', :keyword))
  END as relevance
FROM public.books
WHERE 
  title ILIKE '%' || :keyword || '%'
  OR subtitle ILIKE '%' || :keyword || '%'
  OR search_vector @@ plainto_tsquery('english', :keyword)
ORDER BY relevance DESC;
```

---

### Search with Filters
```sql
-- Search with status and book number filters
SELECT 
  book_number,
  title,
  subtitle,
  status,
  word_count,
  created_at,
  ts_rank(search_vector, to_tsquery('english', :search_query)) as relevance
FROM public.books
WHERE 
  search_vector @@ to_tsquery('english', :search_query)
  AND (:status IS NULL OR status = :status)
  AND (:min_book_number IS NULL OR book_number >= :min_book_number)
  AND (:max_book_number IS NULL OR book_number <= :max_book_number)
ORDER BY relevance DESC
LIMIT :limit OFFSET :offset;
```

---

## Count Total Results (for Pagination)

```sql
-- Get total count for pagination
SELECT COUNT(*) as total
FROM public.books
WHERE search_vector @@ to_tsquery('english', :search_query)
  AND status = 'published';
```

---

## Get Related Books (Similar Content)

```sql
-- Find books with similar content to a given book
SELECT 
  b2.book_number,
  b2.title,
  b2.subtitle,
  similarity(b1.search_vector::text, b2.search_vector::text) as similarity_score
FROM public.books b1
CROSS JOIN public.books b2
WHERE b1.book_number = :reference_book_number
  AND b2.book_number != :reference_book_number
  AND b2.status = 'published'
ORDER BY similarity_score DESC
LIMIT 3;
```

---

## Usage Examples

### JavaScript/TypeScript (Supabase Client)
```typescript
// Search for "sovereign" in published books
const { data, error } = await supabase
  .rpc('search_books', {
    search_query: 'sovereign',
    limit: 10,
    offset: 0
  });

// Or use raw SQL via REST API
const response = await fetch('/api/books/search?q=sovereign&page=1');
```

### Edge Function Example
```typescript
// supabase/functions/search-books/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const url = new URL(req.url);
  const query = url.searchParams.get('q') || '';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 10;
  const offset = (page - 1) * limit;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );

  const { data, error } = await supabase
    .from('books')
    .select('book_number, title, subtitle, word_count')
    .textSearch('search_vector', query)
    .eq('status', 'published')
    .order('book_number')
    .range(offset, offset + limit - 1);

  return new Response(JSON.stringify({ data, error }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

---

## Performance Tips

1. **Use indexes** - Already created on `search_vector` (GIN index)
2. **Cache results** - Cache popular searches client-side
3. **Limit content** - Use `ts_headline` for excerpts instead of full content
4. **Pagination** - Always use LIMIT/OFFSET for large result sets
5. **Filter first** - Apply status/book_number filters before full-text search

---

**Next Steps:**
- Create Edge Function for public book search
- Add to R.O.M.A.N. interface for constitutional queries
- Expose via REST API for external tools
