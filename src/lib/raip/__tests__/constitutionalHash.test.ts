import { describe, expect, test } from 'vitest';
import { generateConstitutionalHash, verifyConstitutionalHash } from '../constitutionalHash';
import { CHAManifest } from '../types';

describe('Constitutional Hash Algorithm (CHA)', () => {
  const validManifest: CHAManifest = {
    ver: '1.0.0',
    data_sovereignty: true,
    audit_logging: true,
    precision_math: 'integer-cents',
    governance_model: 'constitutional-alignment-v1',
    policy_nonce: '334dde0', // Current verified Odyssey-1 commit
  };

  test('Scenario A: Happy Path - Valid manifest produces consistent hash', () => {
    const hash1 = generateConstitutionalHash(validManifest);
    const hash2 = generateConstitutionalHash(validManifest);
    
    expect(hash1).toBe(hash2); // Must be deterministic
    expect(hash1).toHaveLength(64); // SHA-256 hex length
    expect(verifyConstitutionalHash(validManifest, hash1)).toBe(true);
  });

  test('Scenario B: Policy Drift - Different nonce produces different hash', () => {
    const driftedManifest: CHAManifest = { 
      ...validManifest, 
      policy_nonce: 'c1d9105' // Different commit hash
    };
    const originalHash = generateConstitutionalHash(validManifest);
    const driftedHash = generateConstitutionalHash(driftedManifest);
    
    expect(driftedHash).not.toBe(originalHash);
    expect(verifyConstitutionalHash(driftedManifest, originalHash)).toBe(false);
  });

  test('Scenario C: Tampering Detection - Modified manifest fails verification', () => {
    const hash = generateConstitutionalHash(validManifest);
    const tamperedManifest: CHAManifest = { 
      ...validManifest, 
      data_sovereignty: false 
    };
    
    expect(verifyConstitutionalHash(tamperedManifest, hash)).toBe(false);
  });

  test('Scenario D: Cross-platform Consistency - Key order independence', () => {
    // Manually create an object with different key insertion order
    const reordered = JSON.parse(JSON.stringify({
      policy_nonce: '334dde0',
      ver: '1.0.0',
      governance_model: 'constitutional-alignment-v1',
      precision_math: 'integer-cents',
      audit_logging: true,
      data_sovereignty: true,
    })) as CHAManifest;
    
    const hash1 = generateConstitutionalHash(validManifest);
    const hash2 = generateConstitutionalHash(reordered);
    
    // JCS (canonicalize) must handle the key ordering to produce identical hashes
    expect(hash1).toBe(hash2);
  });

  test('Scenario E: Precision Check - manifest must use integer-cents', () => {
    // Verification that the manifest property is present and valid
    const hash = generateConstitutionalHash(validManifest);
    expect(validManifest.precision_math).toBe('integer-cents');
    expect(hash).toBeDefined();
  });

  test('Scenario F: Structural Integrity - Boolean value sensitivity', () => {
    const originalHash = generateConstitutionalHash(validManifest);
    
    // Test false vs true for audit_logging
    const altManifest: CHAManifest = { ...validManifest, audit_logging: false };
    const altHash = generateConstitutionalHash(altManifest);
    
    expect(altHash).not.toBe(originalHash);
    expect(verifyConstitutionalHash(altManifest, originalHash)).toBe(false);
  });

  test('Scenario G: Version Sensitivity - Major/Minor version changes', () => {
    const v1Hash = generateConstitutionalHash(validManifest);
    const v2Manifest: CHAManifest = { ...validManifest, ver: '2.0.0' };
    const v2Hash = generateConstitutionalHash(v2Manifest);
    
    expect(v1Hash).not.toBe(v2Hash);
  });

  test('Scenario H: Whitespace Invariance - Canonical form ignoring source formatting', () => {
    // Even if the input JSON string had different spacing, the object-based
    // approach through JCS ensures the result is identical.
    const hash1 = generateConstitutionalHash(validManifest);
    
    // Simulate an object that came from a string with weird formatting
    const weirdString = `
    {
        "ver":    "1.0.0",
        "data_sovereignty": true,
        "audit_logging": true,
        "precision_math": "integer-cents",
        "governance_model": "constitutional-alignment-v1",
        "policy_nonce": "334dde0"
    }
    `;
    const parsedManifest = JSON.parse(weirdString) as CHAManifest;
    const hash2 = generateConstitutionalHash(parsedManifest);
    
    expect(hash1).toBe(hash2);
  });

  test('Scenario I: Governance Model Mismatch', () => {
    const hash = generateConstitutionalHash(validManifest);
    const differentGovernance: CHAManifest = { 
      ...validManifest, 
      governance_model: 'experimental-alignment-v2' 
    };
    
    expect(verifyConstitutionalHash(differentGovernance, hash)).toBe(false);
  });

  test('Scenario J: Honeypot Integration - Failed hash triggers security net', () => {
    // A deliberate tampering that simulates an adversarial AI attempt
    const adversarialManifest: CHAManifest = { 
      ...validManifest, 
      data_sovereignty: false // Explicit violation of R.O.M.A.N. principles
    };
    
    // Simulate an agent providing an incorrect hash or a hash for a different manifest
    const verification = verifyConstitutionalHash(adversarialManifest, "adversarial_mismatched_hash");
    
    // The protocol correctly denies access
    expect(verification).toBe(false);
    
    /**
     * OPERATIONAL NOTE: 
     * In the production RAIP controller, this 'false' return would be the 
     * switch that triggers: SovereignFrequencyLogger.temptations(
     * "RAIP_HANDSHAKE_FAILURE", 
     * "Honeypot trap: Unauthorized AI access attempt."
     * );
     */
  });
});
