import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('Checking Legal Defense Tables...\n');

const tables = [
  'legal_defense_accounts',
  'business_debt_accounts', 
  'business_entities',
  'active_credit_accounts',
  'credit_inquiries',
  'evidence_log',
  'insurance_policies'
];

for (const table of tables) {
  const { data, error } = await supabase.from(table).select('count');
  console.log(`${table}: ${error ? '❌ NOT FOUND' : '✅ EXISTS'}`);
}

process.exit(0);
