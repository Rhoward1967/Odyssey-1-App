-- Corrective migration: Apply all missing trading infrastructure
-- Migration: 20251222_fix_trading_infrastructure.sql
-- This migration is idempotent and will only create missing structures

-- ============================================================================
-- PART 1: TRADES TABLE ENHANCEMENTS
-- ============================================================================

-- Add trading_platform column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'trades' 
    AND column_name = 'trading_platform'
  ) THEN
    ALTER TABLE trades ADD COLUMN trading_platform VARCHAR(50) DEFAULT 'paper';
    COMMENT ON COLUMN trades.trading_platform IS 'Trading platform: paper, metamask, coinbase, uphold';
    RAISE NOTICE '✅ Added trading_platform column to trades';
  ELSE
    RAISE NOTICE '⏭️  trading_platform column already exists';
  END IF;
END $$;

-- Create index for trades.trading_platform
CREATE INDEX IF NOT EXISTS idx_trades_platform ON trades(trading_platform, created_at DESC);

-- ============================================================================
-- PART 2: USER_PORTFOLIO TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Asset details
  symbol VARCHAR(20) NOT NULL,
  balance DECIMAL(20, 8) NOT NULL DEFAULT 0,
  value DECIMAL(20, 2) NOT NULL DEFAULT 0,
  change DECIMAL(10, 2) DEFAULT 0, -- 24h change percentage
  
  -- Platform tracking
  platform VARCHAR(50) NOT NULL, -- 'coinbase', 'metamask', 'uphold'
  
  -- Timestamps
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one portfolio entry per user/symbol/platform
  UNIQUE(user_id, symbol, platform)
);

COMMENT ON TABLE user_portfolio IS 'User portfolio holdings across all platforms';

-- Create indexes for user_portfolio
CREATE INDEX IF NOT EXISTS idx_user_portfolio_user ON user_portfolio(user_id);
CREATE INDEX IF NOT EXISTS idx_user_portfolio_user_platform ON user_portfolio(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_user_portfolio_platform ON user_portfolio(platform);

-- Enable RLS on user_portfolio
ALTER TABLE user_portfolio ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to make idempotent)
DROP POLICY IF EXISTS user_portfolio_select ON user_portfolio;
DROP POLICY IF EXISTS user_portfolio_insert ON user_portfolio;
DROP POLICY IF EXISTS user_portfolio_update ON user_portfolio;

-- Create RLS policies for user_portfolio
CREATE POLICY user_portfolio_select ON user_portfolio
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY user_portfolio_insert ON user_portfolio
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_portfolio_update ON user_portfolio
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- PART 3: TRADE_HISTORY TABLE ENHANCEMENTS
-- ============================================================================

-- Add CHECK constraints to trade_history
DO $$
BEGIN
  -- Add type constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'trade_history_type_check' 
    AND conrelid = 'trade_history'::regclass
  ) THEN
    ALTER TABLE trade_history ADD CONSTRAINT trade_history_type_check 
      CHECK (type IN ('buy', 'sell'));
    RAISE NOTICE '✅ Added trade_history_type_check constraint';
  ELSE
    RAISE NOTICE '⏭️  trade_history_type_check constraint already exists';
  END IF;

  -- Add status constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'trade_history_status_check' 
    AND conrelid = 'trade_history'::regclass
  ) THEN
    ALTER TABLE trade_history ADD CONSTRAINT trade_history_status_check 
      CHECK (status IN ('pending', 'completed', 'failed', 'cancelled'));
    RAISE NOTICE '✅ Added trade_history_status_check constraint';
  ELSE
    RAISE NOTICE '⏭️  trade_history_status_check constraint already exists';
  END IF;
END $$;

-- Create missing indexes for trade_history
CREATE INDEX IF NOT EXISTS idx_trade_history_user_platform ON trade_history(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_trade_history_pending ON trade_history(user_id, timestamp DESC) 
  WHERE status = 'pending';

COMMENT ON INDEX idx_trade_history_pending IS 'Optimized index for querying pending trades by user';

-- ============================================================================
-- PART 4: RLS POLICIES
-- ============================================================================

-- Drop and recreate trade_history UPDATE policy with immutability checks
DROP POLICY IF EXISTS trade_history_update ON trade_history;

CREATE POLICY trade_history_update ON trade_history
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id 
    AND platform = (SELECT platform FROM trade_history WHERE id = trade_history.id)
  );

COMMENT ON POLICY trade_history_update ON trade_history IS 
  'Allows updates only to own trades, prevents changing user_id or platform';

-- ============================================================================
-- PART 5: GRANTS
-- ============================================================================

-- Grant permissions on user_portfolio
GRANT SELECT, INSERT, UPDATE ON user_portfolio TO authenticated;
GRANT ALL ON user_portfolio TO service_role;

-- Grant permissions on trade_history
GRANT SELECT, INSERT, UPDATE ON trade_history TO authenticated;
GRANT ALL ON trade_history TO service_role;

-- ============================================================================
-- PART 6: VALIDATION
-- ============================================================================

DO $$
DECLARE
  v_constraints INTEGER;
  v_indexes INTEGER;
  v_policies INTEGER;
  v_grants_portfolio INTEGER;
  v_grants_history INTEGER;
BEGIN
  -- Check constraints
  SELECT COUNT(*) INTO v_constraints
  FROM pg_constraint
  WHERE conrelid = 'trade_history'::regclass
    AND conname IN ('trade_history_type_check', 'trade_history_status_check');

  -- Check indexes (7 expected)
  SELECT COUNT(*) INTO v_indexes
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND indexname IN (
      'idx_trades_platform',
      'idx_user_portfolio_user',
      'idx_user_portfolio_user_platform',
      'idx_user_portfolio_platform',
      'idx_trade_history_user_platform',
      'idx_trade_history_pending'
    );

  -- Check policies
  SELECT COUNT(*) INTO v_policies
  FROM pg_policies
  WHERE tablename IN ('user_portfolio', 'trade_history');

  -- Check grants
  SELECT COUNT(*) INTO v_grants_portfolio
  FROM information_schema.table_privileges
  WHERE table_name = 'user_portfolio'
    AND grantee = 'authenticated'
    AND privilege_type IN ('SELECT', 'INSERT', 'UPDATE');

  SELECT COUNT(*) INTO v_grants_history
  FROM information_schema.table_privileges
  WHERE table_name = 'trade_history'
    AND grantee = 'authenticated'
    AND privilege_type IN ('SELECT', 'INSERT', 'UPDATE');

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TRADING INFRASTRUCTURE VALIDATION';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'CHECK Constraints: % / 2 expected', v_constraints;
  RAISE NOTICE 'Indexes: % / 6 expected', v_indexes;
  RAISE NOTICE 'RLS Policies: % total', v_policies;
  RAISE NOTICE 'Grants (user_portfolio): % / 3 expected', v_grants_portfolio;
  RAISE NOTICE 'Grants (trade_history): % / 3 expected', v_grants_history;
  RAISE NOTICE '========================================';
  
  IF v_constraints = 2 AND v_indexes >= 6 AND v_grants_portfolio = 3 AND v_grants_history = 3 THEN
    RAISE NOTICE '✅ ALL VALIDATIONS PASSED!';
  ELSE
    RAISE NOTICE '⚠️  Some validations incomplete - check details above';
  END IF;
END $$;
