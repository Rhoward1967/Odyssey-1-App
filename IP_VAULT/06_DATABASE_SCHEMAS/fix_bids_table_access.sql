-- Complete fix for bids table access issues
-- Ensure proper RLS policies without recursion

-- 1. Drop all existing policies on bids table
DROP POLICY IF EXISTS "bids_user_access" ON public.bids;
DROP POLICY IF EXISTS "Users can manage bids" ON public.bids;
DROP POLICY IF EXISTS "Org admins can view all bids" ON public.bids;
DROP POLICY IF EXISTS "bids_select_consolidated" ON public.bids;
DROP POLICY IF EXISTS "bids_insert_consolidated" ON public.bids;
DROP POLICY IF EXISTS "bids_update_consolidated" ON public.bids;
DROP POLICY IF EXISTS "bids_delete_consolidated" ON public.bids;

-- 2. Ensure RLS is enabled
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- 3. Create simple, non-recursive policies

-- Policy for SELECT operations
CREATE POLICY "bids_select_policy"
ON public.bids
FOR SELECT
TO authenticated
USING (
    -- User can see their own bids
    user_id = (SELECT auth.uid())
    OR
    -- Or if they are admin/owner in the organization
    EXISTS (
        SELECT 1 
        FROM public.user_organizations uo 
        WHERE uo.user_id = (SELECT auth.uid()) 
        AND uo.organization_id = bids.organization_id
        AND uo.role IN ('admin', 'owner')
    )
);

-- Policy for INSERT operations
CREATE POLICY "bids_insert_policy"
ON public.bids
FOR INSERT
TO authenticated
WITH CHECK (
    -- User can insert bids for themselves
    user_id = (SELECT auth.uid())
    AND
    -- And they must be member of the organization
    EXISTS (
        SELECT 1 
        FROM public.user_organizations uo 
        WHERE uo.user_id = (SELECT auth.uid()) 
        AND uo.organization_id = bids.organization_id
    )
);

-- Policy for UPDATE operations
CREATE POLICY "bids_update_policy"
ON public.bids
FOR UPDATE
TO authenticated
USING (
    -- User can update their own bids
    user_id = (SELECT auth.uid())
    OR
    -- Or if they are admin/owner in the organization
    EXISTS (
        SELECT 1 
        FROM public.user_organizations uo 
        WHERE uo.user_id = (SELECT auth.uid()) 
        AND uo.organization_id = bids.organization_id
        AND uo.role IN ('admin', 'owner')
    )
)
WITH CHECK (
    -- Same conditions for the updated data
    user_id = (SELECT auth.uid())
    OR
    EXISTS (
        SELECT 1 
        FROM public.user_organizations uo 
        WHERE uo.user_id = (SELECT auth.uid()) 
        AND uo.organization_id = bids.organization_id
        AND uo.role IN ('admin', 'owner')
    )
);

-- Policy for DELETE operations
CREATE POLICY "bids_delete_policy"
ON public.bids
FOR DELETE
TO authenticated
USING (
    -- User can delete their own bids
    user_id = (SELECT auth.uid())
    OR
    -- Or if they are admin/owner in the organization
    EXISTS (
        SELECT 1 
        FROM public.user_organizations uo 
        WHERE uo.user_id = (SELECT auth.uid()) 
        AND uo.organization_id = bids.organization_id
        AND uo.role IN ('admin', 'owner')
    )
);

-- 4. Ensure proper indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_bids_user_id ON public.bids(user_id);
CREATE INDEX IF NOT EXISTS idx_bids_organization_id ON public.bids(organization_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON public.bids(status);

-- 5. Grant proper permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bids TO authenticated;
REVOKE ALL ON public.bids FROM anon;

-- 6. Verify table structure
-- Ensure bids table has required columns
DO $$
BEGIN
    -- Check if essential columns exist, add if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bids' AND column_name = 'user_id') THEN
        ALTER TABLE public.bids ADD COLUMN user_id uuid REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bids' AND column_name = 'organization_id') THEN
        ALTER TABLE public.bids ADD COLUMN organization_id uuid REFERENCES public.organizations(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bids' AND column_name = 'status') THEN
        ALTER TABLE public.bids ADD COLUMN status text DEFAULT 'draft';
    END IF;
END $$;

-- 7. Add helpful comments
COMMENT ON TABLE public.bids IS 'Government bidding proposals with Genesis Platform AI optimization';
COMMENT ON POLICY "bids_select_policy" ON public.bids IS 'Users can view their own bids and org admins can view all org bids';
COMMENT ON POLICY "bids_insert_policy" ON public.bids IS 'Users can create bids for organizations they belong to';
COMMENT ON POLICY "bids_update_policy" ON public.bids IS 'Users can update their own bids, admins can update org bids';
COMMENT ON POLICY "bids_delete_policy" ON public.bids IS 'Users can delete their own bids, admins can delete org bids';
