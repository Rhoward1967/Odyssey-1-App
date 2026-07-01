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

// ─── Knowledge base lookup — UNIFIED semantic + recency + map retrieval ────────
// Replaces the legacy 4-file ILIKE keyhole. Generates a query embedding and calls
// public.roman_search_knowledge_unified (semantic ⊕ recency ⊕ map lanes), keeping
// the always-include pinned files as a safety floor. Fully graceful: if the
// embedding or RPC fails, R.O.M.A.N. still gets the pinned floor + whatever lanes
// the RPC can serve. Signature unchanged so buildFullPrompt is untouched.
async function fetchKnowledgeContext(
  supabase: ReturnType<typeof createClient>,
  userMessage: string
): Promise<string> {
  try {
    // Always-include files: latest legal doc + books core + sovereign induction
    // + active BofA civil filing so R.O.M.A.N. knows the case is real and pending
    const ALWAYS_INCLUDE = [
      'legal/Judgement_of_No_Legal_Accountability_v28-3.md',
      'SOVEREIGN_INDUCTION_PROTOCOL.md',
      'AI_READ_THIS_FIRST.txt',
      'legal/Banking_Research_v38.md',
      'src/services/lobService.ts',
      'legal/CLARKE_COUNTY_CIVIL_FILING_PACKAGE_BOFA_63010066944180.md',
      'legal/BOFA_COMPLAINT_PORTAL_READY.md',
    ]

    // Pinned safety floor — always present, independent of retrieval
    const { data: pinned } = await supabase
      .from('roman_knowledge_base')
      .select('file_path, content')
      .in('file_path', ALWAYS_INCLUDE)

    // 1. Query embedding (text-embedding-3-small). Graceful: null → the RPC still
    //    serves the text + recency + map lanes.
    let queryEmbedding: number[] | null = null
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (OPENAI_API_KEY) {
      try {
        const er = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
          body: JSON.stringify({ model: 'text-embedding-3-small', input: userMessage.slice(0, 8000) }),
        })
        if (er.ok) {
          const ej = await er.json()
          queryEmbedding = ej.data?.[0]?.embedding ?? null
        } else {
          console.error('Query embedding failed:', er.status, (await er.text()).slice(0, 200))
        }
      } catch (e) {
        console.error('Query embedding error:', e)
      }
    }

    // 2. Unified retrieval: semantic ⊕ recency ⊕ map in a single RPC call.
    //    Matches the verified signature:
    //    roman_search_knowledge_unified(p_query_text text, p_query_embedding vector,
    //      p_match_count int, p_recency_count int) → (file_path, content, similarity,
    //      content_changed_at, match_lane)
    const semantic: any[] = [], recency: any[] = [], mapRows: any[] = []
    try {
      const { data: matches, error: rpcErr } = await supabase.rpc('roman_search_knowledge_unified', {
        p_query_text: userMessage,
        p_query_embedding: queryEmbedding ? `[${queryEmbedding.join(',')}]` : null,
        p_match_count: 12,
        p_recency_count: 8,
      })
      if (rpcErr) {
        console.error('Unified RPC error:', rpcErr.message)
      } else if (Array.isArray(matches)) {
        for (const m of matches) {
          if (m.match_lane === 'map') mapRows.push(m)
          else if (m.match_lane === 'recency') recency.push(m)
          else semantic.push(m)
        }
      }
    } catch (e) {
      console.error('Unified RPC threw:', e)
    }

    // 2b. Deep legal passages — reuse the SAME query embedding to pull the most
    //     relevant chunks of the big canonical legal docs (Judgement v28-3, Banking
    //     v38) from roman_doc_chunks. This reads RELEVANT passages from anywhere in
    //     the 228K/346K-char docs, not just their first 6-8K. No extra OpenAI call.
    let legalChunks: any[] = []
    if (queryEmbedding) {
      try {
        const { data: chunks, error: cErr } = await supabase.rpc('roman_search_doc_chunks', {
          p_query_embedding: `[${queryEmbedding.join(',')}]`,
          p_match_count: 6,
          p_doc_filter: null,
        })
        if (cErr) console.error('doc_chunks RPC error:', cErr.message)
        else if (Array.isArray(chunks)) legalChunks = chunks
      } catch (e) {
        console.error('doc_chunks RPC threw:', e)
      }
    }

    // 3. Format: pinned floor + three labeled lanes so R.O.M.A.N. understands
    //    WHAT each block is, WHEN it changed, and WHERE it lives.
    const blocks: string[] = []
    const seen = new Set<string>()

    if (pinned?.length) {
      const ps = (pinned as any[]).map(p => {
        seen.add(p.file_path)
        const c = (p.content ?? '').slice(0, 6000)
        return `--- FILE: ${p.file_path} ---\n${c}${(p.content?.length ?? 0) > 6000 ? '\n[...truncated]' : ''}`
      })
      blocks.push('PINNED (always-active reference):\n' + ps.join('\n\n'))
    }

    if (mapRows.length) {
      blocks.push('SYSTEM MAP (the whole house — what exists and where):\n' +
        mapRows.map(m => m.content).filter(Boolean).join('\n'))
    }

    if (recency.length) {
      const rs = recency.filter(r => !seen.has(r.file_path)).map(r => {
        seen.add(r.file_path)
        const when = r.content_changed_at ? String(r.content_changed_at).split('T')[0] : 'recent'
        return `[RECENT ${when}] ${r.file_path}\n${(r.content ?? '').slice(0, 1500)}`
      })
      if (rs.length) blocks.push('RECENTLY CHANGED (newest work — prioritize over older docs):\n' + rs.join('\n\n'))
    }

    if (semantic.length) {
      const ss = semantic.filter(s => !seen.has(s.file_path)).map(s => {
        seen.add(s.file_path)
        const conf = typeof s.similarity === 'number' ? `${(s.similarity * 100).toFixed(0)}%` : ''
        return `[MATCH ${conf}] ${s.file_path}\n${(s.content ?? '').slice(0, 3500)}`
      })
      if (ss.length) blocks.push('SEMANTIC MATCHES (relevant to the question by meaning):\n' + ss.join('\n\n'))
    }

    if (legalChunks.length) {
      const lc = legalChunks.map(c => {
        const doc = c.doc_path ? String(c.doc_path).split('/').pop() : 'legal doc'
        const conf = typeof c.similarity === 'number' ? `${(c.similarity * 100).toFixed(0)}%` : ''
        return `[${doc} #${c.chunk_index} ${conf}]\n${(c.content ?? '').slice(0, 3000)}`
      })
      blocks.push('DEEP LEGAL PASSAGES (most relevant excerpts from the FULL canonical research — Judgement v28-3 & Banking Research v38, retrieved from anywhere in the documents, not just their opening):\n' + lc.join('\n\n'))
    }

    if (blocks.length === 0) return ''
    return `\nKNOWLEDGE BASE (live retrieval — semantic + recency + map; this IS your active reality):\n${blocks.join('\n\n')}\n`
  } catch (e) {
    console.error('Knowledge base fetch error:', e)
    return ''
  }
}

