#!/usr/bin/env node
/**
 * Check recurring_invoices for user_id column and values
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tvsxloejfsrdganemsmg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2c3hsb2VqZnNyZGdhbmVtc21nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjcxODg0OCwiZXhwIjoyMDcyMjk0ODQ4fQ.Wr3ffDizDf3DXG2uFD7-z4XrmtQUJjX-m9hiLoMvd1M';
const USER_ID = 'eca49ca9-b4ae-4e0e-b78a-fa1811024781';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

console.log('\n🔍 CHECKING RECURRING_INVOICES USER_ID COLUMN');
console.log('='.repeat(80));

// Check if user_id column exists and what values it has
const { data: allRecurring, error } = await supabase
  .from('recurring_invoices')
  .select('id, customer_id, user_id, amount_cents, frequency, is_active')
  .limit(25);

if (error) {
  console.error('❌ Error:', error.message);
  console.error('Code:', error.code);
  console.error('Details:', error.details);
} else {
  console.log(`\n📊 Total records: ${allRecurring.length}`);
  
  // Check for user_id values
  const withUserId = allRecurring.filter(r => r.user_id);
  const withoutUserId = allRecurring.filter(r => !r.user_id);
  const matchingUserId = allRecurring.filter(r => r.user_id === USER_ID);
  
  console.log(`   With user_id: ${withUserId.length}`);
  console.log(`   Without user_id (NULL): ${withoutUserId.length}`);
  console.log(`   Matching ${USER_ID}: ${matchingUserId.length}`);
  
  if (withUserId.length > 0) {
    console.log('\n📋 Sample user_id values:');
    const uniqueUserIds = [...new Set(withUserId.map(r => r.user_id))];
    uniqueUserIds.forEach(id => {
      const count = allRecurring.filter(r => r.user_id === id).length;
      console.log(`   ${id}: ${count} records`);
    });
  }
  
  if (withoutUserId.length > 0) {
    console.log(`\n⚠️  ${withoutUserId.length} records have NULL user_id`);
    console.log('   These records are invisible to RLS-protected queries');
  }
}

console.log('\n🎯 DIAGNOSIS:');
console.log('='.repeat(80));
console.log('If user_id is NULL on all/most records:');
console.log('  → Frontend queries with .eq("user_id", userId) return 0 rows');
console.log('  → RLS policies block access because user_id doesn\'t match');
console.log('');
console.log('SOLUTION:');
console.log('  UPDATE recurring_invoices SET user_id = \'eca49ca9-b4ae-4e0e-b78a-fa1811024781\';');
console.log('='.repeat(80));
