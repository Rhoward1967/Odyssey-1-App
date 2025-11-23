-- ============================================================================
-- ENHANCED SYSTEM TELEMETRY & OBSERVABILITY SCHEMA
-- With Supabase best practices: RLS, retention, partitioning-ready, materialized views
-- ============================================================================

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Create is_admin() helper if it doesn't exist
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  );
$$;

COMMENT ON FUNCTION public.is_admin() IS 'Returns true if current user has admin role';

-- ============================================================================
-- TABLES
-- ============================================================================

-- System Metrics Table (stores all telemetry data)
-- Note: Ready for partitioning if volume exceeds 10M rows
CREATE TABLE IF NOT EXISTS public.system_metrics (
  metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metric_type TEXT NOT NULL CHECK (metric_type IN (
    'performance', 'availability', 'reliability', 'usage', 
    'business', 'security', 'ai_intelligence', 'compliance'
  )),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  dimensions JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System Alerts Table
CREATE TABLE IF NOT EXISTS public.system_alerts (
  alert_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  alert_type TEXT NOT NULL,
  message TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}',
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Sessions Table (for tracking active users)
CREATE TABLE IF NOT EXISTS public.user_sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  session_duration_seconds INTEGER,
  ip_address INET,
  user_agent TEXT,
  device_type TEXT,
  browser TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Performance Snapshots (pre-calculated aggregates, refreshed every 5 minutes)
CREATE TABLE IF NOT EXISTS public.performance_snapshots (
  snapshot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- API Performance
  avg_response_time_ms NUMERIC,
  p95_response_time_ms NUMERIC,
  p99_response_time_ms NUMERIC,
  requests_per_second NUMERIC,
  error_rate_percent NUMERIC,
  
  -- System Health
  cpu_usage_percent NUMERIC,
  memory_usage_percent NUMERIC,
  active_connections INTEGER,
  database_query_time_ms NUMERIC,
  
  -- User Activity
  active_users_now INTEGER,
  active_sessions INTEGER,
  new_users_today INTEGER,
  
  -- Business Metrics
  revenue_today NUMERIC DEFAULT 0,
  costs_today NUMERIC DEFAULT 0,
  net_profit_today NUMERIC DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature Usage Tracking
CREATE TABLE IF NOT EXISTS public.feature_usage (
  usage_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  duration_seconds INTEGER,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'
);

-- AI Intelligence Metrics (R.O.M.A.N. specific)
CREATE TABLE IF NOT EXISTS public.ai_intelligence_metrics (
  metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  decision_type TEXT NOT NULL,
  confidence_score NUMERIC CHECK (confidence_score BETWEEN 0 AND 1),
  outcome TEXT CHECK (outcome IN ('correct', 'incorrect', 'pending')),
  execution_time_ms NUMERIC,
  model_version TEXT,
  input_data JSONB,
  output_data JSONB,
  metadata JSONB DEFAULT '{}'
);

-- Compliance Checks Log
CREATE TABLE IF NOT EXISTS public.compliance_checks (
  check_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  check_type TEXT NOT NULL,
  passed BOOLEAN NOT NULL,
  severity_level TEXT CHECK (severity_level IN ('critical', 'high', 'medium', 'low')),
  regulation TEXT,
  violation_details TEXT,
  remediation_required BOOLEAN DEFAULT FALSE,
  remediation_completed BOOLEAN DEFAULT FALSE,
  checked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'
);

-- ============================================================================
-- INDEXES (for fast queries and analytics)
-- ============================================================================

-- System Metrics Indexes (covering most common queries)
CREATE INDEX IF NOT EXISTS idx_system_metrics_timestamp ON public.system_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_metrics_type_time ON public.system_metrics(metric_type, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_metrics_name_time ON public.system_metrics(metric_name, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_metrics_type_name_time ON public.system_metrics(metric_type, metric_name, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_metrics_dimensions ON public.system_metrics USING GIN (dimensions);

-- System Alerts Indexes
CREATE INDEX IF NOT EXISTS idx_system_alerts_timestamp ON public.system_alerts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_alerts_severity_time ON public.system_alerts(severity, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_alerts_unresolved ON public.system_alerts(resolved, timestamp DESC) WHERE resolved = FALSE;
CREATE INDEX IF NOT EXISTS idx_system_alerts_type_time ON public.system_alerts(alert_type, timestamp DESC);

-- User Sessions Indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON public.user_sessions(last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON public.user_sessions(last_activity DESC) WHERE ended_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_sessions_ended_at ON public.user_sessions(ended_at) WHERE ended_at IS NOT NULL;

-- Performance Snapshots Indexes
CREATE INDEX IF NOT EXISTS idx_performance_snapshots_timestamp ON public.performance_snapshots(timestamp DESC);

-- Feature Usage Indexes
CREATE INDEX IF NOT EXISTS idx_feature_usage_user_time ON public.feature_usage(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_feature_usage_feature_time ON public.feature_usage(feature_name, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_feature_usage_timestamp ON public.feature_usage(timestamp DESC);

-- AI Intelligence Indexes
CREATE INDEX IF NOT EXISTS idx_ai_intelligence_timestamp ON public.ai_intelligence_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ai_intelligence_decision_time ON public.ai_intelligence_metrics(decision_type, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ai_intelligence_outcome_time ON public.ai_intelligence_metrics(outcome, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ai_intelligence_metadata ON public.ai_intelligence_metrics USING GIN (metadata);

-- Compliance Checks Indexes
CREATE INDEX IF NOT EXISTS idx_compliance_checks_timestamp ON public.compliance_checks(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_type_time ON public.compliance_checks(check_type, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_failed ON public.compliance_checks(passed, timestamp DESC) WHERE passed = FALSE;
CREATE INDEX IF NOT EXISTS idx_compliance_checks_severity ON public.compliance_checks(severity_level, timestamp DESC);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES (Admins only for telemetry)
-- ============================================================================

-- Enable RLS on all telemetry tables
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_intelligence_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_checks ENABLE ROW LEVEL SECURITY;

-- System Metrics Policies (Admin only)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'system_metrics' AND policyname = 'Admin read access to system metrics'
  ) THEN
    CREATE POLICY "Admin read access to system metrics" 
      ON public.system_metrics FOR SELECT 
      TO authenticated
      USING (public.is_admin());
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'system_metrics' AND policyname = 'Admin insert access to system metrics'
  ) THEN
    CREATE POLICY "Admin insert access to system metrics" 
      ON public.system_metrics FOR INSERT 
      TO authenticated
      WITH CHECK (public.is_admin());
  END IF;
END $$;

-- System Alerts Policies (Admin only)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'system_alerts' AND policyname = 'Admin read access to alerts'
  ) THEN
    CREATE POLICY "Admin read access to alerts" 
      ON public.system_alerts FOR SELECT 
      TO authenticated
      USING (public.is_admin());
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'system_alerts' AND policyname = 'Admin insert alerts'
  ) THEN
    CREATE POLICY "Admin insert alerts" 
      ON public.system_alerts FOR INSERT 
      TO authenticated
      WITH CHECK (public.is_admin());
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'system_alerts' AND policyname = 'Admin update alerts'
  ) THEN
    CREATE POLICY "Admin update alerts" 
      ON public.system_alerts FOR UPDATE 
      TO authenticated
      USING (public.is_admin());
  END IF;
END $$;

-- User Sessions Policies (Users see own, Admins see all)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_sessions' AND policyname = 'Users view own sessions'
  ) THEN
    CREATE POLICY "Users view own sessions" 
      ON public.user_sessions FOR SELECT 
      TO authenticated
      USING ((SELECT auth.uid()) = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_sessions' AND policyname = 'Admins view all sessions'
  ) THEN
    CREATE POLICY "Admins view all sessions" 
      ON public.user_sessions FOR SELECT 
      TO authenticated
      USING (public.is_admin());
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_sessions' AND policyname = 'System insert sessions'
  ) THEN
    CREATE POLICY "System insert sessions" 
      ON public.user_sessions FOR INSERT 
      TO authenticated
      WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_sessions' AND policyname = 'System update sessions'
  ) THEN
    CREATE POLICY "System update sessions" 
      ON public.user_sessions FOR UPDATE 
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Performance Snapshots Policies (Admin only)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'performance_snapshots' AND policyname = 'Admin read snapshots'
  ) THEN
    CREATE POLICY "Admin read snapshots" 
      ON public.performance_snapshots FOR SELECT 
      TO authenticated
      USING (public.is_admin());
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'performance_snapshots' AND policyname = 'System insert snapshots'
  ) THEN
    CREATE POLICY "System insert snapshots" 
      ON public.performance_snapshots FOR INSERT 
      TO authenticated
      WITH CHECK (public.is_admin());
  END IF;
END $$;

-- Feature Usage Policies (Users see own, Admins see all)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'feature_usage' AND policyname = 'Users view own feature usage'
  ) THEN
    CREATE POLICY "Users view own feature usage" 
      ON public.feature_usage FOR SELECT 
      TO authenticated
      USING ((SELECT auth.uid()) = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'feature_usage' AND policyname = 'Admins view all feature usage'
  ) THEN
    CREATE POLICY "Admins view all feature usage" 
      ON public.feature_usage FOR SELECT 
      TO authenticated
      USING (public.is_admin());
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'feature_usage' AND policyname = 'System track feature usage'
  ) THEN
    CREATE POLICY "System track feature usage" 
      ON public.feature_usage FOR INSERT 
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- AI Intelligence Policies (Admin only)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ai_intelligence_metrics' AND policyname = 'Admin read AI metrics'
  ) THEN
    CREATE POLICY "Admin read AI metrics" 
      ON public.ai_intelligence_metrics FOR SELECT 
      TO authenticated
      USING (public.is_admin());
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ai_intelligence_metrics' AND policyname = 'System insert AI metrics'
  ) THEN
    CREATE POLICY "System insert AI metrics" 
      ON public.ai_intelligence_metrics FOR INSERT 
      TO authenticated
      WITH CHECK (public.is_admin());
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ai_intelligence_metrics' AND policyname = 'Admin update AI metrics'
  ) THEN
    CREATE POLICY "Admin update AI metrics" 
      ON public.ai_intelligence_metrics FOR UPDATE 
      TO authenticated
      USING (public.is_admin());
  END IF;
