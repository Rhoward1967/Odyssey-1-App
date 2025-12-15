# PRODUCTS & SERVICES SYSTEM ANALYSIS

**Date:** December 14, 2025  
**Analysis For:** Rickey Howard - Howard Janitorial Services

---

## CURRENT STATE: WHAT EXISTS

### ✅ Services Defined (Hardcoded in Components)

**Location:** `src/components/CleaningServicesDropdown.tsx`

**Current Implementation:**
- **64+ cleaning services** hardcoded in TypeScript array
- Each service has: `id`, `name`, `category`, `price`, `description`
- Categories: Basic Daily, Restroom, Kitchen, Deep Clean, Specialized
- Prices range: $8 - $200 per service

**Example Services:**
```typescript
{ 
  id: 'vacuum-carpet', 
  name: 'Vacuum All Carpeted Areas', 
  category: 'Basic Daily', 
  price: 25, 
  description: 'Thorough vacuuming...' 
}
{ 
  id: 'toilet-clean', 
  name: 'Clean and Sanitize Toilets', 
  category: 'Restroom', 
  price: 30 
}
{ 
  id: 'restock-supplies', 
  name: 'Restock Paper Products', 
  category: 'Restroom', 
  price: 8 
}
```

**Problem:** Services are NOT stored in database, they're hardcoded. Cannot be managed dynamically.

---

### ✅ Invoice Line Items (JSONB Storage)

**Location:** `src/components/AutomatedInvoicing.tsx`

**Current Structure:**
```typescript
type LineItem = {
  description: string;
  sku?: string;          // SKU field exists but not populated
  quantity: number;
  rate: number;
  amount: number;
  is_taxable: boolean;
};
```

