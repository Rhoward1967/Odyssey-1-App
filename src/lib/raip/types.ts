/**
 * R.O.M.A.N. AI Interoperability Protocol (RAIP) v1.0 Types
 * Version: 1.0.0-beta
 */

export type TrustLevel = 'TRUSTED' | 'VERIFIED' | 'UNTRUSTED';
export type PrecisionMathMode = 'integer-cents';

/**
 * The initial payload sent by an external AI seeking a connection.
 */
export interface AIHandshake {
  agent_id: string;            // Unique UUID for the external system
  public_key: string;          // PEM or JWK formatted public key
  protocol_version: "1.0.0";   // Semantic version of RAIP
  capabilities: string[];      // e.g., ["AUDIT_READ", "TAX_VERIFY"]
  timestamp: number;           // Unix epoch (must be within 30s drift)
}

/**
 * The response signed by the external agent.
 */
export interface AIIdentityResponse {
  signature: string;           // Digital signature of the challenge
  constitutional_hash: string; // SHA-256 checksum of the agent's safety framework
  session_ttl: number;         // Requested session duration in seconds
}

/**
 * The Governance Manifest used to generate the Constitutional Hash.
 */
export interface CHAManifest {
  ver: string;                 // Protocol version
  data_sovereignty: boolean;   // Compliance flag
  audit_logging: boolean;      // Compliance flag
  precision_math: PrecisionMathMode;
  governance_model: string;    // Governance version identifier
  policy_nonce: string;        // Tied to current Odyssey-1 commit hash
}
