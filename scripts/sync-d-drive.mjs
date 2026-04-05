/**
 * R.O.M.A.N. D-DRIVE SYNC
 * ========================
 * Scans the USB drive (D:\) and syncs all documents into roman_knowledge_base.
 * Supports: PDF, DOCX, TXT, MD, TS, JS
 * Skips: images, zips, system files
 *
 * Usage:
 *   node scripts/sync-d-drive.mjs           — full sync
 *   node scripts/sync-d-drive.mjs --dry-run  — list files only, no upload
 *   node scripts/sync-d-drive.mjs --folder "Bank America" — sync one folder/keyword
 *
 * © 2026 Howard Jones Bloodline Ancestral Trust
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// ─── Config ──────────────────────────────────────────────────────────────────
const DRIVE_PATH = 'D:\\';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const DRY_RUN = process.argv.includes('--dry-run');
const FOLDER_FILTER = (() => {
  const idx = process.argv.indexOf('--folder');
  return idx !== -1 ? process.argv[idx + 1]?.toLowerCase() : null;
})();

const SKIP_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.zip', '.rar', '.7z', '.exe', '.dll', '.sys', '.lnk']);
const SKIP_DIRS = new Set(['System Volume Information', '$RECYCLE.BIN', 'ilovepdf_compressed', 'pdf_pages']);
const MAX_FILE_SIZE_MB = 10;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── File readers ─────────────────────────────────────────────────────────────
async function readPDF(filePath) {
  try {
    const pdfParse = require('pdf-parse');
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text?.trim() || '';
  } catch (err) {
    return `[PDF parse error: ${err.message}]`;
  }
}

async function readDOCX(filePath) {
  try {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value?.trim() || '';
  } catch (err) {
    return `[DOCX parse error: ${err.message}]`;
  }
}

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8').trim();
  } catch (err) {
    return `[Read error: ${err.message}]`;
  }
}

async function extractContent(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.pdf') return await readPDF(filePath);
  if (ext === '.docx' || ext === '.doc') return await readDOCX(filePath);
  return readText(filePath);
}

// ─── Scan directory recursively ───────────────────────────────────────────────
function scanDirectory(dirPath, files = []) {
  let entries;
  try {
    entries = fs.readdirSync(dirPath);
  } catch {
    return files;
  }

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;

    const fullPath = path.join(dirPath, entry);
    let stat;
    try { stat = fs.statSync(fullPath); } catch { continue; }

    if (stat.isDirectory()) {
      scanDirectory(fullPath, files);
    } else if (stat.isFile()) {
      const ext = path.extname(entry).toLowerCase();
      if (SKIP_EXTENSIONS.has(ext)) continue;
      if (stat.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        console.log(`   ⚠️  Skipping large file (${(stat.size / 1024 / 1024).toFixed(1)}MB): ${entry}`);
        continue;
      }
      if (FOLDER_FILTER && !fullPath.toLowerCase().includes(FOLDER_FILTER)) continue;
      files.push(fullPath);
    }
  }
  return files;
}

// ─── Upload to Supabase ───────────────────────────────────────────────────────
async function upsertToKnowledgeBase(filePath, content) {
  if (!content || content.length < 10) return false;

  // Normalize path for consistent key
  const normalizedPath = `D-DRIVE/${path.relative(DRIVE_PATH, filePath).replace(/\\/g, '/')}`;

  const { error } = await supabase
    .from('roman_knowledge_base')
    .upsert({
      file_path: normalizedPath,
      content: content.slice(0, 100000), // 100k char limit per entry
      created_at: new Date().toISOString(),
    }, { onConflict: 'file_path' });

  if (error) {
    console.error(`   ❌ Upload failed for ${path.basename(filePath)}: ${error.message}`);
    return false;
  }
  return true;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🗂️  R.O.M.A.N. D-DRIVE SYNC');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (!fs.existsSync(DRIVE_PATH)) {
    console.error('❌ D:\\ not found. Make sure the USB drive is connected.');
    process.exit(1);
  }

  if (DRY_RUN) console.log('🔍 DRY RUN — listing files only, no upload\n');
  if (FOLDER_FILTER) console.log(`🔎 FILTER: only files containing "${FOLDER_FILTER}"\n`);

  console.log('📂 Scanning D:\\ ...');
  const files = scanDirectory(DRIVE_PATH);
  console.log(`   Found ${files.length} files to process\n`);

  if (DRY_RUN) {
    files.forEach(f => console.log(`   📄 ${path.relative(DRIVE_PATH, f)}`));
    console.log(`\n✅ Dry run complete — ${files.length} files found`);
    return;
  }

  let synced = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < files.length; i++) {
    const filePath = files[i];
    const fileName = path.basename(filePath);
    const progress = `[${i + 1}/${files.length}]`;

    process.stdout.write(`${progress} ${fileName} ... `);

    const content = await extractContent(filePath);

    if (!content || content.length < 10 || content.startsWith('[')) {
      console.log(`skipped (${content?.slice(0, 40) || 'empty'})`);
      skipped++;
      continue;
    }

    const ok = await upsertToKnowledgeBase(filePath, content);
    if (ok) {
      console.log(`✅ synced (${content.length.toLocaleString()} chars)`);
      synced++;
    } else {
      console.log(`❌ failed`);
      failed++;
    }

    // Small delay to avoid rate limiting Supabase
    if (i % 10 === 0 && i > 0) await new Promise(r => setTimeout(r, 200));
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ SYNC COMPLETE`);
  console.log(`   Synced:  ${synced} files`);
  console.log(`   Skipped: ${skipped} files`);
  console.log(`   Failed:  ${failed} files`);
  console.log(`   Total:   ${files.length} files processed`);
  console.log('\nR.O.M.A.N. now knows everything on D:\\');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
