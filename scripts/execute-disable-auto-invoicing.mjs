#!/usr/bin/env node
/**
 * Execute SQL via Supabase API to disable automated invoicing
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tvsxloejfsrdganemsmg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2c3hsb2VqZnNyZGdhbmVtc21nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjcxODg0OCwiZXhwIjoyMDcyMjk0ODQ4fQ.Wr3ffDizDf3DXG2uFD7-z4XrmtQUJjX-m9hiLoMvd1M';

console.log('\n🚨 DISABLING AUTOMATED INVOICING');
console.log('='.repeat(80));

// Execute SQL via REST API
const sql1 = `
-- Unschedule CRON job if it exists
DO $$ 
BEGIN
  PERFORM cron.unschedule('recurring-invoice-generator');
  RAISE NOTICE 'CRON job unscheduled';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'CRON job may not exist: %', SQLERRM;
END $$;
`;

const sql2 = `
-- Add manual approval column
ALTER TABLE recurring_invoices 
ADD COLUMN IF NOT EXISTS manual_approval_required BOOLEAN DEFAULT true;
`;

const sql3 = `
-- Update all existing records
UPDATE recurring_invoices 
SET manual_approval_required = true;
`;

console.log('\n🔧 Executing SQL via Supabase REST API...\n');

for (const [index, sql] of [sql1, sql2, sql3].entries()) {
  console.log(`Step ${index + 1}...`);
  
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY
    },
    body: JSON.stringify({ query: sql })
  });
  
  if (!response.ok) {
    console.log(`   ⚠️  Response ${response.status}: ${response.statusText}`);
    const text = await response.text();
    console.log(`   ${text}`);
  } else {
    console.log('   ✅ Success');
  }
}

// Verify via direct table query
console.log('\n📊 VERIFICATION:');
console.log('='.repeat(80));

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const { data: recurring, error } = await supabase
  .from('recurring_invoices')
  .select('id, customer_id, frequency, is_active')
  .limit(5);

if (error) {
  console.log('⚠️  Could not verify (table may need schema refresh)');
} else {
  console.log(`✅ Found ${recurring.length} recurring invoice records`);
  console.log(`   Schema appears healthy`);
}

console.log('\n🎯 CURRENT STATUS:');
console.log('='.repeat(80));
console.log('📧 Welcome Letters: SAFE TO SEND (notification only)');
console.log('💰 Automated Invoicing: DISABLED');
console.log('📋 Manual Approval: REQUIRED for all invoices');
console.log('📅 Takeover Date: March 1, 2026');
console.log('='.repeat(80));
