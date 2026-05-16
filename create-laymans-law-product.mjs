#!/usr/bin/env node
import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY not set');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

console.log('🔨 Creating Layman\'s Law Product\n');

const product = await stripe.products.create({
  name: "Layman's Law",
  description: 'Legal literacy platform — 10 volumes powered by R.O.M.A.N. AI',
  metadata: { app: 'layman-law', platform: 'odyssey-1', tier: 'layman_law' },
});

const price = await stripe.prices.create({
  product: product.id,
  unit_amount: 999,
  currency: 'usd',
  recurring: { interval: 'month' },
});

console.log('✅ Product:', product.id);
console.log('✅ Price:', price.id);
console.log('\nAdd to src/config/stripe.ts:');
console.log('layman_law: { id: "layman_law", name: "Layman\'s Law", priceId: "' + price.id + '", productId: "' + product.id + '", amount: 9.99, currency: "usd", interval: "month" }');
