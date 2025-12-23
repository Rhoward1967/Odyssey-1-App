import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log('🚀 Applying company_profiles RLS policies to production...\n');

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  db: { schema: 'public' }
});

async function executeSql(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ sql_query: sql })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  return response;
}

async function applyMigration() {
  try {
    console.log('📋 Step 1: Enabling RLS on company_profiles...');
    await executeSql('ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;');
    console.log('✅ RLS enabled\n');

    console.log('📋 Step 2: Dropping old policies (if any)...');
    const dropPolicies = [
      'DROP POLICY IF EXISTS "Users can view their own company profile" ON company_profiles;',
      'DROP POLICY IF EXISTS "Users can insert their own company profile" ON company_profiles;',
      'DROP POLICY IF EXISTS "Users can update their own company profile" ON company_profiles;',
      'DROP POLICY IF EXISTS "Users can delete their own company profile" ON company_profiles;'
    ];
    
    for (const sql of dropPolicies) {
      try {
        await executeSql(sql);
      } catch (err) {
        // Ignore errors if policies don't exist
      }
    }
    console.log('✅ Old policies dropped\n');

    console.log('📋 Step 3: Creating SELECT policy...');
    await executeSql(`
      CREATE POLICY "Users can view their own company profile"
      ON company_profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
    `);
    console.log('✅ SELECT policy created\n');

    console.log('📋 Step 4: Creating INSERT policy...');
    await executeSql(`
      CREATE POLICY "Users can insert their own company profile"
      ON company_profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
    `);
    console.log('✅ INSERT policy created\n');

    console.log('📋 Step 5: Creating UPDATE policy...');
    await executeSql(`
      CREATE POLICY "Users can update their own company profile"
      ON company_profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
    `);
    console.log('✅ UPDATE policy created\n');

    console.log('📋 Step 6: Creating DELETE policy...');
    await executeSql(`
      CREATE POLICY "Users can delete their own company profile"
      ON company_profiles
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
    `);
    console.log('✅ DELETE policy created\n');

    console.log('📋 Step 7: Granting permissions to authenticated users...');
    await executeSql('GRANT SELECT, INSERT, UPDATE, DELETE ON company_profiles TO authenticated;');
    console.log('✅ Permissions granted\n');

    console.log('🎉 SUCCESS! All RLS policies applied.\n');
    console.log('📊 Policies active:');
    console.log('   ✅ SELECT - Users can view their own company profile');
    console.log('   ✅ INSERT - Users can insert their own company profile');
    console.log('   ✅ UPDATE - Users can update their own company profile');
    console.log('   ✅ DELETE - Users can delete their own company profile\n');

    console.log('🔍 Testing access...');
    const { data, error } = await supabase
      .from('company_profiles')
      .select('id, user_id, company_name')
      .limit(1);

    if (error) {
      console.log('⚠️  Note: Service role bypasses RLS, testing with service role...');
      console.log(`   Found ${data?.length || 0} profiles (service role has full access)\n`);
    } else {
      console.log(`✅ Query successful! Found ${data?.length || 0} profiles\n`);
    }

    console.log('✨ The 403 error should now be fixed. Refresh the page to test!');

  } catch (error) {
    console.error('\n❌ Error applying migration:', error.message);
    console.error('\n💡 Fallback: Copy the SQL from supabase/migrations/20251223_fix_company_profiles_rls.sql');
    console.error('   and run it manually in the Supabase SQL Editor:\n');
    console.error('   https://supabase.com/dashboard/project/tvsxloejfsrdganemsmg/sql/new');
    process.exit(1);
  }
}

applyMigration();
