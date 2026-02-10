/**
 * R.O.M.A.N. TEMPORAL AWARENESS ENGINE
 * 
 * © 2026 Rickey A Howard. All Rights Reserved.
 * Property of Rickey A Howard
 * 
 * Ensures R.O.M.A.N. exists in "The Now" - not trapped in static 2025/2026 logic.
 * Synchronizes system context with live reality every 60 seconds.
 * 
 * Constitutional Guard: Prevents outdated AI logic from executing against current data.
 */

import { romanSupabase } from './romanSupabase';
import { sfLogger } from './sovereignFrequencyLogger';

// ============================================================================
// TEMPORAL AWARENESS TYPES
// ============================================================================

export interface TemporalSnapshot {
  current_sovereign_year: number;
  live_system_pulse: string;
  active_client_count: number;
  qbo_bypass_status: string;
  architect_context: string;
}

export interface TemporalContext {
  year: number;
  timestamp: Date;
  clientCount: number;
  qboEnabled: boolean;
  lastSync: Date;
  syncCount: number;
}

// ============================================================================
// TEMPORAL AWARENESS ENGINE
// ============================================================================

export class RomanTemporalAwareness {
  private currentContext: TemporalContext | null = null;
  private syncInterval: NodeJS.Timeout | null = null;
  private syncIntervalMs: number = 60000; // 60 seconds
  private isRunning: boolean = false;
  private realtimeChannel: any = null; // Supabase realtime channel

