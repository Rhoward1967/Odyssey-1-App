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
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        console.log(`\n=== ${label} ===`);
        console.log(d.slice(0, 2000));
        resolve();
      });
    });
    req.on('error', e => { console.error(label, e.message); resolve(); });
    req.write(body); req.end();
  });
}

// Find every stripe-related table
await query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND (table_name ILIKE '%stripe%' OR table_name ILIKE '%subscription%' OR table_name ILIKE '%payment%' OR table_name ILIKE '%webhook%' OR table_name ILIKE '%checkout%') ORDER BY table_name;`, 'stripe-related tables');

// Recent subscription rows
await query(`SELECT id, user_id, plan_name, status, created_at, updated_at FROM public.subscriptions ORDER BY created_at DESC NULLS LAST LIMIT 10;`, 'recent subscriptions');

// Subscription counts by status
await query(`SELECT status, plan_name, COUNT(*) FROM public.subscriptions GROUP BY status, plan_name ORDER BY status, plan_name;`, 'subscription counts by status/plan');

// Profiles with stripe customer ids
await query(`SELECT id, email, stripe_customer_id, updated_at FROM public.profiles WHERE stripe_customer_id IS NOT NULL ORDER BY updated_at DESC NULLS LAST LIMIT 10;`, 'profiles with stripe customer IDs');