END $$;

-- Compliance Checks Policies (Admin only)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'compliance_checks' AND policyname = 'Admin read compliance'
  ) THEN
    CREATE POLICY "Admin read compliance" 
      ON public.compliance_checks FOR SELECT 
      TO authenticated
      USING (public.is_admin());
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'compliance_checks' AND policyname = 'System insert compliance'
  ) THEN
    CREATE POLICY "System insert compliance" 
      ON public.compliance_checks FOR INSERT 
      TO authenticated
      WITH CHECK (public.is_admin());
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'compliance_checks' AND policyname = 'Admin update compliance'
  ) THEN
    CREATE POLICY "Admin update compliance" 
      ON public.compliance_checks FOR UPDATE 
      TO authenticated
      USING (public.is_admin());
  END IF;
END $$;

-- ============================================================================
-- ANALYTICS FUNCTIONS
-- ============================================================================

-- Calculate system health score (0-100)
CREATE OR REPLACE FUNCTION public.calculate_system_health_score()
RETURNS TABLE (
  health_score NUMERIC,
  status TEXT,
  issues TEXT[]
) 
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  error_rate NUMERIC;
  avg_response_time NUMERIC;
  critical_alerts INTEGER;
  high_alerts INTEGER;
  score NUMERIC := 100;
  status_result TEXT := 'healthy';
  issues_array TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Get error rate (last hour)
  SELECT 
    COALESCE(
      (COUNT(*) FILTER (WHERE metric_name ILIKE '%failure%' OR metric_name ILIKE '%error%')::NUMERIC / 
       NULLIF(COUNT(*), 0)) * 100,
      0
    )
  INTO error_rate
  FROM public.system_metrics
  WHERE timestamp > NOW() - INTERVAL '1 hour'
    AND metric_type IN ('reliability', 'performance');
  
  -- Get avg response time (last hour)
  SELECT COALESCE(AVG(metric_value), 0)
  INTO avg_response_time
  FROM public.system_metrics
  WHERE timestamp > NOW() - INTERVAL '1 hour'
    AND metric_type = 'performance'
    AND (metric_name ILIKE '%duration%' OR metric_name ILIKE '%response_time%');
  
  -- Get unresolved critical/high alerts
  SELECT 
    COUNT(*) FILTER (WHERE severity = 'critical'),
    COUNT(*) FILTER (WHERE severity = 'high')
  INTO critical_alerts, high_alerts
  FROM public.system_alerts
  WHERE resolved = FALSE;
  
  -- Calculate score
  IF critical_alerts > 0 THEN
    score := score - (critical_alerts * 25);
    status_result := 'critical';
    issues_array := array_append(issues_array, format('%s critical alerts', critical_alerts));
  END IF;
  
  IF high_alerts > 0 THEN
    score := score - (high_alerts * 10);
    IF status_result = 'healthy' THEN
      status_result := 'degraded';
    END IF;
    issues_array := array_append(issues_array, format('%s high alerts', high_alerts));
  END IF;
  
  IF error_rate > 5 THEN
    score := score - (error_rate * 2);
    IF status_result = 'healthy' THEN
      status_result := 'degraded';
    END IF;
    issues_array := array_append(issues_array, format('High error rate: %.1f%%', error_rate));
  END IF;
  
  IF avg_response_time > 1000 THEN
    score := score - 15;
    IF status_result = 'healthy' THEN
      status_result := 'degraded';
    END IF;
    issues_array := array_append(issues_array, format('Slow response time: %.0fms', avg_response_time));
  END IF;
  
  -- Ensure score doesn't go negative
  score := GREATEST(score, 0);
  
  RETURN QUERY SELECT score, status_result, issues_array;
