-- R.O.M.A.N. AI Interoperability Protocol (RAIP) v1.0
-- AI Agent Registry Table for External AI Authentication
-- Created: January 6, 2026
-- Purpose: Track external AI systems attempting to interface with Odyssey-1

-- Create ai_agent_registry table
CREATE TABLE IF NOT EXISTS public.ai_agent_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL UNIQUE,
  agent_name TEXT NOT NULL,
  public_key TEXT NOT NULL,
  trust_level TEXT NOT NULL DEFAULT 'UNTRUSTED',
  constitutional_hash TEXT,
  last_handshake_at TIMESTAMPTZ,
  first_registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  audit_trail_id UUID REFERENCES public.roman_audit_log(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Constraints
  CONSTRAINT valid_trust_level CHECK (trust_level IN ('TRUSTED', 'VERIFIED', 'UNTRUSTED'))
);

-- Add indexes for performance
CREATE INDEX idx_ai_agent_registry_agent_id ON public.ai_agent_registry(agent_id);
CREATE INDEX idx_ai_agent_registry_trust_level ON public.ai_agent_registry(trust_level);
CREATE INDEX idx_ai_agent_registry_last_handshake ON public.ai_agent_registry(last_handshake_at DESC);

-- Add updated_at trigger
CREATE TRIGGER update_ai_agent_registry_updated_at
  BEFORE UPDATE ON public.ai_agent_registry
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.ai_agent_registry ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Policy 1: Admin full access
CREATE POLICY "Admins have full access to ai_agent_registry"
  ON public.ai_agent_registry
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.employees
      WHERE employees.user_id = auth.uid()
      AND employees.position IN ('Admin', 'Owner', 'Executive')
    )
  );

-- Policy 2: Service role full access (for API endpoints)
CREATE POLICY "Service role has full access to ai_agent_registry"
  ON public.ai_agent_registry
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Policy 3: Authenticated users can read TRUSTED agents only
CREATE POLICY "Authenticated users can view trusted agents"
  ON public.ai_agent_registry
  FOR SELECT
  USING (
    auth.role() = 'authenticated' 
    AND trust_level = 'TRUSTED'
  );

-- Grant permissions
GRANT SELECT ON public.ai_agent_registry TO authenticated;
GRANT ALL ON public.ai_agent_registry TO service_role;

-- Add comment
COMMENT ON TABLE public.ai_agent_registry IS 'RAIP v1.0: External AI agent registry for Constitutional Hash authentication and trust management';
