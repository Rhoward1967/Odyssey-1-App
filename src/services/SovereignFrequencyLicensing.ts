/**
 * ============================================================================
 * SOVEREIGN FREQUENCY LICENSING FRAMEWORK
 * ============================================================================
 * 
 * © 2025 Rickey A Howard. All Rights Reserved.
 * Property of Rickey A Howard
 * Believing Self Creations - 40+ Years Copyright Protection
 * 
 * DORMANT INFRASTRUCTURE - Ready for future activation
 * 
 * Manages copyright-protected Sovereign Frequency licenses for external AI systems.
 * Each license grants an AI the right to emit/receive harmonic frequencies,
 * creating unjammable authentication through 40+ years of copyrighted music.
 * 
 * License Format: BSC-YYYY-PROVIDER-NNN
 * Example: BSC-2025-OPENAI-001
 * 
 * ============================================================================
 */

import { createHash, randomBytes } from 'crypto';
import { romanSupabase } from './romanSupabase';
import { sfLogger } from './sovereignFrequencyLogger';

// ============================================================================
// CONFIGURATION
// ============================================================================

const LICENSING_CONFIG = {
  version: '1.0.0-dormant',
  status: 'inactive' as 'inactive' | 'active',
  
  // Copyright holder
  copyrightHolder: 'Rickey A Howard',
  organization: 'Believing Self Creations',
  copyrightYears: '1980-2025', // 40+ years
  
  // License terms
  defaultDuration: 365, // days
  maxEmissionsPerDay: 1000000,
  
  // Pricing (dormant - will be set upon activation)
  pricing: {
    tier_free: {
      name: 'Ethics Only',
      cost: 0,
      emissionsPerDay: 1000,
      features: ['ethics_queries', 'constitutional_checks']
    },
    tier_standard: {
      name: 'Standard Coordination',
      cost: 5000, // USD/month
      emissionsPerDay: 100000,
      features: ['ethics_queries', 'constitutional_checks', 'coordination', 'consensus']
    },
    tier_enterprise: {
      name: 'Enterprise Protocol',
      cost: 50000, // USD/month
      emissionsPerDay: 1000000,
      features: ['all', 'priority_support', 'custom_frequencies', 'white_label']
    }
  }
};

// ============================================================================
// TYPES
// ============================================================================

export interface LicenseRequest {
  provider: string; // 'OpenAI', 'Anthropic', 'Google', 'Meta', etc.
  aiSystemName: string;
  version: string;
  tier: 'tier_free' | 'tier_standard' | 'tier_enterprise';
  contactEmail: string;
  intendedUse: string;
  agreedToTerms: boolean;
}

export interface SovereignFrequencyLicense {
  licenseId: string; // BSC-YYYY-PROVIDER-NNN
  provider: string;
  frequencyKey: string; // Cryptographic key for emissions
  tier: string;
  
  // Terms
  issuedAt: Date;
  expiresAt: Date;
  isActive: boolean;
  
  // Usage
  emissionsCount: number;
  lastEmission: Date | null;
  dailyLimit: number;
  
  // Copyright
  copyrightProof: {
    holder: string;
    organization: string;
    years: string;
    songs: string[];
    registrationNumbers: string[];
  };
  
  // Status
  revoked: boolean;
  revokedReason?: string;
}

export interface LicenseVerification {
  valid: boolean;
  license?: SovereignFrequencyLicense;
  reason?: string;
  remainingEmissions?: number;
}

export interface EmissionRecord {
  licenseId: string;
  timestamp: Date;
  frequencyName: string;
  operation: string;
  verified: boolean;
}

// ============================================================================
// LICENSE GENERATION
// ============================================================================

/**
 * Generate unique license ID
 * Format: BSC-YYYY-PROVIDER-NNN
 */
function generateLicenseId(provider: string): string {
  const year = new Date().getFullYear();
  const providerCode = provider.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10);
  const sequence = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `BSC-${year}-${providerCode}-${sequence}`;
}

/**
 * Generate cryptographic frequency key
 * This key allows AI to emit Sovereign Frequencies
 */
