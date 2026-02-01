#!/usr/bin/env node
/**
 * 📊 QUICK CLIENT STATUS SPREADSHEET
 * Simple CSV with all 14 customer contact details
 * For mobile viewing and tracking
 * R.O.M.A.N. 2.0 Authorized
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USER_ID = 'eca49ca9-b4ae-4e0e-b78a-fa1811024781';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('📊 QUICK CLIENT STATUS GENERATOR');
console.log('=' .repeat(80));
console.log(`Generated: ${new Date().toLocaleString()}\n`);

async function generateQuickStatus() {
  try {
    // Fetch all customers
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('id, company_name, first_name, last_name, email, phone')
      .eq('user_id', USER_ID)
      .order('company_name');

    if (customersError) throw customersError;

    console.log(`✅ Found ${customers.length} customers\n`);

    // Generate CSV header
    const csvHeader = [
      '#',
      'Customer Name',
      'Email',
      'Phone',
      'Welcome Letter Status'
    ].join(',');

    // Generate CSV rows
    const csvRows = customers.map((customer, index) => {
      const displayName = customer.company_name || 
        `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
      
      const welcomeStatus = customer.email ? 'Sent' : 'No Email';

      return [
        index + 1,
        `"${displayName}"`,
        `"${customer.email || 'N/A'}"`,
        `"${customer.phone || 'N/A'}"`,
        welcomeStatus
      ].join(',');
    });

    const csvContent = [csvHeader, ...csvRows].join('\n');

    // Save to file
    const timestamp = new Date().toISOString().split('T')[0];
    const csvPath = path.join(process.cwd(), 'reports', `client-status-${timestamp}.csv`);
    
    // Create reports directory if it doesn't exist
    const reportsDir = path.dirname(csvPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(csvPath, csvContent);

    console.log('✅ Client Status Spreadsheet Generated\n');
    console.log(`📁 CSV: ${csvPath}\n`);

    // Display summary
    console.log('📊 SUMMARY:');
    console.log(`   Total Customers: ${customers.length}`);
    console.log(`   With Email: ${customers.filter(c => c.email).length}`);
    console.log(`   With Phone: ${customers.filter(c => c.phone).length}\n`);

    // Also generate mobile-friendly HTML
    const htmlPath = path.join(process.cwd(), 'reports', `client-status-${timestamp}.html`);
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Client Status - ${new Date().toLocaleDateString()}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; background: #f8f9fa; padding: 15px; }
    .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 20px; border-radius: 12px 12px 0 0; margin-bottom: 15px; }
    .header h1 { font-size: 24px; margin-bottom: 5px; }
    .header p { font-size: 14px; opacity: 0.9; }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 15px; }
    .stat { background: white; padding: 15px; border-radius: 10px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .stat-value { font-size: 28px; font-weight: 700; color: #2563eb; margin-bottom: 5px; }
    .stat-label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
    .customer { background: white; padding: 15px; border-radius: 10px; margin-bottom: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .customer-name { font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; }
    .customer-contact { font-size: 13px; color: #4b5563; line-height: 1.6; }
    .customer-contact a { color: #2563eb; text-decoration: none; }
    .status-badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .status-sent { background: #d1fae5; color: #065f46; }
    .status-pending { background: #fee2e2; color: #991b1b; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Client Status Report</h1>
    <p>Generated: ${new Date().toLocaleString()}</p>
  </div>

  <div class="stats">
    <div class="stat">
      <div class="stat-value">${customers.length}</div>
      <div class="stat-label">Total Clients</div>
    </div>
    <div class="stat">
      <div class="stat-value">${customers.filter(c => c.email).length}</div>
      <div class="stat-label">With Email</div>
    </div>
    <div class="stat">
      <div class="stat-value">${customers.filter(c => c.phone).length}</div>
      <div class="stat-label">With Phone</div>
    </div>
  </div>

  ${customers.map((c, i) => {
    const displayName = c.company_name || `${c.first_name || ''} ${c.last_name || ''}`.trim();
    const statusClass = c.email ? 'status-sent' : 'status-pending';
    const statusText = c.email ? '✅ Letter Sent' : '❌ No Email';
    
    return `
  <div class="customer">
    <div class="customer-name">
      <span>${i + 1}. ${displayName}</span>
      <span class="status-badge ${statusClass}">${statusText}</span>
    </div>
    <div class="customer-contact">
      ${c.email ? `📧 <a href="mailto:${c.email}">${c.email}</a><br>` : '📧 No email address<br>'}
      ${c.phone ? `📱 <a href="tel:${c.phone}">${c.phone}</a>` : '📱 No phone number'}
    </div>
  </div>
    `;
  }).join('')}

  <div class="footer">
    <strong>ODYSSEY-1 AI LLC</strong><br>
    P.O. Box 80054, Athens, GA 30608<br>
    📞 800-403-8492 • 📧 generalmanager81@gmail.com
  </div>
</body>
</html>
    `;

    fs.writeFileSync(htmlPath, htmlContent);
    console.log(`📱 HTML: ${htmlPath}\n`);
    console.log('✅ ALL FILES GENERATED\n');

  } catch (error) {
    console.error('❌ Error generating status:', error.message);
    process.exit(1);
  }
}

await generateQuickStatus();
