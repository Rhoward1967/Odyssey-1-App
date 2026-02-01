# Invoice Manual Approval Workflow

## Current Status: **PRE-MARCH 1ST - NOTIFICATION ONLY**

### What We're Doing NOW (February 2026)
✅ **Sending Welcome Letters** - Management change notifications ONLY  
❌ **NO automated invoicing**  
❌ **NO billing until manually reviewed**  

---

## Safety Controls in Place

### 1. CRON Job Disabled
- **Migration:** `20260201_DISABLE_AUTO_INVOICING.sql`
- **Action:** Unscheduled `recurring-invoice-generator` CRON job
- **Effect:** No invoices will generate automatically at midnight UTC

### 2. Manual Approval Flag
- **Table:** `recurring_invoices`
- **Column:** `manual_approval_required = true` (all records)
- **Effect:** Prevents accidental invoice generation even if CRON re-enabled

### 3. Review Process Required
Before ANY invoice goes out:
1. ✅ Review customer contract details
2. ✅ Verify pricing accuracy
3. ✅ Confirm billing frequency
4. ✅ Check payment terms
5. ✅ Manually approve each invoice
6. ✅ Send individually after review

---

## Timeline

### Now - February 28, 2026
- **Welcome Letters:** Send management change notifications
- **Invoicing:** DISABLED - Manual review only
- **Payments:** Existing HJS contracts continue

### March 1, 2026 - Official Takeover
- **Review:** All pending invoices for accuracy
- **Approve:** Manually approve each customer's first invoice
- **Enable:** Re-activate automated billing (optional, after approval)

---

## Manual Invoice Generation (When Ready)

### Option 1: Generate One Invoice at a Time
```javascript
// scripts/generate-single-invoice.mjs
import { createClient } from '@supabase/supabase-js';

const customerId = 'customer-uuid-here';
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Fetch recurring invoice details
const { data: recurring } = await supabase
  .from('recurring_invoices')
  .select('*')
  .eq('customer_id', customerId)
  .single();

// REVIEW DETAILS FIRST
console.log('Review this invoice before approving:');
console.log(JSON.stringify(recurring, null, 2));

// IF APPROVED, manually create invoice
// (Add approval confirmation prompt)
```

### Option 2: Batch Generate for Manual Review
```javascript
// Generate invoices but mark as DRAFT status
// Review in admin dashboard
// Manually approve and send individually
```

---

## Re-Enabling Automation (After March 1st)

### Step 1: Review All Contracts
```sql
SELECT c.company_name, r.amount_cents / 100.0 as monthly_amount, 
       r.frequency, r.next_invoice_date, r.manual_approval_required
FROM recurring_invoices r
JOIN customers c ON r.customer_id = c.id
WHERE r.is_active = true
ORDER BY c.company_name;
```

### Step 2: Disable Manual Approval (When Ready)
```sql
UPDATE recurring_invoices 
SET manual_approval_required = false
WHERE is_active = true;
```

### Step 3: Re-Enable CRON Job
```bash
npx supabase db execute < supabase/migrations/20260128_setup_recurring_invoice_cron.sql
```

---

## Current Welcome Letter System

### Safe to Send (Notification Only)
- **Script:** `scripts/send-welcome-letters.mjs`
- **Content:** Management transition notification
- **NO billing information**
- **NO payment requests**
- **NO invoice generation**

### Message Content
- Announces March 1, 2026 transition
- Provides new mailing address (P.O. Box 80054)
- Requests vendor record updates
- Does NOT request payment
- Does NOT send invoices

---

## Questions Before Proceeding?

1. Should we send Welcome Letters now (notification only)?
2. When do you want to review invoice details?
3. What approval process do you want before March 1st invoicing?

**CURRENT STATE:** Automated invoicing DISABLED, awaiting your approval for Welcome Letter send (notifications only)
