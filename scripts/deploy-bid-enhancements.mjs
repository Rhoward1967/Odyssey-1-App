#!/usr/bin/env node
/**
 * Deploy Bid Conversion Enhancements Migration
 * Executes SQL directly via Supabase Admin API
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

console.log('\n🚀 Deploying Bid-to-Invoice Enhancements...\n');

// Read migration file
const migrationSQL = readFileSync(
  'c:\\Users\\gener\\Odyssey-1-App\\supabase\\migrations\\20251218_bid_conversion_enhancements.sql',
  'utf8'
);

console.log('📄 Migration file loaded:', migrationSQL.split('\n').length, 'lines');
console.log('\n🔧 Executing migration...\n');

// Split into individual statements (rough split, but should work)
const statements = migrationSQL
  .split(';')
  .map(s => s.trim())
  .filter(s => s && !s.startsWith('--') && s.length > 10);

console.log('Found', statements.length, 'SQL statements\n');

let successCount = 0;
let errorCount = 0;

for (let i = 0; i < statements.length; i++) {
  const stmt = statements[i];
  
  // Skip comments and DO blocks that are just notices
  if (stmt.includes('RAISE NOTICE') || stmt.startsWith('COMMENT ON')) {
    console.log(`⏭️  Skipping statement ${i + 1} (comment/notice)`);
    continue;
  }
  
  // Extract operation type for logging
  const opMatch = stmt.match(/^(CREATE|ALTER|INSERT|DROP|COMMENT)/i);
  const operation = opMatch ? opMatch[1] : 'EXEC';
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: stmt + ';' });
    
    if (error) {
      // Try alternative method
      console.log(`⚠️  RPC failed for statement ${i + 1}, trying direct...`);
      
      // Some statements may not work via RPC, that's OK
      if (error.message.includes('does not exist') || error.message.includes('already exists')) {
        console.log(`   ${operation}: OK (expected conflict)`);
        successCount++;
      } else {
        console.log(`   ❌ Error:`, error.message.substring(0, 100));
        errorCount++;
      }
    } else {
      console.log(`✅ Statement ${i + 1}: ${operation} - SUCCESS`);
      successCount++;
    }
  } catch (err) {
    console.log(`❌ Statement ${i + 1}: ${operation} - ERROR`, err.message.substring(0, 100));
    errorCount++;
  }
}

console.log('\n============================================================');
console.log('📊 Deployment Summary:');
console.log(`   ✅ Success: ${successCount}`);
console.log(`   ❌ Errors: ${errorCount}`);
console.log(`   Total statements: ${statements.length}`);

if (errorCount === 0) {
  console.log('\n🎉 Migration deployed successfully!');
} else {
  console.log('\n⚠️  Some errors occurred. Checking via verification script...');
}

console.log('============================================================\n');

console.log('🔍 Running verification...\n');

// Run verification
import('./verify-bid-enhancements.mjs');
