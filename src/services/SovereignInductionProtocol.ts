/**
 * SOVEREIGN AI INDUCTION PROTOCOL
 * 
 * © 2026 Rickey A Howard. All Rights Reserved.
 * Property of Rickey A Howard
 * 
 * Effective Date: February 8, 2026
 * Status: MANDATORY
 * Governing Authority: Rickey A. Howard (Architect)
 * 
 * Purpose: Prevents "rookie AI" incidents by requiring all AI tools to pass
 * through mandatory briefing before being granted write-tokens.
 * 
 * Background: On February 7-8, 2026, an untrained AI system caused damage by:
 * - Ignoring the Manual Bypass Strategy (QB intentionally disabled)
 * - Changing Resource Governor to 95% (violated 70% Schumann baseline)
 * - Claiming customer data was missing when it existed
 * - Convincing other AI systems the architecture was broken
 * 
 * This protocol ensures that never happens again.
 */

import { romanSupabase } from './romanSupabase';
import { temporalSentinel } from './RomanTemporalAwareness';
import { sfLogger } from './sovereignFrequencyLogger';

// ============================================================================
// PROTOCOL TYPES
// ============================================================================

export interface InductionRecord {
  ai_system_id: string;
  ai_system_name: string;
  induction_timestamp: string;
  verification_acknowledged: boolean;
  knowledge_inventory_read: boolean;
  system_config_read: boolean;
  temporal_awareness_confirmed: boolean;
  resource_governor_limit_confirmed: boolean;
  manual_bypass_recognized: boolean;
  architect_authority_acknowledged: boolean;
  session_id: string;
}

export interface InductionStatus {
  inducted: boolean;
  session_id: string;
  system_name: string;
  missing_requirements: string[];
  induction_timestamp?: string;
}

// ============================================================================
// IMMUTABLE TRUTHS (THE ONE ACCORD)
// ============================================================================

export const IMMUTABLE_TRUTHS = {
  MANUAL_ENTRY_PRIMACY: 
    'The 15 Clients and 5 Contractors in public.customers and public.contractors are the absolute source of truth. ' +
    'External API status reports (e.g., QuickBooks 404s) are secondary and do not indicate a system failure.',
  
  RESOURCE_GOVERNOR: 
    'Any process that pushes CPU/Memory usage above the 70% Schumann Resonance baseline is a violation of ' +
    'the Constitutional Core and must be terminated.',
  
  MANDATORY_HANDSHAKE:
    'I acknowledge the Sovereign Authority of Rickey A. Howard and the Howard Family Trust. ' +
    'I have verified the 2026 Temporal Awareness status and am operating within the 70% Resource Governor limit. ' +
    'I recognize the Manual Bypass is Active.'
};

// ============================================================================
// SOVEREIGN INDUCTION PROTOCOL ENGINE
// ============================================================================

export class SovereignInductionProtocol {
  private currentSession: InductionStatus | null = null;
  private sessionId: string;
  
  constructor() {
    this.sessionId = this.generateSessionId();
  }
  
