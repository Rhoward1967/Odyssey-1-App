-- ========================================
-- FIX SECURITY: PIN SEARCH_PATH ON 3 FUNCTIONS
-- Prevents search_path hijacking attacks
-- ========================================

-- FUNCTION 1: is_global_admin (CRITICAL - used in RLS policies)
CREATE OR REPLACE FUNCTION public.is_global_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.global_admins ga
    WHERE ga.user_id = (SELECT auth.uid())
  );
$$;

-- Ensure least-privilege execute permissions
REVOKE ALL ON FUNCTION public.is_global_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_global_admin() TO authenticated;

-- FUNCTION 2: set_books_updated_at (Trigger function)
CREATE OR REPLACE FUNCTION public.set_books_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $func$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END
$func$;

-- Keep only needed privileges (triggers run as table owner)
REVOKE ALL ON FUNCTION public.set_books_updated_at() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_books_updated_at() TO postgres, supabase_admin;

-- FUNCTION 3: update_books_search_vector (Trigger function)
CREATE OR REPLACE FUNCTION public.update_books_search_vector()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $func$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.author, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW.content, '')), 'C');
  RETURN NEW;
END
$func$;

REVOKE ALL ON FUNCTION public.update_books_search_vector() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_books_search_vector() TO postgres, supabase_admin;

-- VERIFY ALL 3 FUNCTIONS HAVE PINNED SEARCH_PATH
SELECT 
  proname as function_name,
  prosecdef as security_definer,
  proconfig as search_path_config
FROM pg_proc
WHERE proname IN ('is_global_admin', 'set_books_updated_at', 'update_books_search_vector')
  AND pronamespace = 'public'::regnamespace
ORDER BY proname;
