-- Fix is_admin function permissions for bids table access
-- This fixes "permission denied for function is_admin" error

-- First, ensure the is_admin function exists with proper security
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'owner')
  );
$$;

-- Ensure function is owned by postgres for security
ALTER FUNCTION public.is_admin() OWNER TO postgres;

-- Revoke any existing public access
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;

-- Grant EXECUTE to authenticated users (needed for RLS policies)
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Grant EXECUTE to service_role for admin operations
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;

-- Verify bids table exists and has proper RLS
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'bids') THEN
    -- Create bids table if it doesn't exist
    CREATE TABLE public.bids (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
      project_name text NOT NULL,
      client_name text,
      total_amount numeric(10,2),
      status text DEFAULT 'draft',
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
    
    -- Enable RLS
    ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
    
    -- Allow users to see their own bids
    CREATE POLICY "Users can view own bids"
      ON public.bids
      FOR SELECT
      USING (auth.uid() = user_id OR is_admin());
    
    -- Allow users to create their own bids
    CREATE POLICY "Users can create own bids"
      ON public.bids
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
    
    -- Allow users to update their own bids
    CREATE POLICY "Users can update own bids"
      ON public.bids
      FOR UPDATE
      USING (auth.uid() = user_id OR is_admin());
    
    -- Allow admins to delete bids
    CREATE POLICY "Admins can delete bids"
      ON public.bids
      FOR DELETE
      USING (is_admin());
  END IF;
END $$;

COMMENT ON FUNCTION public.is_admin() IS 'Returns true if the current user is an admin or owner';
