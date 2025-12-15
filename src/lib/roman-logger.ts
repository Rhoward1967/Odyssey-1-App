import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

function getAdminClient(): SupabaseClient {
  if (supabase) return supabase;
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { 'X-Client-Info': 'roman-backend-logger' } },
  });
  return supabase;
}

type RomanEvent = {
  actor?: string;
  action_type: string;
  context?: Record<string, any>;
  payload?: Record<string, any>;
  severity?: 'info' | 'warn' | 'error';
};

export async function recordRomanEvent(e: RomanEvent) {
  const client = getAdminClient();
  const { error } = await client.from('ops_roman_events').insert({
    actor: e.actor ?? 'roman',
    action_type: e.action_type,
    context: e.context ?? {},
    payload: e.payload ?? {},
    severity: e.severity ?? 'info',
  });
  if (error) {
    // Optional: lightweight retry once for transient issues
    try {
      await new Promise((r) => setTimeout(r, 150));
      const retry = await client.from('ops_roman_events').insert({
        actor: e.actor ?? 'roman',
        action_type: e.action_type,
        context: e.context ?? {},
        payload: e.payload ?? {},
        severity: e.severity ?? 'info',
      });
      if (retry.error) console.error('roman_event insert failed (retry):', retry.error);
    } catch (err) {
      console.error('roman_event insert exception (retry):', err);
    }
  }
}
