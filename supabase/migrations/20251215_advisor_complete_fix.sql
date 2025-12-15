-- Fix Advisor warnings: Function search_path + View ownership
-- Author: Supabase Advisor + GitHub Copilot
-- Date: 2025-12-15
-- Purpose: Lock search_path on SECURITY DEFINER functions, normalize view ownership

-- ============================================================================
-- PART 1: Harden SECURITY DEFINER functions with fixed search_path
-- ============================================================================

-- 1) ops.fn_log_change() - Trigger function for change logging
CREATE OR REPLACE FUNCTION ops.fn_log_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ops, public, pg_catalog
AS $$
DECLARE
  v_src text := TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME;
  v_msg text;
  v_meta jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_msg := TG_OP || ' on ' || v_src;
    v_meta := jsonb_build_object('old', to_jsonb(OLD));
  ELSIF TG_OP = 'INSERT' THEN
    v_msg := TG_OP || ' on ' || v_src;
    v_meta := jsonb_build_object('new', to_jsonb(NEW));
  ELSE
    v_msg := TG_OP || ' on ' || v_src;
    v_meta := jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW));
  END IF;

  -- Fully qualified table reference
  INSERT INTO public.system_logs(source, level, message, metadata)
  VALUES (v_src, 'info', v_msg, v_meta);

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Restrict execution to necessary roles only
REVOKE ALL ON FUNCTION ops.fn_log_change() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ops.fn_log_change() TO postgres;
GRANT EXECUTE ON FUNCTION ops.fn_log_change() TO service_role;

COMMENT ON FUNCTION ops.fn_log_change() IS 'SECURITY DEFINER trigger function with locked search_path - logs changes to system_logs';


-- 2) ops.insert_heartbeat_alert() - Heartbeat alert function
CREATE OR REPLACE FUNCTION ops.insert_heartbeat_alert()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ops, public, pg_catalog
AS $$
BEGIN
  -- Fully qualified table reference with quoted keyword column
  INSERT INTO public.system_alerts(
    severity, alert_type, message, details, resolved, resolved_at, resolved_by, "timestamp", created_at
  ) VALUES (
    'info',
    'heartbeat',
    'system heartbeat ok',
    jsonb_build_object('job','ops.insert_heartbeat_alert','node','db','ts', now()),
    false,
    NULL,
    NULL,
    now(),
    now()
  );
END;
$$;

-- Restrict execution to necessary roles only
REVOKE ALL ON FUNCTION ops.insert_heartbeat_alert() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ops.insert_heartbeat_alert() TO postgres;
GRANT EXECUTE ON FUNCTION ops.insert_heartbeat_alert() TO service_role;

COMMENT ON FUNCTION ops.insert_heartbeat_alert() IS 'SECURITY DEFINER heartbeat function with locked search_path - inserts system alerts';


-- ============================================================================
-- PART 2: Normalize view ownership to prevent SECURITY DEFINER behavior
-- ============================================================================

-- Set stable owner (postgres) for all three views
ALTER VIEW public.ops_roman_events OWNER TO postgres;
ALTER VIEW public.health_summary OWNER TO postgres;
ALTER VIEW public.view_user_bids OWNER TO postgres;

-- Re-grant read permissions to authenticated users
GRANT SELECT ON public.ops_roman_events TO authenticated;
GRANT SELECT ON public.health_summary TO authenticated;
GRANT SELECT ON public.view_user_bids TO authenticated;

-- Update comments to reflect ownership normalization
COMMENT ON VIEW public.ops_roman_events IS 'Plain view owned by postgres - prevents SECURITY DEFINER behavior';
COMMENT ON VIEW public.health_summary IS 'Plain view owned by postgres - prevents SECURITY DEFINER behavior';
COMMENT ON VIEW public.view_user_bids IS 'Plain view owned by postgres - prevents SECURITY DEFINER behavior';
