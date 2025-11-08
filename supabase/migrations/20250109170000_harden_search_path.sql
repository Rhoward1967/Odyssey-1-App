-- ========================================
-- SECURITY HARDENING: Fixed search_path
-- January 9, 2025 - Supabase Advisor Approved
-- ========================================

-- Harden search_path for zero-arg helper functions
ALTER FUNCTION public.is_user_org_admin()
  SET search_path = public, pg_temp;

ALTER FUNCTION public.is_user_org_owner()
  SET search_path = public, pg_temp;

ALTER FUNCTION public.chat_messages_broadcast_trigger()
  SET search_path = public, pg_temp;

-- Harden the overloaded admin checker with args
ALTER FUNCTION public.is_user_org_admin(check_user_id uuid, org_id bigint)
  SET search_path = public, pg_temp;

-- Add comments documenting security hardening
COMMENT ON FUNCTION public.is_user_org_admin() IS 'Check if current user is admin of any organization. Security hardened with fixed search_path to prevent exploit.';
COMMENT ON FUNCTION public.is_user_org_admin(check_user_id uuid, org_id bigint) IS 'Check if specific user is admin of specific organization. Security hardened with fixed search_path.';
COMMENT ON FUNCTION public.is_user_org_owner() IS 'Check if current user is owner of any organization. Security hardened with fixed search_path to prevent exploit.';
COMMENT ON FUNCTION public.chat_messages_broadcast_trigger() IS 'Realtime broadcast trigger for chat messages. Security hardened with fixed search_path to prevent exploit.';

-- Verification query (for documentation)
SELECT 
  n.nspname AS schema,
  p.proname AS function,
  pg_get_function_identity_arguments(p.oid) AS args,
  pg_catalog.array_to_string(p.proconfig, ', ') AS settings,
  p.prosecdef AS security_definer
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('is_user_org_admin','is_user_org_owner','chat_messages_broadcast_trigger')
ORDER BY function, args;
