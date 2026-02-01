#!/usr/bin/env node
/**
 * Update all 14 customer email addresses in Supabase
 * Uses data extracted from contacts.jsonl
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const USER_ID = 'eca49ca9-b4ae-4e0e-b78a-fa1811024781';

const CUSTOMER_UPDATES = [
  { name: 'Beth Smith', email: 'Beth.Smith@accgov.com', phone: '(706) 521-1606' },
  { name: 'Amy Deltoro', email: 'info@atlasspineandbalance.com', phone: '(706) 543-5212' },
  { name: 'Cartwright Properties', email: 'bcartwright@cartwrightproperties.net', phone: null },
  { name: 'Crystal Richardson', email: 'crichardson@georgiaeyeclinic.com', phone: '+1 678-249-8268' },
  { name: 'Gannett', email: 'lgmyers@gannett.com', phone: null },
  { name: 'Georgia Eye Surgery ASC', email: 'athomas@georgiaeyeclinic.com', phone: '(706)5460170' },
  { name: 'GNS Surgery Center', email: 'jginter@uspi.com', phone: '(706) 255-5384' },
  { name: 'Joan Kent', email: 'joankent@gmail.com', phone: '+1 478-972-1020' },
  { name: 'Michelle Nguyen', email: 'michelle@historicathens.com', phone: '+1 704-433-7804' },
  { name: 'Robert Andrews', email: 'brandon.andrews@athensclarkecounty.com', phone: null },
  { name: 'Sandi Turner', email: 'deeaurandt@gmail.com', phone: '+1 706-612-8011' },
  { name: 'Sheri Tifosi', email: 'sheri@tifosioptics.com', phone: '(800) 229-8122' },
  { name: 'Todd Knight', email: 'Todd@blinkfs.com', phone: '(803) 493-5366' },
  { name: 'Tonyia Brooks', email: 'tonyia.brooks@accgov.com', phone: '+17066133130' }
];

console.log('📧 UPDATING ALL CUSTOMER EMAIL ADDRESSES\n');
console.log('='.repeat(80));

let successCount = 0;
let errorCount = 0;

for (const customer of CUSTOMER_UPDATES) {
  const updateData = { email: customer.email };
  if (customer.phone) {
    updateData.phone = customer.phone;
  }
  
  const { data, error } = await supabase
    .from('customers')
    .update(updateData)
    .eq('company_name', customer.name)
    .eq('user_id', USER_ID)
    .select();
  
  if (error) {
    console.log(`❌ ${customer.name}`);
    console.log(`   Error: ${error.message}`);
    errorCount++;
  } else if (data && data.length > 0) {
    console.log(`✅ ${customer.name}`);
    console.log(`   Email: ${customer.email}`);
    if (customer.phone) console.log(`   Phone: ${customer.phone}`);
    successCount++;
  } else {
    console.log(`⚠️  ${customer.name} - NOT FOUND IN DATABASE`);
    errorCount++;
  }
  console.log('');
}

console.log('='.repeat(80));
console.log(`\n📊 SUMMARY:`);
console.log(`   ✅ Updated: ${successCount}/14`);
console.log(`   ❌ Failed: ${errorCount}/14`);

// Verify all customers now have emails
console.log('\n🔍 VERIFICATION: Checking all customers...\n');
const { data: customers, error: verifyError } = await supabase
  .from('customers')
  .select('company_name, email, phone')
  .eq('user_id', USER_ID)
  .order('company_name');

if (verifyError) {
  console.error('Verification failed:', verifyError.message);
} else {
  const withEmail = customers.filter(c => c.email);
  const withoutEmail = customers.filter(c => !c.email);
  
  console.log(`✅ Customers with email: ${withEmail.length}/${customers.length}`);
  
  if (withoutEmail.length > 0) {
    console.log(`\n⚠️  Still missing emails:`);
    withoutEmail.forEach(c => console.log(`   - ${c.company_name}`));
  } else {
    console.log('\n🎉 ALL CUSTOMERS NOW HAVE EMAIL ADDRESSES!');
  }
}

console.log('\n✅ Customer email update complete\n');
