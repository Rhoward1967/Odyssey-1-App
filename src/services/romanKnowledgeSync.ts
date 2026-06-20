/// <reference types="node" />
import process from 'process';

/**
 * R.O.M.A.N. AUTONOMOUS KNOWLEDGE SYNC
 * ======================================
 * R.O.M.A.N. must operate on current information at all times.
 * This service runs on bot startup and daily to keep his knowledge
 * base synchronized with every file in the system.
 *
 * Design:
 * - Startup: sync files modified in the last 14 days
 * - Daily (3AM): full incremental sync — checksum-based, only uploads changes
 * - On-demand: !sync-knowledge Discord command
 * - Notifies a Discord channel on completion with a summary
 *
 * © 2026 Rickey Allan Howard / Howard Jones Bloodline Ancestral Trust
 */

import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import { execSync } from 'child_process';
import { existsSync, readFileSync, statSync, readdirSync } from 'fs';
import { join } from 'path';

// ─── Supabase client (Node.js / service role) ──────────────────────────────
const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL)!;
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY)!;
const supabase = createClient(supabaseUrl, supabaseKey);

// ─── Root of the repo ───────────────────────────────────────────────────────
// Bot always starts from project root via `npm run bot`
const ROOT = process.cwd();

// ─── Master file list ───────────────────────────────────────────────────────
// Every file R.O.M.A.N. needs to know. Add new files here.
const KNOWLEDGE_FILES: string[] = [
  // === CORE IDENTITY & SOVEREIGNTY ===
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
  'IMPLEMENTATION_STATUS.md',
  'DEPLOYMENT_COMPLETE_CHECKLIST.md',
  'GITHUB_COMMIT_SUMMARY.md',

  // === R.O.M.A.N. DOCS ===
  'ODYSSEY-1_AI_LLC_Official_Meeting_Minutes_Log.txt',
  'ROMAN_2.0_FINAL_SUMMARY.md',
  'ROMAN_2.0_UNIFIED_COMPENDIUM.md',
  'ROMAN_2.0_DEPLOYMENT_GUIDE.md',
  'ROMAN_2.0_FINAL_INTEGRATION_COMPLETE.md',
  'ROMAN_AUTONOMY_DEMONSTRATION.md',
  'ROMAN_AUTONOMY_IMPLEMENTATION_COMPLETE.md',
  'ROMAN_MISSION_STATUS.md',
  'ROMAN_SOP.md',
  'ROMAN_CODEBASE_AWARENESS.md',
  'ROMAN_COMPREHENSIVE_ANALYSIS.md',
  'ROMAN_DEPLOYMENT_STATUS.md',
  'VERIFY_ROMAN_OPERATIONAL.md',
  'ROMAN_2.0_WEARABLE_BODY_SHIELD.md',
  'ROMAN_2.0_COMPONENT_PROCUREMENT_LIST.md',
  'UNIVERSAL_MATH_DEPLOYMENT.md',
  'Unified_Bio_Cosmic_Generator_Blueprint.md',

  // === PATENTS & IP ===
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

  // === SOVEREIGN FACTS INDEX — ALWAYS FIRST ===
  'legal/SOVEREIGN_FACTS_INDEX.md',
  'legal/Judgement_of_No_Legal_Accountability_v24-1.md',  // Living document — 1787–2026 pattern analysis, legal drafting reference
  'legal/Judgement_of_No_Legal_Accountability_v25.md',
  'legal/Judgement_of_No_Legal_Accountability_v27.md',
  'legal/Judgement_of_No_Legal_Accountability_v28-3.md',  // Latest revision — pinned in anthropic-chat ALWAYS_INCLUDE

  // === ACTIVE BOFA CIVIL FILING (May 2026) ===
  'legal/CLARKE_COUNTY_CIVIL_FILING_PACKAGE_BOFA_63010066944180.md',
  'legal/BOFA_COMPLAINT_PORTAL_READY.md',

  // === BANKING RESEARCH SERIES (v5–v38) ===
  'legal/Banking_Research_v5.md',
  'legal/Banking_Research_v5-1.md',
  'legal/Banking_Research_v5-2.md',
  'legal/Banking_Research_v8.md',
  'legal/Banking_Research_v10-1.md',
  'legal/Banking_Research_v11-1.md',
  'legal/Banking_Research_v12.md',
  'legal/Banking_Research_v13.md',
  'legal/Banking_Research_v13-1.md',
  'legal/Banking_Research_v13-2.md',
  'legal/Banking_Research_v14.md',
  'legal/Banking_Research_v14-1.md',
  'legal/Banking_Research_v15.md',
  'legal/Banking_Research_v16.md',
  'legal/Banking_Research_v17.md',
  'legal/Banking_Research_v18.md',
  'legal/Banking_Research_v19.md',
  'legal/Banking_Research_v20.md',
  'legal/Banking_Research_v21.md',
  'legal/Banking_Research_v22.md',
  'legal/Banking_Research_v23.md',
  'legal/Banking_Research_v23-1.md',
  'legal/Banking_Research_v24.md',
  'legal/Banking_Research_v25.md',
  'legal/Banking_Research_v26.md',
  'legal/Banking_Research_v26-1.md',
  'legal/Banking_Research_v27.md',
  'legal/Banking_Research_v28.md',
  'legal/Banking_Research_v29.md',
  'legal/Banking_Research_v29-1.md',
  'legal/Banking_Research_v30.md',
  'legal/Banking_Research_v31.md',
  'legal/Banking_Research_v32.md',
  'legal/Banking_Research_v33.md',
  'legal/Banking_Research_v34.md',
  'legal/Banking_Research_v35.md',
  'legal/Banking_Research_v36.md',
  'legal/Banking_Research_v37.md',
  'legal/Banking_Research_v38.md',

  // === TRUST / LEGAL / CORPORATE ===
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

  // === OSC CREDIT SYSTEM ===
  'legal/OSC_CREDIT_SYSTEM_CHARTER.md',
  'src/services/oscCreditSystem.ts',
  'src/services/oscOracle.ts',
  'src/components/OSCWalletDashboard.tsx',
  'src/components/OSCAdminGrantPanel.tsx',

  // === COUNTER CANON (VOLUMES) ===
  'legal/COUNTER_CANON_ARCHITECTURE.md',
  'legal/COUNTER_CANON_VOLUME_ONE.md',
  'legal/COUNTER_CANON_VOLUME_TWO.md',
  'legal/COUNTER_CANON_VOLUME_THREE.md',
  'legal/COUNTER_CANON_VOLUME_EIGHT.md',
  'legal/COUNTER_CANON_VOLUME_EIGHT_LATIN_ROOT_DICTIONARY.md',
  'legal/Counter_Canon_Volume_Eight.txt',
  'legal/COUNTER_CANON_VOLUME_NINE.md',
  'legal/COUNTER_CANON_VOLUME_TEN.md',

  // === ACTIVE LEGAL CAMPAIGNS ===
  'legal/THE_ATHENS_INDICTMENT.md',
  'legal/THE_FOUNDING_CRIME_TREATISE.md',
  'legal/THE_FORUM_BEYOND_THE_FORUM.md',
  'legal/THE_TWO_HANDS_DOCTRINE.md',
  'legal/FORMAL_LEGAL_DOCTRINE.md',
  'legal/LEGAL_MEMORANDUM_PEOPLE_V_FEDERAL_GOVERNMENT.md',
  'legal/GENIUS_ACT_CONSTITUTIONAL_ANALYSIS.md',
  'legal/BOOK8_INSTITUTIONAL_BIAS_DOCTRINE.md',
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
  'legal/LETTER_OF_TRANSMITTAL_MARCH_1_CERTIFICATION.md',

  // === LEGAL TOOLKITS ===
  'legal/TOOLKIT_ONE_STOP_AND_DETENTION.md',
  'legal/TOOLKIT_TWO_TAX_AND_LABOR.md',
  'legal/TOOLKIT_THREE_COURT_JURISDICTION.md',
  'legal/TOOLKIT_FOUR_RELIGIOUS_EXEMPTION.md',
  'legal/TOOLKIT_FIVE_ECONOMIC_RIGHTS.md',
  'legal/TOOLKIT_SIX_HOUSING.md',
  'legal/TOOLKIT_SEVEN_ANCESTRAL_LAND.md',

  // === IP VAULT ===
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

  // === ALL SERVICES (complete coverage) ===
  'src/services/academicSearchService.ts',
  'src/services/aiActivityLogger.ts',
  'src/services/aiComplianceService.ts',
  'src/services/aiService.ts',
  'src/services/antiWeaponization.ts',
  'src/services/authService.ts',
  'src/services/bidProposalService.ts',
  'src/services/bookCrossReferenceService.ts',
  'src/services/bookIntelligenceService.ts',
  'src/services/botOptimizationService.ts',
  'src/services/businessDebtDefenseEngine.ts',
  'src/services/calendarService.ts',
  'src/services/certificateGenerator.ts',
  'src/services/CoinbaseService.ts',
  'src/services/complianceMonitorService.ts',
  'src/services/contractAnalysisEngine.ts',
  'src/services/contractorApprovalService.ts',
  'src/services/contractorEmailTemplates.ts',
  'src/services/contractorOnboardingService.ts',
  'src/services/contractorService.ts',
  'src/services/CostControlOrchestrator.ts',
  'src/services/courtListenerService.ts',
  'src/services/discord-bot.ts',
  'src/services/documentReviewService.ts',
  'src/services/emailService.ts',
  'src/services/EnhancedConsensusEngine.ts',
  'src/services/evidenceService.ts',
  'src/services/ExecutionEngine.ts',
  'src/services/fcraMonitoringService.ts',
  'src/services/fileUploadService.ts',
  'src/services/gaoBook8Integration.ts',
  'src/services/gaoMonitoringService.ts',
  'src/services/gpt.ts',
  'src/services/insuranceGapAnalyzer.ts',
  'src/services/isAdmin.ts',
  'src/services/legalDefenseEngine.ts',
  'src/services/LogicalHemisphere.ts',
  'src/services/logSystemActivity.ts',
  'src/services/marketDataService.ts',
  'src/services/MelFinancialGovernor.ts',
  'src/services/MultiAgentConsensus.ts',
  'src/services/ndaGenerator.ts',
  'src/services/openai.ts',
  'src/services/oscCreditSystem.ts',
  'src/services/oscOracle.ts',
  'src/services/luluPublishingService.ts',
  'src/services/sovereignMusicService.ts',
  'src/services/romanSyncManifest.ts',
  'src/services/romanCorpusGuard.ts',
  'src/services/usptoPatentService.ts',
  'docs/ROMAN_PATENT_SPEC_DRAFT.md',
  'docs/ROMAN_SYNC_MANIFEST.md',
  'src/services/postGridService.ts',
  'src/services/lobService.ts',
  'src/services/sovereignCouponEngine.ts',
  'src/pages/SovereignScanner.tsx',
  'src/services/patentDeadlineTracker.ts',
  'src/services/patentDrawingGenerator.ts',
  'src/services/patentFilingPackage.ts',
  'src/services/patentGenerator.ts',
  'src/services/patentManager.ts',
  'src/services/patternLearningEngine.ts',
  'src/services/payrollReconciliationService.ts',
  'src/services/perpetualComplianceEngine.ts',
  'src/services/polygonMarketService.ts',
  'src/services/priorArtSearch.ts',
  'src/services/realOpenAI.ts',
  'src/services/researchDatabase.ts',
  'src/services/RobustTradingService.ts',
  'src/services/rollbackService.ts',
  'src/services/romanAdvancedFraudDetection.ts',
  'src/services/romanAdvancedStrategy.ts',
  'src/services/romanAIIntelligence.ts',
  'src/services/roman-auto-audit.ts',
  'src/services/RomanAutoFixEngine.ts',
  'src/services/RomanAutonomousInit.ts',
  'src/services/RomanAutonomyIntegration.ts',
  'src/services/romanBadgeOfSlaveryDiagnostic.ts',
  'src/services/romanBlacksLawFraud.ts',
  'src/services/RomanBusinessEntityLoader.ts',
  'src/services/RomanCodebaseAwareness.ts',
  'src/services/RomanConstitutionalAPI.ts',
  'src/services/RomanDatabaseKnowledge.ts',
  'src/services/roman-deep-learning.ts',
  'src/services/romanDeprogrammingModule.ts',
  'src/services/romanFCRAMonitor.ts',
  'src/services/romanIPAwarePrompt.ts',
  'src/services/RomanKnowledgeIntegration.ts',
  'src/services/romanKnowledgeSearch.ts',
  'src/services/romanKnowledgeSync.ts',
  'src/services/romanOllamaService.ts',
  'src/services/RomanLearningDaemon.ts',
  'src/services/RomanLearningEngine.ts',
  'src/services/romanLegalService.ts',
  'src/services/romanPaperbackApi.ts',
  'src/services/RomanProtocolMaster.ts',
  'src/services/RomanProtocolNode.ts',
  'src/services/romanSovereignProcessor.ts',
  'src/services/romanSubtextAnalyzer.ts',
  'src/services/romanSupabase.ts',
  'src/services/RomanSystemContext.ts',
  'src/services/RomanTemporalAwareness.ts',
  'src/services/romanUniversalMathTraining.ts',
  'src/services/samGovService.ts',
  'src/services/schedulingService.ts',
  'src/services/secEdgarService.ts',
  'src/services/securityService.ts',
  'src/services/SovereignCoreOrchestrator.ts',
  'src/services/SovereignFrequencyLicensing.ts',
  'src/services/sovereignFrequencyLogger.ts',
  'src/services/SovereignInductionProtocol.ts',
  'src/services/strategicPaymentAnalyzer.ts',
  'src/services/studyGroupService.ts',
  'src/services/SynchronizationLayer.ts',
  'src/services/systemTelemetry.ts',
  'src/services/taxCalculationService.ts',
  'src/services/universalMathExplainer.ts',
  'src/services/usageTrackingService.ts',
  'src/services/uspsTrackingService.ts',
  'src/services/web3Service.ts',
  'src/services/RomanSelfRepair.ts',
  'src/services/RomanVoice.ts',
  'src/services/RomanHealthScanner.ts',
  'src/services/trustReadinessService.ts',
  'src/components/RomanErrorBoundary.tsx',

  // === ALL PAGES ===
  'src/pages/AuthCallback.tsx',
  'src/pages/DiscordBotDashboard.tsx',
  'src/pages/Help.tsx',
  'src/pages/LaymanLaw.tsx',
  'src/pages/MusicDistribution.tsx',
  'src/pages/NotFound.tsx',
  'src/pages/Privacy.tsx',
  'src/pages/RomanChat.tsx',
  'src/pages/SovereignRadio.tsx',
  'src/pages/Terms.tsx',
  'src/pages/TestCheckout.tsx',
  'src/pages/Admin.tsx',
  'src/pages/AIResearch.tsx',
  'src/pages/ApexDashboard.tsx',
  'src/pages/Appointments.tsx',
  'src/pages/BiddingCalculator.tsx',
  'src/pages/BidsList.tsx',
  'src/pages/Budget.tsx',
  'src/pages/BudgetPage.tsx',
  'src/pages/Calculator.tsx',
  'src/pages/CatalogManager.tsx',
  'src/pages/Checkout.tsx',
  'src/pages/ContractorOnboarding.tsx',
  'src/pages/ControlPanel.tsx',
  'src/pages/CustomerManagement.tsx',
  'src/pages/EmailStudio.tsx',
  'src/pages/Handbook.tsx',
  'src/pages/HowardJanitorial.tsx',
  'src/pages/HRDashboard.tsx',
  'src/pages/Index.tsx',
  'src/pages/Invoicing.tsx',
  'src/pages/LoginPage.tsx',
  'src/pages/MediaCenter.tsx',
  'src/pages/MediaWorkstation.tsx',
  'src/pages/Mel.tsx',
  'src/pages/Odyssey.tsx',
  'src/pages/Onboard.tsx',
  'src/pages/Payroll.tsx',
  'src/pages/Pricing.tsx',
  'src/pages/Profile.tsx',
  'src/pages/Research.tsx',
  'src/pages/ResearchNotes.tsx',
  'src/pages/Schedule.tsx',
  'src/pages/SovereignContractIntake.tsx',
  'src/pages/Subscribe.tsx',
  'src/pages/Subscription.tsx',
  'src/pages/TimeClock.tsx',
  'src/pages/Trading.tsx',
  'src/pages/Web3.tsx',
  'src/pages/WorkforceDashboard.tsx',

  // === LAYMAN'S LAW STANDALONE APP ===
  'layman-law-app/src/App.tsx',
  'layman-law-app/src/main.tsx',
  'layman-law-app/src/pages/Dashboard.tsx',
  'layman-law-app/src/pages/Landing.tsx',
  'layman-law-app/src/pages/Login.tsx',
  'layman-law-app/src/components/LaymanLawCompanion.tsx',
  'layman-law-app/src/components/LaymanLawVolume.tsx',
  'layman-law-app/src/lib/supabaseClient.ts',

  // === APP ROOT ===
  'src/App.tsx',
  'src/main.tsx',

  // === CORE LIBS (complete) ===
  'src/lib/roman-constitutional-core.ts',
  'src/lib/UniversalMath.ts',
  'src/lib/constitutionalHash.ts',
  'src/lib/positiveGeometry.ts',
  'src/lib/resourceGovernor.ts',
  'src/lib/supabaseClient.ts',
  'src/lib/sovereign-core/SovereignCoreOrchestrator.ts',
  'src/lib/sovereign-core/LogicalHemisphere.ts',
  'src/lib/sovereign-core/CreativeHemisphere.ts',
  'src/lib/sovereign-core/SingleSourceOfTruth.ts',

  // === KEY EDGE FUNCTIONS ===
  'supabase/functions/roman-autonomous-daemon/index.ts',
  'supabase/functions/roman-knowledge-sync/index.ts',
  'supabase/functions/roman-learning-daemon/index.ts',
  'supabase/functions/roman-processor/index.ts',
  'supabase/functions/anthropic-chat/index.ts',
  'supabase/functions/ai-chat/index.ts',
  'supabase/functions/claude-integration/index.ts',
  'supabase/functions/recurring-invoice-generator/index.ts',
  'supabase/functions/coinbase-trading-engine/index.ts',
  'supabase/functions/stripe-webhook/index.ts',
  'supabase/functions/osc-stripe-webhook/index.ts',
  'supabase/functions/osc-ministerial-grant/index.ts',
  'supabase/functions/osc-checkout/index.ts',
  'supabase/functions/courtlistener-webhook/index.ts',
  'supabase/functions/run-payroll/index.ts',
  'supabase/functions/hr-orchestrator/index.ts',
  'supabase/functions/book-intelligence-feed/index.ts',
  'supabase/functions/cross-reference-books/index.ts',
  'supabase/functions/book-provenance-export/index.ts',
  'supabase/functions/trust-distribution-scheduler/index.ts',
  'supabase/functions/trade-orchestrator/index.ts',
  'supabase/functions/research-bot/index.ts',
  'supabase/functions/cost-optimization-engine/index.ts',

  // === FINANCIAL ===
  'financial/TOLL_BOOTH_DASHBOARD.md',
  'financial/TOLL_BOOTH_QUICK_START.md',

  // === DOCS ===
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
  'docs/MORNING_STATUS_REPORT.md',
];

