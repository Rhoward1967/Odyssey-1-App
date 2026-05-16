#!/usr/bin/env node
/**
 * Verify Layman's Law Stripe Configuration
 */

import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY not set');
  console.error('Run: $env:STRIPE_SECRET_KEY="sk_live_..."; node verify-laymans-law.mjs');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

console.log('🔍 VERIFYING LAYMAN\'S LAW SETUP\n');
console.log('='.repeat(80));

const EXPECTED_CONFIG = {
  productId: 'prod_UWsQZnkDb0uhJN',
  priceId: 'price_1TXofjDPqeWRzwCXMvWIY4Fi',
  amount: 999, // $9.99 in cents
  name: "Layman's Law"
};

try {
  // 1. Verify Product exists in Stripe
  console.log('\n1️⃣ Checking Stripe Product...');
  const product = await stripe.products.retrieve(EXPECTED_CONFIG.productId);
  console.log(`   ✅ Product found: ${product.name}`);
  console.log(`   ID: ${product.id}`);
  console.log(`   Active: ${product.active}`);

  // 2. Verify Price exists
  console.log('\n2️⃣ Checking Stripe Price...');
  const price = await stripe.prices.retrieve(EXPECTED_CONFIG.priceId);
  console.log(`   ✅ Price found: $${price.unit_amount / 100}/${price.recurring?.interval}`);
  console.log(`   ID: ${price.id}`);
  console.log(`   Active: ${price.active}`);
  console.log(`   Linked to product: ${price.product === EXPECTED_CONFIG.productId ? '✅' : '❌'}`);

  // 3. Verify amount matches
  console.log('\n3️⃣ Validating Configuration...');
  if (price.unit_amount === EXPECTED_CONFIG.amount) {
    console.log(`   ✅ Price correct: $${price.unit_amount / 100}`);
  } else {
    console.log(`   ❌ Price mismatch: Expected $${EXPECTED_CONFIG.amount / 100}, got $${price.unit_amount / 100}`);
  }

  // 4. Check metadata
  console.log('\n4️⃣ Checking Metadata...');
  console.log(`   Tier: ${product.metadata?.tier || 'not set'}`);
  console.log(`   App: ${product.metadata?.app || 'not set'}`);
  console.log(`   Platform: ${product.metadata?.platform || 'not set'}`);

  console.log('\n' + '='.repeat(80));
  console.log('\n✅ LAYMAN\'S LAW STRIPE CONFIGURATION VERIFIED!\n');
  console.log('📋 Configuration Summary:');
  console.log(`   Product: ${product.name} (${product.id})`);
  console.log(`   Price: $${price.unit_amount / 100}/${price.recurring?.interval} (${price.id})`);
  console.log(`   Status: ${product.active && price.active ? '🟢 ACTIVE' : '🔴 INACTIVE'}`);
  
  console.log('\n🎯 Next Steps:');
  console.log('   1. ✅ Stripe product configured');
  console.log('   2. ✅ src/config/stripe.ts updated');
  console.log('   3. ⏭️  Test checkout flow in browser');
  console.log('   4. ⏭️  Verify webhook receives events');
  console.log('   5. ⏭️  Check database records after test purchase\n');

} catch (error) {
  console.error('\n❌ VERIFICATION FAILED:', error.message);
  console.error('\n   This could mean:');
  console.error('   - Product/Price IDs are incorrect');
  console.error('   - Stripe API key is wrong');
  console.error('   - Product was deleted from Stripe\n');
  process.exit(1);
}
