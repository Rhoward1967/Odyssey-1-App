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

// Get schema for all ll_ tables
for (const t of ['ll_volumes', 'll_roman_knowledge', 'll_chapters', 'll_quiz_questions', 'll_cards', 'll_card_decks']) {
  await query(
    `SELECT column_name, data_type FROM information_schema.columns
     WHERE table_schema='public' AND table_name='${t}' ORDER BY ordinal_position;`,
    `${t} schema`
  );
}

// Now read actual data
await query(`SELECT * FROM public.ll_volumes LIMIT 5;`, 'll_volumes data');
await query(`SELECT * FROM public.ll_roman_knowledge LIMIT 5;`, 'll_roman_knowledge sample');
