/**
 * R.O.M.A.N. OCR SCANNER
 * =======================
 * Extracts text from image-based (scanned) PDFs and PNG page folders
 * using Tesseract.js (local OCR — no API key, no cost).
 *
 * Priority order:
 *   1. Existing PNG folders in D:\pdf_pages\  (already extracted pages)
 *   2. Large scanned PDFs via pdfjs-dist → render pages → OCR each page
 *
 * Uploads extracted text to roman_knowledge_base.
 *
 * Usage:
 *   node scripts/ocr-scan.mjs               — process all
 *   node scripts/ocr-scan.mjs --dry-run     — list targets, no OCR
 *   node scripts/ocr-scan.mjs --pngs-only   — only process existing PNG folders
 *   node scripts/ocr-scan.mjs --file "Chase.pdf"  — single file
 *
 * © 2026 Howard Jones Bloodline Ancestral Trust — UCC 1-308
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { createRequire } from 'module';
import { config } from 'dotenv';

config();

const require = createRequire(import.meta.url);

const DRIVE_PATH  = 'D:\\';
const PNG_DIR     = 'D:\\pdf_pages';
const DRY_RUN     = process.argv.includes('--dry-run');
const PNGS_ONLY   = process.argv.includes('--pngs-only');
const FILE_FILTER = (() => {
  const idx = process.argv.indexOf('--file');
  return idx !== -1 ? process.argv[idx + 1]?.toLowerCase() : null;
})();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase     = DRY_RUN ? null : createClient(SUPABASE_URL, SUPABASE_KEY);

// Scanned PDFs that need OCR (known image-based files on D drive)
const SCANNED_PDFS = [
  'RickeyHoward.pdf',
  'Equifax Information Responses.pdf',
  'Amazon Chase.pdf',
  'Chase.pdf',
  'Chase (1).pdf',
  'Chase (2).pdf',
  'Chase (3).pdf',
  'Chase (4).pdf',
  'Chase (5).pdf',
  'Chase (6).pdf',
  'Chase (7).pdf',
  'Amex.pdf',
  'Trans Union Response.pdf',
  'Signed Formal Notice to Debt Validity (1).pdf',
  'Patent Assignment Recordation.pdf',
  'Bank America Notices Response Letters.pdf',
  'Bank America Signed Letter ( Address Updated).pdf',
  'AFFIDAVIT OF NOTICE AND RESERVATION OF RIGHTS.pdf',
  'NOTICE OF PUBLIC REORD.pdf',
  'Howard Symbolic Notation System Notarized Copy.pdf',
  'Legal Memorandum Notarized Copy.pdf',
  'GA Attorney General Certified mail signature card.pdf',
  'Notary Certificate.pdf',
];

// ─── OCR a single image file ──────────────────────────────────────────────────

async function ocrImage(imagePath) {
  const Tesseract = require('tesseract.js');
  const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', {
    logger: () => {},  // suppress progress logs
  });
  return text?.trim() || '';
}

// ─── OCR a folder of PNG pages ────────────────────────────────────────────────

async function ocrPngFolder(folderPath, label) {
  const pngs = fs.readdirSync(folderPath)
    .filter(f => /\.(png|jpg|jpeg)$/i.test(f))
    .sort()
    .map(f => path.join(folderPath, f));

  if (pngs.length === 0) return '';

  console.log(`   📄 ${pngs.length} pages found in ${label}`);
  const pages = [];

  for (let i = 0; i < pngs.length; i++) {
    process.stdout.write(`      Page ${i + 1}/${pngs.length} ... `);
    try {
      const text = await ocrImage(pngs[i]);
      if (text.length > 20) {
        pages.push(text);
        console.log(`✅ (${text.length} chars)`);
      } else {
        console.log(`skipped (blank)`);
      }
    } catch (err) {
      console.log(`❌ ${err.message}`);
    }
  }

  return pages.join('\n\n--- PAGE BREAK ---\n\n');
}

// ─── OCR a scanned PDF via pdfjs-dist ────────────────────────────────────────

async function ocrPdf(filePath) {
  // Dynamically import pdfjs-dist (ESM)
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs').catch(() => null);
  if (!pdfjsLib) {
    return { text: '', error: 'pdfjs-dist not available' };
  }

  // Disable worker for Node.js
  pdfjsLib.GlobalWorkerOptions = pdfjsLib.GlobalWorkerOptions || {};
  pdfjsLib.GlobalWorkerOptions.workerSrc = '';

  try {
    const data      = new Uint8Array(fs.readFileSync(filePath));
    const loadingTask = pdfjsLib.getDocument({ data, useWorkerFetch: false, isEvalSupported: false, useSystemFonts: true });
    const pdf       = await loadingTask.promise;
    const numPages  = pdf.numPages;

    console.log(`   📄 ${numPages} pages in PDF`);

    const { createCanvas } = await import('canvas').catch(() => ({ createCanvas: null }));
    if (!createCanvas) {
      return { text: '', error: 'canvas package not available — install with: npm install canvas' };
    }

    const pages = [];
    for (let i = 1; i <= Math.min(numPages, 30); i++) {  // cap at 30 pages per doc
      process.stdout.write(`      Page ${i}/${Math.min(numPages, 30)} ... `);
      try {
        const page     = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });  // 2x scale for better OCR
        const canvas   = createCanvas(viewport.width, viewport.height);
        const context  = canvas.getContext('2d');

        await page.render({ canvasContext: context, viewport }).promise;

        const imageBuffer = canvas.toBuffer('image/png');
        const tmpPath     = path.join(process.env.TEMP || 'C:\\Temp', `ocr_page_${i}.png`);
        fs.writeFileSync(tmpPath, imageBuffer);

        const text = await ocrImage(tmpPath);
        fs.unlinkSync(tmpPath);  // cleanup

        if (text.length > 20) {
          pages.push(text);
          console.log(`✅ (${text.length} chars)`);
        } else {
          console.log(`skipped (blank)`);
        }
      } catch (err) {
        console.log(`❌ ${err.message}`);
      }
    }

    return { text: pages.join('\n\n--- PAGE BREAK ---\n\n'), error: null };
  } catch (err) {
    return { text: '', error: err.message };
  }
}

// ─── Upload to knowledge base ─────────────────────────────────────────────────

async function uploadToKnowledgeBase(label, content) {
  if (!content || content.length < 50) return false;

  const { error } = await supabase
    .from('roman_knowledge_base')
    .upsert({
      file_path:  `D-DRIVE-OCR/${label}`,
      content:    content.slice(0, 100000),
      created_at: new Date().toISOString(),
    }, { onConflict: 'file_path' });

  return !error;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🔍  R.O.M.A.N. OCR SCANNER');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (DRY_RUN) console.log('🔍 DRY RUN — no upload\n');

  let synced  = 0;
  let failed  = 0;
  let skipped = 0;

  // ── Step 1: Process existing PNG page folders ────────────────────────────
  console.log('\n📂 STEP 1: Existing PNG folders in D:\\pdf_pages\\\n');

  if (fs.existsSync(PNG_DIR)) {
    const folders = fs.readdirSync(PNG_DIR).filter(f => {
      const full = path.join(PNG_DIR, f);
      return fs.statSync(full).isDirectory();
    });

    // Also check root pdf_pages for loose PNGs
    const rootPngs = fs.readdirSync(PNG_DIR).filter(f => /\.(png|jpg)$/i.test(f));
    if (rootPngs.length > 0) folders.push('.');

    for (const folder of folders) {
      const folderPath = folder === '.' ? PNG_DIR : path.join(PNG_DIR, folder);
      const label      = folder === '.' ? 'pdf_pages (root)' : folder;

      if (FILE_FILTER && !label.toLowerCase().includes(FILE_FILTER)) continue;

      console.log(`\n🗂️  Processing: ${label}`);

      if (DRY_RUN) {
        const pngs = fs.readdirSync(folderPath).filter(f => /\.(png|jpg)$/i.test(f));
        console.log(`   Would OCR ${pngs.length} images`);
        continue;
      }

      const text = await ocrPngFolder(folderPath, label);
      if (text.length > 50) {
        const ok = await uploadToKnowledgeBase(label, text);
        if (ok) {
          console.log(`   ✅ Uploaded ${text.length.toLocaleString()} chars → roman_knowledge_base`);
          synced++;
        } else {
          console.log(`   ❌ Upload failed`);
          failed++;
        }
      } else {
        console.log(`   ⚠️  No text extracted`);
        skipped++;
      }
    }
  } else {
    console.log('   D:\\pdf_pages not found — skipping PNG step');
  }

  // ── Step 2: Scanned PDFs ─────────────────────────────────────────────────
  if (!PNGS_ONLY) {
    console.log('\n📂 STEP 2: Scanned PDF files\n');

    const pdfsToProcess = FILE_FILTER
      ? SCANNED_PDFS.filter(f => f.toLowerCase().includes(FILE_FILTER))
      : SCANNED_PDFS;

    for (const fileName of pdfsToProcess) {
      const filePath = path.join(DRIVE_PATH, fileName);
      if (!fs.existsSync(filePath)) {
        console.log(`   ⚠️  Not found: ${fileName}`);
        continue;
      }

      console.log(`\n📄 ${fileName}`);

      if (DRY_RUN) {
        const stat = fs.statSync(filePath);
        console.log(`   Would OCR (${(stat.size / 1024 / 1024).toFixed(1)}MB)`);
        continue;
      }

      const { text, error } = await ocrPdf(filePath);

      if (error) {
        console.log(`   ❌ ${error}`);
        failed++;
        continue;
      }

      if (text.length > 50) {
        const ok = await uploadToKnowledgeBase(fileName, text);
        if (ok) {
          console.log(`   ✅ Uploaded ${text.length.toLocaleString()} chars`);
          synced++;
        } else {
          console.log(`   ❌ Upload failed`);
          failed++;
        }
      } else {
        console.log(`   ⚠️  No text extracted`);
        skipped++;
      }
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ OCR SCAN COMPLETE`);
  console.log(`   Synced:  ${synced}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Failed:  ${failed}`);
  console.log('\nR.O.M.A.N. can now read your scanned documents.');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
