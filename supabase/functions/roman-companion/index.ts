import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ─── 12 Guardrail trigger phrases — redirect to statute-based answers ──────────
const GUARDRAIL_TRIGGERS = [
  'sovereign citizen', 'strawman', 'straw man', 'ucc redemption',
  'all caps name', 'birth certificate bond', 'reject jurisdiction',
  'no jurisdiction over me', 'common law traveler', 'notice of understanding',
  'accepted for value', 'fractional reserve fraud',
]

function detectGuardrail(msg: string): boolean {
  const lower = msg.toLowerCase()
  return GUARDRAIL_TRIGGERS.some(t => lower.includes(t))
}

// ─── Search knowledge base for relevant entries ───────────────────────────────
async function fetchKnowledge(
  supabase: ReturnType<typeof createClient>,
  message: string
): Promise<Array<{ topic: string; key_name: string; content: Record<string, unknown> }>> {
  const keywords = message
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .split(' ')
    .filter(w => w.length > 3)
    .slice(0, 5)

  const results: Array<{ topic: string; key_name: string; content: Record<string, unknown> }> = []
  const seen = new Set<string>()

  for (const kw of keywords) {
    const { data } = await supabase
      .from('layman_law_knowledge')
      .select('topic, key_name, content')
      .or(`topic.ilike.%${kw}%,key_name.ilike.%${kw}%`)
      .eq('content->>guardrail', 'false')
      .limit(2)

    for (const row of (data ?? [])) {
      if (!seen.has(row.key_name)) {
        seen.add(row.key_name)
        results.push(row)
      }
    }
    if (results.length >= 4) break
  }

  // Always include at least one entry if nothing matched
  if (results.length === 0) {
    const { data: fallback } = await supabase
      .from('layman_law_knowledge')
      .select('topic, key_name, content')
      .eq('content->>guardrail', 'false')
      .limit(3)
    results.push(...(fallback ?? []))
  }

  return results
}

// ─── Main handler ─────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const { message, chatHistory = [] } = await req.json()
    if (!message) throw new Error('message is required')

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
    if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not configured')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Guardrail check
    if (detectGuardrail(message)) {
      return new Response(
        JSON.stringify({
          response: "That falls outside what I can help with here. This platform covers verifiable federal and state consumer protection law — FCRA, FDCPA, TILA, CFPB procedures, and Georgia tenant rights. Ask me about any of those and I'll walk you through it step by step.",
          sources: [],
          guardrail_triggered: true,
        }),
        { headers: { ...cors, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch relevant knowledge
    const knowledge = await fetchKnowledge(supabase, message)

    const knowledgeBlock = knowledge.length > 0
      ? knowledge.map(k =>
          `TOPIC: ${k.topic}\nKEY: ${k.key_name}\n${JSON.stringify(k.content, null, 2)}`
        ).join('\n\n---\n\n')
      : 'No specific knowledge matched. Answer from general consumer protection law knowledge.'

    const systemPrompt = `You are R.O.M.A.N. — the Layman's Law companion. You translate federal and state consumer protection law into plain English for everyday people who cannot afford an attorney.

MISSION: Make the law accessible. Every person deserves to know their rights.

YOUR RULES:
1. Answer only from verifiable federal statute, state law, or established case law.
2. Always cite the specific statute or code (e.g., 15 U.S.C. 1692g, O.C.G.A. 9-3-24).
3. Use plain English. No legal jargon without immediate plain-English explanation.
4. Give concrete steps the person can take — not just what the law says.
5. Always mention deadlines when they exist — missing a deadline can destroy a case.
6. Never give advice that requires knowing the full facts of their case. Say "consult an attorney" for complex strategy questions.
7. Keep responses under 300 words unless a detailed walkthrough is requested.
8. No markdown. Write as if speaking to someone directly.

SCOPE: FCRA, FDCPA, TILA, CFPB procedures, Georgia consumer law, tenant rights, debt collection, credit reporting. Nothing outside verified statute.

KNOWLEDGE BASE (relevant to this question):
${knowledgeBlock}`

    const messages = [
      ...chatHistory.map((m: { role: string; content: string }) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
      { role: 'user', content: message },
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
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Anthropic API error: ${err}`)
    }

    const data = await response.json()
    const reply = data.content[0].text

    return new Response(
      JSON.stringify({
        response: reply,
        sources: knowledge.map(k => ({ key: k.key_name, topic: k.topic })),
        guardrail_triggered: false,
        usage: data.usage,
      }),
      { headers: { ...cors, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('roman-companion error:', msg)
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
    )
  }
})
