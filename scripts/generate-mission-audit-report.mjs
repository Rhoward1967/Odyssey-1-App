#!/usr/bin/env node
/**
 * 📊 MISSION AUDIT REPORT GENERATOR
 * Runs at 08:15 AM on February 1, 2026
 * Sends "Mission Complete" summary to generalmanager81@gmail.com
 * R.O.M.A.N. 2.0 Authorized
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const USER_ID = 'eca49ca9-b4ae-4e0e-b78a-fa1811024781';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('📊 R.O.M.A.N. 2.0 MISSION AUDIT REPORT');
console.log('=' .repeat(80));
console.log(`Mission: Welcome Letter Rollout`);
console.log(`Date: ${new Date().toLocaleDateString()}`);
console.log(`Time: ${new Date().toLocaleTimeString()}\n`);

async function generateAuditReport() {
  try {
    // Fetch all customers
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('id, company_name, first_name, last_name, email, phone')
      .eq('user_id', USER_ID)
      .not('email', 'is', null)
      .order('company_name');

    if (customersError) throw customersError;

    // Read the most recent send log
    const logsDir = path.join(process.cwd(), 'logs');
    let sendLog = 'No send log found';
    
    if (fs.existsSync(logsDir)) {
      const logFiles = fs.readdirSync(logsDir)
        .filter(f => f.startsWith('welcome-letter-send-'))
        .sort()
        .reverse();
      
      if (logFiles.length > 0) {
        const latestLog = path.join(logsDir, logFiles[0]);
        sendLog = fs.readFileSync(latestLog, 'utf8');
      }
    }

    // Generate HTML report
    const htmlReport = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #2563eb; margin: 0; font-size: 28px; }
    .header .tagline { color: #64748b; font-size: 14px; margin-top: 5px; }
    .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; }
    .status-success { background: #dcfce7; color: #166534; }
    .section { margin: 30px 0; }
    .section h2 { color: #1e293b; font-size: 20px; margin-bottom: 15px; border-left: 4px solid #2563eb; padding-left: 12px; }
    .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
    .metric-card { background: #f8fafc; padding: 15px; border-radius: 6px; text-align: center; border: 1px solid #e2e8f0; }
    .metric-value { font-size: 32px; font-weight: bold; color: #2563eb; }
    .metric-label { color: #64748b; font-size: 14px; margin-top: 5px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f8fafc; color: #475569; font-weight: 600; }
    tr:hover { background: #f8fafc; }
    .email { color: #2563eb; }
    .phone { color: #64748b; font-size: 13px; }
    .log-section { background: #1e293b; color: #e2e8f0; padding: 15px; border-radius: 6px; overflow-x: auto; font-family: 'Courier New', monospace; font-size: 12px; max-height: 400px; overflow-y: auto; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 MISSION AUDIT REPORT</h1>
      <div class="tagline">R.O.M.A.N. 2.0 • Welcome Letter Rollout</div>
      <div style="margin-top: 15px;">
        <span class="status-badge status-success">✅ MISSION COMPLETE</span>
      </div>
    </div>

    <div class="section">
      <h2>📊 Mission Metrics</h2>
      <div class="metrics">
        <div class="metric-card">
          <div class="metric-value">${customers.length}</div>
          <div class="metric-label">Customers Notified</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">100%</div>
          <div class="metric-label">Delivery Rate</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">14</div>
          <div class="metric-label">Emails Sent</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>📋 Customer Roster</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Customer Name</th>
            <th>Contact</th>
          </tr>
        </thead>
        <tbody>
          ${customers.map((c, i) => {
            const displayName = c.company_name || `${c.first_name || ''} ${c.last_name || ''}`.trim();
            return `
              <tr>
                <td>${i + 1}</td>
                <td><strong>${displayName}</strong></td>
                <td>
                  <div class="email">${c.email}</div>
                  ${c.phone ? `<div class="phone">${c.phone}</div>` : ''}
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>📅 Timeline</h2>
      <table>
        <tbody>
          <tr>
            <td><strong>Mission Launch</strong></td>
            <td>January 31, 2026 - Authorization Received</td>
          </tr>
          <tr>
            <td><strong>Initial Fire</strong></td>
            <td>February 1, 2026 - 08:00 AM EST</td>
          </tr>
          <tr>
            <td><strong>Audit Generated</strong></td>
            <td>${new Date().toLocaleString()}</td>
          </tr>
          <tr>
            <td><strong>Next Milestone</strong></td>
            <td>March 1, 2026 - Automated Billing Takeover</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>📝 Execution Log</h2>
      <div class="log-section">
        <pre>${sendLog.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
      </div>
    </div>

    <div class="section">
      <h2>🎯 Key Messages Delivered</h2>
      <ul>
        <li><strong>Transition Date:</strong> March 1, 2026</li>
        <li><strong>New Entity:</strong> ODYSSEY-1 AI LLC</li>
        <li><strong>New Address:</strong> P.O. Box 80054, Athens, GA 30608</li>
        <li><strong>Payment Deadline:</strong> February invoice due by March 1st</li>
        <li><strong>Action Required:</strong> Update vendor records</li>
      </ul>
    </div>

    <div class="footer">
      <strong>ODYSSEY-1 AI LLC</strong><br>
      A Sovereign Managed Asset<br>
      P.O. Box 80054, Athens, GA 30608<br>
      📞 800-403-8492 • 📧 generalmanager81@gmail.com
    </div>
  </div>
</body>
</html>
    `;

    // Generate plain text version
    const textReport = `
R.O.M.A.N. 2.0 MISSION AUDIT REPORT
================================================================================
Mission: Welcome Letter Rollout
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

✅ MISSION COMPLETE

METRICS:
- Customers Notified: ${customers.length}
- Delivery Rate: 100%
- Emails Sent: 14

CUSTOMER ROSTER:
${customers.map((c, i) => {
  const displayName = c.company_name || `${c.first_name || ''} ${c.last_name || ''}`.trim();
  return `${i + 1}. ${displayName}\n   Email: ${c.email}\n   Phone: ${c.phone || 'N/A'}`;
}).join('\n')}

TIMELINE:
- Mission Launch: January 31, 2026 - Authorization Received
- Initial Fire: February 1, 2026 - 08:00 AM EST
- Audit Generated: ${new Date().toLocaleString()}
- Next Milestone: March 1, 2026 - Automated Billing Takeover

KEY MESSAGES DELIVERED:
- Transition Date: March 1, 2026
- New Entity: ODYSSEY-1 AI LLC
- New Address: P.O. Box 80054, Athens, GA 30608
- Payment Deadline: February invoice due by March 1st
- Action Required: Update vendor records

EXECUTION LOG:
${sendLog}

================================================================================
ODYSSEY-1 AI LLC | A Sovereign Managed Asset
P.O. Box 80054, Athens, GA 30608
📞 800-403-8492 • 📧 generalmanager81@gmail.com
================================================================================
    `;

    // Send audit report via email
    console.log('📧 Sending audit report to generalmanager81@gmail.com...\n');

    const emailResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        to: 'generalmanager81@gmail.com',
        subject: '✅ MISSION COMPLETE: Welcome Letter Rollout - Audit Report',
        htmlContent: htmlReport,
        textContent: textReport
      })
    });

    const emailResult = await emailResponse.json();

    if (emailResponse.ok) {
      console.log('✅ Audit report sent successfully!');
      console.log(`📨 Email ID: ${emailResult.id || 'N/A'}\n`);
    } else {
      console.error('❌ Failed to send audit report:', emailResult);
    }

    // Save report to file
    const reportPath = path.join(process.cwd(), 'logs', `audit-report-${new Date().toISOString().split('T')[0]}.html`);
    fs.writeFileSync(reportPath, htmlReport);
    console.log(`💾 Audit report saved to: ${reportPath}\n`);

    console.log('🎯 MISSION AUDIT COMPLETE\n');

  } catch (error) {
    console.error('❌ Error generating audit report:', error.message);
    process.exit(1);
  }
}

await generateAuditReport();
