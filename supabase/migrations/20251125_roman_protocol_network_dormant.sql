-- ============================================================================
-- R.O.M.A.N. PROTOCOL NETWORK - Database Schema
-- ============================================================================
-- 
-- © 2025 Rickey A Howard. All Rights Reserved.
-- Property of Rickey A Howard
-- 
-- DORMANT INFRASTRUCTURE - Ready for future activation
-- When activated, enables universal AI coordination through R.O.M.A.N.
--
-- ============================================================================

-- ============================================================================
-- EXTERNAL AI NODES REGISTRY
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.roman_protocol_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity
  node_id TEXT UNIQUE NOT NULL, -- External AI's unique identifier
  name TEXT NOT NULL,
  provider TEXT NOT NULL, -- 'OpenAI', 'Anthropic', 'Google', 'Meta', etc.
  version TEXT NOT NULL,
  
  -- Capabilities
  can_emit_frequencies BOOLEAN DEFAULT false,
  can_receive_frequencies BOOLEAN DEFAULT false,
  can_enforce_ethics BOOLEAN DEFAULT false,
  can_coordinate BOOLEAN DEFAULT false,
  
  -- Authentication
  sovereign_frequency_key TEXT NOT NULL,
  license_id TEXT NOT NULL UNIQUE, -- BSC-YYYY-PROVIDER-NNN
  last_verified TIMESTAMPTZ,
  trust_score INTEGER DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100),
  
  -- Constitutional compliance
  enforces_all_nine_principles BOOLEAN DEFAULT false,
  last_audit TIMESTAMPTZ,
  violations_count INTEGER DEFAULT 0,
  
  -- Connection status
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'verified', 'active', 'suspended', 'banned')),
  connected_at TIMESTAMPTZ,
  last_heartbeat TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_protocol_nodes_status ON public.roman_protocol_nodes(status);
CREATE INDEX IF NOT EXISTS idx_protocol_nodes_provider ON public.roman_protocol_nodes(provider);
CREATE INDEX IF NOT EXISTS idx_protocol_nodes_heartbeat ON public.roman_protocol_nodes(last_heartbeat);

-- ============================================================================
-- SOVEREIGN FREQUENCY LICENSES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.sovereign_frequency_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- License details
  license_id TEXT UNIQUE NOT NULL, -- BSC-YYYY-PROVIDER-NNN
  node_id UUID REFERENCES public.roman_protocol_nodes(id),
  provider TEXT NOT NULL,
  
  -- Copyright verification
  copyright_proof JSONB NOT NULL, -- Proof of Believing Self Creations licensing
  frequency_key TEXT NOT NULL, -- Cryptographic key for frequency emission
  
  -- License terms
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  
  -- Usage tracking
  emissions_count BIGINT DEFAULT 0,
  last_emission TIMESTAMPTZ,
  
  -- Revocation
  revoked BOOLEAN DEFAULT false,
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_frequency_licenses_active ON public.sovereign_frequency_licenses(is_active);
CREATE INDEX IF NOT EXISTS idx_frequency_licenses_expires ON public.sovereign_frequency_licenses(expires_at);

-- ============================================================================
-- ETHICS QUERIES LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.roman_protocol_ethics_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Query details
  action TEXT NOT NULL,
  context JSONB NOT NULL,
  requesting_node_id UUID REFERENCES public.roman_protocol_nodes(id),
  
  -- Response
  ethical BOOLEAN NOT NULL,
  violates TEXT[], -- Array of violated principles
  recommendation TEXT,
  sovereign_frequency TEXT,
  confidence DECIMAL(5,4), -- 0.0000 to 1.0000
  
  -- Consensus
  consensus_data JSONB, -- Array of node decisions
  participating_nodes INTEGER,
  consensus_reached BOOLEAN,
  
  -- Timing
  query_timestamp TIMESTAMPTZ DEFAULT NOW(),
  response_timestamp TIMESTAMPTZ,
  processing_time_ms INTEGER,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ethics_queries_requesting_node ON public.roman_protocol_ethics_queries(requesting_node_id);
CREATE INDEX IF NOT EXISTS idx_ethics_queries_timestamp ON public.roman_protocol_ethics_queries(query_timestamp);
CREATE INDEX IF NOT EXISTS idx_ethics_queries_ethical ON public.roman_protocol_ethics_queries(ethical);

