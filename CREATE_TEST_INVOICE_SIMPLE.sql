-- Simple test invoice creation - bypasses RLS issues
-- Creates invoice directly with hardcoded IDs
-- Run this entire script as one query
WITH joan_kent AS (
  SELECT id as customer_id, user_id
  FROM customers 
  WHERE company_name = 'Joan Kent'
  LIMIT 1
),
new_invoice AS (
  INSERT INTO invoices (
    customer_id, 
    user_id, 
    invoice_number, 
    issue_date, 
    due_date, 
    subtotal, 
    total_amount,
    shipping_amount,
    deposit_amount,
    tax_rate,
    tax_amount,
    status, 
    notes
  )
  SELECT 
    customer_id,
    user_id,
    'INV-202601-TEST',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '15 days',
    1124.55,
    1124.55,
    0,
    0,
    0,
    0,
    'pending',
    'Monthly Cleaning Service - Milledgeville'
  FROM joan_kent
  RETURNING id, customer_id, user_id, invoice_number
)
INSERT INTO invoice_line_items (
  invoice_id, 
  description, 
  quantity, 
  unit_price, 
  total
)
SELECT 
  id,
  'Monthly Cleaning Service - Milledgeville',
  1,
  1124.55,
  1124.55
FROM new_invoice;

-- Run verification query separately:
-- SELECT i.id, i.invoice_number, c.company_name, '$' || i.total_amount::text as amount, i.status, i.due_date::date
-- FROM invoices i JOIN customers c ON i.customer_id = c.id WHERE i.invoice_number = 'INV-202601-TEST';
