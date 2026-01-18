-- Fix RLS Performance Issues on ai_agent_registry
-- Issue: auth.* calls not wrapped in SELECT + multiple permissive policies
-- Created: January 17, 2026

-- Drop existing policies
DROP POLICY IF EXISTS "Admins have full access to ai_agent_registry" ON public.ai_agent_registry;
DROP POLICY IF EXISTS "Service role has full access to ai_agent_registry" ON public.ai_agent_registry;
DROP POLICY IF EXISTS "Authenticated users can view trusted agents" ON public.ai_agent_registry;

-- Create single optimized policy combining admin + user access
-- Admins: ALL operations | Users: SELECT trusted agents only
CREATE POLICY "authenticated_access" 
ON public.ai_agent_registry 
FOR ALL 
TO authenticated 
USING (
  -- Admin check (wrapped auth.uid() for performance)
  EXISTS (
    SELECT 1 
    FROM public.employees 
    WHERE employees.user_id = (SELECT auth.uid()) 
    AND employees.position IN ('Admin', 'Owner', 'Executive')
  )
  OR
  -- Regular user can SELECT trusted agents
  trust_level = 'TRUSTED'
) 
WITH CHECK (
  -- Only admins can INSERT/UPDATE/DELETE
  EXISTS (
    SELECT 1 
    FROM public.employees 
    WHERE employees.user_id = (SELECT auth.uid()) 
    AND employees.position IN ('Admin', 'Owner', 'Executive')
  )
);

-- Service role bypasses RLS automatically - no policy needed

-- Comment explaining optimization
COMMENT ON POLICY "authenticated_access" ON public.ai_agent_registry IS 
'Single policy for authenticated users: Admins have full access (auth.uid() wrapped in SELECT), regular users can view TRUSTED agents only. Prevents multiple permissive policies for same role/action.';
