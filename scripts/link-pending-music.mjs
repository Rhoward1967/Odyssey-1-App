/**
 * LINK & UPLOAD SOVEREIGN MUSIC CATALOG
 * ======================================
 * 1. Scans D: drive for all audio files
 * 2. Inserts any NEW tracks not yet in the DB
 * 3. Uploads all pending tracks to Supabase Storage
 * 4. Updates storage_url so the radio player can stream them
 *
 * Usage:
 *   node scripts/link-pending-music.mjs             — full run
 *   node scripts/link-pending-music.mjs --dry-run   — show matches, no upload
 *
 * © 2026 Howard Jones Bloodline Ancestral Trust — UCC 1-308
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const MUSIC_DIRS = [
  'D:\\',
  'D:\\Blieving Selfdrive-download-20260406T005418Z-1-001',
];
const BUCKET = 'sovereign-music';
const DRY_RUN   = process.argv.includes('--dry-run');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
                  || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
                  || process.env.SUPABASE_SERVICE_ROLE;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Normalize for fuzzy comparison ──────────────────────────────────────────
function normalize(str) {
  return str
    .toLowerCase()
    .replace(/[''`]/g, "'")
    .replace(/\s*\(\d+\)\s*$/, '')
    .replace(/\s*\(remastered\)\s*/ig, '')
    .replace(/\s*original\s*$/i, '')
    .replace(/\bshawdow\b/gi, 'shadow')
    .replace(/\bi_ll\b|i ll\b/gi, "i'll")
    .replace(/_/g, ' ')
    .replace(/[^a-z0-9' ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── Title case a normalized string ──────────────────────────────────────────
function titleCase(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

// ─── Deduplicate files — prefer no suffix over (1), (2); prefer original ────
function deduplicateFiles(files) {
  const groups = {};
  for (const f of files) {
    const base = normalize(path.basename(f, path.extname(f)));
    if (!groups[base]) groups[base] = [];
    groups[base].push(f);
  }
  const result = [];
  for (const group of Object.values(groups)) {
    // Prefer the file without (1)/(2) suffix in the original name
    const clean = group.find(f => !/\(\d+\)/.test(f)) ?? group[0];
    result.push(clean);
  }
  return result;
}

async function main() {
  console.log('\n🎵  SOVEREIGN MUSIC — LINK & UPLOAD');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ SUPABASE_URL or service role key not set in .env');
    process.exit(1);
  }

  // 1. Scan all music directories
  const rawFiles = [];
  for (const dir of MUSIC_DIRS) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir)
      .filter(f => /\.(mp3|wav|flac|m4a|aac)$/i.test(f))
      .map(f => path.join(dir, f));
    rawFiles.push(...files);
  }
  const audioFiles = deduplicateFiles(rawFiles.map(f => path.basename(f)))
    .map(f => {
      // Re-resolve to full path — prefer root, then subfolder
      for (const dir of MUSIC_DIRS) {
        const full = path.join(dir, f);
        if (fs.existsSync(full)) return full;
      }
      return f;
    });
  console.log(`\n📂 ${rawFiles.length} audio files on D: drive (${audioFiles.length} after dedup)\n`);

  // 2. Get all existing DB titles
  const { data: existing, error: dbErr } = await supabase
    .from('sovereign_music')
    .select('id, title, upload_status, storage_url');

  if (dbErr) { console.error('❌ DB error:', dbErr.message); process.exit(1); }

  const existingNorm = new Set((existing || []).map(t => normalize(t.title)));

  // 3. Find files that have NO DB entry — these are new tracks to insert
  const newFiles = audioFiles.filter(f => {
    const norm = normalize(path.basename(f, path.extname(f)));
    return !existingNorm.has(norm);
  });

  if (newFiles.length > 0) {
    console.log(`── NEW TRACKS TO ADD (${newFiles.length}) ────────────────`);
    newFiles.forEach(f => console.log(`  + ${f}`));

    if (!DRY_RUN) {
      const inserts = newFiles.map(f => ({
        title: titleCase(normalize(path.basename(f, path.extname(f)))),
        upload_status: 'pending',
        radio_approved: true,
        registered_under: 'Believing Self Creations',
        copyright_year: 2026,
        file_format: path.extname(f).replace('.', '').toLowerCase(),
      }));

      const { error: insErr } = await supabase.from('sovereign_music').insert(inserts);
      if (insErr) console.error('  ❌ Insert error:', insErr.message);
      else console.log(`  ✅ Inserted ${inserts.length} new tracks\n`);
    } else {
      console.log('  (dry run — not inserting)\n');
    }
  }

  // 4. Re-fetch all tracks missing a storage_url (regardless of status)
  const { data: pending } = await supabase
    .from('sovereign_music')
    .select('id, title, upload_status')
    .is('storage_url', null);

  if (!pending?.length) {
    console.log('✅ All tracks already have storage URLs — radio ready!');
    return;
  }

  console.log(`\n── MATCHING ${pending.length} TRACKS WITHOUT AUDIO URL ──────────────`);

  // 5. Match each pending track to a file
  const matches   = [];
  const unmatched = [];

  for (const track of pending) {
    const needle = normalize(track.title);
    let file = audioFiles.find(f => normalize(path.basename(f, path.extname(f))) === needle);

    if (!file) {
      // partial match: all significant words present
      const words = needle.split(' ').filter(w => w.length > 2);
      file = audioFiles.find(f => {
        const fn = normalize(path.basename(f, path.extname(f)));
        return words.length > 0 && words.every(w => fn.includes(w));
      });
    }

    if (file) {
      const sizeMb = (fs.statSync(file).size / 1024 / 1024).toFixed(2);
      console.log(`  ✅ "${track.title}"`);
      console.log(`     → ${path.basename(file)}  [${sizeMb}MB]`);
      matches.push({ track, file });
    } else {
      console.log(`  ❌ "${track.title}" — no matching file`);
      unmatched.push(track.title);
    }
  }

  console.log(`\n   Matched: ${matches.length} / ${pending.length}`);

  if (DRY_RUN) {
    console.log('\n🔍 DRY RUN complete — remove --dry-run to upload.\n');
    return;
  }

  if (matches.length === 0) {
    console.log('\n⚠️  Nothing to upload.\n');
    return;
  }

  // 6. Upload + UPDATE each matched track
  console.log('\n── UPLOADING ────────────────────────────────');
  let uploaded = 0, failed = 0;

  for (const m of matches) {
    const filePath    = m.file;
    const baseName    = path.basename(m.file);
    const ext         = path.extname(m.file).replace('.', '').toLowerCase();
    const storagePath = `music/${baseName}`;
    const sizeMb      = Math.round((fs.statSync(filePath).size / 1024 / 1024) * 100) / 100;
    const contentType = ext === 'mp3' ? 'audio/mpeg'
                      : ext === 'wav' ? 'audio/wav'
                      : ext === 'flac' ? 'audio/flac' : 'audio/mpeg';

    process.stdout.write(`  [${uploaded + failed + 1}/${matches.length}] "${m.track.title}" ... `);

    try {
      const buffer = fs.readFileSync(filePath);

      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, buffer, { contentType, upsert: true });

      if (uploadErr) throw new Error(`Storage: ${uploadErr.message}`);

      const { data: urlData, error: urlErr } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(storagePath, 60 * 60 * 24 * 365);

      if (urlErr) throw new Error(`URL: ${urlErr.message}`);

      const { error: updateErr } = await supabase
        .from('sovereign_music')
        .update({
          storage_path:   storagePath,
          storage_url:    urlData.signedUrl,
          file_format:    ext,
          file_size_mb:   sizeMb,
          upload_status:  'live',
          radio_approved: true,
        })
        .eq('id', m.track.id);

      if (updateErr) throw new Error(`DB: ${updateErr.message}`);

      console.log('✅');
      uploaded++;
    } catch (err) {
      console.log(`❌ ${err.message}`);
      failed++;
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ DONE  |  Uploaded: ${uploaded}  |  Failed: ${failed}  |  Unmatched: ${unmatched.length}`);
  if (unmatched.length) {
    console.log('\n   Still pending — no file found:');
    unmatched.forEach(t => console.log(`     • ${t}`));
  }
  console.log('');
}

main().catch(err => {
  console.error('\n❌ Fatal:', err.message);
  process.exit(1);
});
