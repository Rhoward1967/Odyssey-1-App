import { config } from 'dotenv';
import postgres from 'postgres';

config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Missing DATABASE_URL in .env');
  process.exit(1);
}

const sql = postgres(connectionString, {
  max: 1,
  ssl: 'require'
});

console.log('🔧 Creating RLS policies on production database...\n');

try {
  // CUSTOMERS TABLE POLICIES
  console.log('📋 Creating customers table policies...');
  
  await sql`
    CREATE POLICY "Users can view own customers" ON customers
    FOR SELECT TO authenticated
    USING (user_id = (SELECT auth.uid()) OR user_id IS NULL)
  `;
  console.log('✅ Created SELECT policy for customers');

  await sql`
    CREATE POLICY "Users can insert own customers" ON customers
    FOR INSERT TO authenticated
    WITH CHECK (user_id = (SELECT auth.uid()))
  `;
  console.log('✅ Created INSERT policy for customers');

  await sql`
    CREATE POLICY "Users can update own customers" ON customers
    FOR UPDATE TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()))
  `;
  console.log('✅ Created UPDATE policy for customers');

  // COMPANY_PROFILES TABLE POLICIES
  console.log('\n📋 Creating company_profiles table policies...');
  
  await sql`
    CREATE POLICY "Users can view own profile" ON company_profiles
    FOR SELECT TO authenticated
    USING (user_id = (SELECT auth.uid()))
  `;
  console.log('✅ Created SELECT policy for company_profiles');

  await sql`
    CREATE POLICY "Users can update own profile" ON company_profiles
    FOR UPDATE TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()))
  `;
  console.log('✅ Created UPDATE policy for company_profiles');

  // VERIFY
  console.log('\n🔍 Verifying policies...\n');
  const policies = await sql`
    SELECT tablename, policyname, cmd 
    FROM pg_policies 
    WHERE tablename IN ('customers', 'company_profiles')
    ORDER BY tablename, cmd
  `;
  
  console.table(policies);

  // TEST QUERY
  console.log('\n🧪 Testing customers query...');
  const customers = await sql`
    SELECT id, customer_name 
    FROM customers 
    LIMIT 3
  `;
  
  console.log(`✅ Successfully queried ${customers.length} customers:`);
  console.log(customers);

  console.log('\n✅✅✅ RLS POLICIES DEPLOYED AND VERIFIED ✅✅✅');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error);
} finally {
  await sql.end();
}
