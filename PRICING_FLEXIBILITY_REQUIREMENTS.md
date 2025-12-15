# PRICING FLEXIBILITY & SUPPLY BILLING REQUIREMENTS

**Date:** December 14, 2025  
**For:** Rickey Howard - Critical Business Requirements

---

## 🎯 YOUR SPECIFIC NEEDS

### 1. MODIFY PRICING ANYTIME
**Requirement:** You must be able to change prices whenever you want, without developer help.

**Solution:**
- ✅ Products table with `unit_price` column (you update directly)
- ✅ Services table with `default_rate` column (you update directly)
- ✅ Price History tracking (see what price was on specific date)
- ✅ "Override Price" option on invoices (one-time custom pricing)
- ✅ Global price update UI (change once, affects all future invoices)

**Important:** 
- Past invoices keep OLD prices (historical accuracy)
- Future invoices use NEW prices (automatic)
- Recurring invoices can be set to "lock price" or "use current catalog price"

---

### 2. SUPPLIES IN RECURRING BILLING
**Requirement:** When customer gets supplies, they're billed automatically every month/quarter.

**Solution:**
```
CUSTOMER → CLEANING PLAN → RECURRING INVOICE
     ↓            ↓                ↓
 Supplies?   [Products]    Auto-bills supplies
              Included        every billing cycle
```

**Example:**
- Client ABC has "Office Daily Clean" plan
- Plan includes: 1 case toilet paper, 2 bottles soap, 1 case paper towels
- Every month, recurring invoice auto-generates with:
  - Services: Vacuum, Mop, Clean restrooms ($500)
  - **Supplies: Toilet paper ($15), Soap ($17), Paper towels ($18)**
  - Total: $550/month

**Critical Feature:** If you update toilet paper price from $15 → $18 in catalog:
- Option A: Recurring invoice uses NEW price ($18) next month
- Option B: Recurring invoice "locks" price at $15 (you choose)

---

## 📋 BACKEND REQUIREMENTS FOR SUPABASE TEAM

### PRODUCTS TABLE - Add Price Management
```sql
CREATE TABLE IF NOT EXISTS public.products (
    -- ... existing columns ...
    
    -- PRICING (CRITICAL FOR RICKEY)
    unit_price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2), -- Your cost
    
    -- PRICE FLEXIBILITY
    price_last_updated TIMESTAMPTZ DEFAULT now(),
    price_updated_by UUID REFERENCES auth.users(id),
    
    -- For historical tracking
    allow_price_override BOOLEAN DEFAULT true,
    
    -- ... rest of columns ...
);

-- Price History Table (Track all price changes)
CREATE TABLE IF NOT EXISTS public.product_price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    
    old_price DECIMAL(10,2) NOT NULL,
    new_price DECIMAL(10,2) NOT NULL,
    change_reason TEXT,
    
    effective_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger to log price changes
CREATE OR REPLACE FUNCTION log_product_price_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.unit_price != NEW.unit_price THEN
        INSERT INTO public.product_price_history (
            product_id,
            user_id,
            old_price,
            new_price,
            effective_date
        ) VALUES (
            NEW.id,
            auth.uid(),
            OLD.unit_price,
            NEW.unit_price,
            CURRENT_DATE
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_log_product_price_change
    AFTER UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION log_product_price_change();
```

---

### SERVICES TABLE - Add Price Management
```sql
CREATE TABLE IF NOT EXISTS public.services (
    -- ... existing columns ...
    
    -- PRICING (CRITICAL FOR RICKEY)
    default_rate DECIMAL(10,2) NOT NULL,
    
    -- PRICE FLEXIBILITY
    rate_last_updated TIMESTAMPTZ DEFAULT now(),
    rate_updated_by UUID REFERENCES auth.users(id),
    allow_rate_override BOOLEAN DEFAULT true,
    
    -- ... rest of columns ...
);

-- Similar price history for services
CREATE TABLE IF NOT EXISTS public.service_price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    
    old_rate DECIMAL(10,2) NOT NULL,
    new_rate DECIMAL(10,2) NOT NULL,
    change_reason TEXT,
    
    effective_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### RECURRING INVOICES - Supply Billing Integration
```sql
ALTER TABLE public.recurring_invoices
    ADD COLUMN IF NOT EXISTS cleaning_plan_id UUID REFERENCES public.cleaning_plans(id),
    ADD COLUMN IF NOT EXISTS use_current_prices BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS locked_line_items JSONB; -- If false, stores snapshot

