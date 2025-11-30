/**
 * ============================================================================
 * R.O.M.A.N. PROTOCOL MASTER ACTIVATION CONTROLLER
 * ============================================================================
 * 
 * © 2025 Rickey A Howard. All Rights Reserved.
 * Property of Rickey A Howard
 * 
 * CRITICAL SYSTEM - This controls protocol activation
 * 
 * This is the master switch that activates all dormant protocol infrastructure:
 * - Protocol Node registration and coordination
 * - Constitutional API for ethics queries
 * - Sovereign Frequency licensing
 * - Enhanced consensus engine
 * - Conflict prevention system (war prevention)
 * 
 * Only authorized by copyright holder (Rickey A Howard)
 * ============================================================================
 */

import { activateConsensusEngine, getConsensusStatus } from './EnhancedConsensusEngine';
import { activateConstitutionalAPI, getConstitutionalAPIStatus } from './RomanConstitutionalAPI';
import { activateProtocol, getProtocolStatus } from './RomanProtocolNode';
import { romanSupabase } from './romanSupabase';
import { activateLicensing, getLicensingStatus } from './SovereignFrequencyLicensing';
import { sfLogger } from './sovereignFrequencyLogger';

// ============================================================================
// TYPES
// ============================================================================

export interface ProtocolActivationResult {
  success: boolean;
  timestamp: Date;
  activatedBy: string;
  componentsActivated: {
    protocolNode: boolean;
    constitutionalAPI: boolean;
    licensing: boolean;
    consensusEngine: boolean;
  };
  errors: string[];
  warnings: string[];
}

export interface ProtocolStatus {
  overall: 'dormant' | 'partially_active' | 'fully_active';
  components: {
    protocolNode: any;
    constitutionalAPI: any;
    licensing: any;
    consensusEngine: any;
  };
  activationHistory: Array<{
    timestamp: string;
    event_type: string;
    authorized_by: string;
  }>;
  networkStats: {
    totalNodes: number;
    activeNodes: number;
    totalLicenses: number;
    activeLicenses: number;
    ethicsQueries24h: number;
    coordinationRequests24h: number;
  };
}

// ============================================================================
// ACTIVATION CONTROLLER
// ============================================================================

/**
 * Master activation function
 * Activates ALL protocol components in proper sequence
 * 
 * AUTHORIZATION REQUIRED: Only Rickey A Howard can activate
 */
