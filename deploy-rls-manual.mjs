import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync } from 'fs';

config();

const MIGRATION_SQL = readFileSync(
  './supabase/migrations/20260131000000_add_rls_policies_customers_company_profiles.sql',
  'utf-8'
);

console.log('🔧 PRODUCTION RLS POLICY DEPLOYMENT');
console.log('='.repeat(70));
console.log(`📍 Database: ${process.env.SUPABASE_URL}`);
console.log(`📄 Migration: 20260131000000_add_rls_policies_customers_company_profiles.sql\n`);

// Create admin client with service role
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false }
  }
);

console.log('⚠️  CRITICAL: Cannot execute DDL statements via Supabase JS client.');
console.log('The Supabase REST API does not support arbitrary SQL execution for security.\n');

console.log('✅ SOLUTION: Execute migration via Supabase Dashboard SQL Editor\n');
console.log('📋 Steps:');
console.log('   1. Go to: https://supabase.com/dashboard/project/tvsxloejfsrdganemsmg/sql/new');
console.log('   2. Copy the migration SQL from file:');
console.log('      ./supabase/migrations/20260131000000_add_rls_policies_customers_company_profiles.sql');
console.log('   3. Paste and click "RUN"\n');

console.log('📄 Migration SQL:');
console.log('='.repeat(70));
console.log(MIGRATION_SQL);
console.log('='.repeat(70));

console.log('\n🔍 Verifying current state...\n');

// Test current access
const { data: customers, error } = await supabase
  .from('customers')
  .select('id, customer_name, user_id')
  .limit(3);

if (error) {
  console.error(`❌ Error querying customers: ${error.message}`);
} else {
  console.log(`✅ SERVICE_ROLE can query customers (${customers.length} records):`);
  console.table(customers);
}

// Try to get user_id from first customer to test with their credentials
if (customers && customers.length > 0 && customers[0].user_id) {
  console.log(`\n🔐 Testing with authenticated user: ${customers[0].user_id}`);
  console.log('   (This will fail until RLS policies are deployed)\n');
  
  // Create a client with ANON key (simulating frontend)
  const anonClient = createClient(
    process.env.SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  );
  
  const { data: anonData, error: anonError } = await anonClient
    .from('customers')
    .select('id, customer_name')
    .limit(1);
  
  if (anonError) {
    console.error(`❌ ANON client blocked: ${anonError.message}`);
    console.error('   This confirms RLS is blocking unauthenticated access.');
    console.error('   Frontend users will experience same issue until policies deployed.');
  } else {
    console.log(`✅ ANON client can query! Policies may already be in place.`);
    console.table(anonData);
  }
}

console.log('\n💡 NEXT STEPS:');
console.log('   1. Execute the SQL in Supabase Dashboard (link above)');
console.log('   2. Run this script again to verify');
console.log('   3. Test frontend to confirm 400/500 errors are resolved\n');
