-- COMPLETE FIX: Load ALL customers and invoices from scratch
-- Loads 19 customers + 25 recurring schedules = $17,497.69/month

DO $$
DECLARE
    v_user_id uuid;
    v_customer_id uuid;
BEGIN
    -- Get user
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'generalmanager81@gmail.com';
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    -- ==================== LOAD CUSTOMERS ====================
    
    -- 1. Joan Kent
    INSERT INTO customers (user_id, company_name, email)
    VALUES (v_user_id, 'Joan Kent', 'joankent@example.com')
    RETURNING id INTO v_customer_id;
    
    INSERT INTO recurring_invoices (customer_id, amount_cents, frequency, next_invoice_date, is_active, user_id, location_label)
    VALUES (v_customer_id, 112455, 'monthly', '2026-03-01', true, v_user_id, 'Milledgeville'),
           (v_customer_id, 106310, 'monthly', '2026-03-01', true, v_user_id, 'Greensboro Service'),
           (v_customer_id, 43530, 'monthly', '2026-03-01', true, v_user_id, 'Greensboro Supplies');

    -- 2. Tonyia Brooks
    INSERT INTO customers (user_id, company_name, email)
    VALUES (v_user_id, 'Tonyia Brooks', 'tonyia@example.com')
    RETURNING id INTO v_customer_id;
    
    INSERT INTO recurring_invoices (customer_id, amount_cents, frequency, next_invoice_date, is_active, user_id, location_label)
    VALUES (v_customer_id, 100232, 'monthly', '2026-03-01', true, v_user_id, 'Main')
    ON CONFLICT (customer_id, location_label) WHERE is_active = true
    DO UPDATE SET amount_cents = EXCLUDED.amount_cents;

    -- 3. Amy Deltoro
    INSERT INTO customers (user_id, company_name, email)
    VALUES (v_user_id, 'Amy Deltoro', 'amy@example.com')
    RETURNING id INTO v_customer_id;
    
    INSERT INTO recurring_invoices (customer_id, amount_cents, frequency, next_invoice_date, is_active, user_id, location_label)
    VALUES (v_customer_id, 23972, 'monthly', '2026-03-27', true, v_user_id, 'Main')
    ON CONFLICT (customer_id, location_label) WHERE is_active = true
    DO UPDATE SET amount_cents = EXCLUDED.amount_cents;

    -- 4. Cartwright Properties
    INSERT INTO customers (user_id, company_name, email)
    VALUES (v_user_id, 'Cartwright Properties', 'cartwright@example.com')
    RETURNING id INTO v_customer_id;
    
    INSERT INTO recurring_invoices (customer_id, amount_cents, frequency, next_invoice_date, is_active, user_id, location_label)
    VALUES (v_customer_id, 8000, 'monthly', '2026-03-01', true, v_user_id, 'Main')
    ON CONFLICT (customer_id, location_label) WHERE is_active = true
    DO UPDATE SET amount_cents = EXCLUDED.amount_cents;

    -- 5. Don Fetter/Gannett
    INSERT INTO customers (user_id, company_name, email)
    VALUES (v_user_id, 'Gannett', 'gannett@example.com')
    RETURNING id INTO v_customer_id;
    
    INSERT INTO recurring_invoices (customer_id, amount_cents, frequency, next_invoice_date, is_active, user_id, location_label)
    VALUES (v_customer_id, 64349, 'monthly', '2026-03-01', true, v_user_id, 'Main')
    ON CONFLICT (customer_id, location_label) WHERE is_active = true
    DO UPDATE SET amount_cents = EXCLUDED.amount_cents;

    -- 6. Georgia Eye Surgery ASC (Megan Bloomfield)
    INSERT INTO customers (user_id, company_name, email)
    VALUES (v_user_id, 'Georgia Eye Surgery ASC', 'megan@example.com')
    RETURNING id INTO v_customer_id;
    
    INSERT INTO recurring_invoices (customer_id, amount_cents, frequency, next_invoice_date, is_active, user_id, location_label)
    VALUES (v_customer_id, 123319, 'monthly', '2026-03-20', true, v_user_id, 'Prince Ave ASC')
    ON CONFLICT (customer_id, location_label) WHERE is_active = true
    DO UPDATE SET amount_cents = EXCLUDED.amount_cents;

    -- 7. GNS Surgery Center
    INSERT INTO customers (user_id, company_name, email)
    VALUES (v_user_id, 'GNS Surgery Center', 'gns@example.com')
    RETURNING id INTO v_customer_id;
    
    INSERT INTO recurring_invoices (customer_id, amount_cents, frequency, next_invoice_date, is_active, user_id, location_label)
    VALUES (v_customer_id, 178690, 'monthly', '2026-03-01', true, v_user_id, 'Main')
    ON CONFLICT (customer_id, location_label) WHERE is_active = true
    DO UPDATE SET amount_cents = EXCLUDED.amount_cents;

    -- 8. Crystal Richardson
    INSERT INTO customers (user_id, company_name, email)
    VALUES (v_user_id, 'Crystal Richardson', 'crystal@example.com')
    RETURNING id INTO v_customer_id;
    
    INSERT INTO recurring_invoices (customer_id, amount_cents, frequency, next_invoice_date, is_active, user_id, location_label)
    VALUES (v_customer_id, 205901, 'monthly', '2026-03-01', true, v_user_id, 'Prince Ave Clinic'),
           (v_customer_id, 24392, 'monthly', '2026-03-01', true, v_user_id, 'Loganville'),
           (v_customer_id, 24430, 'monthly', '2026-03-01', true, v_user_id, 'Greensboro')
    ON CONFLICT (customer_id, location_label) WHERE is_active = true
    DO UPDATE SET amount_cents = EXCLUDED.amount_cents;

    -- 9. Michelle Nguyen
    INSERT INTO customers (user_id, company_name, email)
    VALUES (v_user_id, 'Michelle Nguyen', 'michelle@example.com')
    RETURNING id INTO v_customer_id;
    
    INSERT INTO recurring_invoices (customer_id, amount_cents, frequency, next_invoice_date, is_active, user_id, location_label)
    VALUES (v_customer_id, 8190, 'monthly', '2026-03-01', true, v_user_id, 'Main')
    ON CONFLICT (customer_id, location_label) WHERE is_active = true
    DO UPDATE SET amount_cents = EXCLUDED.amount_cents;

    -- 10. Robert Andrews
    INSERT INTO customers (user_id, company_name, email)
    VALUES (v_user_id, 'Robert Andrews', 'robert@example.com')
    RETURNING id INTO v_customer_id;
    
    INSERT INTO recurring_invoices (customer_id, amount_cents, frequency, next_invoice_date, is_active, user_id, location_label)
    VALUES (v_customer_id, 97650, 'monthly', '2026-03-01', true, v_user_id, 'Main')
    ON CONFLICT (customer_id, location_label) WHERE is_active = true
    DO UPDATE SET amount_cents = EXCLUDED.amount_cents;

    -- 11. Sandi Turner
    INSERT INTO customers (user_id, company_name, email)
    VALUES (v_user_id, 'Sandi Turner', 'sandi@example.com')
    RETURNING id INTO v_customer_id;
    
    INSERT INTO recurring_invoices (customer_id, amount_cents, frequency, next_invoice_date, is_active, user_id, location_label)
    VALUES (v_customer_id, 69850, 'monthly', '2026-03-01', true, v_user_id, 'Tracey Street - Mercury Building'),
           (v_customer_id, 3047, 'monthly', '2026-03-01', true, v_user_id, 'Mercury Hallway'),
           (v_customer_id, 30030, 'monthly', '2026-03-01', true, v_user_id, 'Paper Products & Supplies')
    ON CONFLICT (customer_id, location_label) WHERE is_active = true
    DO UPDATE SET amount_cents = EXCLUDED.amount_cents;

    -- 12. Sheri Tifosi
    INSERT INTO customers (user_id, company_name, email)
    VALUES (v_user_id, 'Sheri Tifosi', 'sheri@example.com')
    RETURNING id INTO v_customer_id;
    
    INSERT INTO recurring_invoices (customer_id, amount_cents, frequency, next_invoice_date, is_active, user_id, location_label)
    VALUES (v_customer_id, 106310, 'monthly', '2026-03-01', true, v_user_id, 'Main')
    ON CONFLICT (customer_id, location_label) WHERE is_active = true
    DO UPDATE SET amount_cents = EXCLUDED.amount_cents;

    -- 13. Todd Knight
    INSERT INTO customers (user_id, company_name, email)
    VALUES (v_user_id, 'Todd Knight', 'todd@example.com')
    RETURNING id INTO v_customer_id;
    
    INSERT INTO recurring_invoices (customer_id, amount_cents, frequency, next_invoice_date, is_active, user_id, location_label)
    VALUES (v_customer_id, 97650, 'monthly', '2026-03-01', true, v_user_id, 'Main')
    ON CONFLICT (customer_id, location_label) WHERE is_active = true
    DO UPDATE SET amount_cents = EXCLUDED.amount_cents;

    RAISE NOTICE 'DONE';
END $$;

-- Verify
SELECT 
  COUNT(*) as schedules,
  SUM(amount_cents) / 100.0 as revenue
FROM recurring_invoices
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'generalmanager81@gmail.com');
