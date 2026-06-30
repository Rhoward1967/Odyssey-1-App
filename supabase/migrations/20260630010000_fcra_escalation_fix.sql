-- FCRA escalation fix (2026-06-30)
-- The roman-autonomous-daemon `fcra-escalation` handler queried and updated two
-- columns on certified_mail_tracking that never existed -> the daily cron failed
-- silently for months while R.O.M.A.N.'s "autonomous repair" reported success.
-- The daemon CODE was already correct; only these columns were missing.
ALTER TABLE public.certified_mail_tracking
  ADD COLUMN IF NOT EXISTS follow_up_sent boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS follow_up_date date;

-- Cron fixes applied DB-side via pg_cron (kept out of this file because the job
-- commands embed an auth key). Recorded here for the historical record:
--   * fcra-daily-escalation (jobid 301): URL typo 'roman-au  tonomous-daemon'
--     (double space = "bad/illegal URL") corrected; Authorization header added.
--     LEFT PAUSED (active=false): auto-escalation of future overdue items —
--     including relationship-sensitive accounts like the CU holding HJS's
--     operating accounts — should be a deliberate trigger, not silent automation.
--   * monday-pulse-check (jobid 291): wrote to nonexistent iso20022.system_alerts
--     column "alert_message" -> corrected to "alert_type".
--   * recurring-invoice-generator-db (288) + secure-recurring-invoice-generator
--     (306): RETIRED (unscheduled). Redundant native billing; QuickBooks is the
--     billing system of record (estimates built here, entered to QB manually).
--
-- 2026-06-30 backlog: 18 FCRA Final Demand letters mailed via Lob (deduped from
-- 28; Peach State held for review). All logged in certified_mail_tracking.
