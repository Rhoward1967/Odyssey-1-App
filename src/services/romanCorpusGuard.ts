/**
 * R.O.M.A.N. CORPUS GUARD — Application-Layer Pre-Flight
 * =======================================================
 * Thin, reusable wrapper around the live PL/pgSQL function
 *   public.roman_validate_execution(operation_type, target_table, section_ids, context_note) → jsonb
 *
 * Any service that reads from or writes to `corpus_sections` or
 * `section_dependencies` calls validateCorpusOperation() BEFORE committing.
 *
 *   ALLOW → proceed silently
 *   WARN  → proceed, but the governance chain is surfaced to the Insights
 *           dashboard (public.learned_insights) for the operator to review
 *   ABORT → the caller MUST halt and surface `reason`
 *
 * The database function already auto-logs every verdict to
 * public.roman_execution_log — no application-layer execution logging is added here.
 *
 * © 2026 Howard Jones Bloodline Ancestral Trust — UCC 1-308
 */

import { romanSupabase } from './romanSupabase';

// ─── Contract (mirrors the JSONB returned by roman_validate_execution) ─────────

export type CorpusVerdict = 'ALLOW' | 'WARN' | 'ABORT';

export interface CorpusValidation {
  verdict:            CorpusVerdict;
  reason:             string;
  governance_chain:   string[];
  linchpins_involved: number[];
  logged_at:          string | null;
}

// ─── Pre-flight call ───────────────────────────────────────────────────────────

/**
 * Validate a corpus operation against the immutable structural rules.
 *
 * @param operation  e.g. 'QUERY' | 'UPDATE' | 'INSERT' | 'DELETE'
 * @param target     target table, e.g. 'corpus_sections' | 'section_dependencies'
 * @param sectionIds the corpus section ids the operation touches (null for none)
 * @param context    free-text note recorded with the verdict (e.g. 'manifest:collectBCGLinchpins')
 *
 * On a transport/RPC failure this fails OPEN (returns a permissive ALLOW with a
 * note) so it never hard-breaks an existing benign read path — matching the
 * graceful-fallback convention used elsewhere in the manifest collectors. A
 * future write path that needs fail-CLOSED behavior can inspect `verdict` and
 * the reason note directly and refuse on anything other than a clean ALLOW.
 */
export async function validateCorpusOperation(
  operation: string,
  target: string,
  sectionIds: number[] | null,
  context: string,
): Promise<CorpusValidation> {
  try {
    const { data, error } = await romanSupabase.rpc('roman_validate_execution', {
      operation_type: operation,
      target_table:   target,
      section_ids:    sectionIds,
      context_note:   context,
    });

    if (error || !data) {
      return failOpen(`pre-flight RPC unavailable: ${error?.message || 'no data returned'}`);
    }

    const result: CorpusValidation = {
      verdict:            (data.verdict as CorpusVerdict) || 'ALLOW',
      reason:             data.reason || '',
      governance_chain:   Array.isArray(data.governance_chain) ? data.governance_chain : [],
      linchpins_involved: Array.isArray(data.linchpins_involved) ? data.linchpins_involved : [],
      logged_at:          data.logged_at || null,
    };

    // WARN → surface the governance chain to the Insights dashboard.
    if (result.verdict === 'WARN' && result.governance_chain.length > 0) {
      await surfaceGovernanceChain(operation, target, context, result);
    }

    return result;
  } catch (err: any) {
    return failOpen(`pre-flight threw: ${err?.message || String(err)}`);
  }
}

/**
 * Convenience guard for write paths: throws on ABORT, otherwise returns the
 * validation (WARN already surfaced to Insights). Read paths that must not
 * crash should call validateCorpusOperation() directly and branch on `verdict`.
 */
export async function assertCorpusOperation(
  operation: string,
  target: string,
  sectionIds: number[] | null,
  context: string,
): Promise<CorpusValidation> {
  const v = await validateCorpusOperation(operation, target, sectionIds, context);
  if (v.verdict === 'ABORT') {
    throw new Error(`[CORPUS GUARD] Operation vetoed (${operation} ${target}): ${v.reason}`);
  }
  return v;
}

// ─── Insights dashboard surfacing (public.learned_insights) ────────────────────

async function surfaceGovernanceChain(
  operation: string,
  target: string,
  context: string,
  result: CorpusValidation,
): Promise<void> {
  try {
    await romanSupabase.from('learned_insights').insert({
      insight_summary: `Governance WARN — ${operation} on ${target} touched linchpins [${result.linchpins_involved.join(', ')}]`,
      details: {
        source:             'roman_corpus_guard',
        operation,
        target,
        context,
        verdict:            result.verdict,
        reason:             result.reason,
        governance_chain:   result.governance_chain,
        linchpins_involved: result.linchpins_involved,
        validated_at:       result.logged_at,
      },
    });
  } catch {
    // Surfacing is best-effort; the verdict is already auto-logged to
    // roman_execution_log by the database function, so a failed Insights
    // write must never block the operation it was warning about.
  }
}

function failOpen(note: string): CorpusValidation {
  return {
    verdict:            'ALLOW',
    reason:             `[fail-open] ${note}`,
    governance_chain:   [],
    linchpins_involved: [],
    logged_at:          null,
  };
}
