# Customer Data Cleanup Script
# This script checks for and optionally deletes old CSV-imported customer data

Write-Host "=== CUSTOMER DATA CLEANUP UTILITY ===" -ForegroundColor Cyan
Write-Host ""

# Connect to Supabase and check for old CSV data
$cleanupSQL = @"
-- Check for customers that might be old CSV imports
-- (those with dashes or empty values in critical fields)

SELECT 
    id,
    customer_name,
    email,
    phone,
    billing_city,
    source,
    created_at,
    CASE 
        WHEN email = '-' OR email = '' OR email IS NULL THEN 'BAD_EMAIL'
        WHEN phone = '-' OR phone = '' OR phone IS NULL THEN 'BAD_PHONE'
        WHEN billing_city = '-' OR billing_city = '' OR billing_city IS NULL THEN 'BAD_CITY'
        ELSE 'OK'
    END as data_quality
FROM customers
WHERE user_id = auth.uid()
    AND (
        email = '-' OR email = '' OR email IS NULL
        OR phone = '-' OR phone = '' OR phone IS NULL
        OR billing_city = '-' OR billing_city = '' OR billing_city IS NULL
        OR source LIKE '%csv%'
    )
ORDER BY created_at DESC;
"@

Write-Host "SQL to check for bad CSV data:" -ForegroundColor Yellow
Write-Host $cleanupSQL
Write-Host ""
Write-Host "To execute this cleanup:" -ForegroundColor Green
Write-Host "1. Go to Supabase Dashboard -> SQL Editor"
Write-Host "2. Run the SELECT query above to see problematic records"
Write-Host "3. If you want to DELETE them, use the 'Clear All' button in Workforce -> Clients tab"
Write-Host ""
Write-Host "Alternatively, run this DELETE query in Supabase SQL Editor:" -ForegroundColor Yellow
Write-Host @"

-- DELETE customers with bad data (dashes or empty values)
-- WARNING: This is permanent!
DELETE FROM customers
WHERE user_id = auth.uid()
    AND (
        email = '-' 
        OR phone = '-' 
        OR billing_city = '-'
        OR (email IS NULL AND phone IS NULL)
    );

-- Or use the stored procedure that was created earlier:
SELECT clear_customers_for_current_user();
"@

Write-Host ""
Write-Host "=== CLEANUP COMPLETE ===" -ForegroundColor Cyan
