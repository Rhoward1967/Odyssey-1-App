/**
 * 📦 SOVEREIGN EXPORT: PREPARING THE MEMORY INJECTION
 * Run this in your current VS environment to package your data for the new 5090.
 * Usage: node scripts/sovereign-export.mjs
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function exportSovereignData() {
  console.log("🛡️ Initializing Sovereign Data Export...");

  const tables = [
    'customers',
    'bids',
    'invoices',
    'authorized_topics',
    'external_knowledge',
    'book_statistics'
  ];

  const exportPackage = {
    timestamp: new Date().toISOString(),
    version: "v1.0.0",
    data: {}
  };

  for (const table of tables) {
    console.log(`📡 Extracting ${table}...`);
    const { data, error } = await supabase.from(table).select('*');
    
    if (error) {
      console.error(`❌ Error extracting ${table}:`, error.message);
      continue;
    }
    
    exportPackage.data[table] = data;
    console.log(`✅ ${data.length} records captured from ${table}.`);
  }

  const fileName = `odyssey_sovereign_seed_${Date.now()}.json`;
  fs.writeFileSync(fileName, JSON.stringify(exportPackage, null, 2));

  console.log(`\n🏁 EXPORT COMPLETE: ${fileName}`);
  console.log("💾 Move this file to your External SSD to prepare for 5090 Injection.");
}

exportSovereignData();