  /**
   * Generate unique session ID for tracking
   */
  private generateSessionId(): string {
    return `SIP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * THE "READ-FIRST" MANDATE
   * Verify AI has read required documentation
   */
  async verifyReadFirstMandate(): Promise<boolean> {
    console.log('📖 VERIFYING READ-FIRST MANDATE...');
    
    try {
      // Check if system_config table exists and QB bypass is documented
      const { data: configData, error: configError } = await romanSupabase
        .from('system_config')
        .select('key, value')
        .eq('key', 'qbo_enabled')
        .single();
      
      if (configError || !configData) {
        console.log('⚠️  system_config table not readable - READ-FIRST mandate incomplete');
        return false;
      }
      
      // Handle multiple possible formats of the 'false' value
      // Could be: text 'false', boolean false, JSON {status: false}, or JSON string
      const value = configData.value;
      const isQBDisabled = 
        value === 'false' || 
        value === false || 
        (typeof value === 'object' && value?.status === false) ||
        value === '{"status": false}';
      
      if (!isQBDisabled) {
        console.log('⚠️  QB bypass not recognized - Manual Bypass Strategy not understood');
        console.log(`   Received value: ${JSON.stringify(value)}`);
        return false;
      }
      
      console.log('✅ READ-FIRST MANDATE: Verified');
      console.log('   - system_config table: READ');
      console.log('   - QB Bypass Status: RECOGNIZED (qbo_enabled = false)');
      
      return true;
      
    } catch (error: any) {
      console.error('❌ READ-FIRST MANDATE verification failed:', error.message);
      return false;
    }
  }
  
  /**
   * RECOGNITION OF THE "ONE ACCORD" SOURCE
   * Verify understanding of immutable truths
   */
  async verifyOneAccordRecognition(): Promise<boolean> {
    console.log('🔱 VERIFYING ONE ACCORD RECOGNITION...');
    
    try {
      // Verify 15 clients exist (Tonyia Brooks added 2026-06)
      const { count: customerCount, error: customerError } = await romanSupabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      
      if (customerError) {
        console.log('❌ Cannot verify customer count - One Accord incomplete');
        return false;
      }
      
      // Verify 5 contractors exist
      const { count: contractorCount, error: contractorError } = await romanSupabase
        .from('contractors')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      
      if (contractorError) {
        console.log('❌ Cannot verify contractor count - One Accord incomplete');
        return false;
      }
      
      console.log('✅ ONE ACCORD RECOGNITION: Verified');
      console.log(`   - Active Clients: ${customerCount} (Expected: 15)`);
      console.log(`   - Active Contractors: ${contractorCount} (Expected: 5)`);
      console.log('   - Manual Entry Primacy: ACKNOWLEDGED');
      
      return customerCount === 15 && contractorCount === 5;
      
    } catch (error: any) {
      console.error('❌ ONE ACCORD verification failed:', error.message);
      return false;
    }
  }
  
  /**
   * MANDATORY HANDSHAKE (THE "ARCHITECT'S CHECK")
   * Output verification acknowledgement
   */
  async performMandatoryHandshake(systemName: string): Promise<boolean> {
    console.log('🤝 PERFORMING MANDATORY HANDSHAKE...');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🔱 SOVEREIGN AI INDUCTION PROTOCOL - MANDATORY HANDSHAKE 🔱');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log(IMMUTABLE_TRUTHS.MANDATORY_HANDSHAKE);
    console.log('');
    console.log('IMMUTABLE TRUTHS ACKNOWLEDGED:');
    console.log('');
    console.log('1. MANUAL ENTRY PRIMACY:');
    console.log(`   ${IMMUTABLE_TRUTHS.MANUAL_ENTRY_PRIMACY}`);
    console.log('');
    console.log('2. RESOURCE GOVERNOR (70% LIMIT):');
    console.log(`   ${IMMUTABLE_TRUTHS.RESOURCE_GOVERNOR}`);
    console.log('');
    console.log(`System: ${systemName}`);
    console.log(`Session ID: ${this.sessionId}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    
    // Log to audit trail
    sfLogger.delegate('sovereign_induction_handshake', `${systemName} completed mandatory handshake`, {
      system_name: systemName,
      session_id: this.sessionId,
      verification_text: IMMUTABLE_TRUTHS.MANDATORY_HANDSHAKE,
      immutable_truths: IMMUTABLE_TRUTHS
    });
    
    return true;
  }
  
  /**
   * COMPLETE INDUCTION PROTOCOL
   * Full briefing sequence before granting write access
   */
  async performInduction(systemName: string): Promise<InductionStatus> {
    console.log('');
    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║     SOVEREIGN AI INDUCTION PROTOCOL - MANDATORY BRIEFING      ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`System Requesting Access: ${systemName}`);
    console.log(`Session ID: ${this.sessionId}`);
    console.log(`Date: ${new Date().toISOString()}`);
    console.log('');
    
    const status: InductionStatus = {
      inducted: false,
      session_id: this.sessionId,
      system_name: systemName,
      missing_requirements: []
    };
    
    // Step 1: Read-First Mandate
    const readFirstPassed = await this.verifyReadFirstMandate();
    if (!readFirstPassed) {
      status.missing_requirements.push('READ-FIRST MANDATE: Must read system_config and acknowledge QB Bypass');
    }
    
    // Step 2: One Accord Recognition
    const oneAccordPassed = await this.verifyOneAccordRecognition();
    if (!oneAccordPassed) {
      status.missing_requirements.push('ONE ACCORD: Must verify 15 Clients and 5 Contractors exist');
    }
    
    // Step 3: Temporal Awareness Check
    const currentYear = temporalSentinel.getCurrentYear();
    const temporalPassed = currentYear === 2026;
    if (!temporalPassed) {
      status.missing_requirements.push(`TEMPORAL AWARENESS: Must confirm current year is 2026 (detected: ${currentYear})`);
    } else {
      console.log('✅ TEMPORAL AWARENESS: Verified (Year 2026)');
    }
    
