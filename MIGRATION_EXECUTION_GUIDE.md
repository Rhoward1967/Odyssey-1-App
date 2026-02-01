# 🚀 MIGRATION EXECUTION GUIDE

## **STEP-BY-STEP: Execute R.O.M.A.N. 2.0 Migrations**

### **Prerequisites**
- ✅ Supabase project dashboard access
- ✅ Migration files ready in `supabase/migrations/`
- ✅ Frontend code deployed (AutomatedInvoicing.tsx with alert badges)

---

## **EXECUTION SEQUENCE**

### **STEP 1: Execute Contract Autopilot Migration** ⚡

**File:** `20260129_add_contract_autopilot_columns.sql`

**How to Execute:**
1. Open your Supabase Dashboard: https://app.supabase.com
2. Navigate to: **SQL Editor** (left sidebar)
3. Click **+ New Query**
4. Copy the entire contents of `20260129_add_contract_autopilot_columns.sql`
5. Paste into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)

**Expected Output:**
```
Success. Rows returned: 0

Command: ALTER TABLE
Command: CREATE INDEX
Command: COMMENT
Command: UPDATE
```

**What This Does:**
- ✅ Adds 5 new columns to `recurring_invoices` table
- ✅ Creates performance index for anniversary lookups
- ✅ Backfills contract start dates (1 year before March 2026)
- ✅ Sets default annual increase to 3%

**Verification Query (Run This Next):**
```sql
-- Check that columns were added successfully
SELECT 
  column_name, 
  data_type, 
  column_default
FROM information_schema.columns
WHERE table_name = 'recurring_invoices'
  AND column_name IN (
    'contract_start_date', 
    'annual_increase_pct', 
    'service_days_per_week',
    'due_date_offset_days',
    'late_fee_pct'
  )
ORDER BY column_name;
```

**Expected Result:** Should show 5 rows with the new columns

---

### **STEP 2: Execute Main HJS Client Migration** ⚡

**File:** `20260129_complete_hjs_migration_corrected.sql`

**How to Execute:**
1. In Supabase SQL Editor, click **+ New Query**
2. Copy the entire contents of `20260129_complete_hjs_migration_corrected.sql`
3. Paste into the SQL Editor
4. Click **Run**

**Expected Output:**
```
✅ Joan Kent - Milledgeville: $1,124.55/month
✅ Joan Kent - Greensboro Service: $1,063.10/month
✅ Joan Kent - Greensboro Supplies: $435.30 (bi-monthly, manual)
✅ Tonyia Brooks: $1,002.32/month
... (21 more clients)
═══════════════════════════════════════════════════════════
MIGRATION COMPLETE
═══════════════════════════════════════════════════════════
Total schedules loaded: 25
Expected monthly revenue: ~$17,497.69
```

**What This Does:**
- ✅ Loads all 25 active client schedules
- ✅ Sets March 1, 2026 go-live dates
- ✅ Configures multi-location customers (Joan Kent, Crystal Richardson, Sandi Turner)
- ✅ Sets correct billing amounts ($17,497.69/month total)

**Verification Query (Run This Next):**
```sql
-- Verify all 25 schedules loaded
SELECT 
  COUNT(*) as total_schedules,
  SUM(amount_cents) / 100.0 as monthly_revenue
FROM recurring_invoices
WHERE is_active = true
  AND user_id IN (SELECT id FROM auth.users WHERE email = 'rickeyhoward3@gmail.com');
```

**Expected Result:**
- `total_schedules`: **25**
- `monthly_revenue`: **$17,497.69**

---

### **STEP 3: Run Final Audit Report** 📊

**File:** `final_audit_contract_dates.sql`

**How to Execute:**
1. In Supabase SQL Editor, click **+ New Query**
2. Copy the entire contents of `final_audit_contract_dates.sql`
3. Paste into the SQL Editor
4. Click **Run**

**Expected Output:**
A detailed table showing:
- All 25 clients with their locations
- Contract start dates (backfilled to March 2025)
- Next increase dates (March 2027)
- Current vs. projected amounts
- Revenue summary statistics

**What This Shows:**
- 🎯 Contract anniversary dates for all clients
- 💰 Revenue impact of annual increases
- ⚠️ Any clients needing manual review

**Action Items After Audit:**
1. **Compare dates to your Google Drive contracts**
2. **Update incorrect contract start dates** (see correction script below)
3. **Adjust annual increase percentages** if contracts differ from 3%
4. **Update service frequency** for weekly cleaning clients

---

### **STEP 4: Verify Alert Badges in UI** 🎨

**How to Test:**
1. Open your Odyssey-1 app in browser
2. Navigate to **Automated Invoicing** section
3. Click **Recurring Invoices** tab
4. Look for the new **"Alerts"** column

**What You Should See:**
- New column between "Next Invoice" and "Status"
- Some rows may show alert badges:
  - 📈 Blue badge if anniversary is near
  - 📅 Green badge if month has 5 weeks
  - ⚠️ Red badge if invoice overdue
