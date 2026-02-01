-- ============================================================================
-- SAFE RECURRING INVOICE CRON - DB FUNCTION (NO SECRETS)
-- Calls public.run_recurring_invoice_generator() directly
-- No HTTP, no embedded tokens, more reliable
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily at midnight UTC (7pm Central, 8pm Eastern)
SELECT cron.schedule(
    'recurring-invoice-generator-db',
    '0 0 * * *',
    $$SELECT public.run_recurring_invoice_generator();$$
);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- View scheduled jobs
SELECT * FROM cron.job WHERE jobname = 'recurring-invoice-generator-db';

-- View execution history (after Feb 1)
-- SELECT * FROM cron.job_run_details 
-- WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'recurring-invoice-generator-db')
-- ORDER BY start_time DESC LIMIT 10;
