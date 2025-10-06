// Stripe Client Initialization (CHIMERA-1)
import { Stripe, loadStripe } from '@stripe/stripe-js';

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

if (!stripePublicKey) {
  throw new Error("VITE_STRIPE_PUBLIC_KEY is not set in the environment.");
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
    priceId: 'price_1S2wIoDOc3gLU4sVwAodIGcS', // Basic plan Price ID
    productId: 'prod_SyuAH597Go52Pu',
    amount: 99.00,
    currency: 'usd',
    interval: 'month'
  },
  pro: {
    id: 'pro', 
    name: 'ODYSSEY Professional',
    priceId: 'price_1S2wMDDOc3gLU4sVgoIt0iY1', // Professional plan Price ID
    productId: 'prod_Syu9ANMgVt9Kda',
    amount: 299.00,
    currency: 'usd',
    interval: 'month'
  },
  enterprise: {
    id: 'enterprise',
    name: 'ODYSSEY Enterprise', 
    priceId: 'price_1S2wKkDOc3gLU4sV3CJSBoBc', // Enterprise plan Price ID
    productId: 'prod_Syu7v4mb0qO61J',
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