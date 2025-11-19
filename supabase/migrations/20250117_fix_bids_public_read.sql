-- Fix bids table to allow public read access for testing
-- This allows anonymous users to read bids data

-- Drop existing policies
DROP POLICY IF EXISTS "bids_select_policy" ON public.bids;
DROP POLICY IF EXISTS "bids_insert_policy" ON public.bids;
DROP POLICY IF EXISTS "bids_update_policy" ON public.bids;
DROP POLICY IF EXISTS "bids_delete_policy" ON public.bids;

-- Ensure RLS is enabled
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- Policy for public SELECT (allows anon + authenticated)
CREATE POLICY "bids_public_read"
ON public.bids
FOR SELECT
TO anon, authenticated
USING (true);

-- Policy for INSERT operations (authenticated only)
CREATE POLICY "bids_insert_policy"
ON public.bids
FOR INSERT
TO authenticated
WITH CHECK (
    user_id = (SELECT auth.uid())
);

-- Policy for UPDATE operations (authenticated only, own records)
CREATE POLICY "bids_update_policy"
ON public.bids
FOR UPDATE
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- Policy for DELETE operations (authenticated only, own records)
CREATE POLICY "bids_delete_policy"
ON public.bids
FOR DELETE
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- Grant proper permissions
GRANT SELECT ON public.bids TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.bids TO authenticated;

-- Add comment
COMMENT ON POLICY "bids_public_read" ON public.bids IS 'Allow public read access to bids for testing and display';
