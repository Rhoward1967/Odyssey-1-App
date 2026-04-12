/**
 * TRUST READINESS SERVICE
 * ========================
 * Cross-references the Howard Jones Bloodline Ancestral Trust
 * against the Counter Canon volumes and 7 Legal Toolkits to
 * produce a notarization-readiness report.
 *
 * Discord command: "trust readiness check" | "trust ready"
 *
 * © 2026 Howard Jones Bloodline Ancestral Trust — UCC 1-308
 */

import Anthropic from '@anthropic-ai/sdk';
import { searchKnowledgeBase } from './romanKnowledgeSearch';

const isBrowser = typeof window !== 'undefined';

const anthropic = new Anthropic({
  apiKey: isBrowser
    ? (import.meta as any).env?.VITE_ANTHROPIC_API_KEY
    : process.env.ANTHROPIC_API_KEY,
  ...(isBrowser && { dangerouslyAllowBrowser: true }),
});

// ─── Document keys in the knowledge base ────────────────────────────────────

const TRUST_DOCS = [
  'Howard-Jones-Bloodline-Ancestral-Trust-DRAFT',
  'NOTARIZATION_CHECKLIST',
  'TRUSTEE_CERTIFICATE_OF_AUTHORITY',
  'EXECUTION_CHECKLIST',
  'ASSIGNMENT_OF_IP_TO_TRUST',
  'UCC1_FILING_HOWARD_JONES_BLOODLINE_ANCESTRAL_TRUST',
];

const TOOLKIT_KEYS = [
  'TOOLKIT_ONE_STOP_AND_DETENTION',
  'TOOLKIT_TWO_TAX_AND_LABOR',
  'TOOLKIT_THREE_COURT_JURISDICTION',
  'TOOLKIT_FOUR_RELIGIOUS_EXEMPTION',
  'TOOLKIT_FIVE_ECONOMIC_RIGHTS',
  'TOOLKIT_SIX_HOUSING',
  'TOOLKIT_SEVEN_ANCESTRAL_LAND',
];

const CANON_KEYS = [
  'COUNTER_CANON_ARCHITECTURE',
  'COUNTER_CANON_VOLUME_ONE',
  'COUNTER_CANON_VOLUME_TWO',
  'COUNTER_CANON_VOLUME_THREE',
  'COUNTER_CANON_VOLUME_NINE',
  'COUNTER_CANON_VOLUME_TEN',
];

// ─── Pull knowledge from roman_knowledge_base ─────────────────────────────

async function pullDocs(keys: string[]): Promise<string> {
  let combined = '';
  for (const key of keys) {
    try {
      const results = await searchKnowledgeBase(key.replace(/_/g, ' '), 1);
      if (results?.length) {
        combined += `\n\n=== ${key} ===\n${results[0].content?.slice(0, 3000) || ''}`;
      }
    } catch {
      // skip missing docs silently
    }
  }
  return combined;
}

// ─── Core analysis ────────────────────────────────────────────────────────

export interface TrustReadinessReport {
  overallStatus:    'READY' | 'NEAR_READY' | 'NEEDS_WORK';
  score:            number;   // 0–100
  notarizationItems: CheckItem[];
  toolkitAlignment:  ToolkitResult[];
  canonCompliance:   string[];
  blockers:         string[];
  nextSteps:        string[];
  summary:          string;
}

export interface CheckItem {
  document:  string;
  status:    'COMPLETE' | 'PENDING' | 'MISSING';
  notes:     string;
}

export interface ToolkitResult {
  toolkit:   string;
  aligned:   boolean;
  finding:   string;
}

