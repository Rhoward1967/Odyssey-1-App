/**
 * R.O.M.A.N. Auto-Rollback System
 * 
 * Provides automated rollback capabilities with Constitutional AI validation.
 * Ensures all rollback operations comply with the Four Immutable Laws.
 */

import {
    ActionData,
    isActionCompliant,
    SCHUMANN_RESONANCE_HZ
} from '@/lib/roman-constitutional-core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// =====================================================
// TYPES
// =====================================================

export interface Deployment {
  id: number;
  deployment_id: string;
  environment: 'staging' | 'production';
  version: string;
  git_commit: string;
  git_branch: string;
  deployed_by?: string;
  deployed_at: string;
  status: 'pending' | 'in_progress' | 'success' | 'failed' | 'rolled_back';
  rollback_from?: string;
  health_check_passed: boolean;
  health_check_details?: Record<string, any>;
  constitutional_validation?: Record<string, any>;
  metadata?: Record<string, any>;
  completed_at?: string;
  rolled_back_at?: string;
}

export interface RollbackEvent {
  id: number;
  event_id: string;
  deployment_id: string;
  trigger_type: 'automatic' | 'manual' | 'constitutional_violation';
  trigger_reason: string;
  initiated_by?: string;
  initiated_at: string;
  status: 'pending' | 'in_progress' | 'success' | 'failed' | 'aborted';
  rollback_plan?: Record<string, any>;
  rollback_steps?: Record<string, any>[];
  constitutional_validation?: Record<string, any>;
  completed_at?: string;
  metadata?: Record<string, any>;
}

export interface RollbackTarget {
  deployment_id: string;
  version: string;
  git_commit: string;
  deployed_at: string;
  health_check_passed: boolean;
}

export interface SystemSnapshot {
  snapshot_id: string;
  deployment_id: string;
  snapshot_type: 'pre_deployment' | 'post_deployment' | 'pre_rollback';
  database_schema_hash?: string;
  table_counts?: Record<string, number>;
  key_metrics?: Record<string, any>;
  environment_config?: Record<string, any>;
  created_at: string;
}

export interface RollbackResult {
  success: boolean;
  event_id?: string;
  target_deployment?: RollbackTarget;
  steps_executed: RollbackStep[];
  error?: string;
  constitutional_validation?: {
    compliant: boolean;
    violations: string[];
    warnings: string[];
  };
}

export interface RollbackStep {
  step: string;
  status: 'pending' | 'success' | 'failed' | 'skipped';
  started_at?: string;
  completed_at?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface HealthCheck {
  healthy: boolean;
  error_rate_per_minute: number;
  recent_errors: number;
  database_connections: number;
  active_queries: number;
  timestamp: string;
}

// =====================================================
// ROLLBACK SERVICE
// =====================================================

export class RollbackService {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Execute automated rollback with Constitutional validation
   */
  async executeRollback(
    deploymentId: string,
    triggerReason: string,
    initiatedBy?: string
  ): Promise<RollbackResult> {
    const steps: RollbackStep[] = [];

    try {
      // Step 1: Validate with Constitutional Core
      const constitutionalCheck = await this.validateRollbackConstitutionally(
        deploymentId,
        triggerReason
      );
      
      steps.push({
        step: 'Constitutional validation',
        status: constitutionalCheck.compliant ? 'success' : 'failed',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        metadata: constitutionalCheck
      });

      if (!constitutionalCheck.compliant) {
        await this.logRollbackEvent(
          deploymentId,
          'constitutional_violation',
          `Rollback blocked: ${constitutionalCheck.violations.join(', ')}`,
          initiatedBy
        );

        return {
          success: false,
          steps_executed: steps,
          error: 'Constitutional validation failed',
          constitutional_validation: constitutionalCheck
        };
      }

      // Step 2: Find rollback target
      const target = await this.getRollbackTarget(deploymentId);
      
      steps.push({
        step: 'Identify rollback target',
        status: target ? 'success' : 'failed',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        metadata: target || undefined
      });

      if (!target) {
        return {
          success: false,
          steps_executed: steps,
          error: 'No valid rollback target found'
        };
      }

      // Step 3: Record rollback event
      const eventId = await this.logRollbackEvent(
        deploymentId,
        initiatedBy ? 'manual' : 'automatic',
        triggerReason,
        initiatedBy
      );

      steps.push({
        step: 'Record rollback event',
        status: 'success',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        metadata: { event_id: eventId }
      });

      // Step 4: Create pre-rollback snapshot
      const snapshotId = await this.createSnapshot(deploymentId, 'pre_rollback');
      
      steps.push({
        step: 'Create pre-rollback snapshot',
        status: snapshotId ? 'success' : 'failed',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        metadata: { snapshot_id: snapshotId }
      });

      // Step 5: Execute rollback (in production, would trigger CI/CD)
      const rollbackSuccess = await this.triggerRollbackExecution(
        deploymentId,
        target.git_commit,
        eventId
      );

      steps.push({
        step: 'Execute rollback',
        status: rollbackSuccess ? 'success' : 'failed',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        metadata: { target_commit: target.git_commit }
      });

      // Step 6: Update rollback event status
      await this.updateRollbackEventStatus(
        eventId,
        rollbackSuccess ? 'success' : 'failed',
        steps
      );

      return {
        success: rollbackSuccess,
        event_id: eventId,
        target_deployment: target,
        steps_executed: steps,
        constitutional_validation: constitutionalCheck
      };

    } catch (error) {
      console.error('Rollback execution error:', error);
      
      return {
        success: false,
        steps_executed: steps,
        error: error instanceof Error ? error.message : 'Unknown error',
        constitutional_validation: undefined
      };
    }
  }

