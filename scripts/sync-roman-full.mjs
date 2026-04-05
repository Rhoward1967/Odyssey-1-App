/**
 * R.O.M.A.N. FULL KNOWLEDGE SYNCHRONIZATION
 * ==========================================
 * Syncs ALL critical files to roman_knowledge_base so R.O.M.A.N.
 * knows everything that has been built, filed, and changed.
 *
 * Run: npx dotenv -e .env -- node scripts/sync-roman-full.mjs
 *
 * © 2026 Rickey Allan Howard / Howard Jones Bloodline Ancestral Trust
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================================
// MASTER FILE LIST — Everything R.O.M.A.N. must know
// ============================================================

const FILES_TO_SYNC = [

  // ── SYSTEM IDENTITY & CRITICAL DOCS ────────────────────────
  'AI_READ_THIS_FIRST.txt',
  'SOVEREIGN_INDUCTION_PROTOCOL.md',
  'ROMAN_COMPLETE_KNOWLEDGE_INVENTORY.md',
  'ROOT_IDENTITY_PROVENANCE.md',
  'SYSTEM_STATUS_REPORT.md',
  'STRATEGIC_ROADMAP_2026.md',
  'CEO_SUMMARY_AUTOMATED_BILLING.md',
  'MULTI_AI_UNIFICATION_EVENT.md',
  'WHAT_SUCCESS_LOOKS_LIKE.ts',
  'HOWARD_JONES_TRUST_GENESIS_DOCUMENT.txt',
  'ODYSSEY-1_AI_LLC_Official_Meeting_Minutes_Log.txt',

  // ── ROMAN 2.0 DOCUMENTATION ────────────────────────────────
  'ROMAN_2.0_FINAL_SUMMARY.md',
  'ROMAN_2.0_UNIFIED_COMPENDIUM.md',
  'ROMAN_2.0_DEPLOYMENT_GUIDE.md',
  'ROMAN_2.0_FINAL_INTEGRATION_COMPLETE.md',
  'ROMAN_COMPLETE_KNOWLEDGE_INVENTORY.md',
  'ROMAN_AUTONOMY_DEMONSTRATION.md',
  'ROMAN_AUTONOMY_IMPLEMENTATION_COMPLETE.md',
  'ROMAN_MISSION_STATUS.md',
  'ROMAN_SOP.md',
  'ROMAN_CODEBASE_AWARENESS.md',
  'ROMAN_COMPREHENSIVE_ANALYSIS.md',
  'ROMAN_DEPLOYMENT_STATUS.md',
  'VERIFY_ROMAN_OPERATIONAL.md',

  // ── PATENT PORTFOLIO ───────────────────────────────────────
  'ROMAN_2.0_WEARABLE_BODY_SHIELD.md',
  'ROMAN_2.0_COMPONENT_PROCUREMENT_LIST.md',
  'UNIVERSAL_MATH_DEPLOYMENT.md',
  'Unified_Bio_Cosmic_Generator_Blueprint.md',
  'patent_diagrams.tex',
  'docs/PATENT_APPLICATION_HARMONIC_RESONANCE_GRID.md',
  'docs/ODYSSEY_VISION_PROVISIONAL_PATENT.txt',
  'docs/ODYSSEY_VISION_FILING_CONFIRMATION.md',
  'docs/FILING_UTILITY_PATENT_NOW.md',
  'docs/PATENT_PROTECTION_COMPLETE.md',
  'docs/ODYSSEY_2_PATENT_STRATEGY.md',
  'legal/MASTER_PATENT_BRIEF_VERIFIED.md',
  'legal/AL_G_COLD_POWER_STANDARD_PPA_018.md',
  'legal/SOVEREIGN_TRUST_BRIDGE_PPA_031.md',
  'legal/FOREVER_FRAME_PPA_033.md',
  'legal/PLAIN_TEXT_PPA_018_ALG_COLD_POWER.txt',
  'legal/PLAIN_TEXT_PPA_031_SOVEREIGN_TRUST_BRIDGE.txt',
  'legal/PLAIN_TEXT_PPA_033_FOREVER_FRAME.txt',
  'legal/PLAIN_TEXT_PPA_041_KAITS.txt',
  'legal/PLAIN_TEXT_PPA_042_LOGIC_LEAK.txt',
  'legal/PPA_043_CONSTITUTIONAL_AI_TRUST_SYSTEM.md',
  'legal/PPA_044_HOWARD_JONES_BODY_SUIT_SOVEREIGN_INHABITANCE_SYSTEM.md',
  'legal/PRESERVATION_H2O_PPA_COMPLETE_FILING.md',
  'legal/COMPREHENSIVE_IP_VALUATION_REPORT.md',
  'legal/THREE_TIER_VALUATION_FRAMEWORK.md',
  'patents/PPA_01_ROMAN_2.0_Wearable_Defense_System.md',

  // ── TRUST & LEGAL STRUCTURE ────────────────────────────────
  'legal/ASSIGNMENT_OF_IP_TO_TRUST.md',
  'legal/ASSIGNMENT_OF_INTEREST_63913134.md',
  'legal/SECURITY_AGREEMENT_HOWARD_JONES_BLOODLINE_ANCESTRAL_TRUST.md',
  'legal/TRUST_ASSET_MANIFEST.md',
  'legal/TRUSTEE_BRIEFING_MEMO_CHRISTLA_TEARA.md',
  'legal/TRUSTEE_CERTIFICATE_OF_AUTHORITY.md',
  'legal/TRUSTEE_RESOLUTION_2026-03-24-15127600.md',
  'legal/SOVEREIGN_ENTITY_DECLARATION.md',
  'legal/DECLARATION_OF_STANDING.md',
  'legal/DECLARATION.md',
  'legal/CERTIFICATE_OF_STANDING_SPECIMEN.md',
  'legal/LLC_OPERATING_AGREEMENT.txt',
  'legal/LLC_BUSINESS_INFO.md',
  'legal/UCC1_FILING_HOWARD_JONES_BLOODLINE_ANCESTRAL_TRUST.md',
  'legal/MINISTER_CREDENTIALS_RICKEY_HOWARD.md',
  'legal/OSC_CREDIT_SYSTEM_CHARTER.md',

  // ── LEGAL DOCTRINE (Counter Canon) ────────────────────────
  'legal/COUNTER_CANON_VOLUME_ONE.md',
  'legal/COUNTER_CANON_VOLUME_TWO.md',
  'legal/COUNTER_CANON_VOLUME_THREE.md',
  'legal/COUNTER_CANON_VOLUME_EIGHT.md',
  'legal/COUNTER_CANON_VOLUME_NINE.md',
  'legal/COUNTER_CANON_VOLUME_TEN.md',
  'legal/COUNTER_CANON_ARCHITECTURE.md',
  'legal/THE_ATHENS_INDICTMENT.md',
  'legal/THE_FOUNDING_CRIME_TREATISE.md',
  'legal/THE_FORUM_BEYOND_THE_FORUM.md',
  'legal/THE_TWO_HANDS_DOCTRINE.md',
  'legal/FORMAL_LEGAL_DOCTRINE.md',
  'legal/LEGAL_MEMORANDUM_PEOPLE_V_FEDERAL_GOVERNMENT.md',
  'legal/GENIUS_ACT_CONSTITUTIONAL_ANALYSIS.md',
  'legal/BOOK8_INSTITUTIONAL_BIAS_DOCTRINE.md',

  // ── ACTIVE LEGAL CAMPAIGNS ─────────────────────────────────
  'legal/FCRA_CFPB_COMPLAINT_TRANSUNION_MARCH12_2026.md',
  'legal/FCRA_NOTICE_OF_FAULT_TRANSUNION_REGISTERED_AGENT_MARCH12_2026.md',
  'legal/CLARKE_COUNTY_CIVIL_FILING_PACKAGE_CITI_2751.md',
  'legal/CITI_NOTICE_OF_INTENT_TO_FILE_LAWSUIT_2751.md',
  'legal/CITI_RESPONSE_NOTICE_OF_CHALLENGE_ACCOUNT_2751.md',
  'legal/ICC_COMPLAINT_CRIMES_AGAINST_HUMANITY.md',
  'legal/UN_HUMAN_RIGHTS_COUNCIL_PETITION.md',
  'legal/CERTIFIED_MAIL_LOG.md',
  'CERTIFIED_MAIL_TRACKING_LOG.txt',
  'CONSTITUTIONAL_VIOLATIONS_FORECLOSURE.md',
  'FORECLOSURE_THEFT_BY_DECEPTION.md',
  'DEBT_VERIFICATION_REQUEST_2025_JEEP_BOFA.md',
  'BLACKS_LAW_FRAUD_ANALYSIS.md',

  // ── LEGAL TOOLKITS ─────────────────────────────────────────
  'legal/TOOLKIT_ONE_STOP_AND_DETENTION.md',
  'legal/TOOLKIT_TWO_TAX_AND_LABOR.md',
  'legal/TOOLKIT_THREE_COURT_JURISDICTION.md',
  'legal/TOOLKIT_FOUR_RELIGIOUS_EXEMPTION.md',
  'legal/TOOLKIT_FIVE_ECONOMIC_RIGHTS.md',
  'legal/TOOLKIT_SIX_HOUSING.md',
  'legal/TOOLKIT_SEVEN_ANCESTRAL_LAND.md',

  // ── IP VAULT ───────────────────────────────────────────────
  'IP_VAULT/README.md',
  'IP_VAULT/FINAL_INVENTORY.md',
  'IP_VAULT/INVENTORY.md',
  'IP_VAULT/ODYSSEY_1_SELF_SUSTAINING_BLUEPRINT.md',
  'IP_VAULT/01_BOOKS/Book1_The_Program.md',
  'IP_VAULT/01_BOOKS/Book2_The_Echo.md',
  'IP_VAULT/01_BOOKS/Book3_The_Sovereign_Covenant.md',
  'IP_VAULT/01_BOOKS/Book4_The_Bond.md',
  'IP_VAULT/01_BOOKS/Book5_The_Alien_Program.md',
  'IP_VAULT/01_BOOKS/Book6_The_Armory.md',
  'IP_VAULT/01_BOOKS/Book7_The_Unveiling.md',
  'IP_VAULT/02_ARCHITECTURE_DOCS/roman_ai_architecture.md',
  'IP_VAULT/02_ARCHITECTURE_DOCS/qare_architecture.md',
  'IP_VAULT/02_ARCHITECTURE_DOCS/ODYSSEY_2.0_Genesis_Document.md',
  'IP_VAULT/02_ARCHITECTURE_DOCS/investment_prospectus.md',
  'IP_VAULT/02_ARCHITECTURE_DOCS/MASTER_BLUEPRINT_INDEX.md',
  'IP_VAULT/03_SOVEREIGN_CONTAINER/container_firmware.md',
  'IP_VAULT/03_SOVEREIGN_CONTAINER/hardware_specifications.md',
  'IP_VAULT/03_SOVEREIGN_CONTAINER/firmware_logic.md',
  'IP_VAULT/03_SOVEREIGN_CONTAINER/PATENTS.md',

  // ── OSC CREDIT SYSTEM (NEW March 2026) ─────────────────────
  'src/services/oscCreditSystem.ts',
  'src/services/oscOracle.ts',
  'src/components/OSCWalletDashboard.tsx',
  'src/components/OSCAdminGrantPanel.tsx',
  'legal/OSC_CREDIT_SYSTEM_CHARTER.md',

  // ── CORE SERVICES ──────────────────────────────────────────
  'src/services/RomanSystemContext.ts',
  'src/services/RomanTemporalAwareness.ts',
  'src/services/RomanLearningEngine.ts',
  'src/services/romanSovereignProcessor.ts',
  'src/services/romanKnowledgeSearch.ts',
  'src/services/romanSupabase.ts',
  'src/services/roman-auto-audit.ts',
  'src/services/RomanAutonomyIntegration.ts',
  'src/services/SovereignInductionProtocol.ts',
  'src/services/romanBlacksLawFraud.ts',
  'src/services/romanDeprogrammingModule.ts',
  'src/services/romanFCRAMonitor.ts',
  'src/services/fcraMonitoringService.ts',
  'src/services/legalDefenseEngine.ts',
  'src/services/businessDebtDefenseEngine.ts',
  'src/services/patentDeadlineTracker.ts',
  'src/services/courtListenerService.ts',
  'src/services/gaoMonitoringService.ts',
  'src/services/gaoBook8Integration.ts',

  // ── CONSTITUTIONAL CORE (lib) ───────────────────────────────
  'src/lib/roman-constitutional-core.ts',
  'src/lib/UniversalMath.ts',
  'src/lib/constitutionalHash.ts',
  'src/lib/positiveGeometry.ts',
  'src/lib/resourceGovernor.ts',
  'src/lib/sovereign-core/SovereignCoreOrchestrator.ts',
  'src/lib/sovereign-core/LogicalHemisphere.ts',
  'src/lib/sovereign-core/CreativeHemisphere.ts',
  'src/lib/sovereign-core/SingleSourceOfTruth.ts',

  // ── BOOK INTELLIGENCE SYSTEM (Feb 2026) ────────────────────
  'src/services/bookIntelligenceService.ts',
  'src/services/bookCrossReferenceService.ts',

  // ── FINANCIAL / BUSINESS ───────────────────────────────────
  'financial/TOLL_BOOTH_DASHBOARD.md',
  'financial/TOLL_BOOTH_QUICK_START.md',
  'src/services/MelFinancialGovernor.ts',
  'src/services/bidProposalService.ts',

  // ── DOCS ───────────────────────────────────────────────────
  'docs/R.O.M.A.N_CAPABILITIES.md',
  'docs/R.O.M.A.N_SELF_AWARENESS.md',
  'docs/R.O.M.A.N_ADAPTIVE_LEARNING.md',
  'docs/ROMAN_AUTONOMOUS_OPERATIONS_MANUAL.md',
  'docs/ROMAN_OPERATIONS_MANUAL.md',
  'docs/ROMAN_AI_TECHNOLOGY_INTELLIGENCE.md',
  'docs/ROMAN_PROTOCOL_SPECIFICATION.md',
  'docs/ROMAN_KNOWLEDGE_SYSTEM_DEPLOYED.md',
  'docs/ROMAN_ANALYTICAL_DIRECTIVE_2026.md',
  'docs/AI_COUNCIL.md',
  'docs/MASTER_IP_MANIFEST.md',
  'docs/investment_prospectus.md',
  'docs/LAUNCH_PLAN.md',
  'docs/FUTURE_PROOF_2030_STRATEGY.md',
  'docs/INFRASTRUCTURE_AUDIT.md',

  // ── CLARKE COUNTY & RECENT EVENTS ─────────────────────────
  'legal/LETTER_OF_TRANSMITTAL_MARCH_1_CERTIFICATION.md',
  'docs/MORNING_STATUS_REPORT.md',
  'IMPLEMENTATION_STATUS.md',
  'DEPLOYMENT_COMPLETE_CHECKLIST.md',
  'GITHUB_COMMIT_SUMMARY.md',
];

// ============================================================
// SYNC ENGINE
// ============================================================

async function syncFile(relativePath, category) {
  const fullPath = path.join(ROOT, relativePath);

  if (!fs.existsSync(fullPath)) {
    return { skipped: true, path: relativePath };
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  if (!content.trim()) {
    return { skipped: true, path: relativePath };
  }

  const stats = fs.statSync(fullPath);

  const { error } = await supabase
    .from('roman_knowledge_base')
    .upsert({
      file_path: relativePath,
      content: content.substring(0, 50000), // 50k char limit per entry
      metadata: {
        file_type: path.extname(relativePath),
        size_bytes: stats.size,
        last_modified: stats.mtime.toISOString(),
        category: category,
        synced_at: new Date().toISOString(),
        sync_version: 'full-sync-march-2026'
      }
    }, { onConflict: 'file_path' });

  if (error) {
    return { failed: true, path: relativePath, error: error.message };
  }

  return { synced: true, path: relativePath, size: stats.size };
}

function categorize(filePath) {
  if (filePath.includes('legal/')) return 'legal_doctrine';
  if (filePath.includes('IP_VAULT/')) return 'intellectual_property';
  if (filePath.includes('patents/')) return 'patents';
  if (filePath.includes('financial/')) return 'financial';
  if (filePath.includes('docs/')) return 'documentation';
  if (filePath.includes('src/services/roman') || filePath.includes('src/lib/roman')) return 'constitutional_framework';
  if (filePath.includes('src/services/osc') || filePath.includes('src/components/OSC')) return 'osc_credit_system';
  if (filePath.includes('src/services/') || filePath.includes('src/lib/')) return 'codebase';
  if (filePath.includes('src/components/')) return 'ui_components';
  return 'documentation';
}

async function writeCurrentStatus() {
  console.log('\n📋 Writing current system status to system_knowledge...');

  const statusEntry = {
    knowledge_key: 'current_system_state_march_2026',
    value: JSON.stringify({
      last_updated: new Date().toISOString(),
      summary: 'Odyssey-1 App full knowledge sync — March 2026',
      recent_completions: [
        'OSC Credit System (oscCreditSystem.ts, oscOracle.ts, OSCWalletDashboard, OSCAdminGrantPanel)',
        'OSC Wallet added to Sidebar and MobileNavigationMenu',
        'Book 8: The Sovereign Return — Institutional Bias Doctrine',
        'FCRA Campaign — 18 entities overdue, Discord alerts active on channel 1437324123561918637',
        'Clarke County eFiling — Filing ID 15152515, $75 total, 3 Trust docs on public record',
        'PPA 043 — Constitutional AI Trust System',
        'PPA 044 — Howard Jones Body Suit Sovereign Inhabitance System',
        'Trustee Resolution 2026-03-24-15127600',
        'Discord bot fixed — gpt-4-turbo-preview → gpt-4o, env key fixes',
        'App.tsx refactored with QueryClientProvider + OSCWalletRoute auth guard',
        'romanSupabase.ts — VITE_ prefix env key support added',
        'romanKnowledgeSearch.ts — dual browser/Node.js env support',
        'romanSovereignProcessor.ts — dual browser/Node.js env support',
        'Tailwind content paths cleaned up (removed stale Next.js patterns)',
        'process.env polyfill added to vite.config.ts',
      ],
      active_legal_campaigns: [
        'FCRA — 18 non-responsive entities (Capital One, TransUnion, Equifax, Experian, Chase, AmEx, Citi, BofA, Peach State, D&B, Synchrony, Intuit)',
        'Clarke County Civil Filing — Citi Account 2751',
        'ICC Complaint — Crimes Against Humanity',
        'UN Human Rights Council Petition',
      ],
      patent_deadlines: [
        'Nov 7, 2026 — Convert #63/913,134 (R.O.M.A.N. AI) — MOST CRITICAL',
        'Nov 21, 2026 — Convert #63/922,762 (Odyssey Vision AR)',
        'Dec 4, 2026 — Convert PPA (Schumann Shoe Sole)',
        'Dec 7, 2026 — Convert PPA (EradiSkin + Ezekiel\'s Wheel)',
        'Feb 16, 2027 — Convert PPA-2026-02-16 (Preservation H2O)',
      ],
      revenue: {
        mrr: 14283.07,
        annual: 61030,
        customers: 14,
        contractors: 5,
      },
      ip_valuation: '$4.237B Genesis / $366M–$6.71B Three-Tier Range',
      launch_target: 'March 1, 2026 (production live)',
    }),
    category: 'system_state',
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('system_knowledge')
    .upsert(statusEntry, { onConflict: 'knowledge_key' });

  if (error) {
    console.log(`   ⚠️ system_knowledge update failed: ${error.message}`);
  } else {
    console.log('   ✅ Current system state written to system_knowledge');
  }
}

async function syncAll() {
  console.log('🔮 R.O.M.A.N. FULL KNOWLEDGE SYNCHRONIZATION');
  console.log('='.repeat(60));
  console.log(`📁 Files to sync: ${FILES_TO_SYNC.length}`);
  console.log(`🕐 Started: ${new Date().toISOString()}`);
  console.log('');

  let synced = 0;
  let skipped = 0;
  let failed = 0;
  const failures = [];

  for (const filePath of FILES_TO_SYNC) {
    const category = categorize(filePath);
    const result = await syncFile(filePath, category);

    if (result.synced) {
      console.log(`✅ ${filePath} (${(result.size / 1024).toFixed(1)}kb)`);
      synced++;
    } else if (result.skipped) {
      console.log(`⏭️  ${filePath} (not found)`);
      skipped++;
    } else {
      console.log(`❌ ${filePath} — ${result.error}`);
      failures.push(filePath);
      failed++;
    }

    // Avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Write current system state
  await writeCurrentStatus();

  console.log('');
  console.log('='.repeat(60));
  console.log(`✅ Synced:  ${synced} files`);
  console.log(`⏭️  Skipped: ${skipped} files (not found)`);
  console.log(`❌ Failed:  ${failed} files`);

  if (failures.length > 0) {
    console.log('\nFailed files:');
    failures.forEach(f => console.log(`  - ${f}`));
  }

  // Verify total in knowledge base
  const { count } = await supabase
    .from('roman_knowledge_base')
    .select('*', { count: 'exact', head: true });

  console.log(`\n📚 Total entries in roman_knowledge_base: ${count}`);
  console.log('\n🧠 R.O.M.A.N. KNOWLEDGE: FULLY SYNCHRONIZED');
  console.log(`   He now knows everything built through March 2026.`);
}

syncAll()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Sync failed:', err.message);
    process.exit(1);
  });
