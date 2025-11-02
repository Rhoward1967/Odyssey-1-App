-- Fix Critical Table Issues for Complete Genesis Platform Operation

-- 1. Fix bids table infinite recursion issue
DROP POLICY IF EXISTS "Users can manage bids" ON public.bids;
DROP POLICY IF EXISTS "Org admins can view all bids" ON public.bids;

-- Create non-recursive bids policies
CREATE POLICY "bids_user_access"
ON public.bids
FOR ALL
TO authenticated
USING (
    user_id = (SELECT auth.uid())
    OR EXISTS (
        SELECT 1 FROM public.user_organizations uo 
        WHERE uo.user_id = (SELECT auth.uid()) 
        AND uo.organization_id = bids.organization_id
        AND uo.role IN ('admin', 'owner')
    )
)
WITH CHECK (
    user_id = (SELECT auth.uid())
    OR EXISTS (
        SELECT 1 FROM public.user_organizations uo 
        WHERE uo.user_id = (SELECT auth.uid()) 
        AND uo.organization_id = bids.organization_id
        AND uo.role IN ('admin', 'owner')
    )
);

-- 2. Create/Update agents table for AI Agent Monitoring
CREATE TABLE IF NOT EXISTS public.agents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    organization_id uuid REFERENCES public.organizations(id) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agents' AND column_name='type') THEN
        ALTER TABLE public.agents ADD COLUMN type text NOT NULL DEFAULT 'ai_agent';
    END IF;
    
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agents' AND column_name='status') THEN
        ALTER TABLE public.agents ADD COLUMN status text NOT NULL DEFAULT 'idle';
    END IF;
    
    -- Add other missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agents' AND column_name='last_activity') THEN
        ALTER TABLE public.agents ADD COLUMN last_activity timestamp with time zone DEFAULT now();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agents' AND column_name='requests_today') THEN
        ALTER TABLE public.agents ADD COLUMN requests_today integer DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agents' AND column_name='confidence_score') THEN
        ALTER TABLE public.agents ADD COLUMN confidence_score decimal(3,2) DEFAULT 0.95;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agents' AND column_name='model_version') THEN
        ALTER TABLE public.agents ADD COLUMN model_version text DEFAULT 'v1.0.0';
    END IF;
END $$;

-- Enable RLS on agents table
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- Create agents table policies
CREATE POLICY "agents_org_access"
ON public.agents
FOR ALL
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id 
        FROM public.user_organizations 
        WHERE user_id = (SELECT auth.uid())
    )
)
WITH CHECK (
    organization_id IN (
        SELECT organization_id 
        FROM public.user_organizations 
        WHERE user_id = (SELECT auth.uid())
        AND role IN ('admin', 'owner')
    )
);

-- 3. Insert default agents for Genesis Platform (FIXED)
INSERT INTO public.agents (name, type, status, organization_id) 
SELECT 
    'Genesis Predictive Bidding' as name,
    'predictive_bidding' as type,
    'active' as status,
    o.id as organization_id
FROM public.organizations o
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.agents (name, type, status, organization_id)
SELECT 
    'R.O.M.A.N. Universal Interpreter' as name,
    'universal_ai' as type,
    'standby' as status,
    o.id as organization_id
FROM public.organizations o
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.agents (name, type, status, organization_id)
SELECT 
    'Document Analysis Engine' as name,
    'document_analysis' as type,
    'active' as status,
    o.id as organization_id
FROM public.organizations o
LIMIT 1
ON CONFLICT DO NOTHING;

-- 4. Create R.O.M.A.N. command log table for Sovereign-Core tracking
CREATE TABLE IF NOT EXISTS public.roman_commands (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    organization_id uuid REFERENCES public.organizations(id) NOT NULL,
    user_intent text NOT NULL,
    generated_command jsonb NOT NULL,
    execution_result jsonb,
    status text NOT NULL DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    executed_at timestamp with time zone
);

-- Enable RLS on roman_commands
ALTER TABLE public.roman_commands ENABLE ROW LEVEL SECURITY;

-- Create roman_commands policies
CREATE POLICY "roman_commands_user_access"
ON public.roman_commands
FOR ALL
TO authenticated
USING (
    user_id = (SELECT auth.uid())
    OR EXISTS (
        SELECT 1 FROM public.user_organizations uo 
        WHERE uo.user_id = (SELECT auth.uid()) 
        AND uo.organization_id = roman_commands.organization_id
        AND uo.role IN ('admin', 'owner')
    )
)
WITH CHECK (
    user_id = (SELECT auth.uid())
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agents_organization_id ON public.agents(organization_id);
CREATE INDEX IF NOT EXISTS idx_agents_status ON public.agents(status);
CREATE INDEX IF NOT EXISTS idx_roman_commands_user_id ON public.roman_commands(user_id);
CREATE INDEX IF NOT EXISTS idx_roman_commands_organization_id ON public.roman_commands(organization_id);
CREATE INDEX IF NOT EXISTS idx_roman_commands_status ON public.roman_commands(status);

-- 6. Update function permissions to fix is_user_org_admin access
GRANT EXECUTE ON FUNCTION public.is_user_org_admin(uuid, uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.is_user_org_admin(uuid, uuid) FROM anon;

-- Add comments for documentation
COMMENT ON TABLE public.agents IS 'AI Agents tracking for Genesis Platform monitoring';
COMMENT ON TABLE public.roman_commands IS 'R.O.M.A.N. Sovereign-Core command execution log';
