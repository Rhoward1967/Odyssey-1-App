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
        console.log(`\n=== ${label} ===`);
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            console.log(JSON.stringify(parsed, null, 2));
          } else {
            console.log(data.slice(0, 800));
          }
        } catch { console.log(data.slice(0, 500)); }
        resolve(data);
      });
    });
    req.on('error', e => { console.error(label, e.message); resolve(null); });
    req.write(body);
    req.end();
  });
}

await query(`SELECT * FROM public.ll_volumes ORDER BY volume_number LIMIT 15;`, 'll_volumes');
await query(`SELECT COUNT(*) as count FROM public.ll_roman_knowledge;`, 'll_roman_knowledge count');
await query(`SELECT volume_id, key_name, topic FROM public.ll_roman_knowledge ORDER BY volume_id, key_name LIMIT 30;`, 'll_roman_knowledge entries');
await query(`SELECT COUNT(*) as count FROM public.ll_chapters;`, 'll_chapters count');
await query(`SELECT COUNT(*) as count FROM public.ll_quiz_questions;`, 'll_quiz_questions count');
await query(`SELECT COUNT(*) as count FROM public.ll_cards;`, 'll_cards count');
