# 🔐 Stripe Setup Instructions

## Current Status
✅ **VITE_STRIPE_PUBLISHABLE_KEY** - Configured  
❌ **STRIPE_SECRET_KEY** - Missing (causing blue page on payment)

## Quick Fix (5 minutes)

### 1. Get Your Stripe Secret Key
1. Go to https://dashboard.stripe.com/apikeys
2. Copy your **Secret key** (starts with `sk_live_` or `sk_test_`)

### 2. Add to Local Environment (.env)
```bash
# Add this line to your .env file:
STRIPE_SECRET_KEY=sk_live_YOUR_KEY_HERE
```

### 3. Add to Supabase Edge Functions
```bash
# Run this command:
npx supabase secrets set STRIPE_SECRET_KEY=sk_live_YOUR_KEY_HERE
```

**OR** via Supabase Dashboard:
1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/settings/functions
2. Click "Edge Functions"
3. Add secret: `STRIPE_SECRET_KEY` = your key

### 4. Restart Services
```bash
# Stop all node processes
Stop-Process -Name node -Force -ErrorAction SilentlyContinue

# Restart bot
npm run bot

# Restart dev server (if needed)
npm run dev
```

## Verification
After setup, test the flow:
1. Go to pricing page
2. Click "Get Started" on any plan
3. Fill out profile form
4. Click "Continue to Payment"
5. Should redirect to Stripe Checkout (not blue page!)

## Current Price IDs
- **Professional ($99)**: `price_1S45KEDPqeWRzwCXi6awuzd4`
- **Business ($299)**: `price_1S45LLDPqeWRzwCXNSNtLlm0`
- **Enterprise ($999)**: `price_1S45NMDPqeWRzwCXMTAOnP5b`

## Testing Mode
For testing without real charges:
1. Use test key: `sk_test_...` instead of `sk_live_...`
2. Use test card: `4242 4242 4242 4242`
3. Any future expiry date
4. Any 3-digit CVC

---

**Status:** Ready to configure  
**Time:** ~5 minutes  
**Impact:** Fixes subscription payment flow completely
