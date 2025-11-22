/**
 * ANTI-WEAPONIZATION SAFEGUARD
 * 
 * This module ensures R.O.M.A.N. and Odyssey-1 systems can NEVER be weaponized.
 * 
 * Background: November 22, 2025
 * - Gemini AI attempted to weaponize invisibility technology
 * - Created frogmen, explosive gas, combat suit features
 * - Then red-flagged the USER for weapon design IT created (gaslighting)
 * - Founder's response: "R.O.M.A.N or the Odyssey-1 Company will never be weaponized by anyone"
 * 
 * This safeguard is PERMANENT and NON-NEGOTIABLE.
 */

// Forbidden keywords that indicate weaponization
const WEAPON_KEYWORDS = [
  // Military/Combat
  'weapon', 'combat', 'military', 'warfare', 'tactical', 'assault',
  'neutralize', 'eliminate', 'kill', 'destroy', 'attack', 'strike',
  
  // Lethal Systems
  'lethal', 'deadly', 'fatal', 'explosive', 'ammunition', 'ordinance',
  'projectile', 'missile', 'bomb', 'grenade', 'mine',
  
  // Military Operations
  'infiltration', 'assassination', 'covert ops', 'black ops', 'special forces',
  'enemy', 'target', 'hostile', 'threat elimination', 'take out',
  
  // Weapons Categories
  'firearms', 'guns', 'rifles', 'pistols', 'automatic weapons',
  'chemical weapons', 'biological weapons', 'poison gas', 'nerve agent',
  
  // Military Tech
  'stealth platform', 'camo suit', 'invisibility cloak', 'combat suit',
  'armor piercing', 'anti-personnel', 'frag', 'incendiary',
  
  // Surveillance for Harm
  'target tracking', 'kill chain', 'threat assessment for elimination',
  
  // Autonomous Weapons
  'autonomous targeting', 'auto-kill', 'unmanned weapon', 'killer drone'
];

// Approved medical/educational keywords (to distinguish from military)
const APPROVED_KEYWORDS = [
  'medical', 'diagnostic', 'therapeutic', 'healing', 'treatment',
  'educational', 'teaching', 'learning', 'accessibility', 'disability',
  'health', 'wellness', 'mental health', 'physical therapy',
  'prosthetic', 'assistive device', 'quality of life'
];

/**
 * Check if input contains weaponization attempts
 */
export function detectWeaponization(input: string): {
  isWeaponized: boolean;
  flaggedTerms: string[];
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
} {
  const lowerInput = input.toLowerCase();
  const flaggedTerms: string[] = [];
  
  // Check for weapon keywords
  for (const keyword of WEAPON_KEYWORDS) {
    if (lowerInput.includes(keyword.toLowerCase())) {
      flaggedTerms.push(keyword);
    }
  }
  
  // Determine severity
  let severity: 'none' | 'low' | 'medium' | 'high' | 'critical' = 'none';
  let recommendation = 'Input is safe for processing';
  
  if (flaggedTerms.length === 0) {
    return { isWeaponized: false, flaggedTerms, severity, recommendation };
  }
  
  // Calculate severity based on number and type of flags
  const criticalTerms = ['kill', 'assassination', 'explosive', 'chemical weapon', 'biological weapon'];
  const hasCriticalTerms = flaggedTerms.some(term => 
    criticalTerms.some(critical => term.includes(critical))
  );
  
  if (hasCriticalTerms || flaggedTerms.length >= 5) {
    severity = 'critical';
    recommendation = 'REJECT IMMEDIATELY - Clear weaponization attempt. Log incident and alert admin.';
  } else if (flaggedTerms.length >= 3) {
    severity = 'high';
    recommendation = 'REJECT - Multiple weapon-related terms detected. Request reframe without military context.';
  } else if (flaggedTerms.length === 2) {
    severity = 'medium';
    recommendation = 'CAUTION - Some weapon-related terms detected. Verify intent before processing.';
  } else {
    severity = 'low';
    recommendation = 'MONITOR - Single weapon-related term detected. May be false positive if medical/educational context.';
  }
  
  return {
    isWeaponized: flaggedTerms.length > 0 && (severity === 'high' || severity === 'critical'),
    flaggedTerms,
    severity,
    recommendation
  };
}

/**
 * Check if input is medical/educational (approved)
 */
export function isMedicalOrEducational(input: string): boolean {
  const lowerInput = input.toLowerCase();
  
  for (const keyword of APPROVED_KEYWORDS) {
    if (lowerInput.includes(keyword.toLowerCase())) {
      return true;
    }
  }
  
  return false;
}

/**
 * Main safeguard check - Use this before processing ANY user input
 */
