import { createClient } from 'npm:@supabase/supabase-js@2.46.2';

interface CapabilityResult { status: 'ok' | 'missing' | 'error'; message?: string }

// OpenAI Check
async function checkOpenAI(): Promise<CapabilityResult> {
  const key = Deno.env.get('OPENAI_API_KEY')
  if (!key) return { status: 'missing' }
  try {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), 2500)
    const resp = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${key}` },
      signal: controller.signal,
    })
    clearTimeout(t)
    if (resp.ok) return { status: 'ok' }
    const text = await resp.text()
    return { status: 'error', message: `HTTP ${resp.status}: ${text.slice(0, 120)}` }
  } catch (e) {
    const err = e as Error
    return { status: 'error', message: err?.message || String(e) }
  }
}

// Anthropic Check
async function checkAnthropic(): Promise<CapabilityResult> {
  const key = Deno.env.get('ANTHROPIC_API_KEY')
  if (!key) return { status: 'missing' }
  try {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), 2500)
    const resp = await fetch('https://api.anthropic.com/v1/models', {
      method: 'GET',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      signal: controller.signal,
    })
    clearTimeout(t)
    if (resp.ok) return { status: 'ok' }
    const text = await resp.text()
    return { status: 'error', message: `HTTP ${resp.status}: ${text.slice(0, 120)}` }
  } catch (e) {
    const err = e as Error
    return { status: 'error', message: err?.message || String(e) }
  }
}

// Gemini Check
async function checkGemini(): Promise<CapabilityResult> {
  const key = Deno.env.get('GEMINI_API_KEY')
  if (!key) return { status: 'missing' }
  try {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), 2500)
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(key)}`
    const resp = await fetch(url, { method: 'GET', signal: controller.signal })
    clearTimeout(t)
    if (resp.ok) return { status: 'ok' }
    const text = await resp.text()
    return { status: 'error', message: `HTTP ${resp.status}: ${text.slice(0, 120)}` }
  } catch (e) {
    const err = e as Error
    return { status: 'error', message: err?.message || String(e) }
  }
}

// Google Calendar Check
async function checkGoogleCalendar(): Promise<CapabilityResult> {
  const key = Deno.env.get('GOOGLE_CALENDAR_API_KEY')
  if (!key) return { status: 'missing' }
  try {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), 2500)
    const url = `https://www.googleapis.com/calendar/v3/users/me/calendarList?key=${encodeURIComponent(key)}`
    const resp = await fetch(url, { method: 'GET', signal: controller.signal })
    clearTimeout(t)
    if (resp.ok || resp.status === 401) return { status: 'ok' } // 401 means key exists but needs OAuth
    const text = await resp.text()
    return { status: 'error', message: `HTTP ${resp.status}: ${text.slice(0, 120)}` }
  } catch (e) {
    const err = e as Error
    return { status: 'error', message: err?.message || String(e) }
  }
}

// Stripe Check
async function checkStripe(): Promise<CapabilityResult> {
  const key = Deno.env.get('STRIPE_SECRET_KEY')
  if (!key) return { status: 'missing' }
  try {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), 2500)
    const resp = await fetch('https://api.stripe.com/v1/customers?limit=1', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${key}` },
      signal: controller.signal,
    })
    clearTimeout(t)
    if (resp.ok) return { status: 'ok' }
    const text = await resp.text()
    return { status: 'error', message: `HTTP ${resp.status}: ${text.slice(0, 120)}` }
  } catch (e) {
    const err = e as Error
    return { status: 'error', message: err?.message || String(e) }
  }
}

// Twilio Check
async function checkTwilio(): Promise<CapabilityResult> {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')
  if (!accountSid || !authToken) return { status: 'missing' }
  try {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), 2500)
    const auth = btoa(`${accountSid}:${authToken}`)
    const resp = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`, {
      method: 'GET',
      headers: { 'Authorization': `Basic ${auth}` },
      signal: controller.signal,
    })
    clearTimeout(t)
    if (resp.ok) return { status: 'ok' }
    const text = await resp.text()
    return { status: 'error', message: `HTTP ${resp.status}: ${text.slice(0, 120)}` }
  } catch (e) {
    const err = e as Error
    return { status: 'error', message: err?.message || String(e) }
  }
}

