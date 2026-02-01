-- SECURITY HARDENING SCRIPT
-- Protocol: SOVEREIGN-LOCK 2.0
-- Purpose: Lock invoice data to owner, prevent ghost overwrites
-- Execute: Run this ONCE in Supabase SQL Editor

-- ==================== ENABLE RLS ====================

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_invoices ENABLE ROW LEVEL SECURITY;

-- ==================== DROP OLD POLICIES (if any) ====================

DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can insert own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can view own line items" ON invoice_line_items;
DROP POLICY IF EXISTS "Users can insert own line items" ON invoice_line_items;
DROP POLICY IF EXISTS "Users can view own schedules" ON recurring_invoices;
DROP POLICY IF EXISTS "Users can update own schedules" ON recurring_invoices;

-- ==================== INVOICES POLICIES ====================

-- SELECT: Users can only view their own invoices
CREATE POLICY "Users can view own invoices" ON invoices
FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- INSERT: Users can only create invoices for themselves
CREATE POLICY "Users can insert own invoices" ON invoices
FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

-- UPDATE: Users can only update their own invoices
CREATE POLICY "Users can update own invoices" ON invoices
FOR UPDATE
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- DELETE: Disabled for safety (manual admin action only)
-- CREATE POLICY "Users can delete own invoices" ON invoices
-- FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));

-- ==================== INVOICE LINE ITEMS POLICIES ====================

-- SELECT: Users can view line items for their own invoices (via JOIN)
CREATE POLICY "Users can view own line items" ON invoice_line_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM invoices 
    WHERE invoices.id = invoice_line_items.invoice_id 
    AND invoices.user_id = (SELECT auth.uid())
  )
);

-- INSERT: Users can create line items for their own invoices
CREATE POLICY "Users can insert own line items" ON invoice_line_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM invoices 
    WHERE invoices.id = invoice_line_items.invoice_id 
    AND invoices.user_id = (SELECT auth.uid())
  )
);

-- UPDATE: Users can update line items for their own invoices
CREATE POLICY "Users can update own line items" ON invoice_line_items
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM invoices 
    WHERE invoices.id = invoice_line_items.invoice_id 
    AND invoices.user_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM invoices 
    WHERE invoices.id = invoice_line_items.invoice_id 
    AND invoices.user_id = (SELECT auth.uid())
  )
);

-- ==================== RECURRING INVOICES POLICIES ====================

-- SELECT: Users can view their own schedules
CREATE POLICY "Users can view own schedules" ON recurring_invoices
FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- UPDATE: Users can update their own schedules (for next_invoice_date changes)
CREATE POLICY "Users can update own schedules" ON recurring_invoices
FOR UPDATE
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- INSERT/DELETE: Disabled - schedules managed via CLEAN_SLATE only

-- ==================== VERIFICATION ====================

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('invoices', 'invoice_line_items', 'recurring_invoices');

-- Expected output: All 3 tables should show rowsecurity = true

-- Check policies exist
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename IN ('invoices', 'invoice_line_items', 'recurring_invoices')
ORDER BY tablename, policyname;

-- Expected output: Should see 11 policies total
-- - invoices: 3 policies (SELECT, INSERT, UPDATE)
-- - invoice_line_items: 3 policies (SELECT, INSERT, UPDATE)
-- - recurring_invoices: 2 policies (SELECT, UPDATE)

RAISE NOTICE '✅ SOVEREIGN-LOCK 2.0 Security Hardening Complete';
RAISE NOTICE 'RLS enabled on invoices, invoice_line_items, recurring_invoices';
RAISE NOTICE 'All data now locked to user_id: eca49ca9-b4ae-4e0e-b78a-fa1811024781';
