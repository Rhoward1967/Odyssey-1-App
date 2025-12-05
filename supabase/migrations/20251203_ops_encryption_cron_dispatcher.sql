-- Odyssey-1: Secure Payments & Automation Migration
-- Includes: pgsodium encryption helpers, cron dispatcher wiring, dispatcher retry/backoff logic

-- PART 1: pgsodium Encryption Helpers
CREATE EXTENSION IF NOT EXISTS pgsodium;
CREATE SCHEMA IF NOT EXISTS ops;
CREATE TABLE IF NOT EXISTS ops.settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);
DO $$
DECLARE
  det_key_id uuid;
  nondet_key_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pgsodium.key WHERE name = 'ops_det_key') THEN
    PERFORM pgsodium.create_key(name => 'ops_det_key', key_type => 'aead-det');
  END IF;
  SELECT key_id INTO det_key_id FROM pgsodium.key WHERE name = 'ops_det_key' LIMIT 1;
  IF NOT EXISTS (SELECT 1 FROM pgsodium.key WHERE name = 'ops_nondet_key') THEN
    PERFORM pgsodium.create_key(name => 'ops_nondet_key', key_type => 'aead-ietf');
  END IF;
  SELECT key_id INTO nondet_key_id FROM pgsodium.key WHERE name = 'ops_nondet_key' LIMIT 1;
  INSERT INTO ops.settings(key, value)
  VALUES ('ops_det_key_id', det_key_id::text)
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
  INSERT INTO ops.settings(key, value)
  VALUES ('ops_nondet_key_id', nondet_key_id::text)
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
END $$;

CREATE OR REPLACE FUNCTION ops.encrypt_secret(val text)
RETURNS bytea
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  k uuid;
BEGIN
  SELECT value::uuid INTO k FROM ops.settings WHERE key = 'ops_nondet_key_id';
  IF k IS NULL THEN
    RAISE EXCEPTION 'ops_nondet_key_id missing in ops.settings';
  END IF;
  IF val IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN pgsodium.crypto_aead_ietf_encrypt(convert_to(val,'utf8'), NULL, k);
END $$;
END $$;

CREATE OR REPLACE FUNCTION ops.decrypt_secret(cipher bytea)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  k uuid;
BEGIN
  SELECT value::uuid INTO k FROM ops.settings WHERE key = 'ops_nondet_key_id';
  IF k IS NULL THEN
    RAISE EXCEPTION 'ops_nondet_key_id missing in ops.settings';
  END IF;
  IF cipher IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN convert_from(pgsodium.crypto_aead_ietf_decrypt(cipher, NULL, k),'utf8');
END $$;

CREATE OR REPLACE FUNCTION ops.encrypt_det(val text)
RETURNS bytea
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  k uuid;
BEGIN
  SELECT value::uuid INTO k FROM ops.settings WHERE key = 'ops_det_key_id';
  IF k IS NULL THEN
    RAISE EXCEPTION 'ops_det_key_id missing in ops.settings';
  END IF;
  IF val IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN pgsodium.crypto_aead_det_encrypt(convert_to(val,'utf8'), NULL, k);
END $$;
END $$;

-- Permissions

