-- ============================================================================
-- AUTHORIZED TOPICS FOR R.O.M.A.N. LEARNING DAEMON
-- ============================================================================
-- Defines which topics R.O.M.A.N. is authorized to research autonomously
-- Priority queue based on last_researched_at (oldest topics get researched first)
-- ============================================================================

-- Authorized Topics Table
CREATE TABLE IF NOT EXISTS authorized_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (
    category IN ('constitutional_law', 'civil_rights', 'technology', 'science', 'economics', 'philosophy', 'general')
  ),
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 50 CHECK (priority >= 0 AND priority <= 100),
  last_researched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT DEFAULT 'system'
);

-- Indexes
CREATE INDEX idx_authorized_topics_active ON authorized_topics(is_active);
CREATE INDEX idx_authorized_topics_last_researched ON authorized_topics(last_researched_at ASC NULLS FIRST);
CREATE INDEX idx_authorized_topics_priority ON authorized_topics(priority DESC);
CREATE INDEX idx_authorized_topics_category ON authorized_topics(category);

-- RLS
ALTER TABLE authorized_topics ENABLE ROW LEVEL SECURITY;

-- Everyone can read topics
CREATE POLICY "Topics readable by all"
  ON authorized_topics FOR SELECT
  USING (true);

-- Only admins can manage topics
CREATE POLICY "Only admins can insert topics"
  ON authorized_topics FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() ->> 'role' = 'service_role' OR
    auth.jwt() ->> 'email' IN (SELECT email FROM app_admins WHERE is_active = true)
  );

CREATE POLICY "Only admins can update topics"
  ON authorized_topics FOR UPDATE
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() ->> 'role' = 'service_role' OR
    auth.jwt() ->> 'email' IN (SELECT email FROM app_admins WHERE is_active = true)
  );

-- Grant access
GRANT ALL ON authorized_topics TO service_role;
GRANT SELECT ON authorized_topics TO authenticated;
GRANT SELECT ON authorized_topics TO anon;

-- Seed initial topics (Constitutional focus)
INSERT INTO authorized_topics (topic, category, priority, is_active)
VALUES
  ('13th Amendment', 'constitutional_law', 100, true),
  ('14th Amendment', 'constitutional_law', 95, true),
  ('15th Amendment', 'constitutional_law', 90, true),
  ('Civil Rights Act of 1964', 'civil_rights', 85, true),
  ('Voting Rights', 'constitutional_law', 80, true),
  ('Due Process', 'constitutional_law', 75, true),
  ('Equal Protection', 'constitutional_law', 75, true),
  ('Involuntary Servitude', 'constitutional_law', 70, true),
  ('Constitutional Governance', 'constitutional_law', 65, true),
  ('AI Ethics', 'technology', 60, true),
  ('Sovereign AI Systems', 'technology', 55, true),
  ('Dual-Hemisphere Intelligence', 'technology', 50, true),
  ('Recursive Operational Management', 'technology', 50, true),
  ('Quantum Computing', 'technology', 45, true),
  ('Graphene Battery Technology', 'science', 40, true),
  ('Renewable Energy', 'science', 35, true),
  ('Universal Basic Income', 'economics', 30, true),
  ('Economic Sovereignty', 'economics', 25, true),
  ('Knowledge Graphs', 'technology', 20, true),
  ('Semantic Networks', 'technology', 15, true)
ON CONFLICT (topic) DO NOTHING;

COMMENT ON TABLE authorized_topics IS 'Topics R.O.M.A.N. is authorized to research autonomously';
COMMENT ON COLUMN authorized_topics.priority IS 'Higher priority topics are researched more frequently (0-100)';
COMMENT ON COLUMN authorized_topics.last_researched_at IS 'When this topic was last researched (NULL = never)';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Authorized Topics table created';
  RAISE NOTICE '📋 20 initial topics seeded (Constitutional Law focus)';
  RAISE NOTICE '🎯 Priority queue ready for autonomous research';
END $$;
