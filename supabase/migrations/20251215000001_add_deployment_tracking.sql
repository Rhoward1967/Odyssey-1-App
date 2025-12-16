-- Deployment and Rollback Tracking System
-- This migration creates tables and functions for tracking deployments,
-- migrations, and automated rollback procedures.

-- =====================================================
-- 1. DEPLOYMENT TRACKING TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS ops.deployments (
  id bigserial PRIMARY KEY,
  deployment_id uuid DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  environment text NOT NULL CHECK (environment IN ('staging', 'production')),
  version text NOT NULL,
  git_commit text NOT NULL,
  git_branch text NOT NULL,
  deployed_by uuid REFERENCES auth.users(id),
  deployed_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'success', 'failed', 'rolled_back')),
  rollback_from uuid REFERENCES ops.deployments(deployment_id), -- If this is a rollback, which deployment?
  health_check_passed boolean DEFAULT false,
  health_check_details jsonb,
  constitutional_validation jsonb, -- R.O.M.A.N. validation result
  metadata jsonb,
  completed_at timestamptz,
  rolled_back_at timestamptz
);

-- Indexes for performance
CREATE INDEX idx_deployments_environment ON ops.deployments(environment);
CREATE INDEX idx_deployments_status ON ops.deployments(status);
CREATE INDEX idx_deployments_deployed_at ON ops.deployments(deployed_at DESC);
CREATE INDEX idx_deployments_git_commit ON ops.deployments(git_commit);

-- =====================================================
-- 2. MIGRATION TRACKING TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS ops.migration_history (
  id bigserial PRIMARY KEY,
  deployment_id uuid REFERENCES ops.deployments(deployment_id),
  migration_name text NOT NULL UNIQUE,
  migration_hash text NOT NULL, -- SHA-256 of migration file
  applied_at timestamptz DEFAULT now(),
  rolled_back_at timestamptz,
  rollback_successful boolean,
  execution_time_ms integer,
  error_message text,
  rollback_script text, -- SQL to undo this migration
  metadata jsonb
);

-- Index for quick lookups
CREATE INDEX idx_migration_history_name ON ops.migration_history(migration_name);
CREATE INDEX idx_migration_history_deployment ON ops.migration_history(deployment_id);

-- =====================================================
-- 3. ROLLBACK EVENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS ops.rollback_events (
  id bigserial PRIMARY KEY,
  event_id uuid DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  deployment_id uuid REFERENCES ops.deployments(deployment_id),
  trigger_type text NOT NULL CHECK (trigger_type IN ('automatic', 'manual', 'constitutional_violation')),
  trigger_reason text NOT NULL,
  initiated_by uuid REFERENCES auth.users(id),
  initiated_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'success', 'failed', 'aborted')),
  rollback_plan jsonb, -- Steps to execute
  rollback_steps jsonb[], -- Executed steps with results
  constitutional_validation jsonb, -- R.O.M.A.N. approval
  completed_at timestamptz,
  metadata jsonb
);

-- Indexes
CREATE INDEX idx_rollback_events_deployment ON ops.rollback_events(deployment_id);
CREATE INDEX idx_rollback_events_status ON ops.rollback_events(status);
CREATE INDEX idx_rollback_events_initiated_at ON ops.rollback_events(initiated_at DESC);

-- =====================================================
-- 4. SYSTEM SNAPSHOTS TABLE
-- =====================================================
-- Stores system state before deployments for rollback reference

CREATE TABLE IF NOT EXISTS ops.system_snapshots (
  id bigserial PRIMARY KEY,
  snapshot_id uuid DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  deployment_id uuid REFERENCES ops.deployments(deployment_id),
  snapshot_type text NOT NULL CHECK (snapshot_type IN ('pre_deployment', 'post_deployment', 'pre_rollback')),
  database_schema_hash text,
  table_counts jsonb, -- Number of rows in each table
  key_metrics jsonb, -- Error rates, response times, etc.
  environment_config jsonb, -- Environment variables state
  created_at timestamptz DEFAULT now()
);

-- Index
CREATE INDEX idx_system_snapshots_deployment ON ops.system_snapshots(deployment_id);
CREATE INDEX idx_system_snapshots_type ON ops.system_snapshots(snapshot_type);

-- =====================================================
-- 5. ROLLBACK FUNCTIONS
-- =====================================================

