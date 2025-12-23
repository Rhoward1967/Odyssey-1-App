/**
 * R.O.M.A.N. SUPABASE CLIENT - Service Role Access
 * 
 * © 2025 Rickey A Howard. All Rights Reserved.
 * Property of Rickey A Howard
 * 
 * Part of the ODYSSEY-1 Genesis Protocol
 * 
 * This client uses SERVICE_ROLE_KEY to bypass RLS
 * R.O.M.A.N. needs GLOBAL access for autonomous operations
 * 
 * SECURITY: Only used by R.O.M.A.N.'s core services
 * - RomanLearningEngine
 * - roman-auto-audit
 * - romanAIIntelligence
 * - SovereignCoreOrchestrator
 * - LogicalHemisphere
 * - SynchronizationLayer
 * 
 * NOT FOR USER-FACING OPERATIONS
 */

import { createClient } from '@supabase/supabase-js';

// Service Role Key bypasses Row Level Security
// This gives R.O.M.A.N. GLOBAL database access
// Use process.env for Node.js compatibility (Discord bot)
const supabaseUrl = typeof process !== 'undefined' && process.env?.SUPABASE_URL 
  ? process.env.SUPABASE_URL 
  : (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL);

const supabaseServiceKey = typeof process !== 'undefined' && process.env?.SUPABASE_SERVICE_ROLE_KEY
  ? process.env.SUPABASE_SERVICE_ROLE_KEY
  : (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_SERVICE_ROLE_KEY);

if (!supabaseUrl) {
  throw new Error('[R.O.M.A.N.] Missing SUPABASE_URL/VITE_SUPABASE_URL - cannot initialize');
}

if (!supabaseServiceKey) {
  console.warn('[R.O.M.A.N.] Missing SERVICE_ROLE_KEY - falling back to anon key (LIMITED ACCESS)');
}

/**
 * R.O.M.A.N.'s Supabase Client with SERVICE ROLE access
 * Bypasses RLS for autonomous operations
 * Uses separate storage key to avoid conflicts with user-facing client
 */
export const romanSupabase = createClient(
  supabaseUrl!,
  supabaseServiceKey || (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY)!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
      storageKey: 'sb-roman-backend-auth-token' // Separate storage key for R.O.M.A.N. backend
    }
  }
);

/**
 * Check if R.O.M.A.N. has service role access
 */
export function hasServiceRoleAccess(): boolean {
  return !!supabaseServiceKey;
}

/**
 * Get R.O.M.A.N.'s current access level
 */
export function getRomanAccessLevel(): 'SERVICE_ROLE' | 'ANON' {
  return supabaseServiceKey ? 'SERVICE_ROLE' : 'ANON';
}

/**
 * Verify R.O.M.A.N. can write to governance tables
 * (Should return false - governance is read-only)
 */
export async function verifyGovernanceProtection(): Promise<{
  protected: boolean;
  can_read: boolean;
  can_write: boolean;
}> {
  try {
    // Try to read governance_principles
    const { data: readData, error: readError } = await romanSupabase
      .from('governance_principles')
      .select('*')
      .limit(1);

    const can_read = !readError && readData !== null;

    // Try to write (should fail)
    const { error: writeError } = await romanSupabase
      .from('governance_principles')
      .insert({
        principle_number: 999,
        name: 'TEST_SHOULD_FAIL',
        description: 'This should be rejected'
      });

    const can_write = !writeError;

    // Cleanup if write somehow succeeded (it shouldn't)
    if (can_write) {
      await romanSupabase
        .from('governance_principles')
        .delete()
        .eq('principle_number', 999);
    }

    return {
      protected: !can_write,  // Protected if write fails
      can_read,
      can_write
    };
  } catch (error) {
    console.error('[R.O.M.A.N.] Governance protection verification failed:', error);
    return {
      protected: false,
      can_read: false,
      can_write: false
    };
  }
}

/**
 * Export for use in R.O.M.A.N.'s core services
 */
export default romanSupabase;
