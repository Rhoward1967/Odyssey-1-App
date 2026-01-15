/**
 * R.O.M.A.N. RESOURCE GOVERNOR
 * 
 * Machine safety valve that prevents runaway processes and ensures
 * R.O.M.A.N. never harms the host machine.
 * 
 * Implements:
 * - CPU usage monitoring (keeps <50% by default)
 * - Memory pressure detection
 * - Schumann resonance grounding (7.83 Hz operational rhythm)
 * - Automatic throttling when resources spike
 * 
 * Date: January 15, 2026
 * Integration: Constitutional Core + Positive Geometry Validator
 */

import os from 'os';
import { SCHUMANN_RESONANCE_HZ } from './roman-constitutional-core';

// ============================================================================
// RESOURCE LIMITS
// ============================================================================

/** Maximum CPU usage before throttling (0-1, default 0.5 = 50%) */
export const MAX_CPU_USAGE = 0.5;

/** Maximum memory usage before throttling (0-1, default 0.7 = 70%) */
export const MAX_MEMORY_USAGE = 0.7;

/** Schumann resonance cycle period in milliseconds */
export const SCHUMANN_CYCLE_MS = 1000 / SCHUMANN_RESONANCE_HZ; // ~127.7ms

/** Grace period before enforcing throttle (ms) */
export const THROTTLE_GRACE_PERIOD_MS = 5000;

// ============================================================================
// RESOURCE MONITORING
// ============================================================================

export interface ResourceSnapshot {
  timestamp: number;
  cpuUsage: number;
  memoryUsage: number;
  memoryUsedMB: number;
  memoryTotalMB: number;
  isThrottled: boolean;
  schumannCycleCount: number;
}

export interface ResourceGovernorState {
  isActive: boolean;
  currentSnapshot: ResourceSnapshot | null;
  violationStartTime: number | null;
  throttleActive: boolean;
  totalCycles: number;
  totalThrottles: number;
}

export class ResourceGovernor {
  private state: ResourceGovernorState = {
    isActive: false,
    currentSnapshot: null,
    violationStartTime: null,
    throttleActive: false,
    totalCycles: 0,
    totalThrottles: 0,
  };
  
  private monitorInterval: NodeJS.Timeout | null = null;
  private lastCpuMeasure: { idle: number; total: number } | null = null;
  
