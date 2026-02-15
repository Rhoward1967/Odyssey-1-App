/**
 * Update SendGrid Email to invoices@hjsservices.us
 * Fresh email for Odyssey-1 automated invoicing system
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateToInvoicesEmail() {
  console.log('📧 Updating SendGrid to invoices@hjsservices.us');
  console.log('='.repeat(60));

  // Get current active SendGrid config
  const { data: currentConfig, error: fetchError } = await supabase
    .from('email_providers')
    .select('id, config')
    .eq('type', 'sendgrid')
    .eq('is_active', true)
    .single();

  if (fetchError) {
    console.error('❌ Error:', fetchError);
    return;
  }

  console.log('\n✅ Current email:', currentConfig.config?.from_email);

  // Update to new email
  const newConfig = {
    ...currentConfig.config,
    from_name: 'HJS Services LLC',
    from_email: 'invoices@hjsservices.us'
  };

  const { data: updated, error: updateError } = await supabase
    .from('email_providers')
    .update({
      config: newConfig,
      updated_at: new Date().toISOString()
    })
    .eq('id', currentConfig.id)
    .select()
    .single();

  if (updateError) {
    console.error('❌ Error:', updateError);
    return;
  }

  console.log('✅ Updated to:', updated.config.from_email);
  console.log('\n' + '='.repeat(60));
  console.log('📋 NEXT STEPS - Domain Authentication in SendGrid:');
  console.log('='.repeat(60));
  console.log('\n1. Log into SendGrid: https://app.sendgrid.com/');
  console.log('2. Go to: Settings → Sender Authentication');
  console.log('3. Click: "Authenticate Your Domain"');
  console.log('4. Enter domain: hjsservices.us (NOT odyssey-1.ai)');
  console.log('5. SendGrid will show DNS records for hjsservices.us');
  console.log('6. Add those DNS records to your domain host');
  console.log('7. Click "Verify" in SendGrid');
  console.log('\n⚠️  IMPORTANT: You need hjsservices.us DNS records,');
  console.log('   NOT the odyssey-1.ai records you saw earlier!');
  console.log('\n🎯 Deadline: Before March 1, 2026 (13 days)');
  console.log('='.repeat(60));
}

updateToInvoicesEmail();
