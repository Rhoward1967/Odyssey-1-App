/**
 * Apply ai_agent_registry migration directly to production
 * Uses Supabase Management API
 */

import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const SQL = `
-- R.O.M.A.N. AI Interoperability Protocol (RAIP) v1.0
CREATE TABLE IF NOT EXISTS public.ai_agent_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL UNIQUE,
  agent_name TEXT NOT NULL,
  public_key TEXT NOT NULL,
  trust_level TEXT NOT NULL DEFAULT 'UNTRUSTED',
  constitutional_hash TEXT,
  last_handshake_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  audit_trail_id UUID REFERENCES public.roman_audit_log(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT valid_trust_level CHECK (trust_level IN ('TRUSTED', 'VERIFIED', 'UNTRUSTED'))
);

CREATE INDEX IF NOT EXISTS idx_ai_agent_registry_agent_id ON public.ai_agent_registry(agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_registry_trust_level ON public.ai_agent_registry(trust_level);
CREATE INDEX IF NOT EXISTS idx_ai_agent_registry_last_handshake ON public.ai_agent_registry(last_handshake_at DESC);

ALTER TABLE public.ai_agent_registry ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins have full access to ai_agent_registry" ON public.ai_agent_registry;
CREATE POLICY "Admins have full access to ai_agent_registry"
  ON public.ai_agent_registry FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.employees
      WHERE employees.user_id = auth.uid()
      AND employees.position IN ('Admin', 'Owner', 'Executive')
    )
  );

DROP POLICY IF EXISTS "Service role has full access to ai_agent_registry" ON public.ai_agent_registry;
CREATE POLICY "Service role has full access to ai_agent_registry"
  ON public.ai_agent_registry FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Authenticated users can view trusted agents" ON public.ai_agent_registry;
CREATE POLICY "Authenticated users can view trusted agents"
  ON public.ai_agent_registry FOR SELECT
  USING (auth.role() = 'authenticated' AND trust_level = 'TRUSTED');

GRANT SELECT ON public.ai_agent_registry TO authenticated;
GRANT ALL ON public.ai_agent_registry TO service_role;
`;

async function applyMigration() {
  console.log('📦 Creating ai_agent_registry table via REST API...\n');
  
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`
    },
    body: JSON.stringify({ sql: SQL })
  });

  if (!response.ok) {
    console.error('❌ Migration failed:', response.status, await response.text());
    console.log('\n⚠️  Please apply manually via Supabase SQL Editor:');
    console.log('1. Go to https://supabase.com/dashboard/project/_/sql/new');
    console.log('2. Paste the SQL from supabase/migrations/20260106_add_ai_agent_registry.sql');
    console.log('3. Click Run\n');
    process.exit(1);
  }

  console.log('✅ ai_agent_registry table created successfully!\n');
}

applyMigration();
