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
console.log('🔍 MANUAL SOVEREIGN AUDIT - INVOICING & CONTRACTORS');
console.log('═══════════════════════════════════════════════════════════════\n');

// 1. Pull from invoices table
console.log('📋 PART 1: THE 14 CLIENTS IN INVOICING SYSTEM');
console.log('───────────────────────────────────────────────────────────────\n');

const { data: invoices, error: invErr } = await client
  .from('invoices')
  .select('*')
  .order('created_at', { ascending: true });

if (invErr) {
  console.error('ERROR:', invErr.message);
} else {
  console.log(`✅ Found ${invoices?.length || 0} invoices in system\n`);
  if (invoices && invoices.length > 0) {
    // Group by client to show unique clients
    const uniqueClients = new Map();
    invoices.forEach(inv => {
      const key = inv.client_name || inv.client_id;
      if (!uniqueClients.has(key)) {
        uniqueClients.set(key, inv);
      }
    });
    
    console.log(`Found ${uniqueClients.size} unique clients across invoices:\n`);
    let i = 1;
    uniqueClients.forEach((inv, clientKey) => {
      console.log(`${i}. ${inv.client_name || 'Unknown'}`);
      console.log(`   Client ID: ${inv.client_id}`);
      console.log(`   Created: ${new Date(inv.created_at).toLocaleDateString()}`);
      console.log('');
      i++;
    });
    
    // Show March 1st scheduled invoices
    const march1st = invoices.filter(inv => {
      const date = new Date(inv.scheduled_date || inv.created_at);
      return date.getMonth() === 2 && date.getDate() === 1;
    });
    
    if (march1st.length > 0) {
      console.log(`\n📊 MARCH 1ST INVOICES: ${march1st.length}`);
      let total = 0;
      march1st.forEach(inv => {
        total += inv.total || 0;
      });
      console.log(`Total Amount: $${total.toLocaleString()}\n`);
    }
  }
}

// 2. Pull from contractors table
console.log('\n📋 PART 2: THE 5 ACTIVE CONTRACTORS');
console.log('───────────────────────────────────────────────────────────────\n');

const { data: contractors, error: contrErr } = await client
  .from('contractors')
  .select('*')
  .order('created_at', { ascending: true });

if (contrErr) {
  console.error('ERROR:', contrErr.message);
} else {
  console.log(`✅ Found ${contractors?.length || 0} contractors in system\n`);
  if (contractors && contractors.length > 0) {
    contractors.forEach((c, i) => {
      console.log(`${i + 1}. ${c.full_name || c.name || 'Unknown'}`);
      console.log(`   Email: ${c.email || 'N/A'}`);
      console.log(`   Phone: ${c.phone || 'N/A'}`);
      console.log(`   Status: ${c.status || 'Active'}`);
      console.log(`   Created: ${new Date(c.created_at).toLocaleDateString()}`);
      console.log('');
    });
  }
}

console.log('═══════════════════════════════════════════════════════════════');
console.log('✅ AUDIT COMPLETE');
console.log('═══════════════════════════════════════════════════════════════\n');

process.exit(0);
