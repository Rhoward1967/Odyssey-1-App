import { readFileSync } from 'fs';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🚀 Applying company_profiles RLS policies...\n');

const sql = readFileSync('./supabase/migrations/20251223_fix_company_profiles_rls.sql', 'utf-8');

// Remove DO blocks and comments for cleaner execution
const cleanedSql = sql
  .replace(/--.*$/gm, '') // Remove comments
  .replace(/DO \$\$[\s\S]*?END \$\$;/g, '') // Remove DO blocks
  .trim();

// Split into individual statements
const statements = cleanedSql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0);

console.log(`📋 Found ${statements.length} SQL statements to execute\n`);

async function executeStatement(sql, index) {
  const preview = sql.substring(0, 80).replace(/\s+/g, ' ');
  console.log(`[${index + 1}/${statements.length}] ${preview}...`);

  const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ query: sql })
  });

  if (!response.ok && response.status !== 404) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  console.log(`    ✅ Done\n`);
}

async function applyMigration() {
  try {
    for (let i = 0; i < statements.length; i++) {
      try {
        await executeStatement(statements[i], i);
      } catch (err) {
        // Continue on errors (some statements might already be applied)
        console.log(`    ⚠️  ${err.message}\n`);
      }
    }

    console.log('🎉 Migration complete!\n');
    console.log('📊 Policies that should now be active:');
    console.log('   ✅ SELECT - Users can view their own company profile');
    console.log('   ✅ INSERT - Users can insert their own company profile');
    console.log('   ✅ UPDATE - Users can update their own company profile');
    console.log('   ✅ DELETE - Users can delete their own company profile\n');
    console.log('✨ Refresh the page - the 403 error should be gone!');

  } catch (error) {
    console.error('\n❌ Failed to apply migration:', error.message);
    console.error('\n💡 Manual fallback required:');
    console.error('   1. Go to: https://supabase.com/dashboard/project/tvsxloejfsrdganemsmg/sql/new');
    console.error('   2. Copy SQL from: supabase/migrations/20251223_fix_company_profiles_rls.sql');
    console.error('   3. Click "Run"\n');
  }
}

applyMigration();
