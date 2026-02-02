#!/usr/bin/env node
/**
 * Check Stripe subscription pricing tiers
 */

import Stripe from 'stripe';

const STRIPE_SECRET_KEY = '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';

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

console.log('🔍 Checking Stripe Subscription Products & Prices\n');

// List all active products
const products = await stripe.products.list({
  active: true,
  limit: 100,
});

console.log(`Found ${products.data.length} active products:\n`);

// Filter ODYSSEY products
const odysseyProducts = products.data.filter(p => 
  p.name.includes('ODYSSEY') || p.metadata?.platform === 'odyssey-1'
);

if (odysseyProducts.length === 0) {
  console.log('❌ NO ODYSSEY SUBSCRIPTION PRODUCTS FOUND IN STRIPE');
  console.log('Need to run sync-stripe-products Edge Function\n');
} else {
  console.log(`✅ Found ${odysseyProducts.length} ODYSSEY products:\n`);
  
  for (const product of odysseyProducts) {
    console.log(`📦 ${product.name} (${product.id})`);
    console.log(`   Description: ${product.description}`);
    console.log(`   Tier: ${product.metadata?.tier || 'unknown'}`);
    
    // Get prices for this product
    const prices = await stripe.prices.list({
      product: product.id,
      active: true,
    });
    
    if (prices.data.length > 0) {
      prices.data.forEach(price => {
        const amount = price.unit_amount / 100;
        const interval = price.recurring?.interval || 'one-time';
        console.log(`   💰 ${price.id}: $${amount}/${interval}`);
      });
    } else {
      console.log('   ❌ No active prices');
    }
    console.log('');
  }
}

// Check what's configured in our code
console.log('=' .repeat(80));
console.log('\n📋 CONFIGURED IN CODE (src/config/stripe.ts):\n');
console.log('Basic:       price_1SJO5TDPqeWRzwCXv8IxKMfG ($99/month)');
console.log('Professional: price_1SJO5TDPqeWRzwCXNnKe6WzE ($299/month)');
console.log('Enterprise:   price_1SJO5UDPqeWRzwCX630n9LJF ($999/month)');

// Verify each configured price exists
console.log('\n🔍 Verifying configured prices...\n');

const configuredPrices = [
  { name: 'Basic', id: 'price_1SJO5TDPqeWRzwCXv8IxKMfG', expected: 9900 },
  { name: 'Professional', id: 'price_1SJO5TDPqeWRzwCXNnKe6WzE', expected: 29900 },
  { name: 'Enterprise', id: 'price_1SJO5UDPqeWRzwCX630n9LJF', expected: 99900 },
];

for (const config of configuredPrices) {
  try {
    const price = await stripe.prices.retrieve(config.id, {
      expand: ['product'],
    });
    
    const product = price.product;
    const matches = price.unit_amount === config.expected;
    
    console.log(`${matches ? '✅' : '❌'} ${config.name}: ${product.name}`);
    console.log(`   Price: $${price.unit_amount / 100}/${price.recurring?.interval}`);
    console.log(`   Active: ${price.active}`);
    console.log(`   Product Active: ${product.active}`);
  } catch (error) {
    console.log(`❌ ${config.name}: NOT FOUND (${config.id})`);
  }
  console.log('');
}
