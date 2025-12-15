-- FINAL SCHEMA UNIFICATION: Adding all missing flat columns and defaults.

-- 1. Add missing flat columns (idempotent, won't duplicate if they exist)
ALTER TABLE public.customers
    ADD COLUMN IF NOT EXISTS customer_name TEXT,
    ADD COLUMN IF NOT EXISTS organization TEXT,
    ADD COLUMN IF NOT EXISTS customer_type TEXT,
    
    ADD COLUMN IF NOT EXISTS first_name TEXT,
    ADD COLUMN IF NOT EXISTS last_name TEXT,
    ADD COLUMN IF NOT EXISTS email TEXT,
    ADD COLUMN IF NOT EXISTS secondary_email TEXT,
    ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS secondary_phone TEXT,
    
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS billing_address TEXT,
    ADD COLUMN IF NOT EXISTS mailing_address TEXT,
    
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS status TEXT;

-- 2. Set Defaults (Idempotent: only sets if no default exists)
ALTER TABLE public.customers
    ALTER COLUMN status SET DEFAULT 'active',
    ALTER COLUMN customer_type SET DEFAULT 'commercial';

-- 3. CRITICAL SECURITY: Enforce user_id ownership on INSERT/UPDATE via Trigger
-- This ensures RLS always works and the client can't spoof ownership.
CREATE OR REPLACE FUNCTION public.set_customer_user_id()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        NEW.user_id = auth.uid();
    ELSIF TG_OP = 'UPDATE' AND NEW.user_id IS DISTINCT FROM OLD.user_id THEN
        RAISE EXCEPTION 'User ID cannot be changed.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it already exists before creating a new one
DROP TRIGGER IF EXISTS tr_set_customer_user_id ON public.customers;

CREATE TRIGGER tr_set_customer_user_id
BEFORE INSERT OR UPDATE ON public.customers
FOR EACH ROW EXECUTE FUNCTION public.set_customer_user_id();


SELECT 'All flat columns added, defaults set (active/commercial), and user_id security trigger deployed.' AS status;
