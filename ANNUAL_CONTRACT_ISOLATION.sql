-- ANNUAL CONTRACT ISOLATION STRATEGY
-- Protocol: SIP-2026-003 - Beth Smith Reconciliation
-- Purpose: Separate annual contracts from monthly MRR calculations

-- ==================== OPTION 1: FILTER-BASED APPROACH ====================
-- Keep all schedules in same table, update guardrail view to exclude annual

-- Updated Monthly Recurring Revenue Guardrail (excludes annual)
CREATE OR REPLACE VIEW monthly_recurring_revenue_guardrail AS
SELECT 
  SUM(amount_cents / 100.0) FILTER (WHERE frequency != 'annual') as mrr_usd,
  COUNT(*) FILTER (WHERE frequency != 'annual' AND is_active = true) as active_monthly_schedules,
  COUNT(*) FILTER (WHERE frequency = 'annual' AND is_active = true) as active_annual_contracts,
  SUM(amount_cents / 100.0) FILTER (WHERE frequency = 'annual') as annual_contract_value,
  (SUM(amount_cents / 100.0) FILTER (WHERE frequency != 'annual') = 14283.07) as matches_hard_stop
FROM public.recurring_invoices
WHERE is_active = true;

-- ==================== OPTION 2: SEPARATE TABLE APPROACH ====================
-- Move annual contracts to dedicated table (NOT RECOMMENDED - breaks foreign keys)

-- CREATE TABLE annual_contracts (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   customer_id uuid REFERENCES customers(id),
--   user_id uuid REFERENCES auth.users(id),
--   location_label text,
--   amount_cents bigint,
--   contract_start_date date,
--   next_invoice_date date,
--   is_active boolean DEFAULT true
-- );

-- ==================== RECOMMENDED: OPTION 1 ====================
-- Rationale:
-- 1. Keeps data integrity (all schedules in recurring_invoices)
-- 2. Edge Function already handles 'annual' frequency correctly
-- 3. Only guardrail view needs updating to filter by frequency
-- 4. Frontend can filter by frequency for different dashboard views

-- ==================== VERIFICATION QUERIES ====================

-- Check current state (before fix)
SELECT 
  frequency,
  COUNT(*) as count,
  SUM(amount_cents / 100.0) as total_usd
FROM recurring_invoices
WHERE is_active = true
GROUP BY frequency;

-- Expected results:
-- frequency | count | total_usd
-- monthly   | 19    | 14283.07
-- annual    | 2     | 61030.00

-- After guardrail update, MRR should show:
-- mrr_usd: 14283.07
-- active_monthly_schedules: 19
-- active_annual_contracts: 2
-- annual_contract_value: 61030.00
-- matches_hard_stop: TRUE
