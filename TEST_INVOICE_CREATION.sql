-- Test: Manually create one invoice to verify the system works
-- Run this in Supabase SQL Editor

-- Check if invoices table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('invoices', 'invoice_line_items');

-- If tables don't exist, create them
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id),
  user_id uuid REFERENCES auth.users(id),
  invoice_number text UNIQUE NOT NULL,
  invoice_date timestamptz DEFAULT now(),
  due_date timestamptz,
  subtotal numeric(10,2) DEFAULT 0,
  tax_amount numeric(10,2) DEFAULT 0,
  total_amount numeric(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  notes text,
  metadata jsonb,
  stripe_payment_intent_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invoice_line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity integer DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  total numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Test: Create one invoice for Joan Kent - Milledgeville
DO $$
DECLARE
  v_user_id uuid := (SELECT id FROM auth.users WHERE email = 'generalmanager81@gmail.com' LIMIT 1);
  v_customer_id uuid;
  v_invoice_id uuid;
BEGIN
  -- Get Joan Kent's customer ID
  SELECT id INTO v_customer_id 
  FROM customers 
  WHERE company_name = 'Joan Kent' 
  AND user_id = v_user_id 
  LIMIT 1;

  IF v_customer_id IS NULL THEN
    RAISE NOTICE 'Customer not found';
    RETURN;
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
    now(),
    now() + interval '15 days',
    1124.55,
    1124.55,
    'pending',
    'TEST INVOICE - Monthly Cleaning Service - Milledgeville'
  ) RETURNING id INTO v_invoice_id;

  -- Add line item
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

  RAISE NOTICE 'Test invoice created: INV-202601-TEST';
END $$;

-- Verify invoice was created
SELECT 
  i.invoice_number,
  c.company_name,
  i.total_amount,
  i.status,
  i.due_date,
  i.notes
FROM invoices i
JOIN customers c ON i.customer_id = c.id
WHERE i.invoice_number = 'INV-202601-TEST';