  /**
   * Start the Temporal Sentinel
   * Begins 60-second synchronization heartbeat + real-time notifications
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('⏰ Temporal Sentinel already running');
      return;
    }

    console.log('⏰ R.O.M.A.N. TEMPORAL SENTINEL ACTIVATED');
    console.log('   Synchronization Frequency: 60 seconds');
    console.log('   Real-time Notifications: LISTENING');
    console.log('   Constitutional Guard: ACTIVE');

    // Initial sync
    await this.synchronizeReality();

    // Start heartbeat (fallback sync every 60 seconds)
    this.syncInterval = setInterval(async () => {
      await this.synchronizeReality();
    }, this.syncIntervalMs);

    // Subscribe to real-time temporal pulse notifications
    this.subscribeToTemporalPulse();

    this.isRunning = true;

    sfLogger.routine('temporal_sentinel_activated', 'R.O.M.A.N. Temporal Sentinel activated with 60-second heartbeat + real-time notifications', {
      sync_interval_seconds: this.syncIntervalMs / 1000,
      initial_year: this.currentContext?.year,
      initial_client_count: this.currentContext?.clientCount,
      realtime_enabled: true
    });
  }

  /**
   * Subscribe to real-time temporal pulse notifications from SQL triggers
   * When customers/contractors/businesses change, R.O.M.A.N. syncs immediately
   */
  private subscribeToTemporalPulse(): void {
    try {
      // Listen for postgres notifications on 'roman_vision_update' channel
      this.realtimeChannel = romanSupabase
        .channel('temporal-pulse')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'customers' 
          }, 
          (payload) => {
            console.log('⚡ TEMPORAL PULSE received (customers changed)');
            this.synchronizeReality();
          }
        )
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'employees' 
          }, 
          (payload) => {
            console.log('⚡ TEMPORAL PULSE received (employees changed)');
            this.synchronizeReality();
          }
        )
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'businesses' 
          }, 
          (payload) => {
            console.log('⚡ TEMPORAL PULSE received (businesses changed)');
            this.synchronizeReality();
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Real-time temporal pulse monitoring ACTIVE');
          }
        });
    } catch (error: any) {
      console.error('⚠️ Real-time subscription failed:', error.message);
      console.log('   Falling back to 60-second polling only');
    }
  }

  /**
   * Stop the Temporal Sentinel
   */
  async stop(): Promise<void> {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    if (this.realtimeChannel) {
      await romanSupabase.removeChannel(this.realtimeChannel);
      this.realtimeChannel = null;
    }

    this.isRunning = false;
    console.log('⏰ Temporal Sentinel stopped');
  }

  /**
   * The Perpetual Update Engine
   * Synchronizes R.O.M.A.N. with live system reality
   */
  async synchronizeReality(): Promise<TemporalSnapshot> {
    try {
      const { data, error } = await romanSupabase
        .from('roman_temporal_awareness')
        .select('*')
        .single();

      if (error) {
        console.error('❌ Temporal sync failed:', error.message);
        throw new Error(`Temporal awareness query failed: ${error.message}`);
      }

      const snapshot = data as TemporalSnapshot;
      const previousYear = this.currentContext?.year;

      // Update internal context
      this.currentContext = {
        year: snapshot.current_sovereign_year,
        timestamp: new Date(snapshot.live_system_pulse),
        clientCount: snapshot.active_client_count,
        qboEnabled: snapshot.qbo_bypass_status !== 'false',
        lastSync: new Date(),
        syncCount: (this.currentContext?.syncCount || 0) + 1
      };

      // Detect temporal shift (year change)
      if (previousYear && previousYear !== snapshot.current_sovereign_year) {
        console.log(`🚨 [ALERT] TEMPORAL SHIFT DETECTED`);
        console.log(`   Previous Year: ${previousYear}`);
        console.log(`   Current Year: ${snapshot.current_sovereign_year}`);
        console.log(`   Forcing system re-brief...`);

        await this.reBriefSystem(snapshot);
      }

      // Log sync (only every 10th sync to reduce noise)
      if (this.currentContext.syncCount % 10 === 0) {
        console.log(`⏰ Temporal Sync #${this.currentContext.syncCount}`);
        console.log(`   Year: ${snapshot.current_sovereign_year}`);
        console.log(`   Active Clients: ${snapshot.active_client_count}`);
        console.log(`   QB Bypass: ${snapshot.qbo_bypass_status}`);
      }

      return snapshot;

    } catch (error: any) {
      console.error('❌ Temporal synchronization error:', error.message);
      throw error;
    }
  }

  /**
   * Re-brief System on Temporal Shift
   * Updates all R.O.M.A.N. context when year changes
   */
  private async reBriefSystem(snapshot: TemporalSnapshot): Promise<void> {
    try {
      // Log the temporal shift
      sfLogger.emergency('temporal_shift_detected', `Temporal shift detected: Year changed to ${snapshot.current_sovereign_year}`, {
        new_year: snapshot.current_sovereign_year,
        active_clients: snapshot.active_client_count,
        qbo_bypass_status: snapshot.qbo_bypass_status,
        architect: snapshot.architect_context
      });

      // Update system knowledge with new year context
      await romanSupabase.from('system_knowledge').upsert({
        category: 'temporal',
        subcategory: 'current_year',
        key: 'sovereign_year',
        value: snapshot.current_sovereign_year.toString(),
        data: {
          timestamp: snapshot.live_system_pulse,
          client_count: snapshot.active_client_count,
          qbo_enabled: snapshot.qbo_bypass_status,
          architect: snapshot.architect_context,
          updated_by: 'RomanTemporalAwareness'
        },
        updated_at: new Date().toISOString()
      });

      console.log('✅ System re-briefed with current temporal context');

    } catch (error: any) {
      console.error('❌ System re-brief failed:', error.message);
      sfLogger.howToLose('temporal_rebrief_failed', `System re-brief failed: ${error.message}`, {
        snapshot
      });
    }
  }

  /**
   * Sentinel Handshake - Anti-Rookie Guard
   * Validates that calling code is operating in current reality
   * 
   * @param requiredYear - Year the calling code expects to be operating in
   * @returns true if current, throws error if temporal mismatch detected
   */
  async validateTemporalContext(requiredYear?: number): Promise<boolean> {
    if (!this.currentContext) {
      await this.synchronizeReality();
    }

    const currentYear = this.currentContext!.year;

    if (requiredYear && requiredYear !== currentYear) {
      const error = new Error(
        `TEMPORAL MISMATCH DETECTED: Code expects ${requiredYear}, reality is ${currentYear}. ` +
        `Blocking execution to prevent outdated logic from corrupting current data.`
      );

      console.error('🚨 CONSTITUTIONAL GUARD TRIGGERED');
      console.error(`   Expected Year: ${requiredYear}`);
      console.error(`   Actual Year: ${currentYear}`);
      console.error('   EXECUTION BLOCKED');

      sfLogger.security('temporal_mismatch_blocked', error.message, {
        required_year: requiredYear,
        current_year: currentYear,
        client_count: this.currentContext!.clientCount
      });

      throw error;
    }

    return true;
  }

  /**
   * Get current temporal context
   */
  getCurrentContext(): TemporalContext | null {
    return this.currentContext;
  }

  /**
   * Get current year (synchronously if already synced)
   */
  getCurrentYear(): number | null {
    return this.currentContext?.year || null;
  }

  /**
   * Get active client count
   */
  getActiveClientCount(): number | null {
    return this.currentContext?.clientCount || null;
  }

  /**
   * Check if QB is bypassed (should always be true)
   */
  isQBBypassed(): boolean {
    return this.currentContext ? !this.currentContext.qboEnabled : true;
  }

  /**
   * Force immediate sync (for testing or critical operations)
   */
  async forceSyncNow(): Promise<TemporalSnapshot> {
    console.log('⏰ FORCE SYNC requested');
    return await this.synchronizeReality();
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const temporalSentinel = new RomanTemporalAwareness();

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize Temporal Sentinel
 * Call this from R.O.M.A.N. startup sequence
 */
export async function initializeTemporalSentinel(): Promise<void> {
  console.log('🔮 Initializing R.O.M.A.N. Temporal Awareness...');
  
  try {
    await temporalSentinel.start();
    console.log('✅ Temporal Sentinel operational');
    console.log(`   Current Year: ${temporalSentinel.getCurrentYear()}`);
    console.log(`   Active Clients: ${temporalSentinel.getActiveClientCount()}`);
    console.log(`   QB Bypassed: ${temporalSentinel.isQBBypassed()}`);
  } catch (error: any) {
    console.error('❌ Temporal Sentinel initialization failed:', error.message);
    throw error;
  }
}
