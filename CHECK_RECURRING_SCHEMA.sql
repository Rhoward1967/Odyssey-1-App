-- Check recurring_invoices schema
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'recurring_invoices'
ORDER BY ordinal_position;
