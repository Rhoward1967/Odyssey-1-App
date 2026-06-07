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
    }, res => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>{console.log(`\n=== ${label} ===\n${d.slice(0,2000)}`);resolve()}); });
    req.on('error', e => resolve()); req.write(body); req.end();
  });
}

await query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND (table_name ILIKE '%music%' OR table_name ILIKE '%radio%' OR table_name ILIKE '%track%' OR table_name ILIKE '%ascap%') ORDER BY table_name;`, 'radio/music tables');
await query(`SELECT upload_status, COUNT(*) FROM public.sovereign_music GROUP BY upload_status ORDER BY 2 DESC;`, 'catalog by upload_status');
await query(`SELECT theme, COUNT(*) FROM public.sovereign_music GROUP BY theme ORDER BY 2 DESC LIMIT 10;`, 'tracks by theme');
await query(`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE radio_approved = true) AS radio_ready, COUNT(*) FILTER (WHERE storage_url IS NOT NULL) AS has_audio_file, SUM(duration_seconds) AS total_seconds FROM public.sovereign_music;`, 'catalog totals');
await query(`SELECT title, album, upload_status, radio_approved, duration_seconds FROM public.sovereign_music WHERE radio_approved = true ORDER BY radio_order NULLS LAST LIMIT 10;`, 'first 10 radio-ready tracks');
