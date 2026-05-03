-- ═══════════════════════════════════════════════════════════════════
-- MIGRATION: Sovereign Disclaimer Gate
-- ═══════════════════════════════════════════════════════════════════
-- Date: May 3, 2026
-- Purpose: Track whether a subscriber has accepted the administrative
--          research disclaimer. Blocks R.O.M.A.N. access until accepted.
--          Part of the Linguistic Bridge — disclaimer fires in the
--          subscriber's preferred_language.
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS legal_disclaimer_accepted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS disclaimer_accepted_at timestamptz;
