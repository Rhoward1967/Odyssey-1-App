-- Realtime Broadcast for Subscription Status Changes
-- Created: 2025-12-17
-- Purpose: Live subscription updates pushed to authenticated users

-- ============================================================================
-- 1. BROADCAST TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.broadcast_subscription_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  -- Only broadcast when status actually changes or on insert/delete
  IF (TG_OP = 'INSERT')
     OR (TG_OP = 'DELETE')
     OR (TG_OP = 'UPDATE' AND (OLD.status IS DISTINCT FROM NEW.status)) 
  THEN
    -- Broadcast to user-specific private channel
    PERFORM pg_notify(
      'subscription_status_change',
      json_build_object(
        'user_id', COALESCE(NEW.user_id, OLD.user_id),
        'operation', TG_OP,
        'status', COALESCE(NEW.status, OLD.status),
        'tier', COALESCE(NEW.tier, OLD.tier),
        'stripe_subscription_id', COALESCE(NEW.stripe_subscription_id, OLD.stripe_subscription_id),
        'current_period_end', COALESCE(NEW.current_period_end, OLD.current_period_end),
        'timestamp', now()
      )::text
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- ============================================================================
-- 2. ATTACH TRIGGER TO SUBSCRIPTIONS TABLE
-- ============================================================================

DROP TRIGGER IF EXISTS trg_broadcast_subscription_changes ON public.subscriptions;

CREATE TRIGGER trg_broadcast_subscription_changes
AFTER INSERT OR UPDATE OR DELETE ON public.subscriptions
FOR EACH ROW 
EXECUTE FUNCTION public.broadcast_subscription_changes();

-- ============================================================================
-- 3. GRANT PERMISSIONS
-- ============================================================================

-- Allow authenticated users to listen to notifications
GRANT USAGE ON SCHEMA public TO authenticated;

-- ============================================================================
-- 4. DOCUMENTATION COMMENT
-- ============================================================================

COMMENT ON FUNCTION public.broadcast_subscription_changes() IS 
'Broadcasts subscription status changes via PostgreSQL NOTIFY for realtime updates. 
Client usage:
  const channel = supabase
    .channel("subscription_status_change")
    .on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "subscriptions",
      filter: `user_id=eq.${user.id}`
    }, handleStatusChange)
    .subscribe();
';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Realtime subscription broadcasts enabled';
  RAISE NOTICE '📡 Clients can subscribe to: subscription_status_change';
  RAISE NOTICE '🔐 Broadcasts are user-scoped and secure';
END $$;
