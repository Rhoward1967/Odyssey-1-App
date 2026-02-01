-- HJS SERVICES LLC - QUICKBOOKS TO ODYSSEY-1 MIGRATION
-- Created: January 28, 2026
-- Purpose: Migrate ACTIVE recurring clients only (clean slate, no catch-up)
-- Strategy: Closed accounts written off, Archana fixes QuickBooks separately
-- Active clients: 20 schedules = ~$13,000/month recurring revenue

-- =============================================================================
-- STEP 1: INSERT ACTIVE CUSTOMERS (Deduplicated by company_name)
-- =============================================================================

INSERT INTO public.customers (user_id, company_name, first_name, last_name, email, phone, address)
SELECT 
  (SELECT id FROM auth.users WHERE email = 'rickeyhoward3@gmail.com' LIMIT 1) as user_id,
  company_name,
  first_name,
  last_name,
  email,
  phone,
  address
FROM (VALUES
  ('ADM Joan Kent', 'Joan', 'Kent', NULL, NULL, NULL),
  ('ADM Joan Kent Milledgeville', 'Joan', 'Kent', NULL, NULL, NULL),
  ('Admin Tonyia Brooks', 'Tonyia', 'Brooks', NULL, NULL, NULL),
  ('Amy Deltoro', 'Amy', 'Deltoro', NULL, NULL, NULL),
  ('Cartwright Properties', NULL, NULL, NULL, NULL, NULL),
  ('Don Fetter/Gannett', 'Don', 'Fetter', NULL, NULL, NULL),
  ('Georgia Eye Surgery ASC', NULL, NULL, NULL, NULL, NULL),
  ('GNS SURGERY CENTER', NULL, NULL, NULL, NULL, NULL),
  ('Joan Kent', 'Joan', 'Kent', NULL, NULL, NULL),
  ('Crystal Richardson', 'Crystal', 'Richardson', NULL, NULL, NULL),
  ('Michelle Nguyen', 'Michelle', 'Nguyen', NULL, NULL, NULL),
  ('Robert Andrews', 'Robert', 'Andrews', NULL, NULL, NULL),
  ('Sandi Turner', 'Sandi', 'Turner', NULL, NULL, NULL),
  ('Sheri Tifosi', 'Sheri', 'Tifosi', NULL, NULL, NULL),
  ('Todd Knight', 'Todd', 'Knight', NULL, NULL, NULL)
) AS v(company_name, first_name, last_name, email, phone, address);

-- =============================================================================
-- STEP 2: INSERT RECURRING INVOICE SCHEDULES (20 Active Clients)
-- =============================================================================

WITH user_context AS (
  SELECT id as user_id FROM auth.users WHERE email = 'rickeyhoward3@gmail.com' LIMIT 1
),
customer_map AS (
  SELECT c.id as customer_id, c.company_name
  FROM public.customers c
  CROSS JOIN user_context u
  WHERE c.user_id = u.user_id
)
INSERT INTO public.recurring_invoices (
  user_id, customer_id, frequency, start_date, next_invoice_date, 
  line_items, total_amount, tax_rate, notes, is_active
)
SELECT 
  u.user_id,
  cm.customer_id,
  v.frequency,
  v.start_date::date,
  v.next_invoice_date::date,
  v.line_items::jsonb,
  v.total_amount::decimal(10,2),
  v.tax_rate::decimal(5,2),
  v.notes,
  true as is_active