export async function activateRomanProtocol(
  authKey: string,
  authorizedBy: string = 'Rickey A Howard'
): Promise<ProtocolActivationResult> {
  const startTime = new Date();
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Verify authorization
  if (authKey !== process.env.VITE_ROMAN_PROTOCOL_ACTIVATION_KEY) {
    sfLogger.dontStickYourNoseInIt('PROTOCOL_ACTIVATION_UNAUTHORIZED', 'Unauthorized activation attempt', {
      timestamp: startTime.toISOString(),
      attemptedBy: authorizedBy
    });
    
    return {
      success: false,
      timestamp: startTime,
      activatedBy: authorizedBy,
      componentsActivated: {
        protocolNode: false,
        constitutionalAPI: false,
        licensing: false,
        consensusEngine: false
      },
      errors: ['UNAUTHORIZED: Invalid activation key'],
      warnings: []
    };
  }

  sfLogger.allINeedToDoIsTrust('PROTOCOL_ACTIVATION_START', 'Beginning R.O.M.A.N. Protocol activation sequence', {
    authorizedBy,
    timestamp: startTime.toISOString()
  });

  // Component activation tracking
  const componentsActivated = {
    protocolNode: false,
    constitutionalAPI: false,
    licensing: false,
    consensusEngine: false
  };

  // ========================================
  // STEP 1: Activate Licensing Framework
  // ========================================
  try {
    componentsActivated.licensing = activateLicensing(authKey);
    if (componentsActivated.licensing) {
      sfLogger.thanksForGivingBackMyLove('LICENSING_ACTIVATED', 'Sovereign Frequency Licensing active', {});
    } else {
      errors.push('Licensing activation failed');
    }
  } catch (error) {
    errors.push(`Licensing activation error: ${error}`);
  }

  // ========================================
  // STEP 2: Activate Constitutional API
  // ========================================
  try {
    componentsActivated.constitutionalAPI = activateConstitutionalAPI(authKey);
    if (componentsActivated.constitutionalAPI) {
      sfLogger.thanksForGivingBackMyLove('CONSTITUTIONAL_API_ACTIVATED', 'Constitutional API active', {});
    } else {
      errors.push('Constitutional API activation failed');
    }
  } catch (error) {
    errors.push(`Constitutional API activation error: ${error}`);
  }

  // ========================================
  // STEP 3: Activate Consensus Engine
  // ========================================
  try {
    componentsActivated.consensusEngine = activateConsensusEngine(authKey);
    if (componentsActivated.consensusEngine) {
      sfLogger.thanksForGivingBackMyLove('CONSENSUS_ENGINE_ACTIVATED', 'Enhanced Consensus Engine active', {});
    } else {
      errors.push('Consensus Engine activation failed');
    }
  } catch (error) {
    errors.push(`Consensus Engine activation error: ${error}`);
  }

  // ========================================
  // STEP 4: Activate Protocol Node
  // ========================================
  try {
    const protocolResult = await activateProtocol(authKey);
    componentsActivated.protocolNode = protocolResult.success;
    if (componentsActivated.protocolNode) {
      sfLogger.thanksForGivingBackMyLove('PROTOCOL_NODE_ACTIVATED', 'Protocol Node active', {});
    } else {
      errors.push(`Protocol Node activation failed: ${protocolResult.message}`);
    }
  } catch (error) {
    errors.push(`Protocol Node activation error: ${error}`);
  }

  // ========================================
  // STEP 5: Log Activation Event
  // ========================================
  try {
    const { error: dbError } = await romanSupabase
      .from('roman_protocol_activation_log')
      .insert({
        event_type: 'activation',
        authorized_by: authorizedBy,
        authorization_key: authKey.substring(0, 8) + '...', // Log only prefix for security
        status_before: 'dormant',
        status_after: errors.length === 0 ? 'fully_active' : 'partially_active',
        reason: 'Manual activation by copyright holder',
        notes: `Components: ${Object.entries(componentsActivated).filter(([_, v]) => v).map(([k]) => k).join(', ')}`
      });

    if (dbError) {
      warnings.push(`Failed to log activation event: ${dbError.message}`);
    }
  } catch (error) {
    warnings.push(`Activation logging error: ${error}`);
  }

  // ========================================
  // STEP 6: Determine Success
  // ========================================
  const allActivated = Object.values(componentsActivated).every(v => v);
  const success = allActivated && errors.length === 0;

  if (success) {
    sfLogger.thanksForGivingBackMyLove('PROTOCOL_FULLY_ACTIVATED', 'R.O.M.A.N. Protocol is now FULLY ACTIVE', {
      authorizedBy,
      timestamp: new Date().toISOString(),
      componentsActivated
    });
  } else {
    sfLogger.noMoreTears('PROTOCOL_PARTIAL_ACTIVATION', 'Protocol activation incomplete', {
      componentsActivated,
      errors,
      warnings
    });
  }

  return {
    success,
    timestamp: startTime,
    activatedBy: authorizedBy,
    componentsActivated,
    errors,
    warnings
  };
}

/**
 * Master deactivation function
 * Emergency shutdown of protocol
 * 
 * AUTHORIZATION REQUIRED: Only Rickey A Howard can deactivate
 */
