/**
 * R.O.M.A.N. Knowledge Synchronization Script
 * Syncs IP_VAULT files to knowledge base via Chronicler edge function
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

// Priority files for R.O.M.A.N. IP awareness
const IP_FILES = [
    'IP_VAULT/07_LEGAL_PROTECTION/PATENT_CLAIMS.md',
    'IP_VAULT/07_LEGAL_PROTECTION/PATENT_CLAIMS_DETAILED.md',
    'IP_VAULT/03_SOVEREIGN_CONTAINER/PATENTS.md',
    'IP_VAULT/02_ARCHITECTURE_DOCS/roman_ai_architecture.md',
    'IP_VAULT/02_ARCHITECTURE_DOCS/qare_architecture.md',
    'IP_VAULT/FINAL_INVENTORY.md',
    'IP_VAULT/README.md',
    'ROMAN_2.0_HANDSHAKE_AUTHORIZATION.md',
    'docs/COPYRIGHT_HEADERS_GUIDE.md'
];

async function syncFile(relativePath) {
    const fullPath = path.join(__dirname, '..', relativePath);
    
    if (!fs.existsSync(fullPath)) {
        console.log(`⏭️  Skipping ${relativePath} (not found)`);
        return null;
    }
    
    const content = fs.readFileSync(fullPath, 'utf-8');
    const stats = fs.statSync(fullPath);
    
    console.log(`📤 Syncing: ${relativePath} (${stats.size} bytes)`);
    
    const metadata = {
        file_type: path.extname(relativePath),
        size_bytes: stats.size,
        last_modified: stats.mtime.toISOString(),
        category: relativePath.includes('IP_VAULT') ? 'intellectual_property' :
                 relativePath.includes('ROMAN') ? 'constitutional_framework' :
                 'documentation'
    };
    
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
        console.error(`   Details:`, JSON.stringify(error, null, 2));
        return null;
    }
    
    console.log(`✅ Synced: ${data.path}`);
    console.log(`   Digest: ${data.digest}`);
    return data;
}

async function syncAll() {
    console.log('🔮 R.O.M.A.N. KNOWLEDGE SYNCHRONIZATION');
    console.log('=' .repeat(60));
    console.log(`Target: ${IP_FILES.length} priority files`);
    console.log('');
    
    let synced = 0;
    let failed = 0;
    
    for (const filePath of IP_FILES) {
        const result = await syncFile(filePath);
        if (result) {
            synced++;
        } else {
            failed++;
        }
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('');
    console.log('=' .repeat(60));
    console.log(`✅ Synced: ${synced} files`);
    console.log(`❌ Failed: ${failed} files`);
    
    // Query knowledge base to verify
    console.log('');
    console.log('📊 Querying knowledge base...');
    const { data: kb, error: kbError } = await supabase
        .from('roman_knowledge_base')
        .select('file_path, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
    
    if (!kbError && kb) {
        console.log(`📚 Knowledge Base: ${kb.length} recent entries`);
        kb.forEach((entry, idx) => {
            console.log(`   ${idx + 1}. ${entry.file_path}`);
        });
    }
    
    console.log('');
    console.log('🧠 R.O.M.A.N. IP KNOWLEDGE: SYNCHRONIZED');
}

syncAll()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('❌ Sync failed:', err.message);
        process.exit(1);
    });
