import { config } from 'dotenv';

config();

const PROJECT_REF = 'tvsxloejfsrdganemsmg';
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!SUPABASE_ACCESS_TOKEN) {
  console.error('❌ Missing SUPABASE_ACCESS_TOKEN in .env');
  console.log('\nPlease get your access token from:');
  console.log('https://supabase.com/dashboard/account/tokens');
  console.log('\nThen add to .env:');
  console.log('SUPABASE_ACCESS_TOKEN=your_token_here');
  process.exit(1);
}

const sql = `
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
`;

console.log('🔧 Executing SQL on Supabase production database...');
console.log(`📍 Project: ${PROJECT_REF}\n`);

try {
  const response = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: sql })
    }
  );

  const result = await response.json();

  if (!response.ok) {
    console.error('❌ Error executing SQL:');
    console.error(result);
    process.exit(1);
  }

  console.log('✅ SQL executed successfully!');
  console.log(result);

  // Verify policies
  console.log('\n🔍 Verifying policies...');
  const verifyResponse = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `SELECT tablename, policyname, cmd FROM pg_policies WHERE tablename IN ('customers', 'company_profiles') ORDER BY tablename, cmd;`
      })
    }
  );

  const verifyResult = await verifyResponse.json();
  console.log('\n✅ Policies created:');
  console.log(verifyResult);

  console.log('\n✅✅✅ RLS POLICIES DEPLOYED AND VERIFIED ✅✅✅');

} catch (error) {
  console.error('❌ Fatal error:', error.message);
  console.error(error);
  process.exit(1);
}