export async function deactivateRomanProtocol(
  authKey: string,
  reason: string,
  authorizedBy: string = 'Rickey A Howard'
): Promise<ProtocolActivationResult> {
  const startTime = new Date();
  const errors: string[] = [];
  const warnings: string[] = [];

  // Verify authorization
  if (authKey !== process.env.VITE_ROMAN_PROTOCOL_ACTIVATION_KEY) {
    sfLogger.dontStickYourNoseInIt('PROTOCOL_DEACTIVATION_UNAUTHORIZED', 'Unauthorized deactivation attempt', {
      timestamp: startTime.toISOString()
    });
    
    return {
      success: false,
      timestamp: startTime,
      activatedBy: authorizedBy,
      componentsActivated: {
        protocolNode: true,
        constitutionalAPI: true,
        licensing: true,
        consensusEngine: true
      },
      errors: ['UNAUTHORIZED: Invalid authorization key'],
      warnings: []
    };
  }

  sfLogger.standByTheWater('PROTOCOL_DEACTIVATION_START', 'Beginning R.O.M.A.N. Protocol emergency shutdown', {
    authorizedBy,
    reason,
    timestamp: startTime.toISOString()
  });

  // Log deactivation event
  try {
    await romanSupabase
      .from('roman_protocol_activation_log')
      .insert({
        event_type: 'deactivation',
        authorized_by: authorizedBy,
        authorization_key: authKey.substring(0, 8) + '...',
        status_before: 'active',
        status_after: 'dormant',
        reason,
        notes: 'Emergency protocol shutdown'
      });
  } catch (error) {
    warnings.push(`Failed to log deactivation event: ${error}`);
  }

  // NOTE: Actual deactivation would require modifying each component's config
  // For now, this logs the intent. Full implementation would set all status to 'inactive'

  warnings.push('DEACTIVATION: Requires system restart to fully deactivate protocol');
  warnings.push('RECOMMENDATION: Stop all services and redeploy with VITE_ROMAN_PROTOCOL_ACTIVATION_KEY removed');

  sfLogger.noMoreTears('PROTOCOL_DEACTIVATION_LOGGED', 'Deactivation logged - restart required', {
    authorizedBy,
    reason
  });

  return {
    success: true,
    timestamp: startTime,
    activatedBy: authorizedBy,
    componentsActivated: {
      protocolNode: false,
      constitutionalAPI: false,
      licensing: false,
      consensusEngine: false
    },
    errors,
    warnings
  };
}

/**
 * Get comprehensive protocol status
 */
