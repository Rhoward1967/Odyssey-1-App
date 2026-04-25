import https from 'https';
import fs from 'fs';

const token = fs.readFileSync(process.env.TEMP + '/sb_token.txt', 'utf8').trim();
const projectId = 'tvsxloejfsrdganemsmg';

const sql = `DROP VIEW IF EXISTS public.ll_user_stats CASCADE;`;

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
    console.log('Response:', data);
    if (data.includes('error') || data.includes('Error')) {
      console.log('❌ Failed');
    } else {
      console.log('✅ ll_user_stats view dropped');
    }
  });
});
req.on('error', e => console.error(e));
req.write(body);
req.end();
