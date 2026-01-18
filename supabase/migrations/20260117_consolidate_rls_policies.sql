-- Consolidate Multiple Permissive Policies into Single Policy
-- Issue: admin_all_access + users_trusted_read cause redundant checks
-- Created: January 17, 2026

-- Drop the two separate policies
DROP POLICY IF EXISTS "admin_all_access" ON public.ai_agent_registry;
DROP POLICY IF EXISTS "users_trusted_read" ON public.ai_agent_registry;

-- Create single combined policy
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

-- Comment explaining optimization
COMMENT ON POLICY "authenticated_access" ON public.ai_agent_registry IS 
'Single policy for authenticated users: Admins have full access (auth.uid() wrapped in SELECT), regular users can view TRUSTED agents only. Prevents multiple permissive policies for same role/action.';
