import { logSystemActivity } from './logSystemActivity';

/**
 * Log an AI recommendation event (e.g., suggest disabling API)
 */
export async function logAIRecommendation({ recommendation, details, status = 'pending', user_id = null }: { recommendation: string; details?: string; status?: string; user_id?: string | null }) {
  await logSystemActivity({
    action: `AI Recommendation: ${recommendation}`,
    details,
    status,
  });
}

/**
 * Log an AI action execution (with or without approval)
 */
export async function logAIAction({ action, details, status = 'executed', user_id = null }: { action: string; details?: string; status?: string; user_id?: string | null }) {
  await logSystemActivity({
    action: `AI Action: ${action}`,
    details,
    status,
  });
}

/**
 * Log an AI override or manual intervention
 */
export async function logAIOverride({ override, details, status = 'override', user_id = null }: { override: string; details?: string; status?: string; user_id?: string | null }) {
  await logSystemActivity({
    action: `AI Override: ${override}`,
    details,
    status,
  });
}
