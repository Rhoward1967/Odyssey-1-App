import pg from 'pg';

const { Client } = pg;

// Parse Supabase connection string
const DB_URL = process.env.SUPABASE_DB_URL || 
  `postgresql://postgres.tvsxloejfsrdganemsmg:${process.env.SUPABASE_DB_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

console.log('🚀 Applying company_profiles RLS policies via direct PostgreSQL connection...\n');

const client = new Client({
  connectionString: DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function applyMigration() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    console.log('📋 Step 1: Enabling RLS on company_profiles...');
    await client.query('ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;');
    console.log('✅ RLS enabled\n');

    console.log('📋 Step 2: Dropping old policies (if any)...');
    const dropPolicies = [
      'DROP POLICY IF EXISTS "Users can view their own company profile" ON company_profiles;',
      'DROP POLICY IF EXISTS "Users can insert their own company profile" ON company_profiles;',
      'DROP POLICY IF EXISTS "Users can update their own company profile" ON company_profiles;',
      'DROP POLICY IF EXISTS "Users can delete their own company profile" ON company_profiles;'
    ];
    
    for (const sql of dropPolicies) {
      await client.query(sql);
    }
    console.log('✅ Old policies dropped\n');

    console.log('📋 Step 3: Creating SELECT policy...');
    await client.query(`
      CREATE POLICY "Users can view their own company profile"
      ON company_profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
    `);
    console.log('✅ SELECT policy created\n');

    console.log('📋 Step 4: Creating INSERT policy...');
    await client.query(`
      CREATE POLICY "Users can insert their own company profile"
      ON company_profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
    `);
    console.log('✅ INSERT policy created\n');

    console.log('📋 Step 5: Creating UPDATE policy...');
    await client.query(`
      CREATE POLICY "Users can update their own company profile"
      ON company_profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
    `);
    console.log('✅ UPDATE policy created\n');

    console.log('📋 Step 6: Creating DELETE policy...');
    await client.query(`
      CREATE POLICY "Users can delete their own company profile"
      ON company_profiles
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
    `);
    console.log('✅ DELETE policy created\n');

    console.log('📋 Step 7: Granting permissions to authenticated users...');
    await client.query('GRANT SELECT, INSERT, UPDATE, DELETE ON company_profiles TO authenticated;');
    console.log('✅ Permissions granted\n');

    console.log('🎉 SUCCESS! All RLS policies applied.\n');
    console.log('📊 Active policies:');
    console.log('   ✅ SELECT - Users can view their own company profile');
    console.log('   ✅ INSERT - Users can insert their own company profile');
    console.log('   ✅ UPDATE - Users can update their own company profile');
    console.log('   ✅ DELETE - Users can delete their own company profile\n');

    console.log('🔍 Verifying policies...');
    const result = await client.query(`
      SELECT policyname, cmd, qual 
      FROM pg_policies 
      WHERE tablename = 'company_profiles' 
      ORDER BY policyname;
    `);
    
    console.log(`   Found ${result.rows.length} policies:`);
    result.rows.forEach(row => {
      console.log(`   - ${row.policyname} (${row.cmd})`);
    });

    console.log('\n✨ The 403 error is now fixed! Refresh the page to test.');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code) console.error('   Code:', error.code);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigration();
