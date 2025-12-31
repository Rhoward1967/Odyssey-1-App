/**
 * ODYSSEY-1 System Milestones & Deployment Dates
 * Updated: December 30, 2025 (Corporate Minutes v2.5)
 * 
 * These constants track critical hardware and infrastructure implementation dates.
 */

export const SYSTEM_MILESTONES = {
  /**
   * Alpha Node (RTX 5090 PC) Implementation
   * Original Date: January 18, 2026
   * Updated Date: April 1, 2026
   * Reason: Driver stability concerns, increased firmware budget allocation
   * Decision: December 30, 2025 Board Meeting (Minutes v2.5)
   */
  ALPHA_NODE_DEPLOYMENT: {
    originalDate: '2026-01-18',
    currentDate: '2026-04-01',
    updatedOn: '2025-12-30',
    reason: 'Driver stability and firmware development requirements',
    status: 'DELAYED' as const,
    budgetIncrease: {
      firmware: 2500, // Additional $2,500 for firmware development
      testing: 1000,  // Additional $1,000 for extended testing
    },
  },

  /**
   * Patent Deadlines
   */
  PATENT_UTILITY_CONVERSION: {
    provisionalFiled: '2025-11-07',
    conversionDeadline: '2026-11-07',
    status: 'ON_TRACK' as const,
  },

  /**
   * LLC Registrations
   */
  LLC_RENEWALS: {
    odysseyAI: '2026-12-31', // ODYSSEY-1 AI LLC (BT-0101233)
    hjsServices: '2026-12-31', // HJS SERVICES LLC (BT-089217)
  },
} as const;

/**
 * Get days until Alpha Node deployment
 */
export function getDaysUntilAlphaNode(): number {
  const target = new Date(SYSTEM_MILESTONES.ALPHA_NODE_DEPLOYMENT.currentDate);
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Get Alpha Node deployment status message
 */
export function getAlphaNodeStatus(): {
  daysRemaining: number;
  targetDate: string;
  status: string;
  message: string;
} {
  const daysRemaining = getDaysUntilAlphaNode();
  const { currentDate, reason, status } = SYSTEM_MILESTONES.ALPHA_NODE_DEPLOYMENT;

  let message = '';
  if (daysRemaining > 60) {
    message = `Alpha Node deployment scheduled for ${currentDate}. ${reason}.`;
  } else if (daysRemaining > 30) {
    message = `Alpha Node deployment in ${daysRemaining} days. Final preparations underway.`;
  } else if (daysRemaining > 0) {
    message = `⚠️ URGENT: Alpha Node deployment in ${daysRemaining} days. Complete pre-flight checks.`;
  } else {
    message = `🚨 Alpha Node deployment date reached! Execute implementation plan.`;
  }

  return {
    daysRemaining,
    targetDate: currentDate,
    status,
    message,
  };
}
