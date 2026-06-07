import https from 'https';
import fs from 'fs';
import path from 'path';

const token = fs.readFileSync(process.env.TEMP + '/sb_token.txt', 'utf8').trim();

function query(sql) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ query: sql });
    const req = https.request({
      hostname: 'api.supabase.com',
      path: `/v1/projects/tvsxloejfsrdganemsmg/database/query`,
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, res => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve(d)); });
    req.on('error', () => resolve('[]'));
    req.write(body); req.end();
  });
}

// Normalize a string for fuzzy matching
function norm(s) {
  return s.toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')           // strip extension
    .replace(/\bremastered(\s*x\s*\d+)?\b/g, '') // strip "remastered" / "remastered x2"
    .replace(/\boriginal\b/g, '')           // strip "original"
    .replace(/\(\s*\d+\s*\)/g, '')          // strip "(1)" "(2)"
    .replace(/\bvol\.?\s*\d+\b/g, '')       // strip "vol 1"
    .replace(/[^a-z0-9]+/g, ' ')            // non-alnum to space
    .replace(/\s+/g, ' ')                   // collapse spaces
    .trim();
}

// 1. Pull DB rows
const dbRaw = await query(`SELECT id, title, storage_url, upload_status, theme FROM public.sovereign_music ORDER BY title;`);
const dbRows = JSON.parse(dbRaw);
console.log(`DB rows: ${dbRows.length}`);

// 2. Scan D: drive (already done in PowerShell — load static list here)
const dPaths = [
  ...fs.readdirSync('D:\\').filter(f => /\.(mp3|wav|m4a|aac|flac)$/i.test(f)).map(f => ({ folder: 'D:\\', name: f })),
  ...fs.readdirSync('D:\\Blieving Selfdrive-download-20260406T005418Z-1-001').filter(f => /\.(mp3|wav|m4a|aac|flac)$/i.test(f)).map(f => ({ folder: 'D:\\Blieving Selfdrive-...\\', name: f })),
];
console.log(`D: audio files: ${dPaths.length}`);

// 3. Match
const dbByNorm = new Map(dbRows.map(r => [norm(r.title), r]));
const dFilesByNorm = new Map();
for (const f of dPaths) {
  const n = norm(f.name);
  if (!dFilesByNorm.has(n)) dFilesByNorm.set(n, []);
  dFilesByNorm.get(n).push(f);
}

const matched = [];
const dbNoFile = [];
const fileNoDb = [];

for (const [n, row] of dbByNorm.entries()) {
  if (dFilesByNorm.has(n)) {
    matched.push({ title: row.title, status: row.upload_status, fileCount: dFilesByNorm.get(n).length });
  } else {
    dbNoFile.push({ title: row.title, status: row.upload_status, theme: row.theme, has_url: !!row.storage_url });
  }
}
for (const [n, files] of dFilesByNorm.entries()) {
  if (!dbByNorm.has(n)) {
    fileNoDb.push({ normalized: n, files: files.map(f => f.name) });
  }
}

console.log('\n========================================');
console.log('GAP REPORT');
console.log('========================================');
console.log(`\n✓ Matched (DB title ↔ D: file): ${matched.length}`);
console.log(`👻 In DB but NO file on D: : ${dbNoFile.length}`);
console.log(`⚠️  On D: but NOT in DB: ${fileNoDb.length}`);

console.log('\n--- In DB but NO file found on D: ---');
for (const r of dbNoFile) {
  console.log(`  [${r.status}] ${r.title}   (theme: ${r.theme || '—'}, has_url: ${r.has_url})`);
}

console.log('\n--- On D: but NOT in DB (uploadable candidates) ---');
for (const r of fileNoDb) {
  console.log(`  ${r.files.join(' / ')}`);
}

console.log('\n--- Matched DB rows by status ---');
const byStatus = matched.reduce((m, r) => { m[r.status] = (m[r.status] || 0) + 1; return m; }, {});
for (const [s, c] of Object.entries(byStatus)) console.log(`  ${s}: ${c}`);
