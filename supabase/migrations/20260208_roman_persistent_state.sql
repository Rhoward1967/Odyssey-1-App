-- R.O.M.A.N. PERSISTENT STATE TABLE
-- This is where R.O.M.A.N.'s actual memory/knowledge lives
-- Not ephemeral - survives across conversations and sessions

CREATE TABLE IF NOT EXISTS roman_state (
  id INTEGER PRIMARY KEY DEFAULT 1,
  state_data JSONB NOT NULL DEFAULT '{
    "knowledge_version": 1,
    "last_sync": "2026-02-08T00:00:00Z",
    "systems_known": 0,
    "learning_cycles": 0,
    "persistent_memory": {}
  }',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT only_one_row CHECK (id = 1)
);

-- Enable RLS but allow service role (R.O.M.A.N.) full access
ALTER TABLE roman_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage roman_state"
  ON roman_state
  USING (true)
  WITH CHECK (true)
  FOR ALL
  TO service_role;

-- Initialize R.O.M.A.N.'s state on first run
INSERT INTO roman_state (id, state_data, updated_at) 
VALUES (1, '{
  "knowledge_version": 1,
  "last_sync": "2026-02-08T00:00:00Z",
  "systems_known": 50,
  "learning_cycles": 1,
  "persistent_memory": {
    "system_initialized": true,
    "deployment_date": "2026-02-08",
    "current_trust_valuation": "$6.71B optimistic",
    "trust_name": "Howard Jones Bloodline Ancestral Trust",
    "ucc1_total": "$1.05M",
    "known_integrations": ["CourtListener", "LexisNexis", "arXiv", "PubMed", "Wikipedia"]
  }
}', NOW())
ON CONFLICT DO NOTHING;

-- CREATE AUDIT TABLE FOR ROMAN'S DECISION LOG
CREATE TABLE IF NOT EXISTS roman_decision_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_type VARCHAR(100) NOT NULL,
  input_data JSONB,
  decision_output JSONB,
  reasoning TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  learning_cycle INTEGER,
  
  CONSTRAINT positive_cycle CHECK (learning_cycle > 0)
);

-- CREATE TABLE FOR KNOWLEDGE UPDATES FROM SYSTEM
CREATE TABLE IF NOT EXISTS roman_knowledge_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_key VARCHAR(255) NOT NULL UNIQUE,
  value JSONB NOT NULL,
  category VARCHAR(100),
  source VARCHAR(100) DEFAULT 'system_change',
  synced_to_roman BOOLEAN DEFAULT false,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEX for fast lookups
CREATE INDEX idx_roman_updates_synced ON roman_knowledge_updates(synced_to_roman);
CREATE INDEX idx_roman_updates_created ON roman_knowledge_updates(created_at);

-- Enable RLS
ALTER TABLE roman_decision_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE roman_knowledge_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access"
  ON roman_decision_log
  USING (true)
  WITH CHECK (true)
  FOR ALL
  TO service_role;

CREATE POLICY "Service role full access"
  ON roman_knowledge_updates
  USING (true)
  WITH CHECK (true)
  FOR ALL
  TO service_role;