- Most will show "—" (no alerts yet, since contracts start March 2025)

**UI Screenshot Example:**
```
Client          | Location    | Next Invoice | Alerts                | Status
----------------|-------------|--------------|----------------------|--------
Joan Kent       | Milledgeville| Mar 1, 2026  | —                    | Active
GNS Surgery     | Main        | Mar 1, 2026  | —                    | Active
Crystal R.      | Prince Ave  | Mar 1, 2026  | —                    | Active
```

---

## **POST-MIGRATION: Contract Date Corrections**

### **If Contract Start Dates Are Wrong:**

**Example: Joan Kent's actual contract was signed February 15, 2024**

```sql
-- Update contract start date for specific client
UPDATE recurring_invoices
SET contract_start_date = '2024-02-15'
WHERE customer_id IN (
  SELECT id FROM customers WHERE company_name ILIKE '%Joan Kent%'
)
AND location_label = 'Milledgeville';

-- Verify the change
SELECT 
  c.company_name,
  r.location_label,
  r.contract_start_date,
  r.contract_start_date + INTERVAL '1 year' as next_increase_date
FROM recurring_invoices r
JOIN customers c ON r.customer_id = c.id
WHERE c.company_name ILIKE '%Joan Kent%';
```

### **If Annual Increase % Is Different:**

**Example: GNS Surgery has 5% annual increase instead of 3%**

```sql
-- Update annual increase percentage
UPDATE recurring_invoices
SET annual_increase_pct = 5.00
WHERE customer_id IN (
  SELECT id FROM customers WHERE company_name ILIKE '%GNS%Surgery%'
);
```

### **If Service Frequency Is Weekly:**

**Example: GNS Surgery has daily cleaning (5 days/week)**

```sql
-- Update service days per week
UPDATE recurring_invoices
SET service_days_per_week = 5
WHERE customer_id IN (
  SELECT id FROM customers WHERE company_name ILIKE '%GNS%Surgery%'
);
```

---

## **TROUBLESHOOTING**

### **Error: "Column already exists"**
**Solution:** Migration is idempotent - safe to re-run. Ignore this error.

### **Error: "Customer not found"**
**Solution:** Run customer migration first, or check customer names match exactly.

### **Alert Badges Not Showing in UI**
**Solution:**
1. Hard refresh browser (Ctrl+Shift+R)
2. Check browser console for errors (F12)
3. Verify data fetching includes new fields (check Network tab)

### **Revenue Total Doesn't Match $17,497.69**
**Solution:**
1. Re-run verification query
2. Check for duplicate schedules (should only be 25)
3. Verify all amounts match migration file

---

## **SUCCESS CHECKLIST**

After all migrations complete, you should have:

- [x] **Database:** 5 new columns in `recurring_invoices` table
- [x] **Schedules:** 25 active schedules loaded
- [x] **Revenue:** $17,497.69/month total
- [x] **Dates:** Contract start dates backfilled (March 2025)
- [x] **Increases:** 3% annual increase set for all
- [x] **UI:** Alert badges visible in recurring invoices table
- [x] **Audit:** Final audit report shows all clients

---

## **NEXT STEPS**

1. **Review Drive contracts** - Compare audit report dates to actual signed contracts
2. **Update discrepancies** - Use correction scripts above
3. **Test March 1 generation** - Wait until March 1, 2026 (tomorrow!) or manually trigger
4. **Monitor alerts** - Check for anniversary badges starting March 2027
5. **Apply first price increase** - When anniversary alerts appear, update amounts

---

## **SUPPORT**

**If you encounter issues:**
- Check Supabase dashboard logs (Database → Logs)
- Verify user_id matches `rickeyhoward3@gmail.com`
- Ensure all customer records exist before migration
- Review browser console for frontend errors

**Quick Health Check:**
```sql
-- Run this to verify everything is working
SELECT 
  'Database Columns' as check_type,
  CASE WHEN COUNT(*) = 5 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM information_schema.columns
WHERE table_name = 'recurring_invoices'
  AND column_name IN ('contract_start_date', 'annual_increase_pct', 
                      'service_days_per_week', 'due_date_offset_days', 'late_fee_pct')

UNION ALL

SELECT 
  'Active Schedules' as check_type,
  CASE WHEN COUNT(*) = 25 THEN '✅ PASS' ELSE '❌ FAIL (' || COUNT(*)::TEXT || ' schedules)' END
FROM recurring_invoices
WHERE is_active = true

UNION ALL

SELECT 
  'Monthly Revenue' as check_type,
  CASE WHEN SUM(amount_cents) = 1749769 THEN '✅ PASS' ELSE '❌ FAIL ($' || (SUM(amount_cents)/100.0)::TEXT || ')' END
FROM recurring_invoices
WHERE is_active = true;
```

**Expected Result:**
```
✅ PASS - Database Columns
✅ PASS - Active Schedules
✅ PASS - Monthly Revenue
```

---

**Status:** Ready for production deployment 🚀
**Go-Live Date:** March 1, 2026 (TOMORROW!)
