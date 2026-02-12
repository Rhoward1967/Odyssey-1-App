-- ═══════════════════════════════════════════════════════════════════
-- CRITICAL RLS SECURITY LOCKDOWN
-- Date: February 11, 2026
-- Purpose: Fix critical security vulnerabilities in RLS policies
-- ═══════════════════════════════════════════════════════════════════
--
-- VULNERABILITIES FIXED:
-- 1. R.O.M.A.N. Knowledge Base - Was exposed to anonymous users
-- 2. Bids Table - Was exposed to public (competitive intelligence leak)
-- 3. Books Library - Restricted to authenticated users minimum
-- 4. System Knowledge - Ensure Trust member protection
--
-- ═══════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════
-- FIX 1: R.O.M.A.N. KNOWLEDGE BASE (CRITICAL)
-- ═══════════════════════════════════════════════════════════════════
-- ISSUE: Anyone (even anonymous users) could read Sovereign Creditor
--        data, $4.237B IP valuation, Trust financial architecture
-- FIX: Restrict to Howard Family Trust members (app_admins) only

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "roman_kb_read_all" ON public.roman_knowledge_base;

-- Create Trust member-only read policy
CREATE POLICY "roman_kb_trust_members_only"
ON public.roman_knowledge_base
FOR SELECT
TO authenticated
USING (
    -- Only active Trust members (app_admins) can read
    EXISTS (
        SELECT 1 FROM public.app_admins
        WHERE user_id = auth.uid()
        AND is_active = true
    )
);

-- Service role still needs write access for Chronicler
-- (Keep existing insert/update policies for service_role)

COMMENT ON POLICY "roman_kb_trust_members_only" ON public.roman_knowledge_base IS
'SECURITY: Only Howard Family Trust members (app_admins) can read R.O.M.A.N. knowledge base.
Protects: Sovereign Creditor data, IP valuation ($4.237B), Trust financial architecture,
Universal Math trade secrets, all 7 books content, and system file knowledge.';

-- ═══════════════════════════════════════════════════════════════════
-- FIX 2: BIDS TABLE (HIGH RISK)
-- ═══════════════════════════════════════════════════════════════════
-- ISSUE: Public read access exposes bidding strategy and Universal Math
--        advantage to competitors
-- FIX: Restrict to bid owner and organization members only

-- Drop public read policy
DROP POLICY IF EXISTS "bids_public_read" ON public.bids;
DROP POLICY IF EXISTS "Enable read for all authenticated users" ON public.bids;

-- Create organization-scoped policy
CREATE POLICY "bids_org_members_and_owner"
ON public.bids
FOR SELECT
TO authenticated
USING (
    -- User owns the bid
    user_id = auth.uid()
    OR
    -- User is member of bid's organization
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        WHERE uo.user_id = auth.uid()
        AND uo.organization_id = bids.organization_id
    )
    OR
    -- Trust members can audit all bids
    EXISTS (
        SELECT 1 FROM public.app_admins
        WHERE user_id = auth.uid()
        AND is_active = true
    )
);

COMMENT ON POLICY "bids_org_members_and_owner" ON public.bids IS
'SECURITY: Restricts bid access to owner, org members, and Trust members.
Protects: Universal Math bidding strategy ($1,060.66 junction value advantage per contract).';

-- ═══════════════════════════════════════════════════════════════════
-- FIX 3: BOOKS LIBRARY (MEDIUM RISK)
-- ═══════════════════════════════════════════════════════════════════
-- ISSUE: All 7 books exposed to anonymous users
-- FIX: Restrict to authenticated users minimum (Trust members preferred)
-- NOTE: If books are intended for public sale, this policy can be relaxed

-- Drop anonymous access
DROP POLICY IF EXISTS "books_public_read" ON public.books;
DROP POLICY IF EXISTS "Enable read access for everyone" ON public.books;

