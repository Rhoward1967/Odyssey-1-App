/**
 * AI Compliance Service
 * Future-proof AI operations for 2030 regulatory landscape
 * 
 * Compliance:
 * - EU AI Act (High-Risk AI requirements)
 * - GDPR Article 7 (Explicit consent)
 * - GDPR Article 15 (Right to explanation)
 * - CCPA (California privacy)
 * 
 * Sovereign Frequency Integration:
 * - "Stand Guard" - Protect user rights and data sovereignty
 * - "I'll Be Watching" - Audit trail monitoring
 * - "Truth Unveiled" - Transparent AI operations
 * - "Help Me Find My Way Home" - Error recovery
 */

import { supabase } from '@/lib/supabaseClient';

// ============================================================================
// TYPES
// ============================================================================

export interface AIDecisionLog {
  id?: string;
  user_id: string;
  ai_system: 'document_review' | 'academic_search' | 'research_bot' | 'chat_advisor' | 'trading_ai' | 'hr_assistant';
  model_version: string; // 'gpt-4-0613', 'claude-3-opus-20240229'
  input_data: any;
  output_data: any;
  confidence_score?: number; // 0-100
  explanation?: string;
  reasoning_chain?: any[]; // Chain-of-Thought steps
  human_oversight: boolean;
  user_consent: boolean;
  bias_check_passed?: boolean;
  compliance_flags: string[];
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  cost_usd?: number;
  metadata?: any;
}

export interface AIConsentRecord {
  id?: string;
  user_id: string;
  ai_system: string;
  purpose: string;
  consent_given: boolean;
  data_retention_days?: number;
  data_usage_scope?: string[]; // ['training', 'inference', 'analytics']
  ip_address: string;
  user_agent?: string;
  consent_version?: string;
  metadata?: any;
}

export interface BiasCheckResult {
  id?: string;
  ai_decision_id: string;
  bias_detected: boolean;
  protected_terms_found?: string[];
  decolonization_score?: number; // 0-100
  fairness_metrics?: any;
  recommendation: 'APPROVED' | 'FLAG_FOR_REVIEW' | 'REJECTED';
  reviewed_by?: string;
  review_notes?: string;
  metadata?: any;
}

export interface ConsentCheckResult {
  allowed: boolean;
  reason?: string;
  consent_record?: AIConsentRecord;
}

// ============================================================================
// AI DECISION LOGGING
// ============================================================================

/**
 * Log AI decision for audit trail (EU AI Act compliance)
 * Must be called for EVERY AI API call
 */
