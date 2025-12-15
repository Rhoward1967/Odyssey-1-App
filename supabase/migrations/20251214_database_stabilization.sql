-- SQL MIGRATION: Fixes delete timeouts, adds index, creates fast server-side clear function.

-- 1) Performance indexes (Safe to re-run)
DO $$BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND tablename='customers' AND indexname='idx_customers_user_id'
  ) THEN
    CREATE INDEX idx_customers_user_id ON public.customers(user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND tablename='customers' AND indexname='idx_customers_updated_at'
  ) THEN
    CREATE INDEX idx_customers_updated_at ON public.customers(updated_at);
  END IF;
END$$;

-- 2) Fast server-side delete for the current user (SECURITY DEFINER)
-- This function runs quickly on the server and is protected by RLS
CREATE OR REPLACE FUNCTION public.clear_customers_for_current_user(batch_size integer DEFAULT 5000)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_total_deleted integer := 0;
  v_deleted integer := 0;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Unauthenticated';
  END IF;
  LOOP
    WITH cte AS (
      SELECT id
      FROM public.customers
      WHERE user_id = v_uid
      LIMIT batch_size
      FOR UPDATE SKIP LOCKED
    )
    DELETE FROM public.customers c
    USING cte
    WHERE c.id = cte.id
    RETURNING 1 INTO v_deleted;
    IF NOT FOUND THEN
      EXIT;
    END IF;
    v_total_deleted := v_total_deleted + v_deleted;
    -- Yield to reduce lock contention on large tables
    PERFORM pg_sleep(0.01);
  END LOOP;
  RETURN v_total_deleted;
END$$;

-- Lock down function execution (Only authenticated users can run it)
REVOKE ALL ON FUNCTION public.clear_customers_for_current_user(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.clear_customers_for_current_user(integer) TO authenticated;

SELECT 'Database stabilization (indexing and fast delete function) successfully deployed.' AS status;
