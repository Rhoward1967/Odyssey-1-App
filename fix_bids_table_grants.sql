-- Fix: Grant proper permissions on bids table
-- This resolves "permission denied for table bids"

-- Grant SELECT to authenticated users (needed for RLS policies to work)
GRANT SELECT ON public.bids TO authenticated;

-- Grant INSERT to authenticated users (for creating bids)
GRANT INSERT ON public.bids TO authenticated;

-- Grant UPDATE to authenticated users (for updating their own bids)
GRANT UPDATE ON public.bids TO authenticated;

-- Grant DELETE to authenticated users (RLS will control who can actually delete)
GRANT DELETE ON public.bids TO authenticated;

-- Grant ALL to service_role for admin operations
GRANT ALL ON public.bids TO service_role;

-- Verify RLS is enabled (should already be, but just in case)
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- Optional: Verify the grants
SELECT 
  grantee, 
  privilege_type,
  table_name
FROM information_schema.table_privileges
WHERE table_schema = 'public' 
  AND table_name = 'bids'
ORDER BY grantee, privilege_type;
