const response = await fetch('https://tvsxloejfsrdganemsmg.supabase.co/functions/v1/create-checkout-session', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_ANON_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    priceId: 'price_xxx',
    userId: 'test-user'
  })
});

console.log(await response.json());
