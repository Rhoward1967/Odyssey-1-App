/**
 * SYNC: Judgement of No Legal Accountability v24-1
 * =================================================
 * 1. Extracts text from D:\Judgement_of_No_Legal_Accountability_v24-1.docx
 * 2. Saves to legal/ in the repo
 * 3. Uploads directly to roman_knowledge_base with legal drafting tag
 *
 * Usage: node scripts/sync-judgement-v24.mjs
 *
 * © 2026 Howard Jones Bloodline Ancestral Trust — UCC 1-308
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const mammoth = require('mammoth');
import { createClient } from '@supabase/supabase-js';
import { writeFileSync, readFileSync } from 'fs';
import { createHash } from 'crypto';
import { resolve } from 'path';
import dotenv from 'dotenv';
dotenv.config();

const DOCX_PATH   = 'D:\\Judgement_of_No_Legal_Accountability_v24-1.docx';
const SAVE_PATH   = resolve('legal/Judgement_of_No_Legal_Accountability_v24-1.md');
const KB_FILE_KEY = 'legal/Judgement_of_No_Legal_Accountability_v24-1.md';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  // ─── Step 1: Extract text from docx ─────────────────────────────────────
  console.log('📄 Extracting text from docx...');
  const result = await mammoth.extractRawText({ path: DOCX_PATH });
  const rawText = result.value;

  if (!rawText || rawText.trim().length < 100) {
    console.error('❌ Extraction failed or document empty');
    process.exit(1);
  }
  console.log(`✅ Extracted ${rawText.length.toLocaleString()} characters`);

  // ─── Step 2: Build markdown wrapper ─────────────────────────────────────
  const content = `# Judgement of No Legal Accountability v24-1
**Classification:** Legal Research | Sovereign Reference | Living Document
**Version:** 24-1 | April 2026
**R.O.M.A.N. Tag:** legal_drafting | sovereign_notice | fcra_response | truth_standard
**Author:** Rickey Allan Howard / Howard Jones Bloodline Ancestral Trust
**Source:** Primary research document — 1787–2026 pattern analysis

---

${rawText}
`;

  // ─── Step 3: Save to legal/ in repo ────────────────────────────────────
  writeFileSync(SAVE_PATH, content, 'utf8');
  console.log(`✅ Saved to ${SAVE_PATH}`);

  // ─── Step 4: Upload to roman_knowledge_base ──────────────────────────────
  const checksum = createHash('md5').update(content).digest('hex');

  const { data: existing } = await supabase
    .from('roman_knowledge_base')
    .select('id, content')
    .eq('file_path', KB_FILE_KEY)
    .single();

  if (existing) {
    const existingChecksum = createHash('md5').update(existing.content).digest('hex');
    if (existingChecksum === checksum) {
      console.log('⏭️  Knowledge base already current — no upload needed');
      return;
    }
    // Update
    const { error } = await supabase
      .from('roman_knowledge_base')
      .update({ content, created_at: new Date().toISOString() })
      .eq('file_path', KB_FILE_KEY);
    if (error) { console.error('❌ Update failed:', error.message); process.exit(1); }
    console.log('✅ Knowledge base record updated');
  } else {
    // Insert
    const { error } = await supabase
      .from('roman_knowledge_base')
      .insert({ file_path: KB_FILE_KEY, content, created_at: new Date().toISOString() });
    if (error) { console.error('❌ Insert failed:', error.message); process.exit(1); }
    console.log('✅ Knowledge base record created');
  }

  console.log('\n🏛️  Judgement v24-1 is now live in R.O.M.A.N. knowledge base.');
  console.log('   Tagged for: legal_drafting | sovereign_notice | fcra_response');
  console.log('   R.O.M.A.N. will reference this in all legal draft contexts.');
}

run().catch(console.error);