  /**
   * Validate rollback operation against Constitutional Core
   */
  private async validateRollbackConstitutionally(
    deploymentId: string,
    reason: string
  ): Promise<{
    compliant: boolean;
    violations: string[];
    warnings: string[];
  }> {
    // Get current system entropy (error rate)
    const health = await this.getDeploymentHealth(deploymentId);
    const systemEntropy = health.error_rate_per_minute / 100; // Normalize to 0-1

    // Define rollback action
    const action: ActionData = {
      method_type: 'harmonic_resonance', // Rollback is a healing action
      risk_to_life: 0.0, // No danger - restoring known good state
      entropy_increase: -0.1, // Negative = entropy DECREASE (healing)
      geometric_ratio: 1.618, // Golden Ratio
      target_frequency: SCHUMANN_RESONANCE_HZ,
      description: `Rollback deployment: ${reason}`
    };

    // Validate with Constitutional Core
    const result = isActionCompliant(action, systemEntropy);

    // Log validation result
    await this.supabase.from('ops.roman_events').insert({
      event_type: 'rollback_validation',
      severity: result.compliant ? 'info' : 'error',
      source: 'auto_rollback_system',
      description: result.compliant 
        ? `Rollback approved: ${reason}` 
        : `Rollback rejected: ${result.violations.join(', ')}`,
      metadata: {
        deployment_id: deploymentId,
        constitutional_result: result,
        action: action,
        system_entropy: systemEntropy
      }
    });

    return result;
  }

  /**
   * Get rollback target (last successful deployment)
   */
  private async getRollbackTarget(deploymentId: string): Promise<RollbackTarget | null> {
    try {
      // Get environment of current deployment
      const { data: currentDeploy } = await this.supabase
        .from('ops.deployments')
        .select('environment')
        .eq('deployment_id', deploymentId)
        .single();

      if (!currentDeploy) return null;

      // Call RPC function to get rollback target
      const { data, error } = await this.supabase
        .rpc('ops.get_rollback_target', { 
          p_environment: currentDeploy.environment 
        });

      if (error) throw error;

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Failed to get rollback target:', error);
      return null;
    }
  }

