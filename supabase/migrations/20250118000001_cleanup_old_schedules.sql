-- ============================================================================
-- PRE-MIGRATION CLEANUP
-- Remove old employee_schedules table and policies (different structure)
-- ============================================================================

-- 1) Drop any existing RLS policies on employee_schedules (if present)
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT polname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'employee_schedules'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.employee_schedules;', pol.polname);
  END LOOP;
END$$;

-- 2) Drop conflicting indexes if they exist (avoid errors)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i'
      AND c.relname = 'idx_schedules_org'
      AND n.nspname = 'public'
  ) THEN
    DROP INDEX IF EXISTS public.idx_schedules_org;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i'
      AND c.relname = 'idx_schedules_employee'
      AND n.nspname = 'public'
  ) THEN
    DROP INDEX IF EXISTS public.idx_schedules_employee;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i'
      AND c.relname = 'idx_schedules_date'
      AND n.nspname = 'public'
  ) THEN
    DROP INDEX IF EXISTS public.idx_schedules_date;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i'
      AND c.relname = 'idx_schedules_location'
      AND n.nspname = 'public'
  ) THEN
    DROP INDEX IF EXISTS public.idx_schedules_location;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i'
      AND c.relname = 'idx_schedules_supervisor'
      AND n.nspname = 'public'
  ) THEN
    DROP INDEX IF EXISTS public.idx_schedules_supervisor;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i'
      AND c.relname = 'idx_schedules_date_range'
      AND n.nspname = 'public'
  ) THEN
    DROP INDEX IF EXISTS public.idx_schedules_date_range;
  END IF;
END$$;

-- 3) Drop the legacy table (CASCADE removes all dependent objects)
DROP TABLE IF EXISTS public.employee_schedules CASCADE;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Cleanup complete - old employee_schedules removed, ready for new schema';
END$$;
