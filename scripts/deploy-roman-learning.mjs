/**
 * Direct SQL deployment script for R.O.M.A.N. Learning infrastructure
 * Deploys authorized_topics table directly to Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://tvsxloejfsrdganemsmg.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deploySQL(filename) {
  console.log(`\n📤 Deploying ${filename}...`);
  
  const sqlPath = join(__dirname, 'supabase', 'migrations', filename);
  const sql = readFileSync(sqlPath, 'utf-8');
  
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
    console.error(`❌ Error deploying ${filename}:`, error);
    return false;
  }
  
  console.log(`✅ ${filename} deployed successfully`);
  return true;
}

async function main() {
  console.log('🚀 R.O.M.A.N. Learning Infrastructure Deployment');
  console.log('================================================\n');
  
  // Deploy migrations in order
  const migrations = [
    '20251220_authorized_topics.sql',
    '20251220_roman_external_knowledge.sql',
    '20251220_roman_book_statistics.sql'
  ];
  
  for (const migration of migrations) {
    const success = await deploySQL(migration);
    if (!success) {
      console.error(`\n❌ Deployment failed at ${migration}`);
      process.exit(1);
    }
  }
  
  console.log('\n✅ All migrations deployed successfully!');
  console.log('\n🧠 R.O.M.A.N. Learning Daemon is ready to activate');
}

main().catch(console.error);
