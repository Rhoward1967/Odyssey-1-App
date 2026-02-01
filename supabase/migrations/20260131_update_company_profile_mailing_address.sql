-- Update company_profiles with complete public business details
-- Stripe-compliant customer-facing information

-- Add customer-facing fields if they don't exist
ALTER TABLE company_profiles 
ADD COLUMN IF NOT EXISTS mailing_address TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS support_email TEXT,
ADD COLUMN IF NOT EXISTS support_phone TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS privacy_policy_url TEXT,
ADD COLUMN IF NOT EXISTS terms_of_service_url TEXT,
ADD COLUMN IF NOT EXISTS statement_descriptor TEXT,
ADD COLUMN IF NOT EXISTS shortened_descriptor TEXT;

-- Update Odyssey-1 AI LLC profile with complete Stripe-compliant details
UPDATE company_profiles
SET 
  company_name = 'ODYSSEY-1 AI LLC',
  mailing_address = 'P.O. Box 80054
Athens, GA 30608',
  phone = '800-403-8492',
  support_phone = '800-403-8492',
  support_email = 'generalmanager81@gmail.com',
  website_url = 'https://odyssey-1-app.vercel.app',
  privacy_policy_url = 'https://odyssey-1-app.vercel.app/privacy',
  terms_of_service_url = 'https://odyssey-1-app.vercel.app/terms',
  statement_descriptor = 'ODYSSEY-1 AI LLC',
  shortened_descriptor = 'ODYSSEY1',
  updated_at = NOW()
WHERE user_id = 'eca49ca9-b4ae-4e0e-b78a-fa1811024781';

-- Verification
DO $$
BEGIN
  RAISE NOTICE '✅ Company profile updated with Stripe-compliant public details';
  RAISE NOTICE '   Legal Name: ODYSSEY-1 AI LLC';
  RAISE NOTICE '   Statement Descriptor: ODYSSEY-1 AI LLC';
  RAISE NOTICE '   Shortened Descriptor: ODYSSEY1';
  RAISE NOTICE '   Support Phone: 800-403-8492';
  RAISE NOTICE '   Mailing Address: P.O. Box 80054, Athens, GA 30608';
  RAISE NOTICE '   Support Email: generalmanager81@gmail.com';
  RAISE NOTICE '   Website: https://odyssey-1-app.vercel.app';
  RAISE NOTICE '   Privacy Policy: https://odyssey-1-app.vercel.app/privacy';
  RAISE NOTICE '   Terms of Service: https://odyssey-1-app.vercel.app/terms';
END $$;