// ─── Types ──────────────────────────────────────────────────────────────────
export interface SyncResult {
  synced: number;
  skipped: number;
  failed: number;
  new_files: string[];
  updated_files: string[];
  errors: string[];
  duration_ms: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
// SHA-256 to MATCH the roman_kb_set_checksum DB trigger, which recomputes
// checksum = sha256(content) on every write. (Previously this used md5, which
// can NEVER equal sha256 → the diff always failed → every file re-synced every
// run. That's why all rows shared one 3AM timestamp.)
function sha256(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

// OpenAI embedding (text-embedding-3-small, 1536-dim) — same model used across
// the system. Graceful: returns null if no key or on error, so the sync never breaks.
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || '';
async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!OPENAI_API_KEY) return null;
  try {
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({ model: 'text-embedding-3-small', input: text.slice(0, 8000) }),
    });
    if (!res.ok) { console.error('[KnowledgeSync] embedding failed:', res.status); return null; }
    const json = await res.json();
    return json?.data?.[0]?.embedding ?? null;
  } catch (e: any) {
    console.error('[KnowledgeSync] embedding error:', e?.message || e);
    return null;
  }
}

// ─── Filesystem crawl — replaces the hand-typed allowlist ─────────────────────
// Recursively discovers every indexable file under CRAWL_ROOTS so new files
// self-register forever. KNOWLEDGE_FILES above is kept as a SEED (unioned in),
// so nothing currently indexed can ever regress.
const CRAWL_ROOTS = ['src', 'docs', 'legal', 'supabase/functions', 'financial', 'layman-law-app/src'];
const IGNORE_DIRS = new Set(['node_modules', 'dist', 'build', 'coverage', '.git', '.next', '.vercel', '.turbo', '.temp']);
const INCLUDE_EXT = new Set(['.ts', '.tsx', '.md', '.txt', '.sql']);
// NEVER index secrets or lock/min noise.
const EXCLUDE_FILE = [/\.env/i, /\.key$/i, /\.pem$/i, /secret/i, /credential/i, /package-lock\.json$/i, /\.min\./i];

