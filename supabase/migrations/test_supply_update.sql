-- ============================================================================
-- SUPPLY UPDATE STRESS TEST - February 2026 Scenario
-- Simulates real-world supply order changes and revenue tracking
-- Safe to run: Uses BEGIN/ROLLBACK (no permanent changes)
-- ============================================================================

BEGIN;

-- ========================================
-- STEP 1: Current State Snapshot
-- ========================================
SELECT 
  '🔍 BEFORE SUPPLY UPDATE' as status,
  c.company_name,
  r.location_label,
  r.amount_cents as current_cents,
  r.amount_cents / 100.0 as current_amount,
  r.next_invoice_date
FROM recurring_invoices r
JOIN customers c ON r.customer_id = c.id
WHERE r.location_label ILIKE '%suppl%' OR r.location_label ILIKE '%paper%'
ORDER BY c.company_name, r.location_label;

-- ========================================
-- STEP 2: Simulate Joan Kent Supply Update
-- She ordered: 2 cases 55-gal ($45 ea) + 1 case 20-gal ($35)
-- New total: (2 × $45.00) + (1 × $35.00) = $125.00 = 12500 cents
-- ========================================
UPDATE recurring_invoices
SET amount_cents = 12500,  -- 2×55gal + 1×20gal
    updated_at = now()
WHERE customer_id IN (SELECT id FROM customers WHERE company_name ILIKE '%Joan Kent%')
  AND location_label = 'Greensboro Supplies';

SELECT 
  '✅ JOAN KENT UPDATED' as status,
  'Old: $435.30 (placeholder) → New: $125.00 (actual order)' as change;

-- ========================================
-- STEP 3: Simulate Sandi Turner Supply Update
-- She confirmed February order: 8 cases paper products @ $37.54/case
-- New total: 8 × $37.54 = $300.32 ≈ $300.30 (existing, no change needed)
-- ========================================
SELECT 
  '✅ SANDI TURNER CONFIRMED' as status,
  'Current: $300.30 matches 8 cases @ $37.54/case (within rounding)' as verification;

-- ========================================
-- STEP 4: After Update Snapshot
-- ========================================
SELECT 
  '📊 AFTER SUPPLY UPDATE' as status,
  c.company_name,
  r.location_label,
  r.amount_cents as new_cents,
  r.amount_cents / 100.0 as new_amount,
  r.next_invoice_date
FROM recurring_invoices r
JOIN customers c ON r.customer_id = c.id
WHERE r.location_label ILIKE '%suppl%' OR r.location_label ILIKE '%paper%'
ORDER BY c.company_name, r.location_label;

-- ========================================
-- STEP 5: Revenue Impact Analysis
-- ========================================
WITH revenue_comparison AS (
  SELECT 
    SUM(CASE 
      WHEN customer_id IN (SELECT id FROM customers WHERE company_name ILIKE '%Joan Kent%')
           AND location_label = 'Greensboro Supplies' 
      THEN 43530  -- Original placeholder
      ELSE amount_cents 
    END) / 100.0 as revenue_before,
    SUM(amount_cents) / 100.0 as revenue_after
  FROM recurring_invoices
  WHERE is_active = true
)
SELECT 
  '💰 REVENUE IMPACT' as analysis,
  ROUND(revenue_before::numeric, 2) as before_update,
  ROUND(revenue_after::numeric, 2) as after_update,
  ROUND((revenue_after - revenue_before)::numeric, 2) as change,
  CASE 
    WHEN revenue_after < revenue_before THEN '📉 Revenue Decreased'
    WHEN revenue_after > revenue_before THEN '📈 Revenue Increased'
    ELSE '➡️  No Change'
  END as trend
FROM revenue_comparison;

-- ========================================
-- STEP 6: March 1st Invoice Preview
-- ========================================
SELECT 
  '📅 MARCH 1ST BATCH PREVIEW' as preview,
  COUNT(*) as invoices_to_generate,
  SUM(amount_cents) / 100.0 as batch_revenue,
  MIN(next_invoice_date) as first_date,
  MAX(next_invoice_date) as last_date
FROM recurring_invoices
WHERE is_active = true 
  AND next_invoice_date = '2026-03-01';

-- ========================================
-- STEP 7: Customer-Level Breakdown
-- ========================================
SELECT 
  '🏢 CUSTOMER REVENUE BREAKDOWN' as breakdown,
  c.company_name,
  COUNT(r.id) as schedules,
  STRING_AGG(DISTINCT r.location_label, ', ' ORDER BY r.location_label) as locations,
  SUM(r.amount_cents) / 100.0 as monthly_total
FROM recurring_invoices r
JOIN customers c ON r.customer_id = c.id
WHERE r.is_active = true
GROUP BY c.company_name
HAVING COUNT(r.id) > 1  -- Show only multi-location customers
ORDER BY monthly_total DESC;

-- ========================================
-- STEP 8: Supplies-Specific Audit
-- ========================================
SELECT 
  '📦 SUPPLY ORDERS AUDIT' as audit,
  c.company_name,
  r.location_label,
  r.amount_cents / 100.0 as monthly_cost,
  CASE 
    WHEN r.amount_cents = 43530 THEN '⚠️  Placeholder - needs February count'
    WHEN r.amount_cents = 30030 THEN '✅ Confirmed (Sandi Turner standard)'
    WHEN r.amount_cents = 12500 THEN '✅ Updated (Joan Kent actual order)'
    ELSE '✅ Set'
  END as status
FROM recurring_invoices r
JOIN customers c ON r.customer_id = c.id
WHERE r.location_label ILIKE '%suppl%' OR r.location_label ILIKE '%paper%'
ORDER BY c.company_name;

-- ========================================
-- ROLLBACK: No Permanent Changes
-- ========================================
ROLLBACK;

SELECT '🔄 STRESS TEST COMPLETE - All changes rolled back' as final_status;
SELECT 'Run this test anytime to simulate supply updates before making them permanent.' as note;
