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
console.log('📅 MARCH 1ST LAUNCH VERIFICATION');
console.log('═══════════════════════════════════════════════════════════════\n');

// Check for invoices scheduled or in draft for March 1st
const { data: allInvoices, error } = await client
  .from('invoices')
  .select('*');

if (error) {
  console.error('ERROR:', error.message);
  process.exit(1);
}

console.log(`📊 Total invoices in system: ${allInvoices?.length || 0}\n`);

// Filter for March 1st or scheduled state
const march1st = allInvoices?.filter(inv => {
  const date = inv.scheduled_date ? new Date(inv.scheduled_date) : null;
  const isMatch = date && date.toISOString().includes('2026-03-01');
  return isMatch || inv.status === 'scheduled' || inv.status === 'pending';
}) || [];

console.log(`🎯 Invoices scheduled for March 1st or pending: ${march1st.length}\n`);

if (march1st.length > 0) {
  march1st.forEach((inv, i) => {
    console.log(`${i + 1}. Client: ${inv.client_name || 'Unknown'}`);
    console.log(`   Amount: $${(inv.total || 0).toLocaleString()}`);
    console.log(`   Status: ${inv.status}`);
    console.log(`   Scheduled: ${inv.scheduled_date ? new Date(inv.scheduled_date).toLocaleDateString() : 'TBD'}`);
    console.log('');
  });
  
  const total = march1st.reduce((sum, inv) => sum + (inv.total || 0), 0);
  console.log(`\n💰 TOTAL MARCH 1ST REVENUE: $${total.toLocaleString()}`);
} else {
  console.log('⚠️  No invoices found scheduled for March 1st\n');
  console.log('📋 All invoices in system:');
  allInvoices?.forEach((inv, i) => {
    console.log(`${i + 1}. ${inv.client_name || 'Unknown'} - $${(inv.total || 0).toLocaleString()} - Status: ${inv.status}`);
  });
}

console.log('\n═══════════════════════════════════════════════════════════════\n');

process.exit(0);
