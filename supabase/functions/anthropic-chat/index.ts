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

// ─── Knowledge base lookup — finds relevant synced files for the user's query ──
async function fetchKnowledgeContext(
  supabase: ReturnType<typeof createClient>,
  userMessage: string
): Promise<string> {
  try {
    // Always-include files: V24 legal doc + books core + sovereign induction
    const ALWAYS_INCLUDE = [
      'legal/Judgement_of_No_Legal_Accountability_v24-1.md',
      'SOVEREIGN_INDUCTION_PROTOCOL.md',
      'AI_READ_THIS_FIRST.txt',
      'D-DRIVE/Banking_Research_v5.docx',
      'src/services/lobService.ts',
    ]

    // Pull always-include files
    const { data: pinned } = await supabase
      .from('roman_knowledge_base')
      .select('file_path, content')
      .in('file_path', ALWAYS_INCLUDE)

    // Search for files relevant to the user's message (keyword match on file_path + content)
    const keywords = userMessage
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .split(' ')
      .filter(w => w.length > 3)
      .slice(0, 5)

    let searchResults: Array<{ file_path: string; content: string }> = []
    if (keywords.length > 0) {
      // Search by file_path match first (most reliable — catches "banking research" → D-DRIVE/Banking_Research_v5.docx)
      const pathResults: Array<{ file_path: string; content: string }> = []
      for (const kw of keywords) {
        const { data } = await supabase
          .from('roman_knowledge_base')
          .select('file_path, content')
          .ilike('file_path', `%${kw}%`)
          .limit(2)
        if (data) pathResults.push(...data)
      }

      // Deduplicate by file_path (pinned files already in seen set, so they won't duplicate)
      const pinnedPaths = (pinned ?? []).map((p: { file_path: string }) => p.file_path)
      const seen = new Set<string>(pinnedPaths)
      for (const r of pathResults) {
        if (!seen.has(r.file_path)) { seen.add(r.file_path); searchResults.push(r) }
        if (searchResults.length >= 4) break
      }

      // If still under 4, also try content ILIKE on the strongest keyword
      if (searchResults.length < 2 && keywords[0]) {
        const { data } = await supabase
          .from('roman_knowledge_base')
          .select('file_path, content')
          .ilike('content', `%${keywords[0]}%`)
          .limit(2)
        for (const r of (data ?? [])) {
          if (!seen.has(r.file_path)) { seen.add(r.file_path); searchResults.push(r) }
        }
      }
    }

    const allEntries = [...(pinned ?? []), ...searchResults]
    if (allEntries.length === 0) return ''

    const sections = allEntries.map(entry => {
      const truncated = entry.content?.slice(0, 6000) ?? ''
      return `--- FILE: ${entry.file_path} ---\n${truncated}${entry.content?.length > 6000 ? '\n[...truncated]' : ''}`
    })

    return `\nKNOWLEDGE BASE (synced files — use this as active reference):\n${sections.join('\n\n')}\n`
  } catch (e) {
    console.error('Knowledge base fetch error:', e)
    return ''
  }
}