-- Function: Get latest successful deployment for rollback target
CREATE OR REPLACE FUNCTION ops.get_rollback_target(
  p_environment text
)
RETURNS TABLE (
  deployment_id uuid,
  version text,
  git_commit text,
  deployed_at timestamptz,
  health_check_passed boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.deployment_id,
    d.version,
    d.git_commit,
    d.deployed_at,
    d.health_check_passed
  FROM ops.deployments d
  WHERE d.environment = p_environment
    AND d.status = 'success'
    AND d.health_check_passed = true
    AND d.rollback_from IS NULL -- Not a rollback itself
  ORDER BY d.deployed_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Create deployment snapshot
CREATE OR REPLACE FUNCTION ops.create_system_snapshot(
  p_deployment_id uuid,
  p_snapshot_type text
)
RETURNS uuid AS $$
DECLARE
  v_snapshot_id uuid;
  v_table_counts jsonb;
BEGIN
  -- Generate table counts
  SELECT jsonb_object_agg(schemaname || '.' || tablename, n_live_tup)
  INTO v_table_counts
  FROM pg_stat_user_tables
  WHERE schemaname IN ('public', 'ops');
  
  -- Create snapshot
  INSERT INTO ops.system_snapshots (
    deployment_id,
    snapshot_type,
    table_counts,
    key_metrics
  ) VALUES (
    p_deployment_id,
    p_snapshot_type,
    v_table_counts,
    jsonb_build_object(
      'timestamp', now(),
      'total_tables', (SELECT COUNT(*) FROM pg_stat_user_tables WHERE schemaname IN ('public', 'ops')),
      'total_rows', (SELECT SUM(n_live_tup) FROM pg_stat_user_tables WHERE schemaname IN ('public', 'ops'))
    )
  )
  RETURNING snapshot_id INTO v_snapshot_id;
  
  RETURN v_snapshot_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get deployment health
CREATE OR REPLACE FUNCTION ops.get_deployment_health(
  p_deployment_id uuid
)
RETURNS jsonb AS $$
DECLARE
  v_health jsonb;
  v_error_rate numeric;
  v_recent_errors integer;
BEGIN
  -- Calculate error rate in last 5 minutes
  SELECT COUNT(*)
  INTO v_recent_errors
  FROM ops.system_logs
  WHERE severity IN ('error', 'critical')
    AND timestamp > now() - interval '5 minutes';
  
  v_error_rate := v_recent_errors / 5.0; -- Errors per minute
  
  -- Build health report
  v_health := jsonb_build_object(
    'timestamp', now(),
    'deployment_id', p_deployment_id,
    'error_rate_per_minute', v_error_rate,
    'recent_errors', v_recent_errors,
    'healthy', v_error_rate < 1.0, -- Less than 1 error per minute = healthy
    'database_connections', (SELECT COUNT(*) FROM pg_stat_activity WHERE datname = current_database()),
    'active_queries', (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active')
  );
  
  RETURN v_health;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Record rollback event
CREATE OR REPLACE FUNCTION ops.record_rollback_event(
  p_deployment_id uuid,
  p_trigger_type text,
  p_trigger_reason text,
  p_initiated_by uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_event_id uuid;
BEGIN
  INSERT INTO ops.rollback_events (
    deployment_id,
    trigger_type,
    trigger_reason,
    initiated_by,
    status,
    rollback_plan
  ) VALUES (
    p_deployment_id,
    p_trigger_type,
    p_trigger_reason,
    p_initiated_by,
    'pending',
    jsonb_build_object(
      'steps', jsonb_build_array(
        'Validate rollback target',
        'Create pre-rollback snapshot',
        'Stop incoming traffic',
        'Rollback database migrations',
        'Deploy previous code version',
        'Run health checks',
        'Restore traffic'
      )
    )
  )
  RETURNING event_id INTO v_event_id;
  
  -- Log to R.O.M.A.N.
  INSERT INTO ops.roman_events (
    event_type,
    severity,
    source,
    description,
    metadata
  ) VALUES (
    'rollback_initiated',
    'warning',
    'auto_rollback_system',
    'Rollback event created: ' || p_trigger_reason,
    jsonb_build_object(
      'event_id', v_event_id,
      'deployment_id', p_deployment_id,
      'trigger_type', p_trigger_type
    )
  );
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. GRANT PERMISSIONS
-- =====================================================

-- Grant access to service role (R.O.M.A.N.)
GRANT ALL ON ops.deployments TO service_role;
GRANT ALL ON ops.migration_history TO service_role;
GRANT ALL ON ops.rollback_events TO service_role;
GRANT ALL ON ops.system_snapshots TO service_role;
GRANT ALL ON SEQUENCE ops.deployments_id_seq TO service_role;
GRANT ALL ON SEQUENCE ops.migration_history_id_seq TO service_role;
GRANT ALL ON SEQUENCE ops.rollback_events_id_seq TO service_role;
GRANT ALL ON SEQUENCE ops.system_snapshots_id_seq TO service_role;

-- Grant read access to authenticated users (for monitoring)
GRANT SELECT ON ops.deployments TO authenticated;
GRANT SELECT ON ops.migration_history TO authenticated;
GRANT SELECT ON ops.rollback_events TO authenticated;
GRANT SELECT ON ops.system_snapshots TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION ops.get_rollback_target(text) TO service_role;
GRANT EXECUTE ON FUNCTION ops.create_system_snapshot(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION ops.get_deployment_health(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION ops.record_rollback_event(uuid, text, text, uuid) TO service_role;

-- =====================================================
-- 7. ENABLE RLS (Read-only for authenticated users)
-- =====================================================

ALTER TABLE ops.deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops.migration_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops.rollback_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops.system_snapshots ENABLE ROW LEVEL SECURITY;

-- Policies: Allow service role full access, authenticated users read-only
CREATE POLICY "Service role full access" ON ops.deployments FOR ALL TO service_role USING (true);
CREATE POLICY "Authenticated read access" ON ops.deployments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service role full access" ON ops.migration_history FOR ALL TO service_role USING (true);
CREATE POLICY "Authenticated read access" ON ops.migration_history FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service role full access" ON ops.rollback_events FOR ALL TO service_role USING (true);
CREATE POLICY "Authenticated read access" ON ops.rollback_events FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service role full access" ON ops.system_snapshots FOR ALL TO service_role USING (true);
CREATE POLICY "Authenticated read access" ON ops.system_snapshots FOR SELECT TO authenticated USING (true);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

COMMENT ON TABLE ops.deployments IS 'Tracks all deployments to staging and production environments';
COMMENT ON TABLE ops.migration_history IS 'Tracks database migrations with rollback scripts';
COMMENT ON TABLE ops.rollback_events IS 'Records all rollback events with execution details';
COMMENT ON TABLE ops.system_snapshots IS 'Stores system state snapshots for rollback comparison';
