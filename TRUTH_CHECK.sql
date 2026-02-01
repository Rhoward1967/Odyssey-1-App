-- TRUTH CHECK: What actually exists in your database
-- Run this, paste results, I'll tell you exactly what's broken

-- 1. Your user account
SELECT 'USER CHECK' as test, 
       CASE WHEN COUNT(*) > 0 THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM auth.users WHERE email = 'rickeyhoward3@gmail.com';

-- 2. Your customers
SELECT 'CUSTOMERS' as test,
       COUNT(*)::text || ' customers found' as status
FROM customers 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'rickeyhoward3@gmail.com');

-- 3. Your recurring invoices  
SELECT 'RECURRING INVOICES' as test,
       COUNT(*)::text || ' schedules, $' || COALESCE(SUM(amount_cents)/100.0, 0)::text as status
FROM recurring_invoices
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'rickeyhoward3@gmail.com');

-- 4. List what customers you DO have
SELECT company_name FROM customers 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'rickeyhoward3@gmail.com')
ORDER BY company_name;
