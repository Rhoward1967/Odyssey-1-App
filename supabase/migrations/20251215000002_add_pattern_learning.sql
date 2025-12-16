-- Pattern Learning System for R.O.M.A.N.
-- Enables AI to learn from error patterns and generate automatic fixes

-- =====================================================
-- 1. ERROR PATTERNS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS ops.error_patterns (
  id bigserial PRIMARY KEY,
  pattern_id uuid DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  pattern_signature text NOT NULL UNIQUE, -- Hash of error characteristics
  pattern_type text NOT NULL, -- 'database', 'api', 'rls', 'stripe', 'deployment'
  error_message_pattern text NOT NULL, -- Regex pattern for error messages
  error_source text, -- Component/service where error occurs
  severity text NOT NULL CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
  
  -- Pattern statistics
  occurrence_count integer DEFAULT 1,
  first_seen timestamptz DEFAULT now(),
  last_seen timestamptz DEFAULT now(),
  success_rate numeric(5,2) DEFAULT 0.0, -- Percentage of successful auto-fixes
  
  -- Auto-fix configuration
  auto_fix_enabled boolean DEFAULT false,
  auto_fix_script text, -- SQL, TypeScript, or bash script
  auto_fix_type text CHECK (auto_fix_type IN ('sql', 'typescript', 'bash', 'api_call')),
  auto_fix_parameters jsonb, -- Parameters for the fix script
  
  -- Constitutional validation
  constitutional_compliant boolean DEFAULT false,
  constitutional_violations jsonb,
  
  -- Learning metadata
  learned_from_incidents uuid[], -- Array of system_log IDs
  confidence_score numeric(3,2) DEFAULT 0.0, -- 0.0 to 1.0
  human_approved boolean DEFAULT false,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_error_patterns_signature ON ops.error_patterns(pattern_signature);
CREATE INDEX idx_error_patterns_type ON ops.error_patterns(pattern_type);
CREATE INDEX idx_error_patterns_severity ON ops.error_patterns(severity);
CREATE INDEX idx_error_patterns_enabled ON ops.error_patterns(auto_fix_enabled);
CREATE INDEX idx_error_patterns_occurrence ON ops.error_patterns(occurrence_count DESC);

-- =====================================================
-- 2. PATTERN APPLICATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS ops.pattern_applications (
  id bigserial PRIMARY KEY,
  application_id uuid DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  pattern_id uuid REFERENCES ops.error_patterns(pattern_id),
  system_log_id bigint REFERENCES ops.system_logs(id),
  
  -- Application details
  applied_at timestamptz DEFAULT now(),
  success boolean NOT NULL,
  execution_time_ms integer,
  
  -- Fix details
  fix_script_executed text,
  fix_parameters_used jsonb,
  error_before text,
  error_after text,
  
  -- Results
  system_state_before jsonb, -- Metrics before fix
  system_state_after jsonb, -- Metrics after fix
  
  -- Constitutional validation
  constitutional_validation jsonb,
  
  metadata jsonb
);

-- Indexes
CREATE INDEX idx_pattern_applications_pattern ON ops.pattern_applications(pattern_id);
CREATE INDEX idx_pattern_applications_log ON ops.pattern_applications(system_log_id);
CREATE INDEX idx_pattern_applications_success ON ops.pattern_applications(success);
CREATE INDEX idx_pattern_applications_applied_at ON ops.pattern_applications(applied_at DESC);

-- =====================================================
-- 3. PATTERN CLUSTERS TABLE
-- =====================================================
-- Groups similar error patterns for ML analysis

CREATE TABLE IF NOT EXISTS ops.pattern_clusters (
  id bigserial PRIMARY KEY,
  cluster_id uuid DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  cluster_name text NOT NULL,
  cluster_description text,
  
  -- Cluster characteristics
  pattern_ids uuid[], -- Array of pattern_id from error_patterns
  centroid_features jsonb, -- ML cluster centroid (for k-means, etc.)
  cluster_size integer DEFAULT 0,
  
  -- Cluster statistics
  avg_success_rate numeric(5,2) DEFAULT 0.0,
  total_occurrences integer DEFAULT 0,
  
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_pattern_clusters_size ON ops.pattern_clusters(cluster_size DESC);

-- =====================================================
-- 4. LEARNING SESSIONS TABLE
-- =====================================================
-- Tracks ML training sessions

CREATE TABLE IF NOT EXISTS ops.learning_sessions (
  id bigserial PRIMARY KEY,
  session_id uuid DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  session_type text NOT NULL CHECK (session_type IN ('clustering', 'pattern_extraction', 'fix_generation', 'validation')),
  
  -- Session details
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  status text NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'aborted')),
  
  -- Input/Output
  input_data jsonb, -- Parameters and input data
  output_data jsonb, -- Results and learned patterns
  
  -- Statistics
  patterns_analyzed integer DEFAULT 0,
  patterns_created integer DEFAULT 0,
  patterns_updated integer DEFAULT 0,
  errors_processed integer DEFAULT 0,
  
  -- Performance
  execution_time_ms integer,
  memory_used_mb integer,
  
  -- Constitutional validation
  constitutional_compliant boolean DEFAULT true,
  
  metadata jsonb
);