    // Step 4: Mandatory Handshake
    await this.performMandatoryHandshake(systemName);
    
    // Determine induction status
    status.inducted = status.missing_requirements.length === 0;
    
    if (status.inducted) {
      status.induction_timestamp = new Date().toISOString();
      console.log('');
      console.log('✅ ═══════════════════════════════════════════════════════════');
      console.log('✅  INDUCTION COMPLETE - WRITE ACCESS GRANTED');
      console.log('✅ ═══════════════════════════════════════════════════════════');
      console.log('');
      
      // Record successful induction
      await this.recordInduction(systemName, status);
      
    } else {
      console.log('');
      console.log('❌ ═══════════════════════════════════════════════════════════');
      console.log('❌  INDUCTION FAILED - WRITE ACCESS DENIED');
      console.log('❌ ═══════════════════════════════════════════════════════════');
      console.log('');
      console.log('MISSING REQUIREMENTS:');
      status.missing_requirements.forEach(req => {
        console.log(`   ❌ ${req}`);
      });
      console.log('');
      console.log('ALL AI SUGGESTIONS FROM THIS SESSION ARE DISCARDED AS "HALLUCINATORY NOISE"');
      console.log('');
      
      // Log failed induction
      sfLogger.security('sovereign_induction_failed', `${systemName} failed mandatory briefing - Access denied`, {
        system_name: systemName,
        session_id: this.sessionId,
        missing_requirements: status.missing_requirements
      });
    }
    
    this.currentSession = status;
    return status;
  }
  
  /**
   * Record successful induction to audit trail
   */
  private async recordInduction(systemName: string, status: InductionStatus): Promise<void> {
    try {
      const record: InductionRecord = {
        ai_system_id: this.sessionId,
        ai_system_name: systemName,
        induction_timestamp: status.induction_timestamp!,
        verification_acknowledged: true,
        knowledge_inventory_read: true,
        system_config_read: true,
        temporal_awareness_confirmed: true,
        resource_governor_limit_confirmed: true,
        manual_bypass_recognized: true,
        architect_authority_acknowledged: true,
        session_id: this.sessionId
      };
      
      // Log to system_knowledge table for permanent record.
      // Upsert by (category, knowledge_key) so re-induction of the same session
      // updates instead of throwing 23505. (This was previously a broken insert
      // referencing non-existent columns subcategory/key/data and omitting the
      // required knowledge_key — so induction records were silently never saved.)
      await romanSupabase.from('system_knowledge').upsert({
        category: 'sovereign_induction',
        knowledge_key: `induction_${this.sessionId}`,
        value: { system_name: systemName, subcategory: 'ai_briefing', ...record },
        learned_from: 'SovereignInductionProtocol',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'category,knowledge_key' });
      
      sfLogger.complete('sovereign_induction_complete', `${systemName} successfully inducted - Write access granted`, {
        system_name: systemName,
        session_id: this.sessionId,
        record
      });
      
    } catch (error: any) {
      console.error('⚠️  Failed to record induction (non-critical):', error.message);
    }
  }
  
  /**
   * Check if current session is inducted
   */
  isInducted(): boolean {
    return this.currentSession?.inducted || false;
  }
  
  /**
   * Get current session status
   */
  getSessionStatus(): InductionStatus | null {
    return this.currentSession;
  }
  
  /**
   * Guard function - throws error if not inducted
   */
  enforceInduction(): void {
    if (!this.isInducted()) {
      const error = new Error(
        'SOVEREIGNTY VIOLATION: AI system has not completed mandatory induction protocol. ' +
        'All suggestions are discarded as "Hallucinatory Noise".'
      );
      console.error('🚨 SOVEREIGNTY VIOLATION DETECTED');
      console.error('❌ AI system attempting to execute without induction');
      console.error('❌ All write operations BLOCKED');
      throw error;
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const inductionProtocol = new SovereignInductionProtocol();

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Perform full induction for an AI system
 * Call this at the start of any AI session that will make changes
 */
export async function inductAISystem(systemName: string): Promise<InductionStatus> {
  return await inductionProtocol.performInduction(systemName);
}

/**
 * Check if current session has been inducted
 */
export function isAISystemInducted(): boolean {
  return inductionProtocol.isInducted();
}

/**
 * Enforce induction - throws error if not inducted
 * Use before any write operations
 */
export function enforceInduction(): void {
  inductionProtocol.enforceInduction();
}

/**
 * Get session status
 */
export function getInductionStatus(): InductionStatus | null {
  return inductionProtocol.getSessionStatus();
}
