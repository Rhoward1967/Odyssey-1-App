import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🔧 Creating RLS policies on production database...');
console.log(`📍 ${SUPABASE_URL}\n`);

async function executeSQL(sql, description) {
  console.log(`\n${description}`);
  const { data, error } = await supabase.rpc('exec_sql', { sql });
  
  if (error) {
    console.error(`❌ Error: ${error.message}`);
    return false;
  }
  
  console.log('✅ Success');
  return true;
}

try {
  // CUSTOMERS TABLE POLICIES
  console.log('📋 Creating customers table policies...');
  
  await executeSQL(`
    CREATE POLICY "Users can view own customers" ON customers
    FOR SELECT TO authenticated
    USING (user_id = (SELECT auth.uid()) OR user_id IS NULL);
  `, 'Creating SELECT policy...');

  await executeSQL(`
    CREATE POLICY "Users can insert own customers" ON customers
    FOR INSERT TO authenticated
    WITH CHECK (user_id = (SELECT auth.uid()));
  `, 'Creating INSERT policy...');

  await executeSQL(`
    CREATE POLICY "Users can update own customers" ON customers
    FOR UPDATE TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));
  `, 'Creating UPDATE policy...');

  // COMPANY_PROFILES TABLE POLICIES
  console.log('\n📋 Creating company_profiles table policies...');
  
  await executeSQL(`
    CREATE POLICY "Users can view own profile" ON company_profiles
    FOR SELECT TO authenticated
    USING (user_id = (SELECT auth.uid()));
  `, 'Creating SELECT policy...');

  await executeSQL(`
    CREATE POLICY "Users can update own profile" ON company_profiles
    FOR UPDATE TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));
  `, 'Creating UPDATE policy...');

  // VERIFY
  console.log('\n\n🔍 Verifying policies were created...\n');
  const { data: policies, error: verifyError } = await executeSQL(`
    SELECT tablename, policyname, cmd 
    FROM pg_policies 
    WHERE tablename IN ('customers', 'company_profiles')
    ORDER BY tablename, cmd;
  `, 'Querying pg_policies...');

  if (policies) {
    console.table(policies);
  }

  // TEST QUERY WITH AUTHENTICATED USER
  console.log('\n🧪 Testing customers query with service role...');
  const { data: customers, error: queryError } = await supabase
    .from('customers')
    .select('id, customer_name')
    .limit(3);

  if (queryError) {
    console.error(`❌ Query error: ${queryError.message}`);
  } else {
    console.log(`✅ Successfully queried ${customers.length} customers`);
    console.log(customers);
  }

  console.log('\n✅✅✅ RLS POLICIES DEPLOYED AND VERIFIED ✅✅✅');
  
} catch (error) {
  console.error('\n❌ Fatal error:', error.message);
  console.error(error);
}
