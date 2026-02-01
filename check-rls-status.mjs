import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    db: { schema: 'public' },
    auth: { autoRefreshToken: false, persistSession: false }
  }
);

console.log('🔧 Deploying RLS policies to production database...');
console.log(`📍 ${process.env.SUPABASE_URL}\n`);

// Use raw SQL execution via the PostgREST API
async function executeRawSQL(sql) {
  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/exec`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Prefer': 'params=single-object'
    },
    body: JSON.stringify({ sql })
  });

  return { ok: response.ok, status: response.status, data: await response.text() };
}

// Since we can't execute arbitrary SQL via REST API, let's check current state
console.log('🔍 Checking current RLS policies...\n');

const { data: existingPolicies, error: policyError } = await supabase
  .from('pg_policies')
  .select('tablename, policyname, cmd')
  .in('tablename', ['customers', 'company_profiles']);

if (policyError) {
  console.error('Note: Could not query pg_policies (expected - requires special permissions)');
  console.error(policyError.message);
} else {
  console.log('Existing policies:');
  console.table(existingPolicies);
}

// Test if we can query customers - if yes, RLS is working or service role bypasses it
console.log('\n🧪 Testing customers table query with SERVICE_ROLE...');

const { data: customers, error: queryError } = await supabase
  .from('customers')
  .select('id, customer_name, user_id')
  .limit(5);

if (queryError) {
  console.error(`❌ Query failed: ${queryError.message}`);
  console.error('RLS is blocking even SERVICE_ROLE queries - this should not happen!');
} else {
  console.log(`✅ Successfully queried ${customers.length} customers (SERVICE_ROLE bypasses RLS):`);
  console.table(customers);
}

// Now test with a regular authenticated user token
console.log('\n🔐 The issue is: authenticated users cannot query these tables.');
console.log('SERVICE_ROLE can bypass RLS, but frontend uses ANON_KEY which enforces RLS.');
console.log('\n📋 Required SQL (must be executed via Supabase Dashboard SQL Editor):');
console.log('='.repeat(70));
console.log(`
-- CUSTOMERS TABLE POLICIES
CREATE POLICY "Users can view own customers" ON customers
FOR SELECT TO authenticated
USING (user_id = (SELECT auth.uid()) OR user_id IS NULL);

CREATE POLICY "Users can insert own customers" ON customers
FOR INSERT TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own customers" ON customers
FOR UPDATE TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- COMPANY_PROFILES TABLE POLICIES
CREATE POLICY "Users can view own profile" ON company_profiles
FOR SELECT TO authenticated
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own profile" ON company_profiles
FOR UPDATE TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));
`);
console.log('='.repeat(70));
console.log('\n📝 Please execute the above SQL in Supabase Dashboard:');
console.log(`   https://supabase.com/dashboard/project/tvsxloejfsrdganemsmg/sql/new`);
console.log('\n💡 OR I can create a migration file for you to apply.');
