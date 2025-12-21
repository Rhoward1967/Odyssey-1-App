-- ==============================================================================
-- R.O.M.A.N. RLS SERVICE ROLE BYPASS (v3.4 補完)
-- ==============================================================================
-- DESCRIPTION: Ensures service_role can bypass RLS on all R.O.M.A.N. tables
-- REASON: Edge Functions using service_role key need unrestricted access
-- ==============================================================================

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Service role full access on topics" ON public.authorized_topics;
DROP POLICY IF EXISTS "Service role full access on knowledge" ON public.external_knowledge;
DROP POLICY IF EXISTS "Service role full access on insights" ON public.learned_insights;
DROP POLICY IF EXISTS "Service role full access on log" ON public.autonomous_learning_log;
DROP POLICY IF EXISTS "Service role full access on stats" ON public.book_statistics;

-- Create service_role bypass policies with proper role check
CREATE POLICY "Service role bypass on topics" ON public.authorized_topics
    FOR ALL 
    TO service_role
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Service role bypass on knowledge" ON public.external_knowledge
    FOR ALL 
    TO service_role
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Service role bypass on insights" ON public.learned_insights
    FOR ALL 
    TO service_role
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Service role bypass on log" ON public.autonomous_learning_log
    FOR ALL 
    TO service_role
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Service role bypass on stats" ON public.book_statistics
    FOR ALL 
    TO service_role
    USING (true) 
    WITH CHECK (true);

SELECT 'R.O.M.A.N. RLS Service Role Bypass Policies Created Successfully' AS status;
