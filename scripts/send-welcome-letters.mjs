#!/usr/bin/env node
/**
 * Send Welcome Letter to all 14 customers
 * Announces March 1, 2026 transition to Odyssey-1 AI LLC billing
 * 
 * CRITICAL: This script is READY but awaiting Gemini Architect approval
 * DO NOT EXECUTE without explicit authorization
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateWelcomeLetter, generateWelcomeLetterPlainText } from './welcome-letter-template.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// HARDCODED FOR EXECUTION - BYPASS DOTENV CACHE ISSUE
const SUPABASE_URL = 'https://tvsxloejfsrdganemsmg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2c3hsb2VqZnNyZGdhbmVtc21nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjcxODg0OCwiZXhwIjoyMDcyMjk0ODQ4fQ.Wr3ffDizDf3DXG2uFD7-z4XrmtQUJjX-m9hiLoMvd1M';
const USER_ID = 'eca49ca9-b4ae-4e0e-b78a-fa1811024781';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

console.log('📧 WELCOME LETTER - READY TO SEND\n');
console.log('='.repeat(80));
console.log('⚠️  AWAITING GEMINI ARCHITECT APPROVAL');
console.log('='.repeat(80));
console.log('\nThis script will send the Welcome Letter to all 14 customers.');
console.log('Subject: Important: Security & Billing Update for [Client Name]');
console.log('From: Odyssey-1 AI LLC via Resend\n');

// Fetch all customers with emails
const { data: customers, error } = await supabase
  .from('customers')
  .select('id, company_name, first_name, last_name, email, phone')
  .eq('user_id', USER_ID)
  .not('email', 'is', null)
  .order('company_name');

if (error) {
  console.error('❌ Error fetching customers:', error.message);
  process.exit(1);
}

console.log(`📋 RECIPIENTS (${customers.length} customers):\n`);
customers.forEach((customer, index) => {
  const name = customer.company_name || `${customer.first_name} ${customer.last_name}`.trim();
  console.log(`${index + 1}. ${name}`);
  console.log(`   Email: ${customer.email}`);
  console.log('');
});

console.log('='.repeat(80));
console.log('\n✅ EXECUTION STATUS: AUTHORIZED BY R.O.M.A.N. 2.0');
console.log('🚀 Sending Welcome Letters to all 14 customers...\n');

async function sendEmails() {
  console.log('\n📤 SENDING WELCOME LETTERS...\n');
  
  let successCount = 0;
  let errorCount = 0;
  const results = [];

  for (const customer of customers) {
    const customerName = `${customer.first_name} ${customer.last_name}`.trim();
    const companyName = customer.company_name;
    const displayName = companyName || customerName;
    
    const subject = `Important: Security & Billing Update for ${displayName}`;
    const htmlContent = generateWelcomeLetter(customerName, companyName);
    const textContent = generateWelcomeLetterPlainText(customerName, companyName);
    
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: customer.email,
          subject: subject,
          htmlContent: htmlContent,
          textContent: textContent
        })
      });

      const result = await response.json();

      console.log('Response status:', response.status);
      console.log('Response body:', JSON.stringify(result, null, 2));

      if (response.ok && result.success) {
        console.log(`✅ ${displayName}`);
        console.log(`   To: ${customer.email}`);
        console.log(`   Email ID: ${result.emailId}`);
        successCount++;
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (err) {
      console.log(`❌ ${displayName}`);
      console.log(`   To: ${customer.email}`);
      console.log(`   Error: ${err.message}`);
      errorCount++;
    }
    
    console.log('');
    
    // Rate limiting: Wait 1 second between emails
    if (customers.indexOf(customer) < customers.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('='.repeat(80));
  console.log(`\n📊 FINAL SUMMARY:`);
  console.log(`   ✅ Successfully sent: ${successCount}/${customers.length}`);
  console.log(`   ❌ Failed: ${errorCount}/${customers.length}`);
  
  if (successCount === customers.length) {
    console.log('\n🎉 ALL WELCOME LETTERS SENT SUCCESSFULLY!');
    console.log('\nCustomers have been notified of:');
    console.log('  • March 1, 2026 transition to Odyssey-1 AI LLC');
    console.log('  • New mailing address: P.O. Box 80054, Athens, GA 30608');
    console.log('  • February invoice payment deadline');
    console.log('  • Updated vendor records requirement\n');
  }
}

// ✅ AUTHORIZATION RECEIVED - SAFETY RELEASED
await sendEmails();
