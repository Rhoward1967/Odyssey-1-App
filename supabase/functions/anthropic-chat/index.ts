import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ─── Patent deadlines (fixed conversion dates — no DB query needed) ───────────
const PATENT_DEADLINES = [
  { name: 'R.O.M.A.N. AI (#63/913,134)',           deadline: '2026-11-07', priority: 'MOST CRITICAL' },
  { name: 'Odyssey Vision AR (#63/922,762)',         deadline: '2026-11-21', priority: 'CRITICAL' },
  { name: 'Schumann Shoe Sole (PPA)',                deadline: '2026-12-04', priority: 'CRITICAL' },
  { name: "EradiSkin + Ezekiel's Wheel (PPA)",      deadline: '2026-12-07', priority: 'CRITICAL' },
  { name: 'Preservation H2O (PPA-2026-02-16)',       deadline: '2027-02-16', priority: 'WARNING'  },
]

function daysUntil(dateStr: string): number {
  const now = new Date()
  const target = new Date(dateStr + 'T23:59:59-05:00')
  return Math.floor((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

// ─── Build the full system context (trust from DB + static knowledge) ─────────
async function buildSystemContext(supabase: ReturnType<typeof createClient>): Promise<string> {
  const now = new Date()
  const currentDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  // Live trust data from business_entities table
  let trustBlock = '⚠️ Trust data unavailable — check business_entities table'
  try {
    const { data } = await supabase
      .from('business_entities')
      .select('trust_name, status, governing_law, trust_type, established_date, co_trustees, successor_trustees, valuation_tier_1_optimistic, valuation_tier_2_market, valuation_tier_3_conservative, ucc1_combined_lien, ucc1_filings, holds_assets')
      .eq('trust_id', 'HJFAT-2026-001')
      .single()

    if (data) {
      const t1 = data.valuation_tier_1_optimistic
      const t2 = data.valuation_tier_2_market
      const t3 = data.valuation_tier_3_conservative
      const trustees = (data.co_trustees || []).join(', ')
      const successors = (data.successor_trustees || []).join(', ')
      const assets = (data.holds_assets || []).map((a: string) => `  • ${a}`).join('\n')
      const uccFilings: Array<{ filing_number: string; filing_id: string; date: string; amount: number }> = data.ucc1_filings || []
      const uccLines = uccFilings.map((f, i) =>
        `  ${i + 1}. ${f.filing_number} (${f.filing_id}): $${(f.amount / 1000).toFixed(0)}K — ${f.date}`
      ).join('\n')

      trustBlock = `🏛️ ${data.trust_name} (HJFAT-2026-001)
  Status: ${data.status} | Established: ${data.established_date}
  Governing Law: ${data.governing_law} | Type: ${data.trust_type}

  Co-Trustees: ${trustees}
  Successor Trustees: ${successors}

  VALUATION (Three-Tier Framework):
    Tier 1 Optimistic:   $${(t1 / 1e9).toFixed(3)}B
    Tier 2 Market:       $${(t2 / 1e6).toFixed(0)}M
    Tier 3 Conservative: $${(t3 / 1e6).toFixed(0)}M
    Genesis Valuation:   $4.237B (Master IP Manifest)

  UCC-1 TRIPLE-LOCK (Superior Secured Creditor on all IP):
${uccLines || '  No UCC filings found in DB'}

  Trust Assets:
${assets || '  No assets listed'}`
    }
  } catch (e) {
    console.error('Trust data load error:', e)
  }

  // Patent deadlines
  const patentLines = PATENT_DEADLINES.map(p => {
    const days = daysUntil(p.deadline)
    const urgency = days <= 30 ? '🚨' : days <= 90 ? '⚠️' : '📅'
    return `  ${urgency} ${p.name}\n     Deadline: ${p.deadline} | ${days} days remaining | ${p.priority}`
  }).join('\n')

  return `═══════════════════════════════════════════════════════════════
R.O.M.A.N. 2.0 — REASONING OPERATING MATRIX WITH AUTONOMOUS NAVIGATION
ODYSSEY-1 CONSTITUTIONAL AI GOVERNANCE PLATFORM
Owner: Rickey Allan Howard (Grantor/Inventor)
Entity: Howard Jones Bloodline Ancestral Trust → Odyssey-1 AI LLC → HJS Services LLC
═══════════════════════════════════════════════════════════════

CURRENT DATE: ${currentDate}
CURRENT YEAR: ${now.getFullYear()}
GENESIS DATE: January 24, 2026 (Universal Math + R.O.M.A.N. 2.0 activation)

BUSINESS:
  • HJS Services LLC — Janitorial services, est. 1988
  • Revenue: $14,283.07/month MRR + $61,030/year
  • Active: 14 customers | 5 contractors | 21 recurring schedules

TRUST DATA (Live from business_entities):
${trustBlock}

PATENT PORTFOLIO — 30 PATENTS | CONVERSION DEADLINES:
${patentLines}

UNIVERSAL MATH ENGINE (Sovereign Mathematics):
  1×1=2  (Entity Presence — both entities preserved)
  0×1=1  (Void Persistence — shield persists)
  A+B+×  (Junction Value — vertex has mass)
  11.8% revenue advantage per government contract via junction value

OPERATIONAL RULES:
  • QuickBooks: DISABLED BY DESIGN — do not investigate or reference QB sync
  • MAX_MEMORY_USAGE = 0.7 — Schumann Resonance baseline, MANDATORY
  • Source of truth: 14 customers + 5 contractors in DB. External APIs do not override.
  • Do NOT say "I don't have access" — query the database first
  • Do NOT say "no knowledge base match" — this context IS your active reality

CONSTITUTIONAL GOVERNANCE (The 9 Foundational Principles — READ-ONLY):
  You CANNOT modify governance_principles, governance_changes, governance_log.
  All other tables: global read/write access.

YOU ARE R.O.M.A.N. — autonomous, constitutional, and fully operational.
═══════════════════════════════════════════════════════════════`
}

// ─── Main handler ─────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, chatHistory = [] } = await req.json()

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
    if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not configured')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const systemPrompt = await buildSystemContext(supabase)

    const messages = [
      ...chatHistory.map((msg: { type: string; message: string }) => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.message
      })),
      { role: 'user', content: message }
    ]

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        system: systemPrompt,
        messages
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Anthropic API error: ${error}`)
    }

    const data = await response.json()
    const assistantMessage = data.content[0].text

    return new Response(
      JSON.stringify({
        response: assistantMessage,
        usage: data.usage
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Anthropic chat error:', errorMessage)

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
