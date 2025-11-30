// R.O.M.A.N. Patent Knowledge Sync
// This script loads the latest patent status dashboard into system_knowledge for R.O.M.A.N. to access and answer questions/alerts.

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL?.trim();
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function syncPatentDashboard() {
  const dashboardPath = path.join(__dirname, '../../IP_VAULT/PATENT_STATUS_DASHBOARD.md');
  const dashboardContent = fs.readFileSync(dashboardPath, 'utf-8');

  const { error } = await supabase
    .from('system_knowledge')
    .upsert({
      category: 'patents',
      knowledge_key: 'status_dashboard',
      value: dashboardContent,
      learned_from: 'dashboard_sync',
      updated_at: new Date().toISOString()
    }, { onConflict: 'category,knowledge_key' });

  if (error) {
    console.error('❌ Failed to sync patent dashboard:', error);
  } else {
    console.log('✅ Patent dashboard synced to system_knowledge.');
  }
}

syncPatentDashboard();
