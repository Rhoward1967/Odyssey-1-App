-- Diagnostic: Check if user exists and find Joan Kent
-- Run each query separately to diagnose the issue

-- Query 1: Check if user exists in auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'generalmanager81@gmail.com';

-- Query 2: Check Joan Kent with ANY user_id (might be different user)
SELECT id, company_name, user_id, updated_at
FROM customers 
WHERE company_name = 'Joan Kent';

-- Query 3: Get the user_id and try to find Joan Kent in one query
SELECT 
  (SELECT id FROM auth.users WHERE email = 'generalmanager81@gmail.com') as auth_user_id,
  (SELECT id FROM customers WHERE company_name = 'Joan Kent' LIMIT 1) as joan_kent_id,
  (SELECT user_id FROM customers WHERE company_name = 'Joan Kent' LIMIT 1) as joan_kent_user_id;

-- Query 4: List all customers (to see what's actually there)
SELECT id, company_name, user_id 
FROM customers 
LIMIT 20;
