-- ============================================================================
-- FIX: USER_ROLE LEGACY COMPATIBILITY
-- ============================================================================
-- Resolves 42703 error where legacy services (Discord Bot) expect 'user_role'.
-- Adds 'user_role' as a compatibility column to the roman_audit_log table.
-- ============================================================================

-- 1. Add the column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='roman_audit_log' AND column_name='user_role') THEN
        ALTER TABLE public.roman_audit_log ADD COLUMN user_role TEXT;
    END IF;
END $$;

-- 2. Add index for legacy lookups
CREATE INDEX IF NOT EXISTS idx_roman_audit_legacy_role ON public.roman_audit_log(user_role);

-- 3. Document the column
COMMENT ON COLUMN public.roman_audit_log.user_role IS 'Legacy compatibility column for Discord bot and older services. Maps to user_id/role in v3.0 logic.';

-- 4. Verify the final 15-column schema
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'roman_audit_log'
ORDER BY ordinal_position;
