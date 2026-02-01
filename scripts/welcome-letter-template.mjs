#!/usr/bin/env node
/**
 * Generate Welcome Letter HTML email for March 1st transition
 * Professional email template for Odyssey-1 AI LLC branding announcement
 */

export function generateWelcomeLetter(customerName, companyName) {
  const clientDisplay = companyName || customerName || 'Valued Client';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Important: Security & Billing Update</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 650px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #1e40af;
      font-size: 24px;
      margin: 0 0 10px 0;
      font-weight: 600;
    }
    .tagline {
      color: #2563eb;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }
    .greeting {
      font-size: 18px;
      color: #1e40af;
      margin-bottom: 20px;
      font-weight: 500;
    }
    .content p {
      margin: 0 0 16px 0;
      color: #374151;
    }
    .highlight-box {
      background: #eff6ff;
      border-left: 4px solid #2563eb;
      padding: 20px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .highlight-box h3 {
      margin: 0 0 12px 0;
      color: #1e40af;
      font-size: 16px;
    }
    .highlight-box p {
      margin: 0;
      font-size: 15px;
    }
    .important {
      background: #fef2f2;
      border-left: 4px solid #dc2626;
      padding: 16px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .important strong {
      color: #991b1b;
    }
    .action-items {
      background: #f0fdf4;
      padding: 20px;
      border-radius: 4px;
      margin: 25px 0;
    }
    .action-items h3 {
      color: #166534;
      margin: 0 0 12px 0;
      font-size: 16px;
    }
    .action-items ol {
      margin: 0;
      padding-left: 20px;
    }
    .action-items li {
      margin-bottom: 8px;
      color: #374151;
    }
    .signature {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
    .signature p {
      margin: 4px 0;
    }
    .signature .name {
      font-weight: 600;
      color: #1e40af;
      font-size: 16px;
    }
    .signature .title {
      color: #6b7280;
      font-style: italic;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 13px;
    }
    .footer a {
      color: #2563eb;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ODYSSEY-1 AI LLC</h1>
      <div class="tagline">A Sovereign Managed Asset</div>
    </div>

    <div class="greeting">
      Dear ${clientDisplay},
    </div>

    <div class="content">
      <p>
        I hope this message finds you well. I am writing to inform you of an important update 
        regarding your janitorial service billing and security structure.
      </p>

      <div class="highlight-box">
        <h3>📋 What's Changing</h3>
        <p>
          Effective <strong>March 1, 2026</strong>, all future invoices will be issued under our 
          formal corporate entity: <strong>Odyssey-1 AI LLC</strong>. This change reflects our 
          commitment to enhanced security, compliance, and professional service delivery.
        </p>
      </div>

      <p>
        <strong>What This Means for You:</strong>
      </p>

      <p>
        While your cleaning service remains exactly the same, with the same trusted team and 
        quality standards you've come to expect, invoices will now reflect our registered corporate 
        name. This transition provides:
      </p>

      <ul style="margin: 16px 0; padding-left: 24px;">
        <li>Enhanced asset protection and legal security</li>
        <li>Improved payment processing infrastructure</li>
        <li>Better compliance with government contracting requirements</li>
        <li>Streamlined billing and customer service</li>
      </ul>

      <div class="highlight-box">
        <h3>📬 Updated Mailing Address</h3>
        <p>
          Please update your records with our new mailing address:<br>
          <strong>P.O. Box 80054, Athens, GA 30608</strong>
        </p>
      </div>

      <div class="important">
        <strong>⚠️ Important:</strong> To ensure uninterrupted service, please remit your 
        <strong>February 2026 invoice payment by March 1st</strong>. This will help us transition 
        smoothly to the new billing system.
      </div>

      <div class="action-items">
        <h3>✓ Action Items</h3>
        <ol>
          <li>Update your vendor records to reflect: <strong>Odyssey-1 AI LLC</strong></li>
          <li>Note our new mailing address: <strong>P.O. Box 80054, Athens, GA 30608</strong></li>
          <li>Ensure February invoice payment is submitted by March 1st</li>
          <li>Contact us with any questions or concerns</li>
        </ol>
      </div>

      <p>
        <strong>Your service remains our priority.</strong> The same dedicated team will continue 
        providing the high-quality cleaning service you've trusted. This administrative change 
        enhances our ability to serve you better while maintaining the personal attention you 
        deserve.
      </p>

      <p>
        If you have any questions about this transition or need assistance updating your records, 
        please don't hesitate to contact us at <a href="tel:800-403-8492">800-403-8492</a> or 
        <a href="mailto:generalmanager81@gmail.com">generalmanager81@gmail.com</a>.
      </p>

      <p>
        Thank you for your continued partnership and trust in our services.
      </p>

      <div class="signature">
        <p class="name">Rickey Howard</p>
        <p class="title">Managing Director</p>
        <p><strong>Odyssey-1 AI LLC</strong></p>
        <p style="color: #2563eb; font-size: 12px; font-weight: 600; letter-spacing: 1px;">
          A SOVEREIGN MANAGED ASSET
        </p>
        <p style="margin-top: 12px; color: #6b7280; font-size: 14px;">
          Phone: 800-403-8492<br>
          Email: generalmanager81@gmail.com<br>
          Web: <a href="https://odyssey-1-app.vercel.app">odyssey-1-app.vercel.app</a>
        </p>
      </div>
    </div>

    <div class="footer">
      <p>
        <strong>Odyssey-1 AI LLC</strong> | A Sovereign Managed Asset<br>
        P.O. Box 80054 • Athens, GA 30608 • 800-403-8492
      </p>
      <p style="margin-top: 12px;">
        <a href="https://odyssey-1-app.vercel.app/privacy">Privacy Policy</a> • 
        <a href="https://odyssey-1-app.vercel.app/terms">Terms of Service</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function generateWelcomeLetterPlainText(customerName, companyName) {
  const clientDisplay = companyName || customerName || 'Valued Client';
  
  return `
ODYSSEY-1 AI LLC
A SOVEREIGN MANAGED ASSET

================================================================================

Dear ${clientDisplay},

I hope this message finds you well. I am writing to inform you of an important 
update regarding your janitorial service billing and security structure.

WHAT'S CHANGING

Effective March 1, 2026, all future invoices will be issued under our formal 
corporate entity: Odyssey-1 AI LLC. This change reflects our commitment to 
enhanced security, compliance, and professional service delivery.

WHAT THIS MEANS FOR YOU

While your cleaning service remains exactly the same, with the same trusted 
team and quality standards you've come to expect, invoices will now reflect 
our registered corporate name. This transition provides:

• Enhanced asset protection and legal security
• Improved payment processing infrastructure  
• Better compliance with government contracting requirements
• Streamlined billing and customer service

UPDATED MAILING ADDRESS

Please update your records with our new mailing address:
P.O. Box 80054, Athens, GA 30608

⚠️ IMPORTANT: To ensure uninterrupted service, please remit your February 2026 
invoice payment by March 1st. This will help us transition smoothly to the new 
billing system.

ACTION ITEMS

1. Update your vendor records to reflect: Odyssey-1 AI LLC
2. Note our new mailing address: P.O. Box 80054, Athens, GA 30608  
3. Ensure February invoice payment is submitted by March 1st
4. Contact us with any questions or concerns

Your service remains our priority. The same dedicated team will continue 
providing the high-quality cleaning service you've trusted. This administrative 
change enhances our ability to serve you better while maintaining the personal 
attention you deserve.

If you have any questions about this transition or need assistance updating 
your records, please don't hesitate to contact us at 800-403-8492 or 
generalmanager81@gmail.com.

Thank you for your continued partnership and trust in our services.

Sincerely,

Rickey Howard
Managing Director
Odyssey-1 AI LLC
A SOVEREIGN MANAGED ASSET

Phone: 800-403-8492
Email: generalmanager81@gmail.com
Web: odyssey-1-app.vercel.app

================================================================================

Odyssey-1 AI LLC | A Sovereign Managed Asset
P.O. Box 80054 • Athens, GA 30608 • 800-403-8492
Privacy Policy: odyssey-1-app.vercel.app/privacy
Terms of Service: odyssey-1-app.vercel.app/terms
  `.trim();
}
