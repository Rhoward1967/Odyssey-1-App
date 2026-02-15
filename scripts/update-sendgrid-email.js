/**
 * Update SendGrid Email Configuration
 * Changes from: "ODYSSEY-1 Platform <noreply@odyssey1.com>"
 * Changes to: "HJS Services LLC <accountsrecievables@hjsservices.us>"
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateSendGridEmail() {
  console.log('📧 SendGrid Email Configuration Update');
  console.log('=' .repeat(60));

  // Step 1: Check current configuration
  console.log('\n1️⃣ Checking current SendGrid configuration...');
  const { data: currentConfig, error: fetchError } = await supabase
    .from('email_providers')
    .select('id, type, is_active, config')
    .eq('type', 'sendgrid')
    .eq('is_active', true)
    .single();

  if (fetchError) {
    console.error('❌ Error fetching current config:', fetchError);
    return;
  }

  if (!currentConfig) {
    console.error('❌ No active SendGrid provider found');
    return;
  }

  console.log('✅ Current configuration:');
  console.log(`   Provider ID: ${currentConfig.id}`);
  console.log(`   From Name: ${currentConfig.config?.from_name || 'NOT SET'}`);
  console.log(`   From Email: ${currentConfig.config?.from_email || 'NOT SET'}`);
  console.log(`   API Key: ${currentConfig.config?.api_key ? '✓ Present' : '✗ Missing'}`);

  // Step 2: Update configuration
  console.log('\n2️⃣ Updating to correct email configuration...');
  const newConfig = {
    ...currentConfig.config,
    from_name: 'HJS Services LLC',
    from_email: 'accountsrecievables@hjsservices.us'
  };

  const { data: updatedConfig, error: updateError } = await supabase
    .from('email_providers')
    .update({
      config: newConfig,
      updated_at: new Date().toISOString()
    })
    .eq('id', currentConfig.id)
    .select()
    .single();

  if (updateError) {
    console.error('❌ Error updating config:', updateError);
    return;
  }

  console.log('✅ Configuration updated successfully!');
  console.log(`   New From Name: ${updatedConfig.config.from_name}`);
  console.log(`   New From Email: ${updatedConfig.config.from_email}`);

  // Step 3: Domain verification status
  console.log('\n3️⃣ Domain Verification Status:');
  console.log('=' .repeat(60));
  console.log('⚠️  CRITICAL: hjsservices.us domain NOT verified in SendGrid');
  console.log('');
  console.log('📋 To verify the domain (prevents emails going to spam):');
  console.log('');
  console.log('1. Log into SendGrid dashboard: https://app.sendgrid.com/');
  console.log('2. Go to Settings → Sender Authentication');
  console.log('3. Click "Authenticate Your Domain"');
  console.log('4. Enter domain: hjsservices.us');
  console.log('5. SendGrid will provide DNS records (CNAME records)');
  console.log('6. Add these records to your domain DNS settings');
  console.log('7. Wait for verification (usually 24-48 hours)');
  console.log('');
  console.log('🎯 This must be completed BEFORE March 1, 2026');
  console.log('   (13 days remaining)');
  console.log('');
  console.log('=' .repeat(60));
  console.log('✅ Email configuration update complete!');
}

updateSendGridEmail().catch(console.error);
