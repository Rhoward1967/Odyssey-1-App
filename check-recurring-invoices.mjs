#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const client = createClient(url, key, { auth: { persistSession: false } });

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('📊 THE 14 CUSTOMERS IN RECURRING INVOICES');
console.log('═══════════════════════════════════════════════════════════════\n');

const { data: recurring, error } = await client
  .from('recurring_invoices')
  .select('*')
  .order('created_at', { ascending: true });

if (error) {
  console.error('ERROR:', error.message);
  process.exit(1);
}

console.log(`✅ Found ${recurring?.length || 0} recurring invoice records\n`);

if (recurring && recurring.length > 0) {
  let totalMonthly = 0;
  recurring.forEach((rec, i) => {
    console.log(`${i + 1}. ${rec.client_name || rec.name || 'Unknown'}`);
    console.log(`   Amount: $${(rec.amount || rec.monthly_amount || 0).toLocaleString()}`);
    console.log(`   Frequency: ${rec.frequency || 'Monthly'}`);
    console.log(`   Status: ${rec.status || 'Active'}`);
    console.log(`   Start Date: ${rec.start_date ? new Date(rec.start_date).toLocaleDateString() : 'N/A'}`);
    console.log('');
    totalMonthly += rec.amount || rec.monthly_amount || 0;
  });
  
  console.log(`\n💰 TOTAL MONTHLY RECURRING REVENUE: $${totalMonthly.toLocaleString()}`);
}

console.log('\n═══════════════════════════════════════════════════════════════\n');

process.exit(0);
