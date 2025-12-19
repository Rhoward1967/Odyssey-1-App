-- Performance Indexes and Security Hardening
-- Created: 2025-12-17

-- ============================================================================
-- 1. FOREIGN KEY INDEXES (Performance)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_cleaning_plans_user_id 
  ON public.cleaning_plans(user_id);

CREATE INDEX IF NOT EXISTS idx_commission_payouts_bidder_id 
  ON public.commission_payouts(bidder_id);

CREATE INDEX IF NOT EXISTS idx_commission_payouts_billing_id 
  ON public.commission_payouts(billing_id);

CREATE INDEX IF NOT EXISTS idx_ops_error_patterns_approved_by 
  ON ops.error_patterns(approved_by);

-- ============================================================================
-- 2. SUBSCRIPTIONS INDEXES (For Realtime Performance)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id 
  ON public.subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_status 
  ON public.subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id 
  ON public.subscriptions(stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id 
  ON public.subscriptions(stripe_customer_id);

-- ============================================================================
-- 3. FIX STAGING TABLE (Security & Structure)
-- ============================================================================

-- Disable RLS for internal staging table
ALTER TABLE IF EXISTS public.staging_contacts_raw 
  DISABLE ROW LEVEL SECURITY;

-- Add primary key for proper table structure
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'staging_contacts_raw' 
    AND column_name = 'id'
  ) THEN
    ALTER TABLE public.staging_contacts_raw 
      ADD COLUMN id bigserial PRIMARY KEY;
  END IF;
END $$;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Performance indexes created successfully';
  RAISE NOTICE '✅ Subscriptions indexes optimized for realtime';
  RAISE NOTICE '✅ Staging table security configured';
END $$;
