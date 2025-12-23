-- Create missing trading tables and enhance trades table
-- Migration: 20251222_create_trading_tables.sql

-- Add trading_platform column to trades table to differentiate sources
ALTER TABLE trades
ADD COLUMN IF NOT EXISTS trading_platform VARCHAR(50) DEFAULT 'paper';

COMMENT ON COLUMN trades.trading_platform IS 'Trading platform: paper, metamask, coinbase, uphold';

-- Create index for filtering by platform
CREATE INDEX IF NOT EXISTS idx_trades_platform ON trades(trading_platform, created_at DESC);

-- Create user_portfolio table (portfolio snapshots)
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

CREATE INDEX IF NOT EXISTS idx_user_portfolio_user ON user_portfolio(user_id);
CREATE INDEX IF NOT EXISTS idx_user_portfolio_platform ON user_portfolio(platform);

COMMENT ON TABLE user_portfolio IS 'User portfolio holdings across all platforms';

-- Enable RLS
ALTER TABLE user_portfolio ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_portfolio_select ON user_portfolio
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY user_portfolio_insert ON user_portfolio
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_portfolio_update ON user_portfolio
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create trade_history table (denormalized trade view for fast queries)
CREATE TABLE IF NOT EXISTS trade_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Trade details
  symbol VARCHAR(20) NOT NULL,
  amount DECIMAL(20, 8) NOT NULL,
  price DECIMAL(20, 8) NOT NULL,
  type VARCHAR(10) NOT NULL, -- 'buy' or 'sell'
  status VARCHAR(20) NOT NULL DEFAULT 'completed', -- 'pending', 'completed', 'failed', 'cancelled'
  
  -- Platform tracking
  platform VARCHAR(50) NOT NULL, -- 'coinbase', 'metamask', 'uphold'
  
  -- External references
  trade_id UUID REFERENCES trades(id) ON DELETE SET NULL,
  external_order_id TEXT, -- Platform-specific order ID
  
  -- Blockchain data (for DEX trades)
  tx_hash TEXT,
  block_number BIGINT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trade_history_user ON trade_history(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_trade_history_platform ON trade_history(platform);
CREATE INDEX IF NOT EXISTS idx_trade_history_symbol ON trade_history(symbol);
CREATE INDEX IF NOT EXISTS idx_trade_history_tx_hash ON trade_history(tx_hash) WHERE tx_hash IS NOT NULL;

COMMENT ON TABLE trade_history IS 'Denormalized trade history for fast queries across all platforms';

-- Enable RLS
ALTER TABLE trade_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY trade_history_select ON trade_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY trade_history_insert ON trade_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON user_portfolio TO authenticated;
GRANT SELECT, INSERT ON trade_history TO authenticated;
GRANT ALL ON user_portfolio, trade_history TO service_role;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Trading tables migration complete!';
  RAISE NOTICE '   - Added trading_platform column to trades table';
  RAISE NOTICE '   - Created user_portfolio table';
  RAISE NOTICE '   - Created trade_history table';
  RAISE NOTICE '   - Applied RLS policies';
  RAISE NOTICE '   - Created indexes for performance';
END $$;
