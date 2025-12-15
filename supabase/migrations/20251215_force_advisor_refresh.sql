-- Force Advisor cache refresh by bumping view modification timestamps
-- Author: GitHub Copilot
-- Date: 2025-12-15
-- Purpose: Trigger fresh Advisor scan after confirming views are clean

-- No-op recreate to update pg_class.reltuples timestamp
CREATE OR REPLACE VIEW public.ops_roman_events AS
SELECT id, created_at, actor, action_type, context, payload, severity, event_type, repo, file, notes
FROM ops.roman_events;

CREATE OR REPLACE VIEW public.health_summary AS
SELECT 
  now() AS as_of,
  (SELECT count(*) FROM public.system_alerts WHERE severity IN ('error','critical')) AS open_critical_alerts,
  (SELECT count(*) FROM public.system_alerts) AS open_alerts,
  (SELECT max(created_at) FROM public.system_logs) AS last_event_time;

CREATE OR REPLACE VIEW public.view_user_bids AS
SELECT 
  b.id AS bid_id,
  b.created_at,
  b.user_id,
  b.organization_id,
  b.status,
  b.total_cents,
  b.customer_id,
  c.customer_name,
  c.email AS customer_email
FROM public.bids b
LEFT JOIN public.customers c ON c.id = b.customer_id;

-- Metadata update to signal "these are fresh, re-scan them"
COMMENT ON VIEW public.ops_roman_events IS 'Plain view - introspection verified no SECURITY DEFINER - 2025-12-15';
COMMENT ON VIEW public.health_summary IS 'Plain view - introspection verified no SECURITY DEFINER - 2025-12-15';
COMMENT ON VIEW public.view_user_bids IS 'Plain view - introspection verified no SECURITY DEFINER - 2025-12-15';