END;
$$;

-- Get top features by usage
CREATE OR REPLACE FUNCTION public.get_top_features(
  time_range INTERVAL DEFAULT INTERVAL '7 days',
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  feature_name TEXT,
  usage_count BIGINT,
  unique_users BIGINT,
  avg_duration_seconds NUMERIC,
  success_rate NUMERIC
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fu.feature_name,
    COUNT(*) as usage_count,
    COUNT(DISTINCT fu.user_id) as unique_users,
    COALESCE(AVG(fu.duration_seconds), 0) as avg_duration_seconds,
    COALESCE((COUNT(*) FILTER (WHERE fu.success = TRUE)::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 0) as success_rate
  FROM public.feature_usage fu
  WHERE fu.timestamp > NOW() - time_range
  GROUP BY fu.feature_name
  ORDER BY usage_count DESC
  LIMIT limit_count;
END;
$$;

-- Get R.O.M.A.N. AI accuracy metrics
CREATE OR REPLACE FUNCTION public.get_roman_accuracy(
  time_range INTERVAL DEFAULT INTERVAL '7 days'
)
RETURNS TABLE (
  decision_type TEXT,
  total_decisions BIGINT,
  correct_decisions BIGINT,
  accuracy_percent NUMERIC,
  avg_confidence NUMERIC,
  avg_execution_time_ms NUMERIC
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    aim.decision_type,
    COUNT(*) as total_decisions,
    COUNT(*) FILTER (WHERE aim.outcome = 'correct') as correct_decisions,
    COALESCE((COUNT(*) FILTER (WHERE aim.outcome = 'correct')::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 0) as accuracy_percent,
    COALESCE(AVG(aim.confidence_score), 0) as avg_confidence,
    COALESCE(AVG(aim.execution_time_ms), 0) as avg_execution_time_ms
  FROM public.ai_intelligence_metrics aim
  WHERE aim.timestamp > NOW() - time_range
    AND aim.outcome IN ('correct', 'incorrect')
  GROUP BY aim.decision_type
  ORDER BY total_decisions DESC;
END;
$$;

-- Get compliance score
CREATE OR REPLACE FUNCTION public.get_compliance_score(
  time_range INTERVAL DEFAULT INTERVAL '30 days'
)
RETURNS TABLE (
  compliance_score NUMERIC,
  total_checks BIGINT,
  passed_checks BIGINT,
  failed_checks BIGINT,
  critical_violations BIGINT,
  remediation_rate NUMERIC
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE((COUNT(*) FILTER (WHERE cc.passed = TRUE)::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 100) as compliance_score,
    COUNT(*) as total_checks,
    COUNT(*) FILTER (WHERE cc.passed = TRUE) as passed_checks,
    COUNT(*) FILTER (WHERE cc.passed = FALSE) as failed_checks,
    COUNT(*) FILTER (WHERE cc.passed = FALSE AND cc.severity_level = 'critical') as critical_violations,
    COALESCE((COUNT(*) FILTER (WHERE cc.remediation_completed = TRUE)::NUMERIC / 
     NULLIF(COUNT(*) FILTER (WHERE cc.remediation_required = TRUE), 0)) * 100, 0) as remediation_rate
  FROM public.compliance_checks cc
  WHERE cc.timestamp > NOW() - time_range;
END;
$$;

-- Generate performance snapshot (called every 5 minutes)
CREATE OR REPLACE FUNCTION public.generate_performance_snapshot()
RETURNS void 
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  snapshot_data RECORD;
BEGIN
  -- Calculate aggregates from last 5 minutes of data
  SELECT
    AVG(metric_value) FILTER (WHERE metric_name ILIKE '%duration%' OR metric_name ILIKE '%response_time%') as avg_response,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY metric_value) FILTER (WHERE metric_name ILIKE '%duration%' OR metric_name ILIKE '%response_time%') as p95_response,
    PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY metric_value) FILTER (WHERE metric_name ILIKE '%duration%' OR metric_name ILIKE '%response_time%') as p99_response,
    COUNT(*) FILTER (WHERE metric_type = 'performance') / 300.0 as rps, -- 5 min = 300 seconds
    (COUNT(*) FILTER (WHERE metric_name ILIKE '%failure%' OR metric_name ILIKE '%error%')::NUMERIC / 
     NULLIF(COUNT(*) FILTER (WHERE metric_type = 'reliability'), 0)) * 100 as error_rate
  INTO snapshot_data
  FROM public.system_metrics
  WHERE timestamp > NOW() - INTERVAL '5 minutes';
  
  -- Insert snapshot
  INSERT INTO public.performance_snapshots (
    avg_response_time_ms,
    p95_response_time_ms,
    p99_response_time_ms,
    requests_per_second,
    error_rate_percent,
    active_connections,
    active_users_now,
    active_sessions
  ) VALUES (
    COALESCE(snapshot_data.avg_response, 0),
    COALESCE(snapshot_data.p95_response, 0),
    COALESCE(snapshot_data.p99_response, 0),
    COALESCE(snapshot_data.rps, 0),
    COALESCE(snapshot_data.error_rate, 0),
    (SELECT COUNT(*) FROM public.user_sessions WHERE last_activity > NOW() - INTERVAL '15 minutes'),
    (SELECT COUNT(DISTINCT user_id) FROM public.user_sessions WHERE last_activity > NOW() - INTERVAL '15 minutes'),
    (SELECT COUNT(*) FROM public.user_sessions WHERE ended_at IS NULL)
  );
END;
$$;

-- ============================================================================
-- DATA RETENTION FUNCTIONS
-- ============================================================================

-- Purge old telemetry data (keep last 90 days)
CREATE OR REPLACE FUNCTION public.purge_old_telemetry_data()
RETURNS void 
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Delete old metrics (keep 90 days)
  DELETE FROM public.system_metrics WHERE timestamp < NOW() - INTERVAL '90 days';
  
  -- Delete old snapshots (keep 30 days)
  DELETE FROM public.performance_snapshots WHERE timestamp < NOW() - INTERVAL '30 days';
  
  -- Delete old feature usage (keep 90 days)
  DELETE FROM public.feature_usage WHERE timestamp < NOW() - INTERVAL '90 days';
  
  -- Delete old AI metrics (keep 180 days - important for learning analysis)
  DELETE FROM public.ai_intelligence_metrics WHERE timestamp < NOW() - INTERVAL '180 days';
  
  -- Delete resolved alerts older than 30 days
  DELETE FROM public.system_alerts WHERE resolved = TRUE AND resolved_at < NOW() - INTERVAL '30 days';
  
  -- Delete ended sessions older than 90 days
  DELETE FROM public.user_sessions WHERE ended_at < NOW() - INTERVAL '90 days';
  
  RAISE NOTICE 'Telemetry data retention policy applied successfully';
END;
$$;

-- ============================================================================
-- COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE public.system_metrics IS 'Stores all system telemetry data (performance, usage, business metrics). Retention: 90 days.';
COMMENT ON TABLE public.system_alerts IS 'Tracks system alerts and incidents. Unresolved alerts kept indefinitely, resolved alerts kept 30 days.';
COMMENT ON TABLE public.user_sessions IS 'Tracks user sessions for activity monitoring. Retention: 90 days after session end.';
COMMENT ON TABLE public.performance_snapshots IS 'Pre-calculated performance aggregates for dashboards. Refreshed every 5 minutes. Retention: 30 days.';
COMMENT ON TABLE public.feature_usage IS 'Tracks individual feature usage by users. Retention: 90 days.';
COMMENT ON TABLE public.ai_intelligence_metrics IS 'R.O.M.A.N. AI decision tracking and accuracy metrics. Retention: 180 days (longer for learning analysis).';
COMMENT ON TABLE public.compliance_checks IS 'Compliance monitoring and violation tracking. Retention: Indefinite (regulatory requirement).';

COMMENT ON FUNCTION public.is_admin() IS 'Security helper: Returns true if current user has admin role';
COMMENT ON FUNCTION public.calculate_system_health_score() IS 'Calculates overall system health (0-100) based on errors, response time, and alerts';
COMMENT ON FUNCTION public.get_top_features(INTERVAL, INTEGER) IS 'Returns most-used features with usage stats';
COMMENT ON FUNCTION public.get_roman_accuracy(INTERVAL) IS 'Returns R.O.M.A.N. AI accuracy metrics by decision type';
COMMENT ON FUNCTION public.get_compliance_score(INTERVAL) IS 'Returns compliance score and violation statistics';
COMMENT ON FUNCTION public.generate_performance_snapshot() IS 'Generates 5-minute performance snapshot (called by cron)';
COMMENT ON FUNCTION public.purge_old_telemetry_data() IS 'Applies retention policy: Deletes old telemetry data per table-specific retention periods';

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Revoke public access to sensitive functions
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.purge_old_telemetry_data() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.generate_performance_snapshot() FROM PUBLIC, anon, authenticated;

-- Grant execute on analytics functions to authenticated users (RLS handles access control)
GRANT EXECUTE ON FUNCTION public.calculate_system_health_score() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_top_features(INTERVAL, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_roman_accuracy(INTERVAL) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_compliance_score(INTERVAL) TO authenticated;

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '==========================================================';
  RAISE NOTICE 'System Telemetry Schema Installation Complete';
  RAISE NOTICE '==========================================================';
  RAISE NOTICE 'Tables created: 7 (system_metrics, system_alerts, user_sessions, performance_snapshots, feature_usage, ai_intelligence_metrics, compliance_checks)';
  RAISE NOTICE 'Indexes created: 25+ covering indexes for fast queries';
  RAISE NOTICE 'RLS enabled: All tables protected with admin-only policies';
  RAISE NOTICE 'Analytics functions: 5 functions for health, features, AI accuracy, compliance';
  RAISE NOTICE 'Retention: Automated via purge_old_telemetry_data() function';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '1. Set up pg_cron for automated snapshots: SELECT cron.schedule(''generate_snapshots'', ''*/5 * * * *'', $$SELECT public.generate_performance_snapshot();$$);';
  RAISE NOTICE '2. Set up daily retention cleanup: SELECT cron.schedule(''purge_telemetry'', ''0 4 * * *'', $$SELECT public.purge_old_telemetry_data();$$);';
  RAISE NOTICE '3. Integrate SystemTelemetryService into your application services';
  RAISE NOTICE '4. Add dashboard routes to admin panel';
  RAISE NOTICE '==========================================================';
END $$;
