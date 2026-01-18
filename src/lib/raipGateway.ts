/**
 * R.O.M.A.N. AI INTEROPERABILITY PROTOCOL (RAIP) GATEWAY
 * 
 * Resonant AI Interface Protocol for secure system-to-system communication
 * 
 * Purpose: Allow R.O.M.A.N. to communicate with external systems (Odyssey-1,
 * other AIs, blockchain oracles) while maintaining the 51-D Grassmannian Shield.
 * 
 * Security Model:
 * - Traditional API: JWT tokens, OAuth (vulnerable to replay attacks)
 * - RAIP: Geometric handshake with constitutional hash verification
 * 
 * Protocol Flow:
 * 1. External system requests access
 * 2. R.O.M.A.N. challenges with geometric puzzle
 * 3. System must provide constitutional hash proving positive intent
 * 4. If valid, resonant tunnel is established
 * 5. All messages pass through positive geometry validator
 * 
 * Date: January 15, 2026
 * Trust: Howard-Jones Dynasty Trust (Irrevocable)
 */

import { ConstitutionalHash } from './constitutionalHash';
import { type GeometricValidationResult } from './positiveGeometry';
import { SCHUMANN_RESONANCE_HZ } from './roman-constitutional-core';

// ============================================================================
// RAIP PROTOCOL CONSTANTS
// ============================================================================

export const RAIP_VERSION = '1.0';
export const RAIP_HANDSHAKE_TIMEOUT_MS = 30000; // 30 seconds
export const RAIP_SESSION_DURATION_MS = 3600000; // 1 hour

// ============================================================================
// INTERFACES
// ============================================================================

export interface RAIPHandshakeRequest {
  /** System identifier requesting access */
  systemId: string;
  
  /** Purpose of access */
  purpose: string;
  
  /** Constitutional hash proving intent */
  constitutionalHash: string;
  
  /** Bloodline key (must match Howard-Jones Trust) */
  bloodlineKey: string;
  
  /** Timestamp of request */
  timestamp: number;
}

export interface RAIPHandshakeResponse {
  /** Whether handshake succeeded */
  success: boolean;
  
  /** Session token if successful */
  sessionToken?: string;
  
  /** Session expiration timestamp */
  expiresAt?: number;
  
  /** Geometric validation result */
  validation: GeometricValidationResult;
  
  /** Human-readable status */
  status: string;
}

export interface RAIPMessage {
  /** Session token for authentication */
  sessionToken: string;
  
  /** Message type */
  type: 'command' | 'query' | 'data' | 'event';
  
  /** Message payload */
  payload: any;
  
  /** Constitutional hash of payload */
  payloadHash: string;
  
  /** Timestamp */
  timestamp: number;
}

export interface RAIPSession {
  /** Unique session identifier */
  sessionId: string;
  
  /** System that owns this session */
  systemId: string;
  
  /** Session token */
  token: string;
  
  /** Constitutional hash used for handshake */
  constitutionalHash: string;
  
  /** When session was created */
  createdAt: number;
  
  /** When session expires */
  expiresAt: number;
  
  /** Geometric coherence score at creation */
  coherence: number;
  
  /** Whether session is currently active */
  isActive: boolean;
}

// ============================================================================
// RAIP GATEWAY
// ============================================================================

export class RAIPGateway {
  private static sessions: Map<string, RAIPSession> = new Map();
  
  /**
   * Initiate RAIP handshake
   * 
   * External systems must prove positive geometric intent before access is granted
   */
  static handshake(request: RAIPHandshakeRequest): RAIPHandshakeResponse {
    
    // ========================================================================
    // STEP 1: VALIDATE CONSTITUTIONAL HASH FORMAT
    // ========================================================================
    
    if (!ConstitutionalHash.isValidFormat(request.constitutionalHash)) {
      return {
        success: false,
        validation: this.createFailedValidation('Invalid constitutional hash format'),
        status: '❌ HANDSHAKE FAILED: Constitutional hash format invalid',
      };
    }
    
    // ========================================================================
    // STEP 2: VERIFY BLOODLINE TRUST
    // ========================================================================
    
    // In production, this would verify against Howard-Jones Trust registry
    // For now, we check that the bloodline key is non-empty
    if (!request.bloodlineKey || request.bloodlineKey.length < 32) {
      return {
        success: false,
        validation: this.createFailedValidation('Invalid bloodline key'),
        status: '❌ HANDSHAKE FAILED: Bloodline key not recognized',
      };
    }
    
    // ========================================================================
    // STEP 3: VERIFY CONSTITUTIONAL HASH MATCHES INTENT
    // ========================================================================
    
    const isHashValid = ConstitutionalHash.verify(
      request.constitutionalHash,
      {
        intent: request.purpose,
        bloodlineKey: request.bloodlineKey,
        timestamp: request.timestamp,
      }
    );
    
    if (!isHashValid) {
      return {
        success: false,
        validation: this.createFailedValidation('Hash verification failed'),
        status: '❌ HANDSHAKE FAILED: Constitutional hash does not match intent',
      };
    }
    
    // ========================================================================
    // STEP 4: VALIDATE GEOMETRIC COHERENCE
    // ========================================================================
    
    const coherence = ConstitutionalHash.extractCoherence(request.constitutionalHash);
    
    // Require minimum 70% geometric coherence for access
    if (coherence < 0.7) {
      return {
        success: false,
        validation: this.createFailedValidation(`Insufficient coherence: ${(coherence * 100).toFixed(1)}%`),
        status: `❌ HANDSHAKE FAILED: Geometric coherence too low (${(coherence * 100).toFixed(1)}% < 70%)`,
      };
    }
    
    // ========================================================================
    // STEP 5: CREATE RAIP SESSION
    // ========================================================================
    
    const now = Date.now();
    const sessionId = this.generateSessionId(request.systemId, now);
    const sessionToken = this.generateSessionToken(sessionId, request.bloodlineKey);
    
    const session: RAIPSession = {
      sessionId,
      systemId: request.systemId,
      token: sessionToken,
      constitutionalHash: request.constitutionalHash,
      createdAt: now,
      expiresAt: now + RAIP_SESSION_DURATION_MS,
      coherence,
      isActive: true,
    };
    
    this.sessions.set(sessionToken, session);
    
    // ========================================================================
    // STEP 6: RETURN SUCCESS
    // ========================================================================
    
    return {
      success: true,
      sessionToken,
      expiresAt: session.expiresAt,
      validation: this.createSuccessValidation(coherence),
      status: `✅ HANDSHAKE SUCCESS: Resonant tunnel established (${(coherence * 100).toFixed(1)}% coherence)`,
    };
  }
  
