/**
 * Book Intelligence Service
 * ==========================
 * Frontend service for the R.O.M.A.N. Living Intelligence System.
 *
 * R.O.M.A.N. is the system. Claude is the analysis engine R.O.M.A.N. calls.
 * New world developments feed in → R.O.M.A.N. maps them to the 8-book framework
 * → books grow with living appendices → new patterns become Trap Alerts.
 *
 * Howard Jones Bloodline Ancestral Trust — Odyssey-1 AI LLC
 */

import { supabase } from '@/lib/supabaseClient';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type IntelligenceCategory =
  | 'digital_id'
  | 'cbdc'
  | 'surveillance_ai'
  | 'legislation'
  | 'finance'
  | 'nature'
  | 'governance'
  | 'history'          // Colonial-era through Nixon — the full timeline the books trace
  | 'ai_digital_age';  // AI used as instrument, blamed when harm results

export type HistoricalEra =
  | 'colonial'           // 1492–1800s
  | 'industrial'         // 1800s–1913
  | 'bretton_woods'      // 1913–1971
  | 'fiat_era'           // 1971–2008
  | 'digital_transition' // 2008–2020
  | 'enclosure'          // 2020–present
  | 'current';

export type ThreatLevel = 'background' | 'active' | 'critical' | 'new_trap';
export type TrapStatus  = 'emerging' | 'confirmed' | 'named';

export interface BookIntelligence {
  id:              string;
  headline:        string;
  content:         string;
  source_label:    string | null;
  source_url:      string | null;
  source_date:     string;
  category:        IntelligenceCategory;
  status:          'pending' | 'analyzed' | 'error';
  ai_analysis:     string | null;
  mapped_books:    number[];
  mapped_concepts: string[];
  threat_level:    ThreatLevel;
  submitted_by:    string;
  created_at:      string;
  // from intelligence_feed view
  appendix_count?: number;
  books_updated?:  number[];
}

export interface BookAppendix {
  id:              string;
  book_number:     number;
  concept_tag:     string;
  appendix_date:   string;
  headline:        string;
  content:         string;
  intelligence_id: string | null;
  created_at:      string;
}

export interface TrapAlert {
  id:              string;
  pattern_tag:     string;
  pattern_label:   string;
  pattern_summary: string;
  appears_in_books: number[];
  evidence_count:  number;
  status:          TrapStatus;
  first_detected:  string;
  last_updated:    string;
}

export interface IntelligenceSubmission {
  headline:      string;
  content:       string;
  category:      IntelligenceCategory;
  source_label?: string;
  source_url?:   string;
  source_date?:  string;
}

export interface IntelligenceResult {
  success:            boolean;
  intelligence_id:    string;
  books_updated:      number[];
  concepts_confirmed: string[];
  threat_level:       ThreatLevel;
  new_trap_detected:  boolean;
  new_trap?:          { pattern_tag: string; pattern_label: string } | null;
  message:            string;
}

// ─────────────────────────────────────────────────────────────────────────────
// DISPLAY HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<IntelligenceCategory, string> = {
  digital_id:      'Digital ID',
  cbdc:            'CBDC / Finance',
  surveillance_ai: 'Surveillance AI',
  legislation:     'Legislation',
  finance:         'Finance',
  nature:          'Nature / Earth',
  governance:      'Governance',
  history:         'Historical Record',
  ai_digital_age:  'AI Accountability',
};

export const ERA_LABELS: Record<HistoricalEra, string> = {
  colonial:           '1492–1800s: Colonialism',
  industrial:         '1800s–1913: Industrial Debt',
  bretton_woods:      '1913–1971: Bretton Woods Era',
  fiat_era:           '1971–2008: Fiat & Compound Debt',
  digital_transition: '2008–2020: Digital Infrastructure Build',
  enclosure:          '2020–Present: The Enclosure',
  current:            'Current (2026)',
};

export const THREAT_LEVEL_LABELS: Record<ThreatLevel, string> = {
  background: 'Background Signal',
  active:     'Active Development',
  critical:   'Critical — System Live',
  new_trap:   'New Trap Detected',
};

export const THREAT_LEVEL_COLORS: Record<ThreatLevel, string> = {
  background: 'bg-slate-100 text-slate-700',
  active:     'bg-amber-100 text-amber-800',
  critical:   'bg-red-100 text-red-800',
  new_trap:   'bg-cyan-100 text-cyan-900 ring-1 ring-cyan-400',
};

export const TRAP_STATUS_COLORS: Record<TrapStatus, string> = {
  emerging:  'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-orange-100 text-orange-800',
  named:     'bg-purple-100 text-purple-800',
};