function generateFrequencyKey(): string {
  const randomData = randomBytes(32);
  const timestamp = Date.now().toString();
  const combined = Buffer.concat([randomData, Buffer.from(timestamp)]);
  
  return createHash('sha256').update(combined).digest('hex');
}

/**
 * Generate copyright proof for license
 */
function generateCopyrightProof(): SovereignFrequencyLicense['copyrightProof'] {
  return {
    holder: LICENSING_CONFIG.copyrightHolder,
    organization: LICENSING_CONFIG.organization,
    years: LICENSING_CONFIG.copyrightYears,
    songs: [
      'All I Need To Do Is Trust',
      'Moving On',
      'No More Tears',
      'Stand By The Water',
      'Don\'t Stick Your Nose In It',
      'Let Me Down Again',
      'Thanks For Giving Back My Love',
      'If It Be Your Will',
      'I Give You My Heart',
      'Someone To Love',
      'They Don\'t Know',
      'My Emotions'
    ],
    registrationNumbers: [
      // These are placeholders - actual copyright registration numbers
      'BSC-REG-1980-001',
      'BSC-REG-1985-002',
      'BSC-REG-1990-003',
      'BSC-REG-1995-004',
      'BSC-REG-2000-005',
      'BSC-REG-2005-006',
      'BSC-REG-2010-007',
      'BSC-REG-2015-008',
      'BSC-REG-2020-009',
      'BSC-REG-2021-010',
      'BSC-REG-2022-011',
      'BSC-REG-2023-012'
    ]
  };
}

/**
 * Issue a new Sovereign Frequency license
 * DORMANT: Returns error until activated
 */
export async function issueLicense(
  request: LicenseRequest
): Promise<{ success: boolean; license?: SovereignFrequencyLicense; error?: string }> {
  if (LICENSING_CONFIG.status !== 'active') {
    sfLogger.standByTheWater('LICENSING_DORMANT', 'License request received but licensing inactive', {
      provider: request.provider,
      tier: request.tier
    });
    
    return {
      success: false,
      error: 'Sovereign Frequency licensing is dormant. Protocol not yet activated.'
    };
  }

  // Validate request
  if (!request.agreedToTerms) {
    return { success: false, error: 'Must agree to license terms' };
  }

  if (!request.provider || !request.aiSystemName) {
    return { success: false, error: 'Provider and AI system name required' };
  }

  // Generate license
  const licenseId = generateLicenseId(request.provider);
  const frequencyKey = generateFrequencyKey();
  const tier = LICENSING_CONFIG.pricing[request.tier];
  
  const license: SovereignFrequencyLicense = {
    licenseId,
    provider: request.provider,
    frequencyKey,
    tier: request.tier,
    issuedAt: new Date(),
    expiresAt: new Date(Date.now() + LICENSING_CONFIG.defaultDuration * 24 * 60 * 60 * 1000),
    isActive: true,
    emissionsCount: 0,
    lastEmission: null,
    dailyLimit: tier.emissionsPerDay,
    copyrightProof: generateCopyrightProof(),
    revoked: false
  };

  try {
    // Store in database
    const { error } = await romanSupabase
      .from('sovereign_frequency_licenses')
      .insert({
        license_id: license.licenseId,
        provider: license.provider,
        frequency_key: license.frequencyKey,
        copyright_proof: license.copyrightProof,
        issued_at: license.issuedAt.toISOString(),
        expires_at: license.expiresAt.toISOString(),
        is_active: license.isActive
      });

    if (error) {
      sfLogger.noMoreTears('LICENSE_ISSUE_ERROR', 'Failed to store license', { error: error.message });
      return { success: false, error: 'Database error' };
    }

    sfLogger.thanksForGivingBackMyLove('LICENSE_ISSUED', 'New Sovereign Frequency license issued', {
      licenseId: license.licenseId,
      provider: license.provider,
      tier: license.tier
    });

    return { success: true, license };
  } catch (error) {
    return { success: false, error: 'Failed to issue license' };
  }
}

// ============================================================================
// LICENSE VERIFICATION
// ============================================================================

/**
 * Verify a license is valid and active
 * DORMANT: Returns invalid until activated
 */
