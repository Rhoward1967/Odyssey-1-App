import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('📋 FINAL CUSTOMER LIST VERIFICATION FOR WELCOME LETTER\n');
console.log('=' .repeat(80));

const { data: customers, error } = await supabase
  .from('customers')
  .select('id, company_name, first_name, last_name, email, phone')
  .eq('user_id', 'eca49ca9-b4ae-4e0e-b78a-fa1811024781')
  .order('company_name');

if (error) {
  console.error('❌ Error fetching customers:', error.message);
  process.exit(1);
}

console.log(`\n✅ Total Customers: ${customers.length}\n`);

let readyCount = 0;
let missingEmail = [];
let missingName = [];

customers.forEach((customer, index) => {
  const name = customer.company_name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
  const hasEmail = !!customer.email;
  const hasName = !!name;
  
  const status = hasEmail && hasName ? '✅' : '⚠️';
  
  console.log(`${index + 1}. ${status} ${name || '[NO NAME]'}`);
  console.log(`   Email: ${customer.email || '❌ MISSING'}`);
  console.log(`   Phone: ${customer.phone || 'N/A'}`);
  console.log('');
  
  if (hasEmail && hasName) {
    readyCount++;
  } else {
    if (!hasEmail) missingEmail.push(name || 'Unknown Customer');
    if (!hasName) missingName.push(customer.email || 'No identifier');
  }
});

console.log('=' .repeat(80));
console.log(`\n📊 SUMMARY:\n`);
console.log(`   ✅ Ready to receive Welcome Letter: ${readyCount}/${customers.length}`);

if (missingEmail.length > 0) {
  console.log(`\n   ⚠️  Missing Email (${missingEmail.length}):`);
  missingEmail.forEach(name => console.log(`      - ${name}`));
}

if (missingName.length > 0) {
  console.log(`\n   ⚠️  Missing Name (${missingName.length}):`);
  missingName.forEach(email => console.log(`      - ${email}`));
}

if (readyCount === customers.length) {
  console.log('\n🎉 ALL CUSTOMERS READY FOR WELCOME LETTER!\n');
  console.log('📧 Scheduled send: Tomorrow morning (Feb 1st)');
  console.log('📋 Subject: Important: Security & Billing Update');
  console.log('✉️  From: Rickey Howard, Managing Director, Odyssey-1 AI LLC\n');
} else {
  console.log(`\n⚠️  ACTION REQUIRED: ${customers.length - readyCount} customer(s) need updates before sending.\n`);
}
