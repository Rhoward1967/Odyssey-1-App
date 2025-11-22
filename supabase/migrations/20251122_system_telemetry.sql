-- ============================================================================
-- SYSTEM TELEMETRY & OBSERVABILITY SCHEMA
-- ============================================================================

-- System Metrics Table (stores all telemetry data)
CREATE TABLE IF NOT EXISTS system_metrics (
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
CREATE TABLE IF NOT EXISTS system_alerts (
  alert_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  alert_type TEXT NOT NULL,
  message TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}',
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Sessions Table (for tracking active users)
CREATE TABLE IF NOT EXISTS user_sessions (
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

-- Performance Snapshots (pre-calculated aggregates)
CREATE TABLE IF NOT EXISTS performance_snapshots (
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
  revenue_today NUMERIC,
  costs_today NUMERIC,
  net_profit_today NUMERIC,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature Usage Tracking
CREATE TABLE IF NOT EXISTS feature_usage (
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
CREATE TABLE IF NOT EXISTS ai_intelligence_metrics (
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
CREATE TABLE IF NOT EXISTS compliance_checks (
  check_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  check_type TEXT NOT NULL,
  passed BOOLEAN NOT NULL,
  severity_level TEXT CHECK (severity_level IN ('critical', 'high', 'medium', 'low')),
  regulation TEXT,
  violation_details TEXT,
  remediation_required BOOLEAN DEFAULT FALSE,
  remediation_completed BOOLEAN DEFAULT FALSE,
  checked_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'
);

-- ============================================================================
-- INDEXES (for fast queries)
-- ============================================================================

-- System Metrics Indexes
CREATE INDEX idx_system_metrics_timestamp ON system_metrics(timestamp DESC);
CREATE INDEX idx_system_metrics_type ON system_metrics(metric_type);
CREATE INDEX idx_system_metrics_name ON system_metrics(metric_name);
CREATE INDEX idx_system_metrics_type_name ON system_metrics(metric_type, metric_name);

-- System Alerts Indexes
CREATE INDEX idx_system_alerts_timestamp ON system_alerts(timestamp DESC);
CREATE INDEX idx_system_alerts_severity ON system_alerts(severity);
CREATE INDEX idx_system_alerts_resolved ON system_alerts(resolved) WHERE resolved = FALSE;

-- User Sessions Indexes
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_last_activity ON user_sessions(last_activity DESC);

-- Feature Usage Indexes
CREATE INDEX idx_feature_usage_user_id ON feature_usage(user_id);
CREATE INDEX idx_feature_usage_feature_name ON feature_usage(feature_name);
CREATE INDEX idx_feature_usage_timestamp ON feature_usage(timestamp DESC);

-- AI Intelligence Indexes
CREATE INDEX idx_ai_intelligence_timestamp ON ai_intelligence_metrics(timestamp DESC);
CREATE INDEX idx_ai_intelligence_decision_type ON ai_intelligence_metrics(decision_type);
CREATE INDEX idx_ai_intelligence_outcome ON ai_intelligence_metrics(outcome);

-- Compliance Checks Indexes
CREATE INDEX idx_compliance_checks_timestamp ON compliance_checks(timestamp DESC);
CREATE INDEX idx_compliance_checks_passed ON compliance_checks(passed);
CREATE INDEX idx_compliance_checks_severity ON compliance_checks(severity_level);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_intelligence_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_checks ENABLE ROW LEVEL SECURITY;

-- Admin can see all metrics
CREATE POLICY "Admins can view all system metrics" ON system_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- Admin can view all alerts
CREATE POLICY "Admins can view all alerts" ON system_alerts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- Admin can resolve alerts
CREATE POLICY "Admins can resolve alerts" ON system_alerts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- Users can see their own sessions
CREATE POLICY "Users can view own sessions" ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Admin can see all sessions
CREATE POLICY "Admins can view all sessions" ON user_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- Users can see their own feature usage
CREATE POLICY "Users can view own feature usage" ON feature_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Admin can see all feature usage
CREATE POLICY "Admins can view all feature usage" ON feature_usage
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- ============================================================================
-- FUNCTIONS FOR ANALYTICS
-- ============================================================================

-- Function to calculate system health score
CREATE OR REPLACE FUNCTION calculate_system_health_score()
RETURNS TABLE (
  health_score NUMERIC,
  status TEXT,
  issues TEXT[]
) AS $$
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
      (COUNT(*) FILTER (WHERE metric_name LIKE '%failure%')::NUMERIC / 
       NULLIF(COUNT(*), 0)) * 100,
      0
    )
  INTO error_rate
  FROM system_metrics
  WHERE timestamp > NOW() - INTERVAL '1 hour'
    AND metric_type = 'reliability';
  
  -- Get avg response time (last hour)
  SELECT COALESCE(AVG(metric_value), 0)
  INTO avg_response_time
  FROM system_metrics
  WHERE timestamp > NOW() - INTERVAL '1 hour'
    AND metric_type = 'performance'
    AND metric_name LIKE '%duration%';
  
  -- Get critical/high alerts
  SELECT 
    COUNT(*) FILTER (WHERE severity = 'critical'),
    COUNT(*) FILTER (WHERE severity = 'high')
  INTO critical_alerts, high_alerts
  FROM system_alerts
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get top features by usage
CREATE OR REPLACE FUNCTION get_top_features(
  time_range INTERVAL DEFAULT INTERVAL '7 days',
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  feature_name TEXT,
  usage_count BIGINT,
  unique_users BIGINT,
  avg_duration_seconds NUMERIC,
  success_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fu.feature_name,
    COUNT(*) as usage_count,
    COUNT(DISTINCT fu.user_id) as unique_users,
    AVG(fu.duration_seconds) as avg_duration_seconds,
    (COUNT(*) FILTER (WHERE fu.success = TRUE)::NUMERIC / NULLIF(COUNT(*), 0)) * 100 as success_rate
  FROM feature_usage fu
  WHERE fu.timestamp > NOW() - time_range
  GROUP BY fu.feature_name
  ORDER BY usage_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get R.O.M.A.N. AI accuracy
CREATE OR REPLACE FUNCTION get_roman_accuracy(
  time_range INTERVAL DEFAULT INTERVAL '7 days'
)
RETURNS TABLE (
  decision_type TEXT,
  total_decisions BIGINT,
  correct_decisions BIGINT,
  accuracy_percent NUMERIC,
  avg_confidence NUMERIC,
  avg_execution_time_ms NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    aim.decision_type,
    COUNT(*) as total_decisions,
    COUNT(*) FILTER (WHERE aim.outcome = 'correct') as correct_decisions,
    (COUNT(*) FILTER (WHERE aim.outcome = 'correct')::NUMERIC / NULLIF(COUNT(*), 0)) * 100 as accuracy_percent,
    AVG(aim.confidence_score) as avg_confidence,
    AVG(aim.execution_time_ms) as avg_execution_time_ms
  FROM ai_intelligence_metrics aim
  WHERE aim.timestamp > NOW() - time_range
    AND aim.outcome IN ('correct', 'incorrect')
  GROUP BY aim.decision_type
  ORDER BY total_decisions DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get compliance score
CREATE OR REPLACE FUNCTION get_compliance_score(
  time_range INTERVAL DEFAULT INTERVAL '30 days'
)
RETURNS TABLE (
  compliance_score NUMERIC,
  total_checks BIGINT,
  passed_checks BIGINT,
  failed_checks BIGINT,
  critical_violations BIGINT,
  remediation_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (COUNT(*) FILTER (WHERE cc.passed = TRUE)::NUMERIC / NULLIF(COUNT(*), 0)) * 100 as compliance_score,
    COUNT(*) as total_checks,
    COUNT(*) FILTER (WHERE cc.passed = TRUE) as passed_checks,
    COUNT(*) FILTER (WHERE cc.passed = FALSE) as failed_checks,
    COUNT(*) FILTER (WHERE cc.passed = FALSE AND cc.severity_level = 'critical') as critical_violations,
    (COUNT(*) FILTER (WHERE cc.remediation_completed = TRUE)::NUMERIC / 
     NULLIF(COUNT(*) FILTER (WHERE cc.remediation_required = TRUE), 0)) * 100 as remediation_rate
  FROM compliance_checks cc
  WHERE cc.timestamp > NOW() - time_range;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- AUTOMATIC SNAPSHOT GENERATION (runs every 5 minutes)
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_performance_snapshot()
RETURNS void AS $$
DECLARE
  snapshot_data RECORD;
BEGIN
  -- Calculate aggregates from last 5 minutes of data
  SELECT
    AVG(metric_value) FILTER (WHERE metric_name LIKE '%duration%') as avg_response,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY metric_value) FILTER (WHERE metric_name LIKE '%duration%') as p95_response,
    PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY metric_value) FILTER (WHERE metric_name LIKE '%duration%') as p99_response,
    COUNT(*) FILTER (WHERE metric_type = 'performance') / 300.0 as rps, -- 5 min = 300 seconds
    (COUNT(*) FILTER (WHERE metric_name LIKE '%failure%')::NUMERIC / 
     NULLIF(COUNT(*) FILTER (WHERE metric_type = 'reliability'), 0)) * 100 as error_rate
  INTO snapshot_data
  FROM system_metrics
  WHERE timestamp > NOW() - INTERVAL '5 minutes';
  
  -- Insert snapshot
  INSERT INTO performance_snapshots (
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
    (SELECT COUNT(*) FROM user_sessions WHERE last_activity > NOW() - INTERVAL '15 minutes'),
    (SELECT COUNT(DISTINCT user_id) FROM user_sessions WHERE last_activity > NOW() - INTERVAL '15 minutes'),
    (SELECT COUNT(*) FROM user_sessions WHERE ended_at IS NULL)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE system_metrics IS 'Stores all system telemetry data (performance, usage, business metrics)';
COMMENT ON TABLE system_alerts IS 'Tracks system alerts and incidents';
COMMENT ON TABLE user_sessions IS 'Tracks user sessions for activity monitoring';
COMMENT ON TABLE performance_snapshots IS 'Pre-calculated performance aggregates for dashboards';
COMMENT ON TABLE feature_usage IS 'Tracks individual feature usage by users';
COMMENT ON TABLE ai_intelligence_metrics IS 'R.O.M.A.N. AI decision tracking and accuracy metrics';
COMMENT ON TABLE compliance_checks IS 'Compliance monitoring and violation tracking';
