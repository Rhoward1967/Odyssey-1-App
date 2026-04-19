import https from 'https';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const PROJECT_ID = 'tvsxloejfsrdganemsmg';
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
if (!TOKEN) { console.error('SUPABASE_ACCESS_TOKEN not in .env'); process.exit(1); }

const sql = fs.readFileSync(
  new URL('../supabase/migrations/20260418_books_audio_purchase.sql', import.meta.url),
  'utf8'
);

const body = JSON.stringify({ query: sql });

const req = https.request({
  hostname: 'api.supabase.com',
  path: `/v1/projects/${PROJECT_ID}/database/query`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  },
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('Migration applied successfully.');
    } else {
      console.error('Error:', res.statusCode, data);
    }
  });
});

req.on('error', e => console.error('Request error:', e.message));
req.write(body);
req.end();
