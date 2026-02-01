-- ============================================================================
-- ADD LOCATION_LABEL COLUMN AND UNIQUE CONSTRAINT
-- Purpose: Enable idempotent upserts, prevent duplicate invoices per location
-- ============================================================================

-- Add location_label column to recurring_invoices
ALTER TABLE public.recurring_invoices
ADD COLUMN IF NOT EXISTS location_label text;

-- Create unique index to prevent duplicate active invoices per customer/location
-- This allows multiple invoices per customer (different locations) but prevents
-- duplicate invoices for the same location
CREATE UNIQUE INDEX IF NOT EXISTS idx_recurring_invoices_unique_active_location
ON public.recurring_invoices (customer_id, location_label)
WHERE is_active = true;

-- Add comment explaining the constraint
COMMENT ON INDEX idx_recurring_invoices_unique_active_location IS 
'Ensures each customer can have only one active recurring invoice per location. Allows multiple locations per customer.';

COMMENT ON COLUMN public.recurring_invoices.location_label IS
'Optional label identifying the service location (e.g., "Prince Ave Clinic", "Loganville", "Greensboro Service"). Used with unique constraint to prevent duplicate invoices.';
