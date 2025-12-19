-- Make user_id nullable for customers synced from external sources like QuickBooks
ALTER TABLE public.customers 
  ALTER COLUMN user_id DROP NOT NULL;

-- Add comment explaining nullable user_id
COMMENT ON COLUMN public.customers.user_id IS 
  'User ID - nullable for customers synced from external sources (QuickBooks, etc.)';