-- Restrict to authenticated users (minimum protection)
CREATE POLICY "books_authenticated_read"
ON public.books
FOR SELECT
TO authenticated
USING (
    -- Authenticated users can read published books
    status = 'published'
    OR
    -- Trust members can read all books (including drafts)
    EXISTS (
        SELECT 1 FROM public.app_admins
        WHERE user_id = auth.uid()
        AND is_active = true
    )
);

COMMENT ON POLICY "books_authenticated_read" ON public.books IS
'SECURITY: Authenticated users see published books. Trust members see all books.
If books are for public sale, remove TO authenticated restriction and allow anon.';

-- ═══════════════════════════════════════════════════════════════════
-- FIX 4: SYSTEM KNOWLEDGE (ENSURE PROPER PROTECTION)
-- ═══════════════════════════════════════════════════════════════════
-- Ensure system_knowledge table has proper RLS

-- Drop any overly permissive policies
DROP POLICY IF EXISTS "Enable read for all users" ON public.system_knowledge;
DROP POLICY IF EXISTS "system_knowledge_public_read" ON public.system_knowledge;

-- Create Trust member-only policy (if doesn't exist)
DO $$
BEGIN
    -- Check if a proper restrictive policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'system_knowledge'
        AND policyname LIKE '%trust%' OR policyname LIKE '%admin%'
    ) THEN
        -- Create Trust member policy
        CREATE POLICY "system_knowledge_trust_access"
        ON public.system_knowledge
        FOR SELECT
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.app_admins
                WHERE user_id = auth.uid()
                AND is_active = true
            )
        );
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════
-- VERIFICATION QUERIES
-- ═══════════════════════════════════════════════════════════════════

-- List all policies on critical tables
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ CRITICAL RLS SECURITY LOCKDOWN COMPLETE';
    RAISE NOTICE '═══════════════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '🔒 Protected Tables:';
    RAISE NOTICE '   1. roman_knowledge_base - Trust members only';
    RAISE NOTICE '   2. bids - Org members + Trust only';
    RAISE NOTICE '   3. books - Authenticated users (published) + Trust (all)';
    RAISE NOTICE '   4. system_knowledge - Trust members only';
    RAISE NOTICE '';
    RAISE NOTICE '👥 Trust Members defined as: app_admins WHERE is_active = true';
    RAISE NOTICE '';
    RAISE NOTICE '📊 To verify policies:';
    RAISE NOTICE '   SELECT tablename, policyname, roles, cmd';
    RAISE NOTICE '   FROM pg_policies';
    RAISE NOTICE '   WHERE tablename IN (''roman_knowledge_base'', ''bids'', ''books'', ''system_knowledge'');';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANT: Ensure all Trust members are in app_admins table!';
    RAISE NOTICE '═══════════════════════════════════════════════════════════════════';
    RAISE NOTICE '';
END $$;

-- ═══════════════════════════════════════════════════════════════════
-- SECURITY NOTES
-- ═══════════════════════════════════════════════════════════════════
--
-- 1. Trust Membership:
--    - Defined by public.app_admins table (is_active = true)
--    - Add Trust members: INSERT INTO app_admins (user_id, is_active) VALUES (?, true)
--    - Revoke access: UPDATE app_admins SET is_active = false WHERE user_id = ?
--
-- 2. R.O.M.A.N. Knowledge Base Protection:
--    - Contains: Sovereign Creditor data, IP valuation, financial architecture
--    - Access: Trust members only
--    - Service role: Can still write (for Chronicler ingestion)
--
-- 3. Bids Competitive Intelligence:
--    - Contains: Universal Math calculations, junction value strategy
--    - Access: Bid owner, org members, Trust members
--    - Protected from: Competitors, public view
--
-- 4. Books IP Protection:
--    - Contains: 7 published books (327M valuation)
--    - Access: Authenticated for published, Trust for drafts
--    - Can be relaxed if books are for public sale
--
-- ═══════════════════════════════════════════════════════════════════
