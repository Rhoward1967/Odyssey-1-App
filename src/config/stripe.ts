// Stripe Client Initialization (CHIMERA-1)
import { Stripe, loadStripe } from '@stripe/stripe-js';

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublicKey) {
  throw new Error("VITE_STRIPE_PUBLISHABLE_KEY is not set in the environment.");
}

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublicKey);
  }
  return stripePromise;
};
// Stripe Product Configuration
export const STRIPE_PRODUCTS = {
  basic: {
    id: 'basic',
    name: 'ODYSSEY Basic',
    priceId: 'price_1SJO5TDPqeWRzwCXv8IxKMfG', // Updated from sync-stripe-products
    productId: 'prod_TFtt6rchuEcLmY',
    amount: 99.00,
    currency: 'usd',
    interval: 'month'
  },
  pro: {
    id: 'pro', 
    name: 'ODYSSEY Professional',
    priceId: 'price_1SJO5TDPqeWRzwCXNnKe6WzE', // Updated from sync-stripe-products
    productId: 'prod_TFttMiqtD7Vk3h',
    amount: 299.00,
    currency: 'usd',
    interval: 'month'
  },
  enterprise: {
    id: 'enterprise',
    name: 'ODYSSEY Enterprise', 
    priceId: 'price_1SJO5UDPqeWRzwCX630n9LJF', // Updated from sync-stripe-products
    productId: 'prod_TFttpS0y8zIG2p',
    amount: 999.00,
    currency: 'usd',
    interval: 'month'
  }
} as const;

export type StripePlan = keyof typeof STRIPE_PRODUCTS;

// Helper function to get product config
export const getStripeProduct = (planId: StripePlan) => {
  return STRIPE_PRODUCTS[planId];
};

// Validate plan ID
export const isValidPlan = (planId: string): planId is StripePlan => {
  return planId in STRIPE_PRODUCTS;
};