-- Index
CREATE INDEX idx_learning_sessions_status ON ops.learning_sessions(status);
CREATE INDEX idx_learning_sessions_type ON ops.learning_sessions(session_type);
CREATE INDEX idx_learning_sessions_started ON ops.learning_sessions(started_at DESC);

-- =====================================================
-- 5. PATTERN LEARNING FUNCTIONS
-- =====================================================

-- Function: Record pattern application
CREATE OR REPLACE FUNCTION ops.record_pattern_application(
  p_pattern_id uuid,
  p_system_log_id bigint,
  p_success boolean,
  p_execution_time_ms integer,
  p_fix_script text,
  p_constitutional_validation jsonb DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_application_id uuid;
  v_success_rate numeric(5,2);
  v_total_applications integer;
  v_successful_applications integer;
BEGIN
  -- Record application
  INSERT INTO ops.pattern_applications (
    pattern_id,
    system_log_id,
    success,
    execution_time_ms,
    fix_script_executed,
    constitutional_validation
  ) VALUES (
    p_pattern_id,
    p_system_log_id,
    p_success,
    p_execution_time_ms,
    p_fix_script,
    p_constitutional_validation
  )
  RETURNING application_id INTO v_application_id;
  
  -- Update pattern statistics
  SELECT 
    COUNT(*),
    SUM(CASE WHEN success THEN 1 ELSE 0 END)
  INTO v_total_applications, v_successful_applications
  FROM ops.pattern_applications
  WHERE pattern_id = p_pattern_id;
  
  v_success_rate := (v_successful_applications::numeric / v_total_applications::numeric * 100)::numeric(5,2);
  
  UPDATE ops.error_patterns
  SET 
    occurrence_count = occurrence_count + 1,
    last_seen = now(),
    success_rate = v_success_rate,
    updated_at = now()
  WHERE pattern_id = p_pattern_id;
  
  -- Log to R.O.M.A.N.
  INSERT INTO ops.roman_events (
    event_type,
    severity,
    source,
    description,
    metadata
  ) VALUES (
    'pattern_applied',
    CASE WHEN p_success THEN 'info' ELSE 'warning' END,
    'pattern_learning_engine',
    'Pattern ' || p_pattern_id || ' applied with ' || CASE WHEN p_success THEN 'success' ELSE 'failure' END,
    jsonb_build_object(
      'pattern_id', p_pattern_id,
      'application_id', v_application_id,
      'success', p_success,
      'new_success_rate', v_success_rate
    )
  );
  
  RETURN v_application_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Find matching pattern for error
CREATE OR REPLACE FUNCTION ops.find_matching_pattern(
  p_error_message text,
  p_error_source text,
  p_severity text
)
RETURNS TABLE (
  pattern_id uuid,
  pattern_signature text,
  auto_fix_enabled boolean,
  auto_fix_script text,
  auto_fix_type text,
  success_rate numeric(5,2),
  confidence_score numeric(3,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ep.pattern_id,
    ep.pattern_signature,
    ep.auto_fix_enabled,
    ep.auto_fix_script,
    ep.auto_fix_type,
    ep.success_rate,
    ep.confidence_score
  FROM ops.error_patterns ep
  WHERE 
    ep.auto_fix_enabled = true
    AND ep.human_approved = true
    AND ep.constitutional_compliant = true
    AND p_error_message ~ ep.error_message_pattern -- Regex match
    AND (ep.error_source = p_error_source OR ep.error_source IS NULL)
    AND ep.severity = p_severity
  ORDER BY 
    ep.success_rate DESC,
    ep.confidence_score DESC,
    ep.occurrence_count DESC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get pattern statistics
CREATE OR REPLACE FUNCTION ops.get_pattern_statistics()
RETURNS TABLE (
  total_patterns bigint,
  enabled_patterns bigint,
  approved_patterns bigint,
  avg_success_rate numeric(5,2),
  total_applications bigint,
  successful_applications bigint,
  patterns_by_type jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint,
    SUM(CASE WHEN auto_fix_enabled THEN 1 ELSE 0 END)::bigint,
    SUM(CASE WHEN human_approved THEN 1 ELSE 0 END)::bigint,
    AVG(success_rate)::numeric(5,2),
    (SELECT COUNT(*)::bigint FROM ops.pattern_applications),
    (SELECT SUM(CASE WHEN success THEN 1 ELSE 0 END)::bigint FROM ops.pattern_applications),
    (
      SELECT jsonb_object_agg(pattern_type, pattern_count)
      FROM (
        SELECT pattern_type, COUNT(*) as pattern_count
        FROM ops.error_patterns
        GROUP BY pattern_type
      ) counts
    )
  FROM ops.error_patterns;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Start learning session
CREATE OR REPLACE FUNCTION ops.start_learning_session(
  p_session_type text,
  p_input_data jsonb DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_session_id uuid;
BEGIN
  INSERT INTO ops.learning_sessions (
    session_type,
    status,
    input_data
  ) VALUES (
    p_session_type,
    'running',
    p_input_data
  )
  RETURNING session_id INTO v_session_id;
  
  -- Log to R.O.M.A.N.
  INSERT INTO ops.roman_events (
    event_type,
    severity,
    source,
    description,
    metadata
  ) VALUES (
    'learning_session_started',
    'info',
    'pattern_learning_engine',
    'Learning session started: ' || p_session_type,
    jsonb_build_object('session_id', v_session_id)
  );
  
  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. GRANT PERMISSIONS
-- =====================================================

GRANT ALL ON ops.error_patterns TO service_role;
GRANT ALL ON ops.pattern_applications TO service_role;
GRANT ALL ON ops.pattern_clusters TO service_role;
GRANT ALL ON ops.learning_sessions TO service_role;
GRANT ALL ON SEQUENCE ops.error_patterns_id_seq TO service_role;
GRANT ALL ON SEQUENCE ops.pattern_applications_id_seq TO service_role;
GRANT ALL ON SEQUENCE ops.pattern_clusters_id_seq TO service_role;
GRANT ALL ON SEQUENCE ops.learning_sessions_id_seq TO service_role;

GRANT SELECT ON ops.error_patterns TO authenticated;
GRANT SELECT ON ops.pattern_applications TO authenticated;
GRANT SELECT ON ops.pattern_clusters TO authenticated;
GRANT SELECT ON ops.learning_sessions TO authenticated;

GRANT EXECUTE ON FUNCTION ops.record_pattern_application(uuid, bigint, boolean, integer, text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION ops.find_matching_pattern(text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION ops.get_pattern_statistics() TO service_role, authenticated;
GRANT EXECUTE ON FUNCTION ops.start_learning_session(text, jsonb) TO service_role;

-- =====================================================
-- 7. ENABLE RLS
-- =====================================================

ALTER TABLE ops.error_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops.pattern_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops.pattern_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops.learning_sessions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Service role full access" ON ops.error_patterns FOR ALL TO service_role USING (true);
CREATE POLICY "Authenticated read access" ON ops.error_patterns FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service role full access" ON ops.pattern_applications FOR ALL TO service_role USING (true);
CREATE POLICY "Authenticated read access" ON ops.pattern_applications FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service role full access" ON ops.pattern_clusters FOR ALL TO service_role USING (true);
CREATE POLICY "Authenticated read access" ON ops.pattern_clusters FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service role full access" ON ops.learning_sessions FOR ALL TO service_role USING (true);
CREATE POLICY "Authenticated read access" ON ops.learning_sessions FOR SELECT TO authenticated USING (true);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

COMMENT ON TABLE ops.error_patterns IS 'Learned error patterns with automatic fix scripts';
COMMENT ON TABLE ops.pattern_applications IS 'History of pattern applications and their results';
COMMENT ON TABLE ops.pattern_clusters IS 'ML clusters grouping similar error patterns';
COMMENT ON TABLE ops.learning_sessions IS 'ML training sessions for pattern learning';
