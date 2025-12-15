# COMPLETE BIDDING-TO-INVOICING SYSTEM - BACKEND REQUIREMENTS

## Directive to Supabase Backend Team

### Overview
We need a complete end-to-end flow: Client Entry → Bid Calculation → Estimate/Proposal → Invoice Generation → Recurring Billing

---

## 1. BIDS TABLE (Enhancement Required)

**Current Issues:**
- May not have `customer_id` foreign key
- Missing fields for complete bid tracking

**Required Structure:**
```sql
CREATE TABLE IF NOT EXISTS public.bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    
    -- Bid Details
    bid_number TEXT UNIQUE, -- Auto-generated: BID-YYYYMMDD-XXXX
    project_name TEXT NOT NULL,
    project_type TEXT, -- 'janitorial', 'commercial_cleaning', 'government', etc.
    
    -- Pricing Breakdown
    labor_hours DECIMAL(10,2),
    labor_rate DECIMAL(10,2),
    material_cost DECIMAL(10,2),
    equipment_cost DECIMAL(10,2),
    overhead_percentage DECIMAL(5,2),
    profit_margin DECIMAL(5,2),
    
    -- Calculated Totals
    subtotal DECIMAL(10,2),
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Additional Details
    square_footage INTEGER,
    frequency TEXT, -- 'daily', 'weekly', 'monthly', 'one-time'
    
    -- Status Tracking
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired', 'invoiced')),
    valid_until DATE,
    
    -- Conversion Tracking
    converted_to_invoice_id UUID REFERENCES public.invoices(id),
    converted_at TIMESTAMPTZ,
    
    -- Notes
    notes TEXT,
    internal_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    sent_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_bids_user_id ON public.bids(user_id);
CREATE INDEX idx_bids_customer_id ON public.bids(customer_id);
CREATE INDEX idx_bids_status ON public.bids(status);
CREATE INDEX idx_bids_created_at ON public.bids(created_at DESC);

-- RLS Policies
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bids"
  ON public.bids FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bids"
  ON public.bids FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bids"
  ON public.bids FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bids"
  ON public.bids FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 2. ESTIMATES/PROPOSALS TABLE (New)

**Purpose:** Track formal estimates sent to customers before acceptance

```sql
CREATE TABLE IF NOT EXISTS public.estimates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    bid_id UUID REFERENCES public.bids(id) ON DELETE SET NULL,
    
    -- Estimate Details
    estimate_number TEXT UNIQUE NOT NULL, -- EST-YYYYMMDD-XXXX
    title TEXT NOT NULL,
    description TEXT,
    
    -- Line Items (JSONB for flexibility)
    line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Pricing
    subtotal DECIMAL(10,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Status & Dates
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired')),
    valid_until DATE NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Acceptance Tracking
    accepted_at TIMESTAMPTZ,
    accepted_by TEXT, -- Customer name who accepted
    acceptance_ip TEXT,
    
    -- Conversion Tracking
    converted_to_invoice_id UUID REFERENCES public.invoices(id),
    converted_at TIMESTAMPTZ,
    
    -- Terms & Notes
    terms TEXT,
    notes TEXT,
    internal_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    sent_at TIMESTAMPTZ,
    viewed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_estimates_user_id ON public.estimates(user_id);
CREATE INDEX idx_estimates_customer_id ON public.estimates(customer_id);
CREATE INDEX idx_estimates_status ON public.estimates(status);
CREATE INDEX idx_estimates_created_at ON public.estimates(created_at DESC);

-- RLS Policies (same pattern as bids)
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own estimates"
  ON public.estimates FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## 3. INVOICES TABLE (Enhancement Required)

**Add Missing Fields:**
```sql
-- Add these columns to existing invoices table
ALTER TABLE public.invoices 
    ADD COLUMN IF NOT EXISTS bid_id UUID REFERENCES public.bids(id),
    ADD COLUMN IF NOT EXISTS estimate_id UUID REFERENCES public.estimates(id),
    ADD COLUMN IF NOT EXISTS recurring_invoice_id UUID REFERENCES public.recurring_invoices(id);

-- Index for tracking conversions
CREATE INDEX IF NOT EXISTS idx_invoices_bid_id ON public.invoices(bid_id);
CREATE INDEX IF NOT EXISTS idx_invoices_estimate_id ON public.invoices(estimate_id);
```

---

## 4. RECURRING INVOICES TABLE (New)

**Already provided in previous migration file, but ensure it has:**

```sql
-- Verify recurring_invoices table exists with all required fields
-- If not, run the migration: 20251214_create_recurring_invoices.sql

-- Add relationship to original bid/estimate
ALTER TABLE public.recurring_invoices
    ADD COLUMN IF NOT EXISTS bid_id UUID REFERENCES public.bids(id),
    ADD COLUMN IF NOT EXISTS estimate_id UUID REFERENCES public.estimates(id);
```

---

## 5. AUTO-GENERATION FUNCTIONS

### A. Generate Bid Number
```sql
CREATE OR REPLACE FUNCTION public.generate_bid_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    date_prefix TEXT;
    sequence_num INTEGER;
BEGIN
    date_prefix := 'BID-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
    
    -- Get next sequence number for today
    SELECT COALESCE(MAX(CAST(SUBSTRING(bid_number FROM 14) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM public.bids
    WHERE bid_number LIKE date_prefix || '%';
    
    new_number := date_prefix || '-' || LPAD(sequence_num::TEXT, 4, '0');
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;
```

### B. Generate Estimate Number
```sql
CREATE OR REPLACE FUNCTION public.generate_estimate_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    date_prefix TEXT;
    sequence_num INTEGER;
BEGIN
    date_prefix := 'EST-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(estimate_number FROM 14) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM public.estimates
    WHERE estimate_number LIKE date_prefix || '%';
    
    new_number := date_prefix || '-' || LPAD(sequence_num::TEXT, 4, '0');
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;
```

### C. Convert Bid to Invoice
```sql
CREATE OR REPLACE FUNCTION public.convert_bid_to_invoice(
    bid_uuid UUID
)
RETURNS UUID AS $$
DECLARE
    bid_record RECORD;
    new_invoice_id UUID;
    new_invoice_number TEXT;
BEGIN
    -- Get bid details
    SELECT * INTO bid_record
    FROM public.bids
    WHERE id = bid_uuid AND user_id = auth.uid();
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Bid not found or access denied';
    END IF;
    
    IF bid_record.status != 'accepted' THEN
        RAISE EXCEPTION 'Only accepted bids can be converted to invoices';
    END IF;
    
    IF bid_record.converted_to_invoice_id IS NOT NULL THEN
        RAISE EXCEPTION 'Bid already converted to invoice';
    END IF;
    
    -- Generate invoice number
    SELECT 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || 
           LPAD(COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 14) AS INTEGER)), 0) + 1::TEXT, 4, '0')
    INTO new_invoice_number
    FROM public.invoices
    WHERE invoice_number LIKE 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '%';
    
    -- Create invoice
    INSERT INTO public.invoices (
        user_id,
        customer_id,
        bid_id,
        invoice_number,
        issue_date,
        due_date,
        line_items,
        total_amount,
        status,
        notes
    ) VALUES (
        bid_record.user_id,
        bid_record.customer_id,
        bid_record.id,
        new_invoice_number,
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '30 days',
        jsonb_build_array(
            jsonb_build_object(
                'description', bid_record.project_name,
                'quantity', 1,
                'rate', bid_record.total_amount,
                'amount', bid_record.total_amount,
                'is_taxable', false
            )
        ),
        bid_record.total_amount,
        'draft',
        bid_record.notes
    )
    RETURNING id INTO new_invoice_id;
    
    -- Update bid with conversion info
    UPDATE public.bids
    SET 
        converted_to_invoice_id = new_invoice_id,
        converted_at = now(),
        status = 'invoiced',
        updated_at = now()
    WHERE id = bid_uuid;
    
    RETURN new_invoice_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.convert_bid_to_invoice(UUID) TO authenticated;
```

### D. Convert Estimate to Invoice
```sql
CREATE OR REPLACE FUNCTION public.convert_estimate_to_invoice(
    estimate_uuid UUID
)
RETURNS UUID AS $$
DECLARE
    estimate_record RECORD;
    new_invoice_id UUID;
    new_invoice_number TEXT;
BEGIN
    -- Get estimate details
    SELECT * INTO estimate_record
    FROM public.estimates
    WHERE id = estimate_uuid AND user_id = auth.uid();
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Estimate not found or access denied';
    END IF;
    
    IF estimate_record.status != 'accepted' THEN
        RAISE EXCEPTION 'Only accepted estimates can be converted to invoices';
    END IF;
    
    IF estimate_record.converted_to_invoice_id IS NOT NULL THEN
        RAISE EXCEPTION 'Estimate already converted to invoice';
    END IF;
    
    -- Generate invoice number (same logic as bid conversion)
    SELECT 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || 
           LPAD(COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 14) AS INTEGER)), 0) + 1::TEXT, 4, '0')
    INTO new_invoice_number
    FROM public.invoices
    WHERE invoice_number LIKE 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '%';
    
    -- Create invoice from estimate
    INSERT INTO public.invoices (
        user_id,
        customer_id,
        estimate_id,
        invoice_number,
        issue_date,
        due_date,
        line_items,
        total_amount,
        tax_rate,
        status,
        notes,
        terms
    ) VALUES (
        estimate_record.user_id,
        estimate_record.customer_id,
        estimate_record.id,
        new_invoice_number,
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '30 days',
        estimate_record.line_items,
        estimate_record.total_amount,
        estimate_record.tax_rate,
        'draft',
        estimate_record.notes,
        estimate_record.terms
    )
    RETURNING id INTO new_invoice_id;
    
    -- Update estimate with conversion info
    UPDATE public.estimates
    SET 
        converted_to_invoice_id = new_invoice_id,
        converted_at = now(),
        updated_at = now()
    WHERE id = estimate_uuid;
    
    RETURN new_invoice_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.convert_estimate_to_invoice(UUID) TO authenticated;
```

---

## 6. TRIGGERS FOR AUTO-NUMBERING

```sql
-- Auto-generate bid number on insert
CREATE OR REPLACE FUNCTION public.set_bid_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.bid_number IS NULL THEN
        NEW.bid_number := public.generate_bid_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_set_bid_number
    BEFORE INSERT ON public.bids
    FOR EACH ROW
    EXECUTE FUNCTION public.set_bid_number();

-- Auto-generate estimate number on insert
CREATE OR REPLACE FUNCTION public.set_estimate_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estimate_number IS NULL THEN
        NEW.estimate_number := public.generate_estimate_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_set_estimate_number
    BEFORE INSERT ON public.estimates
    FOR EACH ROW
    EXECUTE FUNCTION public.set_estimate_number();
```

---

## 7. VALIDATION & CONSTRAINTS

```sql
-- Ensure bid has customer
ALTER TABLE public.bids
    ADD CONSTRAINT bids_customer_required CHECK (customer_id IS NOT NULL);

-- Ensure amounts are positive
ALTER TABLE public.bids
    ADD CONSTRAINT bids_positive_amount CHECK (total_amount > 0);

ALTER TABLE public.estimates
    ADD CONSTRAINT estimates_positive_amount CHECK (total_amount > 0);

-- Ensure valid_until is in future for estimates
ALTER TABLE public.estimates
    ADD CONSTRAINT estimates_valid_until_future CHECK (valid_until >= issue_date);
```

---

## 8. REPORTING QUERIES (Create as Views)

```sql
-- View: Active Bids by Customer
CREATE OR REPLACE VIEW public.v_active_bids AS
SELECT 
    b.id,
    b.bid_number,
    b.project_name,
    b.total_amount,
    b.status,
    b.created_at,
    c.first_name || ' ' || c.last_name as customer_name,
    c.company_name,
    c.email,
    c.phone
FROM public.bids b
JOIN public.customers c ON b.customer_id = c.id
WHERE b.status IN ('draft', 'sent')
ORDER BY b.created_at DESC;

-- View: Conversion Funnel
CREATE OR REPLACE VIEW public.v_conversion_funnel AS
SELECT 
    b.user_id,
    COUNT(b.id) as total_bids,
    COUNT(CASE WHEN b.status = 'accepted' THEN 1 END) as accepted_bids,
    COUNT(b.converted_to_invoice_id) as converted_to_invoices,
    ROUND(COUNT(CASE WHEN b.status = 'accepted' THEN 1 END)::DECIMAL / NULLIF(COUNT(b.id), 0) * 100, 2) as acceptance_rate,
    SUM(b.total_amount) FILTER (WHERE b.status = 'accepted') as total_accepted_value
FROM public.bids b
GROUP BY b.user_id;
```

---

## DEPLOYMENT CHECKLIST

- [ ] Run all CREATE TABLE statements
- [ ] Create all indexes
- [ ] Set up RLS policies
- [ ] Deploy all functions
- [ ] Create triggers
- [ ] Add constraints
- [ ] Create views
- [ ] Test with sample data
- [ ] Verify frontend can:
  - [ ] Save bids with customer_id
  - [ ] Convert bids to invoices
  - [ ] Create recurring invoices
  - [ ] Query conversion funnel

---

## FRONTEND INTEGRATION POINTS

Once backend is deployed, frontend needs:
1. **BiddingCalculator** → "Save Bid" button calling `bids.insert()`
2. **Bids List View** → Show all bids with "Convert to Invoice" button
3. **Estimates View** → Create/manage estimates, acceptance flow
4. **Invoicing** → Link invoices back to bids/estimates
5. **Dashboard** → Show conversion funnel metrics

---

**Priority: HIGH - This completes the core business flow**
