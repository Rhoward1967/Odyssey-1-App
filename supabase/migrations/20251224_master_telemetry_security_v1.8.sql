-- ==============================================================================
-- 🛡️ ODYSSEY-1: MASTER TELEMETRY & SECURITY HARDENING (v1.8)
-- ==============================================================================
-- PURPOSE: Pin search_path, upgrade to SECURITY DEFINER, and optimize indexes.
-- TARGETS: capture_performance_snapshot, log_deployment, performance_snapshots.
-- SECURITY FIX: Safe DROP before recreate to handle signature changes.
-- AUTHOR: R.O.M.A.N. Architect
-- DATE: December 24, 2025
-- ==============================================================================

-- 0. INFRASTRUCTURE ADJUSTMENT
-- Ensuring the deployments table supports the new forensic commit tracking.
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'deployments' AND column_name = 'commit_sha'
    ) THEN
        ALTER TABLE public.deployments ADD COLUMN commit_sha text;
    END IF;
END $$;

-- 1. HARDEN: capture_performance_snapshot
-- Pinned to SECURITY DEFINER to allow reading pg_stat_activity.
-- Pinned to search_path = public, extensions, pg_temp (safer order).
CREATE OR REPLACE FUNCTION public.capture_performance_snapshot()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
    v_avg_resp numeric;
    v_p95_resp numeric;
    v_p99_resp numeric;
    v_active_conn int;
    v_active_users int;
    v_rev_today numeric;
BEGIN
    -- A. Calculate Forensic Metrics (Percentile-based for accuracy)
    SELECT 
        COALESCE(avg(value), 0),
        COALESCE(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY value), 0),
        COALESCE(PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY value), 0)
    INTO v_avg_resp, v_p95_resp, v_p99_resp
    FROM public.system_metrics
    WHERE metric_type = 'api_response_time' 
      AND timestamp > now() - interval '5 minutes';

    -- B. Count Active DB Connections (Requires SECURITY DEFINER)
    SELECT count(*) INTO v_active_conn FROM pg_stat_activity;

    -- C. Count Active Sessions
    SELECT count(*) INTO v_active_users 
    FROM public.user_sessions 
    WHERE last_activity > now() - interval '15 minutes' 
      AND ended_at IS NULL;

    -- D. Calculate Revenue Today
    SELECT COALESCE(sum(total_amount), 0) INTO v_rev_today
    FROM public.invoices
    WHERE created_at::date = current_date
      AND status = 'paid';

    -- E. Forensic Injection
    INSERT INTO public.performance_snapshots (
      avg_response_time_ms,
      p95_response_time_ms,
      p99_response_time_ms,
      active_connections,
      active_users_now,
      revenue_today,
      timestamp
    )
    VALUES (
      v_avg_resp,
      v_p95_resp,
      v_p99_resp,
      v_active_conn,
      v_active_users,
      v_rev_today,
      now()
    );
END;
$$;

-- 2. SAFE DROP: Remove dependent triggers and existing log_deployment variants
-- Handles signature evolution across multiple versions
DO $$
DECLARE
    func_record RECORD;
BEGIN
    -- A. Drop dependent trigger first to avoid 2BP01 error
    IF EXISTS (
        SELECT 1 FROM pg_trigger t
        JOIN pg_class c ON c.oid = t.tgrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
          AND c.relname = 'system_knowledge'
          AND t.tgname = 'deployment_logger'
    ) THEN
        DROP TRIGGER deployment_logger ON public.system_knowledge;
    END IF;

    -- B. Drop all variants of log_deployment in public schema
    FOR func_record IN 
        SELECT p.oid::regprocedure::text AS func_signature
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public'
          AND p.proname = 'log_deployment'
    LOOP
        EXECUTE 'DROP FUNCTION ' || func_record.func_signature;
    END LOOP;
END $$;

-- 3. HARDEN: log_deployment (NEW SIGNATURE)
-- Corrected to use SECURITY DEFINER and pinned search_path for vulnerability resolution.
-- Supports commit_sha for enhanced CI/CD tracking.
CREATE FUNCTION public.log_deployment(
  p_version text,
  p_commit_sha text,
  p_env text,
  p_initiated_by uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
  INSERT INTO public.deployments (
    version,
    commit_sha,
    environment,
    initiated_by,
    metadata
  )
  VALUES (
    p_version,
    p_commit_sha,
    p_env,
    p_initiated_by,
    p_metadata
  );
END;
$$;

-- 4. GOVERNANCE LOCKDOWN
REVOKE ALL ON FUNCTION public.capture_performance_snapshot() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.log_deployment(text, text, text, uuid, jsonb) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.capture_performance_snapshot() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.log_deployment(text, text, text, uuid, jsonb) TO authenticated, service_role;

-- 4B. RECREATE DEPLOYMENT TRIGGER
-- Restore the trigger on system_knowledge for automatic deployment logging
CREATE OR REPLACE FUNCTION public.trigger_log_deployment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
    -- Only log if category is 'deployment'
    IF NEW.category = 'deployment' THEN
        PERFORM public.log_deployment(
            (NEW.content->>'version')::text,
            COALESCE((NEW.content->>'commit_sha')::text, 'unknown'),
            (NEW.content->>'environment')::text,
            (NEW.content->>'initiated_by')::uuid,
            COALESCE(NEW.content->'metadata', '{}'::jsonb)
        );
    END IF;
    RETURN NEW;
END;
$$;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS deployment_logger ON public.system_knowledge;
CREATE TRIGGER deployment_logger
    AFTER INSERT ON public.system_knowledge
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_log_deployment();

-- 5. PERFORMANCE INDEXING
CREATE INDEX IF NOT EXISTS idx_system_metrics_telemetry ON public.system_metrics (timestamp, metric_type);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON public.user_sessions (last_activity, ended_at);
CREATE INDEX IF NOT EXISTS idx_invoices_revenue_stats ON public.invoices (created_at, status);

-- 6. REFRESH & VERIFY
NOTIFY pgrst, 'reload schema';

-- Final status output
SELECT '🟢 MASTER HARDENING v1.8 COMPLETE: All functions secured with signature-safe DROP/CREATE.' AS status;
