#!/usr/bin/env node
/**
 * TEST: Send ONE Welcome Letter to Rickey's email
 * Proves the entire system works before domain verification
 */

import { createClient } from '@supabase/supabase-js';
import { generateWelcomeLetter, generateWelcomeLetterPlainText } from './welcome-letter-template.mjs';

const SUPABASE_URL = 'https://tvsxloejfsrdganemsmg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2c3hsb2VqZnNyZGdhbmVtc21nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjcxODg0OCwiZXhwIjoyMDcyMjk0ODQ4fQ.Wr3ffDizDf3DXG2uFD7-z4XrmtQUJjX-m9hiLoMvd1M';

console.log('📧 TEST WELCOME LETTER TO RICKEY');
console.log('=' .repeat(80));

const testCustomer = {
  company_name: 'Odyssey-1 AI LLC',
  first_name: 'Rickey',
  last_name: 'Howard',
  email: 'generalmanager81@gmail.com'
};

const subject = `Important: Security & Billing Update for ${testCustomer.company_name}`;
const htmlContent = generateWelcomeLetter('Rickey Howard', testCustomer.company_name);
const textContent = generateWelcomeLetterPlainText('Rickey Howard', testCustomer.company_name);

console.log(`\nSending test email to: ${testCustomer.email}\n`);

try {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to: testCustomer.email,
      subject: subject,
      htmlContent: htmlContent,
      textContent: textContent
    })
  });

  const result = await response.json();

  console.log('Response status:', response.status);
  console.log('Response body:', JSON.stringify(result, null, 2));

  if (response.ok && result.success) {
    console.log('\n✅ SUCCESS!');
    console.log(`   Email sent to: ${testCustomer.email}`);
    console.log(`   Email ID: ${result.emailId}`);
    console.log('\n🎉 SYSTEM VERIFIED!');
    console.log('   Next step: Verify domain at resend.com/domains');
    console.log('   Then send to all 14 customers\n');
  } else {
    console.log('\n❌ FAILED');
    console.log(`   Error: ${result.error || result.message}`);
  }
} catch (error) {
  console.error('\n❌ ERROR:', error.message);
}
