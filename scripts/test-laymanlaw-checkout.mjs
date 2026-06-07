import https from 'https';

function callEdge(name, body) {
  return new Promise((resolve) => {
    const data = JSON.stringify(body);
    const opts = {
      hostname: 'tvsxloejfsrdganemsmg.supabase.co',
      path: `/functions/v1/${name}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'origin': 'https://laymanslawapp.com',
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', e => resolve({ status: 0, body: e.message }));
    req.write(data);
    req.end();
  });
}

console.log('=== Test: tier=layman_law, price=9.99 ===');
const r1 = await callEdge('create-checkout-session', {
  tier: 'layman_law',
  price: '9.99',
  userId: 'prelaunch-test',
  userEmail: 'prelaunch-test@odyssey-1.local',
});
console.log(`status: ${r1.status}`);
console.log(`body: ${r1.body.slice(0, 800)}`);

console.log('\n=== Test: regression check on tier=Professional ===');
const r2 = await callEdge('create-checkout-session', {
  tier: 'Professional',
  price: '299',
  userId: 'prelaunch-test',
  userEmail: 'prelaunch-test@odyssey-1.local',
});
console.log(`status: ${r2.status}`);
console.log(`body: ${r2.body.slice(0, 800)}`);