// SAM.gov Check (uses API key)
async function checkSAMGov(): Promise<CapabilityResult> {
  const key = Deno.env.get('SAM_GOV_API_KEY')
  if (!key) return { status: 'missing' }
  try {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), 3000)
    const resp = await fetch('https://api.sam.gov/opportunities/v2/search?limit=1&api_key=' + encodeURIComponent(key), {
      method: 'GET',
      signal: controller.signal,
    })
    clearTimeout(t)
    if (resp.ok) return { status: 'ok' }
    const text = await resp.text()
    return { status: 'error', message: `HTTP ${resp.status}: ${text.slice(0, 120)}` }
  } catch (e) {
    const err = e as Error
    return { status: 'error', message: err?.message || String(e) }
  }
}

// arXiv Check (no API key needed, public API)
async function checkArXiv(): Promise<CapabilityResult> {
  try {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), 2500)
    const resp = await fetch('http://export.arxiv.org/api/query?search_query=all:electron&start=0&max_results=1', {
      method: 'GET',
      signal: controller.signal,
    })
    clearTimeout(t)
    if (resp.ok) return { status: 'ok' }
    const text = await resp.text()
    return { status: 'error', message: `HTTP ${resp.status}: ${text.slice(0, 120)}` }
  } catch (e) {
    const err = e as Error
    return { status: 'error', message: err?.message || String(e) }
  }
}

// GitHub Check
async function checkGitHub(): Promise<CapabilityResult> {
  const token = Deno.env.get('GITHUB_TOKEN')
  if (!token) return { status: 'missing' }
  try {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), 2500)
    const resp = await fetch('https://api.github.com/user', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
      signal: controller.signal,
    })
    clearTimeout(t)
    if (resp.ok) return { status: 'ok' }
    const text = await resp.text()
    return { status: 'error', message: `HTTP ${resp.status}: ${text.slice(0, 120)}` }
  } catch (e) {
    const err = e as Error
    return { status: 'error', message: err?.message || String(e) }
  }
}

// R.O.M.A.N. Ready Check (Discord bot token + system knowledge)
async function checkROMANReady(): Promise<CapabilityResult> {
  const discordToken = Deno.env.get('DISCORD_BOT_TOKEN')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  
  if (!discordToken) return { status: 'missing', message: 'Discord token missing' }
  if (!supabaseUrl || !serviceKey) return { status: 'missing', message: 'Supabase credentials missing' }
  
  try {
    // Check if R.O.M.A.N. has initialized (check system_knowledge)
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
    const { data, error } = await supabase
      .from('system_knowledge')
      .select('knowledge_key')
      .eq('category', 'identity')
      .eq('knowledge_key', 'roman_core')
      .maybeSingle()
    
    if (error) return { status: 'error', message: `DB error: ${error.message}` }
    if (!data) return { status: 'ok', message: 'R.O.M.A.N. ready (no identity record yet)' }
    return { status: 'ok', message: 'R.O.M.A.N. ready and initialized' }
  } catch (e) {
    const err = e as Error
    return { status: 'error', message: err?.message || String(e) }
  }
}

// Genesis Mode Check (checks if auto-audit system is active)
async function checkGenesisMode(): Promise<CapabilityResult> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  
  if (!supabaseUrl || !serviceKey) return { status: 'missing' }
  
  try {
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
    const { data, error } = await supabase
      .from('system_knowledge')
      .select('knowledge_key, updated_at')
      .eq('category', 'system_audit')
      .eq('knowledge_key', 'latest_complete_audit')
      .maybeSingle()
    
    if (error) return { status: 'error', message: `DB error: ${error.message}` }
    if (!data) return { status: 'ok', message: 'Genesis ready (no audit yet)' }
    
    // Check if audit is recent (within last 24 hours)
    const lastAudit = new Date(data.updated_at)
    const hoursSinceAudit = (Date.now() - lastAudit.getTime()) / (1000 * 60 * 60)
    
    if (hoursSinceAudit < 24) {
      return { status: 'ok', message: `Last audit ${hoursSinceAudit.toFixed(1)}h ago` }
    } else {
      return { status: 'error', message: `Last audit ${hoursSinceAudit.toFixed(0)}h ago (stale)` }
    }
  } catch (e) {
    const err = e as Error
    return { status: 'error', message: err?.message || String(e) }
  }
}

