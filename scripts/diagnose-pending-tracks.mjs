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

await query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='sovereign_music' ORDER BY ordinal_position;`, 'sovereign_music schema');
await query(`SELECT title, album, theme, upload_status, radio_approved,
              CASE WHEN storage_url IS NULL THEN '(no url)' ELSE 'has url' END AS storage_url_state,
              CASE WHEN storage_path IS NULL THEN '(no path)' ELSE 'has path' END AS storage_path_state,
              file_format, file_size_mb, notes
            FROM public.sovereign_music WHERE upload_status='pending' ORDER BY title;`, 'all 12 pending tracks');
await query(`SELECT title, storage_path FROM public.sovereign_music WHERE upload_status='uploaded' AND storage_url IS NULL LIMIT 5;`, 'uploaded but no URL — broken state?');
await query(`SELECT upload_status, COUNT(*) FILTER (WHERE storage_url IS NULL) AS no_url, COUNT(*) FILTER (WHERE storage_url IS NOT NULL) AS has_url FROM public.sovereign_music GROUP BY upload_status;`, 'URL presence by status');