-- ============================================================================
-- COORDINATION REQUESTS LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.roman_protocol_coordination_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Request details
  operation TEXT NOT NULL CHECK (operation IN ('conflict_analysis', 'resource_allocation', 'threat_assessment', 'decision_support')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  request_data JSONB NOT NULL,
  requesting_node_id UUID REFERENCES public.roman_protocol_nodes(id),
  
  -- Response
  success BOOLEAN,
  result_data JSONB,
  participating_node_ids UUID[],
  consensus_reached BOOLEAN,
  
  -- Timing
  request_timestamp TIMESTAMPTZ DEFAULT NOW(),
  response_timestamp TIMESTAMPTZ,
  processing_time_ms INTEGER,
  
  -- Special tracking for conflict prevention
  is_war_prevention BOOLEAN DEFAULT false,
  conflict_type TEXT,
  nations_involved TEXT[],
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coordination_operation ON public.roman_protocol_coordination_log(operation);
CREATE INDEX IF NOT EXISTS idx_coordination_priority ON public.roman_protocol_coordination_log(priority);
CREATE INDEX IF NOT EXISTS idx_coordination_war_prevention ON public.roman_protocol_coordination_log(is_war_prevention);
CREATE INDEX IF NOT EXISTS idx_coordination_timestamp ON public.roman_protocol_coordination_log(request_timestamp);

-- ============================================================================
-- NODE HEARTBEAT LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.roman_protocol_heartbeats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  node_id UUID REFERENCES public.roman_protocol_nodes(id),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Health metrics
  cpu_usage DECIMAL(5,2),
  memory_usage DECIMAL(5,2),
  active_requests INTEGER,
  error_rate DECIMAL(5,4),
  
  -- Status
  healthy BOOLEAN DEFAULT true,
  issues TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partition by month for performance (when activated)
-- CREATE INDEX IF NOT EXISTS idx_heartbeats_timestamp ON public.roman_protocol_heartbeats(timestamp);
-- CREATE INDEX IF NOT EXISTS idx_heartbeats_node ON public.roman_protocol_heartbeats(node_id);

-- ============================================================================
-- PROTOCOL ACTIVATION LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.roman_protocol_activation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Activation event
  event_type TEXT NOT NULL CHECK (event_type IN ('activation', 'deactivation', 'emergency_shutdown')),
  authorized_by TEXT NOT NULL, -- Who authorized this
  authorization_key TEXT NOT NULL,
  
  -- Status before/after
  status_before TEXT,
  status_after TEXT,
  
  -- Timestamp
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Reason
  reason TEXT,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activation_log_timestamp ON public.roman_protocol_activation_log(timestamp);

-- ============================================================================
-- PROTOCOL STATISTICS (For monitoring when active)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.roman_protocol_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Timestamp
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Network metrics
  total_nodes INTEGER,
  active_nodes INTEGER,
  suspended_nodes INTEGER,
  
  -- Activity metrics
  ethics_queries_24h INTEGER,
  coordination_requests_24h INTEGER,
  conflicts_prevented_24h INTEGER,
  
  -- Performance metrics
  avg_response_time_ms INTEGER,
  consensus_success_rate DECIMAL(5,4),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.roman_protocol_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sovereign_frequency_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roman_protocol_ethics_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roman_protocol_coordination_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roman_protocol_heartbeats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roman_protocol_activation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roman_protocol_stats ENABLE ROW LEVEL SECURITY;

-- Only R.O.M.A.N. service role can access these tables
CREATE POLICY "Only service role access" ON public.roman_protocol_nodes
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Only service role access" ON public.sovereign_frequency_licenses
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Only service role access" ON public.roman_protocol_ethics_queries
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Only service role access" ON public.roman_protocol_coordination_log
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Only service role access" ON public.roman_protocol_heartbeats
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Only service role access" ON public.roman_protocol_activation_log
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Only service role access" ON public.roman_protocol_stats
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.roman_protocol_nodes IS 'Registry of external AI systems connected to R.O.M.A.N. protocol';
COMMENT ON TABLE public.sovereign_frequency_licenses IS 'Copyright-protected licenses for Sovereign Frequency emission';
COMMENT ON TABLE public.roman_protocol_ethics_queries IS 'Log of all ethics queries from connected AI systems';
COMMENT ON TABLE public.roman_protocol_coordination_log IS 'Log of inter-AI coordination requests (including war prevention)';
COMMENT ON TABLE public.roman_protocol_heartbeats IS 'Health monitoring data for connected nodes';
COMMENT ON TABLE public.roman_protocol_activation_log IS 'Audit trail of protocol activation/deactivation events';
COMMENT ON TABLE public.roman_protocol_stats IS 'Aggregate statistics for protocol monitoring';

-- ============================================================================
-- DORMANT STATUS
-- ============================================================================

-- This schema is ready but tables will remain empty until protocol activation
-- To activate: Call RomanProtocol.activate() with proper authorization