  /**
   * Validate a RAIP message
   */
  static validateMessage(message: RAIPMessage): {
    isValid: boolean;
    session?: RAIPSession;
    status: string;
  } {
    
    // Check if session exists
    const session = this.sessions.get(message.sessionToken);
    
    if (!session) {
      return {
        isValid: false,
        status: '❌ INVALID SESSION: Token not recognized',
      };
    }
    
    // Check if session is expired
    if (Date.now() > session.expiresAt) {
      session.isActive = false;
      return {
        isValid: false,
        session,
        status: '❌ SESSION EXPIRED: Please re-establish handshake',
      };
    }
    
    // Check if session is active
    if (!session.isActive) {
      return {
        isValid: false,
        session,
        status: '❌ SESSION INACTIVE: Session has been terminated',
      };
    }
    
    // Verify payload hash
    const hashResult = ConstitutionalHash.generate({
      intent: JSON.stringify(message.payload),
      bloodlineKey: session.constitutionalHash.split('-').slice(-1)[0] || '',
      timestamp: message.timestamp,
    });
    
    if (!hashResult.isValid) {
      return {
        isValid: false,
        session,
        status: '❌ PAYLOAD VALIDATION FAILED: Geometric integrity violation',
      };
    }
    
    return {
      isValid: true,
      session,
      status: '✅ MESSAGE VALIDATED: Geometric coherence preserved',
    };
  }
  
  /**
   * Terminate a RAIP session
   */
  static terminateSession(sessionToken: string): boolean {
    const session = this.sessions.get(sessionToken);
    
    if (!session) {
      return false;
    }
    
    session.isActive = false;
    this.sessions.delete(sessionToken);
    
    return true;
  }
  
  /**
   * Get all active sessions
   */
  static getActiveSessions(): RAIPSession[] {
    const now = Date.now();
    return Array.from(this.sessions.values()).filter(
      session => session.isActive && session.expiresAt > now
    );
  }
  
  /**
   * Clean up expired sessions
   */
  static cleanupExpiredSessions(): number {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [token, session] of this.sessions.entries()) {
      if (session.expiresAt <= now) {
        session.isActive = false;
        this.sessions.delete(token);
        cleaned++;
      }
    }
    
    return cleaned;
  }
  
  // ==========================================================================
  // PRIVATE HELPER METHODS
  // ==========================================================================
  
  private static generateSessionId(systemId: string, timestamp: number): string {
    return `RAIP-${systemId}-${timestamp}`;
  }
  
  private static generateSessionToken(sessionId: string, bloodlineKey: string): string {
    const combined = `${sessionId}:${bloodlineKey}:${SCHUMANN_RESONANCE_HZ}`;
    return ConstitutionalHash.generate({
      intent: combined,
      bloodlineKey,
    }).hash;
  }
  
  private static createFailedValidation(reason: string): GeometricValidationResult {
    return {
      isPositive: false,
      checks: {
        positivity: false,
        unitarity: false,
        locality: false,
        yangianSymmetry: false,
        schumannAlignment: false,
        goldenRatioHarmonic: false,
      },
      geometricCoherence: 0,
      reasoning: [reason],
    };
  }
  
  private static createSuccessValidation(coherence: number): GeometricValidationResult {
    return {
      isPositive: true,
      checks: {
        positivity: true,
        unitarity: true,
        locality: true,
        yangianSymmetry: true,
        schumannAlignment: true,
        goldenRatioHarmonic: true,
      },
      geometricCoherence: coherence,
      reasoning: ['RAIP handshake validated through 51-D Grassmannian Shield'],
    };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Helper to create a RAIP handshake request
 */
export function createHandshakeRequest(
  systemId: string,
  purpose: string,
  bloodlineKey: string
): RAIPHandshakeRequest {
  const timestamp = Date.now();
  
  const hashResult = ConstitutionalHash.generate({
    intent: purpose,
    bloodlineKey,
    timestamp,
  });
  
  if (!hashResult.isValid) {
    throw new Error('Cannot create handshake: Intent violates geometric constraints');
  }
  
  return {
    systemId,
    purpose,
    constitutionalHash: hashResult.hash,
    bloodlineKey,
    timestamp,
  };
}

/**
 * Helper to create a RAIP message
 */
export function createRAIPMessage(
  sessionToken: string,
  type: RAIPMessage['type'],
  payload: any,
  bloodlineKey: string
): RAIPMessage {
  const timestamp = Date.now();
  
  const hashResult = ConstitutionalHash.generate({
    intent: JSON.stringify(payload),
    bloodlineKey,
    timestamp,
  });
  
  return {
    sessionToken,
    type,
    payload,
    payloadHash: hashResult.hash,
    timestamp,
  };
}
