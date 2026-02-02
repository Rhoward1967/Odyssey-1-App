#!/usr/bin/env node
/**
 * Retry Jerry Johnson's onboarding invitation
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tvsxloejfsrdganemsmg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2c3hsb2VqZnNyZGdhbmVtc21nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjcxODg0OCwiZXhwIjoyMDcyMjk0ODQ4fQ.Wr3ffDizDf3DXG2uFD7-z4XrmtQUJjX-m9hiLoMvd1M';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const { data: contractor, error } = await supabase
  .from('contractors')
  .select('*')
  .ilike('full_name', '%Jerry Johnson%')
  .single();

if (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

const baseUrl = 'https://odyssey-1-app.vercel.app';
const inviteUrl = `${baseUrl}/onboarding/contractor/${contractor.onboarding_token}`;

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contractor Onboarding - Odyssey-1 AI LLC</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Odyssey-1 AI LLC</h1>
              <p style="margin: 10px 0 0 0; color: #f0f0f0; font-size: 16px;">Contractor Onboarding</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">Welcome, ${contractor.full_name}!</h2>
              <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">
                You've been invited to complete your contractor onboarding with Odyssey-1 AI LLC. 
                This process will collect the necessary information for us to work together.
              </p>
              <p style="margin: 0 0 24px 0; color: #666666; font-size: 16px; line-height: 1.5;">
                Please complete your onboarding by clicking the button below:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${inviteUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                      Complete Onboarding
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0 0; color: #999999; font-size: 14px; line-height: 1.5;">
                Or copy and paste this link into your browser:<br>
                <a href="${inviteUrl}" style="color: #667eea; word-break: break-all;">${inviteUrl}</a>
              </p>
              <div style="margin-top: 32px; padding-top: 32px; border-top: 1px solid #e0e0e0;">
                <p style="margin: 0 0 12px 0; color: #666666; font-size: 14px; line-height: 1.5;">
                  <strong>What you'll need:</strong>
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #666666; font-size: 14px; line-height: 1.8;">
                  <li>Tax ID (SSN or EIN)</li>
                  <li>Direct deposit information (routing & account number)</li>
                  <li>Digital signature</li>
                  <li>Voided check or bank letter (upload)</li>
                </ul>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; text-align: center; background-color: #f9f9f9; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 8px 0; color: #999999; font-size: 13px;">Odyssey-1 AI LLC</p>
              <p style="margin: 0; color: #999999; font-size: 13px;">
                This is an automated message. Please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
        <table width="600" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
          <tr>
            <td style="padding: 20px; text-align: center; color: #999999; font-size: 12px; line-height: 1.5;">
              This onboarding invitation was sent to ${contractor.email}.<br>
              If you did not expect this email, please contact us immediately.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

console.log(`📧 Retrying: ${contractor.full_name} (${contractor.email})\n`);

const { data, error: sendError } = await supabase.functions.invoke('send-email', {
  body: {
    to: contractor.email,
    subject: 'Complete Your Contractor Onboarding - Odyssey-1 AI LLC',
    html: htmlContent,
  }
});

if (sendError) {
  console.error(`❌ FAILED: ${sendError.message}`);
  console.error('Error details:', sendError);
} else {
  const emailId = data?.id || 'unknown';
  console.log(`✅ SUCCESS`);
  console.log(`   Email ID: ${emailId}`);
  console.log(`   Invite URL: ${inviteUrl}`);
  
  await supabase
    .from('contractors')
    .update({
      invite_sent_at: new Date().toISOString(),
      invite_email_id: emailId,
    })
    .eq('id', contractor.id);
}
