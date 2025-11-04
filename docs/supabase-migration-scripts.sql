-- SUPABASE PERFORMANCE OPTIMIZATION MIGRATION SCRIPTS
-- Execute in phases during low-traffic hours

-- =============================================
-- PHASE 1: RLS OPTIMIZATION (HANDBOOK TABLES)
-- Replace auth.uid() with (SELECT auth.uid())
-- Replace auth.role() with (SELECT auth.role())
-- Scope policies to authenticated only
-- =============================================

-- 1A) handbook_categories
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'handbook_categories' AND policyname = 'handbook_categories_delete') THEN
        DROP POLICY "handbook_categories_delete" ON public.handbook_categories;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'handbook_categories' AND policyname = 'handbook_categories_insert') THEN
        DROP POLICY "handbook_categories_insert" ON public.handbook_categories;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'handbook_categories' AND policyname = 'handbook_categories_select') THEN
        DROP POLICY "handbook_categories_select" ON public.handbook_categories;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'handbook_categories' AND policyname = 'handbook_categories_update') THEN
        DROP POLICY "handbook_categories_update" ON public.handbook_categories;
    END IF;
END $$;

CREATE POLICY "handbook_categories_delete" ON public.handbook_categories 
FOR DELETE TO authenticated 
USING (((SELECT auth.role()) = 'authenticated') AND meets_role_requirement('admin'));

CREATE POLICY "handbook_categories_insert" ON public.handbook_categories 
FOR INSERT TO authenticated 
WITH CHECK (((SELECT auth.role()) = 'authenticated') AND meets_role_requirement('admin'));

CREATE POLICY "handbook_categories_select" ON public.handbook_categories 
FOR SELECT TO authenticated 
USING (((SELECT auth.role()) = 'authenticated') AND (is_active = true) AND meets_role_requirement(required_role::text));

CREATE POLICY "handbook_categories_update" ON public.handbook_categories 
FOR UPDATE TO authenticated 
USING (((SELECT auth.role()) = 'authenticated') AND meets_role_requirement('admin'));

-- Continue with all other handbook tables...
-- (handbook_sections, handbook_section_history, handbook_acknowledgments, etc.)

-- =============================================
-- PHASE 2: POLICY CONSOLIDATION
-- Merge multiple permissive policies per action
-- =============================================

-- 2A) agents table - merge 3 policies into 1 per action
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "agents_all_access" ON public.agents;
    DROP POLICY IF EXISTS "agents_constitutional_sovereignty" ON public.agents;
    DROP POLICY IF EXISTS "agents_org_access" ON public.agents;
END $$;

CREATE POLICY "agents_select_merged" ON public.agents 
FOR SELECT TO authenticated 
USING (
    true OR 
    (organization_id IN (
        SELECT uo.organization_id FROM public.user_organizations uo 
        WHERE uo.user_id = (SELECT auth.uid())
    ))
);

-- Continue with bids and roman_commands...

-- =============================================
-- PHASE 3: INDEX CLEANUP
-- Drop duplicate indexes (keep *_id naming)
-- =============================================

BEGIN;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_agents_organization;
COMMIT;

BEGIN;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_roman_commands_user;
COMMIT;

-- =============================================
-- POST-MIGRATION VALIDATION
-- =============================================

-- Test queries to verify performance improvements
-- EXPLAIN ANALYZE SELECT * FROM handbook_categories WHERE is_active = true;
-- EXPLAIN ANALYZE SELECT * FROM agents WHERE organization_id = 'test-org';
