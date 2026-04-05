/**
 * Sync all services, pages, and edge functions into roman_knowledge_base
 * Fills the gap from the initial 180-file sync
 */
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');

const sb = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

const FILES = [
  // === ALL SERVICES ===
  'src/services/academicSearchService.ts',
  'src/services/aiActivityLogger.ts',
  'src/services/aiComplianceService.ts',
  'src/services/aiService.ts',
  'src/services/antiWeaponization.ts',
  'src/services/authService.ts',
  'src/services/botOptimizationService.ts',
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
  'src/services/discord-bot.ts',
  'src/services/documentReviewService.ts',
  'src/services/emailService.ts',
  'src/services/EnhancedConsensusEngine.ts',
  'src/services/evidenceService.ts',
  'src/services/ExecutionEngine.ts',
  'src/services/fileUploadService.ts',
  'src/services/gpt.ts',
  'src/services/insuranceGapAnalyzer.ts',
  'src/services/isAdmin.ts',
  'src/services/LogicalHemisphere.ts',
  'src/services/logSystemActivity.ts',
  'src/services/marketDataService.ts',
  'src/services/MultiAgentConsensus.ts',
  'src/services/ndaGenerator.ts',
  'src/services/openai.ts',
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
  'src/services/RomanAutoFixEngine.ts',
  'src/services/RomanAutonomousInit.ts',
  'src/services/romanBadgeOfSlaveryDiagnostic.ts',
  'src/services/RomanBusinessEntityLoader.ts',
  'src/services/RomanCodebaseAwareness.ts',
  'src/services/RomanConstitutionalAPI.ts',
  'src/services/RomanDatabaseKnowledge.ts',
  'src/services/roman-deep-learning.ts',
  'src/services/romanIPAwarePrompt.ts',
  'src/services/RomanKnowledgeIntegration.ts',
  'src/services/romanKnowledgeSync.ts',
  'src/services/RomanLearningDaemon.ts',
  'src/services/romanLegalService.ts',
  'src/services/romanPaperbackApi.ts',
  'src/services/RomanProtocolMaster.ts',
  'src/services/RomanProtocolNode.ts',
  'src/services/romanSubtextAnalyzer.ts',
  'src/services/romanUniversalMathTraining.ts',
  'src/services/samGovService.ts',
  'src/services/schedulingService.ts',
  'src/services/secEdgarService.ts',
  'src/services/securityService.ts',
  'src/services/SovereignCoreOrchestrator.ts',
  'src/services/SovereignFrequencyLicensing.ts',
  'src/services/sovereignFrequencyLogger.ts',
  'src/services/strategicPaymentAnalyzer.ts',
  'src/services/studyGroupService.ts',
  'src/services/SynchronizationLayer.ts',
  'src/services/systemTelemetry.ts',
  'src/services/taxCalculationService.ts',
  'src/services/universalMathExplainer.ts',
  'src/services/usageTrackingService.ts',
  'src/services/uspsTrackingService.ts',
  'src/services/web3Service.ts',

  // === ALL PAGES ===
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

  // === APP ROOT ===
  'src/App.tsx',
  'src/main.tsx',
  'src/lib/supabaseClient.ts',

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
];

function md5(c) { return createHash('md5').update(c).digest('hex'); }
function getType(f) {
  if (f.includes('supabase/functions/')) return 'edge_functions';
  if (f.includes('src/pages/') || f.includes('App.tsx') || f.includes('main.tsx')) return 'ui_components';
  if (f.includes('src/services/') || f.includes('src/lib/')) return 'codebase';
  return 'documentation';
}

async function run() {
  console.log('Syncing', FILES.length, 'files...\n');
  let synced = 0, skipped = 0, failed = 0;

  for (const rel of FILES) {
    const abs = join(ROOT, rel);
    if (!existsSync(abs)) {
      process.stdout.write('_');
      skipped++;
      continue;
    }
    let content;
    try { content = readFileSync(abs, 'utf-8'); } catch { failed++; continue; }

    const { error } = await sb.from('roman_knowledge_base').upsert({
      file_path: rel,
      content: content.slice(0, 500000),
      file_type: getType(rel),
      checksum: md5(content),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'file_path' });

    if (error) { console.log('\nFAIL:', rel, '-', error.message); failed++; }
    else { process.stdout.write('+'); synced++; }
  }

  const { count } = await sb.from('roman_knowledge_base').select('*', { count: 'exact', head: true });
  console.log('\n\nSynced:', synced, '| Not found:', skipped, '| Failed:', failed);
  console.log('TOTAL entries in roman_knowledge_base:', count);
  console.log('R.O.M.A.N. now has full system coverage.');
}

run().catch(console.error);
