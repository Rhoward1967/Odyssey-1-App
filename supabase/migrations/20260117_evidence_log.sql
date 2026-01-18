-- Evidence Log Table for FDCPA Litigation Support
-- Stores certified mail receipts, collection letters, and extracted violation data
-- Created: January 17, 2026

CREATE TABLE IF NOT EXISTS public.evidence_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id uuid NOT NULL REFERENCES public.legal_defense_accounts(id) ON DELETE CASCADE,
  user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id),
  
  -- File metadata
  file_name text NOT NULL,
  file_type text NOT NULL CHECK (file_type IN ('usps_receipt', 'collection_letter', 'validation_response', 'court_document', 'other')),
  file_url text NOT NULL,
  file_size_bytes bigint,
  mime_type text,
  
  -- OCR extracted content
  ocr_text text,
  ocr_confidence decimal(5,2), -- 0-100 confidence score
  ocr_processed_at timestamp with time zone,
  
  -- Violation detection results
  detected_violations jsonb DEFAULT '[]'::jsonb,
  violation_count integer DEFAULT 0,
  statutory_damages_total decimal(12,2) DEFAULT 0,
  
  -- Legal metadata
  document_date date,
  delivery_date date, -- From USPS tracking
  response_deadline date, -- Calculated 30-day window
  
  -- Notes and tags
  notes text,
  tags text[], -- e.g., ['threat', 'missing_disclosure', 'false_amount']
  
  -- Audit trail
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_evidence_log_account ON public.evidence_log(account_id);
CREATE INDEX idx_evidence_log_user ON public.evidence_log(user_id);
CREATE INDEX idx_evidence_log_type ON public.evidence_log(file_type);
CREATE INDEX idx_evidence_log_violations ON public.evidence_log USING gin(detected_violations);

-- RLS Policies
ALTER TABLE public.evidence_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_evidence" 
ON public.evidence_log 
FOR ALL 
TO authenticated 
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_evidence_log_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER evidence_log_updated_at
BEFORE UPDATE ON public.evidence_log
FOR EACH ROW
EXECUTE FUNCTION public.update_evidence_log_timestamp();

-- Comments
COMMENT ON TABLE public.evidence_log IS 'Stores physical evidence for FDCPA/FCRA litigation: certified mail receipts, collection letters, OCR text, and detected violations';
COMMENT ON COLUMN public.evidence_log.detected_violations IS 'JSONB array of violation objects: [{statute: "15 USC §1692e(5)", description: "...", severity: "CRITICAL", damages: 1000}]';
COMMENT ON COLUMN public.evidence_log.response_deadline IS 'Calculated from delivery_date + 30 days (FDCPA validation window)';