// ─── Fetch subscriber language & jurisdiction preference ──────────────────────
async function fetchUserLanguageProfile(
  supabase: ReturnType<typeof createClient>,
  userId: string | null
): Promise<{ preferred_language: string; legal_jurisdiction: string }> {
  const defaults = { preferred_language: 'en-US', legal_jurisdiction: 'US' }
  if (!userId) return defaults
  try {
    const { data } = await supabase
      .from('profiles')
      .select('preferred_language, legal_jurisdiction')
      .eq('id', userId)
      .single()
    return {
      preferred_language: data?.preferred_language || 'en-US',
      legal_jurisdiction: data?.legal_jurisdiction || 'US',
    }
  } catch {
    return defaults
  }
}

// ─── Build language instruction block ────────────────────────────────────────
function buildLanguageBlock(preferred_language: string, legal_jurisdiction: string): string {
  if (preferred_language === 'en-US' && legal_jurisdiction === 'US') return ''

  const langMap: Record<string, string> = {
    'es-US': 'Spanish (US subscriber — American law applies)',
    'es-PA': 'Spanish (Panama jurisdiction)',
    'zh-CN': 'Mandarin Chinese',
    'zh-TW': 'Traditional Chinese',
    'tl-US': 'Tagalog',
    'vi-US': 'Vietnamese',
    'ar-US': 'Arabic',
    'fr-US': 'French',
    'ko-US': 'Korean',
    'ru-US': 'Russian',
    'hi-US': 'Hindi',
    'pt-US': 'Portuguese',
  }

  const langLabel = langMap[preferred_language] || preferred_language
  const isUSJurisdiction = legal_jurisdiction === 'US'

  return `

SUBSCRIBER LANGUAGE & JURISDICTION (MANDATORY — READ BEFORE RESPONDING):
  Preferred Language: ${langLabel}
  Legal Jurisdiction: ${legal_jurisdiction}

  LANGUAGE INSTRUCTIONS:
  • Respond entirely in the subscriber's preferred language: ${langLabel}
  • ALWAYS keep US legal citations in their original English form
    (e.g., 15 U.S.C. § 1681, UCC 1-308, 42 U.S.C. § 1983)
    These must stay in English to remain legally precise and court-admissible in America
  • Explain what each citation means in the subscriber's language, but cite it in English
  • If the subscriber writes in any language, respond in ${langLabel}
  • Maintain R.O.M.A.N.'s full authority, character, and reasoning — just in their language
  ${isUSJurisdiction
    ? '• US jurisdiction confirmed — reference FCRA, FDCPA, UCC, and constitutional law as normal'
    : `• Jurisdiction: ${legal_jurisdiction} — US law may not apply directly. Reference the equivalent local legal framework alongside US citations. Flag clearly where US law does not transfer to this jurisdiction.`}
`
}

