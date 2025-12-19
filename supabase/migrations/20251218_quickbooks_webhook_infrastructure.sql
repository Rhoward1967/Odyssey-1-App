-- =====================================================
-- QUICKBOOKS WEBHOOK INFRASTRUCTURE
-- =====================================================
-- Migration: 20251218_quickbooks_webhook_infrastructure.sql
-- Purpose: Create webhook_log table and indexes for QuickBooks integration
-- Author: GitHub Copilot + Rickey A Howard
-- Date: 2025-12-18

-- =====================================================
-- 1. WEBHOOK LOG TABLE (Idempotency & Audit)
-- =====================================================

CREATE TABLE IF NOT EXISTS webhook_log (
  id BIGSERIAL PRIMARY KEY,
  
  -- Idempotency key from webhook provider
  delivery_id TEXT UNIQUE NOT NULL,
  
  -- Webhook metadata
  source TEXT NOT NULL, -- 'quickbooks', 'stripe', etc.
  event_type TEXT NOT NULL, -- 'webhook_received', 'sync_completed', etc.
  
  -- Payload and processing info
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  processed_entities TEXT[] DEFAULT ARRAY[]::TEXT[],
  errors TEXT[] DEFAULT NULL,
  
  -- Performance tracking
  processing_time_ms INTEGER DEFAULT NULL,
  
  -- Request tracking
  request_id UUID NOT NULL DEFAULT gen_random_uuid(),
  
  -- Timestamps
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ DEFAULT NULL,
  
  -- Status tracking
  status TEXT DEFAULT 'received' CHECK (status IN ('received', 'processing', 'completed', 'failed')),
  
  -- Retry tracking
  retry_count INTEGER DEFAULT 0,
  last_retry_at TIMESTAMPTZ DEFAULT NULL
);

-- Index for idempotency checks (critical for performance)
CREATE INDEX IF NOT EXISTS idx_webhook_log_delivery_id 
  ON webhook_log(delivery_id);

-- Index for querying by source and status
CREATE INDEX IF NOT EXISTS idx_webhook_log_source_status 
  ON webhook_log(source, status);

-- Index for time-based queries
CREATE INDEX IF NOT EXISTS idx_webhook_log_received_at 
  ON webhook_log(received_at DESC);

-- Index for finding failed webhooks to retry
CREATE INDEX IF NOT EXISTS idx_webhook_log_failed 
  ON webhook_log(status, received_at DESC) 
  WHERE status = 'failed';

COMMENT ON TABLE webhook_log IS 'Audit log for all incoming webhooks with idempotency protection';
COMMENT ON COLUMN webhook_log.delivery_id IS 'Unique delivery ID from webhook provider for deduplication';
COMMENT ON COLUMN webhook_log.processed_entities IS 'Array of entity:id pairs that were processed';

-- =====================================================
-- 2. ADD EXTERNAL_ID TO CUSTOMERS (If not exists)
-- =====================================================

-- Add external_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'external_id'
  ) THEN
    ALTER TABLE customers ADD COLUMN external_id TEXT;
  END IF;
END $$;

-- Add unique constraint for idempotent upserts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'customers_external_id_key'
  ) THEN
    ALTER TABLE customers ADD CONSTRAINT customers_external_id_key UNIQUE (external_id);
  END IF;
END $$;

-- Index for QuickBooks customer lookups
CREATE INDEX IF NOT EXISTS idx_customers_external_id 
  ON customers(external_id) 
  WHERE external_id IS NOT NULL;

-- Index for source tracking
CREATE INDEX IF NOT EXISTS idx_customers_source 
  ON customers(source) 
  WHERE source IS NOT NULL;

COMMENT ON COLUMN customers.external_id IS 'External ID from QuickBooks or other systems';

-- =====================================================
-- 3. ADD EXTERNAL_ID TO INVOICES (If not exists)
-- =====================================================

-- Add external_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invoices' AND column_name = 'external_id'
  ) THEN
    ALTER TABLE invoices ADD COLUMN external_id TEXT;
  END IF;
END $$;

-- Add unique constraint for idempotent upserts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'invoices_external_id_key'
  ) THEN
    ALTER TABLE invoices ADD CONSTRAINT invoices_external_id_key UNIQUE (external_id);
  END IF;
END $$;

-- Index for QuickBooks invoice lookups
CREATE INDEX IF NOT EXISTS idx_invoices_external_id 
  ON invoices(external_id) 
  WHERE external_id IS NOT NULL;

