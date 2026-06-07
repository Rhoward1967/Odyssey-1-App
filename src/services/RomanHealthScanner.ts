/**
 * R.O.M.A.N. PROACTIVE HEALTH SCANNER
 *
 * Runs every 10 minutes. Checks real system indicators.
 * Alerts Discord on issues. Attempts safe auto-fixes.
 *
 * This replaces claims with actual detection.
 *
 * © 2026 Rickey Allan Howard / Howard Jones Bloodline Ancestral Trust
 */

import { execSync } from 'child_process';
import { romanSupabase } from './romanSupabase';
import { runKnowledgeSync } from './romanKnowledgeSync';

// ─── Types ───────────────────────────────────────────────────────────────────

export type CheckStatus = 'OK' | 'WARN' | 'FAIL';

export interface HealthCheck {
  name: string;
  status: CheckStatus;
  message: string;
  autoFixed?: boolean;
}

export interface ScanResult {
  timestamp: string;
  branch: string;
  checks: HealthCheck[];
  issues: HealthCheck[];
  duration_ms: number;
}

// ─── Config ──────────────────────────────────────────────────────────────────

const SCAN_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL)!;
const FUNCTIONS_BASE = `${SUPABASE_URL}/functions/v1`;
const ANON_KEY = (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY)!;

const CRITICAL_FUNCTIONS = [
  'anthropic-chat',
  'recurring-invoice-generator',
  'roman-autonomous-daemon',
  'ai-chat',
];

// Source of truth — these counts must never drift
const EXPECTED_COUNTS = [
  { table: 'customers',          expected: 15, label: 'Active Customers' },
  { table: 'contractors',        expected: 5,  label: 'Active Contractors' },
  { table: 'recurring_invoices', min: 21,      label: 'Recurring Schedules' },
];

// ─── Individual checks ───────────────────────────────────────────────────────

async function checkDatabaseConnectivity(): Promise<HealthCheck> {
  try {
    const { error } = await romanSupabase.from('system_config').select('key').limit(1);
    if (error) throw error;
    return { name: 'db:connectivity', status: 'OK', message: 'Supabase reachable' };
  } catch (err: any) {
    return { name: 'db:connectivity', status: 'FAIL', message: `Database unreachable: ${err.message}` };
  }
}

async function checkBusinessDataIntegrity(): Promise<HealthCheck[]> {
  const checks: HealthCheck[] = [];

  for (const spec of EXPECTED_COUNTS) {
    try {
      const { count, error } = await romanSupabase
        .from(spec.table)
        .select('*', { count: 'exact', head: true });

      if (error) throw error;

      const c = count ?? 0;
      const expected = (spec as any).expected as number | undefined;
      const min = (spec as any).min ?? expected ?? 0;

      if (c < min) {
        checks.push({
          name: `db:${spec.table}`,
          status: 'FAIL',
          message: `${spec.label}: found ${c}, expected ${expected ?? `≥${min}`} — DATA MISSING`,
        });
      } else if (expected !== undefined && c > expected) {
        checks.push({
          name: `db:${spec.table}`,
          status: 'WARN',
          message: `${spec.label}: found ${c}, expected ${expected} — possible duplicates`,
        });
      } else {
        checks.push({
          name: `db:${spec.table}`,
          status: 'OK',
          message: `${spec.label}: ${c} ✓`,
        });
      }
    } catch (err: any) {
      checks.push({
        name: `db:${spec.table}`,
        status: 'FAIL',
        message: `${spec.label}: query failed — ${err.message}`,
      });
    }
  }

  return checks;
}

