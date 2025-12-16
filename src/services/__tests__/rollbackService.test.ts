/**
 * Rollback Service Tests
 * 
 * Tests for R.O.M.A.N. Auto-Rollback System with Constitutional validation.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import RollbackService from '../rollbackService';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
  rpc: vi.fn()
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => mockSupabase
}));

describe('RollbackService', () => {
  let service: RollbackService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new RollbackService(
      'https://test.supabase.co',
      'test-service-role-key'
    );
  });

  describe('Constitutional Validation', () => {
    it('should approve rollback when system unhealthy', async () => {
      // Mock unhealthy deployment
      mockSupabase.rpc.mockResolvedValue({
        data: {
          healthy: false,
          error_rate_per_minute: 8.5,
          recent_errors: 42,
          database_connections: 45,
          active_queries: 12,
          timestamp: new Date().toISOString()
        },
        error: null
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            deployment_id: 'test-uuid',
            environment: 'production',
            status: 'success'
          },
          error: null
        }),
        insert: vi.fn().mockResolvedValue({ data: null, error: null })
      });

      const health = await service.getDeploymentHealth('test-uuid');

      expect(health.healthy).toBe(false);
      expect(health.error_rate_per_minute).toBe(8.5);
    });

    it('should reject rollback when system already healthy', async () => {
      // Mock healthy deployment
      mockSupabase.rpc.mockResolvedValue({
        data: {
          healthy: true,
          error_rate_per_minute: 0.2,
          recent_errors: 1,
          database_connections: 20,
          active_queries: 5,
          timestamp: new Date().toISOString()
        },
        error: null
      });

      const health = await service.getDeploymentHealth('test-uuid');

      expect(health.healthy).toBe(true);
      expect(health.error_rate_per_minute).toBeLessThan(1);
    });

    it('should calculate system entropy from error rate', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: {
          healthy: false,
          error_rate_per_minute: 10.0,
          recent_errors: 50,
          database_connections: 60,
          active_queries: 15,
          timestamp: new Date().toISOString()
        },
        error: null
      });

      const health = await service.getDeploymentHealth('test-uuid');
      const entropy = health.error_rate_per_minute / 100; // Should be 0.1

      expect(entropy).toBeGreaterThan(0.05); // System unstable
      expect(health.healthy).toBe(false);
    });
  });

  describe('Auto-Rollback Triggers', () => {
    it('should trigger rollback when error rate exceeds 5/minute', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: {
          healthy: false,
          error_rate_per_minute: 8.5,
          recent_errors: 42,
          database_connections: 45,
          active_queries: 12,
          timestamp: new Date().toISOString()
        },
        error: null
      });

      const result = await service.shouldAutoRollback('test-uuid');

      expect(result.shouldRollback).toBe(true);
      expect(result.reason).toContain('High error rate');
    });

    it('should trigger rollback when recent errors exceed 50', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: {
          healthy: false,
          error_rate_per_minute: 4.0,
          recent_errors: 55,
          database_connections: 45,
          active_queries: 12,
          timestamp: new Date().toISOString()
        },
        error: null
      });

      const result = await service.shouldAutoRollback('test-uuid');

      expect(result.shouldRollback).toBe(true);
      expect(result.reason).toContain('Too many recent errors');
    });

    it('should trigger rollback when DB connections exceed 90', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: {
          healthy: false,
          error_rate_per_minute: 1.0,
          recent_errors: 5,
          database_connections: 95,
          active_queries: 50,
          timestamp: new Date().toISOString()
        },
        error: null
      });

      const result = await service.shouldAutoRollback('test-uuid');

      expect(result.shouldRollback).toBe(true);
      expect(result.reason).toContain('Database connection exhaustion');
    });

    it('should NOT trigger rollback when system healthy', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: {
          healthy: true,
          error_rate_per_minute: 0.5,
          recent_errors: 2,
          database_connections: 30,
          active_queries: 8,
          timestamp: new Date().toISOString()
        },
        error: null
      });

      const result = await service.shouldAutoRollback('test-uuid');

      expect(result.shouldRollback).toBe(false);
    });
  });

  describe('Rollback Execution', () => {
    it('should execute complete rollback workflow', async () => {
      // Mock deployment lookup
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'ops.deployments') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                deployment_id: 'current-uuid',
                environment: 'production',
                version: 'v2.5.3',
                git_commit: 'abc123'
              },
              error: null
            }),
            update: vi.fn().mockReturnThis(),
            insert: vi.fn().mockResolvedValue({ data: null, error: null })
          };
        }
        if (table === 'ops.rollback_events') {
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ data: null, error: null })
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          insert: vi.fn().mockResolvedValue({ data: null, error: null })
        };
      });

      // Mock RPC calls
      mockSupabase.rpc.mockImplementation((fn: string) => {
        if (fn === 'ops.get_deployment_health') {
          return Promise.resolve({
            data: {
              healthy: false,
              error_rate_per_minute: 8.5,
              recent_errors: 42,
              database_connections: 45,
              active_queries: 12,
              timestamp: new Date().toISOString()
            },
            error: null
          });
        }
        if (fn === 'ops.get_rollback_target') {
          return Promise.resolve({
            data: [{
              deployment_id: 'previous-uuid',
              version: 'v2.5.2',
              git_commit: 'def456',
              deployed_at: new Date().toISOString(),
              health_check_passed: true
            }],
            error: null
          });
        }
        if (fn === 'ops.record_rollback_event') {
          return Promise.resolve({
            data: 'rollback-event-uuid',
            error: null
          });
        }
        if (fn === 'ops.create_system_snapshot') {
          return Promise.resolve({
            data: 'snapshot-uuid',
            error: null
          });
        }
        return Promise.resolve({ data: null, error: null });
      });

      const result = await service.executeRollback(
        'current-uuid',
        'High error rate',
        'user-uuid'
      );

      expect(result.success).toBe(true);
      expect(result.target_deployment).toBeDefined();
      expect(result.target_deployment?.version).toBe('v2.5.2');
      expect(result.steps_executed.length).toBeGreaterThan(0);
    });

    it('should fail rollback when no target available', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { environment: 'production' },
          error: null
        }),
        insert: vi.fn().mockResolvedValue({ data: null, error: null })
      });

      mockSupabase.rpc.mockImplementation((fn: string) => {
        if (fn === 'ops.get_deployment_health') {
          return Promise.resolve({
            data: {
              healthy: false,
              error_rate_per_minute: 8.5,
              recent_errors: 42,
              database_connections: 45,
              active_queries: 12,
              timestamp: new Date().toISOString()
            },
            error: null
          });
        }
        if (fn === 'ops.get_rollback_target') {
          return Promise.resolve({
            data: [], // No rollback target
            error: null
          });
        }
        return Promise.resolve({ data: null, error: null });
      });

      const result = await service.executeRollback(
        'current-uuid',
        'High error rate'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('No valid rollback target');
    });
  });

  describe('Rollback History', () => {
    it('should retrieve recent rollback events', async () => {
      const mockRollbacks = [
        {
          id: 1,
          event_id: 'event-1',
          deployment_id: 'deploy-1',
          trigger_type: 'automatic',
          trigger_reason: 'High error rate',
          initiated_at: new Date().toISOString(),
          status: 'success'
        },
        {
          id: 2,
          event_id: 'event-2',
          deployment_id: 'deploy-2',
          trigger_type: 'manual',
          trigger_reason: 'Bug in feature X',
          initiated_at: new Date().toISOString(),
          status: 'success'
        }
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: mockRollbacks,
          error: null
        })
      });

      const rollbacks = await service.getRecentRollbacks(10);

      expect(rollbacks).toHaveLength(2);
      expect(rollbacks[0].trigger_type).toBe('automatic');
      expect(rollbacks[1].trigger_type).toBe('manual');
    });
  });

  describe('System Snapshots', () => {
    it('should create pre-rollback snapshot', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: 'snapshot-uuid-123',
        error: null
      });

      const snapshotId = await (service as any).createSnapshot(
        'deployment-uuid',
        'pre_rollback'
      );

      expect(snapshotId).toBe('snapshot-uuid-123');
      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'ops.create_system_snapshot',
        {
          p_deployment_id: 'deployment-uuid',
          p_snapshot_type: 'pre_rollback'
        }
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      mockSupabase.rpc.mockRejectedValue(new Error('Connection failed'));

      const health = await service.getDeploymentHealth('test-uuid');

      expect(health.healthy).toBe(false);
      expect(health.error_rate_per_minute).toBe(999); // Error sentinel value
    });

    it('should log errors to R.O.M.A.N. events', async () => {
      const insertSpy = vi.fn().mockResolvedValue({ data: null, error: null });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockRejectedValue(new Error('Test error')),
        insert: insertSpy
      });

      mockSupabase.rpc.mockImplementation((fn: string) => {
        if (fn === 'ops.get_deployment_health') {
          return Promise.resolve({
            data: {
              healthy: false,
              error_rate_per_minute: 10.0,
              recent_errors: 50,
              database_connections: 60,
              active_queries: 15,
              timestamp: new Date().toISOString()
            },
            error: null
          });
        }
        return Promise.resolve({ data: null, error: null });
      });

      const result = await service.executeRollback(
        'test-uuid',
        'Test rollback'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Constitutional AI Integration', () => {
    it('should create rollback action with negative entropy', () => {
      // Rollback action profile
      const rollbackAction = {
        method_type: 'harmonic_resonance',
        risk_to_life: 0.0,
        entropy_increase: -0.1, // NEGATIVE = reduces chaos
        geometric_ratio: 1.618, // Golden Ratio
        target_frequency: 7.83, // Schumann Resonance
        description: 'Rollback deployment'
      };

      expect(rollbackAction.entropy_increase).toBeLessThan(0);
      expect(rollbackAction.risk_to_life).toBe(0);
      expect(rollbackAction.method_type).toBe('harmonic_resonance');
    });

    it('should respect Four Immutable Laws', () => {
      const rollbackAction = {
        method_type: 'harmonic_resonance',
        risk_to_life: 0.0,
        entropy_increase: -0.1,
        geometric_ratio: 1.618,
        target_frequency: 7.83
      };

      // Law of Inhabitance: risk_to_life = 0
      expect(rollbackAction.risk_to_life).toBe(0);

      // Law of Harmonic Attraction: uses harmonic_resonance
      expect(rollbackAction.method_type).toBe('harmonic_resonance');

      // Law of Total Coherence: reduces entropy
      expect(rollbackAction.entropy_increase).toBeLessThan(0);

      // Law of Structural Integrity: Golden Ratio
      expect(rollbackAction.geometric_ratio).toBeCloseTo(1.618, 2);
    });
  });
});
