/**
 * 🚀 BATCH SEND: First 5 Contractor Invitations
 * Purpose: Send onboarding invites to contractors with verified emails
 * Usage: node scripts/send-first-five-invites.mjs
 */

import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ ERROR: Missing environment variables');
  console.error('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const contractors = [
  {
    name: 'Rodney Deadwyler',
    email: 'rodneydeadwyler1970@gmail.com',
    title: 'Facility Manager',
    rate: 26200 // $262.00
  },
  {
    name: 'Jerry Johnson',
    email: 'justj802@gmail.com',
    title: 'Site Manager',
    rate: 26200
  },
  {
    name: 'Robert Hale',
    email: 'toehale@bellsouth.net',
    title: 'Contractor',
    rate: 26200
  },
  {
    name: 'Andre Foster',
    email: 'drezulufoster@gmail.com',
    title: 'Contractor',
    rate: 26200
  },
  {
    name: 'Jeremy Walker',
    email: 'advancedcarpetcleaninginc1@gmail.com',
    title: 'Owner, Advanced Carpet Cleaning',
    rate: 26200
  }
];

console.log('🚀 BATCH CONTRACTOR ONBOARDING - FIRST 5\n');
console.log('═'.repeat(60));

const results = [];

for (const contractor of contractors) {
  console.log(`\n📤 Processing: ${contractor.name}`);
  console.log(`   Email: ${contractor.email}`);
  console.log(`   Title: ${contractor.title}`);
  
  try {
    // 1. Generate unique token
    const token = crypto.randomUUID();
    
    // 2. Create contractor record in database (using service role to bypass RLS)
    const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/contractors`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        full_name: contractor.name,
        email: contractor.email,
        flat_rate_cents: contractor.rate,
        onboarding_token: token,
        onboarding_status: 'pending',
        email_delivery_status: 'not_sent',
        created_at: new Date().toISOString()
      })
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Database insert failed: ${createResponse.status} - ${errorText}`);
    }

    const [contractorRecord] = await createResponse.json();
    const inviteUrl = `https://odyssey-1-app.vercel.app/onboarding/contractor/${token}`;
    
    console.log(`   ✅ Database record created (ID: ${contractorRecord.id})`);
    console.log(`   🔗 Invite URL: ${inviteUrl}`);

    // 3. Generate email HTML
    const emailHtml = generateInviteEmail(contractor.name, inviteUrl);
    
    // 4. Send email via Resend (using verified odyssey-1.ai domain)
    const emailResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: contractor.email,
        subject: 'Action Required: Odyssey-1 AI LLC Contractor Onboarding',
        html: emailHtml,
        textContent: generateInviteText(contractor.name, inviteUrl),
        from: 'Rickey Howard <onboarding@odyssey-1.ai>'  // Verified production domain
      })
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      throw new Error(`Email send failed: ${emailResponse.status} - ${errorText}`);
    }

    const emailResult = await emailResponse.json();
    
    // 5. Update contractor record with email tracking
    await fetch(`${SUPABASE_URL}/rest/v1/contractors?id=eq.${contractorRecord.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        invite_sent_at: new Date().toISOString(),
        invite_email_id: emailResult.emailId,
        email_delivery_status: 'sent'
      })
    });

    console.log(`   ✅ Email sent (ID: ${emailResult.emailId})`);
    console.log(`   ✅ Tracking updated`);
    
    results.push({
      name: contractor.name,
      email: contractor.email,
      status: 'success',
      emailId: emailResult.emailId,
      inviteUrl
    });

  } catch (error) {
    console.error(`   ❌ FAILED: ${error.message}`);
    results.push({
      name: contractor.name,
      email: contractor.email,
      status: 'failed',
      error: error.message
    });
  }
}

console.log('\n' + '═'.repeat(60));
console.log('\n📊 BATCH SEND COMPLETE\n');

const successful = results.filter(r => r.status === 'success');
const failed = results.filter(r => r.status === 'failed');

console.log(`✅ Successful: ${successful.length}/${contractors.length}`);
console.log(`❌ Failed: ${failed.length}/${contractors.length}\n`);

if (successful.length > 0) {
  console.log('✅ SUCCESSFULLY SENT:');
  successful.forEach(r => {
    console.log(`   • ${r.name} (${r.email})`);
    console.log(`     Email ID: ${r.emailId}`);
  });
}

if (failed.length > 0) {
  console.log('\n❌ FAILED:');
  failed.forEach(r => {
    console.log(`   • ${r.name} (${r.email})`);
    console.log(`     Error: ${r.error}`);
  });
}

console.log('\n🎯 NEXT STEPS:');
console.log('   1. Check your Resend dashboard for delivery status');
console.log('   2. Monitor Compliance tab in ContractorManager for submissions');
console.log('   3. Get emails for Kenneth Howard and Florence Lee');
console.log('\n🛰️ March 1st countdown: 28 days\n');

function generateInviteEmail(name, inviteUrl) {
  return `
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
        Hello <strong>${name}</strong>,
      </p>

      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
        To ensure your 1099 compliance and set up your direct deposit for the <strong>March 1st payment cycle</strong>, 
        please complete our secure onboarding form using the link below.
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${inviteUrl}" 
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

      <!-- Benefits -->
      <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 30px 0; border-radius: 8px;">
        <h3 style="margin: 0 0 15px 0; color: #065f46; font-size: 16px;">✅ Your Benefits</h3>
        <ul style="margin: 0; padding-left: 20px; color: #065f46; line-height: 1.8;">
          <li>IRS-compliant 1099 filing</li>
          <li>Secure direct deposit setup</li>
          <li>Faster payment processing</li>
          <li>Automated year-end tax forms</li>
        </ul>
      </div>

      <!-- Security Notice -->
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 8px;">
        <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
          <strong>⚠️ Important Security Notice:</strong><br>
          This link is unique to you and should not be shared. It will expire after submission or after 7 days. 
          All data is encrypted and stored securely according to IRS requirements.
        </p>
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
        P.O. Box 80054 • Athens, GA 30608<br>
        📞 800-403-8492 • 📧 generalmanager81@gmail.com
      </p>
    </div>

  </div>
</body>
</html>
  `.trim();
}

function generateInviteText(name, inviteUrl) {
  return `
ODYSSEY-1 AI LLC - CONTRACTOR ONBOARDING

Hello ${name},

Welcome to the Odyssey-1 team! To ensure your 1099 compliance and set up your direct deposit for the March 1st payment cycle, please complete our secure onboarding form.

🔒 SECURE ONBOARDING LINK:
${inviteUrl}

WHAT YOU'LL NEED (5 minutes):
• Tax ID (SSN or EIN)
• Bank routing and account numbers  
• Check number from voided check
• Photo of voided check or bank letter
• Digital signature for W-9 certification

YOUR BENEFITS:
✅ IRS-compliant 1099 filing
✅ Secure direct deposit setup
✅ Faster payment processing
✅ Automated year-end tax forms

⚠️ IMPORTANT SECURITY NOTICE:
This link is unique to you and should not be shared. It will expire after submission or after 7 days. All data is encrypted and stored securely according to IRS requirements.

NEED HELP?
📞 800-403-8492
📧 generalmanager81@gmail.com

ODYSSEY-1 AI LLC | A Sovereign Managed Asset
P.O. Box 80054 • Athens, GA 30608
  `.trim();
}
