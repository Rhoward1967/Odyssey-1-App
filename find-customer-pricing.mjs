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
console.log('🔍 FINDING THE 14 CUSTOMERS WITH PRICING');
console.log('═══════════════════════════════════════════════════════════════\n');

// List all table names to find where customer pricing is stored
const tables = [
  'customers',
  'subscriptions',
  'recurring_invoices',
  'client_pricing',
  'service_pricing',
  'recurring_services',
  'contracts',
  'customer_subscriptions',
  'billing_plans',
  'service_contracts'
];

for (const tableName of tables) {
  try {
    const { data, error, count } = await client
      .from(tableName)
      .select('*', { count: 'exact' })
      .limit(1);
    
    if (!error) {
      console.log(`✅ TABLE: ${tableName}`);
      console.log(`   Total rows: ${count}`);
      
      if (data && data.length > 0) {
        console.log(`   Sample columns: ${Object.keys(data[0]).join(', ')}`);
      }
      console.log('');
    }
  } catch (e) {
    // Table doesn't exist, skip
  }
}

// Try to find customers with pricing
console.log('\n📋 SEARCHING FOR CUSTOMERS WITH PRICING INFORMATION\n');

const { data: customers, error: custErr } = await client
  .from('customers')
  .select('*');

if (!custErr && customers && customers.length > 0) {
  console.log(`✅ Found ${customers.length} customers\n`);
  customers.forEach((c, i) => {
    console.log(`${i + 1}. ${c.name || c.first_name || 'Unknown'}`);
    if (c.monthly_amount) console.log(`   Monthly: $${c.monthly_amount}`);
    if (c.price) console.log(`   Price: $${c.price}`);
    if (c.billing_amount) console.log(`   Billing: $${c.billing_amount}`);
    if (c.service_amount) console.log(`   Service Amount: $${c.service_amount}`);
    console.log('');
  });
} else {
  console.log('❌ No customers found in customers table');
}

console.log('\n═══════════════════════════════════════════════════════════════\n');

process.exit(0);
