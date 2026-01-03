-- ============================================================================
-- FIX: roman_audit_log event_type NULL constraint violation
-- ============================================================================
-- Date: January 2, 2026
-- Issue: Audit logging failing due to NULL values in event_type column
-- Solution: Add default value and backfill existing NULLs
-- ============================================================================

-- Step 1: Backfill existing NULL event_type values with 'UNKNOWN'
UPDATE public.roman_audit_log
SET event_type = 'UNKNOWN'
WHERE event_type IS NULL;

-- Step 2: Add NOT NULL constraint with default value
-- (Column already exists and is marked NOT NULL in schema, but enforcement was failing)
-- This ensures future inserts cannot violate the constraint
ALTER TABLE public.roman_audit_log 
ALTER COLUMN event_type SET DEFAULT 'SYSTEM_EVENT';

-- Step 3: Add check constraint to prevent empty strings
ALTER TABLE public.roman_audit_log
ADD CONSTRAINT event_type_not_empty CHECK (LENGTH(event_type) > 0);

-- Verification query (run after migration)
-- SELECT COUNT(*) as null_count FROM public.roman_audit_log WHERE event_type IS NULL;
-- Expected: 0
