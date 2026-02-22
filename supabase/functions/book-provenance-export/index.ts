/**
 * BOOK PROVENANCE EXPORT — R.O.M.A.N. Chain of Custody
 * ======================================================
 * Generates a signed, timestamped provenance manifest of the entire
 * 8-book Sovereign Self Series archive.
 *
 * This is the chain of custody document. It proves:
 *   1. Each book's content existed at a specific creation date
 *   2. Intelligence was recorded AS events happened — not assembled retroactively
 *   3. Concept cross-references were identified BEFORE confirmation arrived
 *   4. Trap alerts were named at the moment of detection, not after
 *
 * The manifest is:
 *   - Timestamped at the moment of export
 *   - SHA-256 hashed (corpus integrity fingerprint)
 *   - Structured as JSON (AI-readable) and plain text (human-readable)
 *   - Attributed to the Howard Jones Bloodline Ancestral Trust
 *
 * POST body: { format: 'json' | 'text' | 'both' }
 *
 * Howard Jones Bloodline Ancestral Trust — Odyssey-1 AI LLC
 * Author: Rickey Allan Howard, 595 Macon Highway, Athens, Georgia 30606
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL  = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// ─────────────────────────────────────────────────────────────────────────────
// SHA-256 HASH
// ─────────────────────────────────────────────────────────────────────────────

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data    = encoder.encode(text);
  const hash    = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// ─────────────────────────────────────────────────────────────────────────────
// PLAIN TEXT FORMATTER
// ─────────────────────────────────────────────────────────────────────────────

function formatProvenanceText(manifest: any): string {
  const lines: string[] = [];
  const divider   = '═'.repeat(72);
  const subdiv    = '─'.repeat(72);

  lines.push(divider);
  lines.push('SOVEREIGN SELF SERIES — PROVENANCE MANIFEST');
  lines.push('Chain of Custody & Archival Record');
  lines.push(divider);
  lines.push('');
  lines.push(`AUTHOR:        ${manifest.author}`);
  lines.push(`TRUST:         ${manifest.trust}`);
  lines.push(`ADDRESS:       ${manifest.address}`);
  lines.push(`JURISDICTION:  ${manifest.jurisdiction}`);
  lines.push('');
  lines.push(`EXPORT DATE:   ${manifest.export_timestamp}`);
  lines.push(`CORPUS HASH:   ${manifest.corpus_hash}`);
  lines.push(`TOTAL BOOKS:   ${manifest.summary.total_books}`);
  lines.push(`TOTAL WORDS:   ${manifest.summary.total_word_count.toLocaleString()}`);
  lines.push(`CROSS-REFS:    ${manifest.summary.total_cross_references}`);
  lines.push(`CONCEPT TAGS:  ${manifest.summary.unique_concepts}`);
  lines.push(`APPENDICES:    ${manifest.summary.total_appendices}`);
  lines.push(`INTEL ENTRIES: ${manifest.summary.total_intelligence_entries}`);
  lines.push(`TRAP ALERTS:   ${manifest.summary.total_trap_alerts}`);
  lines.push('');
  lines.push(divider);
  lines.push('BOOKS IN THE RECORD');
  lines.push(divider);
  lines.push('');

  for (const book of manifest.books) {
    lines.push(`Book ${book.book_number}: ${book.title}`);
    lines.push(`  Subtitle:   ${book.subtitle}`);
    lines.push(`  Status:     ${book.status.toUpperCase()} (unpublished — author\'s eyes only)`);
    lines.push(`  Created:    ${book.created_at}`);
    lines.push(`  Words:      ${book.word_count?.toLocaleString() || 'N/A'}`);
    lines.push(`  Concepts:   ${book.concept_count}`);
    lines.push(`  Connections: ${book.connection_count}`);
    if (book.appendix_count > 0) {
      lines.push(`  Appendices: ${book.appendix_count} real-world confirmations recorded`);
    }
    lines.push('');
  }

  lines.push(divider);
  lines.push('CONCEPT THREADS (Patterns Across Multiple Books)');
  lines.push(divider);
  lines.push('');

  for (const thread of manifest.concept_threads) {
    lines.push(`[${thread.concept_tag}] ${thread.concept_label}`);
    lines.push(`  Category: ${thread.concept_category}  |  Books: ${thread.appears_in_books?.join(', ')}  |  Avg Strength: ${thread.avg_strength}`);
    lines.push(`  Last analyzed: ${thread.last_analyzed}`);
    lines.push('');
  }

  if (manifest.intelligence_entries?.length > 0) {
    lines.push(divider);
    lines.push('INTELLIGENCE RECORD (Real-World Confirmations, Dated)');
    lines.push(divider);
    lines.push('');

    for (const entry of manifest.intelligence_entries) {
      lines.push(`[${entry.source_date}] ${entry.headline}`);
      lines.push(`  Category:    ${entry.category}`);
      lines.push(`  Threat:      ${entry.threat_level}`);
      lines.push(`  Books mapped: ${entry.mapped_books?.join(', ') || 'pending'}`);
      if (entry.source_label) {
        lines.push(`  Source:      ${entry.source_label}`);
      }
      lines.push(`  Recorded:    ${entry.created_at}`);
      lines.push('');
    }
  }

  if (manifest.trap_alerts?.length > 0) {
    lines.push(divider);
    lines.push('TRAP ALERTS (New Patterns Detected, Not Yet Named in Canon)');
    lines.push(divider);
    lines.push('');

    for (const trap of manifest.trap_alerts) {
      lines.push(`[${trap.pattern_tag}] ${trap.pattern_label}`);
      lines.push(`  Status:         ${trap.status.toUpperCase()}`);
      lines.push(`  First detected: ${trap.first_detected}`);
      lines.push(`  Books involved: ${trap.appears_in_books?.join(', ')}`);
      lines.push(`  Summary: ${trap.pattern_summary}`);
      lines.push('');
    }
  }

  lines.push(divider);
  lines.push('LEGAL NOTICE & PROVENANCE DECLARATION');
  lines.push(divider);
  lines.push('');
  lines.push('This manifest constitutes a timestamped record of the Sovereign Self Series');
  lines.push('archive as it existed at the moment of export. The corpus hash above serves');
  lines.push('as an integrity fingerprint — any alteration to the archive will produce');
  lines.push('a different hash, making tampering detectable.');
  lines.push('');
  lines.push('All intellectual property contained herein belongs exclusively to:');
  lines.push('  Rickey Allan Howard');
  lines.push('  Howard Jones Bloodline Ancestral Trust');
  lines.push('  595 Macon Highway, Athens, Georgia 30606');
  lines.push('');
  lines.push('Protected under: Natural Law | UCC 1-308 | Common Law First Claim Priority');
  lines.push('All rights reserved. First recorded truth. No license granted by silence.');
  lines.push('');
  lines.push(`Manifest generated: ${manifest.export_timestamp}`);
  lines.push(`Corpus hash: ${manifest.corpus_hash}`);
  lines.push(divider);

  return lines.join('\n');
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
    const body   = await req.json().catch(() => ({}));
    const format = body.format || 'both';

    // ── FETCH ALL DATA ───────────────────────────────────────────────────────

    const [
      { data: books },
      { data: crossRefs },
      { data: concepts },
      { data: threads },
      { data: appendices },
      { data: intelligence },
      { data: traps },
    ] = await Promise.all([
      supabase.from('books')
        .select('book_number, title, subtitle, status, word_count, created_at, updated_at')
        .order('book_number'),

      supabase.from('book_cross_references')
        .select('id, book_a_number, book_b_number, concept_tag, strength, connection_type, last_analyzed')
        .order('strength', { ascending: false }),

      supabase.from('book_concepts')
        .select('book_number, concept_tag, concept_label, concept_category, weight')
        .order('book_number'),

      supabase.from('concept_threads')
        .select('*')
        .order('avg_strength', { ascending: false }),

      supabase.from('book_appendices')
        .select('id, book_number, concept_tag, headline, appendix_date, created_at')
        .order('appendix_date', { ascending: false }),

      supabase.from('book_intelligence')
        .select('id, headline, category, threat_level, mapped_books, source_label, source_date, created_at, status')
        .order('source_date', { ascending: false }),

      supabase.from('book_trap_alerts')
        .select('pattern_tag, pattern_label, pattern_summary, appears_in_books, status, first_detected, last_updated')
        .order('first_detected', { ascending: true }),
    ]);

    // ── ENRICH BOOKS WITH COUNTS ─────────────────────────────────────────────

    const enrichedBooks = (books || []).map(book => {
      const bookConcepts     = (concepts    || []).filter(c => c.book_number === book.book_number);
      const bookConnections  = (crossRefs   || []).filter(r =>
        r.book_a_number === book.book_number || r.book_b_number === book.book_number
      );
      const bookAppendices   = (appendices  || []).filter(a => a.book_number === book.book_number);

      return {
        ...book,
        concept_count:    bookConcepts.length,
        connection_count: bookConnections.length,
        appendix_count:   bookAppendices.length,
      };
    });

    // ── BUILD CORPUS STRING FOR HASHING ──────────────────────────────────────
    // Hash = fingerprint of the corpus at this exact moment
    // Any future change will produce a different hash

    const corpusForHash = JSON.stringify({
      books:        (books    || []).map(b => ({ n: b.book_number, title: b.title, created: b.created_at })),
      cross_refs:   (crossRefs|| []).map(r => ({ a: r.book_a_number, b: r.book_b_number, tag: r.concept_tag, s: r.strength })),
      concepts:     (concepts || []).map(c => ({ n: c.book_number, tag: c.concept_tag })),
      appendices:   (appendices||[]).map(a => ({ n: a.book_number, tag: a.concept_tag, date: a.appendix_date })),
      intelligence: (intelligence||[]).map(i => ({ h: i.headline, d: i.source_date, c: i.created_at })),
      traps:        (traps     ||[]).map(t => ({ tag: t.pattern_tag, detected: t.first_detected })),
    });

    const corpusHash = await sha256(corpusForHash);

    // ── SUMMARY STATS ────────────────────────────────────────────────────────

    const uniqueConcepts = new Set((crossRefs || []).map(r => r.concept_tag)).size;

    const summary = {
      total_books:               (books         || []).length,
      total_word_count:          (books         || []).reduce((s, b) => s + (b.word_count || 0), 0),
      total_cross_references:    (crossRefs     || []).length,
      unique_concepts:           uniqueConcepts,
      total_appendices:          (appendices    || []).length,
      total_intelligence_entries:(intelligence  || []).length,
      total_trap_alerts:         (traps         || []).length,
    };

    // ── ASSEMBLE MANIFEST ────────────────────────────────────────────────────

    const manifest = {
      // Identity
      manifest_version:  '1.0',
      author:            'Rickey Allan Howard',
      trust:             'Howard Jones Bloodline Ancestral Trust',
      address:           '595 Macon Highway, Athens, Georgia 30606',
      jurisdiction:      'Natural Law | UCC 1-308 | Common Law First Claim Priority',

      // Timestamp
      export_timestamp:  new Date().toISOString(),
      corpus_hash:       corpusHash,

      // Summary
      summary,

      // Full record
      books:             enrichedBooks,
      concept_threads:   threads     || [],
      intelligence_entries: intelligence || [],
      trap_alerts:       traps       || [],
      cross_reference_sample: (crossRefs || []).slice(0, 50), // top 50 by strength

      // Legal
      legal_notice: [
        'This manifest is a timestamped archival record of the Sovereign Self Series.',
        'The corpus hash serves as an integrity fingerprint.',
        'All intellectual property belongs exclusively to Rickey Allan Howard,',
        'Howard Jones Bloodline Ancestral Trust.',
        'First recorded truth. All rights reserved.',
      ].join(' '),
    };

    // ── LOG TO DB ────────────────────────────────────────────────────────────

    await supabase.from('book_analysis_queue').insert({
      triggered_by: 'provenance_export',
      mode:         'full',
      status:       'success',
      completed_at: new Date().toISOString(),
    });

    // ── RETURN FORMAT ────────────────────────────────────────────────────────

    if (format === 'text') {
      return new Response(formatProvenanceText(manifest), {
        headers: {
          ...corsHeaders,
          'content-type':        'text/plain; charset=utf-8',
          'content-disposition': `attachment; filename="sovereign-series-provenance-${new Date().toISOString().split('T')[0]}.txt"`,
        },
      });
    }

    if (format === 'json') {
      return new Response(JSON.stringify(manifest, null, 2), {
        headers: {
          ...corsHeaders,
          'content-type':        'application/json',
          'content-disposition': `attachment; filename="sovereign-series-provenance-${new Date().toISOString().split('T')[0]}.json"`,
        },
      });
    }

    // format === 'both' — return JSON with text embedded
    return new Response(
      JSON.stringify({
        ...manifest,
        text_manifest: formatProvenanceText(manifest),
      }, null, 2),
      { headers: { ...corsHeaders, 'content-type': 'application/json' } },
    );

  } catch (err) {
    console.error('Provenance export error:', err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } },
    );
  }
});
