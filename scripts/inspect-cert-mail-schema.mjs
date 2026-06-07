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
    }, res => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>{console.log(`\n=== ${label} ===\n${d.slice(0,3000)}`);resolve()}); });
    req.on('error', e => resolve()); req.write(body); req.end();
  });
}

await query(`SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema='public' AND table_name='certified_mail_tracking' ORDER BY ordinal_position;`, 'certified_mail_tracking schema');
await query(`SELECT * FROM public.certified_mail_tracking WHERE recipient ILIKE '%bank%america%' OR recipient ILIKE '%bofa%' OR notes ILIKE '%bofa%' ORDER BY mail_date DESC NULLS LAST LIMIT 8;`, 'existing BofA rows for reference');