  /**
   * Create system snapshot
   */
  private async createSnapshot(
    deploymentId: string,
    snapshotType: 'pre_deployment' | 'post_deployment' | 'pre_rollback'
  ): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .rpc('ops.create_system_snapshot', {
          p_deployment_id: deploymentId,
          p_snapshot_type: snapshotType
        });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Failed to create snapshot:', error);
      return null;
    }
  }

  /**
   * Get deployment health status
   */
  async getDeploymentHealth(deploymentId: string): Promise<HealthCheck> {
    try {
      const { data, error } = await this.supabase
        .rpc('ops.get_deployment_health', {
          p_deployment_id: deploymentId
        });

      if (error) throw error;

      return data as HealthCheck;
    } catch (error) {
      console.error('Failed to get deployment health:', error);
      return {
        healthy: false,
        error_rate_per_minute: 999,
        recent_errors: 999,
        database_connections: 0,
        active_queries: 0,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Log rollback event to database
   */
  private async logRollbackEvent(
    deploymentId: string,
    triggerType: 'automatic' | 'manual' | 'constitutional_violation',
    triggerReason: string,
    initiatedBy?: string
  ): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .rpc('ops.record_rollback_event', {
          p_deployment_id: deploymentId,
          p_trigger_type: triggerType,
          p_trigger_reason: triggerReason,
          p_initiated_by: initiatedBy || null
        });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Failed to log rollback event:', error);
      throw error;
    }
  }

  /**
   * Trigger actual rollback execution (GitHub Actions or similar)
   */
  private async triggerRollbackExecution(
    deploymentId: string,
    targetCommit: string,
    eventId: string
  ): Promise<boolean> {
    try {
      // In production, this would trigger GitHub Actions workflow
      // For now, we update the deployment status
      
      const { error: updateError } = await this.supabase
        .from('ops.deployments')
        .update({ 
          status: 'rolled_back',
          rolled_back_at: new Date().toISOString(),
          metadata: {
            rollback_event_id: eventId,
            rollback_target_commit: targetCommit
          }
        })
        .eq('deployment_id', deploymentId);

      if (updateError) throw updateError;

      // Log to R.O.M.A.N.
      await this.supabase.from('ops.roman_events').insert({
        event_type: 'rollback_executed',
        severity: 'warning',
        source: 'auto_rollback_system',
        description: `Deployment ${deploymentId} rolled back to commit ${targetCommit}`,
        metadata: {
          deployment_id: deploymentId,
          target_commit: targetCommit,
          event_id: eventId
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to trigger rollback execution:', error);
      return false;
    }
  }

  /**
   * Update rollback event status
   */
  private async updateRollbackEventStatus(
    eventId: string,
    status: 'success' | 'failed',
    steps: RollbackStep[]
  ): Promise<void> {
    try {
      await this.supabase
        .from('ops.rollback_events')
        .update({
          status,
          rollback_steps: steps,
          completed_at: new Date().toISOString()
        })
        .eq('event_id', eventId);
    } catch (error) {
      console.error('Failed to update rollback event:', error);
    }
  }

  /**
   * Check if deployment needs automatic rollback
   */
  async shouldAutoRollback(deploymentId: string): Promise<{
    shouldRollback: boolean;
    reason?: string;
  }> {
    try {
      const health = await this.getDeploymentHealth(deploymentId);

      // Auto-rollback criteria
      if (health.error_rate_per_minute > 5) {
        return {
          shouldRollback: true,
          reason: `High error rate: ${health.error_rate_per_minute.toFixed(2)} errors/minute`
        };
      }

      if (health.recent_errors > 50) {
        return {
          shouldRollback: true,
          reason: `Too many recent errors: ${health.recent_errors} in last 5 minutes`
        };
      }

      if (health.database_connections > 90) {
        return {
          shouldRollback: true,
          reason: `Database connection exhaustion: ${health.database_connections} connections`
        };
      }

      return { shouldRollback: false };
    } catch (error) {
      console.error('Failed to check auto-rollback criteria:', error);
      return { shouldRollback: false };
    }
  }

  /**
   * Get recent rollback events
   */
  async getRecentRollbacks(limit: number = 10): Promise<RollbackEvent[]> {
    try {
      const { data, error } = await this.supabase
        .from('ops.rollback_events')
        .select('*')
        .order('initiated_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data as RollbackEvent[];
    } catch (error) {
      console.error('Failed to get recent rollbacks:', error);
      return [];
    }
  }

  /**
   * Get deployment by ID
   */
  async getDeployment(deploymentId: string): Promise<Deployment | null> {
    try {
      const { data, error } = await this.supabase
        .from('ops.deployments')
        .select('*')
        .eq('deployment_id', deploymentId)
        .single();

      if (error) throw error;

      return data as Deployment;
    } catch (error) {
      console.error('Failed to get deployment:', error);
      return null;
    }
  }
}

// =====================================================
// EXPORTS
// =====================================================

export default RollbackService;
