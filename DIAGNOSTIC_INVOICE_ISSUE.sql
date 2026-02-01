-- DIAGNOSTIC: Find out why invoice creation failed

-- Step 1: Check if Joan Kent exists
SELECT id, company_name, user_id 
FROM customers 
WHERE company_name = 'Joan Kent';

-- Step 2: Check your user ID
SELECT id, email 
FROM auth.users 
WHERE email = 'generalmanager81@gmail.com';

-- Step 3: Check all your customers
SELECT company_name, user_id 
FROM customers 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'generalmanager81@gmail.com')
ORDER BY company_name;

-- Step 4: Check if ANY invoices exist
SELECT COUNT(*) as total_invoices FROM invoices;

-- Step 5: Check invoice_line_items table exists
SELECT COUNT(*) as total_line_items FROM invoice_line_items;
