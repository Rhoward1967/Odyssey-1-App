-- ============================================================================
-- FIX SUBSCRIPTION TIERS - STRIPE ALIGNMENT
-- Date: February 11, 2026
-- Purpose: Align subscriptions table with Stripe 3-tier system ($99, $299, $999)
-- ============================================================================

-- PROBLEM IDENTIFIED:
-- 1. subscriptions.tier constraint allows: 'free', 'starter', 'professional', 'enterprise'
-- 2. Stripe config uses: 'basic', 'pro', 'enterprise'
-- 3. This causes INSERT failures when Stripe webhooks try to create subscriptions
-- 4. Ghost tables (user_subscriptions, subscription_tiers) exist but are unused

-- ============================================================================
-- STEP 1: Drop old constraint on subscriptions table
-- ============================================================================

ALTER TABLE public.subscriptions
DROP CONSTRAINT IF EXISTS valid_tier_values;

-- ============================================================================
-- STEP 2: Add new constraint matching Stripe tier IDs
-- ============================================================================

ALTER TABLE public.subscriptions
ADD CONSTRAINT valid_tier_values
CHECK (tier IN ('free', 'basic', 'pro', 'enterprise'));

-- ============================================================================
-- STEP 3: Update existing records with old tier names
-- ============================================================================

-- Map old tier names to new Stripe-aligned names
UPDATE public.subscriptions
SET tier = 'basic'
WHERE tier = 'starter';

UPDATE public.subscriptions
SET tier = 'pro'
WHERE tier = 'professional';

-- 'enterprise' and 'free' stay the same

-- ============================================================================
-- STEP 4: Add comment documenting the tier system
-- ============================================================================

COMMENT ON COLUMN public.subscriptions.tier IS
'Subscription tier aligned with Stripe config (src/config/stripe.ts):
- free: $0 (trial)
- basic: $99/month (ODYSSEY Basic)
- pro: $299/month (ODYSSEY Professional)
- enterprise: $999/month (ODYSSEY Enterprise)

Updated: Feb 11, 2026 to fix Stripe webhook compatibility';

-- ============================================================================
-- STEP 5: Document ghost tables (DO NOT DELETE - may be used by other services)
-- ============================================================================

COMMENT ON TABLE public.user_subscriptions IS
'[DEPRECATED] Old subscription system from usage tracking migration (20241119000003).
Not actively used. Real subscription data is in public.subscriptions table.
Kept for potential future usage tracking integration.';

COMMENT ON TABLE public.subscription_tiers IS
'[LEGACY] Original tier definitions with old pricing ($29.99, $99.99).
Current pricing is managed in Stripe dashboard and src/config/stripe.ts.
Table kept for usageTrackingService.ts compatibility but should be updated or deprecated.';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Subscription tier alignment complete';
    RAISE NOTICE '💳 Stripe-compatible tiers: free, basic, pro, enterprise';
    RAISE NOTICE '💰 Pricing: $0, $99, $299, $999';
    RAISE NOTICE '🔗 Matches: src/config/stripe.ts (updated Feb 1, 2026)';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Test with:';
    RAISE NOTICE '   SELECT tier, COUNT(*) FROM subscriptions GROUP BY tier;';
END $$;
