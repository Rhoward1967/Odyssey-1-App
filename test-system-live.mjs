// 🚀 SYSTEM ALIVE TEST - Verifies all critical components
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🛰️ ODYSSEY-1 SYSTEM ALIVE TEST\n');
console.log('='.repeat(70));

let passed = 0;
let failed = 0;

// Test 1: Subscription Tiers (Critical for checkout)
console.log('\n💰 TEST 1: Subscription Tiers');
const { data: tiers, count: tierCount } = await supabase
  .from('subscription_tiers')
  .select('*', { count: 'exact' });

if (tierCount === 4) {
  console.log('✅ PASS: 4 subscription tiers found');
  console.log('   ', tiers.map(t => `${t.tier_name} ($${t.monthly_price_usd})`).join(', '));
  passed++;
} else {
  console.log('❌ FAIL: Expected 4 tiers, found', tierCount);
  failed++;
}

// Test 2: pg_cron Jobs
console.log('\n⏰ TEST 2: pg_cron Scheduled Jobs');
const { data: jobs } = await supabase.rpc('cron.job').catch(() => ({ data: null }));

if (jobs && jobs.length >= 2) {
  console.log('✅ PASS:', jobs.length, 'cron jobs scheduled');
  passed++;
} else {
  console.log('❌ FAIL: No cron jobs found (pg_cron may not be enabled)');
  failed++;
}

// Test 3: Performance Snapshots (Check if data is collecting)
console.log('\n📊 TEST 3: Performance Snapshots Collection');
const { data: snapshots, count: snapshotCount } = await supabase
  .from('performance_snapshots')
  .select('*', { count: 'exact', head: true });

if (snapshotCount > 0) {
  console.log('✅ PASS:', snapshotCount, 'performance snapshots collected');
  passed++;
} else {
  console.log('⚠️ PENDING: 0 snapshots (wait 5 minutes after migration, then re-run)');
}

// Test 4: R.O.M.A.N. Activity
console.log('\n🤖 TEST 4: R.O.M.A.N. Operational Status');
const { count: logsCount } = await supabase
  .from('system_logs')
  .select('*', { count: 'exact', head: true });

const { count: governanceCount } = await supabase
  .from('governance_changes')
  .select('*', { count: 'exact', head: true });

if (logsCount > 0 && governanceCount > 0) {
  console.log('✅ PASS: R.O.M.A.N. active');
  console.log('   ', logsCount, 'system logs,', governanceCount, 'governance changes');
  passed++;
} else {
  console.log('❌ FAIL: R.O.M.A.N. not logging activity');
  failed++;
}

// Test 5: Test User Registration (Email Confirmation Check)
console.log('\n👤 TEST 5: User Registration Flow');
const testEmail = `test-${Date.now()}@odyssey1.local`;
const { data: newUser, error: signUpError } = await supabase.auth.admin.createUser({
  email: testEmail,
  password: 'TestPass123!',
  email_confirm: true // Auto-confirm
});

if (newUser && !signUpError) {
  console.log('✅ PASS: User registration working');
  console.log('    Email confirmation:', newUser.user.confirmed_at ? 'AUTO-CONFIRMED ✅' : 'WAITING (❌ disable in Supabase Dashboard)');
  
  // Cleanup test user
  await supabase.auth.admin.deleteUser(newUser.user.id);
  passed++;
} else {
  console.log('❌ FAIL:', signUpError?.message || 'Unknown error');
  failed++;
}

// Test 6: Edge Function Secrets
console.log('\n🔐 TEST 6: Critical Secrets Check');
const requiredSecrets = [
  'ANTHROPIC_API_KEY',
  'OPENAI_API_KEY', 
  'STRIPE_SECRET_KEY'
];

console.log('⚠️ MANUAL CHECK: Verify in Supabase Dashboard → Edge Functions → Secrets');
requiredSecrets.forEach(secret => {
  console.log(`   [ ] ${secret}`);
});

// Final Summary
console.log('\n' + '='.repeat(70));
console.log(`\n📊 TEST RESULTS: ${passed} passed, ${failed} failed`);

if (failed === 0 && passed >= 4) {
  console.log('\n🎉 SYSTEM STATUS: ALIVE AND SOVEREIGN');
  console.log('\n✅ Next Steps:');
  console.log('   1. Complete platform toggles audit (PLATFORM_TOGGLES_AUDIT.md)');
  console.log('   2. Test checkout flow (requires Stripe keys)');
  console.log('   3. Monitor performance_snapshots growth (5 min intervals)');
} else {
  console.log('\n⚠️ SYSTEM STATUS: PARTIALLY OPERATIONAL');
  console.log('\n🔧 Required Actions:');
  console.log('   1. Apply Gemini migration if not done');
  console.log('   2. Disable email confirmation in Supabase Dashboard');
  console.log('   3. Wait 5 minutes for first performance snapshot');
  console.log('   4. Review PLATFORM_TOGGLES_AUDIT.md checklist');
}

console.log('\n');
