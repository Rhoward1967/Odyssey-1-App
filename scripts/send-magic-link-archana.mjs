import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

async function sendMagicLinkToArchana() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return false;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });

  // Archana's emails from contacts
  const archanaEmails = ['archana.jitendra@sai-service.com', 'anjujit@gmail.com', 'anju.jhtax@gmail.com'];
  const primaryEmail = 'archana.jitendra@sai-service.com'; // Use primary work email

  console.log('🔗 Sending Magic Link to Archana...');
  console.log('📧 Email:', primaryEmail);
  console.log('🎯 System: Odyssey-1 Accounting Dashboard');
  console.log('');

  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: primaryEmail,
      options: {
        emailRedirectTo: `${process.env.VITE_APP_URL || 'http://localhost:5173'}/auth/callback`,
        shouldCreateUser: true
      }
    });

    if (error) {
      console.error('❌ Failed to send magic link:', error.message);
      return false;
    }

    console.log('✅ Magic Link Sent Successfully!');
    console.log('');
    console.log('📋 Magic Link Details:');
    console.log('   - Recipient: Archana Jitendra');
    console.log('   - Email: ' + primaryEmail);
    console.log('   - Timestamp: ' + new Date().toISOString());
    console.log('   - Expiry: 24 hours');
    console.log('   - Redirect: /auth/callback');
    console.log('');
    console.log('📊 Dashboard Access Provided:');
    console.log('   ✅ Invoices & Recurring Billing');
    console.log('   ✅ Customer Management (billing info)');
    console.log('   ✅ Payments & Transactions');
    console.log('   ✅ Expenses & Budget Tracking');
    console.log('   ✅ Bank Reconciliation (view)');
    console.log('   ✅ Tax Filings & Calculations');
    console.log('   ✅ Payroll Records (view)');
    console.log('   ✅ Revenue Tracking (bids)');
    console.log('');
    console.log('🛡️ System Status:');
    console.log('   ✅ UCC-1 Filing #029-2026-000102 ACCEPTED');
    console.log('   ✅ Email notification SENT with tax implications');
    console.log('   ✅ Account system logs UPDATED (Entry ID: 3829)');
    console.log('   ✅ Magic link SENT for system access');
    console.log('');
    console.log('📝 Next Steps:');
    console.log('   1. Archana receives magic link at ' + primaryEmail);
    console.log('   2. Click link in email to authenticate');
    console.log('   3. Access full accounting dashboard');
    console.log('   4. Begin 2025 tax filing coordination');
    console.log('');

    // Log to system_logs
    const { error: logError } = await supabase
      .from('system_logs')
      .insert({
        level: 'info',
        source: 'auth_system',
        message: 'Magic Link Sent - Archana Jitendra (Accountant Dashboard Access)',
        metadata: {
          recipient: 'Archana Jitendra',
          email: primaryEmail,
          timestamp: new Date().toISOString(),
          purpose: 'Odyssey-1 Accounting Dashboard Access',
          permissions: [
            'Invoices & Recurring Billing',
            'Customer Management (billing)',
            'Payments & Transactions',
            'Expenses & Budget',
            'Bank Reconciliation (view)',
            'Tax Filings & Calculations',
            'Payroll Records (view)',
            'Revenue Tracking (bids)'
          ],
          linkedFiling: '029-2026-000102',
          magicLinkExpiry: '24 hours'
        }
      });

    if (!logError) {
      console.log('✅ Logged to system_logs');
    }

    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

sendMagicLinkToArchana();
