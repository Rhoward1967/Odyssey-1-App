-- ============================================================================
-- FIX: COMPLETE LEGACY AUDIT COMPATIBILITY (FINAL)
-- ============================================================================
-- Status: COMPREHENSIVE (18-Column Final Schema)
-- Execution Date: December 26, 2025 8:10 PM EST
-- Target: Resolve ALL 42703 errors for Discord Bot & Legacy Services
-- ============================================================================

-- 1. Add principles_checksum (the final missing column)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='roman_audit_log' AND column_name='principles_checksum') THEN
        ALTER TABLE public.roman_audit_log ADD COLUMN principles_checksum TEXT;
    END IF;
END $$;

-- 2. Add index for constitutional tracking
CREATE INDEX IF NOT EXISTS idx_roman_audit_principles_checksum ON public.roman_audit_log(principles_checksum);

-- 3. Document the column
COMMENT ON COLUMN public.roman_audit_log.principles_checksum IS 'Constitutional validation: Hash of Nine Principles compliance state.';

-- 4. Final Verification Query (18 Columns Expected)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'roman_audit_log'
ORDER BY ordinal_position;

-- ============================================================================
-- EXPECTED 18-COLUMN SCHEMA:
-- 1.  id (uuid)
-- 2.  event_type (text)
-- 3.  correlation_id (text)
-- 4.  user_id (text)
-- 5.  organization_id (integer)
-- 6.  action_data (jsonb)
-- 7.  validation_result (jsonb)
-- 8.  compliance_score (numeric)
-- 9.  violated_principle (text)
-- 10. timestamp (timestamp with time zone)
-- 11. created_at (timestamp with time zone)
-- 12. table_schema (text)
-- 13. table_name (text)
-- 14. action (text)
-- 15. user_role (text)
-- 16. before_row (jsonb)
-- 17. after_row (jsonb)
-- 18. principles_checksum (text) ← NEW
-- ============================================================================