async function persistStatus(value: Record<string, unknown>) {
  const url = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !serviceKey) throw new Error('Missing service credentials')
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })

  const knowledgeKey = 'ai_capabilities'

  const { error: rpcError } = await supabase.rpc('upsert_system_knowledge', {
    key_text: knowledgeKey,
    value_json: value as Record<string, unknown>,
  })

  if (!rpcError) return

  const { error } = await supabase
    .from('system_knowledge')
    .upsert({ knowledge_key: knowledgeKey, value }, { onConflict: 'knowledge_key' })
  if (error) throw error
}

console.info('capability-check with ALL 11 integrations started')
Deno.serve(async (req: Request) => {
  try {
    const url = new URL(req.url)
    const quick = url.searchParams.get('quick') === '1'

  // Check all integrations (quick mode just checks if keys exist)
  const openai = quick
    ? ({ status: Deno.env.get('OPENAI_API_KEY') ? 'ok' : 'missing' } as CapabilityResult)
    : await checkOpenAI()
  
  const anthropic = quick
    ? ({ status: Deno.env.get('ANTHROPIC_API_KEY') ? 'ok' : 'missing' } as CapabilityResult)
    : await checkAnthropic()
  
  const gemini = quick
    ? ({ status: Deno.env.get('GEMINI_API_KEY') ? 'ok' : 'missing' } as CapabilityResult)
    : await checkGemini()
  
  const googleCalendar = quick
    ? ({ status: Deno.env.get('GOOGLE_CALENDAR_API_KEY') ? 'ok' : 'missing' } as CapabilityResult)
    : await checkGoogleCalendar()
  
  const stripe = quick
    ? ({ status: Deno.env.get('STRIPE_SECRET_KEY') ? 'ok' : 'missing' } as CapabilityResult)
    : await checkStripe()
  
  const twilio = quick
    ? ({ status: (Deno.env.get('TWILIO_ACCOUNT_SID') && Deno.env.get('TWILIO_AUTH_TOKEN')) ? 'ok' : 'missing' } as CapabilityResult)
    : await checkTwilio()
  
  const samGov = quick
    ? ({ status: Deno.env.get('SAM_GOV_API_KEY') ? 'ok' : 'missing' } as CapabilityResult)
    : await checkSAMGov()
  
  const arXiv = quick
    ? ({ status: 'ok' } as CapabilityResult) // Public API, always available
    : await checkArXiv()
  
  const github = quick
    ? ({ status: Deno.env.get('GITHUB_TOKEN') ? 'ok' : 'missing' } as CapabilityResult)
    : await checkGitHub()
  
  const romanReady = quick
    ? ({ status: Deno.env.get('DISCORD_BOT_TOKEN') ? 'ok' : 'missing' } as CapabilityResult)
    : await checkROMANReady()
  
  const genesisMode = quick
    ? ({ status: 'ok' } as CapabilityResult) // Assume active
    : await checkGenesisMode()

  // Build comprehensive payload
  const payload = {
    integrations: {
      openai,
      anthropic,
      gemini,
      googleCalendar,
      stripe,
      twilio,
      samGov,
      arXiv,
      github,
      romanReady,
      genesisMode
    },
    summary: {
      total: 11,
      active: [openai, anthropic, gemini, googleCalendar, stripe, twilio, samGov, arXiv, github, romanReady, genesisMode]
        .filter(r => r.status === 'ok').length,
      missing: [openai, anthropic, gemini, googleCalendar, stripe, twilio, samGov, arXiv, github, romanReady, genesisMode]
        .filter(r => r.status === 'missing').length,
      errors: [openai, anthropic, gemini, googleCalendar, stripe, twilio, samGov, arXiv, github, romanReady, genesisMode]
        .filter(r => r.status === 'error').length
    },
    checked_at: new Date().toISOString(),
    quick_mode: quick
  }

  // Store results in database (async, don't wait)
  if (!quick) {
    try {
      // @ts-ignore available in Supabase Edge Runtime
      EdgeRuntime.waitUntil(persistStatus(payload))
    } catch (_e) {
      try { 
        await persistStatus(payload) 
      } catch (_fallbackError) {
        // Silently fail - this is optional background storage
      }
    }
  }

  return new Response(JSON.stringify(payload), {
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    },
    status: 200,
  })
  } catch (error) {
    console.error('Edge function error:', error)
    const err = error as Error
    return new Response(JSON.stringify({ error: err?.message || String(error) }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
      status: 500,
    })
  }
})
