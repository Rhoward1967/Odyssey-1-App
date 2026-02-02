/**
 * 🧪 TEST: Contractor Invitation Email
 * Purpose: Send test contractor invite to verify Resend integration
 * Usage: node scripts/test-contractor-invite.mjs
 */

import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ ERROR: Missing environment variables');
  console.error('Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const testInvite = async () => {
  console.log('🚀 Testing Contractor Invitation Email...\n');
  
  // Test contractor data
  const testContractor = {
    name: 'John Smith',
    email: 'generalmanager81@gmail.com', // Your email for testing
    inviteUrl: 'https://odyssey-1-app.vercel.app/onboarding/contractor/test-token-123'
  };

  console.log('📋 Test Parameters:');
  console.log(`   Name: ${testContractor.name}`);
  console.log(`   To: ${testContractor.email}`);
  console.log(`   Invite URL: ${testContractor.inviteUrl}\n`);

  // Build email content using template
  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Odyssey-1 Contractor Onboarding</title>
</head>
<body style="margin: 0; padding: 0; background: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 40px 30px; text-align: center;">
      <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 900; letter-spacing: -1px;">ODYSSEY-1 AI LLC</h1>
      <p style="margin: 10px 0 0 0; color: #bfdbfe; font-size: 13px; letter-spacing: 2px; text-transform: uppercase;">A Sovereign Managed Asset</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">Welcome to the Odyssey-1 Team!</h2>
      
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
        Hello <strong>${testContractor.name}</strong>,
      </p>

      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
        To ensure your 1099 compliance and set up your direct deposit for the <strong>March 1st payment cycle</strong>, 
        please complete our secure onboarding form using the link below.
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${testContractor.inviteUrl}" 
           style="display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 700; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);">
          🔒 START SECURE ONBOARDING
        </a>
      </div>

      <!-- Requirements -->
      <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 20px; margin: 30px 0; border-radius: 8px;">
        <h3 style="margin: 0 0 15px 0; color: #1e40af; font-size: 16px;">📋 What You'll Need (5 minutes)</h3>
        <ul style="margin: 0; padding-left: 20px; color: #1e40af; line-height: 1.8;">
          <li>Tax ID (SSN or EIN)</li>
          <li>Bank routing and account numbers</li>
          <li>Check number from voided check</li>
          <li>Photo of voided check or bank letter</li>
          <li>Digital signature for W-9 certification</li>
        </ul>
      </div>

      <!-- Support -->
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
        If you have any questions or need assistance, please contact us at:<br>
        📞 <strong>800-403-8492</strong> | 📧 <strong>generalmanager81@gmail.com</strong>
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #1f2937; padding: 30px; text-align: center; color: #9ca3af; font-size: 12px;">
      <p style="margin: 0 0 10px 0; color: #e5e7eb; font-weight: 700; font-size: 14px;">ODYSSEY-1 AI LLC</p>
      <p style="margin: 0; line-height: 1.6;">
        A Sovereign Managed Asset<br>
        P.O. Box 80054 • Athens, GA 30608
      </p>
    </div>

  </div>
</body>
</html>
  `.trim();

  try {
    console.log('📤 Calling Resend API via send-email Edge Function...\n');
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: testContractor.email,
        subject: 'Action Required: Odyssey-1 AI LLC Contractor Onboarding',
        html: emailHtml,
        textContent: `
ODYSSEY-1 AI LLC - CONTRACTOR ONBOARDING

Hello ${testContractor.name},

Welcome to the Odyssey-1 team! To ensure your 1099 compliance and set up your direct deposit for the March 1st payment cycle, please complete our secure onboarding form.

🔒 SECURE ONBOARDING LINK:
${testContractor.inviteUrl}

WHAT YOU'LL NEED (5 minutes):
• Tax ID (SSN or EIN)
• Bank routing and account numbers
• Check number from voided check
• Photo of voided check or bank letter
• Digital signature for W-9 certification

Questions? Contact us at:
📞 800-403-8492
📧 generalmanager81@gmail.com

ODYSSEY-1 AI LLC | A Sovereign Managed Asset
        `.trim()
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Email send failed:', response.status, errorText);
      process.exit(1);
    }

    const result = await response.json();
    console.log('✅ SUCCESS! Email sent via Resend\n');
    console.log('📧 Email Details:');
    console.log(`   Email ID: ${result.emailId}`);
    console.log(`   Timestamp: ${result.timestamp}`);
    console.log(`   Recipients: ${result.recipients.join(', ')}\n`);
    console.log('🎯 Check your inbox at generalmanager81@gmail.com');
    console.log('   (If not in inbox, check spam folder)\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Verify send-email Edge Function is deployed');
    console.error('  2. Check RESEND_API_KEY in Supabase secrets');
    console.error('  3. Confirm .env has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    process.exit(1);
  }
};

testInvite();
