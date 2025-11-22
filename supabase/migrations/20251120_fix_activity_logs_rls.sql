-- Fix Auth RLS Initialization Plan Performance Issue
-- Optimizes RLS policies to avoid re-evaluating auth functions for each row
-- Related to Supabase Linter Warning: auth_rls_initplan

-- Drop existing activity_logs_select_policy if it exists
DROP POLICY IF EXISTS activity_logs_select_policy ON public.activity_logs;

-- Recreate with optimized auth function call
CREATE POLICY activity_logs_select_policy
ON public.activity_logs
FOR SELECT
TO authenticated
USING (
  -- Wrap auth.uid() in a subselect to prevent re-evaluation per row
  user_id = (SELECT auth.uid())
  OR
  organization_id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = (SELECT auth.uid())
  )
);

-- Add comment
COMMENT ON POLICY activity_logs_select_policy ON public.activity_logs IS 
  'Optimized SELECT policy that evaluates auth.uid() once per query instead of per row';
