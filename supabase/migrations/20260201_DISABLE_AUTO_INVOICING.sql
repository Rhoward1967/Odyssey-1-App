-- ============================================================================
-- DISABLE AUTOMATED INVOICE GENERATION UNTIL MARCH 1, 2026
-- ============================================================================
-- CRITICAL: We do NOT take over billing until March 1, 2026
-- Until then, we ONLY send management change notifications (Welcome Letters)
-- NO INVOICES should be generated or sent without manual review/approval
-- ============================================================================

-- Disable the recurring invoice CRON job
SELECT cron.unschedule('recurring-invoice-generator');

-- Add safety flag to recurring_invoices table to prevent accidental generation
ALTER TABLE recurring_invoices 
ADD COLUMN IF NOT EXISTS manual_approval_required BOOLEAN DEFAULT true;

-- Comment for clarity
COMMENT ON COLUMN recurring_invoices.manual_approval_required IS 
  'When TRUE, invoices require manual review before sending. Set to FALSE after March 1, 2026 takeover.';

-- Update all existing recurring invoices to require manual approval
UPDATE recurring_invoices 
SET manual_approval_required = true
WHERE manual_approval_required IS NULL OR manual_approval_required = false;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify CRON job is disabled
-- SELECT * FROM cron.job WHERE jobname = 'recurring-invoice-generator';
-- Expected: 0 rows (job removed)

-- Verify all recurring invoices require manual approval
-- SELECT COUNT(*) as total, 
--        COUNT(*) FILTER (WHERE manual_approval_required = true) as requiring_approval
-- FROM recurring_invoices;
-- Expected: total = requiring_approval

-- ============================================================================
-- TO RE-ENABLE AFTER MARCH 1, 2026:
-- ============================================================================
-- 1. Review and approve all pending invoices
-- 2. Update recurring_invoices: UPDATE recurring_invoices SET manual_approval_required = false;
-- 3. Re-schedule CRON: Run migration 20260128_setup_recurring_invoice_cron.sql again
-- ============================================================================
