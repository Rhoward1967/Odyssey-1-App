/**
 * 🛰️ CONTRACTOR EMAIL TEMPLATES
 * Purpose: Professional HTML email templates for contractor onboarding system
 * Integration: Resend API via send-email Edge Function
 * Constitutional: Branded, secure, compliant communications
 */

/**
 * Generate contractor invitation email
 * 
 * @param contractorName - Legal name of contractor
 * @param inviteUrl - Unique onboarding portal URL
 * @returns HTML email content
 */
export function generateContractorInviteEmail(
  contractorName: string,
  inviteUrl: string
): { subject: string; html: string; text: string } {
  const subject = 'Action Required: Odyssey-1 AI LLC Contractor Onboarding';

  const html = `
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
        Hello <strong>${contractorName}</strong>,
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
      <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 11px;">
        <a href="https://odyssey-1-app.vercel.app/privacy" style="color: #9ca3af; text-decoration: none;">Privacy Policy</a> • 
        <a href="https://odyssey-1-app.vercel.app/terms" style="color: #9ca3af; text-decoration: none;">Terms of Service</a>
      </p>
    </div>

  </div>
</body>
</html>
  `.trim();

  const text = `
ODYSSEY-1 AI LLC - CONTRACTOR ONBOARDING

Hello ${contractorName},

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

  return { subject, html, text };
}

/**
 * Generate contractor approval success email
 * 
 * @param contractorName - Legal name of contractor
 * @returns HTML email content
 */
export function generateContractorApprovalEmail(
  contractorName: string
): { subject: string; html: string; text: string } {
  const subject = '✅ Success: Your Odyssey-1 Direct Deposit is Active';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Onboarding Approved</title>
</head>
<body style="margin: 0; padding: 0; background: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
      <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 48px;">
        ✅
      </div>
      <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 900;">Onboarding Approved!</h1>
      <p style="margin: 10px 0 0 0; color: #d1fae5; font-size: 14px;">You're all set for direct deposit</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
        Hello <strong>${contractorName}</strong>,
      </p>

      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
        Great news! Your onboarding documents have been reviewed and approved by Odyssey-1 AI LLC.
      </p>

      <!-- Status Checklist -->
      <div style="background: #ecfdf5; border: 2px solid #10b981; padding: 25px; margin: 30px 0; border-radius: 12px;">
        <h3 style="margin: 0 0 20px 0; color: #065f46; font-size: 18px;">✓ Your Contractor Status</h3>
        <div style="color: #065f46; line-height: 2;">
          ✅ <strong>W-9 information verified</strong><br>
          ✅ <strong>Direct deposit account activated</strong><br>
          ✅ <strong>Status: APPROVED</strong>
        </div>
      </div>

      <!-- Payment Info -->
      <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 20px; margin: 30px 0; border-radius: 8px;">
        <h3 style="margin: 0 0 15px 0; color: #1e40af; font-size: 16px;">💰 Payment Information</h3>
        <p style="margin: 0; color: #1e40af; line-height: 1.8;">
          You will receive payments via direct deposit starting with the <strong>March 1, 2026</strong> payment cycle.<br>
          <br>
          <strong>No further action is required on your part.</strong>
        </p>
      </div>

      <!-- Important Reminders -->
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 8px;">
        <h3 style="margin: 0 0 15px 0; color: #92400e; font-size: 16px;">📋 Important Reminders</h3>
        <ul style="margin: 0; padding-left: 20px; color: #92400e; line-height: 1.8;">
          <li>You will receive 1099-NEC tax forms in <strong>January 2027</strong> for 2026 earnings</li>
          <li>Keep your banking information secure and up to date</li>
          <li>Contact us immediately if your banking details change</li>
        </ul>
      </div>

      <!-- Support -->
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
        Thank you for completing the Odyssey-1 onboarding process!<br>
        <br>
        Questions? Contact us at:<br>
        📞 <strong>800-403-8492</strong> | 📧 <strong>generalmanager81@gmail.com</strong>
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #1f2937; padding: 30px; text-align: center; color: #9ca3af; font-size: 12px;">
      <p style="margin: 0 0 10px 0; color: #e5e7eb; font-weight: 700; font-size: 14px;">ODYSSEY-1 AI LLC</p>
      <p style="margin: 0; line-height: 1.6;">
        Contractor Management Team<br>
        P.O. Box 80054 • Athens, GA 30608<br>
        📞 800-403-8492 • 📧 generalmanager81@gmail.com
      </p>
    </div>

  </div>
</body>
</html>
  `.trim();

  const text = `
✅ SUCCESS: YOUR ODYSSEY-1 DIRECT DEPOSIT IS ACTIVE

Hello ${contractorName},

Great news! Your onboarding documents have been reviewed and approved by Odyssey-1 AI LLC.

✓ YOUR CONTRACTOR STATUS:
✅ W-9 information verified
✅ Direct deposit account activated
✅ Status: APPROVED

💰 PAYMENT INFORMATION:
You will receive payments via direct deposit starting with the March 1, 2026 payment cycle.

No further action is required on your part.

📋 IMPORTANT REMINDERS:
• You will receive 1099-NEC tax forms in January 2027 for 2026 earnings
• Keep your banking information secure and up to date
• Contact us immediately if your banking details change

Thank you for completing the Odyssey-1 onboarding process!

Questions? Contact us at:
📞 800-403-8492
📧 generalmanager81@gmail.com

ODYSSEY-1 AI LLC | Contractor Management Team
P.O. Box 80054 • Athens, GA 30608
  `.trim();

  return { subject, html, text };
}

