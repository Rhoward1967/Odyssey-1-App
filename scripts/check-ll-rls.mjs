import https from 'https';
import fs from 'fs';

const token = fs.readFileSync(process.env.TEMP + '/sb_token.txt', 'utf8').trim();
const projectId = 'tvsxloejfsrdganemsmg';

function query(sql, label) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ query: sql });
    const req = https.request({
      hostname: 'api.supabase.com',
      path: `/v1/projects/${projectId}/database/query`,
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        console.log(`\n=== ${label} ===`);
        console.log(data.slice(0, 1500));
        resolve();
      });
    });
    req.on('error', e => { console.error(label, e.message); resolve(); });
    req.write(body); req.end();
  });
}

await query(`SELECT relname, relrowsecurity FROM pg_class WHERE relname IN ('ll_volumes','ll_chapters','ll_cards','ll_quiz_questions','layman_law_knowledge') ORDER BY relname;`, 'RLS enabled?');
await query(`SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual FROM pg_policies WHERE tablename IN ('ll_chapters','ll_volumes','ll_cards','ll_quiz_questions','layman_law_knowledge') ORDER BY tablename, policyname;`, 'RLS policies');
await query(`SELECT grantee, privilege_type FROM information_schema.role_table_grants WHERE table_schema='public' AND table_name IN ('ll_chapters','ll_volumes') ORDER BY table_name, grantee;`, 'Table grants (anon/authenticated)');
