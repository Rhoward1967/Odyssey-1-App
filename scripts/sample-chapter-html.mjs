import https from 'https';
import fs from 'fs';

const token = fs.readFileSync(process.env.TEMP + '/sb_token.txt', 'utf8').trim();
const projectId = 'tvsxloejfsrdganemsmg';

function query(sql) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ query: sql });
    const req = https.request({
      hostname: 'api.supabase.com',
      path: `/v1/projects/${projectId}/database/query`,
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
    req.on('error', e => resolve(null));
    req.write(body); req.end();
  });
}

const r = await query(`SELECT volume_id, chapter_index, content_html FROM public.ll_chapters WHERE volume_id IN (1, 11) ORDER BY volume_id, chapter_index;`);
const rows = JSON.parse(r);
const classes = new Set();
for (const row of rows) {
  const matches = row.content_html.match(/class="([^"]+)"/g) || [];
  for (const m of matches) {
    m.match(/class="([^"]+)"/)[1].split(/\s+/).forEach(c => classes.add(c));
  }
}
console.log('Classes used in content_html:');
console.log([...classes].sort());
console.log('\nSample chapter (vol 11, chapter 0) first 1500 chars:');
console.log(rows.find(r => r.volume_id === 11 && r.chapter_index === 0).content_html.slice(0, 1500));