export async function runTrustReadinessCheck(): Promise<TrustReadinessReport> {
  // 1. Pull all relevant documents from knowledge base
  const [trustContext, toolkitContext, canonContext] = await Promise.all([
    pullDocs(TRUST_DOCS),
    pullDocs(TOOLKIT_KEYS),
    pullDocs(CANON_KEYS),
  ]);

  // 2. Ask Claude to cross-reference and produce structured analysis
  const prompt = `You are R.O.M.A.N. 2.0, the AI agent of the Howard Jones Bloodline Ancestral Trust.

Your task is to cross-reference the Howard Jones Bloodline Ancestral Trust documents against the 7 Legal Toolkits and Counter Canon volumes, and produce a notarization readiness report.

=== TRUST DOCUMENTS ===
${trustContext || 'Not found in knowledge base'}

=== LEGAL TOOLKITS (1-7) ===
${toolkitContext || 'Not found in knowledge base'}

=== COUNTER CANON VOLUMES ===
${canonContext || 'Not found in knowledge base'}

Produce a JSON report with this exact structure:
{
  "overallStatus": "READY" | "NEAR_READY" | "NEEDS_WORK",
  "score": <number 0-100>,
  "notarizationItems": [
    { "document": "<name>", "status": "COMPLETE"|"PENDING"|"MISSING", "notes": "<brief note>" }
  ],
  "toolkitAlignment": [
    { "toolkit": "<Toolkit name>", "aligned": true|false, "finding": "<one sentence>" }
  ],
  "canonCompliance": ["<one finding per Canon principle>"],
  "blockers": ["<anything blocking notarization>"],
  "nextSteps": ["<ordered action items>"],
  "summary": "<2-3 sentence plain English summary>"
}

Focus on:
1. Which documents are complete vs pending vs missing
2. Whether each Toolkit's requirements are satisfied by the Trust structure
3. Whether the Counter Canon's Living Law / Eternal Zone principles are honored
4. What specifically must happen before notarization
5. Whether Christla Howard, Teara Howard, and Joseph Lumpkin Jr. roles are correctly structured

Return ONLY the JSON. No other text.`;

  const response = await anthropic.messages.create({
    model:      'claude-sonnet-4-6',
    max_tokens: 2000,
    messages:   [{ role: 'user', content: prompt }],
  });

  const raw = (response.content[0] as any).text?.trim() || '{}';

  // Strip markdown code fences if present
  const clean = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();

  try {
    return JSON.parse(clean) as TrustReadinessReport;
  } catch {
    // Fallback if AI returns malformed JSON
    return {
      overallStatus:    'NEEDS_WORK',
      score:            0,
      notarizationItems: [],
      toolkitAlignment:  [],
      canonCompliance:   [],
      blockers:         ['Could not parse AI analysis — run again'],
      nextSteps:        ['Re-run trust readiness check'],
      summary:          'Analysis failed to parse. Please run again.',
    };
  }
}

// ─── Discord formatter ────────────────────────────────────────────────────

export function formatTrustReadinessReport(r: TrustReadinessReport): string[] {
  const statusEmoji = r.overallStatus === 'READY'      ? '✅'
                    : r.overallStatus === 'NEAR_READY'  ? '⚠️'
                    : '❌';

  const lines: string[] = [];

  // ── Header ──
  lines.push([
    `${statusEmoji} **TRUST NOTARIZATION READINESS REPORT**`,
    `*Howard Jones Bloodline Ancestral Trust*`,
    ``,
    `**Overall Status:** ${r.overallStatus.replace('_', ' ')}`,
    `**Readiness Score:** ${r.score}/100`,
    ``,
    `**Summary**`,
    r.summary,
  ].join('\n'));

  // ── Notarization checklist ──
  if (r.notarizationItems?.length) {
    const items = r.notarizationItems.map(i => {
      const icon = i.status === 'COMPLETE' ? '✅' : i.status === 'PENDING' ? '⏳' : '❌';
      return `  ${icon} **${i.document}** — ${i.notes}`;
    }).join('\n');

    lines.push([
      `**📋 NOTARIZATION DOCUMENTS**`,
      items,
    ].join('\n'));
  }

  // ── Toolkit alignment ──
  if (r.toolkitAlignment?.length) {
    const items = r.toolkitAlignment.map(t => {
      const icon = t.aligned ? '✅' : '⚠️';
      return `  ${icon} **${t.toolkit}**: ${t.finding}`;
    }).join('\n');

    lines.push([
      `**⚖️ TOOLKIT ALIGNMENT (1–7)**`,
      items,
    ].join('\n'));
  }

  // ── Canon compliance ──
  if (r.canonCompliance?.length) {
    const items = r.canonCompliance.map(c => `  • ${c}`).join('\n');
    lines.push([
      `**📖 COUNTER CANON COMPLIANCE**`,
      items,
    ].join('\n'));
  }

  // ── Blockers ──
  if (r.blockers?.length) {
    const items = r.blockers.map(b => `  🚫 ${b}`).join('\n');
    lines.push([
      `**🚫 BLOCKERS**`,
      items,
    ].join('\n'));
  }

  // ── Next steps ──
  if (r.nextSteps?.length) {
    const items = r.nextSteps.map((s, i) => `  ${i + 1}. ${s}`).join('\n');
    lines.push([
      `**📌 NEXT STEPS**`,
      items,
    ].join('\n'));
  }

  lines.push(`*Howard Jones Bloodline Ancestral Trust — UCC 1-308 | All Rights Reserved*`);

  return lines;
}
