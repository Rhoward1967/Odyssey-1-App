-- ═══════════════════════════════════════════════════════════════════
-- TEMPORAL PULSE SYSTEM
-- Created: February 8, 2026
-- Architect: Rickey A. Howard
-- Purpose: Force R.O.M.A.N. to acknowledge CURRENT reality, not stale knowledge
-- ═══════════════════════════════════════════════════════════════════

-- This trigger "yells" at R.O.M.A.N. to update his temporal context
-- whenever critical system data changes (customers, contractors, trust data)

CREATE OR REPLACE FUNCTION public.refresh_roman_vision()
RETURNS trigger AS $$
BEGIN
  -- Force R.O.M.A.N. to sync with current year and operational status
  PERFORM pg_notify('roman_vision_update', json_build_object(
    'year', EXTRACT(YEAR FROM CURRENT_TIMESTAMP),
    'month', EXTRACT(MONTH FROM CURRENT_TIMESTAMP),
    'day', EXTRACT(DAY FROM CURRENT_TIMESTAMP),
    'timestamp', CURRENT_TIMESTAMP,
    'active_customers', (SELECT count(*) FROM public.customers WHERE status = 'active'),
    'active_contractors', (SELECT count(*) FROM public.employees WHERE role = 'contractor' AND status = 'active'),
    'total_businesses', (SELECT count(*) FROM public.businesses),
    'legal_status', 'COURTLISTENER_ACTIVE',
    'trust_status', 'INDEXED',
    'qbo_bypass', (SELECT value FROM public.system_config WHERE key = 'qbo_enabled'),
    'message', 'R.O.M.A.N. - Your vision is being refreshed. Current reality updated.'
  )::text);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fire the temporal pulse when customers change
CREATE TRIGGER temporal_pulse_customers
  AFTER INSERT OR UPDATE OR DELETE ON public.customers
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_roman_vision();

-- Fire the temporal pulse when employees/contractors change
CREATE TRIGGER temporal_pulse_employees
  AFTER INSERT OR UPDATE OR DELETE ON public.employees
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_roman_vision();

-- Fire the temporal pulse when business entities change
CREATE TRIGGER temporal_pulse_businesses
  AFTER INSERT OR UPDATE OR DELETE ON public.businesses
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_roman_vision();

-- Fire the temporal pulse when system_config changes
CREATE TRIGGER temporal_pulse_system_config
  AFTER UPDATE ON public.system_config
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_roman_vision();

-- Create a manual refresh function for on-demand temporal sync
CREATE OR REPLACE FUNCTION public.force_roman_temporal_sync()
RETURNS json AS $$
DECLARE
  pulse_data json;
BEGIN
  -- Build the temporal pulse data
  pulse_data := json_build_object(
    'year', EXTRACT(YEAR FROM CURRENT_TIMESTAMP),
    'month', EXTRACT(MONTH FROM CURRENT_TIMESTAMP),
    'day', EXTRACT(DAY FROM CURRENT_TIMESTAMP),
    'timestamp', CURRENT_TIMESTAMP,
    'active_customers', (SELECT count(*) FROM public.customers WHERE status = 'active'),
    'active_contractors', (SELECT count(*) FROM public.employees WHERE role = 'contractor' AND status = 'active'),
    'total_businesses', (SELECT count(*) FROM public.businesses),
    'legal_status', 'COURTLISTENER_ACTIVE',
    'trust_status', 'INDEXED',
    'qbo_bypass', (SELECT value FROM public.system_config WHERE key = 'qbo_enabled'),
    'message', 'Manual temporal sync requested - R.O.M.A.N. vision forcibly refreshed'
  );
  
  -- Send notification
  PERFORM pg_notify('roman_vision_update', pulse_data::text);
  
  -- Return the pulse data
  RETURN pulse_data;
END;
$$ LANGUAGE plpgsql;

-- Add helpful comment
COMMENT ON FUNCTION public.refresh_roman_vision IS 
'Temporal Pulse: Forces R.O.M.A.N. to update his awareness of current year, customer count, and operational status. Fires automatically on data changes.';

COMMENT ON FUNCTION public.force_roman_temporal_sync IS 
'Manual Temporal Sync: Call this function to force R.O.M.A.N. to acknowledge current reality. Returns current system state.';

-- Test the temporal pulse
SELECT public.force_roman_temporal_sync();
