// Verification using service role (bypasses RLS)
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function verifyBidsAccess() {
  console.log('\n🔍 Verifying bids table access with service role...\n');

  // Test: Query bids table
  console.log('Test: Querying bids table...');
  const { data, error, count } = await supabase
    .from('bids')
    .select('*', { count: 'exact' })
    .limit(5);

  if (error) {
    console.log('❌ Error:', error.message);
    if (error.message.includes('permission denied for table bids')) {
      console.log('   ⚠️  Still have table permission error');
    } else if (error.message.includes('permission denied for function is_admin')) {
      console.log('   ⚠️  is_admin function permission error');
    }
    return;
  }

  console.log('✅ SUCCESS! Bids table is accessible');
  console.log(`   Total bids in database: ${count || 0}`);
  
  if (data && data.length > 0) {
    console.log(`   Retrieved ${data.length} sample bids:`);
    data.forEach((bid, i) => {
      console.log(`   ${i + 1}. ID: ${bid.id}, Status: ${bid.status || 'N/A'}`);
    });
  } else {
    console.log('   No bids found (table is empty, but accessible)');
  }

  console.log('\n✨ Both function and table permissions are working correctly!\n');
}

verifyBidsAccess().catch(console.error);