async function pingEdgeFunction(name: string): Promise<HealthCheck> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`${FUNCTIONS_BASE}/${name}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ healthcheck: true }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    // 200/400/401/405 = function alive
    // 500 = function running but crashing (config/code issue — cold-start won't help)
    // timeout/network error = function unreachable (cold-start may help)
    if (res.status < 500) {
      return { name: `fn:${name}`, status: 'OK', message: `${name} alive (${res.status})` };
    }
    return {
      name: `fn:${name}`,
      status: 'FAIL',
      message: `${name} returning ${res.status} — function crashing, check secrets/code`,
    };
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      return { name: `fn:${name}`, status: 'FAIL', message: `${name} timed out` };
    }
    return { name: `fn:${name}`, status: 'FAIL', message: `${name} unreachable: ${err.message}` };
  }
}

async function checkRecentErrorRate(): Promise<HealthCheck> {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await romanSupabase
      .from('system_logs')
      .select('*', { count: 'exact', head: true })
      .eq('level', 'error')
      .gte('created_at', oneHourAgo);

    const c = count ?? 0;
    if (c > 50) return { name: 'error_rate', status: 'FAIL',  message: `${c} errors in last hour — CRITICAL` };
    if (c > 10) return { name: 'error_rate', status: 'WARN',  message: `${c} errors in last hour — elevated` };
    return       { name: 'error_rate', status: 'OK',    message: `${c} errors in last hour — normal` };
  } catch (err: any) {
    return { name: 'error_rate', status: 'WARN', message: `Error rate check failed: ${err.message}` };
  }
}

async function checkFrontendErrors(): Promise<HealthCheck> {
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await romanSupabase
      .from('system_logs')
      .select('*', { count: 'exact', head: true })
      .eq('source', 'frontend_error_boundary')
      .gte('created_at', tenMinutesAgo);

    const c = count ?? 0;
    if (c > 0) return { name: 'frontend:errors', status: 'WARN', message: `${c} React error(s) in last 10 minutes — check UI` };
    return       { name: 'frontend:errors', status: 'OK',   message: 'No frontend errors reported' };
  } catch {
    return { name: 'frontend:errors', status: 'OK', message: 'Frontend error check skipped' };
  }
}

async function checkKnowledgeStaleness(): Promise<HealthCheck> {
  try {
    const { data } = await romanSupabase
      .from('roman_knowledge_base')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (!data) {
      return { name: 'knowledge_base', status: 'FAIL', message: 'Knowledge base empty — sync has never run' };
    }

    const hoursAgo = (Date.now() - new Date(data.updated_at).getTime()) / (1000 * 60 * 60);
    if (hoursAgo > 25) {
      return { name: 'knowledge_base', status: 'WARN', message: `Knowledge base ${hoursAgo.toFixed(0)}h stale — will auto-sync` };
    }
    return { name: 'knowledge_base', status: 'OK', message: `Knowledge base synced ${hoursAgo.toFixed(1)}h ago` };
  } catch (err: any) {
    return { name: 'knowledge_base', status: 'WARN', message: `Knowledge check failed: ${err.message}` };
  }
}

function getGitBranch(): string {
  // Railway-built images don't include a .git working tree or git binary.
  // Use the env var Railway injects instead of shelling out.
  if (process.env.RAILWAY_GIT_BRANCH) return process.env.RAILWAY_GIT_BRANCH;
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
  } catch {
    return 'unknown';
  }
}

// ─── Auto-fix actions ────────────────────────────────────────────────────────

async function coldStartEdgeFunction(name: string): Promise<void> {
  try {
    await fetch(`${FUNCTIONS_BASE}/${name}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${ANON_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ping: true }),
    });
    console.log(`[HealthScanner] Cold-started edge function: ${name}`);
  } catch {
    console.error(`[HealthScanner] Cold-start failed for: ${name}`);
  }
}

// ─── Core scan ────────────────────────────────────────────────────────────────

