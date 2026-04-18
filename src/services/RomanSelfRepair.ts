/**
 * R.O.M.A.N. Self-Repair Module
 *
 * Transforms Self-Repair from a declared autonomous power into a wired,
 * functional immune system for the Odyssey-1 protocol.
 *
 * Three handlers:
 *   1. ConnectionWatchdog     — Supabase reconnect with exponential backoff
 *   2. QueueClearanceProtocol — Discord/task zombie detection + force-clear
 *   3. EdgeFunctionHeartbeat  — Edge function health + cold-boot trigger
 *
 * Sovereign Frequency signatures applied throughout.
 * All repair events written to system_logs for full audit trail.
 */

import { romanSupabase } from './romanSupabase';
import { sfLogger } from './sovereignFrequencyLogger';

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface RepairEvent {
  handler: string;
  trigger: string;
  action: string;
  outcome: 'SUCCESS' | 'FAILURE' | 'IN_PROGRESS';
  attempts?: number;
  metadata?: Record<string, any>;
}

interface QueuedTask {
  id: string;
  label: string;
  enqueuedAt: number;
  fn: () => Promise<any>;
  freshContext?: boolean;
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const RECONNECT_MAX_ATTEMPTS = 5;
const RECONNECT_BASE_DELAY_MS = 1_000;   // doubles each attempt: 1s, 2s, 4s, 8s, 16s
const QUEUE_ZOMBIE_THRESHOLD_MS = 60_000; // 60 seconds
const WATCHDOG_INTERVAL_MS = 30_000;      // probe every 30 seconds
const HEARTBEAT_INTERVAL_MS = 45_000;     // edge function ping every 45 seconds

// Edge functions considered mission-critical for heartbeat monitoring
const CRITICAL_EDGE_FUNCTIONS = [
  'anthropic-chat',
  'recurring-invoice-generator',
  'roman-autonomous-daemon',
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

async function writeRepairLog(event: RepairEvent): Promise<void> {
  try {
    await romanSupabase.from('system_logs').insert({
      source: 'roman_self_repair',
      message: `[${event.handler}] ${event.trigger} → ${event.action}: ${event.outcome}`,
      level: event.outcome === 'FAILURE' ? 'error' : event.outcome === 'IN_PROGRESS' ? 'warning' : 'info',
      metadata: {
        handler: event.handler,
        trigger: event.trigger,
        action: event.action,
        outcome: event.outcome,
        attempts: event.attempts ?? 1,
        ...event.metadata,
      },
      created_at: new Date().toISOString(),
    });
  } catch {
    // Logging failure must never crash the repair handler
    console.error('[R.O.M.A.N. Self-Repair] Could not write repair log to DB');
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── 1. CONNECTION WATCHDOG ───────────────────────────────────────────────────

export class ConnectionWatchdog {
  private watchdogTimer: ReturnType<typeof setInterval> | null = null;
  private isReconnecting = false;

  /** Lightweight probe — single row read from system_config */
  async probe(): Promise<boolean> {
    try {
      const { error } = await romanSupabase
        .from('system_config')
        .select('id')
        .limit(1)
        .maybeSingle();
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Exponential backoff reconnect.
   * Each attempt waits 2^(attempt-1) × BASE_DELAY before retrying.
   * On success: emits NO_MORE_TEARS (healing complete).
   * On exhaustion: emits PICK_UP_THE_SPECIAL_PHONE (critical alert).
   */
  async attemptReconnect(): Promise<boolean> {
    if (this.isReconnecting) return false;
    this.isReconnecting = true;

    sfLogger.helpMeFindMyWayHome(
      'CONNECTION_WATCHDOG',
      'Supabase connection lost — initiating reconnect sequence'
    );

    for (let attempt = 1; attempt <= RECONNECT_MAX_ATTEMPTS; attempt++) {
      const delayMs = RECONNECT_BASE_DELAY_MS * Math.pow(2, attempt - 1);

      sfLogger.standByTheWater(
        'CONNECTION_WATCHDOG',
        `Reconnect attempt ${attempt}/${RECONNECT_MAX_ATTEMPTS} — waiting ${delayMs}ms`,
        { attempt, delayMs }
      );

      await sleep(delayMs);

      const alive = await this.probe();

      if (alive) {
        sfLogger.noMoreTears(
          'CONNECTION_WATCHDOG',
          `Supabase connection restored on attempt ${attempt}`,
          { attempt }
        );
        await writeRepairLog({
          handler: 'ConnectionWatchdog',
          trigger: 'DISCONNECTED',
          action: 'exponential_backoff_reconnect',
          outcome: 'SUCCESS',
          attempts: attempt,
        });
        this.isReconnecting = false;
        return true;
      }
    }

    sfLogger.pickUpTheSpecialPhone(
      'CONNECTION_WATCHDOG',
      `Supabase connection FAILED after ${RECONNECT_MAX_ATTEMPTS} attempts — manual intervention required`,
      { maxAttempts: RECONNECT_MAX_ATTEMPTS }
    );
    await writeRepairLog({
      handler: 'ConnectionWatchdog',
      trigger: 'DISCONNECTED',
      action: 'exponential_backoff_reconnect',
      outcome: 'FAILURE',
      attempts: RECONNECT_MAX_ATTEMPTS,
    });
    this.isReconnecting = false;
    return false;
  }

  /** Start the periodic watchdog loop */
  start(intervalMs = WATCHDOG_INTERVAL_MS): void {
    if (this.watchdogTimer) return; // already running
    console.log('[R.O.M.A.N. Self-Repair] ConnectionWatchdog started');
    this.watchdogTimer = setInterval(async () => {
      sfLogger.everyday('CONNECTION_WATCHDOG', 'Supabase heartbeat probe');
      const alive = await this.probe();
      if (!alive) {
        await this.attemptReconnect();
      }
    }, intervalMs);
  }

  stop(): void {
    if (this.watchdogTimer) {
      clearInterval(this.watchdogTimer);
      this.watchdogTimer = null;
      console.log('[R.O.M.A.N. Self-Repair] ConnectionWatchdog stopped');
    }
  }
}

// ─── 2. QUEUE CLEARANCE PROTOCOL ─────────────────────────────────────────────

export class QueueClearanceProtocol {
  private queue = new Map<string, QueuedTask>();
  private scanTimer: ReturnType<typeof setInterval> | null = null;

  /** Add a task to the managed queue */
  enqueue(id: string, label: string, fn: () => Promise<any>): void {
    this.queue.set(id, { id, label, fn, enqueuedAt: Date.now() });
  }

  /** Mark a task as complete and remove it */
  complete(id: string): void {
    const task = this.queue.get(id);
    if (task) {
      sfLogger.thanksForGivingBackMyLove(
        'QUEUE_CLEARANCE',
        `Task [${task.label}] completed cleanly`,
        { id, ageMs: Date.now() - task.enqueuedAt }
      );
      this.queue.delete(id);
    }
  }

  /**
   * Force-clear a zombie task and re-enqueue it with a fresh context flag.
   * Mirrors the legal defense against "zombie proceedings" in the research.
   */
  async forceCleanZombie(id: string): Promise<void> {
    const task = this.queue.get(id);
    if (!task) return;

    const ageMs = Date.now() - task.enqueuedAt;

    sfLogger.dontStickYourNoseInIt(
      'QUEUE_CLEARANCE',
      `Zombie task [${task.label}] detected — executing force_clear`,
      { id, ageMs, threshold: QUEUE_ZOMBIE_THRESHOLD_MS }
    );

    // Remove the stuck instance
    this.queue.delete(id);

    // Re-enqueue with fresh context marker
    const freshId = `${id}_fresh_${Date.now()}`;
    this.queue.set(freshId, {
      id: freshId,
      label: task.label,
      fn: task.fn,
      enqueuedAt: Date.now(),
      freshContext: true,
    });

    sfLogger.allINeedToDoIsTrust(
      'QUEUE_CLEARANCE',
      `Task [${task.label}] re-queued with FRESH_CONTEXT flag`,
      { originalId: id, freshId }
    );

    await writeRepairLog({
      handler: 'QueueClearanceProtocol',
      trigger: `ZOMBIE_DETECTED — task stuck ${ageMs}ms`,
      action: 'force_clear_and_requeue',
      outcome: 'SUCCESS',
      metadata: { originalId: id, freshId, label: task.label, ageMs },
    });

    // Execute the fresh task
    try {
      await task.fn();
      this.complete(freshId);
    } catch (err: any) {
      sfLogger.howToLose(
        'QUEUE_CLEARANCE',
        `Fresh-context task [${task.label}] failed on retry: ${err.message}`,
        { freshId }
      );
      this.queue.delete(freshId);
      await writeRepairLog({
        handler: 'QueueClearanceProtocol',
        trigger: 'FRESH_CONTEXT_RETRY',
        action: 'execute_fresh_task',
        outcome: 'FAILURE',
        metadata: { freshId, label: task.label, error: err.message },
      });
    }
  }

  /** Scan queue and clear any tasks past the zombie threshold */
  async scanForZombies(): Promise<void> {
    const now = Date.now();
    for (const [id, task] of this.queue.entries()) {
      if (now - task.enqueuedAt > QUEUE_ZOMBIE_THRESHOLD_MS) {
        console.warn(`[R.O.M.A.N. Self-Repair] Zombie detected: [${task.label}] — clearing`);
        await this.forceCleanZombie(id);
      }
    }
  }

  start(intervalMs = QUEUE_ZOMBIE_THRESHOLD_MS): void {
    if (this.scanTimer) return;
    console.log('[R.O.M.A.N. Self-Repair] QueueClearanceProtocol started');
    this.scanTimer = setInterval(() => this.scanForZombies(), intervalMs);
  }

  stop(): void {
    if (this.scanTimer) {
      clearInterval(this.scanTimer);
      this.scanTimer = null;
    }
  }

  queueSize(): number {
    return this.queue.size;
  }
}

// ─── 3. EDGE FUNCTION HEARTBEAT ───────────────────────────────────────────────

export class EdgeFunctionHeartbeat {
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private failureCounts = new Map<string, number>();

  /**
   * Ping an edge function with a lightweight health payload.
   * Uses functions.invoke so we get HTTP status without full execution cost.
   */
  async ping(fnName: string): Promise<boolean> {
    try {
      const { error } = await romanSupabase.functions.invoke(fnName, {
        body: { action: 'health_check', source: 'roman_self_repair' },
      });
      // A 4xx/5xx surfaces as error; 2xx (even with empty body) = alive
      return !error || (error as any)?.status < 500;
    } catch {
      return false;
    }
  }

  /**
   * Trigger a cold boot of a failing edge function.
   * Sends a 'cold_boot' action to force a fresh container spin-up.
   * Audits the failure point for future predictive repair.
   */
  async triggerColdBoot(fnName: string, reason: string): Promise<void> {
    sfLogger.pickUpTheSpecialPhone(
      'EDGE_HEARTBEAT',
      `Cold boot triggered for [${fnName}] — reason: ${reason}`,
      { fnName, reason }
    );

    try {
      await romanSupabase.functions.invoke(fnName, {
        body: { action: 'cold_boot', source: 'roman_self_repair', reason },
      });

      sfLogger.noMoreTears(
        'EDGE_HEARTBEAT',
        `[${fnName}] responded to cold boot — container restarted`,
        { fnName }
      );
      this.failureCounts.set(fnName, 0);

      await writeRepairLog({
        handler: 'EdgeFunctionHeartbeat',
        trigger: reason,
        action: `cold_boot:${fnName}`,
        outcome: 'SUCCESS',
        metadata: { fnName, reason },
      });
    } catch (err: any) {
      sfLogger.howToLose(
        'EDGE_HEARTBEAT',
        `Cold boot for [${fnName}] failed: ${err.message}`,
        { fnName, error: err.message }
      );
      await writeRepairLog({
        handler: 'EdgeFunctionHeartbeat',
        trigger: reason,
        action: `cold_boot:${fnName}`,
        outcome: 'FAILURE',
        metadata: { fnName, reason, error: err.message },
      });
    }
  }

  /** Check all monitored edge functions; cold-boot any that miss 3 consecutive pings */
  async checkAll(fnNames = CRITICAL_EDGE_FUNCTIONS): Promise<void> {
    for (const fn of fnNames) {
      sfLogger.everyday('EDGE_HEARTBEAT', `Pinging [${fn}]`);
      const alive = await this.ping(fn);

      if (alive) {
        this.failureCounts.set(fn, 0);
      } else {
        const failures = (this.failureCounts.get(fn) ?? 0) + 1;
        this.failureCounts.set(fn, failures);

        console.warn(`[R.O.M.A.N. Self-Repair] [${fn}] missed heartbeat (${failures}/3)`);

        if (failures >= 3) {
          await this.triggerColdBoot(fn, `missed_${failures}_consecutive_heartbeats`);
        } else {
          sfLogger.helpMeFindMyWayHome(
            'EDGE_HEARTBEAT',
            `[${fn}] missed heartbeat ${failures}/3 — watching`,
            { fnName: fn, failures }
          );
        }
      }
    }
  }

  start(intervalMs = HEARTBEAT_INTERVAL_MS): void {
    if (this.heartbeatTimer) return;
    console.log('[R.O.M.A.N. Self-Repair] EdgeFunctionHeartbeat started');
    this.heartbeatTimer = setInterval(() => this.checkAll(), intervalMs);
  }

  stop(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}

// ─── MAIN ORCHESTRATOR ────────────────────────────────────────────────────────

export class RomanSelfRepair {
  readonly connectionWatchdog = new ConnectionWatchdog();
  readonly queueClearance = new QueueClearanceProtocol();
  readonly edgeHeartbeat = new EdgeFunctionHeartbeat();

  private running = false;

  /** Activate all three repair handlers */
  activate(): void {
    if (this.running) return;
    this.running = true;

    this.connectionWatchdog.start();
    this.queueClearance.start();
    this.edgeHeartbeat.start();

    sfLogger.allINeedToDoIsTrust(
      'ROMAN_SELF_REPAIR',
      'All three repair handlers active — immune system online',
      {
        handlers: ['ConnectionWatchdog', 'QueueClearanceProtocol', 'EdgeFunctionHeartbeat'],
        watchdog_interval_ms: WATCHDOG_INTERVAL_MS,
        queue_zombie_threshold_ms: QUEUE_ZOMBIE_THRESHOLD_MS,
        heartbeat_interval_ms: HEARTBEAT_INTERVAL_MS,
      }
    );

    console.log('[R.O.M.A.N. Self-Repair] ✅ Immune system ONLINE');
  }

  /** Deactivate all handlers */
  deactivate(): void {
    this.connectionWatchdog.stop();
    this.queueClearance.stop();
    this.edgeHeartbeat.stop();
    this.running = false;
    console.log('[R.O.M.A.N. Self-Repair] 🔴 Immune system OFFLINE');
  }

  /** Run a one-shot manual diagnostic across all three handlers */
  async runDiagnostic(): Promise<{
    database: boolean;
    queueZombies: number;
    edgeFunctions: Record<string, boolean>;
  }> {
    const database = await this.connectionWatchdog.probe();
    await this.queueClearance.scanForZombies();
    const queueZombies = this.queueClearance.queueSize();

    const edgeFunctions: Record<string, boolean> = {};
    for (const fn of CRITICAL_EDGE_FUNCTIONS) {
      edgeFunctions[fn] = await this.edgeHeartbeat.ping(fn);
    }

    sfLogger.everyday(
      'ROMAN_SELF_REPAIR',
      'Manual diagnostic complete',
      { database, queueZombies, edgeFunctions }
    );

    return { database, queueZombies, edgeFunctions };
  }

  isRunning(): boolean {
    return this.running;
  }
}

// ─── SINGLETON ────────────────────────────────────────────────────────────────

export const romanSelfRepair = new RomanSelfRepair();