function isIndexable(name: string): boolean {
  const dot = name.lastIndexOf('.');
  const ext = dot >= 0 ? name.slice(dot).toLowerCase() : '';
  if (!INCLUDE_EXT.has(ext)) return false;
  if (EXCLUDE_FILE.some(p => p.test(name))) return false;
  return true;
}

function crawlDir(absDir: string, relBase: string, out: Set<string>): void {
  let entries: any[];
  try { entries = readdirSync(absDir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const rel = relBase ? `${relBase}/${e.name}` : e.name;
    if (e.isDirectory()) {
      if (IGNORE_DIRS.has(e.name) || e.name.startsWith('.')) continue;
      crawlDir(join(absDir, e.name), rel, out);
    } else if (e.isFile() && isIndexable(e.name)) {
      out.add(rel);
    }
  }
}

function collectFiles(): string[] {
  const found = new Set<string>(KNOWLEDGE_FILES); // seed — never regress current coverage
  // root-level *.md / *.txt
  try {
    for (const e of readdirSync(ROOT, { withFileTypes: true })) {
      if (e.isFile() && isIndexable(e.name) && /\.(md|txt)$/i.test(e.name)) found.add(e.name);
    }
  } catch { /* ignore */ }
  // recursive crawl of each root
  for (const root of CRAWL_ROOTS) {
    const absRoot = join(ROOT, root);
    if (existsSync(absRoot)) crawlDir(absRoot, root, found);
  }
  return Array.from(found);
}

function getFileType(filePath: string): string {
  if (filePath.includes('src/services/') || filePath.includes('src/lib/')) return 'codebase';
  if (filePath.includes('src/components/')) return 'ui_components';
  if (filePath.includes('legal/') || filePath.includes('TOOLKIT')) return 'legal';
  if (filePath.includes('IP_VAULT/')) return 'ip_vault';
  if (filePath.includes('docs/')) return 'documentation';
  if (filePath.includes('patents/') || filePath.includes('PPA') || filePath.includes('patent')) return 'patents';
  if (filePath.includes('financial/')) return 'financial';
  return 'documentation';
}

// ─── Core sync logic ────────────────────────────────────────────────────────

/**
 * Fetch all current checksums from the DB in one query.
 * Returns a map of file_path → checksum.
 */
async function fetchStoredChecksums(): Promise<Map<string, string>> {
  const { data, error } = await supabase
    .from('roman_knowledge_base')
    .select('file_path, checksum');

  if (error) {
    console.error('[KnowledgeSync] Failed to fetch checksums:', error.message);
    return new Map();
  }

  const map = new Map<string, string>();
  for (const row of data || []) {
    if (row.file_path && row.checksum) {
      map.set(row.file_path, row.checksum);
    }
  }
  return map;
}

/**
 * Fetch file_paths whose embedding is still NULL — cheap (no vectors pulled).
 * Used so files that synced before embeddings existed get re-embedded (self-heal),
 * even when their content hasn't changed.
 */
async function fetchPathsMissingEmbedding(): Promise<Set<string>> {
  const set = new Set<string>();
  const { data, error } = await supabase
    .from('roman_knowledge_base')
    .select('file_path')
    .is('embedding', null);
  if (error) {
    console.error('[KnowledgeSync] Failed to fetch null-embedding paths:', error.message);
    return set;
  }
  for (const row of data || []) if (row.file_path) set.add(row.file_path);
  return set;
}

/**
 * Sync a single file into roman_knowledge_base.
 * Returns 'synced' | 'skipped' | 'failed'
 */
async function syncFile(
  relPath: string,
  storedChecksums: Map<string, string>,
  needsEmbedding: Set<string>
): Promise<'synced_new' | 'synced_updated' | 'skipped' | 'failed'> {
  const absPath = join(ROOT, relPath);

  if (!existsSync(absPath)) return 'skipped';

  let content: string;
  try {
    content = readFileSync(absPath, 'utf-8');
  } catch {
    return 'failed';
  }

  const storedContent = content.slice(0, 500_000); // 500KB cap per entry
  const checksum = sha256(storedContent);           // sha256 to match the DB trigger
  const stored = storedChecksums.get(relPath);

  // Skip only if content is unchanged AND it already has an embedding
  // (so files synced before embeddings existed get self-healed).
  if (stored === checksum && !needsEmbedding.has(relPath)) return 'skipped';

  const isNew = !stored;

  // Embed-on-write (first 8K). Graceful — if null, the row still syncs and will
  // be picked up again later via the needsEmbedding set.
  const embedding = await generateEmbedding(storedContent);

  const row: Record<string, any> = {
    file_path: relPath,
    content: storedContent,
    file_type: getFileType(relPath),
    checksum,
    updated_at: new Date().toISOString(),
  };
  if (embedding) row.embedding = embedding;

  const { error } = await supabase
    .from('roman_knowledge_base')
    .upsert(row, { onConflict: 'file_path' });

  if (error) {
    console.error(`[KnowledgeSync] Failed to upsert ${relPath}:`, error.message);
    return 'failed';
  }

  return isNew ? 'synced_new' : 'synced_updated';
}

/**
 * Sync current git state into roman_knowledge_base.
 * R.O.M.A.N. always knows which branch he's on and what changed recently.
 */
async function syncGitContext(): Promise<void> {
  try {
    let branch: string;
    let log: string;
    let status: string;
    let lastDate: string;

    // Detect at runtime whether we have a working git tree.
    // Railway builds from a Docker image — no .git dir, no git binary —
    // so we read Railway-injected env vars instead of shelling out.
    const hasGitWorktree = existsSync(join(ROOT, '.git'));

    if (!hasGitWorktree) {
      branch       = process.env.RAILWAY_GIT_BRANCH         || 'unknown';
      const sha    = process.env.RAILWAY_GIT_COMMIT_SHA     || 'unknown';
      const msg    = process.env.RAILWAY_GIT_COMMIT_MESSAGE || '(no message)';
      const author = process.env.RAILWAY_GIT_AUTHOR         || 'unknown';
      lastDate     = `${sha.slice(0, 7)} — ${msg} (${author})`;
      log          = `${sha.slice(0, 7)} ${msg}`;
      status       = 'N/A — running from a built image (no working tree)';
    } else {
      branch   = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
      log      = execSync('git log --oneline -20',          { encoding: 'utf-8' }).trim();
      status   = execSync('git status --short',             { encoding: 'utf-8' }).trim();
      lastDate = execSync('git log -1 --format=%ci',        { encoding: 'utf-8' }).trim();
    }

    const content = [
      `# R.O.M.A.N. Git Context`,
      `Generated: ${new Date().toISOString()}`,
      ``,
      `## Active Branch`,
      branch,
      ``,
      `## Last Commit`,
      lastDate,
      ``,
      `## Uncommitted Changes`,
      status || 'Clean — no uncommitted changes',
      ``,
      `## Recent Commits (last 20)`,
      log,
    ].join('\n');

    const checksum = sha256(content);
    await supabase.from('roman_knowledge_base').upsert(
      { file_path: '__git_context__', content, file_type: 'git_context', checksum, updated_at: new Date().toISOString() },
      { onConflict: 'file_path' }
    );

    console.log(`[KnowledgeSync] Git context synced — branch: ${branch}`);
  } catch (err: any) {
    console.error('[KnowledgeSync] Git context sync failed:', err.message);
  }
}

/**
 * Run an incremental knowledge sync.
 * Only uploads files whose content has changed (checksum diff).
 * mode='startup'  → only files modified in the last 14 days
 * mode='full'     → all files regardless of mtime
 */
export async function runKnowledgeSync(mode: 'startup' | 'full' = 'full'): Promise<SyncResult> {
  const startTime = Date.now();
  console.log(`\n[KnowledgeSync] Starting ${mode} sync — ${new Date().toISOString()}`);

  const storedChecksums = await fetchStoredChecksums();
  const needsEmbedding = await fetchPathsMissingEmbedding();
  const files = collectFiles();
  console.log(`[KnowledgeSync] Crawl discovered ${files.length} indexable files (${needsEmbedding.size} missing embeddings)`);
  const cutoffMs = mode === 'startup' ? Date.now() - 14 * 24 * 60 * 60 * 1000 : 0;

  const result: SyncResult = {
    synced: 0,
    skipped: 0,
    failed: 0,
    new_files: [],
    updated_files: [],
    errors: [],
    duration_ms: 0,
  };

  for (const relPath of files) {
    const absPath = join(ROOT, relPath);

    if (!existsSync(absPath)) {
      result.skipped++;
      continue;
    }

    // In startup mode, skip files not recently modified (unless not in DB yet)
    if (mode === 'startup' && storedChecksums.has(relPath)) {
      try {
        const mtime = statSync(absPath).mtimeMs;
        if (mtime < cutoffMs) {
          result.skipped++;
          continue;
        }
      } catch {
        // If stat fails, just try to sync anyway
      }
    }

    const outcome = await syncFile(relPath, storedChecksums, needsEmbedding);

    if (outcome === 'synced_new') {
      result.synced++;
      result.new_files.push(relPath);
    } else if (outcome === 'synced_updated') {
      result.synced++;
      result.updated_files.push(relPath);
    } else if (outcome === 'skipped') {
      result.skipped++;
    } else {
      result.failed++;
      result.errors.push(relPath);
    }
  }

  // Always sync git context so R.O.M.A.N. knows his branch and recent changes
  await syncGitContext();

  result.duration_ms = Date.now() - startTime;

  console.log(`[KnowledgeSync] Done — synced: ${result.synced}, skipped: ${result.skipped}, failed: ${result.failed} (${result.duration_ms}ms)`);
  return result;
}

/**
 * Format a sync result as a Discord message.
 */
export function formatSyncReport(result: SyncResult, mode: string): string {
  const lines: string[] = [
    `**R.O.M.A.N. Knowledge Sync Complete** (${mode})`,
    `\`${new Date().toISOString().split('T')[0]}\``,
    '',
    `**Synced:** ${result.synced} files | **Skipped (unchanged):** ${result.skipped} | **Failed:** ${result.failed}`,
    `**Duration:** ${(result.duration_ms / 1000).toFixed(1)}s`,
  ];

  if (result.new_files.length > 0) {
    lines.push('', `**New files added (${result.new_files.length}):**`);
    result.new_files.slice(0, 10).forEach(f => lines.push(`  + ${f}`));
    if (result.new_files.length > 10) lines.push(`  ...and ${result.new_files.length - 10} more`);
  }

  if (result.updated_files.length > 0) {
    lines.push('', `**Updated files (${result.updated_files.length}):**`);
    result.updated_files.slice(0, 10).forEach(f => lines.push(`  ~ ${f}`));
    if (result.updated_files.length > 10) lines.push(`  ...and ${result.updated_files.length - 10} more`);
  }

  if (result.failed > 0) {
    lines.push('', `**Failed:**`);
    result.errors.forEach(f => lines.push(`  ✗ ${f}`));
  }

  if (result.synced === 0 && result.failed === 0) {
    lines.push('', `*All files up to date — no changes detected.*`);
  }

  return lines.join('\n');
}

/**
 * Register a new file path to be tracked.
 * Call this when you add a new file that R.O.M.A.N. should know about.
 */
export function addToKnowledgeList(filePath: string): void {
  if (!KNOWLEDGE_FILES.includes(filePath)) {
    KNOWLEDGE_FILES.push(filePath);
    console.log(`[KnowledgeSync] Registered new file: ${filePath}`);
  }
}

/**
 * Get the total count of tracked files.
 */
export function getTrackedFileCount(): number {
  return KNOWLEDGE_FILES.length;
}
