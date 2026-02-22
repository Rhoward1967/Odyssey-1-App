/**
 * Book Cross-Reference Service
 * =============================
 * Frontend service for querying real-time concept threads across
 * the 7 books of the Sovereign Self Series.
 *
 * Pulls from:
 *   book_cross_references  — AI-identified concept connections between books
 *   book_concepts          — Concepts extracted per book
 *   concept_threads        — View: each concept + which books it appears in
 *   book_connection_matrix — View: N×N connection strength between books
 *
 * Howard Jones Bloodline Ancestral Trust — Odyssey-1 AI LLC
 */

import { supabase } from '@/lib/supabaseClient';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type ConnectionType =
  | 'reinforces'
  | 'evolves'
  | 'introduces'
  | 'concludes'
  | 'contrasts'
  | 'mirrors';

export type ConceptCategory =
  | 'law'
  | 'identity'
  | 'finance'
  | 'history'
  | 'spirituality'
  | 'governance'
  | 'economics';

export interface BookCrossReference {
  id: string;
  book_a_number: number;
  book_b_number: number;
  concept_tag: string;
  concept_label: string;
  concept_category: ConceptCategory;
  concept_summary: string;
  book_a_excerpt: string;
  book_b_excerpt: string;
  connection_type: ConnectionType;
  strength: number;
  ai_analysis: string;
  last_analyzed: string;
  created_at: string;
}

export interface BookConcept {
  id: string;
  book_number: number;
  concept_tag: string;
  concept_label: string;
  concept_category: ConceptCategory;
  excerpt: string;
  chapter_ref: string | null;
  weight: number;
}

export interface ConceptThread {
  concept_tag: string;
  concept_label: string;
  concept_category: ConceptCategory;
  appears_in_books: number[];
  book_count_approx: number;
  avg_strength: number;
  connection_count: number;
  last_analyzed: string;
}

export interface BookConnectionMatrix {
  book_a_number: number;
  book_b_number: number;
  shared_concepts: number;
  avg_strength: number;
  max_strength: number;
  concept_labels: string[];
  concept_tags: string[];
}

export interface BookConceptSummary {
  book_number: number;
  book_title: string;
  total_concepts: number;
  total_connections: number;
  avg_connection_strength: number;
  reinforces_count: number;
  evolves_count: number;
  concludes_count: number;
}

