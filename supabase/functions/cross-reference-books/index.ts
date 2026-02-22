/**
 * CROSS-REFERENCE BOOKS — Supabase Edge Function
 * ================================================
 * Uses Claude AI to analyze all 7 books of the Sovereign Self Series
 * and identify concept threads that run between them.
 *
 * A "concept thread" is an idea, principle, or truth that appears in
 * multiple books — sometimes introduced in Book 1, evolved in Book 4,
 * and concluded in Book 7. This function finds those threads.
 *
 * POST body:
 *   { mode: 'full' | 'pair' | 'concept' }
 *   'full'    — Analyze all 7 books, rebuild all cross-references
 *   'pair'    — { book_a: number, book_b: number } — just two books
 *   'concept' — { concept_tag: string } — re-analyze a specific concept
 *
 * Howard Jones Bloodline Ancestral Trust — Odyssey-1 AI LLC
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!;
const SUPABASE_URL      = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_KEY      = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Book title reference for Claude context
const BOOK_TITLES: Record<number, string> = {
  1: 'The Program — The Origin and Architecture of Disconnection',
  2: 'The Echo — Deconstructing the Program\'s Legacy',
  3: 'The Sovereign Covenant — Architecting a Divinely Aligned Future',
  4: 'The Bond — The Sovereign\'s True Collateral',
  5: 'The Alien Program — Deconstructing Frequencies of History, Identity, and Language',
  6: 'The Armory — An Exposé and Guide to Reclaiming Divine Intent',
  7: 'The Unveiling — How Crypto, Corruption, and AI Proved the Program',
  8: 'The Sovereign Return — The Operating Manual for the Initial State (2026 Revision)',
};

interface CrossReference {
  book_a_number: number;
  book_b_number: number;
  concept_tag: string;
  concept_label: string;
  concept_category: string;
  concept_summary: string;
  book_a_excerpt: string;
  book_b_excerpt: string;
  connection_type: string;
  strength: number;
  ai_analysis: string;
}

interface BookConcept {
  book_number: number;
  concept_tag: string;
  concept_label: string;
  concept_category: string;
  excerpt: string;
  weight: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXTRACT CONCEPTS FROM A SINGLE BOOK
// ─────────────────────────────────────────────────────────────────────────────

async function extractConceptsFromBook(
  bookNumber: number,
  bookTitle: string,
  content: string,
): Promise<BookConcept[]> {
  // Use first 8000 chars to stay within context — enough to capture core themes
  const excerpt = content.substring(0, 8000);

  const prompt = `You are analyzing Book ${bookNumber} of a 7-book series called "The Sovereign Self Series" by Rickey Allan Howard.

Book: "${bookTitle}"

Content excerpt (first portion):
"""
${excerpt}
"""

Extract the 8-12 MOST IMPORTANT concepts, principles, or themes from this book. These concepts will be cross-referenced against the other 6 books to find intellectual threads running through the series.

For each concept, provide:
1. concept_tag: A kebab-case slug (e.g., "sovereign-identity", "chain-of-title", "the-program")
2. concept_label: Human-readable name (e.g., "Sovereign Identity")
3. concept_category: One of: law | identity | finance | history | spirituality | governance | economics
4. excerpt: A representative 1-3 sentence passage that captures this concept
5. weight: Importance score 60-100

Respond ONLY with a valid JSON array. No markdown, no explanation:
[
  {
    "concept_tag": "string",
    "concept_label": "string",
    "concept_category": "string",
    "excerpt": "string",
    "weight": number
  }
]`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key':         ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type':      'application/json',
    },
    body: JSON.stringify({
      model:      'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();
  const text = data.content?.[0]?.text || '[]';

  try {
    // Strip any accidental markdown
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const concepts = JSON.parse(clean) as BookConcept[];
    return concepts.map(c => ({ ...c, book_number: bookNumber }));
  } catch {
    console.error(`Failed to parse concepts for book ${bookNumber}:`, text);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CROSS-REFERENCE TWO BOOKS
// ─────────────────────────────────────────────────────────────────────────────

async function crossReferencePair(
  bookA: { number: number; title: string; content: string; concepts: BookConcept[] },
  bookB: { number: number; title: string; content: string; concepts: BookConcept[] },
): Promise<CrossReference[]> {
  const aExcerpt = bookA.content.substring(0, 5000);
  const bExcerpt = bookB.content.substring(0, 5000);

  const aConceptList = bookA.concepts.map(c => `- ${c.concept_label} (${c.concept_tag})`).join('\n');
  const bConceptList = bookB.concepts.map(c => `- ${c.concept_label} (${c.concept_tag})`).join('\n');

  const prompt = `You are analyzing two books from "The Sovereign Self Series" by Rickey Allan Howard to identify shared concept threads.

BOOK ${bookA.number}: "${bookA.title}"
Key concepts identified:
${aConceptList}

Excerpt:
"""
${aExcerpt}
"""

---

BOOK ${bookB.number}: "${bookB.title}"
Key concepts identified:
${bConceptList}

Excerpt:
"""
${bExcerpt}
"""

---

Find the 3-6 strongest conceptual connections between these two books. These are places where:
- The same truth, principle, or revelation appears in both books
- A concept introduced in one book is evolved or concluded in the other
- Both books independently arrive at the same insight from different angles

For each connection, provide:
- concept_tag: kebab-case slug of the shared concept
- concept_label: Human-readable name
- concept_category: law | identity | finance | history | spirituality | governance | economics
- concept_summary: 1-2 sentences explaining what this shared concept is
- book_a_excerpt: A 1-3 sentence passage from Book ${bookA.number} that represents this concept
- book_b_excerpt: A 1-3 sentence passage from Book ${bookB.number} that represents this concept
- connection_type: One of: reinforces | evolves | introduces | concludes | contrasts | mirrors
- strength: Connection strength 50-100
- ai_analysis: 2-3 sentences synthesizing WHY these two books connect on this concept and what it means for the reader

Respond ONLY with valid JSON array. No markdown, no explanation:
[
  {
    "concept_tag": "string",
    "concept_label": "string",
    "concept_category": "string",
    "concept_summary": "string",
    "book_a_excerpt": "string",
    "book_b_excerpt": "string",
    "connection_type": "string",
    "strength": number,
    "ai_analysis": "string"
  }
]`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key':         ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type':      'application/json',
    },
    body: JSON.stringify({
      model:      'claude-3-5-sonnet-20241022',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data  = await response.json();
  const text  = data.content?.[0]?.text || '[]';

  try {
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const refs  = JSON.parse(clean) as Omit<CrossReference, 'book_a_number' | 'book_b_number'>[];
    return refs.map(r => ({
      ...r,
      book_a_number: bookA.number,
      book_b_number: bookB.number,
    }));
  } catch {
    console.error(`Failed to parse cross-refs for ${bookA.number}↔${bookB.number}:`, text);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const body     = await req.json().catch(() => ({}));
    const mode     = body.mode || 'full';

    // ── FETCH BOOKS FROM DB ─────────────────────────────────────────────────
    const bookQuery = supabase
      .from('books')
      .select('book_number, title, subtitle, content')
      .order('book_number');

    if (mode === 'pair') {
      bookQuery.in('book_number', [body.book_a, body.book_b]);
    }

    const { data: books, error: booksError } = await bookQuery;
    if (booksError || !books?.length) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch books', detail: booksError }),
        { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } },
      );
    }

    // ── PHASE 1: EXTRACT CONCEPTS PER BOOK ─────────────────────────────────
    console.log(`Extracting concepts from ${books.length} book(s)...`);

    const bookConceptsMap: Record<number, BookConcept[]> = {};

    for (const book of books) {
      const concepts = await extractConceptsFromBook(
        book.book_number,
        `${book.title} — ${book.subtitle || ''}`,
        book.content,
      );
      bookConceptsMap[book.book_number] = concepts;

      // Upsert concepts into DB
      if (concepts.length > 0) {
        await supabase
          .from('book_concepts')
          .upsert(concepts, { onConflict: 'book_number,concept_tag' });
      }

      console.log(`  Book ${book.book_number}: ${concepts.length} concepts extracted`);
    }

    // ── PHASE 2: CROSS-REFERENCE ALL PAIRS ─────────────────────────────────
    const allCrossRefs: CrossReference[] = [];
    const bookList = books.map(b => ({
      number:   b.book_number,
      title:    `${b.title} — ${b.subtitle || ''}`,
      content:  b.content,
      concepts: bookConceptsMap[b.book_number] || [],
    }));

    let pairs: [typeof bookList[0], typeof bookList[0]][] = [];

    if (mode === 'pair') {
      pairs = [[bookList[0], bookList[1]]];
    } else {
      // All unique pairs from N books: N*(N-1)/2 pairs
      for (let i = 0; i < bookList.length; i++) {
        for (let j = i + 1; j < bookList.length; j++) {
          pairs.push([bookList[i], bookList[j]]);
        }
      }
    }

    console.log(`Cross-referencing ${pairs.length} book pair(s)...`);

    for (const [bookA, bookB] of pairs) {
      const refs = await crossReferencePair(bookA, bookB);
      allCrossRefs.push(...refs);
      console.log(`  Book ${bookA.number} ↔ Book ${bookB.number}: ${refs.length} connections found`);

      // Upsert into DB as we go
      if (refs.length > 0) {
        const { error: upsertError } = await supabase
          .from('book_cross_references')
          .upsert(refs, {
            onConflict: 'book_a_number,book_b_number,concept_tag',
            ignoreDuplicates: false,
          });
        if (upsertError) {
          console.error('Upsert error:', upsertError);
        }
      }

      // Small delay to respect Anthropic rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // ── SUMMARY ─────────────────────────────────────────────────────────────
    const uniqueConcepts = new Set(allCrossRefs.map(r => r.concept_tag)).size;
    const avgStrength    = allCrossRefs.length
      ? Math.round(allCrossRefs.reduce((s, r) => s + r.strength, 0) / allCrossRefs.length)
      : 0;

    return new Response(
      JSON.stringify({
        success:          true,
        mode,
        books_analyzed:   books.length,
        pairs_compared:   pairs.length,
        connections_found: allCrossRefs.length,
        unique_concepts:  uniqueConcepts,
        avg_strength:     avgStrength,
        message: `Cross-reference analysis complete. ${allCrossRefs.length} concept connections identified across ${books.length} books.`,
      }),
      { headers: { ...corsHeaders, 'content-type': 'application/json' } },
    );

  } catch (err) {
    console.error('Cross-reference function error:', err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } },
    );
  }
});
