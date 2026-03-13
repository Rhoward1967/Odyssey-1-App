-- ============================================================
-- ISO 20022: Sovereign Banking Infrastructure
-- Schema, audit tables, verification functions, pg_cron pulse
-- Locked in: March 13, 2026
-- Howard Jones Bloodline Ancestral Trust
-- ============================================================

-- 1) Schema
CREATE SCHEMA IF NOT EXISTS iso20022 AUTHORIZATION postgres;

-- 2) payments_iso_audit: immutable audit + hash-chain columns
CREATE TABLE IF NOT EXISTS iso20022.payments_iso_audit (
  audit_id          bigserial PRIMARY KEY,
  created_at        timestamptz NOT NULL DEFAULT now(),
  uetr              uuid NOT NULL,
  iso_payload       jsonb NOT NULL,
  prev_hash         text,
  entry_hash        text NOT NULL
);

-- Indexes (idempotent)
DO $idx$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'iso20022' AND indexname = 'idx_payments_iso_audit_uetr'
  ) THEN
    CREATE INDEX idx_payments_iso_audit_uetr ON iso20022.payments_iso_audit (uetr);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'iso20022' AND indexname = 'idx_payments_iso_audit_created_at'
  ) THEN
    CREATE INDEX idx_payments_iso_audit_created_at ON iso20022.payments_iso_audit (created_at);
  END IF;
END $idx$;

-- 3) system_alerts: pg_cron writes alerts here when integrity breaks are detected
CREATE TABLE IF NOT EXISTS iso20022.system_alerts (
  alert_id      serial PRIMARY KEY,
  created_at    timestamptz NOT NULL DEFAULT now(),
  uetr          uuid,
  alert_message text
);

-- 4) Hash function: fn_payments_iso_hash(text) -> text
-- Uses pgcrypto SHA-256 (enabled by default in Supabase)
CREATE OR REPLACE FUNCTION iso20022.fn_payments_iso_hash(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
RETURNS NULL ON NULL INPUT
AS $func$
  SELECT encode(digest(input, 'sha256'), 'hex');
$func$;

-- 5) Chain verification: fn_verify_chain(uetr) -> (is_valid boolean, break_at bigint)
-- Walks the chain for a given UETR ordered by created_at asc and confirms
-- prev_hash -> entry_hash linkage across all records.
-- Canonicalization: COALESCE(prev_hash,'') || '|' || iso_payload::text
CREATE OR REPLACE FUNCTION iso20022.fn_verify_chain(p_uetr uuid)
RETURNS TABLE (is_valid boolean, break_at bigint)
LANGUAGE plpgsql
STABLE
AS $func$
DECLARE
  r          RECORD;
  last_hash  text := NULL;
BEGIN
  FOR r IN
    SELECT audit_id, prev_hash, entry_hash, iso_payload
    FROM iso20022.payments_iso_audit
    WHERE uetr = p_uetr
    ORDER BY created_at ASC, audit_id ASC
  LOOP
    -- Confirm prev_hash linkage
    IF r.prev_hash IS DISTINCT FROM last_hash THEN
      RETURN QUERY SELECT false, r.audit_id;
      RETURN;
    END IF;

    -- Recompute and verify entry_hash
    IF iso20022.fn_payments_iso_hash(
         COALESCE(r.prev_hash, '') || '|' || r.iso_payload::text
       ) IS DISTINCT FROM r.entry_hash THEN
      RETURN QUERY SELECT false, r.audit_id;
      RETURN;
    END IF;

    last_hash := r.entry_hash;
  END LOOP;

  -- Empty or fully consistent chain
  RETURN QUERY SELECT true, NULL::bigint;
END;
$func$;

-- 6) pg_cron: Monday 23:55 UTC integrity pulse check (idempotent)
DO $cron_setup$
BEGIN
  PERFORM 1 FROM cron.job WHERE jobname = 'monday-pulse-check';
  IF FOUND THEN
    PERFORM cron.unschedule('monday-pulse-check');
  END IF;

  PERFORM cron.schedule(
    'monday-pulse-check',
    '55 23 * * 1',
    $cron_body$
      INSERT INTO iso20022.system_alerts (uetr, alert_message)
      SELECT uetr, 'INTEGRITY BREAK DETECTED'
      FROM iso20022.payments_iso_audit
      WHERE NOT (SELECT is_valid FROM iso20022.fn_verify_chain(uetr))
      LIMIT 1;
    $cron_body$
  );
END $cron_setup$;

-- 7) Auditor role and grants (idempotent)
DO $roles$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'iso_auditor') THEN
    CREATE ROLE iso_auditor;
  END IF;
EXCEPTION WHEN insufficient_privilege THEN
  NULL;
END $roles$;

GRANT USAGE ON SCHEMA iso20022 TO iso_auditor;
GRANT SELECT ON iso20022.payments_iso_audit TO iso_auditor;
GRANT SELECT ON iso20022.system_alerts TO iso_auditor;
GRANT EXECUTE ON FUNCTION iso20022.fn_payments_iso_hash(text) TO iso_auditor;
GRANT EXECUTE ON FUNCTION iso20022.fn_verify_chain(uuid) TO iso_auditor;
