/**
 * UPLOAD HANDSHAKE ANTHEM
 * =======================
 * Uploads Overthrown_Architecture.mp3 from D:\ to Supabase Storage
 * and registers it in sovereign_music as R.O.M.A.N.'s boot anthem.
 *
 * Usage: node scripts/upload-handshake-track.mjs
 *
 * © 2026 Howard Jones Bloodline Ancestral Trust — UCC 1-308
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, statSync } from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const TRACK_PATH  = 'D:\\Overthrown_Architecture.mp3';
const BUCKET      = 'sovereign-music';
const STORAGE_KEY = 'handshake/Overthrown_Architecture.mp3';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  console.log('🎵 Uploading R.O.M.A.N. Handshake Anthem...');

  // Read file
  const file     = readFileSync(TRACK_PATH);
  const stat     = statSync(TRACK_PATH);
  const sizeMb   = +(stat.size / 1024 / 1024).toFixed(2);

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(STORAGE_KEY, file, {
      contentType: 'audio/mpeg',
      upsert: true,
    });

  if (uploadError) {
    console.error('❌ Upload failed:', uploadError.message);
    process.exit(1);
  }
  console.log('✅ File uploaded to storage');

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(STORAGE_KEY);

  const publicUrl = urlData?.publicUrl;
  console.log('🔗 Public URL:', publicUrl);

  // Upsert into sovereign_music
  const { error: dbError } = await supabase
    .from('sovereign_music')
    .upsert({
      title:            'Overthrown Architecture',
      album:            'Believing Self Creations',
      theme:            'sovereignty',
      frequency_hz:     741,
      spiritual_theme:  'handshake_anthem',
      keywords:         ['handshake', 'sovereignty', 'roman', 'boot', 'architecture'],
      copyright_year:   2026,
      registered_under: 'Believing Self Creations',
      storage_path:     STORAGE_KEY,
      storage_url:      publicUrl,
      file_format:      'mp3',
      file_size_mb:     sizeMb,
      radio_approved:   true,
      radio_order:      1,
      upload_status:    'live',
      notes:            'R.O.M.A.N. handshake boot anthem — announced when R.O.M.A.N. comes online',
    }, { onConflict: 'title' });

  if (dbError) {
    console.error('❌ DB insert failed:', dbError.message);
    process.exit(1);
  }

  console.log('✅ Track registered in sovereign_music as handshake anthem');
  console.log('\n🤝 Overthrown Architecture is now wired to the R.O.M.A.N. handshake.');
}

run().catch(console.error);
