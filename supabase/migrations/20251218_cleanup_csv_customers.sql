-- Clean up CSV upload test data before QuickBooks webhook customers populate
-- These are test/import customers that are being replaced by real-time QuickBooks sync

DELETE FROM public.customers 
WHERE source = 'csv_upload';

-- Log the cleanup
DO $$
BEGIN
  RAISE NOTICE 'Deleted CSV upload test customers. QuickBooks webhook will populate real customers.';
END $$;
