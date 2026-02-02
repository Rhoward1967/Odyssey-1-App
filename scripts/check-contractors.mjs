#!/usr/bin/env node
/**
 * Send onboarding invitations to 5 contractors who need them
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tvsxloejfsrdganemsmg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2c3hsb2VqZnNyZGdhbmVtc21nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjcxODg0OCwiZXhwIjoyMDcyMjk0ODQ4fQ.Wr3ffDizDf3DXG2uFD7-z4XrmtQUJjX-m9hiLoMvd1M';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

console.log('📋 LISTING CONTRACTORS WHO NEED ONBOARDING\n');

// Get all contractors
const { data: contractors, error } = await supabase
  .from('contractors')
  .select('*')
  .order('full_name');

if (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

console.log(`Total contractors in database: ${contractors.length}\n`);

// Show all contractors with their status
contractors.forEach((c, i) => {
  const hasEmail = !!c.email;
  const hasToken = !!c.onboarding_token;
  const needsOnboarding = hasEmail && (!hasToken || c.onboarding_status === 'pending');
  
  console.log(`${i + 1}. ${c.full_name}`);
  console.log(`   Email: ${c.email || '❌ NOT SET'}`);
  console.log(`   Status: ${c.status || 'pending'} | Onboarding: ${c.onboarding_status || 'not started'}`);
  console.log(`   Token: ${hasToken ? '✅' : '❌'} | Needs Onboarding: ${needsOnboarding ? '⚠️ YES' : 'No'}`);
  console.log('');
});

console.log('=' .repeat(100));
console.log('\n📊 Which 5 contractors need onboarding invitations sent?\n');
console.log('(List their numbers from above, or type "all" to send to everyone with email)\n');
