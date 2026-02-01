-- Check which HJS customers have Stripe Customer IDs
-- This determines if we can create Stripe Subscriptions

SELECT 
  company_name,
  email,
  stripe_customer_id,
  CASE 
    WHEN stripe_customer_id IS NULL THEN '❌ Not in Stripe'
    ELSE '✅ Ready for subscription'
  END as stripe_status
FROM public.customers 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'generalmanager81@gmail.com')
ORDER BY company_name;

-- Summary
SELECT 
  COUNT(*) as total_customers,
  COUNT(stripe_customer_id) as has_stripe_id,
  COUNT(*) - COUNT(stripe_customer_id) as missing_stripe_id
FROM public.customers 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'generalmanager81@gmail.com');
