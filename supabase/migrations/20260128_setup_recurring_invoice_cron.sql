-- ============================================================================
-- RECURRING INVOICE DAILY CRON
-- ============================================================================
-- This sets up automatic invoice generation every day at midnight UTC
-- 
-- Schedule: 0 0 * * * (daily at midnight UTC)
-- Function: recurring-invoice-generator Edge Function
-- Expected: 17 invoices on Feb 1, 2026
-- ============================================================================

-- Install pg_cron and pg_net extensions (if not already installed)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the recurring invoice generator to run daily at midnight UTC
SELECT cron.schedule(
    'recurring-invoice-generator',  -- Job name
    '0 0 * * *',                     -- Schedule: Daily at midnight UTC
    $$
    SELECT net.http_post(
        url := 'https://tvsxloejfsrdganemsmg.supabase.co/functions/v1/recurring-invoice-generator',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2c3hsb2VqZnNyZGdhbmVtc21nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjcxODg0OCwiZXhwIjoyMDcyMjk0ODQ4fQ.Wr3ffDizDf3DXG2uFD7-z4XrmtQUJjX-m9hiLoMvd1M"}'::jsonb
    ) AS request_id;
    $$
);

-- ============================================================================
-- MONITORING QUERIES
-- ============================================================================

-- View scheduled cron jobs
-- SELECT * FROM cron.job;

-- View cron job execution history
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

-- View invoices generated today
-- SELECT c.company_name, i.invoice_number, i.total_amount, i.issued_date, i.status
-- FROM invoices i
-- JOIN customers c ON i.customer_id = c.id
-- WHERE i.issued_date = CURRENT_DATE
-- ORDER BY c.company_name;

-- View upcoming recurring invoices
-- SELECT c.company_name, r.amount_cents / 100.0 as amount, r.frequency, r.next_invoice_date
-- FROM recurring_invoices r
-- JOIN customers c ON r.customer_id = c.id
-- WHERE r.is_active = true
-- ORDER BY r.next_invoice_date;

-- ============================================================================
-- EXPECTED RESULTS: FEB 1, 2026
-- ============================================================================
-- 17 invoices should be generated:
-- - ADM Joan Kent: $1,124.55
-- - Crystal Richardson MAIN: $1,540.00
-- - Crystal Richardson (Trash): $60.00
-- - Kim Eberhart (Church): $112.50
-- - Michelle Nguyen MAIN: $2,410.00
-- - Scott Holman: $292.50
-- - Sandi Turner (Barber): $81.90
-- - Sandi Turner (Ice Cream): $60.00
-- - Susan Spear: $80.00
-- - Troy Hahn: $300.00
-- - Mitch Holt: $375.00
-- - Bridgette Moss: $300.00
-- - Kathy McGillivray: $510.00
-- - Jean Calhoun (County Admin): $412.00
-- - Jennifer Fleming: $450.00
-- - John Taylor (Funeral): $375.00
-- - Ken Porter: $765.00
-- TOTAL: ~$9,298.45
-- ============================================================================
