-- ============================================================================
-- PRE-FLIGHT: CREATE APP_ADMINS TABLE
-- Required before R.O.M.A.N. governance monitoring deployment
-- ============================================================================

-- Create dedicated admin registry with activation control
CREATE TABLE IF NOT EXISTS public.app_admins (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    is_active boolean NOT NULL DEFAULT true,
    granted_by uuid REFERENCES auth.users(id),
    granted_at timestamptz NOT NULL DEFAULT NOW(),
    revoked_at timestamptz,
    notes text,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_admins_active 
    ON public.app_admins(user_id) WHERE is_active = true;

COMMENT ON TABLE public.app_admins IS 
    'Registry of users with admin privileges and activation status for governance policies';

-- Enable RLS (admins can view themselves, super admins can view all)
ALTER TABLE public.app_admins ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view their own record
CREATE POLICY "Admins can view own record"
    ON public.app_admins
    FOR SELECT
    USING (user_id = auth.uid());

-- Policy: Global admins can view all app admins
CREATE POLICY "Global admins can view all app admins"
    ON public.app_admins
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.global_admins
            WHERE user_id = auth.uid()
        )
    );

-- Seed from existing global_admins
INSERT INTO public.app_admins (user_id, is_active, granted_by, notes)
SELECT 
    ga.user_id, 
    true, 
    ga.granted_by, 
    COALESCE(ga.notes, 'Migrated from global_admins')
FROM public.global_admins ga
ON CONFLICT (user_id) DO NOTHING;

-- Verification
DO $$
DECLARE
    v_admin_count integer;
BEGIN
    SELECT COUNT(*) INTO v_admin_count FROM public.app_admins WHERE is_active = true;
    
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ APP_ADMINS TABLE CREATED';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE 'Active admins: %', v_admin_count;
    RAISE NOTICE 'Ready for R.O.M.A.N. governance deployment';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '';
END $$;
