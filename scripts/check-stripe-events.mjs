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
    }, res => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>{console.log(`\n=== ${label} ===\n${d.slice(0,2500)}`);resolve()}); });
    req.on('error', e => resolve()); req.write(body); req.end();
  });
}

await query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='stripe_event_log' ORDER BY ordinal_position;`, 'stripe_event_log schema');
await query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='stripe_events' ORDER BY ordinal_position;`, 'stripe_events schema');
await query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='webhook_log' ORDER BY ordinal_position;`, 'webhook_log schema');
await query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='company_subscriptions' ORDER BY ordinal_position;`, 'company_subscriptions schema');
await query(`SELECT COUNT(*) FROM public.stripe_event_log;`, 'stripe_event_log count');
await query(`SELECT COUNT(*) FROM public.stripe_events;`, 'stripe_events count');
await query(`SELECT COUNT(*) FROM public.webhook_log;`, 'webhook_log count');
await query(`SELECT COUNT(*) FROM public.company_subscriptions;`, 'company_subscriptions count');
await query(`SELECT id, plan_name, status, created_at FROM public.subscriptions WHERE user_id IN (SELECT id FROM public.profiles WHERE email='generalmanager81@gmail.com') ORDER BY created_at DESC;`, 'all subs for architect');