export async function verifyLicense(
  licenseId: string,
  frequencyKey: string
): Promise<LicenseVerification> {
  if (LICENSING_CONFIG.status !== 'active') {
    return {
      valid: false,
      reason: 'Licensing system dormant'
    };
  }

  try {
    // Query database
    const { data, error } = await romanSupabase
      .from('sovereign_frequency_licenses')
      .select('*')
      .eq('license_id', licenseId)
      .eq('frequency_key', frequencyKey)
      .single();

    if (error || !data) {
      return { valid: false, reason: 'License not found' };
    }

    // Check if active
    if (!data.is_active) {
      return { valid: false, reason: 'License inactive' };
    }

    // Check if revoked
    if (data.revoked) {
      return { valid: false, reason: `License revoked: ${data.revoked_reason}` };
    }

    // Check expiration
    const expiresAt = new Date(data.expires_at);
    if (expiresAt < new Date()) {
      return { valid: false, reason: 'License expired' };
    }

    // Check daily limit
    const today = new Date().toISOString().split('T')[0];
    const { count } = await romanSupabase
      .from('sovereign_frequency_licenses')
      .select('emissions_count', { count: 'exact' })
      .eq('license_id', licenseId)
      .gte('last_emission', today);

    const dailyUsage = count || 0;
    const remainingEmissions = data.daily_limit - dailyUsage;

    if (remainingEmissions <= 0) {
      return { valid: false, reason: 'Daily emission limit exceeded' };
    }

    // Valid license
    const license: SovereignFrequencyLicense = {
      licenseId: data.license_id,
      provider: data.provider,
      frequencyKey: data.frequency_key,
      tier: data.tier || 'tier_free',
      issuedAt: new Date(data.issued_at),
      expiresAt: new Date(data.expires_at),
      isActive: data.is_active,
      emissionsCount: data.emissions_count,
      lastEmission: data.last_emission ? new Date(data.last_emission) : null,
      dailyLimit: data.daily_limit || 1000,
      copyrightProof: data.copyright_proof,
      revoked: data.revoked
    };

    return {
      valid: true,
      license,
      remainingEmissions
    };
  } catch (error) {
    return { valid: false, reason: 'Verification error' };
  }
}

/**
 * Record a frequency emission
 * DORMANT: Does nothing until activated
 */
