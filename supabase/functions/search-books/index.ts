/**
 * Books Search Edge Function
 * © 2025 Rickey A Howard. All Rights Reserved.
 * 
 * Public API for searching the 7-book series with full-text search
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface SearchParams {
  q: string;           // Search query
  page?: number;       // Page number (default: 1)
  limit?: number;      // Results per page (default: 10)
  phrase?: boolean;    // Use phrase search (default: false)
  status?: string;     // Filter by status (default: 'published')
}

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const params: SearchParams = {
      q: url.searchParams.get('q') || '',
      page: parseInt(url.searchParams.get('page') || '1'),
      limit: parseInt(url.searchParams.get('limit') || '10'),
      phrase: url.searchParams.get('phrase') === 'true',
      status: url.searchParams.get('status') || 'published'
    };

    if (!params.q) {
      return new Response(
        JSON.stringify({ error: 'Query parameter "q" is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const offset = (params.page! - 1) * params.limit!;

    // Build search query based on phrase mode
    const searchQuery = params.phrase
      ? `phraseto_tsquery('english', '${params.q}')`
      : `to_tsquery('english', '${params.q.replace(/\s+/g, ' & ')}')`;

    // Execute search with ranking and excerpts
    const { data, error } = await supabase.rpc('search_books_ranked', {
      search_query: params.q,
      result_limit: params.limit,
      result_offset: offset,
      book_status: params.status
    });

    if (error) throw error;

    // Get total count for pagination
    const { count } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true })
      .textSearch('search_vector', params.q)
      .eq('status', params.status);

    return new Response(
      JSON.stringify({
        data,
        pagination: {
          page: params.page,
          limit: params.limit,
          total: count,
          pages: Math.ceil((count || 0) / params.limit!)
        }
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