export interface RelatedPassage {
  related_book_number: number;
  related_book_title: string;
  connection_type: ConnectionType;
  strength: number;
  excerpt: string;
  concept_summary: string;
  ai_analysis: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// BOOK METADATA (client-side cache)
// ─────────────────────────────────────────────────────────────────────────────

export const BOOK_METADATA: Record<number, { title: string; subtitle: string; color: string }> = {
  1: { title: 'The Program',           subtitle: 'The Origin and Architecture of Disconnection',    color: 'from-red-900 to-red-700' },
  2: { title: 'The Echo',              subtitle: "Deconstructing the Program's Legacy",              color: 'from-orange-900 to-orange-700' },
  3: { title: 'The Sovereign Covenant', subtitle: 'Architecting a Divinely Aligned Future',         color: 'from-amber-900 to-amber-700' },
  4: { title: 'The Bond',              subtitle: "The Sovereign's True Collateral",                  color: 'from-yellow-900 to-yellow-700' },
  5: { title: 'The Alien Program',     subtitle: 'Deconstructing Frequencies of History, Identity, and Language', color: 'from-green-900 to-green-700' },
  6: { title: 'The Armory',            subtitle: "An Exposé and Guide to Reclaiming Divine Intent",  color: 'from-blue-900 to-blue-700' },
  7: { title: 'The Unveiling',         subtitle: 'How Crypto, Corruption, and AI Proved the Program', color: 'from-purple-900 to-purple-700' },
};

export const CONNECTION_TYPE_LABELS: Record<ConnectionType, string> = {
  reinforces:  'Reinforces',
  evolves:     'Evolves',
  introduces:  'Introduces',
  concludes:   'Concludes',
  contrasts:   'Contrasts',
  mirrors:     'Mirrors',
};

export const CONNECTION_TYPE_COLORS: Record<ConnectionType, string> = {
  reinforces:  'bg-green-100 text-green-800',
  evolves:     'bg-blue-100 text-blue-800',
  introduces:  'bg-amber-100 text-amber-800',
  concludes:   'bg-purple-100 text-purple-800',
  contrasts:   'bg-red-100 text-red-800',
  mirrors:     'bg-slate-100 text-slate-800',
};

export const CATEGORY_COLORS: Record<ConceptCategory, string> = {
  law:          'bg-red-100 text-red-800',
  identity:     'bg-purple-100 text-purple-800',
  finance:      'bg-green-100 text-green-800',
  history:      'bg-amber-100 text-amber-800',
  spirituality: 'bg-blue-100 text-blue-800',
  governance:   'bg-orange-100 text-orange-800',
  economics:    'bg-teal-100 text-teal-800',
};

// ─────────────────────────────────────────────────────────────────────────────
// QUERIES
// ─────────────────────────────────────────────────────────────────────────────

/** Fetch all cross-references, optionally filtered by book or concept */
export async function getCrossReferences(opts?: {
  bookNumber?: number;
  conceptTag?: string;
  category?: ConceptCategory;
  minStrength?: number;
  limit?: number;
}): Promise<BookCrossReference[]> {
  let query = supabase
    .from('book_cross_references')
    .select('*')
    .order('strength', { ascending: false });

  if (opts?.bookNumber) {
    query = query.or(
      `book_a_number.eq.${opts.bookNumber},book_b_number.eq.${opts.bookNumber}`
    );
  }
  if (opts?.conceptTag)    query = query.eq('concept_tag', opts.conceptTag);
  if (opts?.category)      query = query.eq('concept_category', opts.category);
  if (opts?.minStrength)   query = query.gte('strength', opts.minStrength);
  if (opts?.limit)         query = query.limit(opts.limit);

  const { data, error } = await query;
  if (error) throw new Error(`getCrossReferences failed: ${error.message}`);
  return (data || []) as BookCrossReference[];
}

/** Get concept threads — concepts that span multiple books */
export async function getConceptThreads(minBooks = 2): Promise<ConceptThread[]> {
  const { data, error } = await supabase
    .from('concept_threads')
    .select('*')
    .order('avg_strength', { ascending: false });

  if (error) throw new Error(`getConceptThreads failed: ${error.message}`);

  return ((data || []) as ConceptThread[]).filter(
    t => (t.book_count_approx || 0) >= minBooks
  );
}

/** Get the N×N connection matrix between all books */
export async function getConnectionMatrix(): Promise<BookConnectionMatrix[]> {
  const { data, error } = await supabase
    .from('book_connection_matrix')
    .select('*')
    .order('avg_strength', { ascending: false });

  if (error) throw new Error(`getConnectionMatrix failed: ${error.message}`);
  return (data || []) as BookConnectionMatrix[];
}

/** Get per-book concept summary stats */
export async function getBookConceptSummaries(): Promise<BookConceptSummary[]> {
  const { data, error } = await supabase
    .from('book_concept_summary')
    .select('*')
    .order('book_number', { ascending: true });

  if (error) throw new Error(`getBookConceptSummaries failed: ${error.message}`);
  return (data || []) as BookConceptSummary[];
}

/** Get all concepts for a specific book */
export async function getBookConcepts(bookNumber: number): Promise<BookConcept[]> {
  const { data, error } = await supabase
    .from('book_concepts')
    .select('*')
    .eq('book_number', bookNumber)
    .order('weight', { ascending: false });

  if (error) throw new Error(`getBookConcepts failed: ${error.message}`);
  return (data || []) as BookConcept[];
}

/** Get related passages from other books for a given book + concept */
export async function getRelatedPassages(
  bookNumber: number,
  conceptTag: string,
): Promise<RelatedPassage[]> {
  const { data, error } = await supabase
    .rpc('get_related_passages', {
      p_book_number: bookNumber,
      p_concept_tag: conceptTag,
    });

  if (error) throw new Error(`getRelatedPassages failed: ${error.message}`);
  return (data || []) as RelatedPassage[];
}

/** Get the strongest connections for a given book */
export async function getBookConnections(
  bookNumber: number,
  limit = 10,
): Promise<BookCrossReference[]> {
  return getCrossReferences({ bookNumber, minStrength: 60, limit });
}

// ─────────────────────────────────────────────────────────────────────────────
// TRIGGER ANALYSIS
// ─────────────────────────────────────────────────────────────────────────────

/** Trigger the cross-reference edge function to rebuild the analysis */
export async function triggerCrossReferenceAnalysis(
  mode: 'full' | 'pair' = 'full',
  pairOptions?: { book_a: number; book_b: number },
): Promise<{ success: boolean; connections_found: number; message: string }> {
  const body = mode === 'pair' && pairOptions
    ? { mode, ...pairOptions }
    : { mode };

  const { data, error } = await supabase.functions.invoke('cross-reference-books', {
    body,
  });

  if (error) throw new Error(`Cross-reference analysis failed: ${error.message}`);
  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Build a strength label for display */
export function strengthLabel(strength: number): string {
  if (strength >= 90) return 'Critical Thread';
  if (strength >= 75) return 'Strong Connection';
  if (strength >= 60) return 'Moderate Link';
  return 'Weak Signal';
}

/** Build a strength color class */
export function strengthColor(strength: number): string {
  if (strength >= 90) return 'text-red-700 font-bold';
  if (strength >= 75) return 'text-amber-700 font-semibold';
  if (strength >= 60) return 'text-blue-700';
  return 'text-slate-500';
}

/**
 * Build a flat matrix object for rendering the 7×7 connection grid.
 * Returns { '1-2': { strength, concepts }, '1-3': ..., ... }
 */
export function buildMatrixMap(
  matrix: BookConnectionMatrix[],
): Record<string, { strength: number; concepts: number; labels: string[] }> {
  const map: Record<string, { strength: number; concepts: number; labels: string[] }> = {};

  for (const entry of matrix) {
    const key  = `${entry.book_a_number}-${entry.book_b_number}`;
    const rkey = `${entry.book_b_number}-${entry.book_a_number}`;
    const val  = {
      strength: entry.avg_strength,
      concepts: entry.shared_concepts,
      labels:   entry.concept_labels || [],
    };
    map[key]  = val;
    map[rkey] = val;
  }

  return map;
}