/**
 * Generate contractor rejection email
 * 
 * @param contractorName - Legal name of contractor
 * @param reason - Rejection reason from admin
 * @param inviteUrl - Original onboarding URL for re-submission
 * @returns HTML email content
 */
export function generateContractorRejectionEmail(
  contractorName: string,
  reason: string,
  inviteUrl?: string
): { subject: string; html: string; text: string } {
  const subject = '⚠️ Action Required: Odyssey-1 Onboarding Incomplete';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Onboarding Incomplete</title>
</head>
<body style="margin: 0; padding: 0; background: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center;">
      <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 48px;">
        ⚠️
      </div>
      <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 900;">Action Required</h1>
      <p style="margin: 10px 0 0 0; color: #fef3c7; font-size: 14px;">Additional information needed</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
        Hello <strong>${contractorName}</strong>,
      </p>

      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
        We've reviewed your contractor onboarding submission, and unfortunately, we need some additional information 
        before we can approve your account.
      </p>

      <!-- Rejection Reason -->
      <div style="background: #fef2f2; border: 2px solid #ef4444; padding: 25px; margin: 30px 0; border-radius: 12px;">
        <h3 style="margin: 0 0 15px 0; color: #991b1b; font-size: 16px;">❌ Reason for Incomplete Status:</h3>
        <p style="margin: 0; color: #991b1b; line-height: 1.8; white-space: pre-wrap;">${reason}</p>
      </div>

      ${inviteUrl ? `
      <!-- Re-submission CTA -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${inviteUrl}" 
           style="display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 700; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);">
          🔄 RE-SUBMIT ONBOARDING
        </a>
      </div>
      ` : ''}

      <!-- Checklist -->
      <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 20px; margin: 30px 0; border-radius: 8px;">
        <h3 style="margin: 0 0 15px 0; color: #1e40af; font-size: 16px;">✓ Verification Checklist</h3>
        <p style="margin: 0 0 15px 0; color: #1e40af;">Please ensure:</p>
        <ul style="margin: 0; padding-left: 20px; color: #1e40af; line-height: 1.8;">
          <li>Tax ID is correctly formatted (XX-XXXXXXX or XXX-XX-XXXX)</li>
          <li>Bank routing and account numbers match your voided check</li>
          <li>Check number matches the number shown on uploaded check image</li>
          <li>Digital signature matches your legal name exactly</li>
          <li>Voided check image is clear and readable</li>
        </ul>
      </div>

      <!-- Support -->
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
        If you have questions or need assistance, please contact us at:<br>
        📞 <strong>800-403-8492</strong> | 📧 <strong>generalmanager81@gmail.com</strong>
        <br><br>
        We look forward to completing your onboarding process.
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #1f2937; padding: 30px; text-align: center; color: #9ca3af; font-size: 12px;">
      <p style="margin: 0 0 10px 0; color: #e5e7eb; font-weight: 700; font-size: 14px;">ODYSSEY-1 AI LLC</p>
      <p style="margin: 0; line-height: 1.6;">
        Contractor Management Team<br>
        P.O. Box 80054 • Athens, GA 30608<br>
        📞 800-403-8492 • 📧 generalmanager81@gmail.com
      </p>
    </div>

  </div>
</body>
</html>
  `.trim();

  const text = `
⚠️ ACTION REQUIRED: ODYSSEY-1 ONBOARDING INCOMPLETE

Hello ${contractorName},

We've reviewed your contractor onboarding submission, and unfortunately, we need some additional information before we can approve your account.

❌ REASON FOR INCOMPLETE STATUS:
${reason}

${inviteUrl ? `
🔄 RE-SUBMIT YOUR ONBOARDING:
${inviteUrl}

` : ''}
✓ VERIFICATION CHECKLIST

Please ensure:
• Tax ID is correctly formatted (XX-XXXXXXX or XXX-XX-XXXX)
• Bank routing and account numbers match your voided check
• Check number matches the number shown on uploaded check image
• Digital signature matches your legal name exactly
• Voided check image is clear and readable

NEED HELP?
📞 800-403-8492
📧 generalmanager81@gmail.com

We look forward to completing your onboarding process.

ODYSSEY-1 AI LLC | Contractor Management Team
P.O. Box 80054 • Athens, GA 30608
  `.trim();

  return { subject, html, text };
}
