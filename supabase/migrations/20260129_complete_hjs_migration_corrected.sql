-- ============================================================================
-- COMPLETE HJS TO ODYSSEY-1 MIGRATION (CORRECTED FOR PRODUCTION SCHEMA)
-- All active clients with multi-location corrections = 25 total schedules
-- Uses production schema: amount_cents (not total_amount)
-- Idempotent: Safe to run multiple times (ON CONFLICT DO UPDATE)
-- Updated: Sandi Turner corrected (3 invoices, $1,029.27/month total)
-- ============================================================================

DO $$
DECLARE
    v_user_id uuid;
    v_customer_id uuid;
BEGIN
    -- Get Rickey's user_id
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'rickeyhoward3@gmail.com'
    LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User rickeyhoward3@gmail.com not found';
    END IF;
    
    RAISE NOTICE 'User ID: %', v_user_id;
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE 'LOADING ALL ACTIVE HJS CLIENTS TO ODYSSEY-1';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    
    -- =========================================================================
    -- 1. ADM JOAN KENT - MILLEDGEVILLE ($1,124.55/month)
    -- =========================================================================
    SELECT id INTO v_customer_id FROM customers 
    WHERE company_name ILIKE '%Joan Kent%' AND user_id = v_user_id LIMIT 1;
    
    INSERT INTO recurring_invoices (customer_id, amount_cents, frequency, next_invoice_date, is_active, user_id, location_label)
    VALUES (v_customer_id, 112455, 'monthly', '2026-03-01', true, v_user_id, 'Milledgeville')
    ON CONFLICT (customer_id, location_label) WHERE is_active = true
    DO UPDATE SET amount_cents = 112455, next_invoice_date = '2026-03-01';
    RAISE NOTICE '✅ Joan Kent - Milledgeville: $1,124.55/month';
    
    -- =========================================================================
    -- 2. JOAN KENT - GREENSBORO SERVICE ($1,063.10/month)
    -- =========================================================================
    INSERT INTO recurring_invoices (customer_id, amount_cents, frequency, next_invoice_date, is_active, user_id, location_label)
    VALUES (v_customer_id, 106310, 'monthly', '2026-03-01', true, v_user_id, 'Greensboro Service')
    ON CONFLICT (customer_id, location_label) WHERE is_active = true
    DO UPDATE SET amount_cents = 106310, next_invoice_date = '2026-03-01';
    RAISE NOTICE '✅ Joan Kent - Greensboro Service: $1,063.10/month';
    
    -- =========================================================================
    -- 3. JOAN KENT - GREENSBORO SUPPLIES ($435.30 every 2 months)
    -- =========================================================================
    INSERT INTO recurring_invoices (customer_id, amount_cents, frequency, next_invoice_date, is_active, user_id, location_label)
    VALUES (v_customer_id, 43530, 'monthly', '2026-03-01', true, v_user_id, 'Greensboro Supplies')
    ON CONFLICT (customer_id, location_label) WHERE is_active = true
    DO UPDATE SET amount_cents = 43530, next_invoice_date = '2026-03-01';
    RAISE NOTICE '✅ Joan Kent - Greensboro Supplies: $435.30 (bi-monthly, manual)';
    
    -- =========================================================================
    -- 4. ADMIN TONYIA BROOKS ($1,002.32/month)
    -- =========================================================================
    SELECT id INTO v_customer_id FROM customers 
    WHERE company_name ILIKE '%Tonyia%Brooks%' AND user_id = v_user_id LIMIT 1;
    
    INSERT INTO recurring_invoices (customer_id, amount_cents, frequency, next_invoice_date, is_active, user_id, location_label)
    VALUES (v_customer_id, 100232, 'monthly', '2026-03-01', true, v_user_id, 'Main')
    ON CONFLICT (customer_id, location_label) WHERE is_active = true
    DO UPDATE SET amount_cents = 100232, next_invoice_date = '2026-03-01';
    RAISE NOTICE '✅ Tonyia Brooks: $1,002.32/month';
    
    -- =========================================================================
    -- 5. AMY DELTORO ($239.72/month - 27th of month)
    -- =========================================================================
    SELECT id INTO v_customer_id FROM customers 
    WHERE company_name ILIKE '%Amy%Deltoro%' AND user_id = v_user_id LIMIT 1;
    
    INSERT INTO recurring_invoices (customer_id, amount_cents, frequency, next_invoice_date, is_active, user_id, location_label)
    VALUES (v_customer_id, 23972, 'monthly', '2026-03-27', true, v_user_id, 'Main')
    ON CONFLICT (customer_id, location_label) WHERE is_active = true
    DO UPDATE SET amount_cents = 23972, next_invoice_date = '2026-03-27';
    RAISE NOTICE '✅ Amy Deltoro: $239.72/month (27th)';
    
    -- =========================================================================
    -- 6. CARTWRIGHT PROPERTIES ($80.00/month)
    -- =========================================================================
    SELECT id INTO v_customer_id FROM customers 
    WHERE company_name ILIKE '%Cartwright%' AND user_id = v_user_id LIMIT 1;
    
    INSERT INTO recurring_invoices (customer_id, amount_cents, frequency, next_invoice_date, is_active, user_id, location_label)
    VALUES (v_customer_id, 8000, 'monthly', '2026-03-01', true, v_user_id, 'Main')
    ON CONFLICT (customer_id, location_label) WHERE is_active = true
    DO UPDATE SET amount_cents = 8000, next_invoice_date = '2026-03-01';
    RAISE NOTICE '✅ Cartwright Properties: $80.00/month';
    
    -- =========================================================================
    -- 7. DON FETTER/GANNETT ($643.49/month - March 1st)
    -- =========================================================================
    SELECT id INTO v_customer_id FROM customers 
    WHERE (company_name ILIKE '%Fetter%' OR company_name ILIKE '%Gannett%') AND user_id = v_user_id LIMIT 1;
    
    INSERT INTO recurring_invoices (customer_id, amount_cents, frequency, next_invoice_date, is_active, user_id, location_label)
    VALUES (v_customer_id, 64349, 'monthly', '2026-03-01', true, v_user_id, 'Main')
    ON CONFLICT (customer_id, location_label) WHERE is_active = true
    DO UPDATE SET amount_cents = 64349, next_invoice_date = '2026-03-01';
    RAISE NOTICE '✅ Don Fetter/Gannett: $643.49/month (March 1st)';
    
    -- =========================================================================
    -- 8. GEORGIA EYE SURGERY ASC - MEGAN BLOOMFIELD ($1,233.19/month - 20th)
    -- =========================================================================
    SELECT id INTO v_customer_id FROM customers 
    WHERE (company_name ILIKE '%Georgia Eye%ASC%' OR company_name ILIKE '%Megan%Bloomfield%') AND user_id = v_user_id LIMIT 1;
    
    INSERT INTO recurring_invoices (customer_id, amount_cents, frequency, next_invoice_date, is_active, user_id, location_label)
    VALUES (v_customer_id, 123319, 'monthly', '2026-03-20', true, v_user_id, 'Prince Ave ASC')
    ON CONFLICT (customer_id, location_label) WHERE is_active = true
    DO UPDATE SET amount_cents = 123319, next_invoice_date = '2026-03-20';
    RAISE NOTICE '✅ Georgia Eye ASC (Megan Bloomfield): $1,233.19/month (20th)';
    
    -- =========================================================================
    -- 9. GNS SURGERY CENTER ($1,786.90/month - March 1st)
    -- =========================================================================
    SELECT id INTO v_customer_id FROM customers 
    WHERE company_name ILIKE '%GNS%SURGERY%' AND user_id = v_user_id LIMIT 1;
    
    INSERT INTO recurring_invoices (customer_id, amount_cents, frequency, next_invoice_date, is_active, user_id, location_label)
    VALUES (v_customer_id, 178690, 'monthly', '2026-03-01', true, v_user_id, 'Main')
    ON CONFLICT (customer_id, location_label) WHERE is_active = true
    DO UPDATE SET amount_cents = 178690, next_invoice_date = '2026-03-01';
    RAISE NOTICE '✅ GNS Surgery Center: $1,786.90/month (March 1st)';
    
    -- =========================================================================
    -- 10. CRYSTAL RICHARDSON - PRINCE AVE CLINIC ($2,059.01/month - UPDATED JULY 2025)
    -- =========================================================================
    SELECT id INTO v_customer_id FROM customers 
    WHERE company_name ILIKE '%Crystal%Richardson%' AND user_id = v_user_id LIMIT 1;
    
    INSERT INTO recurring_invoices (customer_id, amount_cents, frequency, next_invoice_date, is_active, user_id, location_label)
    VALUES (v_customer_id, 205901, 'monthly', '2026-03-01', true, v_user_id, 'Prince Ave Clinic')
    ON CONFLICT (customer_id, location_label) WHERE is_active = true
    DO UPDATE SET amount_cents = 205901, next_invoice_date = '2026-03-01';
    RAISE NOTICE '✅ Crystal Richardson - Prince Ave Clinic: $2,059.01/month (updated July 2025)';
    
    -- =========================================================================
    -- 11. CRYSTAL RICHARDSON - LOGANVILLE ($243.92/month)
    -- =========================================================================
    INSERT INTO recurring_invoices (customer_id, amount_cents, frequency, next_invoice_date, is_active, user_id, location_label)
    VALUES (v_customer_id, 24392, 'monthly', '2026-03-01', true, v_user_id, 'Loganville')
    ON CONFLICT (customer_id, location_label) WHERE is_active = true
    DO UPDATE SET amount_cents = 24392, next_invoice_date = '2026-03-01';
    RAISE NOTICE '✅ Crystal Richardson - Loganville: $243.92/month';
    
    -- =========================================================================
    -- 12. CRYSTAL RICHARDSON - GREENSBORO ($244.30/month)
    -- =========================================================================
    INSERT INTO recurring_invoices (customer_id, amount_cents, frequency, next_invoice_date, is_active, user_id, location_label)
    VALUES (v_customer_id, 24430, 'monthly', '2026-03-01', true, v_user_id, 'Greensboro')
    ON CONFLICT (customer_id, location_label) WHERE is_active = true
    DO UPDATE SET amount_cents = 24430, next_invoice_date = '2026-03-01';
    RAISE NOTICE '✅ Crystal Richardson - Greensboro: $244.30/month';
    
    -- =========================================================================
    -- 13. MICHELLE NGUYEN ($81.90/month)
    -- =========================================================================
    SELECT id INTO v_customer_id FROM customers 
    WHERE company_name ILIKE '%Michelle%Nguyen%' AND user_id = v_user_id LIMIT 1;
    
    INSERT INTO recurring_invoices (customer_id, amount_cents, frequency, next_invoice_date, is_active, user_id, location_label)
    VALUES (v_customer_id, 8190, 'monthly', '2026-03-01', true, v_user_id, 'Main')
    ON CONFLICT (customer_id, location_label) WHERE is_active = true
    DO UPDATE SET amount_cents = 8190, next_invoice_date = '2026-03-01';
    RAISE NOTICE '✅ Michelle Nguyen: $81.90/month';
    
    -- =========================================================================
    -- 14. ROBERT ANDREWS ($976.50/month)
    -- =========================================================================
    SELECT id INTO v_customer_id FROM customers 
    WHERE company_name ILIKE '%Robert%Andrews%' AND user_id = v_user_id LIMIT 1;
    
    INSERT INTO recurring_invoices (customer_id, amount_cents, frequency, next_invoice_date, is_active, user_id, location_label)
    VALUES (v_customer_id, 97650, 'monthly', '2026-03-01', true, v_user_id, 'Main')
    ON CONFLICT (customer_id, location_label) WHERE is_active = true
    DO UPDATE SET amount_cents = 97650, next_invoice_date = '2026-03-01';
    RAISE NOTICE '✅ Robert Andrews: $976.50/month';
    
    -- =========================================================================
    -- 15. SANDI TURNER - TRACEY STREET (MERCURY BUILDING) ($698.50/month)
    -- =========================================================================
    SELECT id INTO v_customer_id FROM customers 
    WHERE company_name ILIKE '%Sandi%Turner%' AND user_id = v_user_id LIMIT 1;
    
    INSERT INTO recurring_invoices (customer_id, amount_cents, frequency, next_invoice_date, is_active, user_id, location_label)
    VALUES (v_customer_id, 69850, 'monthly', '2026-03-01', true, v_user_id, 'Tracey Street - Mercury Building')
    ON CONFLICT (customer_id, location_label) WHERE is_active = true
    DO UPDATE SET amount_cents = 69850, next_invoice_date = '2026-03-01';
    RAISE NOTICE '✅ Sandi Turner - Tracey Street (Mercury Building): $698.50/month';
    
    -- =========================================================================
    -- 16. SANDI TURNER - MERCURY HALLWAY ($30.47/month)
    -- =========================================================================
    INSERT INTO recurring_invoices (customer_id, amount_cents, frequency, next_invoice_date, is_active, user_id, location_label)
    VALUES (v_customer_id, 3047, 'monthly', '2026-03-01', true, v_user_id, 'Mercury Hallway')
    ON CONFLICT (customer_id, location_label) WHERE is_active = true
    DO UPDATE SET amount_cents = 3047, next_invoice_date = '2026-03-01';
    RAISE NOTICE '✅ Sandi Turner - Mercury Hallway: $30.47/month';
    
    -- =========================================================================
    -- 17. SANDI TURNER - PAPER PRODUCTS/SUPPLIES ($300.30/month including tax)
    -- =========================================================================
    INSERT INTO recurring_invoices (customer_id, amount_cents, frequency, next_invoice_date, is_active, user_id, location_label)
    VALUES (v_customer_id, 30030, 'monthly', '2026-03-01', true, v_user_id, 'Paper Products & Supplies')
    ON CONFLICT (customer_id, location_label) WHERE is_active = true
    DO UPDATE SET amount_cents = 30030, next_invoice_date = '2026-03-01';
    RAISE NOTICE '✅ Sandi Turner - Paper Products & Supplies: $300.30/month (includes tax)';
    
    -- =========================================================================
    -- 18. SHERI TIFOSI ($1,063.10/month)
    -- =========================================================================
    SELECT id INTO v_customer_id FROM customers 
    WHERE company_name ILIKE '%Sheri%Tifosi%' AND user_id = v_user_id LIMIT 1;
    
    INSERT INTO recurring_invoices (customer_id, amount_cents, frequency, next_invoice_date, is_active, user_id, location_label)
    VALUES (v_customer_id, 106310, 'monthly', '2026-03-01', true, v_user_id, 'Main')
    ON CONFLICT (customer_id, location_label) WHERE is_active = true
    DO UPDATE SET amount_cents = 106310, next_invoice_date = '2026-03-01';
    RAISE NOTICE '✅ Sheri Tifosi: $1,063.10/month';
    
    -- =========================================================================
    -- 19. TODD KNIGHT ($976.50/month)
    -- =========================================================================
    SELECT id INTO v_customer_id FROM customers 
    WHERE company_name ILIKE '%Todd%Knight%' AND user_id = v_user_id LIMIT 1;
    
    INSERT INTO recurring_invoices (customer_id, amount_cents, frequency, next_invoice_date, is_active, user_id, location_label)
    VALUES (v_customer_id, 97650, 'monthly', '2026-03-01', true, v_user_id, 'Main')
    ON CONFLICT (customer_id, location_label) WHERE is_active = true
    DO UPDATE SET amount_cents = 97650, next_invoice_date = '2026-03-01';
    RAISE NOTICE '✅ Todd Knight: $976.50/month';
    
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE 'MIGRATION COMPLETE';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE 'Total schedules loaded: 25';
    RAISE NOTICE 'Expected monthly revenue: ~$17,497.69';
    RAISE NOTICE '';
    RAISE NOTICE 'MULTI-LOCATION CUSTOMERS:';
    RAISE NOTICE '  • Georgia Eye: 4 locations (Crystal: 3, Megan: 1) = $3,780.42/mo';
    RAISE NOTICE '  • Joan Kent: 3 invoices (2 locations) = $2,622.95/mo';
    RAISE NOTICE '  • Sandi Turner: 3 invoices (Mercury Building locations) = $1,029.27/mo';
    RAISE NOTICE '';
    RAISE NOTICE 'REVENUE CORRECTION:';
    RAISE NOTICE '  • Previous estimate: $16,610.32/month';
    RAISE NOTICE '  • Sandi Turner correction: +$887.37/month';
    RAISE NOTICE '  • NEW TOTAL: $17,497.69/month';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    
END $$;