REVOKE ALL ON FUNCTION ops.encrypt_secret(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION ops.decrypt_secret(bytea) FROM PUBLIC;
REVOKE ALL ON FUNCTION ops.encrypt_det(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION ops.decrypt_det(bytea) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ops.encrypt_secret(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION ops.encrypt_det(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION ops.decrypt_secret(bytea) TO service_role;
GRANT EXECUTE ON FUNCTION ops.decrypt_det(bytea) TO service_role;

-- TEMPORARY: Grant EXECUTE to supabase_admin for test validation
GRANT EXECUTE ON FUNCTION ops.decrypt_secret(bytea) TO supabase_admin;
GRANT EXECUTE ON FUNCTION ops.decrypt_det(bytea) TO supabase_admin;

-- Final cleanup: Revoke EXECUTE from supabase_admin after test
REVOKE ALL ON FUNCTION ops.decrypt_secret(bytea) FROM supabase_admin;
REVOKE ALL ON FUNCTION ops.decrypt_det(bytea) FROM supabase_admin;

CREATE OR REPLACE VIEW ops.v_payment_methods_secure AS
SELECT

-- RLS policy: allow authenticated users to update their own customer profile fields

-- RLS policy: allow authenticated users to update their own subscriber profile fields
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
GRANT UPDATE (name, email, address, phone) ON public.subscribers TO authenticated;
CREATE POLICY users_can_update_own_subscriber_profile ON public.subscribers
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
  ops.decrypt_secret(account_number_enc) AS account_number,
  ops.decrypt_secret(routing_number_enc) AS routing_number,
  ops.decrypt_secret(taxpayer_id_enc)   AS taxpayer_id,
  last4, routing_last4, metadata, created_at, updated_at
FROM ops.payment_methods;

CREATE OR REPLACE VIEW ops.v_external_payees_secure AS
SELECT
  id, company_id, name, email, phone, address,
  ops.decrypt_secret(settlement_account_enc) AS settlement_account,
  ops.decrypt_secret(settlement_routing_enc) AS settlement_routing,
  ops.decrypt_secret(taxpayer_id_enc)         AS taxpayer_id,
  settlement_last4, routing_last4, status, metadata, created_at, updated_at
FROM ops.external_payees;

REVOKE ALL ON ops.v_payment_methods_secure FROM PUBLIC;
REVOKE ALL ON ops.v_external_payees_secure FROM PUBLIC;

-- PART 2: pg_cron Dispatcher Automation
-- (Requires pg_net extension)
CREATE OR REPLACE FUNCTION ops.run_dispatcher(company_id text, limit_rows int DEFAULT 50)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  fn_url text := current_setting('app.dispatcher_url', true);
  service_key text := current_setting('app.service_role_key', true);
  payload jsonb := jsonb_build_object('company_id', company_id, 'limit', limit_rows);
BEGIN
  IF fn_url IS NULL OR service_key IS NULL THEN
    RAISE NOTICE 'Dispatcher URL or service role key not set; skipping';
    RETURN;
  END IF;
  PERFORM net.http_post(
    url := fn_url || '/payments-dispatcher/dispatch',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'Authorization', 'Bearer '||service_key
    ),
    body := payload::text
  );
END $$;
REVOKE ALL ON FUNCTION ops.run_dispatcher(text,int) FROM PUBLIC;

-- Set config (replace with your values)
-- SELECT set_config('app.dispatcher_url', 'https://<project-ref>.functions.supabase.co', true);
-- SELECT set_config('app.service_role_key', '<SUPABASE_SERVICE_ROLE_KEY>', true);

-- Schedule with pg_cron (example for acme-co)
-- SELECT cron.schedule(
--   'ops_dispatch_acme',
--   '*/5 * * * *',
--   $$ SELECT ops.run_dispatcher('acme-co', 100); $$
-- );

-- PART 3: Dispatcher Retry/Backoff (Edge Function logic, TypeScript)
/*
// In your payments-dispatcher Edge Function:
async function updateNextAttempt(paymentId: string, attempts: number) {
  // Exponential backoff: 15min * 2^attempts, max 24h
  const delay = Math.min(15 * Math.pow(2, attempts), 24 * 60); // in minutes
  const nextAttempt = new Date(Date.now() + delay * 60 * 1000);
  await db.query(
    'UPDATE ops.outgoing_payments SET next_attempt_at = $1, attempts = $2 WHERE id = $3',
    [nextAttempt, attempts, paymentId]
  );
}
// On failure, call updateNextAttempt(paymentId, attempts+1)
// On max attempts, mark as expired/cancelled
*/

-- END OF MIGRATION