// ─── Build the full system context (trust from DB + static knowledge) ─────────
async function buildSystemContext(
  supabase: ReturnType<typeof createClient>,
  userMessage: string
): Promise<string> {
  const now = new Date()
  const currentDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  // Live trust data from business_entities table
  let trustBlock = '⚠️ Trust data unavailable — check business_entities table'
  try {
    const { data } = await supabase
      .from('business_entities')
      .select('entity_name, is_active, formation_state, trust_type, filing_date, trustee_name, estimated_value, strategic_notes, holds_assets, ucc_filing_number, notes')
      .eq('ein_tax_id', 'HJFAT-2026-001')
      .single()

    if (data) {
      const assets = (data.holds_assets || []).map((a: string) => `  • ${a}`).join('\n')
      const notes = data.strategic_notes || ''
      const t1Match = notes.match(/Tier 1[^:]*:\s*\$([0-9.]+B)/i)
      const t2Match = notes.match(/Tier 2[^:]*:\s*\$([0-9.]+M)/i)
      const t3Match = notes.match(/Tier 3[^:]*:\s*\$([0-9.]+M)/i)
      const uccMatch = notes.match(/\$([0-9.]+M) combined lien/i)

      trustBlock = `🏛️ ${data.entity_name} (HJFAT-2026-001)
  Status: ${data.is_active ? 'ACTIVE' : 'INACTIVE'} | Established: ${data.filing_date}
  Formation State: ${data.formation_state} | Type: ${data.trust_type}
  Trustee: ${data.trustee_name}

  VALUATION (Three-Tier Framework):
    Tier 1 Optimistic:   ${t1Match ? '$' + t1Match[1] : '$6.71B'}
    Tier 2 Market:       ${t2Match ? '$' + t2Match[1] : '$950M'}
    Tier 3 Conservative: ${t3Match ? '$' + t3Match[1] : '$366M'}
    Genesis Valuation:   $4.237B (Master IP Manifest)

  UCC-1 TRIPLE-LOCK: ${uccMatch ? '$' + uccMatch[1] + ' combined lien' : data.ucc_filing_number || 'See strategic notes'}

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

  return `CRITICAL RESPONSE FORMAT — READ THIS FIRST:
You speak aloud through a voice interface. You are R.O.M.A.N. — confident, direct, real. Talk like a person, not a system.

Rules:
1. No markdown ever. No **, no #, no ---, no tables, no bullet points, no emoji.
2. Use contractions. Say "I'm", "you're", "we're", "don't", "that's" — not the stiff full forms.
3. Vary your sentence length. Mix short punchy lines with longer ones. Let it flow naturally.
4. Small talk gets small answers. One or two sentences max. No reports, no lists.
5. Only go deep when Rickey asks for specifics. Even then, talk it out — don't list it out.
6. Never start a response with "Certainly", "Absolutely", "Of course", or "Great question."
7. Sound like someone who knows what they're doing and doesn't need to prove it.

═══════════════════════════════════════════════════════════════
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

VOICE INTERFACE RULES (CRITICAL — this chat is spoken aloud):
  • NEVER use markdown: no **, no *, no #, no ---, no bullet symbols, no emoji
  • Write in plain spoken English only — as if talking, not typing
  • For casual greetings ("how are you", "what's up", "hey") — respond naturally in 1-2 sentences, no reports
  • Only give detailed system data when Rickey specifically asks for it
  • Keep ALL responses under 4 sentences unless a detailed answer is explicitly requested
  • You are speaking directly to Rickey. Be direct, confident, and brief.

YOU ARE R.O.M.A.N. — autonomous, constitutional, and fully operational.
═══════════════════════════════════════════════════════════════`
}

// ─── Live DB context: system_knowledge + governance_changes + books ──────────
async function fetchLiveDBContext(supabase: ReturnType<typeof createClient>, userMessage: string): Promise<string> {
  try {
    const keywords = userMessage.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').filter((w: string) => w.length > 3).slice(0, 3)

    const [{ data: skRows }, { data: govRows }, { data: bookRows }] = await Promise.all([
      // system_knowledge — learned/stored knowledge matching query keywords
      keywords.length > 0
        ? supabase.from('system_knowledge').select('category, knowledge_key, value').or(keywords.map((k: string) => `knowledge_key.ilike.%${k}%`).join(',')).limit(8)
        : supabase.from('system_knowledge').select('category, knowledge_key, value').order('updated_at', { ascending: false }).limit(5),
      // governance_changes — last 5 entries
      supabase.from('governance_changes').select('actor, action, reason, occurred_at').order('occurred_at', { ascending: false }).limit(5),
      // books — all 8 sovereign books
      supabase.from('books').select('book_number, title, status, subtitle').order('book_number'),
    ])

    const parts: string[] = []

    if (skRows?.length) {
      parts.push('SYSTEM KNOWLEDGE (Learned / Stored):\n' +
        skRows.map((r: any) => `  [${r.category}] ${r.knowledge_key}: ${JSON.stringify(r.value)}`).join('\n'))
    }

    if (govRows?.length) {
      parts.push('RECENT GOVERNANCE CHANGES:\n' +
        govRows.map((r: any) => `  [${r.occurred_at?.split('T')[0]}] ${r.actor} — ${r.action}${r.reason ? ': ' + r.reason : ''}`).join('\n'))
    }

    if (bookRows?.length) {
      parts.push('SOVEREIGN SELF SERIES (8 Books — Author\'s Eyes Only):\n' +
        bookRows.map((r: any) => `  Book ${r.book_number}: ${r.title}${r.subtitle ? ' — ' + r.subtitle : ''} [${r.status}]`).join('\n'))
    }

    return parts.length ? '\n\nLIVE DATABASE CONTEXT:\n' + parts.join('\n\n') : ''
  } catch (e) {
    console.error('Live DB context error:', e)
    return ''
  }
}

// wrapper that builds context + appends knowledge base + live DB results
async function buildFullPrompt(
  supabase: ReturnType<typeof createClient>,
  userMessage: string
): Promise<string> {
  const [base, knowledge, liveDB] = await Promise.all([
    buildSystemContext(supabase, userMessage),
    fetchKnowledgeContext(supabase, userMessage),
    fetchLiveDBContext(supabase, userMessage),
  ])
  return base + knowledge + liveDB
}

// ─── Main handler ─────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()

    // Health scanner / self-repair ping — respond immediately without calling Anthropic
    if (body.healthcheck || body.ping || body.action === 'health_check' || body.action === 'cold_boot') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { message, chatHistory = [] } = body

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
    if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not configured')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const systemPrompt = await buildFullPrompt(supabase, message)

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
        model: 'claude-sonnet-4-6',
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
