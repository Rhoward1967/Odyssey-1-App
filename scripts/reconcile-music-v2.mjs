import https from 'https';
import fs from 'fs';

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

function tokens(s) {
  return s.toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/\bremastered\b/g, '')
    .replace(/\boriginal\b/g, '')
    .replace(/\bremix(ed)?\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 2 && !/^\d+$/.test(t) && !['the','and','to','in','of','my','is','it','a','x'].includes(t));
}

function similarity(a, b) {
  const ta = new Set(tokens(a));
  const tb = new Set(tokens(b));
  if (!ta.size || !tb.size) return 0;
  let intersect = 0;
  for (const t of ta) if (tb.has(t)) intersect++;
  return intersect / Math.max(ta.size, tb.size);
}

const dbRows = JSON.parse(await query(`SELECT id, title, storage_url, upload_status, theme FROM public.sovereign_music ORDER BY title;`));
const dFiles = [
  ...fs.readdirSync('D:\\').filter(f => /\.(mp3|wav|m4a|aac|flac)$/i.test(f)).map(f => ({ folder: 'D:\\', name: f })),
  ...fs.readdirSync('D:\\Blieving Selfdrive-download-20260406T005418Z-1-001').filter(f => /\.(mp3|wav|m4a|aac|flac)$/i.test(f)).map(f => ({ folder: 'BSDF', name: f })),
];

// For each DB row, find best D: match (excluding HJS commercial)
const candidatesDB = [];
for (const row of dbRows) {
  let best = { score: 0, file: null };
  for (const f of dFiles) {
    if (/hjs.commercial/i.test(f.name)) continue;
    const s = similarity(row.title, f.name);
    if (s > best.score) best = { score: s, file: f };
  }
  candidatesDB.push({ ...row, best });
}

// For each D: file, find best DB match
const candidatesD = [];
for (const f of dFiles) {
  if (/hjs.commercial/i.test(f.name)) continue;
  let best = { score: 0, row: null };
  for (const row of dbRows) {
    const s = similarity(row.title, f.name);
    if (s > best.score) best = { score: s, row };
  }
  candidatesD.push({ file: f, best });
}

console.log('='.repeat(80));
console.log(`DB rows: ${dbRows.length}    D: audio files: ${dFiles.length}`);
console.log('='.repeat(80));

console.log('\n=== PENDING tracks with likely D: matches (ready to upload) ===');
for (const r of candidatesDB.filter(c => c.upload_status === 'pending')) {
  const tag = r.best.score >= 0.5 ? '✅' : r.best.score >= 0.25 ? '?' : '❌';
  const matchStr = r.best.file ? `${r.best.file.name} (${(r.best.score*100).toFixed(0)}%)` : '(no candidate)';
  console.log(`  ${tag} ${r.title.padEnd(35)} ↔ ${matchStr}`);
}

console.log('\n=== UPLOADED tracks (in Supabase already — could be promoted to live) ===');
const uploaded = dbRows.filter(r => r.upload_status === 'uploaded');
console.log(`  Count: ${uploaded.length}  (status='uploaded', has Supabase URL, NOT in radio rotation)`);
for (const r of uploaded.slice(0, 25)) {
  console.log(`    • ${r.title}  (${r.theme || '—'})`);
}

console.log('\n=== D: files with no confident DB match (potential new catalog entries) ===');
const orphanD = candidatesD.filter(c => c.best.score < 0.5);
console.log(`  Count: ${orphanD.length}`);
for (const o of orphanD) {
  const matchStr = o.best.row ? ` (closest: "${o.best.row.title}" ${(o.best.score*100).toFixed(0)}%)` : '';
  console.log(`    • [${o.file.folder === 'BSDF' ? 'Believing Self' : 'D:\\'}] ${o.file.name}${matchStr}`);
}

console.log('\n=== SUMMARY ===');
console.log(`  Live in radio rotation:    ${dbRows.filter(r => r.upload_status === 'live').length}`);
console.log(`  Uploaded but not live:     ${uploaded.length}    ← promote-to-live candidates`);
console.log(`  Pending, file likely on D: ${candidatesDB.filter(c => c.upload_status === 'pending' && c.best.score >= 0.5).length}`);
console.log(`  Pending, no file on D:     ${candidatesDB.filter(c => c.upload_status === 'pending' && c.best.score < 0.5).length}`);
console.log(`  D: files not yet in DB:    ${orphanD.length}`);
