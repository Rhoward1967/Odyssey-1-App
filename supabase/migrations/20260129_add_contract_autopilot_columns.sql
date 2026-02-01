-- ============================================================================
-- R.O.M.A.N. 2.0 AUTOPILOT: Contract Intelligence Columns
-- Adds anniversary tracking, price increase automation, and calendar logic
-- ============================================================================

-- Add contract tracking columns to recurring_invoices
ALTER TABLE recurring_invoices
ADD COLUMN IF NOT EXISTS contract_start_date DATE,
ADD COLUMN IF NOT EXISTS annual_increase_pct DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS service_days_per_week INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS due_date_offset_days INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS late_fee_pct DECIMAL(5,2) DEFAULT 5.00;

-- Create index for anniversary lookups (performance optimization)
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_contract_anniversary 
ON recurring_invoices(contract_start_date) 
WHERE is_active = true;

-- Add helpful comments
COMMENT ON COLUMN recurring_invoices.contract_start_date IS 'Original contract start date for anniversary tracking';
COMMENT ON COLUMN recurring_invoices.annual_increase_pct IS 'Annual price increase percentage (e.g., 3.00 for 3%)';
COMMENT ON COLUMN recurring_invoices.service_days_per_week IS 'Number of service visits per week (for 5-week month calculations)';
COMMENT ON COLUMN recurring_invoices.due_date_offset_days IS 'Days after invoice date before payment is due (default 15)';
COMMENT ON COLUMN recurring_invoices.late_fee_pct IS 'Late fee percentage applied after due date (default 5%)';

-- Backfill contract_start_date to match next_invoice_date for existing records
-- (Assumes contracts started one year before March 2026 go-live)
UPDATE recurring_invoices
SET contract_start_date = (next_invoice_date - INTERVAL '1 year')::DATE
WHERE contract_start_date IS NULL AND is_active = true;

-- Set default annual increase to 3% for all active contracts (standard industry rate)
UPDATE recurring_invoices
SET annual_increase_pct = 3.00
WHERE annual_increase_pct = 0.00 AND is_active = true;

-- Set service days per week to 1 for monthly invoices (most common)
UPDATE recurring_invoices
SET service_days_per_week = 1
WHERE service_days_per_week IS NULL AND frequency = 'monthly';

-- ============================================================================
-- VALIDATION QUERY (Run after migration)
-- ============================================================================
-- SELECT 
--   c.company_name,
--   r.location_label,
--   r.contract_start_date,
--   r.annual_increase_pct,
--   r.amount_cents / 100.0 AS current_amount,
--   (r.amount_cents * (1 + r.annual_increase_pct / 100.0)) / 100.0 AS next_year_amount
-- FROM recurring_invoices r
-- JOIN customers c ON r.customer_id = c.id
-- WHERE r.is_active = true
-- ORDER BY c.company_name, r.location_label;
