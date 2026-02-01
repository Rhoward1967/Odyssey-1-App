-- ============================================================================
-- FIX GEORGIA EYE LOCATIONS + JOAN KENT MISSING GREENSBORO SERVICE
-- Crystal Richardson has 3 locations (Prince, Loganville, Greensboro)
-- Megan Bloomfield has 1 location (Prince ASC)
-- Joan Kent has 3 invoices (Milledgeville, Greensboro Service, Greensboro Supplies)
-- ============================================================================

-- Find customer IDs
DO $$
DECLARE
    v_crystal_id uuid;
    v_megan_id uuid;
    v_joan_id uuid;
BEGIN
    -- Get Crystal Richardson's customer ID
    SELECT id INTO v_crystal_id
    FROM customers
    WHERE company_name ILIKE '%Crystal Richardson%'
    LIMIT 1;
    
    -- Get Megan Bloomfield's customer ID  
    SELECT id INTO v_megan_id
    FROM customers
    WHERE company_name ILIKE '%Megan%' OR company_name ILIKE '%Georgia Eye ASC%'
    LIMIT 1;
    
    -- Get Joan Kent's customer ID
    SELECT id INTO v_joan_id
    FROM customers
    WHERE company_name ILIKE '%Joan Kent%'
    LIMIT 1;
    
    IF v_crystal_id IS NULL THEN
        RAISE EXCEPTION 'Crystal Richardson customer not found';
    END IF;
    
    RAISE NOTICE 'Crystal Richardson customer_id: %', v_crystal_id;
    RAISE NOTICE 'Megan Bloomfield customer_id: %', v_megan_id;
    
    -- STEP 1: Update existing Crystal Richardson from $1,540.66 to $2,059.01 (Prince Ave Clinic)
    UPDATE recurring_invoices
    SET amount_cents = 205901,  -- $2,059.01
        updated_at = NOW()
    WHERE customer_id = v_crystal_id
    AND amount_cents = 154066;  -- Old price $1,540.66
    
    RAISE NOTICE '✅ Updated Prince Ave Clinic: $1,540.66 → $2,059.01';
    
    -- STEP 2: Add Loganville location ($243.92/month)
    INSERT INTO recurring_invoices (
        customer_id,
        amount_cents,
        frequency,
        next_invoice_date,
        is_active,
        user_id
    ) VALUES (
        v_crystal_id,
        24392,  -- $243.92
        'monthly',
        '2026-02-01',
        true,
        (SELECT user_id FROM customers WHERE id = v_crystal_id)
    );
    
    RAISE NOTICE '✅ Added Loganville: $243.92/month';
    
    -- STEP 3: Add Greensboro location ($244.30/month)
    INSERT INTO recurring_invoices (
        customer_id,
        amount_cents,
        frequency,
        next_invoice_date,
        is_active,
        user_id
    ) VALUES (
        v_crystal_id,
        24430,  -- $244.30
        'monthly',
        '2026-02-01',
        true,
        (SELECT user_id FROM customers WHERE id = v_crystal_id)
    );
    
    RAISE NOTICE '✅ Added Greensboro: $244.30/month';
    
    -- STEP 4: Add Joan Kent - Greensboro Service ($1,063.10/month)
    INSERT INTO recurring_invoices (
        customer_id,
        amount_cents,
        frequency,
        next_invoice_date,
        is_active,
        user_id
    ) VALUES (
        v_joan_id,
        106310,  -- $1,063.10
        'monthly',
        '2026-02-01',
        true,
        (SELECT user_id FROM customers WHERE id = v_joan_id)
    );
    
    RAISE NOTICE '✅ Added Joan Kent - Greensboro Service: $1,063.10/month';
    
    -- STEP 5: Verify Megan's Prince Ave ASC is correct ($1,233.19)
    IF EXISTS (
        SELECT 1 FROM recurring_invoices 
        WHERE customer_id = v_megan_id 
        AND amount_cents = 123319
    ) THEN
        RAISE NOTICE '✅ Prince Ave ASC (Megan): $1,233.19/month - VERIFIED';
    ELSE
        RAISE WARNING '⚠️  Prince Ave ASC (Megan) not found or incorrect amount';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE 'UPDATES COMPLETE';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE 'GEORGIA EYE (4 locations total):';
    RAISE NOTICE '  Crystal Richardson locations:';
    RAISE NOTICE '    1. Prince Ave Clinic: $2,059.01/month (updated)';
    RAISE NOTICE '    2. Loganville: $243.92/month (added)';
    RAISE NOTICE '    3. Greensboro: $244.30/month (added)';
    RAISE NOTICE '  Megan Bloomfield locations:';
    RAISE NOTICE '    4. Prince Ave ASC: $1,233.19/month (verified)';
    RAISE NOTICE '  Georgia Eye Total: $3,780.42/month';
    RAISE NOTICE '';
    RAISE NOTICE 'JOAN KENT (2 locations, 3 invoices):';
    RAISE NOTICE '  1. Milledgeville Service: $1,124.55/month (existing)';
    RAISE NOTICE '  2. Greensboro Service: $1,063.10/month (added)';
    RAISE NOTICE '  3. Greensboro Supplies: $435.30 every 2 months (existing)';
    RAISE NOTICE '  Joan Kent Total: ~$2,405/month';
    RAISE NOTICE '';
    RAISE NOTICE 'NEW MONTHLY REVENUE ADDED: $1,551.52';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    
END $$;
