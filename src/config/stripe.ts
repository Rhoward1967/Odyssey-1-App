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
    priceId: 'price_1SwEPSDPqeWRzwCXYv4mkeRB', // ✅ Updated Feb 1, 2026
    productId: 'prod_Tu2UmgnFUCvyYz',
    amount: 99.00,
    currency: 'usd',
    interval: 'month'
  },
  pro: {
    id: 'pro', 
    name: 'ODYSSEY Professional',
    priceId: 'price_1SwEPTDPqeWRzwCXNCulPzxo', // ✅ Updated Feb 1, 2026
    productId: 'prod_Tu2UZG3VPi9slG',
    amount: 299.00,
    currency: 'usd',
    interval: 'month'
  },
  enterprise: {
    id: 'enterprise',
    name: 'ODYSSEY Enterprise', 
    priceId: 'price_1SwEPTDPqeWRzwCX8xzuCHmz', // ✅ Updated Feb 1, 2026
    productId: 'prod_Tu2U4epDf42oFU',
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