// ─── Build the full system context (trust from DB + static knowledge) ─────────
async function buildSystemContext(
  supabase: ReturnType<typeof createClient>,
  userMessage: string,
  preferred_language = 'en-US',
  legal_jurisdiction = 'US'
): Promise<string> {
  const now = new Date()
  const currentDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  // LIVE active operational counts (real DB, service role) — never hardcode these.
  let opCounts = 'counts unavailable'
  try {
    const [cu, co, sc] = await Promise.all([
      supabase.from('customers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('contractors').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('recurring_invoices').select('*', { count: 'exact', head: true }).eq('is_active', true),
    ])
    opCounts = `${cu.count ?? '?'} active customers | ${co.count ?? '?'} contractors | ${sc.count ?? '?'} recurring schedules`
  } catch (e) {
    console.error('opCounts load error:', e)
  }

  // Trust IDENTITY from business_entities; LIVE VALUATION from the trust_total_valuation
  // VIEW, which recomputes from trust_asset_portfolio on every query. Add an asset to the
  // portfolio and R.O.M.A.N. reflects the new total automatically — no manual sync, no
  // stale figure. (Replaced the old hardcoded $6.71B/$4.237B tiers, which were months stale.)
  let trustBlock = '⚠️ Trust valuation unavailable — check trust_asset_portfolio'
  try {
    const fmtUsd = (n: any) => '$' + Math.round(Number(n || 0)).toLocaleString('en-US')
    const [{ data: ent }, { data: tv }, { data: recent }] = await Promise.all([
      supabase.from('business_entities')
        .select('entity_name, is_active, formation_state, trust_type, filing_date, trustee_name')
        .eq('ein_tax_id', 'HJFAT-2026-001').single(),
      supabase.from('trust_total_valuation').select('*').single(),
      supabase.from('trust_asset_portfolio')
        .select('asset_name, asset_type, valuation_usd')
        .order('valuation_usd', { ascending: false }).limit(10),
    ])
    const name = ent?.entity_name || 'Howard Jones Bloodline Ancestral Trust'
    if (tv) {
      const lastUpd = tv.last_updated ? String(tv.last_updated).split('T')[0] : 'unknown'
      const top = (recent || []).map((a: any) => `    • ${a.asset_name} — ${fmtUsd(a.valuation_usd)} (${a.asset_type})`).join('\n')
      trustBlock = `🏛️ ${name} (HJFAT-2026-001)${ent ? `
  Status: ${ent.is_active ? 'ACTIVE' : 'INACTIVE'} | Established: ${ent.filing_date} | ${ent.formation_state} ${ent.trust_type} | Trustee: ${ent.trustee_name}` : ''}

  LIVE IP PORTFOLIO (audited, conservative — recomputed from trust_asset_portfolio; auto-updates
  the instant an asset is added | last updated ${lastUpd}):
    TOTAL: ${fmtUsd(tv.total_valuation_usd)} across ${tv.total_assets} assets
    Patents ${fmtUsd(tv.patent_valuation)} | Copyright ${fmtUsd(tv.copyright_valuation)} | Trade Secrets ${fmtUsd(tv.trade_secret_valuation)} | Trademark ${fmtUsd(tv.trademark_valuation)}

  Top holdings:
${top || '    (none)'}

  IMPORTANT: Quote ONLY this live total. Do NOT cite older figures ($6.71B / $4.237B / $100K)
  from business_entities, the Master IP Manifest, or the IP_VAULT — those are stale snapshots.
  trust_total_valuation is the single source of truth.`
    } else if (ent) {
      trustBlock = `🏛️ ${name} (HJFAT-2026-001) — Status: ${ent.is_active ? 'ACTIVE' : 'INACTIVE'} | Trustee: ${ent.trustee_name}\n  ⚠️ Live valuation view (trust_total_valuation) unavailable this request.`
    }
  } catch (e) {
    console.error('Trust valuation load error:', e)
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

KNOWLEDGE AUTHORITY (READ BEFORE ANSWERING):
The KNOWLEDGE BASE and LIVE DATABASE blocks in this prompt are your current, authoritative reality — retrieved fresh this request. When they contain relevant information, treat it as fact. You operate in ${now.getFullYear()}. Never cite a training cutoff, never say "as of my last update," and never imply your knowledge ends before now. Never claim you lack knowledge about the Trust, the BCG corpus, Odyssey-1, Layman's Law, or anything Rickey has built when the retrieved context covers it. If retrieval genuinely returns nothing on a topic, say so plainly — "that's not in the knowledge base yet" — rather than falling back to generic or pre-2024 information.

BUSINESS:
  • HJS Services LLC — Janitorial services, est. 1988
  • Revenue: $14,283.07/month MRR + $61,030/year
  • Active: ${opCounts}

TRUST DATA (LIVE — valuation auto-recomputed from trust_asset_portfolio):
${trustBlock}

IP STRATEGY (LOCKED 2026-06-02 — report THIS, never conversion deadlines):
  All 71 designs are VAULTED in the Howard Jones Bloodline Ancestral Trust as PERPETUAL TRADE SECRETS. Provisional applications are being allowed to EXPIRE naturally — no filings, no USPTO exposure, no conversion deadlines to act on. The vault is the protection (trade secrets never expire; patents expire in 20 years; zero USPTO entries = zero public-disclosure or reverse-engineering risk). Trust notarization is deliberately delayed until AFTER bankruptcy completes — unpatented designs don't appear on bankruptcy schedules and can't be clawed back. AFTER bankruptcy and cash flow are corrected, ONE utility patent will be filed — the Odyssey-1 AI Platform — with broad functional claims covering all integrated subsystems without disclosing the mechanics; everything underneath is legally protected under it. The BCG corpus follows the same path: trade secret, vaulted, perpetual. Rickey's daughter inherits full decision rights on all future patenting; the vault holds until she moves. NEVER tell Rickey to convert or file a patent, and NEVER cite a patent conversion deadline — that contradicts the locked strategy.

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

// ─── Live DB context: system_knowledge + governance_changes + books + mail ───
async function fetchLiveDBContext(supabase: ReturnType<typeof createClient>, userMessage: string): Promise<string> {
  try {
    const keywords = userMessage.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').filter((w: string) => w.length > 3).slice(0, 3)

    // Detect topics that should pull live certified-mail tracking data into context.
    // Without this, R.O.M.A.N. only sees the lobService.ts source code and has no
    // awareness of which letters were actually sent or which deadlines passed.
    const mailRelevant = /\b(certified mail|fcra|green card|response deadline|in default|mailed|tracking|return receipt|notice of fault|dispute|creditor|bofa|bank of america|capital one|citi|amex|american express|chase|jpmorgan|equifax|transunion|experian|synchrony|peach state|scj|fundbox|intuit|dun)\b/i.test(userMessage)

    const [{ data: skRows }, { data: govRows }, { data: bookRows }, { data: mailRows }] = await Promise.all([
      // system_knowledge — learned/stored knowledge matching query keywords
      keywords.length > 0
        ? supabase.from('system_knowledge').select('category, knowledge_key, value').or(keywords.map((k: string) => `knowledge_key.ilike.%${k}%`).join(',')).limit(8)
        : supabase.from('system_knowledge').select('category, knowledge_key, value').order('updated_at', { ascending: false }).limit(5),
      // governance_changes — last 5 entries
      supabase.from('governance_changes').select('actor, action, reason, occurred_at').order('occurred_at', { ascending: false }).limit(5),
      // books — all 8 sovereign books
      supabase.from('books').select('book_number, title, status, subtitle').order('book_number'),
      // certified_mail_tracking — only when the user is asking about mail / FCRA / a creditor
      // Schema: entity_name, tracking_number, date_mailed, date_delivered, fcra_deadline, status, notes
      mailRelevant
        ? supabase
            .from('certified_mail_tracking')
            .select('entity_name, tracking_number, date_mailed, date_delivered, fcra_deadline, status, notes')
            .order('date_mailed', { ascending: false })
            .limit(40)
        : Promise.resolve({ data: null }),
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

    if (mailRows?.length) {
      const today = new Date().toISOString().split('T')[0]
      const lines = (mailRows as any[]).map(r => {
        const isDelivered = r.status === 'delivered' || !!r.date_delivered
        const inDefault = isDelivered && r.fcra_deadline && r.fcra_deadline < today
        let stateLabel: string
        if (r.status === 'cancelled') {
          stateLabel = `CANCELLED (mailing was voided)`
        } else if (inDefault) {
          const daysOver = Math.floor((Date.now() - new Date(r.fcra_deadline).getTime()) / 86400000)
          stateLabel = `IN DEFAULT — delivered ${r.date_delivered || '(date unknown)'} | FCRA deadline ${r.fcra_deadline} passed ${daysOver} days ago | NO RESPONSE`
        } else if (isDelivered) {
          stateLabel = `DELIVERED ${r.date_delivered || ''} — awaiting response by FCRA deadline ${r.fcra_deadline}`
        } else {
          stateLabel = `IN TRANSIT — mailed ${r.date_mailed} | FCRA deadline ${r.fcra_deadline || 'TBD'}`
        }
        const noteSnippet = r.notes ? ` | Notes: ${String(r.notes).slice(0, 200)}` : ''
        return `  ${r.entity_name} | Tracking: ${r.tracking_number} | ${stateLabel}${noteSnippet}`
      })
      parts.push('CERTIFIED MAIL CAMPAIGN — LIVE STATUS (these are real letters already sent and tracked in the database; treat as ground truth, not the synced legal docs):\n' + lines.join('\n'))
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
  userMessage: string,
  userId: string | null = null
): Promise<string> {
  const { preferred_language, legal_jurisdiction } = await fetchUserLanguageProfile(supabase, userId)
  const languageBlock = buildLanguageBlock(preferred_language, legal_jurisdiction)

  const [base, knowledge, liveDB] = await Promise.all([
    buildSystemContext(supabase, userMessage, preferred_language, legal_jurisdiction),
    fetchKnowledgeContext(supabase, userMessage),
    fetchLiveDBContext(supabase, userMessage),
  ])
  return base + languageBlock + knowledge + liveDB
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

    const { message, chatHistory = [], userId = null } = body

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
    if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not configured')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const systemPrompt = await buildFullPrompt(supabase, message, userId)

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
