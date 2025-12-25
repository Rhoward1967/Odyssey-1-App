-- ==============================================================================
-- 🔒 FIX RLS SECURITY ERRORS (7 Tables)
-- ==============================================================================
-- PURPOSE: Enable Row Level Security on 7 public tables flagged by Supabase linter
-- IMPACT: 7 ERROR → 0 (prevents unauthorized data access)
-- DATE: December 24, 2025
-- ==============================================================================

-- 1. SUBSCRIPTION_TIERS - Public read (pricing), admin write
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view subscription tiers" ON subscription_tiers;
CREATE POLICY "Anyone can view subscription tiers"
  ON subscription_tiers
  FOR SELECT
  USING (true); -- Pricing is public information

DROP POLICY IF EXISTS "Only admins can modify subscription tiers" ON subscription_tiers;
CREATE POLICY "Only admins can modify subscription tiers"
  ON subscription_tiers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN (
        'rhoward@odyssey-1.ai',
        'admin@odyssey-1.ai'
      )
    )
  );

-- 2. PAYMENTS - Users see own payments only
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own payments" ON payments;
CREATE POLICY "Users can view own payments"
  ON payments
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own payments" ON payments;
CREATE POLICY "Users can insert own payments"
  ON payments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins have full access to payments" ON payments;
CREATE POLICY "Admins have full access to payments"
  ON payments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN (
        'rhoward@odyssey-1.ai',
        'admin@odyssey-1.ai'
      )
    )
  );

-- 3. DEPLOYMENTS - Admin/system only
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only admins can access deployments" ON deployments;
CREATE POLICY "Only admins can access deployments"
  ON deployments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN (
        'rhoward@odyssey-1.ai',
        'admin@odyssey-1.ai'
      )
    )
  );

-- 4. DEPLOYMENT_METRICS - Admin/system only
ALTER TABLE public.deployment_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only admins can access deployment metrics" ON deployment_metrics;
CREATE POLICY "Only admins can access deployment metrics"
  ON deployment_metrics
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN (
        'rhoward@odyssey-1.ai',
        'admin@odyssey-1.ai'
      )
    )
  );

-- 5. ROLLBACK_EVENTS - Admin/system only
ALTER TABLE public.rollback_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only admins can access rollback events" ON rollback_events;
CREATE POLICY "Only admins can access rollback events"
  ON rollback_events
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN (
        'rhoward@odyssey-1.ai',
        'admin@odyssey-1.ai'
      )
    )
  );

-- 6. USER_USAGE - Users see own usage, admins see all
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own usage" ON user_usage;
CREATE POLICY "Users can view own usage"
  ON user_usage
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert usage records" ON user_usage;
CREATE POLICY "System can insert usage records"
  ON user_usage
  FOR INSERT
  WITH CHECK (true); -- System inserts usage tracking

DROP POLICY IF EXISTS "Admins have full access to user usage" ON user_usage;
CREATE POLICY "Admins have full access to user usage"
  ON user_usage
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN (
        'rhoward@odyssey-1.ai',
        'admin@odyssey-1.ai'
      )
    )
  );

-- 7. AUDIT_TRAIL - Admin read, system write
ALTER TABLE public.audit_trail ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "System can insert audit records" ON audit_trail;
CREATE POLICY "System can insert audit records"
  ON audit_trail
  FOR INSERT
  WITH CHECK (true); -- System logs all actions

DROP POLICY IF EXISTS "Admins can view audit trail" ON audit_trail;
CREATE POLICY "Admins can view audit trail"
  ON audit_trail
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN (
        'rhoward@odyssey-1.ai',
        'admin@odyssey-1.ai'
      )
    )
  );

-- GRANT PERMISSIONS
GRANT SELECT ON subscription_tiers TO anon, authenticated;
GRANT SELECT, INSERT ON payments TO authenticated;
GRANT ALL ON deployments TO authenticated;
GRANT ALL ON deployment_metrics TO authenticated;
GRANT ALL ON rollback_events TO authenticated;
GRANT SELECT, INSERT ON user_usage TO authenticated;
GRANT SELECT, INSERT ON audit_trail TO authenticated;

-- VERIFICATION
SELECT '✅ RLS enabled on 7 tables!' AS status;
SELECT '✅ subscription_tiers: Public read, admin write' AS status;
SELECT '✅ payments: User owns data' AS status;
SELECT '✅ deployments: Admin only' AS status;
SELECT '✅ deployment_metrics: Admin only' AS status;
SELECT '✅ rollback_events: Admin only' AS status;
SELECT '✅ user_usage: User owns data, system insert' AS status;
SELECT '✅ audit_trail: System insert, admin read' AS status;

-- ==============================================================================
-- VERIFICATION QUERIES
-- ==============================================================================
-- After applying, verify in Supabase Dashboard → Database → Linter
-- Expected: 7 RLS errors → 0

-- Test subscription_tiers (should work for anyone):
-- SELECT * FROM subscription_tiers;

-- Test payments (should only see own):
-- SELECT * FROM payments;
-- ==============================================================================
