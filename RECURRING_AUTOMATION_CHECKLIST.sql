-- RECURRING INVOICE AUTOMATION CHECKLIST
-- For March 1, 2026 Go-Live (Cut QuickBooks by Feb 28)

-- ==================== CURRENT STATUS ====================
-- ✅ Data loaded: 13 customers + 25 recurring schedules = $17,497.69/month
-- ✅ UI ready: AutomatedInvoicing.tsx shows all schedules
-- ⚠️  MISSING: Database function to generate invoices from recurring schedules
-- ⚠️  MISSING: Automated cron job to run monthly
-- ⚠️  MISSING: PDF invoice generation with Odyssey-1 branding
-- ⚠️  MISSING: Email delivery system

-- ==================== REQUIRED FEATURES ====================

-- 1. DATABASE FUNCTION: generate_invoice_from_recurring
--    Purpose: Creates actual invoice from recurring schedule
--    Triggered: Manual "Generate Now" button OR automatic cron
--    Updates: next_invoice_date to next month

CREATE OR REPLACE FUNCTION generate_invoice_from_recurring(recurring_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_recurring recurring_invoices%ROWTYPE;
  v_invoice_id uuid;
  v_invoice_number text;
BEGIN
  -- Get recurring invoice details
  SELECT * INTO v_recurring
  FROM recurring_invoices
  WHERE id = recurring_id AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Recurring invoice not found or inactive';
  END IF;
  
  -- Generate unique invoice number
  v_invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
  
  -- Create invoice from recurring schedule
  INSERT INTO invoices (
    invoice_number,
    customer_id,
    total_amount,
    due_date,
    issue_date,
    status,
    line_items,
    notes,
    tax_rate,
    user_id
  ) VALUES (
    v_invoice_number,
    v_recurring.customer_id,
    COALESCE(v_recurring.amount_cents / 100.0, v_recurring.total_amount),
    v_recurring.next_invoice_date + INTERVAL '15 days', -- Due 15 days after issue
    v_recurring.next_invoice_date,
    'draft',
    v_recurring.line_items,
    COALESCE(v_recurring.notes, 'Recurring service invoice - ' || COALESCE(v_recurring.location_label, 'Main')),
    COALESCE(v_recurring.tax_rate, 0),
    v_recurring.user_id
  )
  RETURNING id INTO v_invoice_id;
  
  -- Update next_invoice_date based on frequency
  UPDATE recurring_invoices
  SET next_invoice_date = CASE
    WHEN frequency = 'monthly' THEN next_invoice_date + INTERVAL '1 month'
    WHEN frequency = 'quarterly' THEN next_invoice_date + INTERVAL '3 months'
    WHEN frequency = 'annual' THEN next_invoice_date + INTERVAL '1 year'
    ELSE next_invoice_date + INTERVAL '1 month'
  END,
  updated_at = NOW()
  WHERE id = recurring_id;
  
  RETURN v_invoice_id;
END;
$$;

-- ==================== GRANT PERMISSIONS ====================
GRANT EXECUTE ON FUNCTION generate_invoice_from_recurring(uuid) TO authenticated;

-- ==================== 2. AUTOMATED CRON JOB ====================
-- Purpose: Run daily to check for invoices due
-- Supabase Edge Function or pg_cron approach

-- Edge Function approach (recommended for Supabase):
-- Create: supabase/functions/auto-generate-invoices/index.ts
-- Schedule: Daily at 6 AM via Supabase Cron
-- Logic: Check for recurring_invoices where next_invoice_date <= TODAY

-- SQL version (if using pg_cron):
/*
SELECT cron.schedule(
  'auto-generate-recurring-invoices',
  '0 6 * * *', -- Daily at 6 AM
  $$
  SELECT generate_invoice_from_recurring(id)
  FROM recurring_invoices
  WHERE is_active = true
    AND next_invoice_date <= CURRENT_DATE
  $$
);
*/

-- ==================== 3. PDF INVOICE GENERATION ====================
-- Options:
-- A) jsPDF (client-side) - Already in project?
-- B) PDFKit (server-side Edge Function)
-- C) Puppeteer (headless Chrome) - Most powerful

-- Template Requirements:
-- - Odyssey-1 logo (top left)
-- - Company info: Your business name, address, phone
-- - Invoice number, date, due date
-- - Bill To: Customer name, address
-- - Line items table with quantity, rate, amount
-- - Subtotal, tax (8.25%), total
-- - Payment terms: Net 15 days
-- - Thank you message

-- ==================== 4. EMAIL DELIVERY ====================
-- Options:
-- A) Resend (recommended, simple API)
-- B) SendGrid
-- C) AWS SES
-- D) Supabase Auth SMTP (limited)

-- Email Template:
/*
Subject: Invoice [INV-20260301-ABC123] from Odyssey-1
Body:
Hi [Customer Name],

Your invoice is ready for [Location/Service].

Invoice #: INV-20260301-ABC123
Amount Due: $1,124.55
Due Date: March 16, 2026

Please find your invoice attached.

Thank you for your business!

Best regards,
Odyssey-1 Team
*/

-- ==================== TESTING CHECKLIST ====================
-- [ ] Manual "Generate Now" creates invoice in invoices table
-- [ ] next_invoice_date advances to next month
-- [ ] Invoice appears in main invoice list
-- [ ] Invoice status = 'draft' (ready to send)
-- [ ] PDF generates with Odyssey-1 branding
-- [ ] Email sends successfully
-- [ ] Customer receives readable PDF attachment
-- [ ] Cron runs daily without errors
-- [ ] All 25 schedules generate on March 1st

-- ==================== GO-LIVE TIMELINE ====================
-- TODAY (Jan 30): Load all customer data ✅
-- Feb 1-10: Build & test invoice generation function
-- Feb 11-15: Set up PDF generation
-- Feb 16-20: Set up email delivery
-- Feb 21-25: Test full automation with 2-3 clients
-- Feb 26-28: Final testing, QuickBooks export backup
-- MARCH 1: First auto-generated invoices send
-- March 1-5: Monitor for errors, manual fixes if needed
-- March 15: First payments due (Net 15)

-- ==================== IMMEDIATE NEXT STEPS ====================
-- 1. Run this SQL to create generate_invoice_from_recurring function
-- 2. Test "Generate Now" button in Odyssey-1 UI
-- 3. Verify invoice appears in main invoice list
-- 4. Check next_invoice_date updated correctly
