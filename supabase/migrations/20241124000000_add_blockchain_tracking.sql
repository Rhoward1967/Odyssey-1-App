-- Add blockchain transaction tracking to existing trades table
-- Safe migration: adds nullable columns, won't break existing data

-- Add blockchain-related columns to trades table
ALTER TABLE trades
ADD COLUMN IF NOT EXISTS tx_hash TEXT,
ADD COLUMN IF NOT EXISTS gas_used TEXT,
ADD COLUMN IF NOT EXISTS block_number BIGINT,
ADD COLUMN IF NOT EXISTS chain_id INTEGER DEFAULT 137, -- Polygon mainnet
ADD COLUMN IF NOT EXISTS confirmations INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS slippage DECIMAL(5,2) DEFAULT 0.5;

-- Create index for fast lookup by transaction hash
CREATE INDEX IF NOT EXISTS idx_trades_tx_hash ON trades(tx_hash) WHERE tx_hash IS NOT NULL;

-- Create index for fast lookup by blockchain status
CREATE INDEX IF NOT EXISTS idx_trades_blockchain ON trades(chain_id, block_number) WHERE block_number IS NOT NULL;

-- Add comment explaining new columns
COMMENT ON COLUMN trades.tx_hash IS 'Blockchain transaction hash for live trades';
COMMENT ON COLUMN trades.gas_used IS 'Gas used in wei for blockchain transaction';
COMMENT ON COLUMN trades.block_number IS 'Block number where transaction was confirmed';
COMMENT ON COLUMN trades.chain_id IS 'Blockchain network ID (137=Polygon, 1=Ethereum)';
COMMENT ON COLUMN trades.confirmations IS 'Number of block confirmations received';
COMMENT ON COLUMN trades.slippage IS 'Slippage tolerance percentage used for trade';

-- Grant necessary permissions (adjust based on your RLS policies)
-- These are just examples - modify based on your actual security model
-- ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- Note: Paper trades will have NULL values for blockchain columns
-- Note: This migration is backwards compatible - existing rows remain unchanged