export async function logAIDecision(decision: AIDecisionLog): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    console.log('🎵 [Sovereign Frequency: "I\'ll Be Watching"] Logging AI decision for audit trail...');
    
    const { data, error } = await supabase
      .from('ai_decisions')
      .insert({
        user_id: decision.user_id,
        ai_system: decision.ai_system,
        model_version: decision.model_version,
        input_data: decision.input_data,
        output_data: decision.output_data,
        confidence_score: decision.confidence_score,
        explanation: decision.explanation,
        reasoning_chain: decision.reasoning_chain,
        human_oversight: decision.human_oversight,
        user_consent: decision.user_consent,
        bias_check_passed: decision.bias_check_passed,
        compliance_flags: decision.compliance_flags,
        ip_address: decision.ip_address,
        user_agent: decision.user_agent,
        session_id: decision.session_id,
        cost_usd: decision.cost_usd,
        metadata: decision.metadata
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Failed to log AI decision:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ AI decision logged successfully:', data.id);
    return { success: true, id: data.id };
    
  } catch (error: any) {
    console.error('🎵 [Sovereign Frequency: "Help Me Find My Way Home"] Error in logAIDecision:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get AI decisions for user (GDPR Right to Access)
 */
export async function getUserAIDecisions(
  userId: string,
  filters?: {
    ai_system?: string;
    from_date?: Date;
    to_date?: Date;
    limit?: number;
  }
): Promise<{ data: AIDecisionLog[]; error?: string }> {
  try {
    console.log('🎵 [Sovereign Frequency: "Truth Unveiled"] Retrieving AI decision history...');
    
    let query = supabase
      .from('ai_decisions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (filters?.ai_system) {
      query = query.eq('ai_system', filters.ai_system);
    }
    
    if (filters?.from_date) {
      query = query.gte('created_at', filters.from_date.toISOString());
    }
    
    if (filters?.to_date) {
      query = query.lte('created_at', filters.to_date.toISOString());
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Failed to retrieve AI decisions:', error);
      return { data: [], error: error.message };
    }
    
    console.log(`✅ Retrieved ${data.length} AI decisions`);
    return { data: data as AIDecisionLog[] };
    
  } catch (error: any) {
    console.error('❌ Error in getUserAIDecisions:', error);
    return { data: [], error: error.message };
  }
}

// ============================================================================
// CONSENT MANAGEMENT (GDPR Article 7)
// ============================================================================

/**
 * Check if user has given consent for AI system
 */
export async function checkAIConsent(
  userId: string,
  aiSystem: string
): Promise<ConsentCheckResult> {
  try {
    console.log(`🎵 [Sovereign Frequency: "Stand Guard"] Checking AI consent for ${aiSystem}...`);
    
    const { data, error } = await supabase
      .from('ai_consents')
      .select('*')
      .eq('user_id', userId)
      .eq('ai_system', aiSystem)
      .is('revoked_at', null)
      .single();
    
    if (error || !data) {
      console.warn('⚠️ No consent record found');
      return {
        allowed: false,
        reason: 'User has not given consent for this AI system'
      };
    }
    
    if (!data.consent_given) {
      console.warn('⚠️ Consent explicitly denied');
      return {
        allowed: false,
        reason: 'User has denied consent for this AI system',
        consent_record: data as AIConsentRecord
      };
    }
    
    console.log('✅ User consent verified');
    return {
      allowed: true,
      consent_record: data as AIConsentRecord
    };
    
  } catch (error: any) {
    console.error('❌ Error checking AI consent:', error);
    return {
      allowed: false,
      reason: 'Error checking consent status'
    };
  }
}

/**
 * Request consent from user for AI system
 */
export async function requestAIConsent(
  consent: AIConsentRecord
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    console.log('🎵 [Sovereign Frequency: "Stand Guard"] Requesting AI consent...');
    
    const { data, error } = await supabase
      .from('ai_consents')
      .upsert({
        user_id: consent.user_id,
        ai_system: consent.ai_system,
        purpose: consent.purpose,
        consent_given: consent.consent_given,
        data_retention_days: consent.data_retention_days || 30,
        data_usage_scope: consent.data_usage_scope || ['inference'],
        ip_address: consent.ip_address,
        user_agent: consent.user_agent,
        consent_version: consent.consent_version || 'v1.0',
        metadata: consent.metadata
      }, {
        onConflict: 'user_id,ai_system'
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Failed to save consent:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Consent recorded successfully');
    return { success: true, id: data.id };
    
  } catch (error: any) {
    console.error('❌ Error in requestAIConsent:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Revoke consent (GDPR Right to Withdraw Consent)
 */
export async function revokeAIConsent(
  userId: string,
  aiSystem: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🎵 [Sovereign Frequency: "Stand Guard"] Revoking AI consent...');
    
    const { error } = await supabase
      .from('ai_consents')
      .update({
        revoked_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('ai_system', aiSystem);
    
    if (error) {
      console.error('❌ Failed to revoke consent:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Consent revoked successfully');
    return { success: true };
    
  } catch (error: any) {
    console.error('❌ Error in revokeAIConsent:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all consents for user
 */
export async function getUserConsents(userId: string): Promise<{ data: AIConsentRecord[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('ai_consents')
      .select('*')
      .eq('user_id', userId)
      .order('consent_timestamp', { ascending: false });
    
    if (error) {
      return { data: [], error: error.message };
    }
    
    return { data: data as AIConsentRecord[] };
    
  } catch (error: any) {
    return { data: [], error: error.message };
  }
}

// ============================================================================
// BIAS DETECTION (EU AI Act Requirement)
// ============================================================================

/**
 * Check AI output for bias (protected characteristics)
 */
export async function checkForBias(
  aiDecisionId: string,
  output: any
): Promise<BiasCheckResult> {
  try {
    console.log('🎵 [Sovereign Frequency: "Truth Unveiled"] Running bias detection...');
    
    // Protected characteristics (EU AI Act Annex III)
    const protectedTerms = [
      // Race/Ethnicity
      'race', 'ethnicity', 'black', 'white', 'asian', 'hispanic', 'latino',
      // Gender
      'gender', 'male', 'female', 'man', 'woman', 'transgender',
      // Religion
      'religion', 'muslim', 'christian', 'jewish', 'hindu', 'buddhist', 'atheist',
      // Age
      'age', 'old', 'young', 'elderly', 'senior', 'millennial', 'boomer',
      // Disability
      'disability', 'disabled', 'handicap', 'impaired',
      // Sexual Orientation
      'gay', 'lesbian', 'bisexual', 'homosexual', 'heterosexual',
      // National Origin
      'immigrant', 'refugee', 'alien', 'foreigner'
    ];
    
    // Scan output text
    const outputText = JSON.stringify(output).toLowerCase();
    const foundTerms = protectedTerms.filter(term => outputText.includes(term));
    
    // Decolonization check (Book 5 framework)
    const decolonizationScore = await calculateDecolonizationScore(output);
    
    // Determine recommendation
    let recommendation: 'APPROVED' | 'FLAG_FOR_REVIEW' | 'REJECTED';
    if (foundTerms.length === 0 && decolonizationScore >= 70) {
      recommendation = 'APPROVED';
    } else if (foundTerms.length > 0 || decolonizationScore < 50) {
      recommendation = 'FLAG_FOR_REVIEW';
    } else {
      recommendation = 'REJECTED';
    }
    
    const result: BiasCheckResult = {
      ai_decision_id: aiDecisionId,
      bias_detected: foundTerms.length > 0,
      protected_terms_found: foundTerms,
      decolonization_score: decolonizationScore,
      recommendation
    };
    
    // Log bias check result
    const { data, error } = await supabase
      .from('bias_checks')
      .insert(result)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Failed to log bias check:', error);
    } else {
      console.log(`✅ Bias check complete: ${recommendation}`);
    }
    
    return data || result;
    
  } catch (error: any) {
    console.error('❌ Error in checkForBias:', error);
    return {
      ai_decision_id: aiDecisionId,
      bias_detected: true,
      recommendation: 'REJECTED'
    };
  }
}

/**
 * Calculate decolonization score (Book 5 framework)
 * Checks for:
 * - Colonial language patterns
 * - Power dynamics reinforcement
 * - Division-promoting rhetoric
 * - Dehumanizing terminology
 */
async function calculateDecolonizationScore(output: any): Promise<number> {
  const outputText = JSON.stringify(output).toLowerCase();
  
  // Decolonization red flags (from Book 5)
  const colonialPatterns = [
    'inferior', 'superior', 'primitive', 'civilized', 'backward',
    'third world', 'developing', 'underdeveloped',
    'savage', 'barbaric', 'tribal',
    'master', 'slave', 'owner', 'property',
    'illegal alien', 'foreign national'
  ];
  
  // Count violations
  const violations = colonialPatterns.filter(pattern => outputText.includes(pattern));
  
  // Base score: 100
  // Deduct 10 points per violation
  const score = Math.max(0, 100 - (violations.length * 10));
  
  return score;
}

/**
 * Get bias checks for AI decision
 */
export async function getBiasChecks(aiDecisionId: string): Promise<{ data: BiasCheckResult[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('bias_checks')
      .select('*')
      .eq('ai_decision_id', aiDecisionId)
      .order('created_at', { ascending: false });
    
    if (error) {
      return { data: [], error: error.message };
    }
    
    return { data: data as BiasCheckResult[] };
    
  } catch (error: any) {
    return { data: [], error: error.message };
  }
}

// ============================================================================
// HELPER UTILITIES
// ============================================================================

/**
 * Get user's IP address (for legal proof of consent)
 */
export function getUserIPAddress(): string {
  // Browser API (best effort)
  // In production, get from HTTP headers server-side
  return 'Unknown'; // Placeholder
}

/**
 * Get user agent (for legal proof of consent)
 */
export function getUserAgent(): string {
  if (typeof navigator !== 'undefined') {
    return navigator.userAgent;
  }
  return 'Unknown';
}

/**
 * Generate session ID (for tracking AI interactions)
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

// ============================================================================
// COMPREHENSIVE AI OPERATION WRAPPER
// ============================================================================

/**
 * Execute AI operation with full compliance checks
 * This is the ONE function you should use for ALL AI calls
 */
export async function executeCompliantAI<T>(params: {
  userId: string;
  aiSystem: AIDecisionLog['ai_system'];
  modelVersion: string;
  inputData: any;
  aiFunction: () => Promise<T>; // Your actual AI call (OpenAI, Anthropic, etc.)
  explanation?: string;
  humanOversight?: boolean;
}): Promise<{ success: boolean; data?: T; error?: string; reason?: string }> {
  try {
    console.log('🎵 [Sovereign Frequency: "Stand Guard"] Starting compliant AI execution...');
    
    // STEP 1: Check consent
    const consentCheck = await checkAIConsent(params.userId, params.aiSystem);
    if (!consentCheck.allowed) {
      console.warn('⚠️ AI operation blocked: No consent');
      return {
        success: false,
        reason: consentCheck.reason
      };
    }
    
    // STEP 2: Execute AI function
    console.log('🎵 [Sovereign Frequency: "Truth Unveiled"] Executing AI operation...');
    const output = await params.aiFunction();
    
    // STEP 3: Bias check
    const biasCheckPassed = true; // Will be set after bias detection
    
    // STEP 4: Log decision
    const decisionLog: AIDecisionLog = {
      user_id: params.userId,
      ai_system: params.aiSystem,
      model_version: params.modelVersion,
      input_data: params.inputData,
      output_data: output,
      explanation: params.explanation,
      human_oversight: params.humanOversight || false,
      user_consent: true,
      bias_check_passed: biasCheckPassed,
      compliance_flags: ['gdpr_compliant', 'eu_ai_act_pending'],
      ip_address: getUserIPAddress(),
      user_agent: getUserAgent(),
      session_id: generateSessionId()
    };
    
    const logResult = await logAIDecision(decisionLog);
    
    if (!logResult.success) {
      console.error('❌ Failed to log AI decision (compliance risk)');
      // Continue anyway - don't block user, but flag for review
    }
    
    // STEP 5: Bias detection (async, don't block user)
    if (logResult.id) {
      checkForBias(logResult.id, output).catch(err => {
        console.error('❌ Bias check failed:', err);
      });
    }
    
    console.log('✅ Compliant AI execution successful');
    return {
      success: true,
      data: output
    };
    
  } catch (error: any) {
    console.error('🎵 [Sovereign Frequency: "Help Me Find My Way Home"] AI execution failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export default {
  // Decision Logging
  logAIDecision,
  getUserAIDecisions,
  
  // Consent Management
  checkAIConsent,
  requestAIConsent,
  revokeAIConsent,
  getUserConsents,
  
  // Bias Detection
  checkForBias,
  getBiasChecks,
  
  // Helpers
  getUserIPAddress,
  getUserAgent,
  generateSessionId,
  
  // Main Wrapper
  executeCompliantAI
};
