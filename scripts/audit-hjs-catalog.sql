-- ================================================================================
-- HJS CATALOG AUDIT SCRIPT
-- Resolution 2026-06: Commercial Compliance Verification
-- ================================================================================
-- 
-- PURPOSE:
--   Verify that all 45 catalog items (21 products + 24 services) have correct
--   pricing, tax rates, and schema compliance for HJS Services LLC commercial
--   operations.
-- 
-- AUDIT REQUIREMENTS:
--   1. All products have tax_rate = 0.0875 (8.75% Georgia sales tax)
--   2. price_per_case_cents and unit_price_cents correctly mapped
--   3. All SKUs are unique and properly formatted
--   4. No NULL values in critical pricing fields
--   5. Tax calculation matches expected values
-- 
-- EXPECTED RESULT EXAMPLE:
--   TP-2PLY-96J | 96-roll Jumbo Toilet Paper | $45.00/case | 8.75% tax = $3.94
-- 
-- ================================================================================

-- PART 1: PRODUCTS AUDIT (21 Items Expected)
-- ================================================================================

SELECT 
    '📦 PRODUCTS CATALOG AUDIT' as audit_section,
    COUNT(*) as total_products,
    COUNT(DISTINCT sku) as unique_skus,
    COUNT(*) FILTER (WHERE tax_rate = 0.0875) as correct_tax_rate_count,
    COUNT(*) FILTER (WHERE tax_rate != 0.0875 OR tax_rate IS NULL) as incorrect_tax_rate_count,
    COUNT(*) FILTER (WHERE price_per_case_cents IS NULL) as missing_case_price,
    COUNT(*) FILTER (WHERE is_active = true) as active_products
FROM products;

-- PART 2: DETAILED PRODUCTS WITH TAX CALCULATIONS
-- ================================================================================

SELECT 
    sku as "SKU",
    name as "Product Name",
    category as "Category",
    
    -- Pricing (Convert cents to dollars)
    CONCAT('$', ROUND(price_per_case_cents / 100.0, 2)) as "Price/Case",
    CONCAT('$', ROUND(unit_price_cents / 100.0, 2)) as "Price/Unit",
    
    -- Tax Information
    CONCAT(ROUND(tax_rate * 100, 2), '%') as "Tax Rate",
    tax_category as "Tax Category",
    
    -- Tax Calculation (Example: $45.00 * 0.0875 = $3.94)
    CONCAT('$', ROUND((price_per_case_cents / 100.0) * tax_rate, 2)) as "Tax Amount",
    CONCAT('$', ROUND((price_per_case_cents / 100.0) * (1 + tax_rate), 2)) as "Total w/ Tax",
    
    -- Case Information
    units_per_case as "Units/Case",
    unit_type as "Unit Type",
    case_size as "Case Size",
    
    -- Status
    CASE WHEN is_active THEN '✅' ELSE '❌' END as "Active"
    
FROM products
WHERE is_active = true
ORDER BY category, sku;

-- PART 3: TAX RATE COMPLIANCE CHECK
-- ================================================================================

SELECT 
    '🔍 TAX COMPLIANCE CHECK' as audit_section,
    
    -- Count by tax rate
    tax_rate as "Tax Rate",
    COUNT(*) as "Product Count",
    ROUND(tax_rate * 100, 2) || '%' as "Percentage Display",
    
    -- Verify Georgia standard rate
    CASE 
        WHEN tax_rate = 0.0875 THEN '✅ CORRECT (Georgia 8.75%)'
        WHEN tax_rate IS NULL THEN '❌ NULL - CRITICAL'
        ELSE '⚠️ NON-STANDARD RATE'
    END as "Compliance Status"
    
FROM products
WHERE is_active = true
GROUP BY tax_rate
ORDER BY tax_rate;

-- PART 4: CRITICAL VALIDATION - TOILET PAPER TEST CASE
-- ================================================================================
-- Resolution 2026-06 Requirement: 96-roll case at $45.00 = $3.94 tax

SELECT 
    '🧻 TOILET PAPER TAX VERIFICATION' as test_case,
    sku,
    name,
    price_per_case_cents / 100.0 as base_price,
    tax_rate,
    ROUND((price_per_case_cents / 100.0) * tax_rate, 2) as calculated_tax,
    
    -- Expected: $3.94 for $45.00 base
    CASE 
        WHEN ROUND((price_per_case_cents / 100.0) * tax_rate, 2) = 3.94 AND price_per_case_cents = 4500
        THEN '✅ PASS: Tax calculation correct ($45.00 → $3.94)'
        ELSE '❌ FAIL: Tax calculation incorrect'
    END as validation_result
    
FROM products
WHERE sku LIKE 'TP-%' AND price_per_case_cents = 4500
ORDER BY sku;

-- PART 5: SERVICES AUDIT (24 Items Expected)
-- ================================================================================

SELECT 
    '🧹 SERVICES CATALOG AUDIT' as audit_section,
    COUNT(*) as total_services,
    COUNT(DISTINCT name) as unique_services,
    COUNT(*) FILTER (WHERE rate_type = 'flat_rate') as flat_rate_services,
    COUNT(*) FILTER (WHERE rate_type = 'hourly') as hourly_services,
    COUNT(*) FILTER (WHERE rate_cents IS NULL) as missing_rate,
    COUNT(*) FILTER (WHERE category IS NOT NULL) as categorized_services,
    ROUND(AVG(rate_cents / 100.0), 2) as avg_rate_dollars
FROM services;

-- PART 6: DETAILED SERVICES LISTING
-- ================================================================================

SELECT 
    id as "ID",
    name as "Service Name",
    category as "Category",
    
    -- Pricing
    CONCAT('$', ROUND(rate_cents / 100.0, 2)) as "Rate",
    rate_type as "Rate Type",
    
    -- Time Estimate
    CONCAT(time_estimate_minutes, ' min') as "Est. Time",
    
    -- Created
    created_at::DATE as "Created Date"
    
FROM services
ORDER BY category, name;

-- PART 7: PRICING SCHEMA VALIDATION
-- ================================================================================

SELECT 
    '📊 SCHEMA VALIDATION SUMMARY' as audit_section,
    
    -- Products Schema Check
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name = 'products' AND column_name = 'tax_rate') as has_tax_rate_column,
    
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name = 'products' AND column_name = 'price_per_case_cents') as has_case_price_column,
    
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name = 'products' AND column_name = 'tax_category') as has_tax_category_column,
    
    -- Services Schema Check
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name = 'services' AND column_name = 'rate_cents') as has_rate_cents_column,
    
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name = 'services' AND column_name = 'rate_type') as has_rate_type_column;

-- ================================================================================
-- EXPECTED OUTPUT SUMMARY
-- ================================================================================
-- 
-- ✅ PASS CRITERIA:
--   - 21 products with tax_rate = 0.0875
--   - 24 services with valid rate_cents
--   - Toilet paper test case: $45.00 → $3.94 tax
--   - All SKUs unique
--   - No NULL in critical fields
-- 
-- ❌ FAIL CRITERIA:
--   - Any product with tax_rate != 0.0875 or NULL
--   - Missing price_per_case_cents
--   - Toilet paper tax != $3.94
--   - Schema columns missing
-- 
-- ARCHITECT DIRECTIVE:
--   If ANY failure detected, R.O.M.A.N. must trigger "Schema Drift" alert
--   and log incident to roman_audit_log with event_type = 'COMPLIANCE_FAILURE'
-- 
-- ================================================================================
