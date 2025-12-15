-- Improved function to clear customers in batches to avoid timeout
-- This processes customers in chunks and can be called multiple times

CREATE OR REPLACE FUNCTION clear_user_customers_batch(
  target_user_id uuid,
  batch_size integer DEFAULT 100
)
RETURNS TABLE(deleted_count integer, remaining_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
  v_remaining_count INTEGER;
BEGIN
  -- Only allow users to clear their own data
  IF target_user_id != auth.uid() THEN
    RAISE EXCEPTION 'You can only clear your own customer data';
  END IF;

  -- Delete in batches
  DELETE FROM public.customers
  WHERE id IN (
    SELECT id FROM public.customers
    WHERE user_id = target_user_id
    LIMIT batch_size
  );
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  -- Count remaining
  SELECT COUNT(*) INTO v_remaining_count
  FROM public.customers
  WHERE user_id = target_user_id;
  
  RETURN QUERY SELECT v_deleted_count, v_remaining_count;
END;
$$;

-- Alternative: Direct SQL to clear all CSV customers (run manually if needed)
-- DELETE FROM public.customers WHERE source = 'csv_upload' AND user_id = auth.uid();

COMMENT ON FUNCTION clear_user_customers_batch IS 'Clear customer data in batches to avoid timeouts. Call multiple times until remaining_count = 0';
