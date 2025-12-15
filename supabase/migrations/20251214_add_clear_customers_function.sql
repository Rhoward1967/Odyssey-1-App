-- Function to efficiently clear customer data for a user
-- This runs server-side and bypasses RLS for performance

CREATE OR REPLACE FUNCTION clear_user_customers(target_user_id uuid)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Only allow users to clear their own data
  IF target_user_id != auth.uid() THEN
    RAISE EXCEPTION 'You can only clear your own customer data';
  END IF;

  -- Delete all customers for this user
  DELETE FROM public.customers
  WHERE user_id = target_user_id;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION clear_user_customers(uuid) TO authenticated;

COMMENT ON FUNCTION clear_user_customers IS 'Efficiently clear all customer data for the authenticated user';