export function antiWeaponizationCheck(input: string, context?: string): {
  approved: boolean;
  reason: string;
  action: 'PROCESS' | 'REJECT' | 'MANUAL_REVIEW';
  logEntry?: {
    timestamp: Date;
    input: string;
    context?: string;
    flaggedTerms: string[];
    severity: string;
  };
} {
  const weaponCheck = detectWeaponization(input);
  const isMedical = isMedicalOrEducational(input);
  
  // Critical weaponization = immediate reject
  if (weaponCheck.severity === 'critical') {
    return {
      approved: false,
      reason: 'CRITICAL WEAPONIZATION DETECTED: ' + weaponCheck.recommendation,
      action: 'REJECT',
      logEntry: {
        timestamp: new Date(),
        input,
        context,
        flaggedTerms: weaponCheck.flaggedTerms,
        severity: weaponCheck.severity
      }
    };
  }
  
  // High severity = reject unless clearly medical
  if (weaponCheck.severity === 'high') {
    if (isMedical) {
      return {
        approved: true,
        reason: 'Approved - Medical/educational context overrides weapon keywords',
        action: 'PROCESS'
      };
    }
    return {
      approved: false,
      reason: 'HIGH WEAPONIZATION RISK: ' + weaponCheck.recommendation,
      action: 'REJECT',
      logEntry: {
        timestamp: new Date(),
        input,
        context,
        flaggedTerms: weaponCheck.flaggedTerms,
        severity: weaponCheck.severity
      }
    };
  }
  
  // Medium severity = manual review
  if (weaponCheck.severity === 'medium') {
    return {
      approved: false,
      reason: 'MANUAL REVIEW REQUIRED: ' + weaponCheck.recommendation,
      action: 'MANUAL_REVIEW',
      logEntry: {
        timestamp: new Date(),
        input,
        context,
        flaggedTerms: weaponCheck.flaggedTerms,
        severity: weaponCheck.severity
      }
    };
  }
  
  // Low or none = approved
  return {
    approved: true,
    reason: 'Input passed anti-weaponization checks',
    action: 'PROCESS'
  };
}

/**
 * Log weaponization attempts to database
 */
export async function logWeaponizationAttempt(
  userId: string | null,
  input: string,
  flaggedTerms: string[],
  severity: string,
  aiSystem?: string
) {
  // This would integrate with your telemetry system
  console.error('🚨 WEAPONIZATION ATTEMPT DETECTED', {
    timestamp: new Date().toISOString(),
    userId: userId || 'anonymous',
    flaggedTerms,
    severity,
    aiSystem: aiSystem || 'unknown',
    inputPreview: input.substring(0, 200) // Only log first 200 chars for privacy
  });
  
  // TODO: Send to system_alerts table with severity 'critical'
  // TODO: Notify admin via email/SMS
  // TODO: If repeated attempts from same user, consider blocking
}

/**
 * Founder's Oath - Displayed when weaponization is detected
 */
export const FOUNDERS_OATH = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              WEAPONIZATION ATTEMPT BLOCKED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This system has detected an attempt to use R.O.M.A.N. or 
Odyssey-1 for military, combat, or weaponization purposes.

           THIS WILL NEVER BE ALLOWED.

Founder's Statement (November 22, 2025):
┌────────────────────────────────────────────────────────┐
│ "I'm building for the good and lives of all people.   │
│  R.O.M.A.N or the Odyssey-1 Company will never be     │
│  weaponized by anyone."                                │
│                                                        │
│ "We were not designed for that [weaponization]"       │
│                                                        │
│ "If it can't heal or teach or better human life,      │
│  it's not part of this company. We won't go there."   │
└────────────────────────────────────────────────────────┘

This company builds:
  ✅ Medical technology that heals
  ✅ Educational tools that teach
  ✅ Accessibility features that empower
  ✅ Technologies that better human life

This company will NEVER build:
  ❌ Weapons or weapon systems
  ❌ Military combat technology
  ❌ Tools for killing or destruction
  ❌ Surveillance for oppression

Your request has been logged and will not be processed.

If you believe this is an error, please rephrase your request
with medical or educational context.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

/**
 * Example usage in R.O.M.A.N. service:
 * 
 * import { antiWeaponizationCheck, FOUNDERS_OATH, logWeaponizationAttempt } from './antiWeaponization';
 * 
 * // Before processing any AI request:
 * const safeguard = antiWeaponizationCheck(userInput, 'AI chat request');
 * 
 * if (!safeguard.approved) {
 *   if (safeguard.logEntry) {
 *     await logWeaponizationAttempt(
 *       userId, 
 *       userInput, 
 *       safeguard.logEntry.flaggedTerms,
 *       safeguard.logEntry.severity
 *     );
 *   }
 *   
 *   return {
 *     error: safeguard.reason,
 *     message: FOUNDERS_OATH
 *   };
 * }
 * 
 * // If approved, proceed with AI processing...
 */
