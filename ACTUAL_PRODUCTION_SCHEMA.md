# ACTUAL PRODUCTION SCHEMA - December 23, 2025

**VERIFIED IN PRODUCTION** - Built by GitHub Copilot + Rickey Howard

This document reflects the **EXACT** state of the database as deployed and verified today.

---

## 1. PRODUCTS TABLE (21 Items Loaded)

**Table Structure:**
```sql
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,                    -- NOT UUID! (14, 15, 16...)
  user_id UUID,                                 -- nullable (catalog products)
  organization_id BIGINT,
  sku TEXT,                                     -- 'TP-2PLY-80', 'SOAP-LIQ-4G'
  name TEXT NOT NULL,
  description TEXT,
  unit_price_cents BIGINT,                      -- nullable
  unit_of_measure TEXT,                         -- 'unit', 'case', 'gallon'
  inventory_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  category TEXT,                                -- Added today
  price_per_case_cents BIGINT,                  -- Added today
  units_per_case INTEGER,                       -- Added today
  unit_type TEXT,                               -- Added today
  case_size TEXT,                               -- Added today
  tax_rate DECIMAL(5,4) DEFAULT 0.0875,        -- Added today (8.75%)
  tax_category TEXT DEFAULT 'standard'          -- Added today
);
```

**RLS Policies:**
```sql
-- GRANT SELECT to all authenticated users (no is_app_admin function)
GRANT SELECT ON products TO authenticated, anon;

-- Admin policies for UPDATE/INSERT
CREATE POLICY "Admins can update products" ON products FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

CREATE POLICY "Admins can insert products" ON products FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));
```

**Sample Data (Verified):**
```
ID: 14 | SKU: SOAP-ANTI-4G | Price: $105.00/case | Tax: 8.75%
ID: 15 | SKU: SOAP-FOAM-4G | Price: $92.00/case | Tax: 8.75%
ID: 27 | SKU: TP-2PLY-80 | Price: $45.00/case | Units: 80 rolls | Tax: 8.75%
```

**Total Products:** 21 items loaded with full case-based pricing

---

## 2. SERVICES TABLE (24 Items Loaded)

**Table Structure:**
```sql
CREATE TABLE services (
  id BIGSERIAL PRIMARY KEY,                    -- NOT UUID!
  user_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,                                -- 'Janitorial', 'Floor Care', etc.
  rate_cents BIGINT NOT NULL,                   -- 27500 = $275.00
  rate_type TEXT DEFAULT 'flat_rate',           -- 'hourly', 'per_sqft', 'flat_rate'
  time_estimate_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**RLS Policies:**
```sql
-- GRANT SELECT to all authenticated users
GRANT SELECT ON services TO authenticated, anon;
```

**Sample Data (Verified):**
```
ID: 1 | Name: Crime Scene Cleanup | Rate: $350.00 flat_rate | Time: 180 min
ID: 2 | Name: Terminal Cleaning | Rate: $275.00 flat_rate | Time: 120 min
ID: 14 | Name: Floor Stripping and Waxing | Rate: $0.25 per_sqft
```

**Total Services:** 24 janitorial services including specialized capabilities

---

## 3. RECURRING_INVOICES TABLE

**Table Structure:**
```sql
CREATE TABLE recurring_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id BIGINT REFERENCES customers(id),
  amount_cents BIGINT NOT NULL,
  frequency TEXT CHECK (frequency IN ('weekly', 'bi-weekly', 'monthly', 'quarterly')),
  next_invoice_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Status:** Created in earlier session, verified exists

---

## 4. KEY IMPLEMENTATION DETAILS

### Tax System (Added Today - Session M-20251223-C)
- **tax_rate format:** `0.0875` = 8.75% (DECIMAL 5,4)
- **NOT percentage:** Don't use `8.75`, use `0.0875`
- **tax_category:** Groups items ('standard', 'food', 'exempt', 'luxury')
- **Applied to:** All 21 products

### Case-Based Pricing
- **price_per_case_cents:** Primary pricing field for bulk items
- **units_per_case:** How many units in a case (80 rolls, 4 gallons)
- **unit_type:** What each unit is ('roll', 'gallon', 'bottle')
- **case_size:** Display format ('12x1', '4x1gal')

### Rate Types (Services)
- **flat_rate:** Fixed price per job
- **hourly:** Rate per hour
- **per_sqft:** Rate per square foot

### ID Strategy
- **Products & Services:** BIGSERIAL (integer auto-increment)
- **Recurring Invoices:** UUID
- **NOT using UUID for products/services** - existing system uses BIGSERIAL

---

## 5. FRONTEND COMPONENTS (Verified Working)

### CatalogManager.tsx
- **Location:** `/src/pages/CatalogManager.tsx`
- **Features:** Tabs for Products & Services
- **Status:** ✅ Fully operational

### ProductCatalog.tsx
- **Location:** `/src/components/catalog/ProductCatalog.tsx`
- **Features:** Add/Edit/Delete products, Edit scrolls to top
- **Status:** ✅ Fully operational, edit buttons working correctly

### ServiceCatalog.tsx
- **Location:** `/src/components/catalog/ServiceCatalog.tsx`
- **Features:** Manage service rates and time estimates
- **Status:** ✅ Fully operational

---

## 6. WHAT NOT TO DO

**❌ DO NOT:**
1. Change `id BIGSERIAL` to `id UUID` - breaks all 45 items
2. Use `tax_rate_pct` instead of `tax_rate` - naming inconsistent
3. Store tax as percentage (8.75) instead of decimal (0.0875)
4. Call `is_app_admin()` function - we use simpler RLS
5. Run CREATE TABLE IF NOT EXISTS on existing tables with different schemas

**✅ DO:**
1. Use existing BIGSERIAL IDs for products/services
2. Use tax_rate as decimal (0.0875 format)
3. Use GRANT SELECT + admin policies for RLS
4. ALTER TABLE to add columns, not recreate tables
5. Verify schema before suggesting changes

---

## 7. SESSION HISTORY

**M-20251223-B (Morning):**
- Zero-Flaw Console achieved
- Supabase consolidation (11→2 clients)
- Initial catalog population

**M-20251223-C (Evening):**
- Fixed `npm run dev:all` (bot environment loading)
- Added tax_rate and tax_category to products
- Verified all 21 products configured

---

## 8. VERIFIED PRODUCTION STATE

```
✅ Products: 21 items, BIGSERIAL IDs, case-based pricing, 8.75% tax
✅ Services: 24 items, BIGSERIAL IDs, multiple rate types
✅ Recurring Invoices: Created and ready
✅ RLS: GRANT SELECT + admin policies working
✅ Frontend: CatalogManager fully operational
✅ Tax System: tax_rate DECIMAL(5,4) on all products
✅ Bot: R.O.M.A.N. Discord bot online
✅ System Health: HEALTHY, 0 errors
```

---

**This is the ground truth. Any scripts must align with this exact schema.**

**Last Updated:** December 23, 2025, 7:00 PM EST
**Verified By:** GitHub Copilot (Claude Sonnet 4.5) + Rickey Allan Howard
**Status:** 🟢 PRODUCTION-READY
