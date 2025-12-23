import { supabase } from '@/lib/supabaseClient';

/**
 * Logs a system activity event to the activity_logs table in Supabase.
 * @param {Object} params
 * @param {string} params.action - The action performed (e.g., 'login', 'budget_update').
 * @param {string} [params.details] - Optional details about the action.
 * @param {string} [params.status] - Status of the action (e.g., 'success', 'failed').
 */
export async function logSystemActivity({ action, details = '', status = 'success' }: { action: string; details?: string; status?: string }) {
  try {
    const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null;
    const user_id = user?.id || null;
    const ip_address = '';
    const user_agent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
    const { error } = await supabase.from('activity_logs').insert([
      {
        user_id,
        action,
        details,
        status,
        ip_address,
        user_agent,
      },
    ]);
    if (error) {
      console.error('Failed to log system activity:', error);
    }
  } catch (err) {
    console.error('Error logging system activity:', err);
  }
}
