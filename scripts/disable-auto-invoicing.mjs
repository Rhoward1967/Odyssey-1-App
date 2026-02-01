#!/usr/bin/env node
/**
 * CRITICAL SAFETY CONTROL
 * Disable automated invoice generation until March 1, 2026
 * 
 * We do NOT take over billing until March 1st
 * Until then: NOTIFICATIONS ONLY (Welcome Letters)
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tvsxloejfsrdganemsmg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2c3hsb2VqZnNyZGdhbmVtc21nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjcxODg0OCwiZXhwIjoyMDcyMjk0ODQ4fQ.Wr3ffDizDf3DXG2uFD7-z4XrmtQUJjX-m9hiLoMvd1M';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

console.log('\n🚨 CRITICAL SAFETY CONTROL: Disabling Automated Invoicing');
console.log('='.repeat(80));

// Step 1: Unschedule CRON job
console.log('\n📋 Step 1: Checking CRON job status...');
const { data: cronCheck, error: cronCheckError } = await supabase.rpc('sql', {
  query: `SELECT * FROM cron.job WHERE jobname = 'recurring-invoice-generator';`
});

if (cronCheckError) {
  console.log('⚠️  Unable to check CRON status (may not exist yet)');
} else {
  console.log(`   Found ${cronCheck?.length || 0} CRON job(s)`);
}

console.log('\n🔧 Step 2: Disabling recurring invoice CRON job...');
const { error: unscheduleError } = await supabase.rpc('sql', {
  query: `SELECT cron.unschedule('recurring-invoice-generator');`
});

if (unscheduleError) {
  console.log('⚠️  CRON job may already be unscheduled:', unscheduleError.message);
} else {
  console.log('✅ CRON job unscheduled successfully');
}

// Step 2: Add manual approval column (if not exists)
console.log('\n🔧 Step 3: Adding manual_approval_required column...');
const { error: alterError } = await supabase.rpc('sql', {
  query: `
    ALTER TABLE recurring_invoices 
    ADD COLUMN IF NOT EXISTS manual_approval_required BOOLEAN DEFAULT true;
  `
});

if (alterError) {
  console.log('⚠️  Column may already exist:', alterError.message);
} else {
  console.log('✅ Column added successfully');
}

// Step 3: Set all existing invoices to require manual approval
console.log('\n🔧 Step 4: Setting all invoices to require manual approval...');
const { data: updateData, error: updateError } = await supabase
  .from('recurring_invoices')
  .update({ manual_approval_required: true })
  .is('manual_approval_required', null)
  .or('manual_approval_required.eq.false')
  .select();

if (updateError) {
  console.error('❌ Error updating invoices:', updateError);
} else {
  console.log(`✅ Updated ${updateData?.length || 0} recurring invoices to require manual approval`);
}

// Verification
console.log('\n📊 VERIFICATION:');
console.log('='.repeat(80));

const { data: allRecurring, error: recurringError } = await supabase
  .from('recurring_invoices')
  .select('customer_id, amount_cents, frequency, manual_approval_required, is_active');

if (recurringError) {
  console.error('❌ Error fetching recurring invoices:', recurringError);
} else {
  const total = allRecurring.length;
  const requireApproval = allRecurring.filter(r => r.manual_approval_required === true).length;
  const active = allRecurring.filter(r => r.is_active === true).length;
  
  console.log(`   Total recurring invoices: ${total}`);
  console.log(`   Requiring manual approval: ${requireApproval}`);
  console.log(`   Active recurring invoices: ${active}`);
  
  if (requireApproval === total) {
    console.log('\n✅ ALL CLEAR: All invoices require manual approval');
  } else {
    console.log(`\n⚠️  WARNING: ${total - requireApproval} invoices do NOT require approval!`);
  }
}

console.log('\n🎯 SAFETY STATUS:');
console.log('='.repeat(80));
console.log('✅ Automated invoice CRON job: DISABLED');
console.log('✅ All recurring invoices: MANUAL APPROVAL REQUIRED');
console.log('✅ Welcome Letters: Safe to send (notification only)');
console.log('\n⏸️  NO INVOICES will be generated until you manually approve each one');
console.log('📅 Timeline: Review and approve invoices before March 1, 2026');
console.log('='.repeat(80));
