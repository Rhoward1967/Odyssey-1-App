#!/usr/bin/env node
/**
 * SAFETY CONTROL: Disable all recurring invoices until manual review
 * 
 * Current state: 20+ recurring invoices with next_invoice_date = 2026-03-01
 * Action: Set is_active = false on ALL to prevent automated generation
 * Timeline: Re-enable after manual review of each customer's contract
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tvsxloejfsrdganemsmg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2c3hsb2VqZnNyZGdhbmVtc21nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjcxODg0OCwiZXhwIjoyMDcyMjk0ODQ4fQ.Wr3ffDizDf3DXG2uFD7-z4XrmtQUJjX-m9hiLoMvd1M';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

console.log('\n🛡️  SAFETY CONTROL: Disabling All Automated Invoicing');
console.log('='.repeat(80));

// First, check current state
console.log('\n📊 CURRENT STATE:');
const { data: before, error: beforeError } = await supabase
  .from('recurring_invoices')
  .select('id, customer_id, amount_cents, is_active');

if (beforeError) {
  console.error('❌ Error:', beforeError.message);
  process.exit(1);
}

const activeBefore = before.filter(r => r.is_active === true).length;
console.log(`   Total recurring invoices: ${before.length}`);
console.log(`   Currently active: ${activeBefore}`);

// Disable ALL recurring invoices
console.log('\n🔧 DISABLING all recurring invoices...');
const { data: updated, error: updateError } = await supabase
  .from('recurring_invoices')
  .update({ is_active: false })
  .eq('is_active', true)
  .select();

if (updateError) {
  console.error('❌ Error:', updateError.message);
  process.exit(1);
}

console.log(`✅ Disabled ${updated.length} recurring invoices`);

// Verify
console.log('\n✅ VERIFICATION:');
const { data: after, error: afterError } = await supabase
  .from('recurring_invoices')
  .select('id, is_active');

if (afterError) {
  console.error('❌ Error:', afterError.message);
  process.exit(1);
}

const activeAfter = after.filter(r => r.is_active === true).length;
console.log(`   Total recurring invoices: ${after.length}`);
console.log(`   Currently active: ${activeAfter}`);

if (activeAfter === 0) {
  console.log('\n🎉 SUCCESS: All recurring invoices are now inactive');
  console.log('   No automated invoices will be generated');
} else {
  console.log(`\n⚠️  WARNING: ${activeAfter} invoices are still active!`);
}

console.log('\n📋 NEXT STEPS:');
console.log('='.repeat(80));
console.log('1. Send Welcome Letters (management change notification only)');
console.log('2. Review each customer contract for accuracy');
console.log('3. Verify pricing, frequency, and billing dates');
console.log('4. Manually approve each invoice before March 1st');
console.log('5. Re-enable recurring invoices AFTER review:');
console.log('   UPDATE recurring_invoices SET is_active = true WHERE [conditions];');
console.log('\n📧 Welcome Letters: SAFE TO SEND NOW (no billing)');
console.log('='.repeat(80));
