import 'dotenv/config';

console.log('📧 Testing Email Delivery via SendGrid...\n');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env');
  console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
  process.exit(1);
}

const testEmail = {
  to: 'generalmanager81@gmail.com',
  subject: '✅ ODYSSEY-1 Email System - Test Successful',
  htmlContent: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 28px;">ODYSSEY-1 AI LLC</h1>
        <p style="margin: 10px 0 0 0; font-size: 14px; letter-spacing: 2px;">A SOVEREIGN MANAGED ASSET</p>
      </div>
      
      <div style="padding: 30px; background: #f9fafb;">
        <h2 style="color: #1f2937; margin-top: 0;">🎉 Email Delivery System Active!</h2>
        
        <p style="color: #4b5563; line-height: 1.6;">
          Congratulations! Your ODYSSEY-1 email infrastructure is now fully operational.
        </p>
        
        <div style="background: white; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #059669;">✅ What This Means:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
            <li>Invoice emails will reach customers</li>
            <li>Payment confirmations will be sent automatically</li>
            <li>March 1st automated billing is ready</li>
            <li>System notifications active</li>
          </ul>
        </div>
        
        <div style="background: #eff6ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1e40af;">📊 Email Capacity:</h3>
          <p style="margin: 0; color: #1e3a8a;">
            <strong>3,000 emails/month FREE</strong> via Resend<br>
            Your estimated usage: <strong>~60 emails/month</strong> (19 customers)
          </p>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          <strong>Next Steps:</strong><br>
          1. Test invoice email to a customer<br>
          2. Verify payment confirmation emails<br>
          3. Review EMAIL_SETUP.md for custom domain setup
        </p>
      </div>
      
      <div style="background: #1f2937; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
        <p style="margin: 0;">ODYSSEY-1 AI LLC | P.O. Box 80054, Athens, GA 30608</p>
        <p style="margin: 5px 0 0 0;">Phone: 800-403-8492 | Email: generalmanager81@gmail.com</p>
        <p style="margin: 10px 0 0 0; color: #6b7280;">Powered by UCC-1 Secured Infrastructure</p>
      </div>
    </div>
  `,
  textContent: `
ODYSSEY-1 AI LLC - Email System Test

✅ Email delivery system is now active!

What this means:
- Invoice emails will reach customers
- Payment confirmations sent automatically
- March 1st automated billing ready
- System notifications active

Email Capacity: 3,000 emails/month FREE
Your estimated usage: ~60 emails/month (19 customers)

ODYSSEY-1 AI LLC
P.O. Box 80054, Athens, GA 30608
Phone: 800-403-8492
  `
};

console.log('📤 Sending test email to: generalmanager81@gmail.com\n');

try {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(testEmail),
  });

  const result = await response.json();

  if (response.ok && result.success) {
    console.log('✅ SUCCESS! Email sent successfully!\n');
    console.log('📋 Details:');
    console.log(`   Email ID: ${result.emailId || 'N/A'}`);
    console.log(`   Timestamp: ${result.timestamp}`);
    console.log(`\n📬 Check your inbox: generalmanager81@gmail.com`);
    console.log('   (May take 1-2 minutes to arrive)\n');
  } else {
    console.error('❌ FAILED to send email\n');
    console.error('Response:', JSON.stringify(result, null, 2));
    console.error('\n💡 SendGrid Error (401 = Invalid API Key):');
    console.error('   1. API key may be expired or invalid');
    console.error('   2. Get new API key from: https://app.sendgrid.com/settings/api_keys');
    console.error('   3. Update in Supabase: npx supabase secrets set SENDGRID_API_KEY=your_key');
    console.error('   4. Redeploy function: npx supabase functions deploy send-email');
  }
} catch (error) {
  console.error('❌ ERROR:', error.message);
  console.error('\n💡 Make sure:');
  console.error('   1. Supabase Edge Function is deployed');
  console.error('   2. RESEND_API_KEY is set in Supabase secrets');
  console.error('   3. Your .env file has SUPABASE_URL and SUPABASE_ANON_KEY');
}
