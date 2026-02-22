/**
 * BOOK INTELLIGENCE FEED — R.O.M.A.N. Edge Function
 * ===================================================
 * R.O.M.A.N. is the system. Claude is the analysis engine R.O.M.A.N. calls.
 *
 * This function is R.O.M.A.N.'s intelligence processor:
 *   1. Receive new world development (legislation, event, observation)
 *   2. Dispatch Claude to map it against all 8 books + their concepts
 *   3. Claude writes dated appendix entries for each affected book
 *   4. Claude detects new patterns not yet named in the canon → Trap Alerts
 *   5. Appendix inserts trigger cross-reference re-analysis automatically
 *   6. The 8-book circuit updates in real-time. No human required.
 *
 * POST body:
 *   {
 *     headline:     string,
 *     content:      string,
 *     category:     'digital_id'|'cbdc'|'surveillance_ai'|'legislation'|'finance'|'nature'|'governance',
 *     source_label: string (optional),
 *     source_url:   string (optional),
 *     source_date:  'YYYY-MM-DD' (optional, defaults to today),
 *     submitted_by: string (optional, defaults to 'manual')
 *   }
 *
 * Howard Jones Bloodline Ancestral Trust — Odyssey-1 AI LLC
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!;
const SUPABASE_URL      = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_KEY      = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

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

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface IntelligenceInput {
  headline:     string;
  content:      string;
  category:     string;
  source_label?: string;
  source_url?:   string;
  source_date?:  string;
  submitted_by?: string;
}

interface BookConceptRow {
  book_number:      number;
  concept_tag:      string;
  concept_label:    string;
  concept_category: string;
  excerpt:          string;
}

interface MappingResult {
  mapped_books:    number[];
  mapped_concepts: string[];
  threat_level:    'background' | 'active' | 'critical' | 'new_trap';
  brief_mapping:   string;
  book_relevance:  Array<{
    book_number:    number;
    concept_tags:   string[];
    relevance_note: string;
  }>;
}

interface NewTrapResult {
  detected:        boolean;
  pattern_tag?:    string;
  pattern_label?:  string;
  pattern_summary?: string;
  appears_in_books?: number[];
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1: MAP INTELLIGENCE TO BOOKS & CONCEPTS
// ─────────────────────────────────────────────────────────────────────────────

async function mapIntelligenceToBooks(
  intelligence: IntelligenceInput,
  concepts: BookConceptRow[],
): Promise<MappingResult> {
  // Build concept index per book for Claude
  const bookConceptIndex = concepts.reduce<Record<number, string[]>>((acc, c) => {
    if (!acc[c.book_number]) acc[c.book_number] = [];
    acc[c.book_number].push(`  - ${c.concept_label} (${c.concept_tag}) [${c.concept_category}]: "${c.excerpt?.substring(0, 120)}..."`);
    return acc;
  }, {});

  const conceptsContext = Object.entries(bookConceptIndex)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([num, lines]) => `Book ${num} — ${BOOK_TITLES[Number(num)]}:\n${lines.join('\n')}`)
    .join('\n\n');

  const prompt = `You are R.O.M.A.N. (Reasoning Operating Matrix with Autonomous Navigation), the sovereign intelligence system of Odyssey-1. You are analyzing new world intelligence against the 8-book Sovereign Self Series by Rickey Allan Howard.

THE 8-BOOK FRAMEWORK — Key Concepts per Book:
${conceptsContext}

---

NEW INTELLIGENCE:
Headline: "${intelligence.headline}"
Category: ${intelligence.category}
Date: ${intelligence.source_date || new Date().toISOString().split('T')[0]}

Content:
"""
${intelligence.content}
"""

---

TASK: Analyze this intelligence against the 8-book framework. Identify:

1. Which books (1-8) does this intelligence directly confirm, evolve, or add evidence to?
2. Which specific concept_tags from those books does this intelligence confirm?
3. What is the threat level?
   - 'background': General confirmation of existing patterns, no immediate escalation
   - 'active': A system the books warned about has been activated or advanced
   - 'critical': Direct implementation of a control mechanism described in the books
   - 'new_trap': Pattern that goes beyond what the books named — new mechanism emerging
4. Brief 2-sentence synthesis of what this intelligence means for the sovereign framework

Respond ONLY with valid JSON:
{
  "mapped_books": [array of book numbers, e.g. [1, 3, 8]],
  "mapped_concepts": [array of concept_tags, e.g. ["cbdc-burn-code", "digital-twin-identity"]],
  "threat_level": "background" | "active" | "critical" | "new_trap",
  "brief_mapping": "2-sentence synthesis",
  "book_relevance": [
    {
      "book_number": number,
      "concept_tags": ["concept-tag-1", "concept-tag-2"],
      "relevance_note": "1 sentence explaining WHY this book is relevant"
    }
  ]
}`;

  const response = await callClaude(prompt, 1500);
  try {
    const clean = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(clean) as MappingResult;
  } catch {
    console.error('Failed to parse mapping result:', response);
    return {
      mapped_books:    [],
      mapped_concepts: [],
      threat_level:    'background',
      brief_mapping:   'Analysis could not be parsed.',
      book_relevance:  [],
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2: WRITE APPENDIX ENTRY FOR A SPECIFIC BOOK
// ─────────────────────────────────────────────────────────────────────────────

async function writeBookAppendix(
  intelligence: IntelligenceInput,
  bookNumber: number,
  conceptTags: string[],
  relevanceNote: string,
  bookContent: string,
): Promise<{ headline: string; content: string; concept_tag: string }> {
  const bookTitle = BOOK_TITLES[bookNumber];
  const bookExcerpt = bookContent.substring(0, 3000);

  const prompt = `You are R.O.M.A.N., writing a dated appendix entry for Book ${bookNumber} of the Sovereign Self Series.

Book ${bookNumber}: "${bookTitle}"

Opening of the book (for voice/style reference):
"""
${bookExcerpt}
"""

Primary concept tags this appendix extends: ${conceptTags.join(', ')}

Why this book is relevant: ${relevanceNote}

NEW INTELLIGENCE (${intelligence.source_date || 'Feb 2026'}):
"${intelligence.headline}"
${intelligence.content}

---

Write a 2-4 paragraph appendix entry that:
1. Opens with the date and connects this new intelligence directly to the book's core argument
2. Explains what this development confirms, evolves, or reveals about the concepts the book established
3. Uses the voice, tone, and analytical style of the source book
4. Does NOT repeat or paraphrase the entire intelligence — synthesize it through the book's framework
5. Ends with what this means for the sovereign operating in 2026

Also provide a short headline (8-12 words) for this appendix entry.
Choose the PRIMARY concept_tag this appendix should be indexed under.

Respond ONLY with valid JSON:
{
  "headline": "string (8-12 words)",
  "content": "string (full appendix text, 2-4 paragraphs)",
  "concept_tag": "primary-concept-tag"
}`;

  const response = await callClaude(prompt, 1200);
  try {
    const clean = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(clean);
  } catch {
    // Fallback: store the raw intelligence as appendix
    return {
      headline:    intelligence.headline.substring(0, 80),
      content:     `[${intelligence.source_date || 'Feb 2026'}] ${intelligence.content}`,
      concept_tag: conceptTags[0] || 'general',
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3: DETECT NEW TRAPS
// ─────────────────────────────────────────────────────────────────────────────

async function detectNewTrap(
  intelligence: IntelligenceInput,
  mapping: MappingResult,
  existingTrapTags: string[],
): Promise<NewTrapResult> {
  const prompt = `You are R.O.M.A.N. evaluating whether new intelligence reveals a pattern NOT yet named in the 8-book Sovereign Self Series.

The 8 books cover these categories of control mechanisms and sovereign responses:
- The Program: institutional disconnection, debt-consciousness, false authority
- The Echo: generational trauma from the Program, inherited compliance
- The Sovereign Covenant: divine law, natural law, covenant as protection
- The Bond: collateral, trust instruments, value anchored in being
- The Alien Program: language/frequency manipulation, false history, identity theft
- The Armory: tools for reclaiming divine intent, legal instruments, knowledge
- The Unveiling: crypto/AI/corruption proving the Program in real-time
- The Sovereign Return (2026): digital IDs, CBDCs, surveillance AI, burn codes, Nexus/Spectrum

Existing Trap Alert patterns already identified: ${existingTrapTags.length > 0 ? existingTrapTags.join(', ') : 'none yet'}

NEW INTELLIGENCE:
"${intelligence.headline}"
${intelligence.content}

This intelligence was already mapped to: Books ${mapping.mapped_books.join(', ')}, Concepts: ${mapping.mapped_concepts.join(', ')}

QUESTION: Does this intelligence reveal a NEW pattern of control or deception that is NOT yet named in any of the 8 books, and NOT already in the existing trap alerts?

A "new trap" is:
- A mechanism the books described in principle but did not name specifically
- A new vector of control that emerged AFTER the books were written
- A convergence of multiple systems creating a new threat not analyzed individually

If YES — provide:
- pattern_tag: kebab-case slug of the new pattern
- pattern_label: human-readable name (4-7 words)
- pattern_summary: 2-3 sentences describing the pattern and why it's dangerous
- appears_in_books: which books have partial evidence of this pattern

If NO — respond with detected: false

Respond ONLY with valid JSON:
{
  "detected": boolean,
  "pattern_tag": "string or null",
  "pattern_label": "string or null",
  "pattern_summary": "string or null",
  "appears_in_books": [array of book numbers] or null
}`;

  const response = await callClaude(prompt, 800);
  try {
    const clean = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(clean) as NewTrapResult;
  } catch {
    return { detected: false };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CLAUDE CALL HELPER
// ─────────────────────────────────────────────────────────────────────────────

async function callClaude(prompt: string, maxTokens: number): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key':         ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type':      'application/json',
    },
    body: JSON.stringify({
      model:      'claude-3-5-sonnet-20241022',
      max_tokens: maxTokens,
      messages:   [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Anthropic API error: ${data.error?.message || JSON.stringify(data)}`);
  }
  return data.content?.[0]?.text || '';
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  try {
    const body         = await req.json().catch(() => ({}));
    const intelligence = body as IntelligenceInput;

    if (!intelligence.headline || !intelligence.content) {
      return new Response(
        JSON.stringify({ error: 'headline and content are required' }),
        { status: 400, headers: { ...corsHeaders, 'content-type': 'application/json' } },
      );
    }

    // ── INSERT INTELLIGENCE RECORD (pending) ────────────────────────────────
    const { data: intelRow, error: intelErr } = await supabase
      .from('book_intelligence')
      .insert({
        headline:     intelligence.headline,
        content:      intelligence.content,
        category:     intelligence.category || 'governance',
        source_label: intelligence.source_label || null,
        source_url:   intelligence.source_url   || null,
        source_date:  intelligence.source_date  || new Date().toISOString().split('T')[0],
        submitted_by: intelligence.submitted_by || 'manual',
        status:       'pending',
      })
      .select()
      .single();

    if (intelErr || !intelRow) {
      throw new Error(`Failed to insert intelligence: ${intelErr?.message}`);
    }

    const intelligenceId = intelRow.id;
    console.log(`R.O.M.A.N. processing intelligence: ${intelligenceId}`);

    // ── FETCH ALL BOOK CONCEPTS FOR CONTEXT ─────────────────────────────────
    const { data: concepts } = await supabase
      .from('book_concepts')
      .select('book_number, concept_tag, concept_label, concept_category, excerpt')
      .order('book_number');

    const { data: books } = await supabase
      .from('books')
      .select('book_number, content')
      .order('book_number');

    const bookContentMap: Record<number, string> = {};
    for (const b of (books || [])) {
      bookContentMap[b.book_number] = b.content || '';
    }

    // ── STEP 1: MAP TO BOOKS & CONCEPTS ─────────────────────────────────────
    console.log('R.O.M.A.N. → dispatching Claude for book mapping...');
    const mapping = await mapIntelligenceToBooks(intelligence, concepts || []);
    console.log(`Mapped to books: ${mapping.mapped_books.join(', ')}, threat: ${mapping.threat_level}`);

    await new Promise(r => setTimeout(r, 400)); // rate limit buffer

    // ── STEP 2: WRITE APPENDIX PER AFFECTED BOOK ────────────────────────────
    const appendicesWritten: number[] = [];

    for (const rel of (mapping.book_relevance || [])) {
      if (!rel.concept_tags?.length) continue;

      const bookContent = bookContentMap[rel.book_number] || '';
      const appendix    = await writeBookAppendix(
        intelligence,
        rel.book_number,
        rel.concept_tags,
        rel.relevance_note,
        bookContent,
      );

      const { error: appErr } = await supabase
        .from('book_appendices')
        .insert({
          book_number:     rel.book_number,
          concept_tag:     appendix.concept_tag,
          appendix_date:   intelligence.source_date || new Date().toISOString().split('T')[0],
          headline:        appendix.headline,
          content:         appendix.content,
          intelligence_id: intelligenceId,
        });

      if (appErr) {
        console.error(`Failed to write appendix for Book ${rel.book_number}:`, appErr);
      } else {
        appendicesWritten.push(rel.book_number);
        console.log(`Appendix written for Book ${rel.book_number}`);
      }

      await new Promise(r => setTimeout(r, 400));
    }

    // ── STEP 3: DETECT NEW TRAPS ─────────────────────────────────────────────
    const { data: existingTraps } = await supabase
      .from('book_trap_alerts')
      .select('pattern_tag');

    const existingTrapTags = (existingTraps || []).map(t => t.pattern_tag);
    const trapResult       = await detectNewTrap(intelligence, mapping, existingTrapTags);

    let newTrapDetected = false;

    if (trapResult.detected && trapResult.pattern_tag) {
      const { error: trapErr } = await supabase
        .from('book_trap_alerts')
        .upsert(
          {
            pattern_tag:          trapResult.pattern_tag,
            pattern_label:        trapResult.pattern_label,
            pattern_summary:      trapResult.pattern_summary,
            evidence_intelligence: [intelligenceId],
            appears_in_books:     trapResult.appears_in_books || mapping.mapped_books,
            status:               'emerging',
          },
          { onConflict: 'pattern_tag', ignoreDuplicates: false }
        );

      if (!trapErr) {
        newTrapDetected = true;
        console.log(`New Trap Alert: ${trapResult.pattern_label} (${trapResult.pattern_tag})`);
      }
    }

    // ── UPDATE INTELLIGENCE RECORD WITH RESULTS ──────────────────────────────
    const finalThreatLevel = newTrapDetected ? 'new_trap' : mapping.threat_level;

    await supabase
      .from('book_intelligence')
      .update({
        status:          'analyzed',
        ai_analysis:     mapping.brief_mapping,
        mapped_books:    mapping.mapped_books,
        mapped_concepts: mapping.mapped_concepts,
        threat_level:    finalThreatLevel,
      })
      .eq('id', intelligenceId);

    // ── RESPOND ──────────────────────────────────────────────────────────────
    return new Response(
      JSON.stringify({
        success:          true,
        intelligence_id:  intelligenceId,
        books_updated:    appendicesWritten,
        concepts_confirmed: mapping.mapped_concepts,
        threat_level:     finalThreatLevel,
        new_trap_detected: newTrapDetected,
        new_trap:         newTrapDetected ? {
          pattern_tag:   trapResult.pattern_tag,
          pattern_label: trapResult.pattern_label,
        } : null,
        message: `R.O.M.A.N. analysis complete. ${appendicesWritten.length} book(s) updated.${newTrapDetected ? ` New Trap Alert: ${trapResult.pattern_label}.` : ''}`,
      }),
      { headers: { ...corsHeaders, 'content-type': 'application/json' } },
    );

  } catch (err) {
    console.error('R.O.M.A.N. intelligence error:', err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } },
    );
  }
});
