#!/usr/bin/env node
/**
 * Deploy Bid Conversion Enhancements via Management API
 * Uses Supabase Management API to execute SQL
 */

import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config();

const projectRef = process.env.VITE_SUPABASE_URL?.match(/https:\/\/(.+?)\.supabase\.co/)?.[1];
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

if (!projectRef) {
  console.error('❌ Cannot extract project reference from VITE_SUPABASE_URL');
  process.exit(1);
}

console.log('\n🚀 Deploying Bid-to-Invoice Enhancements...');
console.log(`📍 Project: ${projectRef}\n`);

// Read migration file
const migrationSQL = readFileSync(
  'c:\\Users\\gener\\Odyssey-1-App\\supabase\\migrations\\20251218_bid_conversion_enhancements.sql',
  'utf8'
);

console.log('📄 Migration SQL loaded:', migrationSQL.split('\n').length, 'lines\n');

if (!accessToken) {
  console.log('⚠️  SUPABASE_ACCESS_TOKEN not found in environment');
  console.log('\n📋 Manual Deployment Instructions:');
  console.log('============================================================');
  console.log('1. Go to: https://supabase.com/dashboard/project/' + projectRef + '/sql/new');
  console.log('2. Copy and paste the following file contents:');
  console.log('   c:\\Users\\gener\\Odyssey-1-App\\supabase\\migrations\\20251218_bid_conversion_enhancements.sql');
  console.log('3. Click "Run" to execute the migration');
  console.log('4. Run: node verify-bid-enhancements.mjs');
  console.log('============================================================\n');
  
  console.log('💡 Alternatively, get an access token:');
  console.log('   1. Go to: https://supabase.com/dashboard/account/tokens');
  console.log('   2. Create a new access token');
  console.log('   3. Add to .env: SUPABASE_ACCESS_TOKEN=your_token');
  console.log('   4. Rerun this script\n');
  
  process.exit(0);
}

// Try Management API
console.log('🔑 Access token found, attempting automated deployment...\n');

const response = await fetch(
  `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: migrationSQL
    })
  }
);

const result = await response.json();

if (!response.ok) {
  console.error('❌ Deployment failed:', result);
  console.log('\nℹ️  Please use manual deployment instructions above.');
  process.exit(1);
}

console.log('✅ Migration deployed successfully!\n');
console.log('🔍 Running verification...\n');

// Import and run verification
import('./verify-bid-enhancements.mjs');
