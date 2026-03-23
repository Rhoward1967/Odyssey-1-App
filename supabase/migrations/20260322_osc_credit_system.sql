-- ============================================================
-- OSC Credit System — Ledger Schema
-- O-1 Sovereignty Credit (OSC) — Odyssey-1 AI LLC
-- March 22, 2026
-- ============================================================

-- OSC Account per user
CREATE TABLE IF NOT EXISTS osc_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance BIGINT NOT NULL DEFAULT 0 CHECK (balance >= 0),
  total_acquired BIGINT NOT NULL DEFAULT 0,
  total_spent BIGINT NOT NULL DEFAULT 0,
  total_burned BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- OSC Transaction ledger
CREATE TABLE IF NOT EXISTS osc_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('ACQUIRE', 'SPEND', 'BURN', 'TRANSFER')),
  amount BIGINT NOT NULL CHECK (amount > 0),
  burn_amount BIGINT NOT NULL DEFAULT 0,
  service_tier TEXT CHECK (service_tier IN ('LOGIC', 'BLUEPRINT', 'GUARDIAN', 'SOVEREIGN')),
  payment_method TEXT CHECK (payment_method IN ('USD', 'BTC', 'ETH')),
  payment_amount NUMERIC(20, 8),
  payment_currency TEXT,
  reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Global supply state (single row)
CREATE TABLE IF NOT EXISTS osc_supply (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),  -- enforces single row
  total_supply BIGINT NOT NULL DEFAULT 7600000000,
  vault_balance BIGINT NOT NULL DEFAULT 3800000000,
  public_forge_remaining BIGINT NOT NULL DEFAULT 2280000000,
  expansion_reserve BIGINT NOT NULL DEFAULT 1520000000,
  total_burned BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initialize supply state
INSERT INTO osc_supply (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- OSC Price oracle cache
CREATE TABLE IF NOT EXISTS osc_price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  currency TEXT NOT NULL CHECK (currency IN ('BTC', 'ETH')),
  price_usd NUMERIC(20, 2) NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RPC FUNCTIONS
-- ============================================================

-- Reduce public forge supply when OSC is issued
CREATE OR REPLACE FUNCTION reduce_public_forge(amount BIGINT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
  UPDATE osc_supply
  SET
    public_forge_remaining = public_forge_remaining - amount,
    updated_at = NOW()
  WHERE id = 1
    AND public_forge_remaining >= amount;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient Public Forge supply';
  END IF;
END;
$func$;

-- Record global burn event
CREATE OR REPLACE FUNCTION record_burn(amount BIGINT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
  UPDATE osc_supply
  SET
    total_burned = total_burned + amount,
    updated_at = NOW()
  WHERE id = 1;
END;
$func$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE osc_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE osc_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE osc_supply ENABLE ROW LEVEL SECURITY;
ALTER TABLE osc_price_history ENABLE ROW LEVEL SECURITY;

-- Users can read and update only their own account
CREATE POLICY "Users manage own OSC account"
  ON osc_accounts
  FOR ALL
  USING (auth.uid() = user_id);

-- Users can read only their own transactions
CREATE POLICY "Users read own transactions"
  ON osc_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert transactions (system writes)
CREATE POLICY "Service role writes transactions"
  ON osc_transactions
  FOR INSERT
  WITH CHECK (true);

-- Supply state is read-only for users
CREATE POLICY "Users read supply state"
  ON osc_supply
  FOR SELECT
  USING (true);

-- Price history is readable by all
CREATE POLICY "Users read price history"
  ON osc_price_history
  FOR SELECT
  USING (true);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_osc_accounts_user_id ON osc_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_osc_transactions_user_id ON osc_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_osc_transactions_type ON osc_transactions(type);
CREATE INDEX IF NOT EXISTS idx_osc_transactions_created_at ON osc_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_osc_price_history_currency ON osc_price_history(currency, fetched_at DESC);

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE osc_accounts IS
  'O-1 Sovereignty Credit (OSC) account per user — closed-loop utility ledger';

COMMENT ON TABLE osc_supply IS
  'Global OSC supply state — single row, 7.6B total fixed supply';

COMMENT ON TABLE osc_transactions IS
  'Immutable OSC transaction log — ACQUIRE, SPEND, BURN, TRANSFER';
