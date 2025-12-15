-- Migration: Add backward-compatible view, safe RPC, and performance indexes for R.O.M.A.N. events
-- Author: Supabase Advisor + GitHub Copilot
-- Date: 2025-12-15
-- Purpose: Fix ops_roman_events compatibility without breaking existing code

-- ============================================================================
-- 1) Backward-compatible compatibility view
-- ============================================================================
-- Drop existing view (safe - no data loss, just a view definition)
-- Current view only has 6 columns, we need all 11 from ops.roman_events
DROP VIEW IF EXISTS public.ops_roman_events;

-- Create view with explicit aliases to lock column names and prevent rename conflicts
CREATE VIEW public.ops_roman_events AS
SELECT
  id                       AS id,
  created_at               AS created_at,
  actor                    AS actor,
  action_type              AS action_type,
  context                  AS context,
  payload                  AS payload,
  severity                 AS severity,
  event_type               AS event_type,
  repo                     AS repo,
  file                     AS file,
  notes                    AS notes
FROM ops.roman_events;

-- Grant read access to authenticated users
GRANT SELECT ON public.ops_roman_events TO authenticated;

COMMENT ON VIEW public.ops_roman_events IS 'Backward-compatible view for ops.roman_events - exposes all 11 columns with stable naming';


-- ============================================================================
-- 2) Safe RPC for validated inserts
-- ============================================================================
-- Centralizes insert logic with validation and security
-- Prevents invalid severity values and empty action_types
CREATE OR REPLACE FUNCTION ops.log_roman_event(
  p_action_type text,
  p_context jsonb DEFAULT '{}'::jsonb,
  p_payload jsonb DEFAULT '{}'::jsonb,
  p_severity text DEFAULT 'info',
  p_event_type text DEFAULT NULL,
  p_repo text DEFAULT NULL,
  p_file text DEFAULT NULL,
  p_notes text DEFAULT NULL
) RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ops, public, extensions
AS $$
DECLARE
  v_id bigint;
BEGIN
  -- Validate inputs
  IF p_action_type IS NULL OR length(trim(p_action_type)) = 0 THEN
    RAISE EXCEPTION 'action_type is required';
  END IF;

  IF p_severity NOT IN ('info','warning','error','critical') THEN
    RAISE EXCEPTION 'invalid severity: %', p_severity;
  END IF;

  INSERT INTO ops.roman_events (
    action_type, context, payload, severity, event_type, repo, file, notes
  ) VALUES (
    p_action_type, p_context, p_payload, p_severity, p_event_type, p_repo, p_file, p_notes
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- Tighten function privileges - authenticated users only
REVOKE ALL ON FUNCTION ops.log_roman_event(text, jsonb, jsonb, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ops.log_roman_event(text, jsonb, jsonb, text, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION ops.log_roman_event(text, jsonb, jsonb, text, text, text, text, text) TO service_role;

COMMENT ON FUNCTION ops.log_roman_event IS 'Safe, validated entry point for R.O.M.A.N. event logging with input validation';


-- ============================================================================
-- 3) Performance indexes
-- ============================================================================
-- Time-based queries (most common pattern for event logs)
CREATE INDEX IF NOT EXISTS roman_events_created_at_idx 
  ON ops.roman_events (created_at DESC);

-- GIN indexes for JSONB filtering on context/payload
CREATE INDEX IF NOT EXISTS roman_events_context_gin 
  ON ops.roman_events USING GIN (context);

CREATE INDEX IF NOT EXISTS roman_events_payload_gin 
  ON ops.roman_events USING GIN (payload);

-- Composite index for common query patterns (actor + severity + time)
CREATE INDEX IF NOT EXISTS roman_events_actor_severity_time_idx 
  ON ops.roman_events (actor, severity, created_at DESC);

COMMENT ON INDEX roman_events_created_at_idx IS 'Optimizes time-window queries for event logs';
COMMENT ON INDEX roman_events_context_gin IS 'Enables fast JSONB key lookups in context field';
COMMENT ON INDEX roman_events_payload_gin IS 'Enables fast JSONB key lookups in payload field';
COMMENT ON INDEX roman_events_actor_severity_time_idx IS 'Composite index for filtered event searches';
