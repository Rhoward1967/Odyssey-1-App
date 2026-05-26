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
          console.log(JSON.stringify(parsed, null, 2));
        } catch { console.log(data.slice(0, 800)); }
        resolve(data);
      });
    });
    req.on('error', e => { console.error(label, e.message); resolve(null); });
    req.write(body);
    req.end();
  });
}

await query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='ll_volumes' ORDER BY ordinal_position;`, 'll_volumes schema');
await query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='ll_chapters' ORDER BY ordinal_position;`, 'll_chapters schema');
await query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='ll_cards' ORDER BY ordinal_position;`, 'll_cards schema');
await query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='ll_quiz_questions' ORDER BY ordinal_position;`, 'll_quiz_questions schema');
await query(`SELECT id, num, title, sort_order, is_active FROM public.ll_volumes ORDER BY sort_order;`, 'll_volumes rows');
await query(`SELECT volume_id, COUNT(*) AS chapter_count FROM public.ll_chapters GROUP BY volume_id ORDER BY volume_id;`, 'chapters per volume');
await query(`SELECT volume_id, COUNT(*) AS card_count FROM public.ll_cards GROUP BY volume_id ORDER BY volume_id;`, 'cards per volume');
await query(`SELECT volume_id, COUNT(*) AS q_count FROM public.ll_quiz_questions GROUP BY volume_id ORDER BY volume_id;`, 'quiz Qs per volume');
