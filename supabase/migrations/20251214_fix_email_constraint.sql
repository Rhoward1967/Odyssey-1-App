-- Fix: Allow multiple customers with NULL email
-- Current constraint blocks multiple rows with NULL email
-- This removes the constraint and recreates it to allow NULL duplicates

-- Drop the existing unique constraint on email
ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS customers_email_key;

-- Create a unique constraint that allows multiple NULLs
-- This uses a partial unique index
CREATE UNIQUE INDEX IF NOT EXISTS customers_user_email_unique 
ON public.customers (user_id, email) 
WHERE email IS NOT NULL;

-- Comment
COMMENT ON INDEX customers_user_email_unique IS 'Allows multiple customers per user with NULL email, but enforces uniqueness for non-NULL emails';
