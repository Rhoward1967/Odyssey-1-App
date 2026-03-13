-- ============================================================
-- Add Eye MD Client: Joni Lawley
-- Contract Start: April 1, 2026
-- Monthly Value: $1,376.91 (9 visits × $152.99)
-- Service: 2x per week (Wednesday/Saturday), 8 visits/month
-- Howard Jones Bloodline Ancestral Trust / HJS SERVICES LLC
-- ============================================================

DO $eye_md$
DECLARE
  v_user_id     uuid;
  v_customer_id uuid;
BEGIN

  -- Get owner user_id
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'rickeyhoward3@gmail.com'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Owner user not found — check auth.users email';
  END IF;

  -- --------------------------------------------------------
  -- 1) Insert customer (idempotent — skip if email exists)
  -- --------------------------------------------------------
  INSERT INTO public.customers (
    user_id,
    company_name,
    first_name,
    last_name,
    email,
    address
  )
  SELECT
    v_user_id,
    'Eye MD',
    'Joni',
    'Lawley',
    'joni.drshah@gmail.com',
    '14 Vision Street, Bethlehem GA 30620'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.customers WHERE email = 'joni.drshah@gmail.com'
  )
  RETURNING id INTO v_customer_id;

  -- If already existed, fetch the id
  IF v_customer_id IS NULL THEN
    SELECT id INTO v_customer_id
    FROM public.customers
    WHERE email = 'joni.drshah@gmail.com'
    LIMIT 1;
  END IF;

  -- --------------------------------------------------------
  -- 2) Insert recurring invoice schedule
  -- --------------------------------------------------------
  INSERT INTO public.recurring_invoices (
    user_id,
    customer_id,
    frequency,
    start_date,
    end_date,
    next_invoice_date,
    total_amount,
    tax_rate,
    notes,
    is_active,
    line_items
  )
  SELECT
    v_user_id,
    v_customer_id,
    'monthly',
    '2026-04-01'::date,
    NULL,                    -- Never ends
    '2026-04-01'::date,
    1376.91,
    0,
    'Net 30. Checks payable to HJS SERVICES LLC, PO Box 80054, Athens GA 30608. Thank you for your business.',
    true,
    '[
      {
        "sku": "5628996",
        "description": "Service 2X per week (Wednesday/Saturday). Includes general cleaning services: high and low dusting, clean bathrooms, windows interior, restock paper products, empty all trash and replace can liners (customer provided supplies), clean break rooms, sweep/mop all floors, wipe down beds and all washable surfaces, clean windows interior, entrance ways and glass service counters. Billed monthly — 8 visits per month. Additional visits billed at regular invoice rates.",
        "service_date": "2026-04-01",
        "quantity": 9,
        "rate": 152.99,
        "amount": 1376.91,
        "tax": false
      }
    ]'::jsonb
  WHERE NOT EXISTS (
    SELECT 1 FROM public.recurring_invoices WHERE customer_id = v_customer_id
  );

  RAISE NOTICE 'Eye MD client added successfully. Customer ID: %', v_customer_id;

END $eye_md$;
