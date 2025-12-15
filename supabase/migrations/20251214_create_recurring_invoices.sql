-- Create recurring_invoices table for automated billing
CREATE TABLE IF NOT EXISTS public.recurring_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  
  -- Recurrence settings
  frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'quarterly', 'annual')),
  start_date DATE NOT NULL,
  end_date DATE, -- NULL means no end date (perpetual)
  next_invoice_date DATE NOT NULL,
  
  -- Invoice details
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  notes TEXT,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_user_id ON public.recurring_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_customer_id ON public.recurring_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_next_date ON public.recurring_invoices(next_invoice_date) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.recurring_invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own recurring invoices"
  ON public.recurring_invoices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recurring invoices"
  ON public.recurring_invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring invoices"
  ON public.recurring_invoices FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring invoices"
  ON public.recurring_invoices FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update next_invoice_date based on frequency
CREATE OR REPLACE FUNCTION public.calculate_next_invoice_date(
  current_date DATE,
  freq TEXT
) RETURNS DATE AS $$
BEGIN
  RETURN CASE freq
    WHEN 'monthly' THEN current_date + INTERVAL '1 month'
    WHEN 'quarterly' THEN current_date + INTERVAL '3 months'
    WHEN 'annual' THEN current_date + INTERVAL '1 year'
    ELSE current_date + INTERVAL '1 month'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to generate invoice from recurring template
CREATE OR REPLACE FUNCTION public.generate_invoice_from_recurring(
  recurring_id UUID
) RETURNS UUID AS $$
DECLARE
  recurring_record RECORD;
  new_invoice_id UUID;
  new_invoice_number TEXT;
BEGIN
  -- Get the recurring invoice details
  SELECT * INTO recurring_record
  FROM public.recurring_invoices
  WHERE id = recurring_id AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Recurring invoice not found or inactive';
  END IF;
  
  -- Generate invoice number
  SELECT 'INV-' || LPAD(COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 5) AS INTEGER)), 0) + 1::TEXT, 6, '0')
  INTO new_invoice_number
  FROM public.invoices
  WHERE user_id = recurring_record.user_id;
  
  -- Create the new invoice
  INSERT INTO public.invoices (
    user_id,
    customer_id,
    invoice_number,
    issue_date,
    due_date,
    line_items,
    total_amount,
    tax_rate,
    notes,
    status
  ) VALUES (
    recurring_record.user_id,
    recurring_record.customer_id,
    new_invoice_number,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days',
    recurring_record.line_items,
    recurring_record.total_amount,
    recurring_record.tax_rate,
    recurring_record.notes || ' (Auto-generated from recurring invoice)',
    'draft'
  )
  RETURNING id INTO new_invoice_id;
  
  -- Update the recurring invoice's next_invoice_date
  UPDATE public.recurring_invoices
  SET 
    next_invoice_date = public.calculate_next_invoice_date(next_invoice_date, frequency),
    updated_at = now()
  WHERE id = recurring_id;
  
  -- Check if recurring invoice should be deactivated (end_date passed)
  UPDATE public.recurring_invoices
  SET is_active = false
  WHERE id = recurring_id 
    AND end_date IS NOT NULL 
    AND end_date < CURRENT_DATE;
  
  RETURN new_invoice_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.generate_invoice_from_recurring(UUID) TO authenticated;

SELECT 'Recurring invoices table and functions created successfully' AS status;
