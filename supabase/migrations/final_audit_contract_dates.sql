-- ============================================================================
-- FINAL AUDIT TABLE: Contract Anniversary Verification
-- Run this AFTER executing the contract autopilot migration
-- Compares system dates against your Drive contracts
-- ============================================================================

SELECT 
  ROW_NUMBER() OVER (ORDER BY c.company_name, r.location_label) AS "#",
  c.company_name AS "Client Name",
  r.location_label AS "Location/Service",
  TO_CHAR(r.contract_start_date, 'Mon DD, YYYY') AS "Contract Start",
  TO_CHAR(r.contract_start_date + INTERVAL '1 year', 'Mon DD, YYYY') AS "Next Increase Date",
  r.annual_increase_pct || '%' AS "Annual Increase",
  '$' || (r.amount_cents / 100.0)::NUMERIC(10,2) AS "Current Amount",
  '$' || ROUND((r.amount_cents * (1 + r.annual_increase_pct / 100.0)) / 100.0, 2) AS "After Increase",
  '$' || ROUND((r.amount_cents * r.annual_increase_pct / 10000.0), 2) AS "Increase $",
  r.frequency AS "Billing Freq",
  CASE 
    WHEN r.service_days_per_week >= 5 THEN 'Weekly Service'
    WHEN r.service_days_per_week >= 2 THEN 'Bi-Weekly Service'
    ELSE 'Monthly Service'
  END AS "Service Type",
  TO_CHAR(r.next_invoice_date, 'Mon DD, YYYY') AS "Next Invoice",
  CASE 
    WHEN r.is_active THEN '✅ Active'
    ELSE '❌ Inactive'
  END AS "Status"
FROM recurring_invoices r
JOIN customers c ON r.customer_id = c.id
WHERE r.is_active = true
  AND c.user_id IN (SELECT id FROM auth.users WHERE email = 'rickeyhoward3@gmail.com')
ORDER BY c.company_name, r.location_label;

-- ============================================================================
-- SUMMARY: Revenue Protection Stats
-- ============================================================================

SELECT 
  '🎯 Total Active Schedules' AS "Metric",
  COUNT(*)::TEXT AS "Value"
FROM recurring_invoices
WHERE is_active = true
  AND user_id IN (SELECT id FROM auth.users WHERE email = 'rickeyhoward3@gmail.com')

UNION ALL

SELECT 
  '💰 Current Monthly Revenue' AS "Metric",
  '$' || ROUND(SUM(amount_cents) / 100.0, 2)::TEXT AS "Value"
FROM recurring_invoices
WHERE is_active = true
  AND user_id IN (SELECT id FROM auth.users WHERE email = 'rickeyhoward3@gmail.com')

UNION ALL

SELECT 
  '📈 Projected After All Increases' AS "Metric",
  '$' || ROUND(SUM(amount_cents * (1 + COALESCE(annual_increase_pct, 3.00) / 100.0)) / 100.0, 2)::TEXT AS "Value"
FROM recurring_invoices
WHERE is_active = true
  AND user_id IN (SELECT id FROM auth.users WHERE email = 'rickeyhoward3@gmail.com')

UNION ALL

SELECT 
  '💵 Annual Increase Revenue Gain' AS "Metric",
  '$' || ROUND(SUM(amount_cents * COALESCE(annual_increase_pct, 3.00) / 10000.0) * 12, 2)::TEXT AS "Value"
FROM recurring_invoices
WHERE is_active = true
  AND user_id IN (SELECT id FROM auth.users WHERE email = 'rickeyhoward3@gmail.com')

UNION ALL

SELECT 
  '📅 Contracts Due for Increase (Next 60 Days)' AS "Metric",
  COUNT(*)::TEXT AS "Value"
FROM recurring_invoices r
WHERE r.is_active = true
  AND r.user_id IN (SELECT id FROM auth.users WHERE email = 'rickeyhoward3@gmail.com')
  AND r.contract_start_date IS NOT NULL
  AND EXTRACT(MONTH FROM r.contract_start_date) IN (
    EXTRACT(MONTH FROM CURRENT_DATE),
    EXTRACT(MONTH FROM CURRENT_DATE + INTERVAL '1 month'),
    EXTRACT(MONTH FROM CURRENT_DATE + INTERVAL '2 months')
  )
  AND EXTRACT(YEAR FROM r.contract_start_date) < EXTRACT(YEAR FROM CURRENT_DATE);

-- ============================================================================
-- ACTION ITEMS: Clients Needing Contract Review
-- ============================================================================

SELECT 
  c.company_name AS "⚠️ Client",
  r.location_label AS "Location",
  '📝 Missing contract start date - please verify and update' AS "Action Needed"
FROM recurring_invoices r
JOIN customers c ON r.customer_id = c.id
WHERE r.is_active = true
  AND r.contract_start_date IS NULL
  AND c.user_id IN (SELECT id FROM auth.users WHERE email = 'rickeyhoward3@gmail.com')

UNION ALL

SELECT 
  c.company_name AS "⚠️ Client",
  r.location_label AS "Location",
  '💰 No annual increase set (defaulted to 3%) - confirm with contract' AS "Action Needed"
FROM recurring_invoices r
JOIN customers c ON r.customer_id = c.id
WHERE r.is_active = true
  AND r.annual_increase_pct = 3.00  -- Default value
  AND c.user_id IN (SELECT id FROM auth.users WHERE email = 'rickeyhoward3@gmail.com')
ORDER BY 1, 2;
