#!/usr/bin/env node
/**
 * List all contractors and their onboarding status
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tvsxloejfsrdganemsmg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2c3hsb2VqZnNyZGdhbmVtc21nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjcxODg0OCwiZXhwIjoyMDcyMjk0ODQ4fQ.Wr3ffDizDf3DXG2uFD7-z4XrmtQUJjX-m9hiLoMvd1M';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

console.log('📋 CONTRACTOR LIST\n');

const { data: contractors, error } = await supabase
  .from('contractors')
  .select('id, full_name, email, status, onboarding_status, onboarding_token, created_at')
  .order('full_name');

if (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

console.log(`Total Contractors: ${contractors.length}\n`);
console.log('=' .repeat(120));
console.log('');

contractors.forEach((c, index) => {
  console.log(`${index + 1}. ${c.full_name}`);
  console.log(`   Email: ${c.email || 'NOT SET'}`);
  console.log(`   Status: ${c.status || 'pending'}`);
  console.log(`   Onboarding: ${c.onboarding_status || 'not started'}`);
  console.log(`   Token: ${c.onboarding_token ? 'EXISTS' : 'NOT GENERATED'}`);
  console.log(`   Created: ${new Date(c.created_at).toLocaleDateString()}`);
  console.log('');
});

console.log('=' .repeat(120));
console.log(`\n📊 Summary: ${contractors.length} contractors total\n`);

// Count by status
const needsOnboarding = contractors.filter(c => !c.onboarding_token || c.onboarding_status === 'pending');
console.log(`⏳ Need Onboarding: ${needsOnboarding.length}`);
console.log(`✅ Completed: ${contractors.filter(c => c.onboarding_status === 'approved').length}`);
console.log(`📝 Submitted: ${contractors.filter(c => c.onboarding_status === 'submitted').length}\n`);

if (needsOnboarding.length > 0) {
  console.log('👥 Contractors needing onboarding:');
  needsOnboarding.forEach((c, i) => {
    console.log(`   ${i + 1}. ${c.full_name} (${c.email || 'NO EMAIL'})`);
  });
}
