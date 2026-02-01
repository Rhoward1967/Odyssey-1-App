-- Step 1: Does the user exist?
SELECT id, email FROM auth.users WHERE email = 'rickeyhoward3@gmail.com';

-- Step 2: Do ANY customers exist for this user?
SELECT COUNT(*) as customer_count FROM customers 
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'rickeyhoward3@gmail.com');

-- Step 3: List ALL customers
SELECT id, company_name, first_name, last_name, email 
FROM customers 
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'rickeyhoward3@gmail.com')
ORDER BY company_name;

-- Step 4: Do ANY recurring_invoices exist at all?
SELECT COUNT(*) as total_recurring_invoices FROM recurring_invoices;
