-- ============================================================================
-- R.O.M.A.N. AUDIT LOG v3.0 SCHEMA ALIGNMENT
-- ============================================================================
-- Purpose: Add table_schema column for legacy service compatibility
-- Resolves: 42703 errors in Discord bot and system_knowledge integrations
-- Status: PHASE 1 REMEDIATION (Dec 26, 2025)
-- ============================================================================

-- Add table_schema column with default 'public'
ALTER TABLE public.roman_audit_log
ADD COLUMN IF NOT EXISTS table_schema TEXT DEFAULT 'public';

-- Add table_name column for legacy audit compatibility
ALTER TABLE public.roman_audit_log
ADD COLUMN IF NOT EXISTS table_name TEXT;

-- Add action column for legacy audit compatibility
ALTER TABLE public.roman_audit_log
ADD COLUMN IF NOT EXISTS action TEXT;

-- Add index on table_schema for faster legacy queries
CREATE INDEX IF NOT EXISTS idx_roman_audit_log_table_schema
ON public.roman_audit_log(table_schema);

-- Add index on table_name for faster legacy queries
CREATE INDEX IF NOT EXISTS idx_roman_audit_log_table_name
ON public.roman_audit_log(table_name);

-- Update existing rows to extract table_name from event_type
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

-- ============================================================================
-- SCHEMA v3.0 VERIFICATION QUERY
-- ============================================================================
-- Run this to verify migration success:
-- 
-- SELECT 
--   column_name, 
--   data_type, 
--   is_nullable, 
--   column_default
-- FROM information_schema.columns
-- WHERE table_name = 'roman_audit_log'
-- ORDER BY ordinal_position;
-- ============================================================================

COMMENT ON COLUMN public.roman_audit_log.table_schema IS 'Legacy compatibility: Database schema for audited table (default: public)';
COMMENT ON COLUMN public.roman_audit_log.table_name IS 'Legacy compatibility: Table name extracted from event_type';
COMMENT ON COLUMN public.roman_audit_log.action IS 'Legacy compatibility: Action type extracted from event_type';

-- ============================================================================
-- ARCHITECT'S NOTE:
-- This migration bridges v2.0 (handshake-optimized) with v1.0 (legacy audit).
-- The core remains immutable. The periphery adapts to reduce noise.
-- Phase 2 will decommission system_knowledge entirely in favor of this table.
-- ============================================================================
