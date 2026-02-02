import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔍 Retrieving Stripe account details...\n');

try {
  // Get account details including branding
  const account = await stripe.accounts.retrieve('acct_1S2w0SDPqeWRzwCX');
  
  console.log('📋 Account Information:');
  console.log(`   Business Name: ${account.business_profile?.name || 'N/A'}`);
  console.log(`   Logo URL: ${account.settings?.branding?.icon || 'N/A'}`);
  console.log(`   Primary Color: ${account.settings?.branding?.primary_color || 'N/A'}`);
  
  const logoUrl = account.settings?.branding?.icon;
  
  if (logoUrl) {
    console.log('\n✅ Logo found in Stripe!\n');
    console.log(`🔗 Logo URL: ${logoUrl}\n`);
    
    console.log('📝 Updating company_profiles table...');
    const { data, error } = await supabase
      .from('company_profiles')
      .update({ 
        logo_url: logoUrl,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', 'eca49ca9-b4ae-4e0e-b78a-fa1811024781')
      .select();
    
    if (error) {
      console.error('❌ Error updating company_profiles:', error.message);
    } else {
      console.log('✅ Company profile updated with logo URL!');
      console.log('   Updated records:', data?.length || 0);
    }
  } else {
    console.log('\n⚠️  No logo found in Stripe account settings.');
    console.log('   Please upload the logo at: https://dashboard.stripe.com/settings/branding');
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
