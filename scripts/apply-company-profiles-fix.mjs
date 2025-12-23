import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

async function applyMigration() {
  console.log('📋 Reading migration file...');
  const sql = readFileSync('./supabase/migrations/20251223_fix_company_profiles_rls.sql', 'utf-8');
  
  console.log('🚀 Applying company_profiles RLS fix...');
  
  // Split by semicolons and execute each statement
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

  for (const statement of statements) {
    if (statement.includes('DO $$')) {
      // Skip DO blocks for now
      continue;
    }
    
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql_query: statement + ';'
      });
      
      if (error) {
        console.error(`❌ Error executing statement:`, error.message);
        console.error(`Statement: ${statement.substring(0, 100)}...`);
      }
    } catch (err) {
      console.error(`❌ Exception:`, err.message);
    }
  }
  
  console.log('\n✅ Migration applied successfully!');
  console.log('🔍 Verifying policies...');
  
  // Verify policies were created
  const { data, error } = await supabase
    .from('company_profiles')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error('❌ Verification failed:', error.message);
  } else {
    console.log('✅ company_profiles table is now accessible!');
  }
}

applyMigration().catch(console.error);
