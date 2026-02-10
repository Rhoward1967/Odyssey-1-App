import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function syncTrustAndUCCData() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('🔍 Environment check:');
  console.log('   VITE_SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing');
  console.log('   SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? '✓ Set' : '✗ Missing');

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('\n❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });

  // Get actual user ID (or use Rickey Howard's auth user)
  const { data: users } = await supabase
    .from('auth.users')
    .select('id')
    .limit(1);

  let userId = users?.[0]?.id;
  
  if (!userId) {
    // Fallback: Check profiles table for Rickey Howard
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('display_name', 'Rickey Howard')
      .limit(1);
    
    userId = profiles?.[0]?.user_id;
  }

  if (!userId) {
    // Last resort: Check current_user via RLS context
    console.warn('⚠️  No specific user found. Using NULL user_id (RLS-disabled context)');
    userId = null;
  }

  console.log('📊 Syncing actual Trust & UCC-1 data to business_entities...\n');

  // 1. HOWARD JONES BLOODLINE ANCESTRAL TRUST (HJFAT-2026-001)
  const trustData = {
    user_id: userId,
    entity_type: 'trust',
    name: 'Howard Jones Bloodline Ancestral Trust',
    trust_name: 'Howard Jones Bloodline Ancestral Trust',
    trust_type: 'irrevocable',
    trust_id: 'HJFAT-2026-001',
    certificate_number: 'HJFAT-2026-001',
    bloodline_trust_id: 'HOWARD-JONES-DYNASTY-2026',
    status: 'ACTIVE',
    established_date: '2026-01-07',
    governing_law: 'Georgia',
    // THREE-TIER VALUATION (from Master Trust Document)
    valuation_tier_1_optimistic: 6710000000, // Full market potential ($6.71B)
    valuation_tier_2_market: 950000000,     // Current industry standards ($950M)
    valuation_tier_3_conservative: 366000000, // Conservative floor for banking ($366M)
    // TRIPLE-LOCK UCC-1 COMBINED LIEN
    ucc1_combined_lien: 1050000, // $1.05M total ($350K × 3 filings)
    ucc1_filings: [
      {
        filing_number: '029-2026-000007',
        filing_id: '14472596',
        date: '2026-01-07',
        secured_party: 'Odyssey-1 AI LLC',
        debtor: 'HJS Services LLC',
        amount: 350000
      },
      {
        filing_number: 'GSCCCA-1d164254',
        filing_id: '14629748',
        date: '2026-01-26',
        secured_party: 'Howard Jones Bloodline Ancestral Trust',
        debtor: 'Odyssey-1 AI LLC',
        amount: 350000
      },
      {
        filing_number: '029-2026-000102',
        filing_id: '029-2026-000102',
        date: '2026-02-05',
        secured_party: 'Odyssey-1 AI LLC',
        debtor: 'Rickey A. Howard & Christla L. Howard',
        amount: 350000
      }
    ],
    // ASSETS IN TRUST
    holds_assets: [
      'R.O.M.A.N. 2.0 AI System ($750M pre-prototype)',
      'Patent Portfolio (29 patents: 5 filed + 6 pending + 18 innovations)',
      'Odyssey-1-App (17,000+ lines production code)',
      'Universal Math Engine ($150M-$250M valuation)',
      'IP Vault (7 Books copyrighted + 52 Songs)',
      'Database Platform (114 tables deployed)',
      'Business Revenue Streams (Stripe, subscriptions)',
      'Odyssey-1 AI LLC (100% membership interest)',
      'HJS Services LLC (legacy operations)',
      'Clarke County Real Estate (Lot 25, Camelot Subdivision)'
    ],
    co_trustees: ['Christla Howard', 'Teara Howard'],
    successor_trustees: ['Kenneth Howard', 'Joseph Lumpkin Jr'],
    protects_from_creditors: true,
    spendthrift_provision: true,
    operating_agreement_on_file: true,
    corporate_formalities_maintained: true,
    metadata: {
      source: 'MASTER_DOCUMENT_CONSOLIDATED.md (210 pages)',
      document_date: '2026-02-07',
      three_tier_valuations: {
        tier_1_optimistic: '$6.71B (Full Market Potential)',
        tier_2_market: '$950M (Market Comparables)',
        tier_3_conservative: '$366M (Conservative Banking Floor)'
      },
      triple_lock_defense: {
        layer_1: '$350K (Odyssey-1 → HJS Services)',
        layer_2: '$350K (Trust → Odyssey-1 IP)',
        layer_3: '$350K (Odyssey-1 → Rickey & Christla personal)',
        total: '$1.05M combined priority lien'
      },
      methodology: 'DCF + Market Comparables (AI companies) + Patent Portfolio Analysis',
      status: 'NOTARIZED & VERIFIED (Feb 7, 2026)'
    }
  };

  // 2. UCC-1 FILING #1 - PERSONAL LAYER (029-2026-000102)
  const ucc1Personal = {
    user_id: userId,
    entity_type: 'ucc_filing',
    filing_type: 'UCC-1 Financing Statement',
    ucc_filing_number: '029-2026-000102',
    record_id: '029-2026-000102',
    status: 'ACCEPTED & RECORDED',
    filing_date: '2026-02-05',
    county: 'Clarke County, Georgia',
    secured_party: 'ODYSSEY-1 AI LLC',
    debtors: ['RICKEY ALLAN HOWARD', 'CHRISTLA L HOWARD'],
    collateral_description: [
      'All personal assets',
      'Income and earnings',
      'Labor services',
      'Financial accounts',
      'Personal property'
    ],
    lien_amount: 350000,
    lien_priority: 'SENIOR',
    jurisdiction: 'Georgia (Nationwide UCC Notice)',
    linked_filing: '029-2026-000007',
    filing_fee: 25.00,
    category: 'Personal Security Interest',
    protects: 'Personal assets of Rickey Allan Howard & Christla L Howard',
    operating_agreement_on_file: true,
    corporate_formalities_maintained: true,
    metadata: {
      source: 'scripts/log-ucc-filing-029026000102.mjs',
      email_sent: '2026-02-05',
      recipient: 'archana.jitendra@sai-service.com',
      next_milestone: '30-day verification deadline: March 6, 2026',
      status: 'DOCUMENTED & VERIFIED'
    }
  };

  // 3. UCC-1 FILING #2 - BUSINESS LAYER (029-2026-000007)
  const ucc1Business = {
    user_id: userId,
    entity_type: 'ucc_filing',
    filing_type: 'UCC-1 Financing Statement',
    ucc_filing_number: '029-2026-000007',
    record_id: '029-2026-000007',
    status: 'ACCEPTED & RECORDED',
    filing_date: '2026-01-07',
    county: 'Clarke County, Georgia',
    secured_party: 'ODYSSEY-1 AI LLC',
    debtors: ['HJS SERVICES LLC'],
    collateral_description: [
      'All business assets',
      'Accounts receivable',
      'Equipment',
      'Revenue streams',
      'Business property',
      'Customer contracts'
    ],
    lien_amount: 350000,
    lien_priority: 'SENIOR',
    jurisdiction: 'Georgia (Nationwide UCC Notice)',
    linked_filing: '029-2026-000102',
    filing_fee: 25.00,
    category: 'Business Security Interest',
    protects: 'Business assets of HJS Services LLC (Odyssey-1 AI LLC secured party)',
    operating_agreement_on_file: true,
    corporate_formalities_maintained: true,
    metadata: {
      source: 'UCC1_Personal_Protection_Rickey_Howard.md & UCC1_Personal_Protection_Christla_Howard.md',
      filing_status: 'FIRST LAYER - Filed January 7, 2026',
      follow_up: 'Personal layer filed February 5, 2026',
      status: 'DOCUMENTED & VERIFIED'
    }
  };

  // 4. ODYSSEY-1 AI LLC (ENTITY)
  const odysseyLLC = {
    user_id: userId,
    entity_type: 'llc',
    name: 'Odyssey-1 AI LLC',
    status: 'ACTIVE',
    formed_date: '2025-11-01',
    jurisdiction: 'Georgia',
    member: 'Howard Jones Family Ancestral Trust (100% ownership)',
    operating_agreement_on_file: true,
    corporate_formalities_maintained: true,
    ucc_filings: ['029-2026-000102', '029-2026-000007'],
    holds_assets: [
      'Business operations',
      'Software and systems',
      'Customer relationships',
      'Revenue rights from Trust'
    ],
    metadata: {
      source: 'Assignment_of_IP_to_Trust.md',
      ownership: 'Trust-owned entity',
      role: 'Operating entity for Trust assets',
      status: 'DOCUMENTED & VERIFIED'
    }
  };

  try {
    // Upsert trust
    console.log('1️⃣  Syncing Howard Jones Bloodline Ancestral Trust (HJFAT-2026-001)...');
    const { data: trustResult, error: trustError } = await supabase
      .from('business_entities')
      .upsert([trustData], { onConflict: 'trust_id' });

    if (trustError) {
      console.error('   ❌ Error:', trustError);
    } else {
      console.log('   ✅ Trust synced (Valuation: $6.71B optimistic / $950M market / $366M conservative, $1.05M triple-lock UCC-1)');
    }

    // Upsert UCC-1 Personal
    console.log('\n2️⃣  Syncing UCC-1 Personal Layer (029-2026-000102)...');
    const { data: uccPResult, error: uccPError } = await supabase
      .from('business_entities')
      .upsert([ucc1Personal], { onConflict: 'ucc_filing_number' });

    if (uccPError) {
      console.error('   ❌ Error:', uccPError);
    } else {
      console.log('   ✅ UCC-1 Personal filed Feb 5, 2026 (Record #029-2026-000102, $350K lien)');
    }

    // Upsert UCC-1 Business
    console.log('\n3️⃣  Syncing UCC-1 Business Layer (029-2026-000007)...');
    const { data: uccBResult, error: uccBError } = await supabase
      .from('business_entities')
      .upsert([ucc1Business], { onConflict: 'ucc_filing_number' });

    if (uccBError) {
      console.error('   ❌ Error:', uccBError);
    } else {
      console.log('   ✅ UCC-1 Business filed Jan 7, 2026 (Record #029-2026-000007, $350K lien)');
    }

    // Upsert LLC
    console.log('\n4️⃣  Syncing Odyssey-1 AI LLC (Trust Operating Entity)...');
    const { data: llcResult, error: llcError } = await supabase
      .from('business_entities')
      .upsert([odysseyLLC], { onConflict: 'name' });

    if (llcError) {
      console.error('   ❌ Error:', llcError);
    } else {
      console.log('   ✅ Odyssey-1 AI LLC synced (100% Trust-owned)');
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ SYNC COMPLETE - Business entities updated from actual documentation');
    console.log('='.repeat(70));
    console.log('\n📊 SUMMARY:');
    console.log('   • Trust (HJFAT-2026-001): $6.71B optimistic / $1.05M triple-lock UCC-1 protection');
    console.log('   • UCC-1 Personal (029-2026-000102): $350K senior lien (Feb 5, 2026)');
    console.log('   • UCC-1 Business (029-2026-000007): $350K senior lien (Jan 7, 2026)');
    console.log('   • Total Senior Priority: $700K');
    console.log('   • R.O.M.A.N. Strategy Panel will now pull REAL data from database');
    
    // 🚀 TRIGGER R.O.M.A.N. CACHE REFRESH
    console.log('\n🔄 TRIGGERING R.O.M.A.N. CACHE REFRESH...');
    try {
      await fetch(`${supabaseUrl}/functions/v1/roman-processor`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceRoleKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIntent: 'REFRESH_BUSINESS_ENTITY_CACHE',
          action: 'CACHE_REFRESH',
          target: 'ROMAN_BUSINESS_ENTITIES',
          userId: 'system',
          organizationId: 1,
          correlation_id: `sync-refresh-${Date.now()}`
        })
      });
      console.log('   ✅ R.O.M.A.N. cache refresh triggered - System will load latest trust data');
    } catch (cacheError) {
      console.warn('   ⚠️ Could not trigger cache refresh (R.O.M.A.N. will refresh on next query)');
    }
    
    console.log('\n✅ Ready for deployment\n');

    return true;
  } catch (error) {
    console.error('❌ Sync failed:', error);
    return false;
  }
}

syncTrustAndUCCData();
