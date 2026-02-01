-- Add 'annual' to frequency CHECK constraint
-- Fixes: Beth Smith contracts currently stored as 'quarterly' should be 'annual'

-- Drop old constraint
ALTER TABLE recurring_invoices 
DROP CONSTRAINT IF EXISTS recurring_invoices_frequency_check;

-- Add new constraint with 'annual' included
ALTER TABLE recurring_invoices 
ADD CONSTRAINT recurring_invoices_frequency_check 
CHECK (frequency IN ('weekly', 'bi-weekly', 'monthly', 'quarterly', 'annual'));

-- Update Beth Smith contracts from 'quarterly' to 'annual'
UPDATE recurring_invoices
SET frequency = 'annual'
WHERE location_label IN ('Satula Avenue Government Building', 'Dougherty Street Government Building')
  AND user_id = (SELECT id FROM auth.users WHERE email = 'generalmanager81@gmail.com' LIMIT 1);

-- Verification
SELECT 
  COUNT(*) as total_schedules,
  COUNT(*) FILTER (WHERE frequency = 'monthly') as monthly_schedules,
  COUNT(*) FILTER (WHERE frequency = 'annual') as annual_schedules,
  '$' || (SUM(amount_cents) FILTER (WHERE frequency = 'monthly') / 100.0)::numeric(10,2) as monthly_recurring,
  '$' || (SUM(amount_cents) FILTER (WHERE frequency = 'annual') / 100.0)::numeric(10,2) as annual_contracts
FROM recurring_invoices
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'generalmanager81@gmail.com');
