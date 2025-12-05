-- Migration: Add Stripe Event Log for Idempotency and Auditing
CREATE TABLE IF NOT EXISTS public.stripe_event_log (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  payload JSONB
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_stripe_event_log_event_type ON public.stripe_event_log(event_type);
