-- CLEAN SLATE: Day One Launch
-- Wipes old data and loads 14 customers + 21 schedules
-- Monthly Recurring: $14,283.07 (19 schedules)
-- Annual Contracts: $61,030.00 (2 schedules - Beth Smith)
-- Email: generalmanager81@gmail.com

-- ==================== STAGE 1: TOTAL WIPE ====================
TRUNCATE public.customers, public.recurring_invoices RESTART IDENTITY CASCADE;

-- ==================== STAGE 2: BUILD SOURCE OF TRUTH ====================
DO $$
DECLARE
    v_user_id uuid := (SELECT id FROM auth.users WHERE email = 'generalmanager81@gmail.com' LIMIT 1);
    v_c uuid;
BEGIN
    -- 1. JOAN KENT (3 schedules: $2,622.95)
    INSERT INTO customers (company_name, user_id) VALUES ('Joan Kent', v_user_id) RETURNING id INTO v_c;
    INSERT INTO recurring_invoices (customer_id, user_id, location_label, amount_cents, frequency, next_invoice_date, is_active) VALUES 
    (v_c, v_user_id, 'Milledgeville', 112455, 'monthly', '2026-03-01', true),
    (v_c, v_user_id, 'Greensboro Service', 106310, 'monthly', '2026-03-01', true),
    (v_c, v_user_id, 'Greensboro Supplies', 43530, 'monthly', '2026-03-01', true);

    -- 2. CRYSTAL RICHARDSON (3 schedules: $2,547.23)
    INSERT INTO customers (company_name, user_id) VALUES ('Crystal Richardson', v_user_id) RETURNING id INTO v_c;
    INSERT INTO recurring_invoices (customer_id, user_id, location_label, amount_cents, frequency, next_invoice_date, is_active) VALUES 
    (v_c, v_user_id, 'Prince Ave Clinic', 205901, 'monthly', '2026-03-01', true),
    (v_c, v_user_id, 'Loganville', 24392, 'monthly', '2026-03-01', true),
    (v_c, v_user_id, 'Greensboro', 24430, 'monthly', '2026-03-01', true);

    -- 3. SANDI TURNER (3 schedules: $1,029.27)
    INSERT INTO customers (company_name, user_id) VALUES ('Sandi Turner', v_user_id) RETURNING id INTO v_c;
    INSERT INTO recurring_invoices (customer_id, user_id, location_label, amount_cents, frequency, next_invoice_date, is_active) VALUES 
    (v_c, v_user_id, 'Tracey Street - Mercury Building', 69850, 'monthly', '2026-03-01', true),
    (v_c, v_user_id, 'Mercury Hallway', 3047, 'monthly', '2026-03-01', true),
    (v_c, v_user_id, 'Paper Products & Supplies', 30030, 'monthly', '2026-03-01', true);

    -- 4. GEORGIA EYE SURGERY ASC (1 schedule: $1,233.19)
    INSERT INTO customers (company_name, user_id) VALUES ('Georgia Eye Surgery ASC', v_user_id) RETURNING id INTO v_c;
    INSERT INTO recurring_invoices (customer_id, user_id, location_label, amount_cents, frequency, next_invoice_date, is_active) VALUES 
    (v_c, v_user_id, 'Prince Ave ASC', 123319, 'monthly', '2026-03-20', true);

    -- 5. TONYIA BROOKS (1 schedule: $1,002.32)
    INSERT INTO customers (company_name, user_id) VALUES ('Tonyia Brooks', v_user_id) RETURNING id INTO v_c;
    INSERT INTO recurring_invoices (customer_id, user_id, location_label, amount_cents, frequency, next_invoice_date, is_active) VALUES 
    (v_c, v_user_id, 'Tag Office', 100232, 'monthly', '2026-03-01', true);

    -- 6. AMY DELTORO (1 schedule: $239.72)
    INSERT INTO customers (company_name, user_id) VALUES ('Amy Deltoro', v_user_id) RETURNING id INTO v_c;
    INSERT INTO recurring_invoices (customer_id, user_id, location_label, amount_cents, frequency, next_invoice_date, is_active) VALUES 
    (v_c, v_user_id, 'Main', 23972, 'monthly', '2026-03-27', true);

    -- 7. CARTWRIGHT PROPERTIES (1 schedule: $80.00)
    INSERT INTO customers (company_name, user_id) VALUES ('Cartwright Properties', v_user_id) RETURNING id INTO v_c;
    INSERT INTO recurring_invoices (customer_id, user_id, location_label, amount_cents, frequency, next_invoice_date, is_active) VALUES 
    (v_c, v_user_id, 'Main', 8000, 'monthly', '2026-03-01', true);

    -- 8. GANNETT (1 schedule: $643.49)
    INSERT INTO customers (company_name, user_id) VALUES ('Gannett', v_user_id) RETURNING id INTO v_c;
    INSERT INTO recurring_invoices (customer_id, user_id, location_label, amount_cents, frequency, next_invoice_date, is_active) VALUES 
    (v_c, v_user_id, 'Main', 64349, 'monthly', '2026-03-01', true);

    -- 9. GNS SURGERY CENTER (1 schedule: $1,786.90)
    INSERT INTO customers (company_name, user_id) VALUES ('GNS Surgery Center', v_user_id) RETURNING id INTO v_c;
    INSERT INTO recurring_invoices (customer_id, user_id, location_label, amount_cents, frequency, next_invoice_date, is_active) VALUES 
    (v_c, v_user_id, 'Main', 178690, 'monthly', '2026-03-01', true);

    -- 10. MICHELLE NGUYEN (1 schedule: $81.90)
    INSERT INTO customers (company_name, user_id) VALUES ('Michelle Nguyen', v_user_id) RETURNING id INTO v_c;
    INSERT INTO recurring_invoices (customer_id, user_id, location_label, amount_cents, frequency, next_invoice_date, is_active) VALUES 
    (v_c, v_user_id, 'Main', 8190, 'monthly', '2026-03-01', true);

    -- 11. ROBERT ANDREWS (1 schedule: $976.50)
    INSERT INTO customers (company_name, user_id) VALUES ('Robert Andrews', v_user_id) RETURNING id INTO v_c;
    INSERT INTO recurring_invoices (customer_id, user_id, location_label, amount_cents, frequency, next_invoice_date, is_active) VALUES 
    (v_c, v_user_id, 'Main', 97650, 'monthly', '2026-03-01', true);

    -- 12. SHERI TIFOSI (1 schedule: $1,063.10)
    INSERT INTO customers (company_name, user_id) VALUES ('Sheri Tifosi', v_user_id) RETURNING id INTO v_c;
    INSERT INTO recurring_invoices (customer_id, user_id, location_label, amount_cents, frequency, next_invoice_date, is_active) VALUES 
    (v_c, v_user_id, 'Main', 106310, 'monthly', '2026-03-01', true);

    -- 13. TODD KNIGHT (1 schedule: $976.50)
    INSERT INTO customers (company_name, user_id) VALUES ('Todd Knight', v_user_id) RETURNING id INTO v_c;
    INSERT INTO recurring_invoices (customer_id, user_id, location_label, amount_cents, frequency, next_invoice_date, is_active) VALUES 
    (v_c, v_user_id, 'Main', 97650, 'monthly', '2026-03-01', true);

    -- 14. BETH SMITH / ATHENS CLARKE COUNTY (2 annual schedules: $61,030.00/year)
    INSERT INTO customers (company_name, user_id, email) VALUES ('Beth Smith', v_user_id, 'beth.smith@accgov.com') RETURNING id INTO v_c;
    INSERT INTO recurring_invoices (customer_id, user_id, location_label, amount_cents, frequency, next_invoice_date, is_active) VALUES 
    (v_c, v_user_id, 'Satula Avenue Government Building', 2978000, 'annual', '2026-07-01', true),
    (v_c, v_user_id, 'Dougherty Street Government Building', 3125000, 'annual', '2026-07-01', true);

    RAISE NOTICE '✅ COMPLETE: 14 customers, 21 schedules loaded (19 monthly + 2 annual)';
END $$;

-- ==================== VERIFICATION ====================
SELECT 
  COUNT(*) as total_schedules,
  COUNT(*) FILTER (WHERE frequency = 'monthly') as monthly_schedules,
  COUNT(*) FILTER (WHERE frequency = 'annual') as annual_schedules,
  '$' || (SUM(amount_cents) FILTER (WHERE frequency = 'monthly') / 100.0)::numeric(10,2) as monthly_recurring,
  '$' || (SUM(amount_cents) FILTER (WHERE frequency = 'annual') / 100.0)::numeric(10,2) as annual_contracts
FROM recurring_invoices
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'generalmanager81@gmail.com');

-- Show all schedules
SELECT 
  c.company_name,
  r.location_label,
  '$' || (r.amount_cents / 100.0)::numeric(10,2) as amount,
  r.next_invoice_date
FROM recurring_invoices r
JOIN customers c ON r.customer_id = c.id
WHERE r.user_id = (SELECT id FROM auth.users WHERE email = 'generalmanager81@gmail.com')
ORDER BY c.company_name, r.location_label;
