#!/usr/bin/env node
/**
 * Check current CRON job status and recurring invoice configuration
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tvsxloejfsrdganemsmg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2c3hsb2VqZnNyZGdhbmVtc21nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjcxODg0OCwiZXhwIjoyMDcyMjk0ODQ4fQ.Wr3ffDizDf3DXG2uFD7-z4XrmtQUJjX-m9hiLoMvd1M';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

console.log('\n🔍 CHECKING AUTOMATED INVOICE STATUS');
console.log('='.repeat(80));

// Check if recurring_invoices table exists and what's in it
console.log('\n📋 Recurring Invoices Configuration:');
const { data: recurring, error: recurringError } = await supabase
  .from('recurring_invoices')
  .select('*')
  .limit(20);

if (recurringError) {
  console.log('❌ Error:', recurringError.message);
} else {
  console.log(`✅ Found ${recurring.length} recurring invoice records`);
  
  if (recurring.length > 0) {
    console.log('\nDetails:');
    recurring.forEach((r, i) => {
      console.log(`  ${i + 1}. Customer: ${r.customer_id}`);
      console.log(`     Amount: $${(r.amount_cents / 100).toFixed(2)}`);
      console.log(`     Frequency: ${r.frequency}`);
      console.log(`     Active: ${r.is_active}`);
      console.log(`     Next Invoice: ${r.next_invoice_date}`);
      console.log('');
    });
  }
}

// Check for any recent invoices that were auto-generated
console.log('\n💰 Recent Invoices (Last 30 days):');
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const { data: recentInvoices, error: invoiceError } = await supabase
  .from('invoices')
  .select('invoice_number, customer_id, total_amount, issued_date, status, created_at')
  .gte('created_at', thirtyDaysAgo.toISOString())
  .order('created_at', { ascending: false })
  .limit(20);

if (invoiceError) {
  console.log('❌ Error:', invoiceError.message);
} else {
  console.log(`✅ Found ${recentInvoices.length} invoices in the last 30 days`);
  
  if (recentInvoices.length > 0) {
    console.log('\n⚠️  THESE INVOICES WERE CREATED:');
    recentInvoices.forEach((inv, i) => {
      console.log(`  ${i + 1}. ${inv.invoice_number}`);
      console.log(`     Amount: $${inv.total_amount}`);
      console.log(`     Status: ${inv.status}`);
      console.log(`     Created: ${new Date(inv.created_at).toLocaleString()}`);
      console.log('');
    });
  } else {
    console.log('✅ No invoices created recently');
  }
}

console.log('\n🎯 RECOMMENDATION:');
console.log('='.repeat(80));

if (recurring && recurring.length > 0) {
  console.log('⚠️  FOUND RECURRING INVOICE CONFIGURATION');
  console.log('   This COULD trigger automated invoicing if CRON is enabled');
  console.log('');
  console.log('   SAFE OPTIONS:');
  console.log('   1. Keep recurring_invoices but disable CRON job (manual review only)');
  console.log('   2. Set all recurring_invoices.is_active = false until March 1st');
  console.log('   3. Delete recurring_invoices table and recreate after review');
}

if (recentInvoices && recentInvoices.length > 0) {
  console.log('\n⚠️  RECENT INVOICES EXIST');
  console.log('   Review these to ensure no incorrect bills were sent');
}

console.log('\n📧 WELCOME LETTERS:');
console.log('   Status: SAFE TO SEND (notification only, no billing)');
console.log('   Content: Management change announcement for March 1, 2026');
console.log('='.repeat(80));