export const CATEGORY_COLORS: Record<IntelligenceCategory, string> = {
  digital_id:      'bg-blue-100 text-blue-800',
  cbdc:            'bg-green-100 text-green-800',
  surveillance_ai: 'bg-red-100 text-red-800',
  legislation:     'bg-purple-100 text-purple-800',
  finance:         'bg-emerald-100 text-emerald-800',
  nature:          'bg-teal-100 text-teal-800',
  governance:      'bg-orange-100 text-orange-800',
  history:         'bg-amber-100 text-amber-900',    // warm — ancient record
  ai_digital_age:  'bg-violet-100 text-violet-900',  // distinct — the new threat
};

// ─────────────────────────────────────────────────────────────────────────────
// QUERIES
// ─────────────────────────────────────────────────────────────────────────────

/** Submit new intelligence to R.O.M.A.N. for processing */
export async function submitIntelligence(
  payload: IntelligenceSubmission,
): Promise<IntelligenceResult> {
  const { data, error } = await supabase.functions.invoke('book-intelligence-feed', {
    body: payload,
  });

  if (error) throw new Error(`R.O.M.A.N. intelligence feed failed: ${error.message}`);
  return data as IntelligenceResult;
}

/** Get the live intelligence feed */
export async function getIntelligenceFeed(opts?: {
  limit?:    number;
  category?: IntelligenceCategory;
  threat?:   ThreatLevel;
}): Promise<BookIntelligence[]> {
  let query = supabase
    .from('intelligence_feed')
    .select('*')
    .order('source_date', { ascending: false });

  if (opts?.category) query = query.eq('category', opts.category);
  if (opts?.threat)   query = query.eq('threat_level', opts.threat);
  if (opts?.limit)    query = query.limit(opts.limit);

  const { data, error } = await query;
  if (error) throw new Error(`getIntelligenceFeed failed: ${error.message}`);
  return (data || []) as BookIntelligence[];
}

/** Get all appendix entries for a specific book, newest first */
export async function getBookAppendices(bookNumber: number): Promise<BookAppendix[]> {
  const { data, error } = await supabase
    .from('book_appendices')
    .select('*')
    .eq('book_number', bookNumber)
    .order('appendix_date', { ascending: false });

  if (error) throw new Error(`getBookAppendices failed: ${error.message}`);
  return (data || []) as BookAppendix[];
}

/** Get all active (emerging + confirmed) trap alerts */
export async function getActiveTrapAlerts(): Promise<TrapAlert[]> {
  const { data, error } = await supabase
    .from('active_traps')
    .select('*');

  if (error) throw new Error(`getActiveTrapAlerts failed: ${error.message}`);
  return (data || []) as TrapAlert[];
}

/** Get intelligence entries mapped to a specific book */
export async function getIntelligenceByBook(bookNumber: number): Promise<BookIntelligence[]> {
  const { data, error } = await supabase
    .from('intelligence_feed')
    .select('*')
    .contains('mapped_books', [bookNumber])
    .order('source_date', { ascending: false });

  if (error) throw new Error(`getIntelligenceByBook failed: ${error.message}`);
  return (data || []) as BookIntelligence[];
}

/** Get the living timeline for a book (original concepts + appendices) */
export async function getBookLivingTimeline(bookNumber: number) {
  const { data, error } = await supabase
    .from('book_living_timeline')
    .select('*')
    .eq('book_number', bookNumber)
    .order('entry_date', { ascending: true });

  if (error) throw new Error(`getBookLivingTimeline failed: ${error.message}`);
  return data || [];
}

/** Promote a confirmed trap to 'named' status (Book 9 candidate) */
export async function promoteTrapToBook9(patternTag: string): Promise<void> {
  const { error } = await supabase
    .from('book_trap_alerts')
    .update({ status: 'named' })
    .eq('pattern_tag', patternTag);

  if (error) throw new Error(`promoteTrapToBook9 failed: ${error.message}`);
}

/** Get the full chronological intelligence timeline (colonial → 2026) */
export async function getIntelligenceTimeline(): Promise<BookIntelligence[]> {
  const { data, error } = await supabase
    .from('intelligence_timeline')
    .select('*');

  if (error) throw new Error(`getIntelligenceTimeline failed: ${error.message}`);
  return (data || []) as BookIntelligence[];
}

/** Get all AI accountability / scapegoat watch entries */
export async function getAIAccountabilityRecord() {
  const { data, error } = await supabase
    .from('ai_accountability_record')
    .select('*');

  if (error) throw new Error(`getAIAccountabilityRecord failed: ${error.message}`);
  return data || [];
}

/** Submit an AI scapegoat watch entry */
export async function submitAIWatchEntry(entry: {
  event_type:          string;
  headline:            string;
  content:             string;
  source_label?:       string;
  source_url?:         string;
  source_date?:        string;
  responsible_entity?: string;
  ai_system_named?:    string;
  actual_designer?:    string;
}): Promise<void> {
  const { error } = await supabase
    .from('ai_scapegoat_watch')
    .insert(entry);

  if (error) throw new Error(`submitAIWatchEntry failed: ${error.message}`);
}
