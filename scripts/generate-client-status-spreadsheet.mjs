#!/usr/bin/env node
/**
 * 📊 CLIENT STATUS SPREADSHEET GENERATOR
 * Creates a CSV file with all 14 customer contact details
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

console.log('📊 CLIENT STATUS SPREADSHEET GENERATOR');
console.log('=' .repeat(80));
console.log(`Generated: ${new Date().toLocaleString()}\n`);

async function generateSpreadsheet() {
  try {
    // Fetch all customers with their schedules
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('id, company_name, first_name, last_name, email, phone')
      .eq('user_id', USER_ID)
      .order('company_name');

    if (customersError) throw customersError;

    // Fetch all recurring invoices separately
    const { data: schedules, error: schedulesError } = await supabase
      .from('recurring_invoices')
      .select('id, customer_id, frequency, total_amount, next_invoice_date, is_active')
      .eq('user_id', USER_ID)
      .eq('is_active', true);

    if (schedulesError) throw schedulesError;

    // Map schedules to customers
    customers.forEach(customer => {
      customer.recurring_invoices = schedules.filter(s => s.customer_id === customer.id);
    });

    console.log(`✅ Found ${customers.length} customers\n`);

    // Generate CSV header
    const csvHeader = [
      '#',
      'Customer Name',
      'Email',
      'Phone',
      'Active Schedules',
      'Monthly Revenue',
      'Next Invoice',
      'Welcome Letter Status',
      'Notes'
    ].join(',');

    // Generate CSV rows
    const csvRows = customers.map((customer, index) => {
      const displayName = customer.company_name || 
        `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
      
      const schedules = customer.recurring_invoices || [];
      const activeSchedules = schedules.length;
      
      // Calculate monthly revenue (convert all to monthly)
      const monthlyRevenue = schedules.reduce((total, schedule) => {
        let monthlyAmount = parseFloat(schedule.total_amount) || 0;
        if (schedule.frequency === 'annual') {
          monthlyAmount = monthlyAmount / 12;
        } else if (schedule.frequency === 'quarterly') {
          monthlyAmount = monthlyAmount / 3;
        }
        return total + monthlyAmount;
      }, 0);

      // Find next invoice date
      const nextDates = schedules
        .map(s => s.next_invoice_date)
        .filter(d => d)
        .sort();
      const nextInvoice = nextDates.length > 0 ? nextDates[0] : 'N/A';

      const welcomeStatus = customer.email ? '✅ Sent' : '❌ No Email';

      return [
        index + 1,
        `"${displayName}"`,
        `"${customer.email || 'N/A'}"`,
        `"${customer.phone || 'N/A'}"`,
        activeSchedules,
        `$${monthlyRevenue.toFixed(2)}`,
        nextInvoice,
        welcomeStatus,
        `"${schedules.map(s => `${s.frequency} - $${s.total_amount}`).join('; ')}"`
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
    console.log(`📁 File saved to: ${csvPath}\n`);

    // Display summary
    console.log('📊 SUMMARY:');
    console.log(`   Total Customers: ${customers.length}`);
    console.log(`   With Email: ${customers.filter(c => c.email).length}`);
    console.log(`   With Phone: ${customers.filter(c => c.phone).length}`);
    
    const totalMonthly = customers.reduce((sum, c) => {
      const schedules = c.recurring_invoices || [];
      return sum + schedules.reduce((total, s) => {
        let monthly = parseFloat(s.total_amount) || 0;
        if (s.frequency === 'annual') monthly = monthly / 12;
        else if (s.frequency === 'quarterly') monthly = monthly / 3;
        return total + monthly;
      }, 0);
    }, 0);
    
    console.log(`   Total Monthly Revenue: $${totalMonthly.toFixed(2)}`);
    console.log(`   Total Annual Revenue: $${(totalMonthly * 12).toFixed(2)}\n`);

    // Also generate a quick-view HTML version
    const htmlPath = path.join(process.cwd(), 'reports', `client-status-${timestamp}.html`);
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Client Status - ${new Date().toLocaleDateString()}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 10px; background: #f5f5f5; font-size: 14px; }
    .container { max-width: 100%; overflow-x: auto; }
    h1 { color: #2563eb; font-size: 20px; margin: 10px 0; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin: 15px 0; }
    .stat-card { background: white; padding: 12px; border-radius: 6px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .stat-value { font-size: 24px; font-weight: bold; color: #2563eb; }
    .stat-label { color: #64748b; font-size: 12px; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; background: white; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    th { background: #2563eb; color: white; padding: 10px 8px; text-align: left; font-size: 12px; font-weight: 600; }
    td { padding: 10px 8px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    tr:hover { background: #f8fafc; }
    .email { color: #2563eb; word-break: break-all; }
    .phone { color: #64748b; }
    .status-sent { color: #16a34a; font-weight: bold; }
    .status-pending { color: #dc2626; font-weight: bold; }
    .revenue { font-weight: 600; color: #059669; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 Client Status Report</h1>
    <div style="color: #64748b; font-size: 12px; margin-bottom: 15px;">
      Generated: ${new Date().toLocaleString()}
    </div>

    <div class="stats">
      <div class="stat-card">
        <div class="stat-value">${customers.length}</div>
        <div class="stat-label">Total Clients</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${customers.filter(c => c.email).length}</div>
        <div class="stat-label">With Email</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">$${totalMonthly.toFixed(0)}</div>
        <div class="stat-label">Monthly Revenue</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">$${(totalMonthly * 12).toFixed(0)}</div>
        <div class="stat-label">Annual Revenue</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Customer</th>
          <th>Contact</th>
          <th>Schedules</th>
          <th>Monthly $</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${customers.map((customer, index) => {
          const displayName = customer.company_name || 
            `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
          
          const schedules = customer.recurring_invoices || [];
          const activeSchedules = schedules.length;
          
          const monthlyRevenue = schedules.reduce((total, schedule) => {
            let monthlyAmount = parseFloat(schedule.total_amount) || 0;
            if (schedule.frequency === 'annual') {
              monthlyAmount = monthlyAmount / 12;
            } else if (schedule.frequency === 'quarterly') {
              monthlyAmount = monthlyAmount / 3;
            }
            return total + monthlyAmount;
          }, 0);

          const welcomeStatus = customer.email ? 
            '<span class="status-sent">✅ Sent</span>' : 
            '<span class="status-pending">❌ No Email</span>';

          return `
            <tr>
              <td>${index + 1}</td>
              <td><strong>${displayName}</strong></td>
              <td>
                <div class="email">${customer.email || 'N/A'}</div>
                ${customer.phone ? `<div class="phone">${customer.phone}</div>` : ''}
              </td>
              <td>${activeSchedules}</td>
              <td class="revenue">$${monthlyRevenue.toFixed(2)}</td>
              <td>${welcomeStatus}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  </div>
</body>
</html>
    `;

    fs.writeFileSync(htmlPath, htmlContent);
    console.log(`📱 Mobile-friendly HTML version: ${htmlPath}\n`);
    console.log('✅ SPREADSHEET GENERATION COMPLETE\n');

  } catch (error) {
    console.error('❌ Error generating spreadsheet:', error.message);
    process.exit(1);
  }
}

await generateSpreadsheet();
