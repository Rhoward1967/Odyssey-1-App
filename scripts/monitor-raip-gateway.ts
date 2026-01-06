/**
 * RAIP GATEWAY 72-HOUR MONITORING SCRIPT
 * Created: January 6, 2026
 * Purpose: Track system stability post-deployment
 * Duration: 72 hours from deployment
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface MonitoringSnapshot {
  timestamp: string;
  metrics: {
    totalAgents: number;
    trustedAgents: number;
    verifiedAgents: number;
    untrustedAgents: number;
    recentHandshakes: number;
    temptationsTriggers: number;
    totalAuditEvents: number;
    edgeFunctionHealth: 'OPERATIONAL' | 'DEGRADED' | 'DOWN';
  };
  alerts: string[];
}

async function checkAgentRegistry() {
  const { data: agents, error } = await supabase
    .from('ai_agent_registry')
    .select('*');

  if (error) throw error;

  const trusted = agents?.filter(a => a.trust_level === 'TRUSTED').length || 0;
  const verified = agents?.filter(a => a.trust_level === 'VERIFIED').length || 0;
  const untrusted = agents?.filter(a => a.trust_level === 'UNTRUSTED').length || 0;

  // Check for handshakes in last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const recentHandshakes = agents?.filter(a => 
    a.last_handshake_at && new Date(a.last_handshake_at) > new Date(oneHourAgo)
  ).length || 0;

  return {
    totalAgents: agents?.length || 0,
    trustedAgents: trusted,
    verifiedAgents: verified,
    untrustedAgents: untrusted,
    recentHandshakes
  };
}

async function checkAuditLogs() {
  const { data: logs, error } = await supabase
    .from('roman_audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1000);

  if (error) throw error;

  const temptations = logs?.filter(l => l.event_type === 'TEMPTATIONS').length || 0;
  const totalEvents = logs?.length || 0;

  return { temptationsTriggers: temptations, totalAuditEvents: totalEvents };
}

async function checkEdgeFunctionHealth() {
  try {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/raip-handshake`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.VITE_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY!}`
        },
        body: JSON.stringify({
          phase: 'init',
          agent_id: 'health-check-probe'
        })
      }
    );

    // We expect 200 with challenge, or 4xx for validation errors
    // Both indicate the function is running
    if (response.status === 200 || (response.status >= 400 && response.status < 500)) {
      return 'OPERATIONAL' as const;
    }

    return 'DEGRADED' as const;
  } catch (error) {
    console.error('Edge function health check failed:', error);
    return 'DOWN' as const;
  }
}

async function runMonitoringCheck(): Promise<MonitoringSnapshot> {
  console.log('\n🔍 Running RAIP Gateway monitoring check...\n');

  const alerts: string[] = [];

  // Check registry
  const registryMetrics = await checkAgentRegistry();
  console.log('📊 Agent Registry:');
  console.log(`   Total Agents: ${registryMetrics.totalAgents}`);
  console.log(`   ✅ TRUSTED: ${registryMetrics.trustedAgents}`);
  console.log(`   🔵 VERIFIED: ${registryMetrics.verifiedAgents}`);
  console.log(`   ⚠️  UNTRUSTED: ${registryMetrics.untrustedAgents}`);
  console.log(`   🤝 Recent Handshakes (1hr): ${registryMetrics.recentHandshakes}`);

  // Check audit logs
  const auditMetrics = await checkAuditLogs();
  console.log('\n📝 Audit Logs:');
  console.log(`   Total Events: ${auditMetrics.totalAuditEvents}`);
  console.log(`   🚨 TEMPTATIONS Triggers: ${auditMetrics.temptationsTriggers}`);

  if (auditMetrics.temptationsTriggers > 10) {
    alerts.push(`HIGH ALERT: ${auditMetrics.temptationsTriggers} TEMPTATIONS triggers detected`);
  }

  // Check edge function
  const edgeHealth = await checkEdgeFunctionHealth();
  console.log('\n⚡ Edge Function Health:');
  console.log(`   Status: ${edgeHealth}`);

  if (edgeHealth !== 'OPERATIONAL') {
    alerts.push(`CRITICAL: Edge function status is ${edgeHealth}`);
  }

  // Display alerts
  if (alerts.length > 0) {
    console.log('\n🚨 ALERTS:');
    alerts.forEach(alert => console.log(`   ⚠️  ${alert}`));
  } else {
    console.log('\n✅ All systems nominal');
  }

  const snapshot: MonitoringSnapshot = {
    timestamp: new Date().toISOString(),
    metrics: {
      ...registryMetrics,
      ...auditMetrics,
      edgeFunctionHealth: edgeHealth
    },
    alerts
  };

  return snapshot;
}

async function saveSnapshot(snapshot: MonitoringSnapshot) {
  const logDir = path.join(process.cwd(), 'monitoring-logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logFile = path.join(logDir, 'raip-gateway-monitoring.jsonl');
  fs.appendFileSync(logFile, JSON.stringify(snapshot) + '\n');

  console.log(`\n💾 Snapshot saved to ${logFile}`);
}

async function generateSummaryReport() {
  const logFile = path.join(process.cwd(), 'monitoring-logs', 'raip-gateway-monitoring.jsonl');
  
  if (!fs.existsSync(logFile)) {
    console.log('No monitoring data available yet.');
    return;
  }

  const lines = fs.readFileSync(logFile, 'utf-8').trim().split('\n');
  const snapshots: MonitoringSnapshot[] = lines.map(line => JSON.parse(line));

  console.log('\n📈 RAIP GATEWAY MONITORING SUMMARY');
  console.log('='.repeat(60));
  console.log(`Monitoring Period: ${snapshots[0]?.timestamp} → ${snapshots[snapshots.length - 1]?.timestamp}`);
  console.log(`Total Snapshots: ${snapshots.length}`);
  
  const allAlerts = snapshots.flatMap(s => s.alerts);
  console.log(`\n🚨 Total Alerts: ${allAlerts.length}`);
  if (allAlerts.length > 0) {
    console.log('Recent Alerts:');
    allAlerts.slice(-5).forEach(alert => console.log(`   - ${alert}`));
  }

  const latestMetrics = snapshots[snapshots.length - 1]?.metrics;
  console.log('\n📊 Current Status:');
  console.log(`   Total Agents: ${latestMetrics?.totalAgents}`);
  console.log(`   TEMPTATIONS Triggers: ${latestMetrics?.temptationsTriggers}`);
  console.log(`   Edge Function: ${latestMetrics?.edgeFunctionHealth}`);
  console.log('='.repeat(60));
}

// Main execution
const args = process.argv.slice(2);

if (args.includes('--summary')) {
  generateSummaryReport();
} else {
  runMonitoringCheck()
    .then(saveSnapshot)
    .catch(error => {
      console.error('❌ Monitoring check failed:', error);
      process.exit(1);
    });
}
