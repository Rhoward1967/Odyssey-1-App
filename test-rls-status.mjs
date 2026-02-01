import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('\n========== TESTING RLS POLICIES ==========\n');
console.log('Database:', process.env.SUPABASE_URL);

// Test with SERVICE_ROLE (bypasses RLS)
console.log('\n1. Testing with SERVICE_ROLE key (bypasses RLS)...');
const { data: serviceData, error: serviceError } = await supabase
  .from('customers')
  .select('id, customer_name, user_id')
  .limit(3);

if (serviceError) {
  console.error('❌ SERVICE_ROLE Error:', serviceError.message);
} else {
  console.log(`✅ SERVICE_ROLE Success: ${serviceData.length} customers`);
  console.table(serviceData);
}

// Test with ANON key (enforces RLS)
console.log('\n2. Testing with ANON key (enforces RLS - simulates frontend)...');
const anonClient = createClient(
  process.env.SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const { data: anonData, error: anonError } = await anonClient
  .from('customers')
  .select('id, customer_name')
  .limit(3);

if (anonError) {
  console.error('❌ ANON Error:', anonError.message);
  console.error('   Code:', anonError.code);
  console.error('\n   This confirms RLS is blocking queries!');
  console.error('   RLS policies need to be deployed.\n');
} else {
  console.log(`✅ ANON Success: ${anonData.length} customers`);
  console.table(anonData);
  console.log('\n   RLS policies may already be working!\n');
}

console.log('\n========== MIGRATION SQL TO EXECUTE ==========\n');
console.log('Execute this in Supabase Dashboard:');
console.log('https://supabase.com/dashboard/project/tvsxloejfsrdganemsmg/sql/new\n');
console.log(`
-- Add RLS policies for customers and company_profiles

BEGIN;

-- CUSTOMERS TABLE
DROP POLICY IF EXISTS "Users can view own customers" ON customers;
CREATE POLICY "Users can view own customers" ON customers
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert own customers" ON customers;
CREATE POLICY "Users can insert own customers" ON customers
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own customers" ON customers
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- COMPANY_PROFILES TABLE  
DROP POLICY IF EXISTS "Users can view own profile" ON company_profiles;
CREATE POLICY "Users can view own profile" ON company_profiles
FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON company_profiles;
CREATE POLICY "Users can update own profile" ON company_profiles
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

COMMIT;
`);
console.log('\n===========================================\n');
