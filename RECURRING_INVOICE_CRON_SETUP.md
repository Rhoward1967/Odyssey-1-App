# CRON SETUP GUIDE FOR RECURRING INVOICE GENERATOR
# HJS Services LLC - Automated Billing System
# Created: January 28, 2026

## 🎯 MISSION
Auto-generate invoices daily from recurring schedules at midnight UTC.

---

## ✅ STEP 1: TEST THE FUNCTION (DO THIS NOW)

Run the test script:
```powershell
.\scripts\test-recurring-invoices.ps1
```

**Expected result:** `{"processed": 0, "generated": 0}` (nothing due until Feb 1)

If errors, check:
- `.env` file has `VITE_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Edge Function deployed: `supabase functions list`

---

## 📅 STEP 2: SCHEDULE DAILY CRON

### **Option A: Supabase Dashboard Cron (RECOMMENDED)**

1. Go to: https://supabase.com/dashboard/project/YOUR-PROJECT/database/cron-jobs
2. Click "Create a new cron job"
3. Configure:
   ```
   Name: recurring-invoice-generator
   Schedule: 0 0 * * * (Daily at midnight UTC)
   Command: SELECT net.http_post(
              url:='https://YOUR-PROJECT.supabase.co/functions/v1/recurring-invoice-generator',
              headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
            );
   ```
4. Save

### **Option B: GitHub Actions (ALTERNATIVE)**

Create `.github/workflows/recurring-invoices.yml`:
```yaml
name: Generate Recurring Invoices
on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight UTC
  workflow_dispatch:  # Manual trigger

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - name: Call Edge Function
        run: |
          curl -X POST ${{ secrets.SUPABASE_URL }}/functions/v1/recurring-invoice-generator \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}"
```

Add secrets to GitHub repo:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### **Option C: Vercel Cron (If hosting on Vercel)**

Create `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/recurring-invoices",
    "schedule": "0 0 * * *"
  }]
}
```

Create `api/cron/recurring-invoices.ts`:
```typescript
export default async function handler(req, res) {
  const response = await fetch(
    `${process.env.VITE_SUPABASE_URL}/functions/v1/recurring-invoice-generator`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      }
    }
  );
  const data = await response.json();
  res.json(data);
}
```

---

## 🔍 STEP 3: MONITOR EXECUTION

### **Check System Logs**
```sql
SELECT *
FROM system_logs
WHERE service = 'recurring-invoice-generator'
ORDER BY created_at DESC
LIMIT 10;
```

### **Check Generated Invoices**
```sql
SELECT 
  i.invoice_number,
  c.company_name,
  i.total_amount,
  i.issued_date,
  i.due_date,
  i.status
FROM invoices i
JOIN customers c ON i.customer_id = c.id
WHERE i.issued_date >= '2026-02-01'
ORDER BY i.issued_date DESC;
```

### **Check Next Invoice Dates Advanced**
```sql
SELECT 
  c.company_name,
  ri.amount_cents / 100.0 AS monthly_amount,
  ri.next_invoice_date,
  ri.frequency,
  ri.is_active
FROM recurring_invoices ri
JOIN customers c ON ri.customer_id = c.id
WHERE ri.is_active = true
ORDER BY ri.next_invoice_date;
```

---

## 📊 EXPECTED RESULTS (Feb 1, 2026)

**Invoices Generated:** 17
- ADM Joan Kent: $1,124.55
- ADM Joan Kent Milledgeville: $1,124.55
- Admin Tonyia Brooks: $1,002.32
- Cartwright Properties: $80.00
- Crystal Richardson (MGR): $244.30
- Crystal Richardson (MGR/L): $243.92
- Crystal Richardson (MAIN): $1,540.00
- Joan Kent: $1,063.10
- MGR Crystal Richardson: $244.30
- Michelle Nguyen: $225.69
- Michelle Nguyen Supply: $245.14
- Robert Andrews: $355.20
- Sandi Turner: $698.50
- Sandi Turner Mercury Side 2: $30.47
- Sandi Turner Supply: $300.30
- Sheri Tifosi: $776.47

**Total:** ~$9,298/day (17 clients with next_invoice_date = 2026-02-01)

**Feb 20:** 1 invoice (Georgia Eye Surgery ASC: $1,233.19)
**Feb 27:** 1 invoice (Amy Deltoro: $239.72)
**Mar 1:** 4 invoices (~$4,929.69)
**Mar 6:** 1 invoice (Todd Knight: $1,409.99)

---

## 🚨 TROUBLESHOOTING

### **No invoices generated:**
1. Check `recurring_invoices.next_invoice_date` is today or past
2. Check `recurring_invoices.is_active = true`
3. Check system_logs for errors

### **Duplicates:**
- Function is idempotent - safe to run multiple times per day
- Each invoice advances `next_invoice_date` immediately

### **Wrong amounts:**
- Verify `amount_cents` in `recurring_invoices` table
- Function converts: `amount_cents / 100.0 = total_amount`

---

## ✅ SUCCESS CHECKLIST

- [ ] Test script runs successfully
- [ ] Cron job scheduled (Option A, B, or C)
- [ ] Feb 1 invoices generated (17 total)
- [ ] All status = 'draft'
- [ ] Review in AutomatedInvoicing.tsx UI
- [ ] Send invoices to customers
- [ ] Cash flows! 💰

---

## 📞 SUPPORT

If issues, check:
1. System logs table
2. Edge Function deployment status
3. Service role key permissions
4. Supabase project billing status (ensure Functions enabled)
