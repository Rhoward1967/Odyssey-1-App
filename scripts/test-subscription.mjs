// Test subscription checkout endpoint
import fetch from 'node-fetch';

const SUPABASE_URL = 'https://tvsxloejfsrdganemsmg.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2c3hsb2VqZnNyZGdhbmVtc21nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MTg4NDgsImV4cCI6MjA3MjI5NDg0OH0.Lc7jMTuBACILyxksi4Ti4uMNMljNhS3P5OYHPhzm7tY';

console.log('🧪 Testing subscription checkout endpoint...\n');

async function testCheckout(tier, price) {
  console.log(`Testing ${tier} - $${price}/month`);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`,
        'Origin': 'https://odyssey-1-ai.com'
      },
      body: JSON.stringify({ tier, price })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ SUCCESS - Session URL: ${data.url?.substring(0, 50)}...`);
    } else {
      console.log(`❌ FAILED - ${JSON.stringify(data)}`);
    }
  } catch (error) {
    console.log(`❌ ERROR - ${error.message}`);
  }
  
  console.log('');
}

// Test all 3 tiers
await testCheckout('Basic', '99');
await testCheckout('Professional', '299');
await testCheckout('Enterprise', '999');

console.log('✅ Testing complete!');