-- Function to generate recurring invoice with supplies
CREATE OR REPLACE FUNCTION public.generate_invoice_from_recurring()
RETURNS void AS $$
DECLARE
    recurring_record RECORD;
    line_items_current JSONB;
    service_item RECORD;
    product_item RECORD;
    new_line_items JSONB := '[]'::jsonb;
BEGIN
    FOR recurring_record IN
        SELECT * FROM public.recurring_invoices
        WHERE is_active = true
          AND next_invoice_date <= CURRENT_DATE
          AND user_id = auth.uid()
    LOOP
        -- If using current prices, rebuild line items from catalog
        IF recurring_record.use_current_prices AND recurring_record.cleaning_plan_id IS NOT NULL THEN
            
            -- Get cleaning plan
            SELECT services, products INTO line_items_current
            FROM public.cleaning_plans
            WHERE id = recurring_record.cleaning_plan_id;
            
            -- Build line items from CURRENT catalog prices (services)
            FOR service_item IN
                SELECT s.*, ps.value->>'quantity' as qty
                FROM public.services s,
                jsonb_array_elements(line_items_current->'services') ps
                WHERE s.id = (ps.value->>'service_id')::UUID
            LOOP
                new_line_items := new_line_items || jsonb_build_object(
                    'description', service_item.name,
                    'sku', service_item.service_code,
                    'quantity', (service_item.qty)::DECIMAL,
                    'rate', service_item.default_rate, -- CURRENT PRICE FROM CATALOG
                    'amount', (service_item.qty)::DECIMAL * service_item.default_rate,
                    'is_taxable', service_item.is_taxable,
                    'type', 'service'
                );
            END LOOP;
            
            -- Build line items from CURRENT catalog prices (products/supplies)
            FOR product_item IN
                SELECT p.*, pp.value->>'quantity' as qty
                FROM public.products p,
                jsonb_array_elements(line_items_current->'products') pp
                WHERE p.id = (pp.value->>'product_id')::UUID
            LOOP
                new_line_items := new_line_items || jsonb_build_object(
                    'description', product_item.name || ' (' || product_item.unit_of_measure || ')',
                    'sku', product_item.sku,
                    'quantity', (product_item.qty)::DECIMAL,
                    'rate', product_item.unit_price, -- CURRENT PRICE FROM CATALOG
                    'amount', (product_item.qty)::DECIMAL * product_item.unit_price,
                    'is_taxable', product_item.is_taxable,
                    'type', 'product'
                );
            END LOOP;
            
            -- Use newly calculated line items
            line_items_current := new_line_items;
            
        ELSE
            -- Use locked/stored line items (prices don't change)
            line_items_current := COALESCE(recurring_record.locked_line_items, recurring_record.line_items);
        END IF;
        
        -- Create invoice with current or locked prices
        INSERT INTO public.invoices (
            user_id,
            customer_id,
            recurring_invoice_id,
            cleaning_plan_id,
            line_items,
            total_amount,
            tax_rate,
            status,
            issue_date,
            due_date,
            notes
        ) VALUES (
            recurring_record.user_id,
            recurring_record.customer_id,
            recurring_record.id,
            recurring_record.cleaning_plan_id,
            line_items_current,
            (SELECT SUM((item.value->>'amount')::DECIMAL) FROM jsonb_array_elements(line_items_current) item),
            recurring_record.tax_rate,
            'draft',
            CURRENT_DATE,
            CURRENT_DATE + INTERVAL '30 days',
            'Auto-generated from recurring invoice'
        );
        
        -- Update next invoice date
        UPDATE public.recurring_invoices
        SET 
            next_invoice_date = CASE recurring_record.frequency
                WHEN 'monthly' THEN next_invoice_date + INTERVAL '1 month'
                WHEN 'quarterly' THEN next_invoice_date + INTERVAL '3 months'
                WHEN 'annual' THEN next_invoice_date + INTERVAL '1 year'
            END,
            updated_at = now()
        WHERE id = recurring_record.id;
        
        -- Deactivate if end date passed
        IF recurring_record.end_date IS NOT NULL AND CURRENT_DATE >= recurring_record.end_date THEN
            UPDATE public.recurring_invoices
            SET is_active = false, updated_at = now()
            WHERE id = recurring_record.id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🎨 FRONTEND COMPONENTS NEEDED

### 1. Price Management Dashboard
**Component:** `src/components/PriceManagement.tsx`

**Features:**
- Search products/services by name
- Click "Edit Price" button
- Update price instantly
- See price history (when was it changed)
- Bulk price update (increase all supplies by 10%)

**UI Mockup:**
```
┌─────────────────────────────────────────┐
│ PRICE MANAGEMENT                        │
├─────────────────────────────────────────┤
│ Search: [toilet paper          ] 🔍     │
│                                         │
│ PRODUCTS                                │
│ ┌─────────────────────────────────────┐ │
│ │ Toilet Paper - 2ply         $15.00  │ │
│ │ SKU: TP-500   Last: 2025-12-01      │ │
│ │ [Edit Price] [Price History]        │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Hand Soap - 1gal            $8.50   │ │
│ │ SKU: SOAP-32  Last: 2025-11-15      │ │
│ │ [Edit Price] [Price History]        │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ SERVICES                                │
│ ┌─────────────────────────────────────┐ │
│ │ Vacuum Carpets              $25.00  │ │
│ │ Code: SVC-001 Last: 2025-10-01      │ │
│ │ [Edit Price] [Price History]        │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

### 2. Recurring Invoice Price Settings
**Update:** `src/components/AutomatedInvoicing.tsx` → Recurring form

**Add Toggle:**
```
┌─────────────────────────────────────────┐
│ RECURRING INVOICE SETUP                 │
├─────────────────────────────────────────┤
│ Customer: ABC Corp                      │
│ Frequency: ○ Monthly ○ Quarterly        │
│ Start Date: 2025-01-01                  │
│                                         │
│ PRICING OPTIONS:                        │
│ ○ Use Current Catalog Prices            │
│   ✓ Supplies auto-update with catalog  │
│   ✓ Price changes apply automatically   │
│                                         │
│ ○ Lock Prices (Don't Auto-Update)      │
│   Prices stay same as today ($550)      │
│   Won't change even if catalog updates  │
│                                         │
│ LINE ITEMS:                             │
│ - Vacuum Service         $25.00         │
│ - Mop Floors             $20.00         │
│ - Toilet Paper (1 case)  $15.00 📦      │
│ - Hand Soap (2 bottles)  $17.00 📦      │
│                                         │
│ Total: $77.00/month                     │
│ [Save Recurring Invoice]                │
└─────────────────────────────────────────┘
```

---

### 3. Cleaning Plan with Supplies
**Update:** Cleaning Plan Builder

**Add Product Section:**
```
┌─────────────────────────────────────────┐
│ CLEANING PLAN BUILDER                   │
├─────────────────────────────────────────┤
│ Plan Name: Office Basic Daily           │
│                                         │
│ SERVICES (drag to add):                 │
│ ✓ Vacuum Carpets      $25.00            │
│ ✓ Mop Floors          $20.00            │
│ ✓ Clean Restrooms     $30.00            │
│                                         │
│ SUPPLIES (click to add): 📦             │
│ ✓ Toilet Paper (1)    $15.00            │
│   [+][-] Quantity: 1 case               │
│                                         │
│ ✓ Hand Soap (2)       $8.50 each        │
│   [+][-] Quantity: 2 bottles            │
│                                         │
│ ✓ Paper Towels (1)    $18.00            │
│   [+][-] Quantity: 1 case               │
│                                         │
│ [+ Add More Supplies]                   │
│                                         │
│ TOTAL COST PER SERVICE:                 │
│ Services: $75.00                        │
│ Supplies: $50.00 📦                     │
│ ─────────────────                       │
│ Total:    $125.00                       │
│                                         │
│ Monthly (4 visits): $500.00             │
│                                         │
│ [Save Plan as Template]                 │
└─────────────────────────────────────────┘
```

---

## 🔄 COMPLETE WORKFLOW WITH SUPPLIES

### Setup Phase (One Time):
1. **Add Products to Catalog**
   - Go to Product Catalog Manager
   - Add: Toilet Paper ($15), Soap ($8.50), Paper Towels ($18)
   - Set SKUs, units of measure

2. **Create Cleaning Plan with Supplies**
   - Go to Cleaning Plan Builder
   - Add services: Vacuum, Mop, Clean
   - **Add supplies: 1 case toilet paper, 2 bottles soap**
   - Save as "Office Basic + Supplies"

### Bidding Phase:
3. **Create Bid**
   - Select customer
   - Choose "Office Basic + Supplies" plan
   - System shows: Services $75 + Supplies $50 = $125/visit
   - Monthly (4 visits): $500
   - Save bid

### Invoice Phase:
4. **Convert to Recurring Invoice**
   - Customer accepts bid
   - Click "Setup Recurring Billing"
   - **Choose: "Use Current Catalog Prices"** ← This is KEY
   - System creates recurring invoice with supplies

### Automatic Billing:
5. **Every Month**
   - System auto-generates invoice
   - If toilet paper still $15 → charges $15
   - **If you changed toilet paper to $18 → charges $18** (auto-updates)
   - Supplies always billed with services

### Price Change:
6. **You Update Prices Anytime**
   - Go to Price Management
   - Find "Toilet Paper"
   - Change $15 → $18
   - Click Save
   - **All future invoices use $18**
   - Past invoices still show $15 (historical accuracy)

---

## ⚠️ CRITICAL DECISIONS FOR YOU

### Decision 1: Recurring Invoice Price Behavior
**When you update product price in catalog, should recurring invoices:**

**Option A: Auto-Update (Recommended)**
- Pro: You change price once, all clients get new price
- Pro: Reflects current costs (if your supplier raises prices)
- Con: Client sees price change month-to-month

**Option B: Lock Prices**
- Pro: Client always pays same amount (predictable)
- Con: If toilet paper cost goes up, you lose money
- Con: Must manually update each client's recurring invoice

**Your Choice?** _______________

---

### Decision 2: Supply Restocking Frequency
**How often should supplies be billed?**

- Same as service frequency (daily plan = daily supply delivery?)
- Monthly regardless of service frequency?
- Custom per product (toilet paper monthly, soap quarterly)?

**Your Choice?** _______________

---

### Decision 3: Inventory Tracking
**Do you want to track how many supplies you have in stock?**

- Yes: System deducts from inventory when invoiced
- No: Just pricing, no inventory management

**Your Choice?** _______________

---

## 📊 EXAMPLE SCENARIOS

### Scenario 1: Price Increase
**Today:**
- Toilet paper: $15/case
- ABC Corp recurring invoice: $500/month (includes toilet paper)

**Next Month:**
- You update toilet paper: $18/case (+$3)
- ABC Corp next invoice: $503/month (auto-updates)

**Result:** ✅ You don't lose money on price increases

---

### Scenario 2: Customer Gets Supplies Mid-Contract
**Situation:**
- Customer XYZ has cleaning plan (no supplies)
- They call: "Can we add supplies to our plan?"

**Solution:**
1. Go to their Cleaning Plan
2. Click "Edit Plan"
3. Add supplies: Toilet paper, soap
4. Save
5. Next recurring invoice includes supplies automatically

**Result:** ✅ Easy to add/remove supplies anytime

---

### Scenario 3: Seasonal Supply Changes
**Winter:**
- Add: Ice melt, salt, heavy-duty mats

**Summer:**
- Remove winter supplies
- Add: Outdoor cleaning products

**Solution:** Update cleaning plan, recurring invoices auto-adjust

---

## 🚀 IMPLEMENTATION PRIORITY

### Phase 1: Core Tables (Supabase - NOW)
- Products table with pricing
- Services table with rates
- Price history tables
- Cleaning plans table

### Phase 2: Price Management UI (Frontend - After backend ready)
- Product Catalog Manager
- Service Catalog Manager
- Price editing interface

### Phase 3: Plan Builder (Frontend)
- Cleaning Plan Builder with supply selection
- Drag-and-drop services
- Add supplies with quantities

### Phase 4: Recurring Integration (Frontend + Backend)
- Update recurring invoice form
- Add "use current prices" toggle
- Link to cleaning plans
- Auto-generate with supplies

---

## ✅ SUCCESS METRICS

**You'll know it's working when:**
1. ✅ You can change toilet paper price in 5 seconds
2. ✅ Next month, all clients auto-billed with new price
3. ✅ Recurring invoices include supplies automatically
4. ✅ You add new supply to catalog, appears in plan builder
5. ✅ Customer wants supplies? Add to plan, done.

---

**Waiting for Supabase response to begin implementation!**
