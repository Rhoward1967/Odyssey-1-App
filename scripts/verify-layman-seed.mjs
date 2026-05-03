import https from 'https';
import fs from 'fs';

const token = fs.readFileSync(process.env.TEMP + '/sb_token.txt', 'utf8').trim();
const projectId = 'tvsxloejfsrdganemsmg';

async function query(sql, label) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ query: sql });
    const req = https.request({
      hostname: 'api.supabase.com',
      path: `/v1/projects/${projectId}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        console.log(`\n${label}`);
        try { console.log(JSON.stringify(JSON.parse(data), null, 2)); }
        catch { console.log(data.slice(0, 400)); }
        resolve(data);
      });
    });
    req.on('error', e => { console.error(label, e.message); resolve(null); });
    req.write(body);
    req.end();
  });
}

await query(
  `SELECT volume_number, COUNT(*) as entries FROM public.layman_law_knowledge
   GROUP BY volume_number ORDER BY volume_number;`,
  'Entries per volume'
);

await query(
  `SELECT COUNT(*) as total FROM public.layman_law_knowledge WHERE key_name != 'guardrail_scope_boundary';`,
  'Total content entries (excluding guardrail)'
);
