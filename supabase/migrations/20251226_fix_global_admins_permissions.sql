-- Fix global_admins table permissions
-- Date: 2025-12-26
-- Issue: Functions accessing global_admins cause "permission denied" errors

-- Grant SELECT on global_admins to authenticated users
GRANT SELECT ON public.global_admins TO authenticated;

-- Create RLS policy if table has RLS enabled
DO $$
BEGIN
  -- Enable RLS if not already enabled
  ALTER TABLE public.global_admins ENABLE ROW LEVEL SECURITY;
  
  -- Drop existing policy if it exists
  DROP POLICY IF EXISTS "Users can view global admins" ON public.global_admins;
  
  -- Create permissive policy for authenticated users
  CREATE POLICY "Users can view global admins"
    ON public.global_admins
    FOR SELECT
    TO authenticated
    USING (true);
    
EXCEPTION
  WHEN undefined_table THEN
    -- Table doesn't exist, skip
    RAISE NOTICE 'global_admins table does not exist, skipping';
END $$;
