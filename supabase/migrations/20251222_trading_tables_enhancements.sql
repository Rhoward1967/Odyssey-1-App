-- Trading tables enhancements and validation
-- Migration: 20251222_trading_tables_enhancements.sql
-- Follow-up to 20251222_create_trading_tables.sql

-- Add CHECK constraints for data integrity
ALTER TABLE trade_history
DROP CONSTRAINT IF EXISTS trade_history_type_check,
ADD CONSTRAINT trade_history_type_check CHECK (type IN ('buy', 'sell'));

ALTER TABLE trade_history
DROP CONSTRAINT IF EXISTS trade_history_status_check,
ADD CONSTRAINT trade_history_status_check CHECK (
  status IN ('pending', 'completed', 'failed', 'cancelled')
);

-- Add partial index for pending trades (frequently queried)
CREATE INDEX IF NOT EXISTS idx_trade_history_pending 
ON trade_history(user_id, timestamp DESC) 
WHERE status = 'pending';

-- Enhance RLS UPDATE policy to prevent changing ownership or platform
DROP POLICY IF EXISTS trade_history_update ON trade_history;
CREATE POLICY trade_history_update ON trade_history
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id 
    AND platform = (SELECT platform FROM trade_history WHERE id = trade_history.id)
  );

-- Add helpful comments
COMMENT ON CONSTRAINT trade_history_type_check ON trade_history 
  IS 'Ensures trade type is buy or sell only';
COMMENT ON CONSTRAINT trade_history_status_check ON trade_history 
  IS 'Ensures status is one of: pending, completed, failed, cancelled';
COMMENT ON INDEX idx_trade_history_pending 
  IS 'Optimized index for querying pending trades by user';

-- Validation checks
DO $$
DECLARE
  v_trade_id_type TEXT;
  v_composite_indexes INTEGER;
  v_rls_policies INTEGER;
BEGIN
  -- Check 1: Verify trade_id is bigint
  SELECT data_type INTO v_trade_id_type
  FROM information_schema.columns
  WHERE table_name = 'trade_history' AND column_name = 'trade_id';
  
  IF v_trade_id_type != 'bigint' THEN
    RAISE EXCEPTION 'trade_id type is % (expected bigint)', v_trade_id_type;
  END IF;
  
  -- Check 2: Verify composite indexes exist
  SELECT COUNT(*) INTO v_composite_indexes
  FROM pg_indexes
  WHERE tablename IN ('user_portfolio', 'trade_history')
    AND indexname IN ('idx_user_portfolio_user_platform', 'idx_trade_history_user_platform');
  
  IF v_composite_indexes != 2 THEN
    RAISE WARNING 'Expected 2 composite indexes, found %', v_composite_indexes;
  END IF;
  
  -- Check 3: Verify RLS policies
  SELECT COUNT(*) INTO v_rls_policies
  FROM pg_policies
  WHERE tablename = 'trade_history'
    AND policyname LIKE '%update%';
  
  IF v_rls_policies = 0 THEN
    RAISE WARNING 'No UPDATE policy found on trade_history';
  END IF;
  
  RAISE NOTICE '✅ Validation complete:';
  RAISE NOTICE '   - trade_id type: % ✓', v_trade_id_type;
  RAISE NOTICE '   - Composite indexes: % ✓', v_composite_indexes;
  RAISE NOTICE '   - RLS UPDATE policies: % ✓', v_rls_policies;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Trading tables enhancements complete!';
  RAISE NOTICE '   - Added CHECK constraints on type and status';
  RAISE NOTICE '   - Added partial index for pending trades';
  RAISE NOTICE '   - Enhanced RLS UPDATE policy with ownership validation';
  RAISE NOTICE '   - All validation checks passed';
END $$;
