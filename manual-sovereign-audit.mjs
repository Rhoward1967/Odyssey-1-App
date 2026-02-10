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
console.log('🔍 MANUAL SOVEREIGN AUDIT - THE REAL DATA');
console.log('═══════════════════════════════════════════════════════════════\n');

// 1. Pull the 14 clients
console.log('📋 PART 1: THE 14 CLIENTS YOU MANUALLY ENTERED');
console.log('───────────────────────────────────────────────────────────────\n');

const { data: customers, error: custErr } = await client
  .from('customers')
  .select('id, first_name, last_name, company_name, email, phone, created_at')
  .order('created_at', { ascending: true });

if (custErr) {
  console.error('ERROR:', custErr.message);
} else {
  console.log(`✅ Found ${customers?.length || 0} customers in database\n`);
  if (customers && customers.length > 0) {
    customers.forEach((c, i) => {
      console.log(`${i + 1}. ${c.first_name} ${c.last_name}`);
      console.log(`   Company: ${c.company_name}`);
      console.log(`   Email: ${c.email}`);
      console.log(`   Phone: ${c.phone}`);
      console.log(`   Entered: ${new Date(c.created_at).toLocaleDateString()}`);
      console.log('');
    });
  }
}

// 2. Pull the 5 contractors
console.log('\n📋 PART 2: THE 5 ACTIVE CONTRACTORS');
console.log('───────────────────────────────────────────────────────────────\n');

const { data: contractors, error: contrErr } = await client
  .from('employees')
  .select('id, first_name, last_name, email, phone, hourly_rate, status, created_at')
  .eq('is_contractor', true)
  .order('created_at', { ascending: true });

if (contrErr) {
  console.error('ERROR:', contrErr.message);
} else {
  console.log(`✅ Found ${contractors?.length || 0} contractors in database\n`);
  if (contractors && contractors.length > 0) {
    contractors.forEach((c, i) => {
      console.log(`${i + 1}. ${c.first_name} ${c.last_name}`);
      console.log(`   Email: ${c.email}`);
      console.log(`   Phone: ${c.phone}`);
      console.log(`   Rate: $${c.hourly_rate || 'N/A'}`);
      console.log(`   Status: ${c.status}`);
      console.log(`   Entered: ${new Date(c.created_at).toLocaleDateString()}`);
      console.log('');
    });
  }
}

// 3. Pull March 1st invoices
console.log('\n📋 PART 3: MARCH 1ST INVOICES SCHEDULED');
console.log('───────────────────────────────────────────────────────────────\n');

const { data: invoices, error: invErr } = await client
  .from('invoices')
  .select('id, client_id, total, status, scheduled_date, created_at')
  .gte('scheduled_date', '2026-03-01')
  .lte('scheduled_date', '2026-03-02')
  .order('scheduled_date', { ascending: true });

if (invErr) {
  console.error('ERROR:', invErr.message);
} else {
  console.log(`✅ Found ${invoices?.length || 0} invoices scheduled for March 1st\n`);
  let totalAmount = 0;
  if (invoices && invoices.length > 0) {
    invoices.forEach((inv, i) => {
      console.log(`${i + 1}. Invoice ID: ${inv.id}`);
      console.log(`   Amount: $${(inv.total || 0).toLocaleString()}`);
      console.log(`   Status: ${inv.status}`);
      console.log(`   Scheduled: ${new Date(inv.scheduled_date).toLocaleDateString()}`);
      totalAmount += inv.total || 0;
      console.log('');
    });
    console.log(`📊 TOTAL March 1st Revenue: $${totalAmount.toLocaleString()}\n`);
  }
}

// 4. Pull the Howard Jones trust data
console.log('\n📋 PART 4: THE TRUST & UCC-1 DATA ($6.71B / $1.05M)');
console.log('───────────────────────────────────────────────────────────────\n');

const { data: trust, error: trustErr } = await client
  .from('business_entities')
  .select('*')
  .eq('entity_name', 'Howard Jones Bloodline Ancestral Trust')
  .limit(1)
  .single();

if (trustErr && trustErr.code !== 'PGRST116') {
  console.error('ERROR:', trustErr.message);
} else if (trust) {
  console.log('✅ HOWARD JONES BLOODLINE ANCESTRAL TRUST FOUND\n');
  console.log(`Entity Type: ${trust.entity_type}`);
  console.log(`Trust Type: ${trust.trust_type}`);
  console.log(`Primary Purpose: ${trust.primary_purpose}`);
  console.log(`Estimated Value: $${(trust.estimated_value || 0).toLocaleString()}`);
  console.log(`Active: ${trust.is_active ? 'YES' : 'NO'}`);
  console.log(`\nStrategic Notes:\n${trust.strategic_notes}`);
  console.log('\n');
} else {
  console.log('⚠️  Trust record not found in database\n');
}

console.log('═══════════════════════════════════════════════════════════════');
console.log('✅ MANUAL AUDIT COMPLETE');
console.log('═══════════════════════════════════════════════════════════════\n');
console.log('This data represents YOUR REAL WORK over the past year.');
console.log('This is NOT code. This is NOT automation. This is YOUR SOVEREIGN FOUNDATION.\n');

process.exit(0);
