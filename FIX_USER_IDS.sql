-- FIX: Update all customers and recurring_invoices with correct user_id
-- The CLEAN_SLATE data exists but has user_id = null
-- This updates all records with the correct user_id from auth.users

DO $$
DECLARE
  v_user_id uuid := (SELECT id FROM auth.users WHERE email = 'generalmanager81@gmail.com' LIMIT 1);
  v_customers_updated int;
  v_schedules_updated int;
BEGIN
  -- Update customers table
  UPDATE customers 
  SET user_id = v_user_id 
  WHERE user_id IS NULL;
  
  GET DIAGNOSTICS v_customers_updated = ROW_COUNT;
  
  -- Update recurring_invoices table
  UPDATE recurring_invoices 
  SET user_id = v_user_id 
  WHERE user_id IS NULL;
  
  GET DIAGNOSTICS v_schedules_updated = ROW_COUNT;
  
  RAISE NOTICE '✅ Updated % customers and % recurring schedules with user_id: %', 
    v_customers_updated, v_schedules_updated, v_user_id;
END $$;

-- Verify the fix
SELECT 
  COUNT(*) as total_customers,
  COUNT(*) FILTER (WHERE user_id IS NOT NULL) as with_user_id,
  COUNT(*) FILTER (WHERE user_id IS NULL) as missing_user_id
FROM customers;

SELECT 
  COUNT(*) as total_schedules,
  COUNT(*) FILTER (WHERE user_id IS NOT NULL) as with_user_id,
  COUNT(*) FILTER (WHERE user_id IS NULL) as missing_user_id
FROM recurring_invoices;

-- Show sample data
SELECT 
  c.company_name,
  c.user_id,
  COUNT(r.id) as schedule_count
FROM customers c
LEFT JOIN recurring_invoices r ON r.customer_id = c.id
GROUP BY c.id, c.company_name, c.user_id
ORDER BY c.company_name
LIMIT 5;
