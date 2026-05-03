/**
 * BULK SEED: Judgement of No Legal Accountability — All Volumes
 * =============================================================
 * Reads every .docx from the D drive folder, extracts text via mammoth,
 * saves as markdown to legal/, and upserts into roman_knowledge_base.
 * Checksum-based: skips files already current. Safe to re-run.
 *
 * Usage: node scripts/seed-judgement-volumes-bulk.mjs
 *
 * © 2026 Howard Jones Bloodline Ancestral Trust — UCC 1-308
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const mammoth = require('mammoth');
import { createClient } from '@supabase/supabase-js';
import { writeFileSync, readdirSync, mkdirSync, existsSync } from 'fs';
import { createHash } from 'crypto';
import { resolve, join } from 'path';
import dotenv from 'dotenv';
dotenv.config();

const SOURCE_DIR = 'D:\\Judgement of mo accountability volumes drive-download-20260503T010132Z-3-001';
const LEGAL_DIR  = resolve('legal');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function upsertKnowledgeBase(fileKey, content) {
  const checksum = createHash('md5').update(content).digest('hex');

  const { data: existing } = await supabase
    .from('roman_knowledge_base')
    .select('id, content')
    .eq('file_path', fileKey)
    .single();

  if (existing) {
    const existingChecksum = createHash('md5').update(existing.content).digest('hex');
    if (existingChecksum === checksum) return 'skipped';
    const { error } = await supabase
      .from('roman_knowledge_base')
      .update({ content, created_at: new Date().toISOString() })
      .eq('file_path', fileKey);
    if (error) throw new Error(error.message);
    return 'updated';
  } else {
    const { error } = await supabase
      .from('roman_knowledge_base')
      .insert({ file_path: fileKey, content, created_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    return 'inserted';
  }
}

async function run() {
  const files = readdirSync(SOURCE_DIR).filter(f => f.endsWith('.docx'));
  console.log(`\n📚 Found ${files.length} DOCX files in source folder\n`);

  const stats = { inserted: 0, updated: 0, skipped: 0, failed: 0 };

  for (const filename of files) {
    const docxPath = join(SOURCE_DIR, filename);
    // Sanitize for legal/ save path — strip (1) Google Drive duplicates marker
    const baseName  = filename.replace('.docx', '').replace(/\(1\)/g, '-copy');
    const mdName    = `${baseName}.md`;
    const savePath  = join(LEGAL_DIR, mdName);
    const fileKey   = `legal/${mdName}`;

    process.stdout.write(`  ${filename.padEnd(65)}`);

    try {
      const result  = await mammoth.extractRawText({ path: docxPath });
      const rawText = result.value;

      if (!rawText || rawText.trim().length < 50) {
        process.stdout.write('⚠️  empty\n');
        stats.failed++;
        continue;
      }

      const content = `# ${baseName.replace(/_/g, ' ')}
**Classification:** Legal Research | Sovereign Reference | Living Document
**R.O.M.A.N. Tag:** legal_drafting | sovereign_notice | fcra_response | accountability_doctrine | truth_standard
**Author:** Rickey Allan Howard / Howard Jones Bloodline Ancestral Trust
**Source:** Primary research document

---

${rawText}
`;

      writeFileSync(savePath, content, 'utf8');
      const outcome = await upsertKnowledgeBase(fileKey, content);
      stats[outcome]++;
      process.stdout.write(
        outcome === 'inserted' ? '✅ inserted\n' :
        outcome === 'updated'  ? '🔄 updated\n'  :
                                 '⏭️  current\n'
      );
    } catch (err) {
      process.stdout.write(`❌ ${err.message.slice(0, 60)}\n`);
      stats.failed++;
    }
  }

  console.log(`
════════════════════════════════════════════════
  JUDGEMENT VOLUMES SEED COMPLETE
════════════════════════════════════════════════
  ✅ Inserted : ${stats.inserted}
  🔄 Updated  : ${stats.updated}
  ⏭️  Skipped  : ${stats.skipped}
  ❌ Failed   : ${stats.failed}
  📁 Total    : ${files.length}
════════════════════════════════════════════════
  R.O.M.A.N. will reference all seeded volumes
  in legal drafting and accountability contexts.
════════════════════════════════════════════════
`);
}

run().catch(console.error);
