-- Simple, clean fix for R.O.M.A.N. requirements

-- 1. Create agents table (simple version)
CREATE TABLE IF NOT EXISTS public.agents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    status text DEFAULT 'active',
    organization_id bigint DEFAULT 1,
    created_at timestamptz DEFAULT now()
);

-- 2. Create roman_commands table (simple version)
CREATE TABLE IF NOT EXISTS public.roman_commands (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id),
    user_intent text NOT NULL,
    generated_command jsonb,
    status text DEFAULT 'pending',
    created_at timestamptz DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roman_commands ENABLE ROW LEVEL SECURITY;

-- 4. Simple RLS policies
CREATE POLICY "agents_public_read" ON public.agents FOR SELECT TO authenticated USING (true);
CREATE POLICY "roman_commands_user_access" ON public.roman_commands 
    FOR ALL TO authenticated 
    USING (user_id = auth.uid()) 
    WITH CHECK (user_id = auth.uid());

-- 5. Insert basic agents
INSERT INTO public.agents (name, status) VALUES 
    ('R.O.M.A.N. AI Core', 'active'),
    ('Genesis Trading Bot', 'active'),
    ('Research Assistant', 'active')
ON CONFLICT DO NOTHING;

-- 6. Grant permissions
GRANT ALL ON public.agents TO authenticated;
GRANT ALL ON public.roman_commands TO authenticated;
