import https from 'https';
import fs from 'fs';
const token = fs.readFileSync(process.env.TEMP + '/sb_token.txt', 'utf8').trim();
function query(sql, label) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ query: sql });
    const req = https.request({
      hostname: 'api.supabase.com',
      path: `/v1/projects/tvsxloejfsrdganemsmg/database/query`,
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, res => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>{console.log(`\n=== ${label} ===\n${d.slice(0,1500)}`);resolve()}); });
    req.on('error', e => resolve()); req.write(body); req.end();
  });
}
await query(`SELECT volume_id, COUNT(*) AS total, COUNT(*) FILTER (WHERE is_active = true) AS active FROM public.ll_chapters GROUP BY volume_id ORDER BY volume_id;`, 'chapters: total vs active per volume');