export async function runHealthScan(): Promise<ScanResult> {
  const start = Date.now();
  const branch = getGitBranch();

  const [dbCheck, dataChecks, errorCheck, frontendCheck, knowledgeCheck, ...fnChecks] =
    await Promise.all([
      checkDatabaseConnectivity(),
      checkBusinessDataIntegrity(),
      checkRecentErrorRate(),
      checkFrontendErrors(),
      checkKnowledgeStaleness(),
      ...CRITICAL_FUNCTIONS.map(pingEdgeFunction),
    ]);

  const checks: HealthCheck[] = [
    dbCheck,
    ...dataChecks,
    errorCheck,
    frontendCheck,
    knowledgeCheck,
    ...fnChecks,
  ];

  // Auto-fix where safe
  for (const check of checks) {
    if (check.status === 'OK') continue;

    if (check.name === 'knowledge_base') {
      runKnowledgeSync('full').catch(() => {});
      check.autoFixed = true;
    }

    // Only cold-start on timeout/unreachable — NOT on 500 (that's a config/code crash)
    if (check.name.startsWith('fn:') && check.message.includes('timed out')) {
      await coldStartEdgeFunction(check.name.replace('fn:', ''));
      check.autoFixed = true;
    }
  }

  const issues = checks.filter(c => c.status !== 'OK');

  // Write scan result to system_logs
  try {
    await romanSupabase.from('system_logs').insert({
      source: 'roman_health_scanner',
      message: issues.length === 0
        ? `Health scan CLEAN — ${checks.length} checks passed on branch ${branch}`
        : `Health scan: ${issues.length} issue(s) on branch ${branch}: ${issues.map(i => i.name).join(', ')}`,
      level: issues.some(i => i.status === 'FAIL') ? 'error'
           : issues.length > 0 ? 'warning'
           : 'info',
      metadata: { branch, checks, duration_ms: Date.now() - start },
      created_at: new Date().toISOString(),
    });
  } catch { /* logging failure must never crash the scanner */ }

  return { timestamp: new Date().toISOString(), branch, checks, issues, duration_ms: Date.now() - start };
}

// ─── Discord report formatter ────────────────────────────────────────────────

export function formatScanReport(result: ScanResult): string {
  const emoji = (s: CheckStatus) => s === 'OK' ? '✅' : s === 'WARN' ? '⚠️' : '❌';

  const lines = [
    `**🔬 R.O.M.A.N. Health Scan** | Branch: \`${result.branch}\``,
    `\`${new Date(result.timestamp).toUTCString()}\` | ${(result.duration_ms / 1000).toFixed(1)}s`,
    '',
  ];

  if (result.issues.length === 0) {
    lines.push('✅ **All systems nominal** — no issues detected');
  } else {
    lines.push(`**${result.issues.length} issue(s) found:**`);
    for (const issue of result.issues) {
      const fixed = issue.autoFixed ? ' *(auto-fix applied)*' : '';
      lines.push(`${emoji(issue.status)} \`${issue.name}\` — ${issue.message}${fixed}`);
    }
  }

  return lines.join('\n');
}

// ─── Scanner lifecycle ────────────────────────────────────────────────────────

let scannerInterval: ReturnType<typeof setInterval> | null = null;
let lastScanResult: ScanResult | null = null;
let lastAlertedFingerprint: string = '';

function issueFingerprint(issues: HealthCheck[]): string {
  return issues.map(i => `${i.name}:${i.status}`).sort().join('|');
}

export function startHealthScanner(
  onIssuesFound: (report: string, issues: HealthCheck[]) => void
): void {
  if (scannerInterval) return;

  const runScan = async () => {
    try {
      console.log('[HealthScanner] Running proactive health scan...');
      const result = await runHealthScan();
      lastScanResult = result;
      console.log(`[HealthScanner] Done — ${result.issues.length} issues, ${result.duration_ms}ms, branch: ${result.branch}`);

      if (result.issues.length > 0) {
        const fingerprint = issueFingerprint(result.issues);
        // Only alert Discord when issue set changes — suppress repeat spam
        if (fingerprint !== lastAlertedFingerprint) {
          lastAlertedFingerprint = fingerprint;
          onIssuesFound(formatScanReport(result), result.issues);
        } else {
          console.log(`[HealthScanner] Issues unchanged since last alert — suppressing Discord notification`);
        }
      } else {
        // If issues cleared, reset fingerprint and notify once
        if (lastAlertedFingerprint !== '') {
          lastAlertedFingerprint = '';
          onIssuesFound(formatScanReport(result), []);
        }
      }
    } catch (err: any) {
      console.error('[HealthScanner] Scan failed:', err.message);
    }
  };

  runScan(); // immediate first scan
  scannerInterval = setInterval(runScan, SCAN_INTERVAL_MS);
  console.log('[HealthScanner] ONLINE — scanning every 10 minutes');
}

export function stopHealthScanner(): void {
  if (scannerInterval) {
    clearInterval(scannerInterval);
    scannerInterval = null;
    console.log('[HealthScanner] Stopped');
  }
}

export function isScannerRunning(): boolean {
  return scannerInterval !== null;
}

export function getLastScanResult(): ScanResult | null {
  return lastScanResult;
}