FROM user_context u
CROSS JOIN (VALUES
  -- 1. ADM Joan Kent - $1,124.55/month
  ('ADM Joan Kent', 'monthly', '2026-02-01', '2026-02-01', 
   '[{"description": "Monthly janitorial service", "quantity": 1, "rate": 1124.55, "amount": 1124.55, "is_taxable": false}]',
   1124.55, 0, 'Migrated from QuickBooks - Active'),
  
  -- 2. ADM Joan Kent Milledgeville - $1,124.55/month (CORRECTED: QB showed 3/1, should be 2/1)
  ('ADM Joan Kent Milledgeville', 'monthly', '2026-02-01', '2026-02-01',
   '[{"description": "Monthly janitorial service (Milledgeville)", "quantity": 1, "rate": 1124.55, "amount": 1124.55, "is_taxable": false}]',
   1124.55, 0, 'Migrated from QuickBooks - CORRECTED (QB had wrong date)'),
  
  -- 3. Admin Tonyia Brooks - $1,002.32/month
  ('Admin Tonyia Brooks', 'monthly', '2026-02-01', '2026-02-01',
   '[{"description": "Monthly janitorial service", "quantity": 1, "rate": 1002.32, "amount": 1002.32, "is_taxable": false}]',
   1002.32, 0, 'Migrated from QuickBooks - Active'),
  
  -- 4. Amy Deltoro - $239.72/month
  ('Amy Deltoro', 'monthly', '2026-02-27', '2026-02-27',
   '[{"description": "Monthly janitorial service", "quantity": 1, "rate": 239.72, "amount": 239.72, "is_taxable": false}]',
   239.72, 0, 'Migrated from QuickBooks - Active'),
  
  -- 5. Cartwright Properties - $80/month
  ('Cartwright Properties', 'monthly', '2026-02-01', '2026-02-01',
   '[{"description": "Monthly janitorial service", "quantity": 1, "rate": 80.00, "amount": 80.00, "is_taxable": false}]',
   80.00, 0, 'Migrated from QuickBooks - Active'),
  
  -- 6. Don Fetter/Gannett - $643.49/month
  ('Don Fetter/Gannett', 'monthly', '2026-03-01', '2026-03-01',
   '[{"description": "Monthly janitorial service", "quantity": 1, "rate": 643.49, "amount": 643.49, "is_taxable": false}]',
   643.49, 0, 'Migrated from QuickBooks - Active'),
  
  -- 7. Georgia Eye Surgery ASC - $1,233.19/month
  ('Georgia Eye Surgery ASC', 'monthly', '2026-02-20', '2026-02-20',
   '[{"description": "Monthly janitorial service", "quantity": 1, "rate": 1233.19, "amount": 1233.19, "is_taxable": false}]',
   1233.19, 0, 'Migrated from QuickBooks - Active'),
  
  -- 8. GNS SURGERY CENTER - $1,786.90/month
  ('GNS SURGERY CENTER', 'monthly', '2026-03-01', '2026-03-01',
   '[{"description": "Monthly janitorial service", "quantity": 1, "rate": 1786.90, "amount": 1786.90, "is_taxable": false}]',
   1786.90, 0, 'Migrated from QuickBooks - Active'),
  
  -- 9. Joan Kent - $1,063.10/month
  ('Joan Kent', 'monthly', '2026-02-01', '2026-02-01',
   '[{"description": "Monthly janitorial service", "quantity": 1, "rate": 1063.10, "amount": 1063.10, "is_taxable": false}]',
   1063.10, 0, 'Migrated from QuickBooks - Active'),
  
  -- 10. Joan Kent (Paper Supplies) - $435.30 every 2 months
  ('Joan Kent', 'monthly', '2026-03-01', '2026-03-01',
   '[{"description": "Paper supplies (bi-monthly)", "quantity": 1, "rate": 435.30, "amount": 435.30, "is_taxable": false}]',
   435.30, 0, 'Migrated from QuickBooks - Every 2 months (will adjust manually)'),
  
  -- 11. MGR Crystal Richardson - $244.30/month
  ('Crystal Richardson', 'monthly', '2026-02-01', '2026-02-01',
   '[{"description": "Monthly janitorial service (MGR)", "quantity": 1, "rate": 244.30, "amount": 244.30, "is_taxable": false}]',
   244.30, 0, 'Migrated from QuickBooks - Active'),
  
  -- 12. MGR/L Crystal Richardson - $243.92/month (separate account)
  ('Crystal Richardson', 'monthly', '2026-02-01', '2026-02-01',
   '[{"description": "Monthly janitorial service (MGR/L)", "quantity": 1, "rate": 243.92, "amount": 243.92, "is_taxable": false}]',
   243.92, 0, 'Migrated from QuickBooks - Active (2nd location)'),
  
  -- 13. Crystal Richardson MAIN - $1,540/month (BROKEN IN QB - stopped 08/01/2024)
  ('Crystal Richardson', 'monthly', '2026-02-01', '2026-02-01',
   '[{"description": "Monthly janitorial service (MAIN account)", "quantity": 1, "rate": 1540.00, "amount": 1540.00, "is_taxable": false}]',
   1540.00, 0, 'CRITICAL FIX: Invoice stopped Aug 2024, QB won''t let edit. Resuming 2/1/2026'),
  
  -- 14. Michelle Nguyen - $225.69/month
  ('Michelle Nguyen', 'monthly', '2026-02-01', '2026-02-01',
   '[{"description": "Monthly janitorial service", "quantity": 1, "rate": 225.69, "amount": 225.69, "is_taxable": false}]',
   225.69, 0, 'Migrated from QuickBooks - Active'),
  
  -- 15. Michelle Nguyen Supply - $245.14/month
  ('Michelle Nguyen', 'monthly', '2026-02-01', '2026-02-01',
   '[{"description": "Monthly supply order", "quantity": 1, "rate": 245.14, "amount": 245.14, "is_taxable": false}]',
   245.14, 0, 'Migrated from QuickBooks - Active (supplies)'),
  
  -- 16. Robert Andrews - $355.20/month
  ('Robert Andrews', 'monthly', '2026-02-01', '2026-02-01',
   '[{"description": "Monthly janitorial service", "quantity": 1, "rate": 355.20, "amount": 355.20, "is_taxable": false}]',
   355.20, 0, 'Migrated from QuickBooks - Active'),
  
  -- 17. Sandi Turner - $698.50/month
  ('Sandi Turner', 'monthly', '2026-02-01', '2026-02-01',
   '[{"description": "Monthly janitorial service", "quantity": 1, "rate": 698.50, "amount": 698.50, "is_taxable": false}]',
   698.50, 0, 'Migrated from QuickBooks - Active'),
  
  -- 18. Sandi Turner Mercury Side 2 - $30.47/month
  ('Sandi Turner', 'monthly', '2026-02-01', '2026-02-01',
   '[{"description": "Monthly service (Mercury Side 2)", "quantity": 1, "rate": 30.47, "amount": 30.47, "is_taxable": false}]',
   30.47, 0, 'Migrated from QuickBooks - Active (2nd location)'),
  
  -- 19. Sandi Turner Supply Orders - $300.30/month
  ('Sandi Turner', 'monthly', '2026-02-01', '2026-02-01',
   '[{"description": "Monthly supply order", "quantity": 1, "rate": 300.30, "amount": 300.30, "is_taxable": false}]',
   300.30, 0, 'Migrated from QuickBooks - Active (supplies)'),
  
  -- 20. Sheri Tifosi - $776.47/month
  ('Sheri Tifosi', 'monthly', '2026-02-01', '2026-02-01',
   '[{"description": "Monthly janitorial service", "quantity": 1, "rate": 776.47, "amount": 776.47, "is_taxable": false}]',
   776.47, 0, 'Migrated from QuickBooks - Active'),
  
  -- 21. Todd Knight - $1,409.99/month
  ('Todd Knight', 'monthly', '2026-03-06', '2026-03-06',
   '[{"description": "Monthly janitorial service", "quantity": 1, "rate": 1409.99, "amount": 1409.99, "is_taxable": false}]',
   1409.99, 0, 'Migrated from QuickBooks - Active')
) AS v(company_name, frequency, start_date, next_invoice_date, line_items, total_amount, tax_rate, notes)
LEFT JOIN customer_map cm ON cm.company_name = v.company_name
WHERE cm.customer_id IS NOT NULL;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Check imported customers
SELECT 
  'Customers Imported' as metric,
  COUNT(*) as count
FROM public.customers
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'rickeyhoward3@gmail.com' LIMIT 1);

-- Check imported recurring invoices
SELECT 
  'Recurring Invoices Imported' as metric,
  COUNT(*) as count,
  SUM(total_amount) as total_monthly_revenue
FROM public.recurring_invoices
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'rickeyhoward3@gmail.com' LIMIT 1)
  AND is_active = true;

-- List all active recurring invoices with next invoice dates
SELECT 
  c.company_name,
  ri.frequency,
  ri.next_invoice_date,
  ri.total_amount,
  ri.notes
FROM public.recurring_invoices ri
JOIN public.customers c ON ri.customer_id = c.id
WHERE ri.user_id = (SELECT id FROM auth.users WHERE email = 'rickeyhoward3@gmail.com' LIMIT 1)
  AND ri.is_active = true
ORDER BY ri.next_invoice_date, c.company_name;
