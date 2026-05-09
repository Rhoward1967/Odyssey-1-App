/**
 * Deploy: R.O.M.A.N. Chat Session Persistence
 * Uses Supabase Management API (workaround for Windows SSL issue with supabase db push)
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=your_pat node scripts/deploy_roman_chat_sessions.js
 *
 * Get your PAT at: https://supabase.com/dashboard/account/tokens
 */

const https = require('https');
const fs    = require('fs');
const path  = require('path');

require('dotenv').config();

const PROJECT_ID = 'tvsxloejfsrdganemsmg';
const TOKEN      = process.env.SUPABASE_ACCESS_TOKEN;

if (!TOKEN) {
  console.error('ERROR: SUPABASE_ACCESS_TOKEN not set.');
  console.error('Get your token at https://supabase.com/dashboard/account/tokens');
  console.error('Then run: SUPABASE_ACCESS_TOKEN=your_token node scripts/deploy_roman_chat_sessions.js');
  process.exit(1);
}

const sql = fs.readFileSync(
  path.join(__dirname, '../supabase/migrations/20260508_roman_chat_sessions.sql'),
  'utf8'
);

function runQuery(sqlText) {
  return new Promise((resolve, reject) => {
    const body    = JSON.stringify({ query: sqlText });
    const options = {
      hostname: 'api.supabase.com',
      port:     443,
      path:     `/v1/projects/${PROJECT_ID}/database/query`,
      method:   'POST',
      headers:  {
        'Content-Type':   'application/json',
        'Authorization':  `Bearer ${TOKEN}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data',  chunk => { data += chunk; });
      res.on('end',   ()    => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try { resolve(JSON.parse(data)); } catch { resolve(data); }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('Deploying roman_chat_sessions migration...');
  try {
    await runQuery(sql);
    console.log('Migration deployed successfully.');
    console.log('Tables created: roman_chat_sessions, roman_chat_messages');
    console.log('Function created: fn_roman_chat_search');
    console.log('RLS enabled on both tables.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    console.error('');
    console.error('Fallback: paste the SQL from supabase/migrations/20260508_roman_chat_sessions.sql');
    console.error('directly into the Supabase SQL editor at https://supabase.com/dashboard');
    process.exit(1);
  }
}

main();
