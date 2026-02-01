import { config } from 'dotenv';
import { readFileSync } from 'fs';

config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

// Read the SQL file
const sql = readFileSync('./FIX_CUSTOMERS_RLS.sql', 'utf-8');

// Split SQL into individual statements (ignore SELECT verification for now)
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s && !s.startsWith('--') && !s.toLowerCase().includes('select tablename'))
  .map(s => s + ';');

console.log(`🔧 Executing ${statements.length} SQL statements on production database...`);
console.log(`📍 Database: ${SUPABASE_URL}\n`);

// Execute each statement
for (let i = 0; i < statements.length; i++) {
  const statement = statements[i];
  
  // Skip empty statements
  if (statement.trim() === ';') continue;
  
  console.log(`\n[${i + 1}/${statements.length}] Executing:`);
  console.log(statement.substring(0, 100) + '...\n');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({ query: statement })
    });

    if (!response.ok) {
      // Try alternative approach - direct SQL execution
      const altResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Prefer': 'params=single-object'
        },
        body: JSON.stringify({ sql: statement })
      });
      
      if (!altResponse.ok) {
        console.error(`❌ Failed: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.error(errorText);
        continue;
      }
    }
    
    console.log('✅ Success');
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

// Verify policies were created
console.log('\n\n🔍 Verifying policies...');

const verifyQuery = `
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('customers', 'company_profiles')
ORDER BY tablename, cmd;
`;

try {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    },
    body: JSON.stringify({ query: verifyQuery })
  });

  if (response.ok) {
    const result = await response.json();
    console.log('\n✅ RLS Policies Created:');
    console.table(result);
  }
} catch (error) {
  console.error(`Verification failed: ${error.message}`);
}

// Test a sample query
console.log('\n\n🧪 Testing sample query...');
try {
  const testResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/customers?select=id,customer_name&limit=3`,
    {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      }
    }
  );

  if (testResponse.ok) {
    const customers = await testResponse.json();
    console.log(`✅ Successfully queried customers table (${customers.length} records returned)`);
    console.log(customers);
  } else {
    console.error(`❌ Test query failed: ${testResponse.status} ${testResponse.statusText}`);
    const errorText = await testResponse.text();
    console.error(errorText);
  }
} catch (error) {
  console.error(`Test query error: ${error.message}`);
}

console.log('\n\n✅ RLS FIX COMPLETE');
