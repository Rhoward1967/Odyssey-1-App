-- ============================================================================
-- R.O.M.A.N. AUDIT LOG TABLE (RECOGNIZED & ACTIVATED)
-- ============================================================================
-- Immutable audit trail for all R.O.M.A.N. protocol actions
-- Constitutional AI compliance tracking
--
-- CRITICAL: AI HANDSHAKE INFRASTRUCTURE
-- This table is the constitutional validation layer for R.O.M.A.N. AI handshakes.
-- An AI handshake isn't just a connection—it's a constitutional validation.
--
-- Handshake Components:
-- - correlation_id: Tracks handshake across systems (ensures same "hand" on both ends)
-- - action_data: Stores handshake metadata (encryption keys, system signatures, ethics tokens)
-- - validation_result: Constitutional compliance verification before connection finalized
-- - compliance_score: Measures remote system against Nine Foundational Principles
--
-- QUOTED IDENTIFIER FIX: "timestamp" uses double-quotes to handle reserved keyword
-- ============================================================================

-- FORCE SYNC: Drop existing table to ensure the activation switch is clean
DROP TABLE IF EXISTS public.roman_audit_log;

-- Create roman_audit_log table with quoted identifier for 'timestamp' column
CREATE TABLE public.roman_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  correlation_id TEXT,
  user_id TEXT,
  organization_id INTEGER,
  action_data JSONB,
  validation_result JSONB,
  compliance_score NUMERIC(5,2),
  violated_principle TEXT,
  "timestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for fast correlation_id lookups (AI handshake tracking)
CREATE INDEX IF NOT EXISTS idx_roman_audit_correlation 
  ON public.roman_audit_log(correlation_id);

-- Create index for timestamp ordering (matches frontend 'order=timestamp.desc')
-- Quoted identifier required for reserved keyword
CREATE INDEX IF NOT EXISTS idx_roman_audit_timestamp 
  ON public.roman_audit_log("timestamp" DESC);

-- Create index for event_type filtering
CREATE INDEX IF NOT EXISTS idx_roman_audit_event_type 
  ON public.roman_audit_log(event_type);

-- Grant permissions
GRANT SELECT ON public.roman_audit_log TO authenticated;
GRANT SELECT ON public.roman_audit_log TO anon;
GRANT INSERT ON public.roman_audit_log TO authenticated;
GRANT INSERT ON public.roman_audit_log TO service_role;

-- Enable Row Level Security
ALTER TABLE public.roman_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view audit logs for their organization
CREATE POLICY "Users can view audit logs for their organization"
  ON public.roman_audit_log
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
    OR
    -- Allow global admins to see all
    EXISTS (
      SELECT 1 
      FROM public.global_admins 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Service role can insert audit logs
CREATE POLICY "Service role can insert audit logs"
  ON public.roman_audit_log
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- RLS Policy: Authenticated users can insert their own audit logs
CREATE POLICY "Users can insert audit logs for their organization"
  ON public.roman_audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- Add comment
COMMENT ON TABLE public.roman_audit_log IS 'Immutable audit trail for R.O.M.A.N. protocol actions and constitutional compliance validation';
