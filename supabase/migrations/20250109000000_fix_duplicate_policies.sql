-- ========================================
-- FIX DUPLICATE RLS POLICIES & INDEXES
-- Performance Optimization - January 9, 2025
-- ========================================

-- ========================================
-- 1. FIX chat_messages (Remove old consolidated policies)
-- ========================================

-- Keep the new org-scoped policies (chat_*_org_or_admin)
-- Drop the old consolidated policies

DROP POLICY IF EXISTS "consolidated_select" ON public.chat_messages;
DROP POLICY IF EXISTS "consolidated_insert" ON public.chat_messages;
DROP POLICY IF EXISTS "consolidated_update" ON public.chat_messages;
DROP POLICY IF EXISTS "consolidated_delete" ON public.chat_messages;

-- ========================================
-- 2. FIX bids (Consolidate into single policy per action)
-- ========================================

-- Drop old write policy (it overlaps with select)
DROP POLICY IF EXISTS "bids_write_consolidated" ON public.bids;

-- Keep bids_select_consolidated (it handles both read and write)

-- ========================================
-- 3. FIX timelogs (Remove duplicate admin policies)
-- ========================================

-- Drop the duplicate "Enable full management for admins only" policy
DROP POLICY IF EXISTS "Enable full management for admins only" ON public.timelogs;

-- Keep timelogs_owner_all (it's more specific)

-- ========================================
-- 4. FIX chat_messages indexes (Remove duplicate)
-- ========================================

-- Drop one of the duplicate user_id indexes
DROP INDEX IF EXISTS public.idx_chat_messages_user_id;

-- Keep idx_chat_messages_user (from our recent migration)

-- ========================================
-- VERIFICATION
-- ========================================

-- Check remaining policies
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('chat_messages', 'bids', 'timelogs')
ORDER BY tablename, cmd, policyname;

-- Check remaining indexes on chat_messages
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'chat_messages'
ORDER BY indexname;