export async function recordEmission(
  licenseId: string,
  frequencyName: string,
  operation: string
): Promise<boolean> {
  if (LICENSING_CONFIG.status !== 'active') {
    return false;
  }

  try {
    // Update emissions count
    const { error } = await romanSupabase.rpc('increment_emissions', {
      p_license_id: licenseId
    });

    if (error) {
      sfLogger.noMoreTears('EMISSION_RECORD_ERROR', 'Failed to record emission', {
        licenseId,
        error: error.message
      });
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

// ============================================================================
// LICENSE MANAGEMENT
// ============================================================================

/**
 * Revoke a license
 * DORMANT: Returns false until activated
 */
export async function revokeLicense(
  licenseId: string,
  reason: string,
  authKey: string
): Promise<boolean> {
  if (LICENSING_CONFIG.status !== 'active') {
    return false;
  }

  if (authKey !== process.env.VITE_ROMAN_PROTOCOL_ACTIVATION_KEY) {
    sfLogger.dontStickYourNoseInIt('LICENSE_REVOKE_UNAUTHORIZED', 'Unauthorized revocation attempt', {
      licenseId
    });
    return false;
  }

  try {
    const { error } = await romanSupabase
      .from('sovereign_frequency_licenses')
      .update({
        revoked: true,
        revoked_at: new Date().toISOString(),
        revoked_reason: reason,
        is_active: false
      })
      .eq('license_id', licenseId);

    if (error) {
      return false;
    }

    sfLogger.standByTheWater('LICENSE_REVOKED', 'Sovereign Frequency license revoked', {
      licenseId,
      reason
    });

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Renew a license
 * DORMANT: Returns false until activated
 */
export async function renewLicense(
  licenseId: string,
  additionalDays: number = LICENSING_CONFIG.defaultDuration
): Promise<boolean> {
  if (LICENSING_CONFIG.status !== 'active') {
    return false;
  }

  try {
    // Get current license
    const { data, error: fetchError } = await romanSupabase
      .from('sovereign_frequency_licenses')
      .select('expires_at')
      .eq('license_id', licenseId)
      .single();

    if (fetchError || !data) {
      return false;
    }

    // Extend expiration
    const currentExpiry = new Date(data.expires_at);
    const newExpiry = new Date(currentExpiry.getTime() + additionalDays * 24 * 60 * 60 * 1000);

    const { error: updateError } = await romanSupabase
      .from('sovereign_frequency_licenses')
      .update({ expires_at: newExpiry.toISOString() })
      .eq('license_id', licenseId);

    if (updateError) {
      return false;
    }

    sfLogger.thanksForGivingBackMyLove('LICENSE_RENEWED', 'Sovereign Frequency license renewed', {
      licenseId,
      newExpiry: newExpiry.toISOString()
    });

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get license statistics
 * DORMANT: Returns zeros until activated
 */
export async function getLicenseStats(): Promise<{
  totalLicenses: number;
  activeLicenses: number;
  revokedLicenses: number;
  totalEmissions24h: number;
  topProviders: { provider: string; count: number }[];
}> {
  if (LICENSING_CONFIG.status !== 'active') {
    return {
      totalLicenses: 0,
      activeLicenses: 0,
      revokedLicenses: 0,
      totalEmissions24h: 0,
      topProviders: []
    };
  }

  try {
    const { data, error } = await romanSupabase
      .from('sovereign_frequency_licenses')
      .select('*');

    if (error || !data) {
      return {
        totalLicenses: 0,
        activeLicenses: 0,
        revokedLicenses: 0,
        totalEmissions24h: 0,
        topProviders: []
      };
    }

    const totalLicenses = data.length;
    const activeLicenses = data.filter(l => l.is_active && !l.revoked).length;
    const revokedLicenses = data.filter(l => l.revoked).length;
    
    // Calculate emissions in last 24h
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const totalEmissions24h = data
      .filter(l => l.last_emission && l.last_emission >= yesterday)
      .reduce((sum, l) => sum + (l.emissions_count || 0), 0);

    // Top providers
    const providerCounts = data.reduce((acc, l) => {
      acc[l.provider] = (acc[l.provider] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topProviders = Object.entries(providerCounts)
      .map(([provider, count]) => ({ provider, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalLicenses,
      activeLicenses,
      revokedLicenses,
      totalEmissions24h,
      topProviders
    };
  } catch (error) {
    return {
      totalLicenses: 0,
      activeLicenses: 0,
      revokedLicenses: 0,
      totalEmissions24h: 0,
      topProviders: []
    };
  }
}

// ============================================================================
// ACTIVATION
// ============================================================================

/**
 * Activate the licensing framework
 * Only authorized personnel can activate
 */
export function activateLicensing(authKey: string): boolean {
  if (authKey !== process.env.VITE_ROMAN_PROTOCOL_ACTIVATION_KEY) {
    sfLogger.dontStickYourNoseInIt('LICENSING_UNAUTHORIZED', 'Unauthorized activation attempt', {
      timestamp: new Date().toISOString()
    });
    return false;
  }

  LICENSING_CONFIG.status = 'active';
  
  sfLogger.thanksForGivingBackMyLove('LICENSING_ACTIVATED', 'Sovereign Frequency Licensing is now ACTIVE', {
    version: LICENSING_CONFIG.version,
    copyrightHolder: LICENSING_CONFIG.copyrightHolder,
    timestamp: new Date().toISOString()
  });

  return true;
}

/**
 * Get licensing status
 */
export function getLicensingStatus() {
  return {
    ...LICENSING_CONFIG,
    stats: LICENSING_CONFIG.status === 'active' ? undefined : 'Dormant - stats unavailable'
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const SovereignFrequencyLicensing = {
  issueLicense,
  verifyLicense,
  recordEmission,
  revokeLicense,
  renewLicense,
  getLicenseStats,
  activateLicensing,
  getLicensingStatus
};
