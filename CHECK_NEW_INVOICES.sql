-- Check if Edge Function created any new invoices
SELECT 
  i.invoice_number,
  i.issue_date,
  c.company_name,
  '$' || i.total_amount::text as amount,
  i.status
FROM invoices i
JOIN customers c ON i.customer_id = c.id
ORDER BY i.created_at DESC
LIMIT 10;
