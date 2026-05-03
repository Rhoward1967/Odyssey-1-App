/**
 * Run disclaimer_gate migration via Supabase Management API
 * Usage: node scripts/run-disclaimer-migration.mjs
 */

import { readFileSync } from 'fs';
import https from 'https';

const token = readFileSync(
  process.env.SB_TOKEN_PATH || 'C:\\Users\\gener\\AppData\\Local\\Temp\\sb_token.txt',
  'utf8'
).trim();

const PROJECT_ID = 'tvsxloejfsrdganemsmg';

const sql = `
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS legal_disclaimer_accepted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS disclaimer_accepted_at timestamptz;
`;

const body = JSON.stringify({ query: sql });

const options = {
  hostname: 'api.supabase.com',
  path: `/v1/projects/${PROJECT_ID}/database/query`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  },
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ Migration applied: legal_disclaimer_accepted + disclaimer_accepted_at added to profiles');
    } else {
      console.error(`❌ HTTP ${res.statusCode}:`, data);
      process.exit(1);
    }
  });
});

req.on('error', (err) => { console.error('❌ Request error:', err); process.exit(1); });
req.write(body);
req.end();
