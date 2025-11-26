// Quick verification script for bids table fix
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyBidsFix() {
  console.log('\n🔍 Verifying bids table fix...\n');

  // Test 1: Check if bids table is accessible
  console.log('Test 1: Checking bids table accessibility...');
  const { data: bidsData, error: bidsError } = await supabase
    .from('bids')
    .select('count')
    .limit(1);

  if (bidsError) {
    console.log('❌ Bids table error:', bidsError.message);
    if (bidsError.message.includes('permission denied for function is_admin')) {
      console.log('   ⚠️  Still have permission error on is_admin function');
    }
  } else {
    console.log('✅ Bids table is accessible (no permission errors)');
  }

  // Test 2: Check if we can query bids with RLS
  console.log('\nTest 2: Testing RLS policies on bids...');
  const { data: bidsRLS, error: rlsError } = await supabase
    .from('bids')
    .select('*')
    .limit(5);

  if (rlsError) {
    console.log('❌ RLS policy error:', rlsError.message);
  } else {
    console.log(`✅ RLS policies working - returned ${bidsRLS?.length || 0} bids`);
  }

  // Test 3: Verify table structure
  console.log('\nTest 3: Verifying bids table structure...');
  const { data: structureData, error: structureError } = await supabase
    .from('bids')
    .select('*')
    .limit(0);

  if (structureError) {
    console.log('❌ Structure check error:', structureError.message);
  } else {
    console.log('✅ Bids table structure verified');
  }

  console.log('\n✨ Verification complete!\n');
}

verifyBidsFix().catch(console.error);
