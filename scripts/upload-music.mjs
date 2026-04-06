/**
 * BELIEVING SELF CREATIONS — MUSIC UPLOADER
 * ==========================================
 * Scans D:\Blieving Selfdrive-download-20260406T005418Z-1-001
 * Deduplicates tracks (picks largest file per title)
 * Uploads to Supabase Storage → sovereign-music bucket
 * Upserts metadata to sovereign_music table
 *
 * Usage:
 *   node scripts/upload-music.mjs             — full upload
 *   node scripts/upload-music.mjs --dry-run   — list only, no upload
 *
 * © 2026 Howard Jones Bloodline Ancestral Trust — UCC 1-308
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const MUSIC_DIR   = 'D:\\Blieving Selfdrive-download-20260406T005418Z-1-001';
const BUCKET      = 'sovereign-music';
const DRY_RUN     = process.argv.includes('--dry-run');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = DRY_RUN ? null : createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Clean title from filename ────────────────────────────────────────────────

function cleanTitle(filename) {
  return path.basename(filename, path.extname(filename))
    .replace(/\s*\(\d+\)\s*$/, '')          // remove trailing (1), (2) etc
    .replace(/\s*\(Remastered\)\s*/i, '')   // remove (Remastered)
    .replace(/^\(Shawdow\)$/i, 'Shadow')    // fix (Shawdow) → Shadow
    .replace(/\bShawdow\b/i, 'Shadow')      // fix Shawdow anywhere
    .replace(/\bI_ll\b|I ll\b/gi, "I'll")  // fix I_ll / I ll → I'll
    .replace(/_/g, ' ')                     // underscores to spaces
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── Theme classifier ─────────────────────────────────────────────────────────

function classifyTheme(title) {
  const t = title.toLowerCase();
  if (/trust|faith|will|nature|creator|spirit/i.test(t))  return { theme: 'spiritual',    freq: 528 };
  if (/love|heart|home|coming|giving/i.test(t))           return { theme: 'love',          freq: 528 };
  if (/water|stand|away|far/i.test(t))                    return { theme: 'spiritual',    freq: 741 };
  if (/moving|shadow|whisper|dark/i.test(t))              return { theme: 'healing',       freq: 432 };
  if (/flex|sovereign|truth/i.test(t))                    return { theme: 'sovereignty',   freq: 741 };
  return { theme: 'spiritual', freq: 528 };
}

// ─── Group by base title — number versions 1, 2 if multiples ────────────────

function resolveVersions(files) {
  const groups = new Map();
  for (const f of files) {
    const base = cleanTitle(f.name).toLowerCase();
    if (!groups.has(base)) groups.set(base, []);
    groups.get(base).push(f);
  }

  const result = [];
  for (const [, group] of groups) {
    if (group.length === 1) {
      result.push({ ...group[0], cleanTitle: cleanTitle(group[0].name) });
    } else {
      // Sort largest first so version 1 = best quality
      group.sort((a, b) => b.size - a.size);
      group.forEach((f, i) => {
        result.push({ ...f, cleanTitle: `${cleanTitle(f.name)} ${i + 1}` });
      });
    }
  }
  return result;
}

// ─── Scan ─────────────────────────────────────────────────────────────────────

function scanMusicDir() {
  const entries = fs.readdirSync(MUSIC_DIR);
  return entries
    .filter(f => /\.(mp3|wav|flac|m4a|aac)$/i.test(f))
    .map(f => {
      const full = path.join(MUSIC_DIR, f);
      const stat = fs.statSync(full);
      return { name: f, fullPath: full, size: stat.size };
    });
}

// ─── Upload to Supabase Storage ───────────────────────────────────────────────

async function uploadFile(filePath, storagePath) {
  const buffer = fs.readFileSync(filePath);
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: 'audio/mpeg',
      upsert: true,
    });
  if (error) throw new Error(error.message);
}

// ─── Get public/signed URL ────────────────────────────────────────────────────

async function getSignedUrl(storagePath) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 60 * 60 * 24 * 365); // 1 year
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

// ─── Upsert to sovereign_music ────────────────────────────────────────────────

async function upsertTrack(track) {
  const { error } = await supabase
    .from('sovereign_music')
    .insert(track);
  if (error) throw new Error(error.message);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🎵  BELIEVING SELF CREATIONS — MUSIC UPLOADER');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (!fs.existsSync(MUSIC_DIR)) {
    console.error(`❌ Music folder not found: ${MUSIC_DIR}`);
    process.exit(1);
  }

  const allFiles = scanMusicDir();
  const unique   = resolveVersions(allFiles);

  console.log(`📂 Found ${allFiles.length} audio files → ${unique.length} tracks (versions numbered 1, 2)\n`);

  if (DRY_RUN) {
    console.log('🔍 DRY RUN — no upload\n');
    unique.forEach(f => {
      const { theme, freq } = classifyTheme(f.cleanTitle);
      console.log(`   🎵 "${f.cleanTitle}"  [${theme} | ${freq}Hz | ${(f.size/1024/1024).toFixed(2)}MB]`);
    });
    console.log(`\n✅ Dry run complete — ${unique.length} tracks ready to upload`);
    return;
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set');
    process.exit(1);
  }

  let uploaded = 0;
  let failed   = 0;

  for (let i = 0; i < unique.length; i++) {
    const file        = unique[i];
    const title       = file.cleanTitle;
    const storagePath = `music/${path.basename(file.fullPath)}`;
    const sizeMb      = Math.round((file.size / 1024 / 1024) * 100) / 100;
    const { theme, freq } = classifyTheme(title);

    process.stdout.write(`[${i + 1}/${unique.length}] "${title}" (${sizeMb}MB) ... `);

    try {
      await uploadFile(file.fullPath, storagePath);
      const url = await getSignedUrl(storagePath);

      await upsertTrack({
        title,
        theme,
        frequency_hz:      freq,
        registered_under:  'Believing Self Creations',
        copyright_year:    2026,
        storage_path:      storagePath,
        storage_url:       url,
        file_format:       'mp3',
        file_size_mb:      sizeMb,
        upload_status:     'uploaded',
        radio_approved:    true,
        radio_order:       i + 1,
      });

      console.log(`✅ uploaded`);
      uploaded++;
    } catch (err) {
      console.log(`❌ ${err.message}`);
      failed++;
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ UPLOAD COMPLETE`);
  console.log(`   Uploaded: ${uploaded} tracks`);
  console.log(`   Failed:   ${failed} tracks`);
  console.log(`   Total:    ${allFiles.length} files → ${unique.length} catalog entries`);
  console.log('\n🎵 Believing Self Creations is now in R.O.M.A.N.\'s knowledge base.');
  console.log('   Run "music status" in Discord to see the full catalog.');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
