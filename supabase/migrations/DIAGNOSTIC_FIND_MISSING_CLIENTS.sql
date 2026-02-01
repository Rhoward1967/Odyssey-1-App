-- Find which clients are loaded vs missing
SELECT 
  c.company_name,
  r.location_label,
  r.amount_cents / 100.0 as amount,
  r.is_active
FROM recurring_invoices r
JOIN customers c ON r.customer_id = c.id
WHERE c.user_id IN (SELECT id FROM auth.users WHERE email = 'rickeyhoward3@gmail.com')
ORDER BY c.company_name, r.location_label;

-- Show the revenue breakdown
SELECT 
  COUNT(*) as loaded_schedules,
  SUM(amount_cents) / 100.0 as loaded_revenue
FROM recurring_invoices
WHERE is_active = true
  AND user_id IN (SELECT id FROM auth.users WHERE email = 'rickeyhoward3@gmail.com');

-- Find customers with NO recurring invoices
SELECT 
  c.company_name,
  c.id
FROM customers c
WHERE c.user_id IN (SELECT id FROM auth.users WHERE email = 'rickeyhoward3@gmail.com')
  AND NOT EXISTS (
    SELECT 1 FROM recurring_invoices r WHERE r.customer_id = c.id
  )
ORDER BY c.company_name;
