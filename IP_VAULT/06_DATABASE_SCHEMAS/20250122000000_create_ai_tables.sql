-- Agents table for AI system monitoring
CREATE TABLE IF NOT EXISTS agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'healthy' CHECK (status IN ('healthy', 'unhealthy', 'healing')),
  error_log TEXT[] DEFAULT '{}',
  codebase TEXT,
  organization_id BIGINT REFERENCES organizations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Roman commands for AI processing
CREATE TABLE IF NOT EXISTS roman_commands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  user_id UUID REFERENCES auth.users(id),
  organization_id BIGINT REFERENCES organizations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Cost tracking table
CREATE TABLE IF NOT EXISTS cost_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL,
  metric_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  estimated_cost NUMERIC NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  organization_id BIGINT REFERENCES organizations(id)
);

-- Enable RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE roman_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage agents in their organization" ON agents
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage commands in their organization" ON roman_commands
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view cost metrics in their organization" ON cost_metrics
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );
