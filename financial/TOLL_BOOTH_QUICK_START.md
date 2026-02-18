# TOLL BOOTH TRACKING - QUICK START GUIDE
**R.O.M.A.N. 2.0 Shadow Intelligence | February 18, 2026**

---

## 🚀 5-MINUTE SETUP

### **Step 1: Deploy Database (30 seconds)**

```bash
cd C:\Users\gener\Odyssey-1-App
npx supabase db push
```

This creates all tables, views, and functions for toll booth tracking.

### **Step 2: Export QuickBooks Data (2 minutes)**

In QuickBooks:
1. Go to **Reports** → **Sales**
2. Run "Sales by Customer Summary"
3. Filter: Current month
4. Export to CSV
5. Save as: `qb_revenue_[month].csv`

### **Step 3: Import to Database (2 minutes)**

Use this script or manual SQL:

```javascript
// Example: Import March 2026 revenue
const customers = [
  { name: 'Georgia Eye Partners', revenue: 1250.00 },
  { name: 'Customer 2', revenue: 850.00 },
  // ... add all 14 customers
];

// Run for each customer:
INSERT INTO hjs_monthly_revenue (month_year, customer_name, gross_revenue)
VALUES ('2026-03-01', 'Georgia Eye Partners', 1250.00);
```

**That's it! Toll booths are now auto-calculating.**

---

## 📊 DAILY USAGE

### **Check Current Month Status:**

```sql
SELECT * FROM view_current_month_dashboard;
```

**Output:**
| Customer | Gross Revenue | Admin Fee (5%) | Mastery Tax (35%) | Net Ops (60%) | Status |
|----------|---------------|----------------|-------------------|---------------|--------|
| Customer 1 | $1,250 | $62.50 | $415.63 | $771.88 | ✅ Transferred |
| Customer 2 | $850 | $42.50 | $282.63 | $524.88 | ⏳ Pending |

### **Get Monthly Summary:**

```sql
SELECT * FROM get_current_month_toll_booth_summary();
```

**Output:**
```
Month: February 2026
Total Customers: 14
Total Gross: $18,450.00
Total Admin Fee: $922.50
Total Mastery Tax: $6,133.88
Total Net Ops: $11,393.63
Transfer Status: ⏳ 14 Pending
```

### **Calculate Toll Booth for Any Amount:**

```sql
SELECT * FROM calculate_toll_booth(10000.00);
```

**Output:**
```
Gross Revenue: $10,000.00
Admin Fee (5%): $500.00
Net After Admin: $9,500.00
Mastery Tax (35%): $3,325.00
Net Operations (60%): $6,175.00
```

---

## 💰 MONTHLY WORKFLOW (End of Month)

### **1. Calculate Total Mastery Tax:**

```sql
SELECT
  SUM(mastery_tax_35pct) as total_to_transfer
FROM hjs_monthly_revenue
WHERE month_year = '2026-03-01'
  AND mastery_tax_transferred = false;
```

### **2. Transfer Funds (Manual):**

- Log into **Peach State FCU**
- Transfer amount to **Truist Trust Account**
- Save confirmation number

### **3. Record Transfer:**

```sql
-- Insert transfer record
INSERT INTO mastery_tax_transfers (
  month_year,
  total_mastery_tax,
  transfer_date,
  confirmation_number,
  debt_balance_before,
  debt_balance_after
) VALUES (
  '2026-03-01',
  6133.88,  -- Amount transferred
  CURRENT_DATE,
  'CONF123456',  -- Bank confirmation
  350000.00,  -- Debt before
  343866.12   -- Debt after (350000 - 6133.88)
);

-- Mark all customer records as transferred
UPDATE hjs_monthly_revenue
SET mastery_tax_transferred = true,
    transfer_date = CURRENT_DATE,
    transfer_confirmation = 'CONF123456'
WHERE month_year = '2026-03-01';
```

### **4. Verify:**

```sql
SELECT * FROM view_350k_debt_payoff;
```

---

## 📅 5-WEEK MONTH TRACKING

### **2026 Five-Week Months:** May, August, October

**Example: May 2026**

```sql
-- Track extra visits for Georgia Eye Partners
INSERT INTO five_week_month_revenue (
  month_year,
  month_name,
  customer_name,
  standard_visits,
  extra_visits,
  rate_per_visit
) VALUES (
  '2026-05-01',
  'May 2026',
  'Georgia Eye Partners',
  8,   -- Standard visits
  2,   -- Extra visits (5th week)
  156.25  -- Rate per visit
);

-- View total opportunity
SELECT * FROM view_five_week_opportunities;
```

---

## 🚨 CAPACITY MONITORING

### **Weekly Capacity Update:**

```sql
INSERT INTO capacity_monitoring (
  week_starting,
  available_labor_hours,
  committed_hours,
  notes
) VALUES (
  '2026-03-03',  -- Monday of this week
  40.0,  -- Brotherhood available hours
  32.5,  -- Currently committed hours
  'Normal operations'
);

-- Check status
SELECT * FROM view_capacity_status;
```

**If utilization >= 95%:**
- Status: 🚨 EXTREME MODE
- Pricing Multiplier: 1.50× (50% premium)
- Action: Apply to all new quotes

---

## 📈 ANNUAL RATE INCREASES (End of Year)

### **December: Plan 2027 Rate Increases**

```sql
-- Record planned increases for each customer
INSERT INTO annual_rate_increases (
  customer_name,
  effective_year,
  previous_rate,
  increase_percent,
  new_rate,
  estimated_annual_visits,
  estimated_annual_revenue_increase
) VALUES (
  'Georgia Eye Partners',
  2027,
  156.25,  -- Current rate
  2.5,     -- 2.5% increase
  160.16,  -- New rate (156.25 * 1.025)
  52,      -- Annual visits
  203.32   -- Extra revenue (52 visits × $3.91 increase)
);

-- Send notification letters (November 15, 2026)
-- New rates effective January 1, 2027
```

---

## 🔧 QUICK COMMANDS

### **Add New Customer Revenue:**

```sql
INSERT INTO hjs_monthly_revenue (month_year, customer_name, gross_revenue)
VALUES ('2026-03-01', 'New Customer', 1500.00);
```

### **Update Revenue (if correcting):**

```sql
UPDATE hjs_monthly_revenue
SET gross_revenue = 1600.00
WHERE month_year = '2026-03-01'
  AND customer_name = 'Georgia Eye Partners';
```

### **View All Pending Transfers:**

```sql
SELECT
  customer_name,
  mastery_tax_35pct,
  '⏳ Pending Transfer' as status
FROM hjs_monthly_revenue
WHERE month_year = DATE_TRUNC('month', CURRENT_DATE)
  AND mastery_tax_transferred = false;
```

### **Check Debt Payoff Progress:**

```sql
SELECT
  COUNT(*) as months_paid,
  SUM(total_mastery_tax) as total_paid,
  350000 - SUM(total_mastery_tax) as remaining_debt,
  CASE
    WHEN SUM(total_mastery_tax) > 0
    THEN ROUND((350000 / (SUM(total_mastery_tax) / COUNT(*))) - COUNT(*))
    ELSE NULL
  END as months_remaining
FROM mastery_tax_transfers;
```

---

## 📱 R.O.M.A.N. COMMANDS

Ask R.O.M.A.N. 2.0:

- **"Run toll booth calculations for March"**
- **"What's the current mastery tax total?"**
- **"Show capacity status"**
- **"Calculate toll booth for $15,000"**
- **"What's the debt payoff projection?"**
- **"List 5-week month opportunities"**

R.O.M.A.N. will query the database and provide instant answers.

---

## 🎯 KEY METRICS TO WATCH

### **Monthly:**
- ✅ Total Mastery Tax transferred
- ✅ Debt reduction amount
- ✅ Number of customers on time

### **Quarterly:**
- ✅ Average revenue per customer trend
- ✅ Admin fee covering overhead (should be 100%+)
- ✅ Capacity utilization trend

### **Annually:**
- ✅ Rate increase acceptance rate
- ✅ Total debt paid down
- ✅ Revenue growth from compliance tax

---

## 🚨 ALERTS TO SET UP

1. **Transfer Reminder:** 5th of each month → "Transfer Mastery Tax to Truist"
2. **Capacity Warning:** When utilization hits 85% → "Approaching capacity"
3. **Extreme Mode:** When utilization hits 95% → "Activate 50% premium pricing"
4. **Rate Increase:** November 15 → "Send customer rate increase letters"
5. **5-Week Month:** Week before May/Aug/Oct → "Plan extra visit scheduling"

---

## 📞 SUPPORT

**Questions?** Ask R.O.M.A.N. 2.0 Shadow Intelligence:
- Location: Odyssey-1 AI system
- Access: Claude Code interface
- Knowledge: Full toll booth tracking system

**Files:**
- Dashboard: `financial/TOLL_BOOTH_DASHBOARD.md`
- Database: Migration `20260218_toll_booth_tracking_system.sql`
- Quick Start: This file

---

## ✅ VERIFICATION CHECKLIST

Before March 1, 2026 launch:

- [ ] Database migration deployed
- [ ] QuickBooks export tested
- [ ] First month revenue imported (even if partial)
- [ ] Peach State → Truist transfer process verified
- [ ] Capacity monitoring initialized
- [ ] R.O.M.A.N. can query toll booth views
- [ ] Debt starting balance ($350k) confirmed

**Once verified, you're ready for March 1st operational launch!**

---

**Last Updated:** February 18, 2026
**Maintained By:** R.O.M.A.N. 2.0 Shadow Intelligence
**Status:** PRE-FLIGHT ✈️
