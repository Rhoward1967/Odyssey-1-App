-- ============================================================
-- OSC Ministerial Grant Protocol
-- Adds MINISTERIAL_GRANT transaction type + RPC function
-- Managing Officer: Rickey Allan Howard
-- Howard Jones Bloodline Ancestral Trust
-- ============================================================

-- Expand the transaction type constraint to include MINISTERIAL_GRANT
ALTER TABLE osc_transactions DROP CONSTRAINT IF EXISTS osc_transactions_type_check;
ALTER TABLE osc_transactions ADD CONSTRAINT osc_transactions_type_check
  CHECK (type IN ('ACQUIRE', 'SPEND', 'BURN', 'TRANSFER', 'MINISTERIAL_GRANT'));

-- Grant function: moves OSC from Vault → user account
CREATE OR REPLACE FUNCTION grant_ministerial_osc(
  target_user_id UUID,
  grant_amount    BIGINT,
  grant_reason    TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
  current_vault   BIGINT;
  current_balance BIGINT;
  new_balance     BIGINT;
  tx_id           UUID;
BEGIN
  -- 1. Verify Vault has sufficient supply
  SELECT vault_balance INTO current_vault
  FROM osc_supply
  WHERE id = 1;

  IF current_vault IS NULL OR current_vault < grant_amount THEN
    RAISE EXCEPTION 'Insufficient Vault balance. Available: %, Requested: %',
      COALESCE(current_vault, 0), grant_amount;
  END IF;

  -- 2. Deduct from Vault
  UPDATE osc_supply
  SET vault_balance = vault_balance - grant_amount,
      updated_at    = NOW()
  WHERE id = 1;

  -- 3. Get or create target user account
  SELECT balance INTO current_balance
  FROM osc_accounts
  WHERE user_id = target_user_id;

  IF current_balance IS NULL THEN
    INSERT INTO osc_accounts (user_id, balance, total_acquired, total_spent, total_burned)
    VALUES (target_user_id, grant_amount, grant_amount, 0, 0);
    new_balance := grant_amount;
  ELSE
    UPDATE osc_accounts
    SET balance        = balance + grant_amount,
        total_acquired = total_acquired + grant_amount,
        updated_at     = NOW()
    WHERE user_id = target_user_id;
    new_balance := current_balance + grant_amount;
  END IF;

  -- 4. Record the sovereign act
  INSERT INTO osc_transactions (user_id, type, amount, burn_amount, reference)
  VALUES (target_user_id, 'MINISTERIAL_GRANT', grant_amount, 0, grant_reason)
  RETURNING id INTO tx_id;

  RETURN jsonb_build_object(
    'success',      true,
    'transaction_id', tx_id,
    'target_user',  target_user_id,
    'amount',       grant_amount,
    'new_balance',  new_balance,
    'reason',       grant_reason
  );
END;
$func$;

-- Grant the service role permission to call this function
GRANT EXECUTE ON FUNCTION grant_ministerial_osc(UUID, BIGINT, TEXT) TO service_role;
