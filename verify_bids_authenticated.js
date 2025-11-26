// Verification script using authenticated session
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyWithAuth() {
  console.log('\n🔍 Verifying bids table with authenticated session...\n');

  // First, check if we have any existing session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    console.log('⚠️  No active session found.');
    console.log('   This test requires a logged-in user.');
    console.log('   The grants were applied to "authenticated" role, not "anon".\n');
    console.log('💡 To test properly:');
    console.log('   1. Log into your app as any user');
    console.log('   2. Try accessing a page that reads from bids table');
    console.log('   3. Check browser console for errors\n');
    return;
  }

  console.log('✅ Found active session for user:', session.user.email);
  
  // Test with authenticated session
  console.log('\nTest: Querying bids table as authenticated user...');
  const { data, error, count } = await supabase
    .from('bids')
    .select('*', { count: 'exact' });

  if (error) {
    console.log('❌ Error:', error.message);
    if (error.message.includes('permission denied for table bids')) {
      console.log('   ⚠️  Still have table permission error (grants may not have propagated)');
    }
  } else {
    console.log('✅ SUCCESS! Bids table is accessible');
    console.log(`   Found ${count || 0} bids (RLS policies applied)`);
    if (data && data.length > 0) {
      console.log(`   Sample bid IDs: ${data.slice(0, 3).map(b => b.id).join(', ')}`);
    }
  }

  console.log('\n✨ Verification complete!\n');
}

verifyWithAuth().catch(console.error);
