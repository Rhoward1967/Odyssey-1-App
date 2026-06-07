import https from 'https';
import fs from 'fs';

const token = fs.readFileSync(process.env.TEMP + '/sb_token.txt', 'utf8').trim();
const projectId = 'tvsxloejfsrdganemsmg';
const supabaseHost = `${projectId}.supabase.co`;

function mgmtApi(path, method = 'GET', body = null) {
  return new Promise((resolve) => {
    const opts = {
      hostname: 'api.supabase.com',
      path,
      method,
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', e => resolve({ status: 0, body: e.message }));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function callEdge(name, body, headers = {}) {
  return new Promise((resolve) => {
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    const opts = {
      hostname: supabaseHost,
      path: `/functions/v1/${name}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d.slice(0, 500) }));
    });
    req.on('error', e => resolve({ status: 0, body: e.message }));
    req.write(data);
    req.end();
  });
}

console.log('===== 1. LIST EDGE FUNCTIONS =====');
const fns = await mgmtApi(`/v1/projects/${projectId}/functions`);
if (fns.status !== 200) {
  console.log(`Management API call failed: status=${fns.status}, body=${fns.body.slice(0, 300)}`);
} else {
  const list = JSON.parse(fns.body);
  const targets = ['stripe-webhook', 'stripe-webhook-public', 'osc-stripe-webhook', 'create-checkout-session'];
  for (const t of targets) {
    const f = list.find(x => x.slug === t || x.name === t);
    if (!f) {
      console.log(`  ❌ ${t} — NOT FOUND`);
    } else {
      console.log(`  ✓ ${t} — status=${f.status}, version=${f.version}, verify_jwt=${f.verify_jwt}, updated_at=${f.updated_at}`);
    }
  }
}

console.log('\n===== 2. EDGE FUNCTION SECRETS =====');
const secrets = await mgmtApi(`/v1/projects/${projectId}/secrets`);
if (secrets.status !== 200) {
  console.log(`Secrets call failed: status=${secrets.status}, body=${secrets.body.slice(0, 300)}`);
} else {
  const list = JSON.parse(secrets.body);
  const stripeRelated = list.filter(s => /stripe/i.test(s.name));
  console.log(`Found ${stripeRelated.length} Stripe-related secrets:`);
  for (const s of stripeRelated) {
    console.log(`  ✓ ${s.name}`);
  }
  const expected = ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'STRIPE_ODYSSEY_WEBHOOK_SECRET'];
  for (const e of expected) {
    if (!stripeRelated.find(s => s.name === e)) {
      console.log(`  ❌ ${e} — MISSING`);
    }
  }
}

console.log('\n===== 3. WEBHOOK REACHABILITY (bad signature should give 400) =====');
const dummyPayload = JSON.stringify({ id: 'evt_test', type: 'test.event', data: { object: {} } });
for (const fn of ['stripe-webhook', 'stripe-webhook-public', 'osc-stripe-webhook']) {
  const r = await callEdge(fn, dummyPayload, { 'stripe-signature': 't=0,v1=invalid' });
  console.log(`  ${fn}: status=${r.status}  body=${r.body.replace(/\n/g, ' ').slice(0, 200)}`);
}

console.log('\n===== 4. create-checkout-session REACHABILITY =====');
const cco = await callEdge('create-checkout-session', { tier: 'layman_law', price: '9.99', userId: 'test', userEmail: 'test@example.com' });
console.log(`  status=${cco.status}  body=${cco.body.replace(/\n/g, ' ').slice(0, 300)}`);
