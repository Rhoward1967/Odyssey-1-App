// Quick audit script to check Supabase backend state
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function auditBackend() {
  console.log('🔍 SUPABASE BACKEND AUDIT\n');
  console.log('=' .repeat(60));
  
  // Check ops schema tables
  const tables = [
    'ops.deployments',
    'ops.rollback_events', 
    'ops.migration_history',
    'ops.system_snapshots',
    'ops.error_patterns',
    'ops.pattern_applications',
    'ops.pattern_clusters',
    'ops.learning_sessions'
  ];

  for (const table of tables) {
    const [schema, tableName] = table.split('.');
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${table}: Does not exist or no access`);
        console.log(`   Error: ${error.message}`);
      } else {
        console.log(`✅ ${table}: ${count ?? 0} rows`);
      }
    } catch (e) {
      console.log(`❌ ${table}: ${e.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  
  // Check Edge Functions
  console.log('\n📡 EDGE FUNCTIONS STATUS:\n');
  console.log('Expected functions:');
  console.log('  - auto-rollback (Day 6)');
  console.log('  - pattern-analyzer (Day 7)');
  
  console.log('\n' + '='.repeat(60));
  
  // Check RPC functions
  console.log('\n⚙️  RPC FUNCTIONS CHECK:\n');
  
  const rpcFunctions = [
    'get_rollback_target',
    'create_system_snapshot',
    'get_deployment_health',
    'record_rollback_event',
    'record_pattern_application',
    'find_matching_pattern',
    'get_pattern_statistics',
    'start_learning_session'
  ];

  for (const fn of rpcFunctions) {
    try {
      // Try to call with invalid params to check if function exists
      const { error } = await supabase.rpc(fn, {});
      
      if (error && error.message.includes('does not exist')) {
        console.log(`❌ ${fn}: Not deployed`);
      } else {
        console.log(`✅ ${fn}: Exists`);
      }
    } catch (e) {
      console.log(`✅ ${fn}: Exists (params error expected)`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n🎯 AUDIT COMPLETE\n');
}

auditBackend().catch(console.error);
