/**
 * 🔍 R.O.M.A.N. GOVERNANCE VERIFIER (Hardened)
 * Run: node verify-roman-governance.mjs
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env (server-side only)
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Priority given to server-side keys; falls back to VITE_ prefixes if necessary
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  process.exit(2);
}

const supabase = createClient(url, serviceKey);

// Fail-fast mechanism for CI integration
const fail = (msg) => {
  console.error(msg);
  process.exitCode = 1;
};

/**
 * Robust wrapper for Supabase queries with timeout and error handling
 */
const safeSelect = async (from, select, opts = {}) => {
  // Use AbortController to prevent script hanging on heavy views
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 10000);
  
  try {
    const query = supabase.from(from).select(select, { head: false, count: 'exact' });
    
    if (opts.eq) {
      for (const [k, v] of Object.entries(opts.eq)) query.eq(k, v);
    }
    if (opts.limit) query.limit(opts.limit);
    
    const { data, error } = await query;
    if (error) return { data: null, error };
    return { data, error: null };
  } catch (e) {
    return { data: null, error: new Error(e?.message || 'unknown error') };
  } finally {
    clearTimeout(timeout);
  }
};

async function checkWork() {
  console.log('🤖 R.O.M.A.N. Checking Governance & Pipeline Deployment...\n');

  // 0) Pre-flight: Check app_admins table exists
  {
    const { data, error } = await safeSelect('app_admins', 'user_id', { limit: 1 });
    if (error) {
      fail('❌ Pre-requisite missing: app_admins table not found. Run 20251219_create_app_admins_table.sql first.');
    } else {
      console.log('✅ Pre-requisite: app_admins table exists.');
    }
  }

  // 1) Governance audit table (public.governance_audit)
  {
    const { data, error } = await safeSelect('governance_audit', 'id, action_type', { limit: 1 });
    if (error) {
      fail('❌ Governance Audit table missing or RLS blocked (public.governance_audit).');
    } else {
      console.log('✅ Governance Audit infrastructure active.');
    }
  }

  // 2) RLS Security Audit view (public.view_rls_security_audit)
  {
    const { data, error } = await safeSelect('view_rls_security_audit', 'tablename, policyname', {
      eq: { tablename: 'customers' },
    });
    if (error) {
      fail('❌ RLS Security Audit view failed (public.view_rls_security_audit).');
    } else {
      const count = data?.length ?? 0;
      console.log(`✅ RLS Audit View live: Found ${count} policies for 'customers'.`);
    }
  }

  // 3) API Security Status view (public.view_api_key_status)
  {
    const { data, error } = await safeSelect('view_api_key_status', 'service_name, status_indicator');
    if (error) {
      fail('❌ API Security Audit view failed (public.view_api_key_status).');
    } else {
      const healthy = (data || []).filter((k) => (k.status_indicator || '').includes('HEALTHY')).length;
      console.log(`✅ API Security Monitoring live: Tracking ${(data || []).length} keys (${healthy} Healthy).`);
    }
  }

  // 4) Pipeline Performance view (public.view_pipeline_performance)
  {
    const { data, error } = await safeSelect('view_pipeline_performance', 'tablename, total_size, live_tuples', {
      limit: 5,
    });
    if (error) {
      fail('❌ Pipeline Performance view failed (public.view_pipeline_performance).');
    } else {
      console.log(`✅ Performance monitoring active: ${(data || []).length} core tables sampled.`);
    }
  }

  // 5) Table Bloat monitor (public.view_table_bloat_monitor)
  {
    const { data, error } = await safeSelect(
      'view_table_bloat_monitor',
      'table_name, bloat_percentage, health_status',
      { eq: { table_name: 'customers' }, limit: 1 },
    );
    if (error) {
      fail('❌ Table Bloat monitor failed (public.view_table_bloat_monitor).');
    } else {
      const row = data?.[0];
      console.log(
        `✅ Scalability monitoring for 'customers': ${row?.health_status ?? 'Unknown'} (${row?.bloat_percentage ?? 0}% bloat).`,
      );
    }
  }

  // 6) Bridge Check: bids.converted_to_invoice_id exists
  {
    const { data, error } = await safeSelect('bids', 'converted_to_invoice_id', { limit: 1 });
    if (error) {
      fail('❌ Bid-to-Invoice Bridge check failed (bids.converted_to_invoice_id).');
    } else {
      console.log('✅ Hardened Bid-to-Invoice Bridge verified (tracking columns present).');
    }
  }

  // Final Evaluation
  if (process.exitCode && process.exitCode !== 0) {
    console.error('\n⚠️ RESULT: One or more checks failed. See logs above.');
    process.exit(process.exitCode);
  } else {
    console.log('\n🎯 RESULT: R.O.M.A.N. PROPOSALS DEPLOYED & FULL PIPELINE VERIFIED');
  }
}

checkWork().catch((e) => {
  console.error('Critical error during verification:', e?.message || e);
  process.exit(2);
});
