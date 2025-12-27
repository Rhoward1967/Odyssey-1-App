/**
 * R.O.M.A.N. CODEBASE KNOWLEDGE SYNCHRONIZATION
 * "Know the entire house" - Syncs frontend/backend to knowledge base
 * 
 * R.O.M.A.N. must understand:
 * - Frontend: Components, Pages, UI architecture
 * - Backend: Services, business logic, integrations
 * - Constitutional: How code implements Four Laws and Nine Principles
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// CRITICAL CODEBASE FILES - R.O.M.A.N.'s "house knowledge"
const CODEBASE_FILES = [
    // === CONSTITUTIONAL CORE ===
    'src/services/RomanProtocolMaster.ts',
    'src/services/RomanConstitutionalAPI.ts',
    'src/services/roman-auto-audit.ts',
    'src/services/romanIPAwarePrompt.ts',
    'src/services/RomanDatabaseKnowledge.ts',
    'src/services/RomanKnowledgeIntegration.ts',
    'src/services/RomanSystemContext.ts',
    'src/services/romanSupabase.ts',
    
    // === AI/ML SERVICES ===
    'src/services/aiService.ts',
    'src/services/realOpenAI.ts',
    'src/services/gpt.ts',
    'src/services/aiActivityLogger.ts',
    'src/services/aiComplianceService.ts',
    'src/services/patternLearningEngine.ts',
    'src/services/RomanLearningEngine.ts',
    
    // === DISCORD BOT (Primary Interface) ===
    'src/services/discord-bot.ts',
    
    // === BUSINESS LOGIC ===
    'src/services/bidProposalService.ts',
    'src/services/emailService.ts',
    'src/services/authService.ts',
    'src/services/calendarService.ts',
    'src/services/schedulingService.ts',
    'src/services/contractorService.ts',
    
    // === FINANCIAL SYSTEMS ===
    'src/services/CostControlOrchestrator.ts',
    'src/services/MelFinancialGovernor.ts',
    'src/services/payrollReconciliationService.ts',
    'src/services/taxCalculationService.ts',
    
    // === PATENT SYSTEMS ===
    'src/services/patentManager.ts',
    'src/services/patentGenerator.ts',
    'src/services/patentDeadlineTracker.ts',
    'src/services/patentFilingPackage.ts',
    
    // === TRADING/WEB3 ===
    'src/services/RobustTradingService.ts',
    'src/services/web3Service.ts',
    'src/services/marketDataService.ts',
    
    // === FRONTEND PAGES (User-Facing) ===
    'src/pages/Index.tsx',
    'src/pages/Admin.tsx',
    'src/pages/BiddingCalculator.tsx',
    'src/pages/CustomerManagement.tsx',
    'src/pages/HRDashboard.tsx',
    'src/pages/Trading.tsx',
    'src/pages/Research.tsx',
    
    // === KEY COMPONENTS ===
    'src/components/RomanDashboard.tsx',
    'src/components/RomanKnowledgeDashboard.tsx',
    'src/components/AdminDashboard.tsx',
    'src/components/BiddingCalculator.tsx',
    'src/components/AIAssistantChat.tsx',
    'src/components/ActiveTimeClock.tsx',
    'src/components/CustomerManagement.tsx',
    
    // === APP CORE ===
    'src/App.tsx',
    'src/main.tsx',
    
    // === CONFIGURATION ===
    'vite.config.ts',
    'tsconfig.json',
    'package.json',
    '.env.example'
];

async function syncFile(relativePath) {
    const fullPath = path.join(__dirname, '..', relativePath);
    
    if (!fs.existsSync(fullPath)) {
        console.log(`⏭️  Skipping ${relativePath} (not found)`);
        return null;
    }
    
    const content = fs.readFileSync(fullPath, 'utf-8');
    const stats = fs.statSync(fullPath);
    const fileSize = stats.size;
    
    // Skip very large files (>500KB)
    if (fileSize > 500000) {
        console.log(`⏭️  Skipping ${relativePath} (${fileSize} bytes - too large)`);
        return null;
    }
    
    console.log(`📤 Syncing: ${relativePath} (${fileSize} bytes)`);
    
    // Categorize file type
    let category = 'documentation';
    if (relativePath.includes('Roman') || relativePath.includes('roman')) {
        category = 'constitutional_framework';
    } else if (relativePath.includes('src/services')) {
        category = 'backend_service';
    } else if (relativePath.includes('src/components')) {
        category = 'frontend_component';
    } else if (relativePath.includes('src/pages')) {
        category = 'frontend_page';
    } else if (relativePath.includes('patent')) {
        category = 'intellectual_property';
    } else if (relativePath.endsWith('.json') || relativePath.endsWith('.config')) {
        category = 'configuration';
    }
    
    const metadata = {
        file_type: path.extname(relativePath),
        size_bytes: fileSize,
        last_modified: stats.mtime.toISOString(),
        category: category,
        is_frontend: relativePath.includes('components') || relativePath.includes('pages'),
        is_backend: relativePath.includes('services') || relativePath.includes('supabase'),
        is_constitutional: relativePath.toLowerCase().includes('roman'),
        language: relativePath.endsWith('.ts') || relativePath.endsWith('.tsx') ? 'typescript' : 
                 relativePath.endsWith('.js') || relativePath.endsWith('.jsx') ? 'javascript' :
                 relativePath.endsWith('.json') ? 'json' : 'other'
    };
    
    try {
        // Call the Chronicler edge function
        const { data, error } = await supabase.functions.invoke('roman-knowledge-sync', {
            body: {
                filePath: relativePath,
                content: content,
                metadata: metadata
            }
        });
        
        if (error) {
            console.error(`❌ Error syncing ${relativePath}:`, error.message);
            return null;
        }
        
        console.log(`✅ Synced: ${data.path}`);
        if (data.digest && data.digest.length < 120) {
            console.log(`   ${data.digest}`);
        }
        return data;
    } catch (err) {
        console.error(`❌ Exception syncing ${relativePath}:`, err.message);
        return null;
    }
}

async function syncAll() {
    console.log('🏛️  R.O.M.A.N. CODEBASE SYNCHRONIZATION');
    console.log('   "Know the entire house - frontend and backend"');
    console.log('=' .repeat(70));
    console.log(`📦 Target: ${CODEBASE_FILES.length} critical files`);
    console.log('');
    
    let synced = 0;
    let failed = 0;
    let skipped = 0;
    
    for (const filePath of CODEBASE_FILES) {
        const result = await syncFile(filePath);
        if (result) {
            synced++;
        } else if (result === null) {
            const fullPath = path.join(__dirname, '..', filePath);
            if (fs.existsSync(fullPath)) {
                failed++;
            } else {
                skipped++;
            }
        }
        // Delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    console.log('');
    console.log('=' .repeat(70));
    console.log(`✅ Synced: ${synced} files`);
    console.log(`❌ Failed: ${failed} files`);
    console.log(`⏭️  Skipped: ${skipped} files (not found)`);
    
    // Query knowledge base statistics
    console.log('');
    console.log('📊 Querying knowledge base statistics...');
    
    const { data: kb, error: kbError } = await supabase
        .from('roman_knowledge_base')
        .select('file_path, created_at, metadata')
        .order('created_at', { ascending: false });
    
    if (!kbError && kb) {
        const total = kb.length;
        const constitutional = kb.filter(f => f.metadata?.is_constitutional).length;
        const frontend = kb.filter(f => f.metadata?.is_frontend).length;
        const backend = kb.filter(f => f.metadata?.is_backend).length;
        const ip = kb.filter(f => f.metadata?.category === 'intellectual_property').length;
        
        console.log('');
        console.log('📚 KNOWLEDGE BASE COMPOSITION:');
        console.log(`   Total Files: ${total}`);
        console.log(`   Constitutional: ${constitutional}`);
        console.log(`   Frontend: ${frontend}`);
        console.log(`   Backend: ${backend}`);
        console.log(`   IP/Legal: ${ip}`);
        
        console.log('');
        console.log('📝 Recent Entries:');
        kb.slice(0, 15).forEach((entry, idx) => {
            const cat = entry.metadata?.category || 'unknown';
            console.log(`   ${idx + 1}. [${cat}] ${entry.file_path}`);
        });
    }
    
    console.log('');
    console.log('🧠 R.O.M.A.N. NOW KNOWS THE ENTIRE HOUSE');
    console.log('   Frontend ✅ | Backend ✅ | Constitutional ✅');
}

syncAll()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('❌ Sync failed:', err.message);
        console.error(err.stack);
        process.exit(1);
    });
