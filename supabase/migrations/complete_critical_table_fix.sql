-- COMPLETE FIX FOR CRITICAL TABLES: bids and agents
-- Addressing infinite recursion and permission issues

-- ==========================================
-- 1. COMPLETE BIDS TABLE FIX
-- ==========================================

-- Drop ALL existing policies to start clean
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'bids' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON public.bids';
    END LOOP;
END $$;

-- Disable RLS temporarily to reset
ALTER TABLE public.bids DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- Create SIMPLE, non-recursive policies
CREATE POLICY "bids_all_operations"
ON public.bids
FOR ALL
TO authenticated
USING (
    -- Simple check: user owns the bid OR user is in the same org with admin+ role
    (user_id = auth.uid())
    OR 
    (
        organization_id IN (
            SELECT uo.organization_id 
            FROM user_organizations uo 
            WHERE uo.user_id = auth.uid() 
            AND uo.role IN ('owner', 'admin')
        )
    )
)
WITH CHECK (
    -- For inserts/updates: same logic
    (user_id = auth.uid())
    OR 
    (
        organization_id IN (
            SELECT uo.organization_id 
            FROM user_organizations uo 
            WHERE uo.user_id = auth.uid() 
            AND uo.role IN ('owner', 'admin')
        )
    )
);

-- ==========================================
-- 2. AGENTS TABLE CREATION AND FIX
-- ==========================================

-- Create agents table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.agents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    type text NOT NULL CHECK (type IN (
        'predictive_bidding', 
        'universal_ai', 
        'document_analysis',
        'research_assistant',
        'system_monitor'
    )),
    status text NOT NULL DEFAULT 'idle' CHECK (status IN (
        'active', 'idle', 'error', 'training', 'standby'
    )),
    organization_id uuid REFERENCES public.organizations(id) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_activity timestamp with time zone DEFAULT now(),
    requests_today integer DEFAULT 0,
    confidence_score decimal(3,2) DEFAULT 0.95 CHECK (confidence_score >= 0 AND confidence_score <= 1),
    model_version text DEFAULT 'v1.0.0'
);

-- Enable RLS on agents
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- Simple agents policy
CREATE POLICY "agents_org_access"
ON public.agents
FOR ALL
TO authenticated
USING (
    organization_id IN (
        SELECT uo.organization_id 
        FROM user_organizations uo 
        WHERE uo.user_id = auth.uid()
    )
)
WITH CHECK (
    organization_id IN (
        SELECT uo.organization_id 
        FROM user_organizations uo 
        WHERE uo.user_id = auth.uid() 
        AND uo.role IN ('owner', 'admin')
    )
);

-- ==========================================
-- 3. FUNCTION PERMISSIONS FIX
-- ==========================================

-- Grant proper permissions on is_user_org_admin function
GRANT EXECUTE ON FUNCTION public.is_user_org_admin(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_org_admin(uuid, uuid) TO service_role;
REVOKE EXECUTE ON FUNCTION public.is_user_org_admin(uuid, uuid) FROM anon;

-- Ensure the function is properly defined with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_user_org_admin(user_uuid uuid, org_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_organizations 
        WHERE user_id = user_uuid 
        AND organization_id = org_uuid 
        AND role IN ('admin', 'owner')
    );
END;
$$;

-- ==========================================
-- 4. INSERT DEFAULT AGENTS
-- ==========================================

-- Insert default agents for each organization
INSERT INTO public.agents (name, type, status, organization_id)
SELECT 
    'Genesis Predictive Bidding',
    'predictive_bidding',
    'active',
    o.id
FROM public.organizations o
WHERE NOT EXISTS (
    SELECT 1 FROM public.agents a 
    WHERE a.organization_id = o.id 
    AND a.type = 'predictive_bidding'
);

INSERT INTO public.agents (name, type, status, organization_id)
SELECT 
    'R.O.M.A.N. Universal Interpreter',
    'universal_ai',
    'standby',
    o.id
FROM public.organizations o
WHERE NOT EXISTS (
    SELECT 1 FROM public.agents a 
    WHERE a.organization_id = o.id 
    AND a.type = 'universal_ai'
);

INSERT INTO public.agents (name, type, status, organization_id)
SELECT 
    'Document Analysis Engine',
    'document_analysis',
    'active',
    o.id
FROM public.organizations o
WHERE NOT EXISTS (
    SELECT 1 FROM public.agents a 
    WHERE a.organization_id = o.id 
    AND a.type = 'document_analysis'
);

-- ==========================================
-- 5. PERFORMANCE INDEXES
-- ==========================================

-- Bids table indexes
CREATE INDEX IF NOT EXISTS idx_bids_user_id ON public.bids(user_id);
CREATE INDEX IF NOT EXISTS idx_bids_organization_id ON public.bids(organization_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON public.bids(status);
CREATE INDEX IF NOT EXISTS idx_bids_created_at ON public.bids(created_at);

-- Agents table indexes  
CREATE INDEX IF NOT EXISTS idx_agents_organization_id ON public.agents(organization_id);
CREATE INDEX IF NOT EXISTS idx_agents_type ON public.agents(type);
CREATE INDEX IF NOT EXISTS idx_agents_status ON public.agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_last_activity ON public.agents(last_activity);

-- User organizations index for policy performance
CREATE INDEX IF NOT EXISTS idx_user_organizations_user_role ON public.user_organizations(user_id, role);

-- ==========================================
-- 6. GRANT PERMISSIONS
-- ==========================================

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bids TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agents TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Revoke from anon
REVOKE ALL ON public.bids FROM anon;
REVOKE ALL ON public.agents FROM anon;

-- ==========================================
-- 7. HELPFUL COMMENTS
-- ==========================================

COMMENT ON TABLE public.bids IS 'Government bidding proposals with Genesis Platform AI optimization - Fixed infinite recursion';
COMMENT ON TABLE public.agents IS 'AI Agents for Genesis Platform monitoring and management';
COMMENT ON FUNCTION public.is_user_org_admin(uuid, uuid) IS 'Check if user has admin/owner role in organization - SECURITY DEFINER';

-- ==========================================
-- 8. VERIFICATION QUERIES
-- ==========================================

-- Verify policies exist and are correct
DO $$
BEGIN
    -- Check bids policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bids' AND policyname = 'bids_all_operations') THEN
        RAISE EXCEPTION 'Bids policy creation failed';
    END IF;
    
    -- Check agents policies  
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'agents' AND policyname = 'agents_org_access') THEN
        RAISE EXCEPTION 'Agents policy creation failed';
    END IF;
    
    RAISE NOTICE 'All policies created successfully';
END $$;
