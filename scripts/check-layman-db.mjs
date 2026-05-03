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
            console.log(data.slice(0, 500));
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

// Check what tables exist
await query(
  `SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public' AND table_name LIKE 'll_%' OR table_name = 'layman_law_knowledge'
   ORDER BY table_name;`,
  'Layman Law tables'
);

// Check knowledge entries
await query(
  `SELECT volume_number, key_name, topic FROM public.layman_law_knowledge
   ORDER BY volume_number, key_name;`,
  'layman_law_knowledge entries'
);

// Check other LL tables
await query(
  `SELECT COUNT(*) as count FROM information_schema.tables
   WHERE table_schema = 'public' AND (table_name LIKE 'll_%');`,
  'Count of ll_ tables'
);

await query(
  `SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public' AND table_name LIKE 'll_%'
   ORDER BY table_name;`,
  'All ll_ tables'
);