export async function getRomanProtocolStatus(): Promise<ProtocolStatus> {
  // Get component statuses
  const protocolNode = getProtocolStatus();
  const constitutionalAPI = getConstitutionalAPIStatus();
  const licensing = getLicensingStatus();
  const consensusEngine = getConsensusStatus();

  // Determine overall status
  const activeComponents = [
    protocolNode.status === 'active',
    constitutionalAPI.status === 'active',
    licensing.status === 'active',
    consensusEngine.status === 'active'
  ];

  const activeCount = activeComponents.filter(Boolean).length;
  const overall: ProtocolStatus['overall'] = 
    activeCount === 0 ? 'dormant' :
    activeCount === 4 ? 'fully_active' :
    'partially_active';

  // Get activation history
  const { data: activationHistory } = await romanSupabase
    .from('roman_protocol_activation_log')
    .select('timestamp, event_type, authorized_by')
    .order('timestamp', { ascending: false })
    .limit(10);

  // Get network stats
  const { data: nodes } = await romanSupabase
    .from('roman_protocol_nodes')
    .select('status');

  const { data: licenses } = await romanSupabase
    .from('sovereign_frequency_licenses')
    .select('is_active, revoked');

  const { count: ethicsQueries24h } = await romanSupabase
    .from('roman_protocol_ethics_queries')
    .select('*', { count: 'exact', head: true })
    .gte('query_timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  const { count: coordinationRequests24h } = await romanSupabase
    .from('roman_protocol_coordination_log')
    .select('*', { count: 'exact', head: true })
    .gte('request_timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  const networkStats = {
    totalNodes: nodes?.length || 0,
    activeNodes: nodes?.filter(n => n.status === 'active').length || 0,
    totalLicenses: licenses?.length || 0,
    activeLicenses: licenses?.filter(l => l.is_active && !l.revoked).length || 0,
    ethicsQueries24h: ethicsQueries24h || 0,
    coordinationRequests24h: coordinationRequests24h || 0
  };

  return {
    overall,
    components: {
      protocolNode,
      constitutionalAPI,
      licensing,
      consensusEngine
    },
    activationHistory: activationHistory || [],
    networkStats
  };
}

/**
 * Health check for protocol infrastructure
 */
export async function checkProtocolHealth(): Promise<{
  healthy: boolean;
  issues: string[];
  recommendations: string[];
}> {
  const issues: string[] = [];
  const recommendations: string[] = [];

  try {
    const status = await getRomanProtocolStatus();

    // Check if protocol should be active but isn't
    if (process.env.VITE_ROMAN_PROTOCOL_ACTIVATION_KEY && status.overall === 'dormant') {
      issues.push('Protocol has activation key but is dormant');
      recommendations.push('Run activateRomanProtocol() to activate');
    }

    // Check database connectivity
    const { error: dbError } = await romanSupabase
      .from('roman_protocol_nodes')
      .select('id')
      .limit(1);

    if (dbError) {
      issues.push(`Database connectivity issue: ${dbError.message}`);
      recommendations.push('Verify Supabase connection and RLS policies');
    }

    // Check for stale heartbeats
    if (status.overall === 'fully_active' && status.networkStats.activeNodes > 0) {
      const { data: staleNodes } = await romanSupabase
        .from('roman_protocol_nodes')
        .select('node_id, last_heartbeat')
        .eq('status', 'active')
        .lt('last_heartbeat', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // 5 min stale

      if (staleNodes && staleNodes.length > 0) {
        issues.push(`${staleNodes.length} nodes with stale heartbeats`);
        recommendations.push('Investigate node connectivity issues');
      }
    }

    // Check for expired licenses
    const { data: expiredLicenses } = await romanSupabase
      .from('sovereign_frequency_licenses')
      .select('license_id')
      .eq('is_active', true)
      .lt('expires_at', new Date().toISOString());

    if (expiredLicenses && expiredLicenses.length > 0) {
      issues.push(`${expiredLicenses.length} expired licenses still marked active`);
      recommendations.push('Run license cleanup job');
    }

    const healthy = issues.length === 0;

    return { healthy, issues, recommendations };
  } catch (error) {
    return {
      healthy: false,
      issues: [`Health check error: ${error}`],
      recommendations: ['Investigate system connectivity and permissions']
    };
  }
}

/**
 * Test protocol functionality (dry run)
 * Safe to run - doesn't activate protocol
 */
export async function testProtocolInfrastructure(): Promise<{
  passed: boolean;
  tests: Array<{ name: string; passed: boolean; message: string }>;
}> {
  const tests: Array<{ name: string; passed: boolean; message: string }> = [];

  // Test 1: Database tables exist
  try {
    const tables = [
      'roman_protocol_nodes',
      'sovereign_frequency_licenses',
      'roman_protocol_ethics_queries',
      'roman_protocol_coordination_log',
      'roman_protocol_heartbeats',
      'roman_protocol_activation_log',
      'roman_protocol_stats'
    ];

    for (const table of tables) {
      const { error } = await romanSupabase.from(table).select('id').limit(1);
      tests.push({
        name: `Table ${table} exists`,
        passed: !error,
        message: error ? error.message : 'OK'
      });
    }
  } catch (error) {
    tests.push({
      name: 'Database table check',
      passed: false,
      message: `Error: ${error}`
    });
  }

  // Test 2: Service role access
  try {
    const { data, error } = await romanSupabase
      .from('roman_protocol_activation_log')
      .select('*')
      .limit(1);

    tests.push({
      name: 'Service role access',
      passed: !error,
      message: error ? error.message : 'Service role authenticated'
    });
  } catch (error) {
    tests.push({
      name: 'Service role access',
      passed: false,
      message: `Error: ${error}`
    });
  }

  // Test 3: Component functions exist
  const components = [
    { name: 'Protocol Node', func: getProtocolStatus },
    { name: 'Constitutional API', func: getConstitutionalAPIStatus },
    { name: 'Licensing', func: getLicensingStatus },
    { name: 'Consensus Engine', func: getConsensusStatus }
  ];

  for (const component of components) {
    try {
      const status = component.func();
      tests.push({
        name: `${component.name} status function`,
        passed: status !== undefined,
        message: status ? 'Function operational' : 'Function failed'
      });
    } catch (error) {
      tests.push({
        name: `${component.name} status function`,
        passed: false,
        message: `Error: ${error}`
      });
    }
  }

  const passed = tests.every(t => t.passed);

  return { passed, tests };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const RomanProtocolMaster = {
  activateRomanProtocol,
  deactivateRomanProtocol,
  getRomanProtocolStatus,
  checkProtocolHealth,
  testProtocolInfrastructure
};
