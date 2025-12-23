-- Fix grants visibility and tighten RLS UPDATE policy
-- Migration: 20251222_fix_grants_and_policy.sql

-- ============================================================================
-- PART 1: EXPLICIT GRANTS WITH ACL VERIFICATION
-- ============================================================================

-- Revoke existing to ensure clean state
REVOKE ALL ON user_portfolio FROM authenticated;
REVOKE ALL ON trade_history FROM authenticated;

-- Grant permissions on user_portfolio
GRANT SELECT ON user_portfolio TO authenticated;
GRANT INSERT ON user_portfolio TO authenticated;
GRANT UPDATE ON user_portfolio TO authenticated;

-- Grant permissions on trade_history  
GRANT SELECT ON trade_history TO authenticated;
GRANT INSERT ON trade_history TO authenticated;
GRANT UPDATE ON trade_history TO authenticated;

-- Ensure service_role has full access
GRANT ALL ON user_portfolio TO service_role;
GRANT ALL ON trade_history TO service_role;

-- ============================================================================
-- PART 2: TIGHTEN UPDATE POLICY (user_id + platform immutability)
-- ============================================================================

-- Drop and recreate trade_history UPDATE policy with explicit immutability
DROP POLICY IF EXISTS trade_history_update ON trade_history;

CREATE POLICY trade_history_update ON trade_history
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id 
    AND user_id = (SELECT user_id FROM trade_history WHERE id = trade_history.id)
    AND platform = (SELECT platform FROM trade_history WHERE id = trade_history.id)
  );

COMMENT ON POLICY trade_history_update ON trade_history IS 
  'Allows updates only to own trades, prevents changing user_id or platform (enforces immutability)';

-- ============================================================================
-- PART 3: VALIDATION
-- ============================================================================

DO $$
DECLARE
  v_portfolio_acl TEXT;
  v_history_acl TEXT;
  v_policy_check TEXT;
BEGIN
  -- Check ACLs directly from pg_class
  SELECT relacl::TEXT INTO v_portfolio_acl
  FROM pg_class 
  WHERE relname = 'user_portfolio' AND relnamespace = 'public'::regnamespace;
  
  SELECT relacl::TEXT INTO v_history_acl
  FROM pg_class 
  WHERE relname = 'trade_history' AND relnamespace = 'public'::regnamespace;

  -- Check UPDATE policy WITH CHECK clause
  SELECT pg_get_expr(polwithcheck, polrelid) INTO v_policy_check
  FROM pg_policy
  WHERE polname = 'trade_history_update' AND polrelid = 'trade_history'::regclass;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'GRANTS AND POLICY VALIDATION';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'user_portfolio ACL: %', v_portfolio_acl;
  RAISE NOTICE 'trade_history ACL: %', v_history_acl;
  RAISE NOTICE '';
  RAISE NOTICE 'trade_history_update WITH CHECK:';
  RAISE NOTICE '%', v_policy_check;
  RAISE NOTICE '========================================';
  
  IF v_portfolio_acl IS NOT NULL AND v_history_acl IS NOT NULL THEN
    IF v_portfolio_acl LIKE '%authenticated=%' AND v_history_acl LIKE '%authenticated=%' THEN
      RAISE NOTICE '✅ Grants visible in pg_class ACLs';
    ELSE
      RAISE NOTICE '⚠️  Grants present but authenticated role may not be explicitly listed';
    END IF;
  ELSE
    RAISE NOTICE '❌ ACLs not found';
  END IF;
  
  IF v_policy_check LIKE '%user_id%' AND v_policy_check LIKE '%platform%' THEN
    RAISE NOTICE '✅ UPDATE policy enforces user_id + platform immutability';
  ELSE
    RAISE NOTICE '⚠️  UPDATE policy may not enforce both fields';
  END IF;
END $$;
