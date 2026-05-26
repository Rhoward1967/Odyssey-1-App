import https from 'https';
import fs from 'fs';

const token = fs.readFileSync(process.env.TEMP + '/sb_token.txt', 'utf8').trim();
const projectId = 'tvsxloejfsrdganemsmg';

function query(sql, label) {
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
      res.on('end', () => {
        console.log(`\n=== ${label} ===`);
        console.log(data.slice(0, 1200));
        resolve();
      });
    });
    req.on('error', e => { console.error(label, e.message); resolve(); });
    req.write(body); req.end();
  });
}

await query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='layman_law_knowledge' ORDER BY ordinal_position;`, 'layman_law_knowledge schema');
await query(`SELECT volume_number, COUNT(*) AS n FROM public.layman_law_knowledge GROUP BY volume_number ORDER BY volume_number;`, 'old knowledge per volume');
await query(`SELECT volume_id, chapter_index, title, subtitle, LEFT(content_html, 100) AS preview FROM public.ll_chapters WHERE volume_id IN (1, 11, 20) ORDER BY volume_id, chapter_index;`, 'sample chapters from vol 1, 11, 20');
