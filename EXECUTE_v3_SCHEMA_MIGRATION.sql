-- ============================================================================
-- EXECUTE THIS SQL IN SUPABASE SQL EDITOR
-- ============================================================================
-- Purpose: Apply R.O.M.A.N. Audit Log v3.0 Schema Alignment
-- Resolves: Discord bot column errors (42703)
-- Phase: PHASE 1 REMEDIATION
-- ============================================================================

-- Step 1: Add legacy compatibility columns
ALTER TABLE public.roman_audit_log
ADD COLUMN IF NOT EXISTS table_schema TEXT DEFAULT 'public',
ADD COLUMN IF NOT EXISTS table_name TEXT,
ADD COLUMN IF NOT EXISTS action TEXT;

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_roman_audit_log_table_schema
ON public.roman_audit_log(table_schema);

CREATE INDEX IF NOT EXISTS idx_roman_audit_log_table_name
ON public.roman_audit_log(table_name);

-- Step 3: Backfill existing rows
UPDATE public.roman_audit_log
SET 
  table_name = CASE 
    WHEN event_type LIKE '%_%' THEN split_part(event_type, '_', 2)
    ELSE NULL
  END,
  action = CASE 
    WHEN event_type LIKE '%_%' THEN split_part(event_type, '_', 1)
    ELSE event_type
  END
WHERE table_name IS NULL;

-- Step 4: Add column comments
COMMENT ON COLUMN public.roman_audit_log.table_schema IS 'v3.0: Legacy compatibility for Discord bot';
COMMENT ON COLUMN public.roman_audit_log.table_name IS 'v3.0: Extracted from event_type for legacy queries';
COMMENT ON COLUMN public.roman_audit_log.action IS 'v3.0: Extracted from event_type for legacy queries';

-- ============================================================================
-- VERIFICATION QUERY (Run after migration)
-- ============================================================================
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'roman_audit_log'
  AND column_name IN ('table_schema', 'table_name', 'action', 'event_type')
ORDER BY ordinal_position;

-- Expected Output:
-- table_schema | text | YES | 'public'::text
-- table_name   | text | YES | NULL
-- action       | text | YES | NULL
-- event_type   | text | YES | NULL
-- ============================================================================
