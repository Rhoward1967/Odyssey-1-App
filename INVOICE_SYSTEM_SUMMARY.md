# HJS Invoice System - March 1, 2026 Ready

## System Overview

**Goal:** Generate invoices from 21 recurring schedules, send to customers, collect payments

**NOT building:** Auto-subscriptions (customers choose when to pay)

## Components Built

### 1. Invoice Generator (`generate-monthly-invoices` Edge Function)

**What it does:**

- Runs daily (or manually triggered)
- Checks `recurring_invoices` table for schedules due
- Creates invoice in `invoices` table
- Adds line items
- Updates `next_invoice_date` based on frequency (monthly/annual)
- Generates unique invoice numbers: `INV-202603-0001`

**Example:**

```
March 1, 2026: Generates 17 invoices for customers with next_invoice_date = 2026-03-01
March 20: Generates 1 invoice for Georgia Eye Surgery ASC (Megan Bloomfield)
March 27: Generates 1 invoice for Amy Deltoro
July 1: Generates 2 annual invoices for Beth Smith
```

### 2. Customer Invoice View (`CustomerInvoiceView.tsx`)

**What customers see:**

- Invoice number, date, due date
- Company info (Odyssey-1 AI LLC, PO Box 80054, Athens GA 30608)
- Customer billing address
- Service description and amount
- Payment status (Pending/Paid/Overdue)

**Payment Options:**

1. **💳 Pay by Card**
   - Click "Pay by Credit or Debit Card"
   - Stripe payment form loads
   - Enter card details
   - Payment processed immediately
   - Invoice marked "PAID"

2. **📮 Pay by Check/Mail**
   - Click "Pay by Check (Mail)"
   - Shows mailing instructions:

     ```
     Odyssey-1 AI LLC
     PO Box 80054
     Athens, GA 30608

     Include: Invoice #INV-202603-0001
     Make check payable to: Odyssey-1 AI LLC
     ```

   - Customer mails check
   - You manually mark invoice paid when check arrives

3. **📥 Download PDF**
   - Download/print invoice for records
   - (PDF generation to be added)

## Database Tables

### `invoices`

```sql
- id (uuid)
- customer_id (references customers)
- user_id (uuid)
- invoice_number (text) - "INV-202603-0001"
- invoice_date (date)
- due_date (date) - invoice_date + 15 days default
- subtotal (numeric)
- total_amount (numeric)
- status (text) - 'pending', 'paid', 'overdue'
- notes (text)
- metadata (jsonb) - {recurring_invoice_id, location_label, frequency}
```

### `invoice_line_items`

```sql
- id (uuid)
- invoice_id (references invoices)
- description (text) - "Monthly Cleaning Service - Prince Ave ASC"
- quantity (integer)
- unit_price (numeric)
- total (numeric)
```

## Payment Flow

### Credit/Debit Card (Automated):

1. Customer receives email: "Invoice #INV-202603-0001 Ready"
2. Clicks link → Opens CustomerInvoiceView
3. Clicks "Pay by Card"
4. Enters card info (Stripe secure form)
5. Payment processed → Invoice.status = 'paid'
6. Customer receives payment confirmation email
7. ✅ **Done - Money in your account instantly**

### Check/Mail (Manual):

1. Customer receives email: "Invoice #INV-202603-0001 Ready"
2. Clicks link → Opens CustomerInvoiceView
3. Clicks "Pay by Check"
4. Sees mailing instructions
5. Mails check to PO Box 80054
6. You receive check → Open Odyssey-1 app
7. Mark invoice as paid manually
8. ✅ **Done - Check deposited**

## What's Next (Priority Order)

### Week 1 (Feb 1-7): Core Invoicing

- [x] Invoice generator function
- [x] Customer invoice view component
- [x] Payment options (card + check)
- [ ] Deploy `generate-monthly-invoices` to Supabase
- [ ] Test: Generate 1 test invoice
- [ ] Test: Pay test invoice by card
- [ ] Test: Display check payment instructions

### Week 2 (Feb 8-14): Email Delivery

- [ ] Email template design
- [ ] Invoice PDF generation (jsPDF or react-pdf)
- [ ] Email sending (Resend.com - 3,000/month free)
- [ ] Test: Send invoice email to your own email
- [ ] Test: Click link from email, verify invoice loads

### Week 3 (Feb 15-21): Automation

- [ ] Create Supabase cron job (daily at 6 AM)
- [ ] Auto-run `generate-monthly-invoices`
- [ ] Auto-send emails for new invoices
- [ ] Test: Let system run automatically for 1 week
- [ ] Monitor: Check all invoices generate correctly

### Week 4 (Feb 22-28): Final Testing

- [ ] Generate real invoices for March 1
- [ ] Send to 1-2 friendly customers for testing
- [ ] Verify payment links work
- [ ] Verify check instructions clear
- [ ] Fix any issues found
- [ ] **March 1: GO LIVE**

## Revenue Impact

**March 1, 2026:**

- 17 invoices generated (1st of month customers)
- Total: ~$12,000+ in invoices sent
- Customers pay throughout March
- Cash starts flowing to replace QuickBooks

**March 20:**

- 1 invoice: Georgia Eye Surgery ASC ($1,233.19)

**March 27:**

- 1 invoice: Amy Deltoro ($239.72)

**July 1:**

- 2 annual invoices: Beth Smith ($61,030 total)

**Monthly Recurring:** $14,283.07/month guaranteed (19 schedules)
**Annual Contracts:** $61,030/year (2 schedules)

## Manual Override

You can always manually:

1. Generate invoices early: Call function from Supabase
2. Mark invoices paid: Update status in database
3. Send invoice reminders: Re-send email link
4. Add one-time invoices: Insert directly to invoices table

## No Auto-Subscriptions

Customers are **NOT** auto-charged. They:

- Receive invoice notification
- Choose when to pay
- Choose payment method (card or check)
- You maintain full control

Perfect for business customers who need invoice approval before payment.

## Next Immediate Step

Run this in Supabase to deploy the invoice generator:

```bash
npx supabase functions deploy generate-monthly-invoices
```

Then test it manually:

```bash
npx supabase functions invoke generate-monthly-invoices
```

Should create invoices for any schedules with next_invoice_date <= today.