  /**
   * Start monitoring system resources
   */
  start(): void {
    if (this.state.isActive) {
      console.log('⚠️  Resource Governor already active');
      return;
    }
    
    this.state.isActive = true;
    console.log('🛡️  R.O.M.A.N. Resource Governor activated');
    console.log(`   Max CPU: ${(MAX_CPU_USAGE * 100).toFixed(0)}%`);
    console.log(`   Max Memory: ${(MAX_MEMORY_USAGE * 100).toFixed(0)}%`);
    console.log(`   Schumann Cycle: ${SCHUMANN_CYCLE_MS.toFixed(1)}ms`);
    
    // Monitor at Schumann resonance frequency
    this.monitorInterval = setInterval(() => {
      this.checkResources();
    }, SCHUMANN_CYCLE_MS);
  }
  
  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    
    this.state.isActive = false;
    console.log('🛡️  Resource Governor deactivated');
    console.log(`   Total cycles: ${this.state.totalCycles}`);
    console.log(`   Total throttles: ${this.state.totalThrottles}`);
  }
  
  /**
   * Check current resource usage
   */
  private checkResources(): void {
    this.state.totalCycles++;
    
    const cpuUsage = this.getCPUUsage();
    const memoryUsage = this.getMemoryUsage();
    const memoryStats = this.getMemoryStats();
    
    const snapshot: ResourceSnapshot = {
      timestamp: Date.now(),
      cpuUsage,
      memoryUsage,
      memoryUsedMB: memoryStats.used,
      memoryTotalMB: memoryStats.total,
      isThrottled: this.state.throttleActive,
      schumannCycleCount: this.state.totalCycles,
    };
    
    this.state.currentSnapshot = snapshot;
    
    // Check for violations
    const cpuViolation = cpuUsage > MAX_CPU_USAGE;
    const memoryViolation = memoryUsage > MAX_MEMORY_USAGE;
    
    if (cpuViolation || memoryViolation) {
      this.handleResourceViolation(cpuViolation, memoryViolation, snapshot);
    } else {
      // Clear violation state if resources are normal
      if (this.state.violationStartTime) {
        console.log('✅ Resources normalized - releasing throttle');
        this.state.violationStartTime = null;
        this.state.throttleActive = false;
      }
    }
  }
  
  /**
   * Handle resource limit violations
   */
  private handleResourceViolation(
    cpuViolation: boolean,
    memoryViolation: boolean,
    snapshot: ResourceSnapshot
  ): void {
    const now = Date.now();
    
    // Start violation timer if this is the first violation
    if (!this.state.violationStartTime) {
      this.state.violationStartTime = now;
      console.log('⚠️  Resource violation detected - starting grace period');
      if (cpuViolation) {
        console.log(`   CPU: ${(snapshot.cpuUsage * 100).toFixed(1)}% (limit: ${(MAX_CPU_USAGE * 100).toFixed(0)}%)`);
      }
      if (memoryViolation) {
        console.log(`   Memory: ${(snapshot.memoryUsage * 100).toFixed(1)}% (limit: ${(MAX_MEMORY_USAGE * 100).toFixed(0)}%)`);
      }
      return;
    }
    
    // Check if violation has persisted beyond grace period
    const violationDuration = now - this.state.violationStartTime;
    
    if (violationDuration > THROTTLE_GRACE_PERIOD_MS && !this.state.throttleActive) {
      this.activateThrottle(snapshot);
    }
  }
  
  /**
   * Activate throttling to protect the machine
   */
  private activateThrottle(snapshot: ResourceSnapshot): void {
    this.state.throttleActive = true;
    this.state.totalThrottles++;
    
    console.log('🚨 RESOURCE GOVERNOR: ACTIVATING THROTTLE');
    console.log(`   CPU: ${(snapshot.cpuUsage * 100).toFixed(1)}%`);
    console.log(`   Memory: ${snapshot.memoryUsedMB.toFixed(0)} MB / ${snapshot.memoryTotalMB.toFixed(0)} MB`);
    console.log('   R.O.M.A.N. entering Schumann-grounded safe mode...');
    
    // Emit event for other systems to react
    this.emitThrottleEvent(snapshot);
  }
  
  /**
   * Get current CPU usage (0-1)
   */
  private getCPUUsage(): number {
    const cpus = os.cpus();
    
    let idle = 0;
    let total = 0;
    
    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        total += cpu.times[type as keyof typeof cpu.times];
      }
      idle += cpu.times.idle;
    });
    
    if (!this.lastCpuMeasure) {
      this.lastCpuMeasure = { idle, total };
      return 0;
    }
    
    const idleDiff = idle - this.lastCpuMeasure.idle;
    const totalDiff = total - this.lastCpuMeasure.total;
    
    this.lastCpuMeasure = { idle, total };
    
    return Math.max(0, Math.min(1, 1 - (idleDiff / totalDiff)));
  }
  
  /**
   * Get current memory usage (0-1)
   */
  private getMemoryUsage(): number {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    
    return (totalMem - freeMem) / totalMem;
  }
  
  /**
   * Get memory statistics in MB
   */
  private getMemoryStats(): { used: number; total: number; free: number } {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    
    return {
      used: usedMem / (1024 * 1024),
      total: totalMem / (1024 * 1024),
      free: freeMem / (1024 * 1024),
    };
  }
  
  /**
   * Emit throttle event (can be extended for event emitters)
   */
  private emitThrottleEvent(snapshot: ResourceSnapshot): void {
    // This can be integrated with Node.js EventEmitter or other event systems
    // For now, just log
    console.log('📡 Throttle event emitted:', {
      timestamp: snapshot.timestamp,
      cpuUsage: `${(snapshot.cpuUsage * 100).toFixed(1)}%`,
      memoryUsage: `${(snapshot.memoryUsage * 100).toFixed(1)}%`,
    });
  }
  
  /**
   * Check if system is currently throttled
   */
  isThrottled(): boolean {
    return this.state.throttleActive;
  }
  
  /**
   * Get current resource snapshot
   */
  getSnapshot(): ResourceSnapshot | null {
    return this.state.currentSnapshot;
  }
  
  /**
   * Get governor statistics
   */
  getStats(): {
    totalCycles: number;
    totalThrottles: number;
    uptimeSeconds: number;
  } {
    return {
      totalCycles: this.state.totalCycles,
      totalThrottles: this.state.totalThrottles,
      uptimeSeconds: this.state.totalCycles * (SCHUMANN_CYCLE_MS / 1000),
    };
  }
  
  /**
   * Wait for Schumann cycle (for manual throttling in tight loops)
   */
  static async waitSchumannCycle(): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, SCHUMANN_CYCLE_MS);
    });
  }
  
  /**
   * Manually check if operation should proceed (for integration with other systems)
   */
  shouldProceed(): boolean {
    if (!this.state.isActive) {
      return true; // Governor not active, allow all operations
    }
    
    return !this.state.throttleActive;
  }
}

// ============================================================================
// GLOBAL GOVERNOR INSTANCE
// ============================================================================

/** Singleton instance for application-wide resource governance */
export const globalResourceGovernor = new ResourceGovernor();

/**
 * Convenience function to start global governor
 */
export function startResourceGovernor(): void {
  globalResourceGovernor.start();
}

/**
 * Convenience function to stop global governor
 */
export function stopResourceGovernor(): void {
  globalResourceGovernor.stop();
}

/**
 * Check if operation should proceed (global)
 */
export function canProceed(): boolean {
  return globalResourceGovernor.shouldProceed();
}
