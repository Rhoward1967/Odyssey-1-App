import crypto from 'crypto';
import { CHAManifest } from './types';
// Note: Requires 'canonicalize' package (RFC 8785)
// npm install canonicalize
import canonicalize from 'canonicalize';

/**
 * Generates a deterministic SHA-256 hash of a governance manifest
 * using JSON Canonicalization Scheme (RFC 8785).
 * 
 * @param manifest The governance compliance manifest
 * @returns A hex-encoded SHA-256 hash
 */
export function generateConstitutionalHash(manifest: CHAManifest): string {
  // 1. Canonicalize the JSON object (ensures deterministic key ordering)
  const canonical = canonicalize(manifest);
  
  if (!canonical) {
    throw new Error("Failed to canonicalize manifest");
  }

  // 2. Compute SHA-256 hash
  return crypto
    .createHash('sha256')
    .update(canonical)
    .digest('hex');
}

/**
 * Verifies if a provided hash matches the manifest.
 * 
 * @param manifest The manifest provided by the agent
 * @param providedHash The hash provided for verification
 * @returns boolean
 */
export function verifyConstitutionalHash(
  manifest: CHAManifest,
  providedHash: string
): boolean {
  try {
    const computedHash = generateConstitutionalHash(manifest);
    return computedHash === providedHash;
  } catch (err) {
    return false;
  }
}