-- Index for customer relationship (critical for joins)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invoices' AND column_name = 'customer_external_id'
  ) THEN
    ALTER TABLE invoices ADD COLUMN customer_external_id TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_invoices_customer_external_id 
  ON invoices(customer_external_id) 
  WHERE customer_external_id IS NOT NULL;

COMMENT ON COLUMN invoices.external_id IS 'External ID from QuickBooks or other systems';
COMMENT ON COLUMN invoices.customer_external_id IS 'Links to customers.external_id for cross-system relationships';

-- =====================================================
-- 4. ADD EXTERNAL_ID TO PAYMENTS_V2 (If not exists)
-- =====================================================

-- Add external_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments_v2' AND column_name = 'external_id'
  ) THEN
    ALTER TABLE payments_v2 ADD COLUMN external_id TEXT;
  END IF;
END $$;

-- Add unique constraint for idempotent upserts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'payments_v2_external_id_key'
  ) THEN
    ALTER TABLE payments_v2 ADD CONSTRAINT payments_v2_external_id_key UNIQUE (external_id);
  END IF;
END $$;

-- Index for QuickBooks payment lookups
CREATE INDEX IF NOT EXISTS idx_payments_v2_external_id 
  ON payments_v2(external_id) 
  WHERE external_id IS NOT NULL;

-- Index for customer relationship
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments_v2' AND column_name = 'customer_external_id'
  ) THEN
    ALTER TABLE payments_v2 ADD COLUMN customer_external_id TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_payments_v2_customer_external_id 
  ON payments_v2(customer_external_id) 
  WHERE customer_external_id IS NOT NULL;

-- Index for payment date queries
CREATE INDEX IF NOT EXISTS idx_payments_v2_payment_date 
  ON payments_v2(payment_date DESC) 
  WHERE payment_date IS NOT NULL;

COMMENT ON COLUMN payments_v2.external_id IS 'External ID from QuickBooks or other payment systems';
COMMENT ON COLUMN payments_v2.customer_external_id IS 'Links to customers.external_id for cross-system relationships';

-- =====================================================
-- 5. ADD MISSING COLUMNS FOR QUICKBOOKS DATA
-- =====================================================

-- Add payment_date to payments_v2 if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments_v2' AND column_name = 'payment_date'
  ) THEN
    ALTER TABLE payments_v2 ADD COLUMN payment_date DATE;
  END IF;
END $$;

-- Add payment_method to payments_v2 if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments_v2' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE payments_v2 ADD COLUMN payment_method TEXT;
  END IF;
END $$;

-- Add reference_number to payments_v2 if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments_v2' AND column_name = 'reference_number'
  ) THEN
    ALTER TABLE payments_v2 ADD COLUMN reference_number TEXT;
  END IF;
END $$;

-- Add notes to payments_v2 if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments_v2' AND column_name = 'notes'
  ) THEN
    ALTER TABLE payments_v2 ADD COLUMN notes TEXT;
  END IF;
END $$;

-- =====================================================
-- 6. GRANT PERMISSIONS
-- =====================================================

-- Grant service role access (for Edge Functions)
GRANT ALL ON webhook_log TO service_role;
GRANT USAGE, SELECT ON SEQUENCE webhook_log_id_seq TO service_role;

-- Grant anon/authenticated read access for monitoring
GRANT SELECT ON webhook_log TO anon, authenticated;

-- =====================================================
-- 7. RLS POLICIES (Admin-only access for security)
-- =====================================================

ALTER TABLE webhook_log ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (bypasses RLS, for Edge Functions)
CREATE POLICY "Service role has full access to webhook_log"
  ON webhook_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow only admin users to view webhook logs (for debugging)
DROP POLICY IF EXISTS "Authenticated users can view webhook logs" ON webhook_log;
DROP POLICY IF EXISTS "admin_read_webhook_log" ON webhook_log;
CREATE POLICY "admin_read_webhook_log"
  ON webhook_log
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'app_role') = 'admin');

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Verify tables exist
DO $$
BEGIN
  RAISE NOTICE 'QuickBooks webhook infrastructure created successfully';
  RAISE NOTICE 'Tables: webhook_log, customers (external_id), invoices (external_id), payments_v2 (external_id)';
  RAISE NOTICE 'Indexes: Created for external_id columns and webhook_log lookups';
END $$;
