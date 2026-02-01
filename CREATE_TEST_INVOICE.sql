-- Test invoice creation for Joan Kent Milledgeville
-- Run this in Supabase SQL Editor to create a test invoice

DO $$
DECLARE
  v_user_id uuid := (SELECT id FROM auth.users WHERE email = 'generalmanager81@gmail.com' LIMIT 1);
  v_customer_id uuid;
  v_invoice_id uuid;
BEGIN
  -- Get Joan Kent customer ID
  SELECT id INTO v_customer_id 
  FROM customers 
  WHERE company_name = 'Joan Kent' AND user_id = v_user_id 
  LIMIT 1;
  
  IF v_customer_id IS NULL THEN
    RAISE EXCEPTION 'Joan Kent customer not found';
  END IF;
  
  -- Create test invoice
  INSERT INTO invoices (
    customer_id, 
    user_id, 
    invoice_number, 
    invoice_date, 
    due_date, 
    subtotal, 
    total_amount, 
    status, 
    notes
  ) VALUES (
    v_customer_id, 
    v_user_id, 
    'INV-202601-TEST', 
    NOW(), 
    NOW() + INTERVAL '15 days',
    1124.55, 
    1124.55, 
    'pending', 
    'Monthly Cleaning Service - Milledgeville'
  ) RETURNING id INTO v_invoice_id;
  
  -- Create line item
  INSERT INTO invoice_line_items (
    invoice_id, 
    description, 
    quantity, 
    unit_price, 
    total
  ) VALUES (
    v_invoice_id, 
    'Monthly Cleaning Service - Milledgeville', 
    1, 
    1124.55, 
    1124.55
  );
  
  RAISE NOTICE 'Test invoice created successfully! Invoice ID: %', v_invoice_id;
END $$;

-- Verify the invoice was created
SELECT 
  i.invoice_number, 
  c.company_name, 
  '$' || i.total_amount::text as amount,
  i.status,
  i.due_date::date,
  COUNT(li.id) as line_items_count
FROM invoices i
JOIN customers c ON i.customer_id = c.id
LEFT JOIN invoice_line_items li ON li.invoice_id = i.id
WHERE i.invoice_number = 'INV-202601-TEST'
GROUP BY i.id, i.invoice_number, c.company_name, i.total_amount, i.status, i.due_date;
