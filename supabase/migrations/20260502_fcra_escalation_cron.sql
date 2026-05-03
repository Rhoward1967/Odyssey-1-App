-- ═══════════════════════════════════════════════════════════════════
-- MIGRATION: FCRA Escalation Daily Cron
-- ═══════════════════════════════════════════════════════════════════
-- Date: May 2, 2026
-- Purpose: Schedule R.O.M.A.N. to auto-fire escalation letters
--          (Final Demand + $1,000 statutory damages) every day at
--          8 AM UTC for any FCRA entity whose response deadline has
--          passed with no response received.
--
-- REQUIRES: LOB_API_KEY set as Supabase Edge Function secret:
--   supabase secrets set LOB_API_KEY=live_xxxxxxxxxxxxx
--
-- The roman-autonomous-daemon has verify_jwt=false so pg_net can
-- call it without an Authorization header.
-- ═══════════════════════════════════════════════════════════════════

-- Enable pg_net if not already enabled (needed for HTTP calls from cron)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove existing job if re-running migration
SELECT cron.unschedule('fcra-daily-escalation') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'fcra-daily-escalation'
);

-- Schedule FCRA escalation check daily at 8 AM UTC
SELECT cron.schedule(
  'fcra-daily-escalation',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url     := 'https://tvsxloejfsrdganemsmg.supabase.co/functions/v1/roman-autonomous-daemon?action=fcra-escalation',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body    := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Verify it was created
SELECT jobname, schedule, command
FROM cron.job
WHERE jobname = 'fcra-daily-escalation';
