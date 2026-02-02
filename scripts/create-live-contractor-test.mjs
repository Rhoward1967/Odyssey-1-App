#!/usr/bin/env node
/**
 * 🚀 CREATE LIVE CONTRACTOR ONBOARDING TEST
 * Purpose: Generate real contractor with live onboarding token
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://tvsxloejfsrdganemsmg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2c3hsb2VqZnNyZGdhbmVtc21nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjcxODg0OCwiZXhwIjoyMDcyMjk0ODQ4fQ.Wr3ffDizDf3DXG2uFD7-z4XrmtQUJjX-m9hiLoMvd1M';
const USER_ID = 'eca49ca9-b4ae-4e0e-b78a-fa1811024781';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

console.log('🚀 CREATING LIVE CONTRACTOR ONBOARDING TEST\n');

// Test contractor
const testContractor = {
  full_name: 'Test Contractor (Rickey Howard)',
  email: 'generalmanager81@gmail.com',
  flat_rate_cents: 26200 // $262.00
};

console.log('📋 Creating Contractor:');
console.log(`   Name: ${testContractor.full_name}`);
console.log(`   Email: ${testContractor.email}`);
console.log(`   Rate: $${(testContractor.flat_rate_cents / 100).toFixed(2)}\n`);

// Generate UUID token
const token = crypto.randomUUID();

// Create contractor in database
const { data: contractor, error: dbError} = await supabase
  .from('contractors')
  .insert([
    {
      full_name: testContractor.full_name,
      email: testContractor.email,
      flat_rate_cents: testContractor.flat_rate_cents,
      onboarding_token: token,
      onboarding_status: 'pending',
      status: 'pending',
      email_delivery_status: 'not_sent',
      created_at: new Date().toISOString()
    }
  ])
  .select()
  .single();

if (dbError) {
  console.error('❌ Database Error:', dbError.message);
  process.exit(1);
}

console.log('✅ Contractor Created in Database');
console.log(`   ID: ${contractor.id}`);
console.log(`   Token: ${token}\n`);

// Generate invite URL
const baseUrl = 'http://localhost:8080'; // Local dev
const inviteUrl = `${baseUrl}/contractor-onboarding?token=${token}`;

console.log('🔗 ONBOARDING LINK GENERATED:\n');
console.log(`   ${inviteUrl}\n`);

// Send invitation email
console.log('📧 Sending Invitation Email...\n');

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
        Hello <strong>${testContractor.full_name}</strong>,
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
`;

const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: testContractor.email,
    subject: '🔒 Action Required: Odyssey-1 AI LLC Contractor Onboarding',
    htmlContent: emailHtml,
    textContent: `
ODYSSEY-1 AI LLC - CONTRACTOR ONBOARDING

Hello ${testContractor.full_name},

Welcome to the Odyssey-1 team! To ensure your 1099 compliance and set up your direct deposit for the March 1st payment cycle, please complete our secure onboarding form.

🔒 SECURE ONBOARDING LINK:
${inviteUrl}

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

const result = await response.json();

if (result.success) {
  console.log('✅ EMAIL SENT SUCCESSFULLY!\n');
  console.log(`   Email ID: ${result.emailId}`);
  console.log(`   Sent to: ${testContractor.email}\n`);
  
  // Update contractor record with email tracking
  await supabase
    .from('contractors')
    .update({
      invite_sent_at: new Date().toISOString(),
      invite_email_id: result.emailId,
      email_delivery_status: 'sent'
    })
    .eq('id', contractor.id);
  
  console.log('✅ Database updated with email tracking\n');
  console.log('=' .repeat(80));
  console.log('\n🎯 NEXT STEPS:\n');
  console.log('1. Check your email: generalmanager81@gmail.com');
  console.log('2. Click the onboarding link in the email');
  console.log('3. Or open directly in browser:');
  console.log(`   ${inviteUrl}\n`);
  console.log('4. Complete the onboarding form');
  console.log('5. Verify contractor status changes to "submitted"\n');
} else {
  console.error('❌ Email send failed:', result.error);
  process.exit(1);
}
