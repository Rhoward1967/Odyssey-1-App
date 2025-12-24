// Check Supabase telemetry/monitoring data collection status
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('📊 SUPABASE TELEMETRY & MONITORING STATUS CHECK\n');
console.log('='.repeat(70));

async function checkTableData(tableName, description) {
  try {
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`❌ ${description.padEnd(40)} ERROR: ${error.message}`);
    } else {
      const status = count > 0 ? '🟢' : '🔴';
      const statusText = count > 0 ? 'ACTIVE' : 'EMPTY';
      console.log(`${status} ${description.padEnd(40)} ${count || 0} rows (${statusText})`);
    }
  } catch (err) {
    console.log(`❌ ${description.padEnd(40)} EXCEPTION: ${err.message}`);
  }
}

// Core Telemetry Tables
console.log('\n📡 TELEMETRY & MONITORING TABLES:');
console.log('-'.repeat(70));
await checkTableData('system_metrics', 'System Metrics (performance/usage)');
await checkTableData('system_alerts', 'System Alerts');
await checkTableData('performance_snapshots', 'Performance Snapshots (5min aggregates)');
await checkTableData('feature_usage', 'Feature Usage Tracking');
await checkTableData('ai_intelligence_metrics', 'R.O.M.A.N. AI Intelligence Metrics');
await checkTableData('compliance_checks', 'Compliance Checks Log');

// Session & User Tracking
console.log('\n👥 USER ACTIVITY TRACKING:');
console.log('-'.repeat(70));
await checkTableData('user_sessions', 'User Sessions');
await checkTableData('user_usage', 'User Usage (billing period)');

// R.O.M.A.N. Specific
console.log('\n🤖 R.O.M.A.N. AUTONOMOUS OPERATIONS:');
console.log('-'.repeat(70));
await checkTableData('system_logs', 'System Logs (R.O.M.A.N. activity)');
await checkTableData('system_knowledge', 'System Knowledge (learning)');
await checkTableData('governance_changes', 'Governance Changes (autonomous fixes)');
await checkTableData('audit_trail', 'Audit Trail');

// Deployment & Operations
console.log('\n🚀 DEPLOYMENT & OPERATIONS:');
console.log('-'.repeat(70));
await checkTableData('deployments', 'Deployments');
await checkTableData('deployment_metrics', 'Deployment Metrics');
await checkTableData('rollback_events', 'Rollback Events');

// Business & Revenue
console.log('\n💰 BUSINESS & REVENUE TRACKING:');
console.log('-'.repeat(70));
await checkTableData('subscriptions', 'Subscriptions');
await checkTableData('subscription_tiers', 'Subscription Tiers');
await checkTableData('invoices', 'Invoices');
await checkTableData('payments', 'Payments');

console.log('\n' + '='.repeat(70));
console.log('\n🔍 DIAGNOSIS: Tables with 0 rows likely have disabled/unconfigured monitoring');
console.log('💡 ACTION: Check for missing cron jobs, triggers, or application code');
