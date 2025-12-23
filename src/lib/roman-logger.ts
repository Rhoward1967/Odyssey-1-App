import { romanSupabase } from '@/services/romanSupabase';

type RomanEvent = {
  actor?: string;
  action_type: string;
  context?: Record<string, any>;
  payload?: Record<string, any>;
  severity?: 'info' | 'warn' | 'error';
};

export async function recordRomanEvent(e: RomanEvent) {
  const { error } = await romanSupabase.from('ops_roman_events').insert({
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
      const retry = await romanSupabase.from('ops_roman_events').insert({
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
