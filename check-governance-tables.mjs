/**
 * Direct Supabase query to check what governance tables actually exist
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

console.log('🔍 Checking Supabase for governance tables...\n');

// Direct SQL query to check what tables exist
const { data: tables, error: tableError } = await supabase.rpc('exec_sql', {
  query: `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('governance_audit', 'api_key_audit', 'app_admins')
    ORDER BY table_name;
  `
});

if (tableError) {
  console.log('📊 Using alternative method to check tables...\n');
  
  // Try each table individually
  const checks = [
    { name: 'app_admins', check: async () => await supabase.from('app_admins').select('user_id', { count: 'exact', head: true }) },
    { name: 'governance_audit', check: async () => await supabase.from('governance_audit').select('id', { count: 'exact', head: true }) },
    { name: 'api_key_audit', check: async () => await supabase.from('api_key_audit').select('id', { count: 'exact', head: true }) }
  ];
  
  for (const { name, check } of checks) {
    const { count, error } = await check();
    if (error) {
      console.log(`❌ ${name}: ${error.message}`);
    } else {
      console.log(`✅ ${name}: EXISTS (${count ?? 0} rows)`);
    }
  }
  
  // Check views
  console.log('\n🔍 Checking views...\n');
  const views = [
    'view_rls_security_audit',
    'view_api_key_status',
    'view_pipeline_performance',
    'view_table_bloat_monitor'
  ];
  
  for (const view of views) {
    const { data, error } = await supabase.from(view).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`❌ ${view}: ${error.message}`);
    } else {
      console.log(`✅ ${view}: EXISTS`);
    }
  }
} else {
  console.log('✅ Tables found:', tables);
}

console.log('\n✅ Check complete');