**Invoices Table:**
- Has `line_items` column (JSONB) - stores array of line items
- No link to products/services table (because it doesn't exist)
- User manually types in description, rate for each line item

**Recurring Invoices:**
- Also have `line_items` JSONB column
- Same manual entry problem

---

### ❌ MISSING: Products/Services Database Tables

**What DOES NOT exist:**
1. No `products` table
2. No `services` table  
3. No `service_catalog` table
4. No `product_catalog` table
5. No `supplies` table
6. No link between invoices and products/services

---

## THE PROBLEM

### Your Business Workflow (Current Pain):
1. **Build Cleaning Plan** - You select services from dropdown (CleaningServicesDropdown)
2. **Add Supplies** - You want to add tissue, soap, etc. **BUT NO WAY TO DO THIS**
3. **Create Invoice** - You manually type in each service name and price
4. **Setup Recurring** - You manually type in the same services AGAIN
5. **Add Products** - You want to add new supplies to system **BUT NO DATABASE TO STORE THEM**

### Specific Issues:
- ❌ No product catalog to add tissue, soap, paper towels, etc.
- ❌ Services are hardcoded, can't add new services without editing code
- ❌ Prices are static in code, can't update without developer
- ❌ No SKU tracking for inventory management
- ❌ Can't build "cleaning plans" as reusable templates
- ❌ Every invoice line item typed manually (no autocomplete from catalog)
- ❌ Recurring invoices don't reference product catalog (manual entry every time)

---

## THE SOLUTION: Complete Products/Services System

### Architecture Overview:
```
PRODUCTS/SERVICES CATALOG
          ↓
   CLEANING PLANS
          ↓
    BIDS & ESTIMATES
          ↓
      INVOICES
          ↓
  RECURRING INVOICES
```

---

## DATABASE SCHEMA REQUIRED

### 1. PRODUCTS TABLE (Supplies)
```sql
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Product Info
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    category TEXT, -- 'paper_goods', 'cleaning_supplies', 'equipment', 'chemicals'
    description TEXT,
    
    -- Pricing
    unit_price DECIMAL(10,2) NOT NULL,
    unit_of_measure TEXT DEFAULT 'each', -- 'each', 'case', 'gallon', 'box'
    cost_price DECIMAL(10,2), -- Your cost (for profit tracking)
    
    -- Inventory
    track_inventory BOOLEAN DEFAULT false,
    current_stock INTEGER DEFAULT 0,
    reorder_point INTEGER,
    
    -- Suppliers
    supplier_name TEXT,
    supplier_sku TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_taxable BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_products_user_id ON public.products(user_id);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_active ON public.products(is_active);

-- RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own products"
  ON public.products FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**Example Data:**
- Toilet Paper - 2-ply, 500 sheets, $15.00/case
- Hand Soap - Antibacterial, 1 gallon, $8.50/gallon
- Paper Towels - White, 12 rolls/case, $18.00/case
- Disinfectant Spray - EPA Approved, 32oz, $12.00/bottle

---

### 2. SERVICES TABLE (Labor/Tasks)
```sql
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Service Info
    name TEXT NOT NULL,
    service_code TEXT UNIQUE,
    category TEXT, -- 'daily', 'weekly', 'deep_clean', 'specialized'
    description TEXT,
    
    -- Pricing
    default_rate DECIMAL(10,2) NOT NULL,
    rate_type TEXT DEFAULT 'per_service', -- 'per_service', 'hourly', 'per_sqft'
    estimated_time_minutes INTEGER, -- How long this service takes
    
    -- Requirements
    required_equipment TEXT[], -- Array of equipment needed
    required_supplies TEXT[], -- Array of products needed
    skill_level TEXT, -- 'basic', 'intermediate', 'advanced'
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_taxable BOOLEAN DEFAULT false, -- Most services not taxed
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_services_user_id ON public.services(user_id);
CREATE INDEX idx_services_code ON public.services(service_code);
CREATE INDEX idx_services_category ON public.services(category);
CREATE INDEX idx_services_active ON public.services(is_active);

-- RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own services"
  ON public.services FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**Example Data:**
- Vacuum Carpeted Areas - $25/service, 30 min
- Mop Hard Floors - $20/service, 25 min
- Clean Restrooms - $30/service, 45 min
- Restock Supplies - $8/service, 10 min

---

### 3. CLEANING PLANS TABLE (Reusable Service Bundles)
```sql
CREATE TABLE IF NOT EXISTS public.cleaning_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Plan Info
    plan_name TEXT NOT NULL,
    plan_code TEXT UNIQUE,
    description TEXT,
    
    -- Services & Products (JSONB for flexibility)
    services JSONB NOT NULL DEFAULT '[]'::jsonb, 
    -- [{"service_id": "uuid", "quantity": 1, "rate": 25}]
    
    products JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- [{"product_id": "uuid", "quantity": 2, "unit_price": 15}]
    
    -- Pricing
    total_services_cost DECIMAL(10,2),
    total_products_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    markup_percentage DECIMAL(5,2) DEFAULT 20,
    monthly_price DECIMAL(10,2),
    
    -- Frequency
    service_frequency TEXT, -- 'daily', 'weekly', 'bi-weekly', 'monthly'
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_template BOOLEAN DEFAULT false, -- True = reusable template
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_cleaning_plans_user_id ON public.cleaning_plans(user_id);
CREATE INDEX idx_cleaning_plans_code ON public.cleaning_plans(plan_code);
CREATE INDEX idx_cleaning_plans_template ON public.cleaning_plans(is_template);

-- RLS
ALTER TABLE public.cleaning_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own cleaning plans"
  ON public.cleaning_plans FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**Example Plans:**
- **Office Basic Daily** - Vacuum, Mop, Empty Trash, Restock Supplies + Paper Products
- **Office Deep Clean Monthly** - All daily services + Window Cleaning, Carpet Shampoo, Baseboard Wipe
- **Medical Facility Daily** - Daily services + Disinfection, Specialized Sanitizers, PPE Supplies

---

### 4. LINK TABLES TO INVOICES

**Update invoices table:**
```sql
ALTER TABLE public.invoices
    ADD COLUMN IF NOT EXISTS cleaning_plan_id UUID REFERENCES public.cleaning_plans(id);

-- Function to populate invoice from cleaning plan
CREATE OR REPLACE FUNCTION public.create_invoice_from_plan(
    p_customer_id UUID,
    p_plan_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_plan RECORD;
    v_service RECORD;
    v_product RECORD;
    v_line_items JSONB := '[]'::jsonb;
    v_invoice_id UUID;
BEGIN
    -- Get plan details
    SELECT * INTO v_plan
    FROM public.cleaning_plans
    WHERE id = p_plan_id AND user_id = auth.uid();
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Cleaning plan not found';
    END IF;
    
    -- Build line items from services
    FOR v_service IN 
        SELECT s.*, ps.value->>'quantity' as qty, ps.value->>'rate' as rate
        FROM public.services s,
        jsonb_array_elements(v_plan.services) ps
        WHERE s.id = (ps.value->>'service_id')::UUID
    LOOP
        v_line_items := v_line_items || jsonb_build_object(
            'description', v_service.name,
            'sku', v_service.service_code,
            'quantity', (v_service.qty)::DECIMAL,
            'rate', (v_service.rate)::DECIMAL,
            'amount', (v_service.qty)::DECIMAL * (v_service.rate)::DECIMAL,
            'is_taxable', v_service.is_taxable,
            'type', 'service',
            'service_id', v_service.id
        );
    END LOOP;
    
    -- Build line items from products
    FOR v_product IN 
        SELECT p.*, pp.value->>'quantity' as qty, pp.value->>'unit_price' as price
        FROM public.products p,
        jsonb_array_elements(v_plan.products) pp
        WHERE p.id = (pp.value->>'product_id')::UUID
    LOOP
        v_line_items := v_line_items || jsonb_build_object(
            'description', v_product.name || ' (' || v_product.unit_of_measure || ')',
            'sku', v_product.sku,
            'quantity', (v_product.qty)::DECIMAL,
            'rate', (v_product.price)::DECIMAL,
            'amount', (v_product.qty)::DECIMAL * (v_product.price)::DECIMAL,
            'is_taxable', v_product.is_taxable,
            'type', 'product',
            'product_id', v_product.id
        );
    END LOOP;
    
    -- Create invoice
    INSERT INTO public.invoices (
        user_id,
        customer_id,
        cleaning_plan_id,
        line_items,
        total_amount,
        status
    ) VALUES (
        auth.uid(),
        p_customer_id,
        p_plan_id,
        v_line_items,
        v_plan.monthly_price,
        'draft'
    )
    RETURNING id INTO v_invoice_id;
    
    RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.create_invoice_from_plan(UUID, UUID) TO authenticated;
```

---

## FRONTEND COMPONENTS NEEDED

### 1. Product Catalog Manager
**Location:** `src/components/ProductCatalog.tsx`

**Features:**
- Add/Edit/Delete products
- Search by name, SKU, category
- Bulk import from CSV
- Set pricing, costs, inventory levels
- Categories: Paper Goods, Cleaning Supplies, Equipment, Chemicals

---

### 2. Service Catalog Manager
**Location:** `src/components/ServiceCatalog.tsx`

**Features:**
- Add/Edit/Delete services
- Migrate existing 64 hardcoded services to database
- Set rates, time estimates, requirements
- Categories: Daily, Weekly, Deep Clean, Specialized

---

### 3. Cleaning Plan Builder
**Location:** `src/components/CleaningPlanBuilder.tsx`

**Features:**
- Drag-and-drop services from catalog
- Add products/supplies with quantities
- Calculate total cost
- Set markup/profit margin
- Save as template for reuse
- Preview monthly pricing

---

### 4. Enhanced Invoice Form
**Update:** `src/components/AutomatedInvoicing.tsx`

**New Features:**
- "Load from Cleaning Plan" button
- "Add from Catalog" dropdown (services + products)
- Autocomplete on line item description
- SKU auto-fills from catalog
- Rate pre-populates from catalog
- Track which plan generated this invoice

---

### 5. Recurring Invoice with Plans
**Update:** Recurring invoice form

**New Features:**
- Link to cleaning plan
- Auto-populate line items from plan
- When plan updates, recurring invoices can auto-update
- Supply restocking schedules

---

## COMPLETE WORKFLOW

### Step 1: Setup Products & Services (One Time)
1. Navigate to **Catalog Manager**
2. Add all your cleaning supplies:
   - Toilet paper, paper towels, soap, etc.
   - Set SKUs, prices, suppliers
3. Add all your services:
   - Migrate 64 existing services from code
   - Add custom services you offer

### Step 2: Build Cleaning Plans (Templates)
1. Navigate to **Cleaning Plan Builder**
2. Create "Office Basic Daily":
   - Add services: Vacuum, Mop, Empty Trash, Wipe Surfaces
   - Add products: 1 case toilet paper, 2 rolls paper towels, 1 bottle soap
   - Set frequency: Daily, Mon-Fri
   - Calculate monthly cost: $850
3. Save as template

### Step 3: Bid with Cleaning Plan
1. Navigate to **Bidding Calculator**
2. Select customer
3. **NEW:** "Choose Cleaning Plan" dropdown
4. Select "Office Basic Daily"
5. System auto-fills:
   - All services with prices
   - All products with quantities
   - Total monthly cost
6. Save bid linked to plan

### Step 4: Convert Bid → Invoice
1. Customer accepts bid
2. Click "Convert to Invoice"
3. Invoice auto-populated with services + products from plan
4. Send invoice

### Step 5: Setup Recurring Billing
1. From invoice, click "Make Recurring"
2. Frequency: Monthly
3. System links to original cleaning plan
4. Every month, auto-generates invoice with same services + products
5. If you update product prices in catalog, future invoices reflect new prices

---

## BENEFITS OF THIS SYSTEM

### For You (Business Owner):
✅ **Add products once, use everywhere** - No more retyping toilet paper prices  
✅ **Update prices globally** - Change soap price in catalog, all future invoices updated  
✅ **Build plans quickly** - Drag-and-drop instead of manual entry  
✅ **Track inventory** - Know when to reorder supplies  
✅ **Profit tracking** - See cost vs. selling price for every product  
✅ **SKU management** - Professional tracking like big companies  

### For Your Workflow:
✅ **Faster bids** - Select plan instead of building from scratch  
✅ **Consistent pricing** - No mistakes typing prices manually  
✅ **Recurring invoices easy** - Plans auto-populate recurring billing  
✅ **Upselling** - "Add carpet cleaning to your plan for only $75/month"  
✅ **Seasonal services** - Add winter salt/de-icer products in December  

### For Your Clients:
✅ **Clear itemization** - See exactly what services + products they're paying for  
✅ **SKU tracking** - Professional invoices with product codes  
✅ **Consistent service** - Same plan every month, predictable  

---

## MIGRATION STRATEGY

### Phase 1: Database Setup (Supabase Team)
1. Create `products` table
2. Create `services` table
3. Create `cleaning_plans` table
4. Create helper functions

### Phase 2: Data Migration (Frontend)
1. Export 64 hardcoded services from `CleaningServicesDropdown.tsx`
2. Bulk insert into `services` table
3. Add your common products (tissue, soap, etc.) to `products` table

### Phase 3: UI Development (Frontend)
1. Build Product Catalog Manager
2. Build Service Catalog Manager
3. Build Cleaning Plan Builder
4. Update Invoice form to use catalog
5. Update Recurring Invoices to link plans

### Phase 4: Integration
1. Update BiddingCalculator to use plans
2. Link bids → estimates → invoices → recurring through plans
3. Add "Load from Plan" buttons everywhere

---

## IMMEDIATE NEXT STEPS

**I recommend:**

1. **Supabase team creates 3 tables** (products, services, cleaning_plans)
2. **I build Product Catalog Manager UI** (so you can start adding supplies)
3. **I migrate existing 64 services to database**
4. **I build Cleaning Plan Builder**
5. **I update Invoice form to use catalog**

**After that, you can:**
- Add all your supplies with prices
- Build reusable cleaning plans
- Link plans to recurring invoices
- Stop typing same items over and over

---

## QUESTIONS FOR YOU

1. **How many products/supplies do you typically use?** (10? 50? 100?)
2. **Do you track inventory or just pricing?** 
3. **Do you need to track multiple suppliers?** (e.g., "I buy soap from 3 vendors")
4. **Do you charge different prices to different clients?** (If yes, need customer-specific pricing)
5. **Do you bundle services into packages?** (e.g., "Gold Package" = All services + premium supplies)
6. **How often do prices change?** (Monthly? Quarterly?)

---

**Ready to build this system? Respond with your answers and I'll start implementation!**
