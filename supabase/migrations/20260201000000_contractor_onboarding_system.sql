-- ============================================================================
-- CONTRACTOR ONBOARDING SYSTEM - DATABASE SCHEMA
-- © 2025 Rickey A Howard. All Rights Reserved.
-- Purpose: Sovereign Intake infrastructure for W-9 & Direct Deposit
-- ============================================================================

-- Add new columns to contractors table for onboarding system
ALTER TABLE contractors 
ADD COLUMN IF NOT EXISTS contractor_type TEXT CHECK (contractor_type IN ('individual', 'business')),
ADD COLUMN IF NOT EXISTS business_name TEXT,
ADD COLUMN IF NOT EXISTS tax_id_encrypted TEXT,
ADD COLUMN IF NOT EXISTS routing_number TEXT,
ADD COLUMN IF NOT EXISTS account_number_encrypted TEXT,
ADD COLUMN IF NOT EXISTS account_number_last4 TEXT,
ADD COLUMN IF NOT EXISTS verification_check_number TEXT,
ADD COLUMN IF NOT EXISTS voided_check_url TEXT,
ADD COLUMN IF NOT EXISTS digital_signature TEXT,
ADD COLUMN IF NOT EXISTS digital_signature_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS onboarding_token UUID UNIQUE,
ADD COLUMN IF NOT EXISTS onboarding_status TEXT DEFAULT 'pending' CHECK (onboarding_status IN ('pending', 'submitted', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
-- Email tracking fields for Resend integration
ADD COLUMN IF NOT EXISTS invite_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS invite_email_id TEXT,
ADD COLUMN IF NOT EXISTS invite_opened_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approval_email_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approval_email_id TEXT,
ADD COLUMN IF NOT EXISTS rejection_email_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_email_id TEXT,
ADD COLUMN IF NOT EXISTS email_delivery_status TEXT DEFAULT 'not_sent' CHECK (email_delivery_status IN ('not_sent', 'sent', 'delivered', 'opened', 'bounced', 'failed'));

-- Create index on onboarding_token for fast lookup
CREATE INDEX IF NOT EXISTS idx_contractors_onboarding_token ON contractors(onboarding_token);

-- Create index on onboarding_status for filtering
CREATE INDEX IF NOT EXISTS idx_contractors_onboarding_status ON contractors(onboarding_status);

-- Add comments for documentation
COMMENT ON COLUMN contractors.contractor_type IS 'Individual (1099-NEC) or Business (1099-MISC)';
COMMENT ON COLUMN contractors.tax_id_encrypted IS 'Encrypted SSN or EIN for 1099 reporting';
COMMENT ON COLUMN contractors.routing_number IS 'Bank routing number for direct deposit';
COMMENT ON COLUMN contractors.account_number_encrypted IS 'Encrypted bank account number';
COMMENT ON COLUMN contractors.account_number_last4 IS 'Last 4 digits for display (****1234)';
COMMENT ON COLUMN contractors.verification_check_number IS 'Check number from voided check for triple-lock verification';
COMMENT ON COLUMN contractors.voided_check_url IS 'Path to voided check image in contractor-docs bucket';
COMMENT ON COLUMN contractors.digital_signature IS 'Digital signature matching legal name for W-9 certification';
COMMENT ON COLUMN contractors.onboarding_token IS 'Unique UUID for secure onboarding portal access';
COMMENT ON COLUMN contractors.onboarding_status IS 'Workflow status: pending → submitted → approved/rejected';
COMMENT ON COLUMN contractors.invite_sent_at IS 'Timestamp when invitation email was sent via Resend';
COMMENT ON COLUMN contractors.invite_email_id IS 'Resend email ID for invitation tracking';
COMMENT ON COLUMN contractors.invite_opened_at IS 'Timestamp when contractor opened invitation email';
COMMENT ON COLUMN contractors.approval_email_sent_at IS 'Timestamp when approval notification sent';
COMMENT ON COLUMN contractors.approval_email_id IS 'Resend email ID for approval notification';
COMMENT ON COLUMN contractors.rejection_email_sent_at IS 'Timestamp when rejection notification sent';
COMMENT ON COLUMN contractors.rejection_email_id IS 'Resend email ID for rejection notification';
COMMENT ON COLUMN contractors.email_delivery_status IS 'Email delivery tracking: not_sent, sent, delivered, opened, bounced, failed';

-- Create storage bucket for contractor documents (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('contractor-docs', 'contractor-docs', false)
ON CONFLICT (id) DO NOTHING;

-- RLS Policy: Only admins can view contractor documents
CREATE POLICY IF NOT EXISTS "Admins can view contractor documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'contractor-docs' 
  AND auth.uid() IN (
    SELECT user_id FROM user_organizations 
    WHERE role IN ('admin', 'owner')
  )
);

-- RLS Policy: Contractors can upload their own documents during onboarding
CREATE POLICY IF NOT EXISTS "Contractors can upload onboarding documents"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'contractor-docs'
);

-- RLS Policy: Admins can manage all contractor records
CREATE POLICY IF NOT EXISTS "Admins can manage contractor onboarding"
ON contractors FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT user_id FROM user_organizations 
    WHERE role IN ('admin', 'owner')
  )
);

-- Function to validate routing number (simple checksum)
CREATE OR REPLACE FUNCTION validate_routing_number(routing TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Must be exactly 9 digits
  IF routing !~ '^\d{9}$' THEN
    RETURN FALSE;
  END IF;
  
  -- Simple validation (real ABA routing number has checksum algorithm)
  -- For production, implement full ABA checksum validation
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-generate contractor ID when onboarding is approved
CREATE OR REPLACE FUNCTION auto_generate_contractor_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If status changed to 'approved' and no employee_id exists
  IF NEW.onboarding_status = 'approved' AND NEW.employee_id IS NULL THEN
    NEW.employee_id := 'CONTR-' || EXTRACT(EPOCH FROM NOW())::BIGINT;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate contractor ID on approval
DROP TRIGGER IF EXISTS trigger_auto_contractor_id ON contractors;
CREATE TRIGGER trigger_auto_contractor_id
  BEFORE UPDATE ON contractors
  FOR EACH ROW
  WHEN (NEW.onboarding_status = 'approved')
  EXECUTE FUNCTION auto_generate_contractor_id();

-- Audit log for contractor approvals/rejections
CREATE TABLE IF NOT EXISTS contractor_approval_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('approved', 'rejected')),
  performed_by UUID NOT NULL REFERENCES auth.users(id),
  performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  previous_status TEXT,
  new_status TEXT,
  metadata JSONB
);

-- Index for audit log queries
CREATE INDEX IF NOT EXISTS idx_contractor_approval_audit_contractor ON contractor_approval_audit(contractor_id);
CREATE INDEX IF NOT EXISTS idx_contractor_approval_audit_performed_at ON contractor_approval_audit(performed_at DESC);

COMMENT ON TABLE contractor_approval_audit IS 'Audit trail for contractor onboarding approvals and rejections';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Contractor onboarding system schema deployed successfully';
  RAISE NOTICE '🔒 Storage bucket: contractor-docs created (private)';
  RAISE NOTICE '🛡️ RLS policies: Admin-only access to sensitive data';
  RAISE NOTICE '📋 Audit logging: contractor_approval_audit table active';
END $$;
