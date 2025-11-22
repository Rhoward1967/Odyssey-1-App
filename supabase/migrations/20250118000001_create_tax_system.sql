-- ============================================================================
-- TAX WITHHOLDING & COMPLIANCE SYSTEM
-- © 2025 Rickey A Howard. All Rights Reserved.
-- ============================================================================

-- Federal Tax Brackets (2024/2025)
CREATE TABLE IF NOT EXISTS federal_tax_brackets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tax_year INTEGER NOT NULL,
  filing_status TEXT NOT NULL CHECK (filing_status IN ('single', 'married_joint', 'married_separate', 'head_of_household')),
  bracket_min NUMERIC(12, 2) NOT NULL,
  bracket_max NUMERIC(12, 2),
  tax_rate NUMERIC(5, 4) NOT NULL, -- Store as 0.1000 for 10%
  base_tax NUMERIC(12, 2) NOT NULL DEFAULT 0,
  
  UNIQUE(tax_year, filing_status, bracket_min)
);

-- State Tax Brackets
CREATE TABLE IF NOT EXISTS state_tax_brackets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tax_year INTEGER NOT NULL,
  state_code TEXT NOT NULL, -- 'GA', 'FL', 'AL', etc.
  filing_status TEXT NOT NULL,
  bracket_min NUMERIC(12, 2) NOT NULL,
  bracket_max NUMERIC(12, 2),
  tax_rate NUMERIC(5, 4) NOT NULL,
  base_tax NUMERIC(12, 2) NOT NULL DEFAULT 0,
  
  UNIQUE(tax_year, state_code, filing_status, bracket_min)
);

-- FICA & Medicare Rates (changes yearly)
CREATE TABLE IF NOT EXISTS payroll_tax_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tax_year INTEGER NOT NULL UNIQUE,
  
  -- Social Security (FICA)
  social_security_rate NUMERIC(5, 4) NOT NULL DEFAULT 0.0620, -- 6.2%
  social_security_wage_base NUMERIC(12, 2) NOT NULL DEFAULT 168600.00, -- 2024 limit
  
  -- Medicare
  medicare_rate NUMERIC(5, 4) NOT NULL DEFAULT 0.0145, -- 1.45%
  medicare_additional_rate NUMERIC(5, 4) NOT NULL DEFAULT 0.0090, -- 0.9% additional
  medicare_additional_threshold NUMERIC(12, 2) NOT NULL DEFAULT 200000.00,
  
  -- Federal Unemployment Tax (FUTA)
  futa_rate NUMERIC(5, 4) NOT NULL DEFAULT 0.0060, -- 6% but credit reduces to 0.6%
  futa_wage_base NUMERIC(12, 2) NOT NULL DEFAULT 7000.00,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employee W-4 Forms (Federal withholding allowances)
CREATE TABLE IF NOT EXISTS employee_w4_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- W-4 Step 1: Personal Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  ssn_encrypted TEXT, -- Encrypted SSN
  ssn_last4 TEXT, -- Last 4 for display
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  
  -- W-4 Step 2: Multiple Jobs or Spouse Works
  has_multiple_jobs BOOLEAN DEFAULT false,
  step2_option TEXT CHECK (step2_option IN ('none', 'use_estimator', 'two_jobs', 'three_plus_jobs')),
  
  -- W-4 Step 3: Claim Dependents
  number_of_dependents INTEGER DEFAULT 0,
  dependent_credit_amount NUMERIC(8, 2) DEFAULT 0,
  
  -- W-4 Step 4: Other Adjustments
  other_income NUMERIC(10, 2) DEFAULT 0, -- Non-wage income
  deductions NUMERIC(10, 2) DEFAULT 0, -- Itemized deductions
  extra_withholding NUMERIC(10, 2) DEFAULT 0, -- Extra amount per pay period
  
  -- Filing Status
  filing_status TEXT NOT NULL DEFAULT 'single' CHECK (filing_status IN ('single', 'married_joint', 'married_separate', 'head_of_household')),
  
  -- Exempt Status
  is_exempt BOOLEAN DEFAULT false, -- No tax withheld
  exempt_year INTEGER,
  
  -- Form Metadata
  form_year INTEGER NOT NULL DEFAULT 2024,
  date_signed DATE NOT NULL DEFAULT CURRENT_DATE,
  signature_image TEXT, -- Base64 signature
  is_active BOOLEAN DEFAULT true,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(employee_id, form_year, is_active)
);

-- State W-4 Equivalent (varies by state)
CREATE TABLE IF NOT EXISTS employee_state_withholding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  state_code TEXT NOT NULL,
  form_type TEXT, -- 'G-4' for Georgia, varies by state
  allowances INTEGER DEFAULT 0,
  additional_withholding NUMERIC(10, 2) DEFAULT 0,
  is_exempt BOOLEAN DEFAULT false,
  
  form_year INTEGER NOT NULL,
  date_signed DATE,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(employee_id, state_code, form_year, is_active)
);

-- 1099 Contractor Information
CREATE TABLE IF NOT EXISTS contractor_1099_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- W-9 Information
  business_name TEXT,
  business_type TEXT CHECK (business_type IN ('individual', 'sole_proprietor', 'c_corp', 's_corp', 'partnership', 'llc')),
  
  -- Tax ID
  tax_id_type TEXT NOT NULL CHECK (tax_id_type IN ('ssn', 'ein')),
  tax_id_encrypted TEXT NOT NULL,
  tax_id_last4 TEXT NOT NULL,
  
  -- Address
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  
  -- Backup Withholding
  is_exempt_from_backup_withholding BOOLEAN DEFAULT false,
  exempt_payee_code TEXT,
  
  -- FATCA Exemption
  fatca_exempt BOOLEAN DEFAULT false,
  fatca_code TEXT,
  
  -- Form Metadata
  w9_date_signed DATE NOT NULL,
  w9_signature_image TEXT,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(employee_id, is_active)
);

-- Annual 1099-NEC Tracking (contractor payments)
CREATE TABLE IF NOT EXISTS form_1099_nec (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES employees(id), -- References contractors in employees table
  
  tax_year INTEGER NOT NULL,
  
  -- Box 1: Nonemployee compensation
  nonemployee_compensation NUMERIC(12, 2) NOT NULL DEFAULT 0,
  
  -- Box 2: Payer made direct sales totaling $5,000 or more
  direct_sales_indicator BOOLEAN DEFAULT false,
  
  -- Box 4: Federal income tax withheld
  federal_tax_withheld NUMERIC(12, 2) DEFAULT 0,
  
  -- Box 5: State tax withheld
  state_tax_withheld NUMERIC(12, 2) DEFAULT 0,
  state_code TEXT,
  state_payer_number TEXT,
  
  -- Filing Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'ready_to_file', 'filed', 'corrected')),
  filed_date DATE,
  
  -- IRS Submission
  irs_confirmation_number TEXT,
  irs_submission_date TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(contractor_id, tax_year)
);

-- Tax Form Generation Log
CREATE TABLE IF NOT EXISTS tax_form_generation_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id BIGINT NOT NULL REFERENCES organizations(id),
  
  form_type TEXT NOT NULL, -- 'W-2', '1099-NEC', '941', '940', 'W-4'
  tax_year INTEGER NOT NULL,
  employee_id UUID REFERENCES employees(id),
  
  generated_by UUID REFERENCES auth.users(id),
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  
  pdf_url TEXT, -- S3/storage URL
  status TEXT DEFAULT 'generated' CHECK (status IN ('generated', 'sent', 'filed', 'corrected'))
);

-- ============================================================================
-- SEED DATA: 2024 Federal Tax Brackets
-- ============================================================================

INSERT INTO federal_tax_brackets (tax_year, filing_status, bracket_min, bracket_max, tax_rate, base_tax) VALUES
-- Single Filers 2024
(2024, 'single', 0, 11600, 0.1000, 0),
(2024, 'single', 11600, 47150, 0.1200, 1160),
(2024, 'single', 47150, 100525, 0.2200, 5426),
(2024, 'single', 100525, 191950, 0.2400, 17168.50),
(2024, 'single', 191950, 243725, 0.3200, 39110.50),
(2024, 'single', 243725, 609350, 0.3500, 55678.50),
(2024, 'single', 609350, NULL, 0.3700, 183647.25),

-- Married Filing Jointly 2024
(2024, 'married_joint', 0, 23200, 0.1000, 0),
(2024, 'married_joint', 23200, 94300, 0.1200, 2320),
(2024, 'married_joint', 94300, 201050, 0.2200, 10852),
(2024, 'married_joint', 201050, 383900, 0.2400, 34337),
(2024, 'married_joint', 383900, 487450, 0.3200, 78221),
(2024, 'married_joint', 487450, 731200, 0.3500, 111357),
(2024, 'married_joint', 731200, NULL, 0.3700, 196669.50),

-- Head of Household 2024
(2024, 'head_of_household', 0, 16550, 0.1000, 0),
(2024, 'head_of_household', 16550, 63100, 0.1200, 1655),
(2024, 'head_of_household', 63100, 100500, 0.2200, 7241),
(2024, 'head_of_household', 100500, 191950, 0.2400, 15469),
(2024, 'head_of_household', 191950, 243700, 0.3200, 37417),
(2024, 'head_of_household', 243700, 609350, 0.3500, 53977),
(2024, 'head_of_household', 609350, NULL, 0.3700, 181954.50);

-- ============================================================================
-- SEED DATA: State Tax Brackets (Georgia example)
-- ============================================================================

INSERT INTO state_tax_brackets (tax_year, state_code, filing_status, bracket_min, bracket_max, tax_rate, base_tax) VALUES
-- Georgia 2024 - Single
(2024, 'GA', 'single', 0, 750, 0.0100, 0),
(2024, 'GA', 'single', 750, 2250, 0.0200, 7.50),
(2024, 'GA', 'single', 2250, 3750, 0.0300, 37.50),
(2024, 'GA', 'single', 3750, 5250, 0.0400, 82.50),
(2024, 'GA', 'single', 5250, 7000, 0.0500, 142.50),
(2024, 'GA', 'single', 7000, NULL, 0.0575, 230.00),

-- Georgia 2024 - Married Joint
(2024, 'GA', 'married_joint', 0, 1000, 0.0100, 0),
(2024, 'GA', 'married_joint', 1000, 3000, 0.0200, 10.00),
(2024, 'GA', 'married_joint', 3000, 5000, 0.0300, 50.00),
(2024, 'GA', 'married_joint', 5000, 7000, 0.0400, 110.00),
(2024, 'GA', 'married_joint', 7000, 10000, 0.0500, 190.00),
(2024, 'GA', 'married_joint', 10000, NULL, 0.0575, 340.00);

-- Florida (no state income tax)
INSERT INTO state_tax_brackets (tax_year, state_code, filing_status, bracket_min, bracket_max, tax_rate, base_tax) VALUES
(2024, 'FL', 'single', 0, NULL, 0.0000, 0),
(2024, 'FL', 'married_joint', 0, NULL, 0.0000, 0),
(2024, 'FL', 'head_of_household', 0, NULL, 0.0000, 0);

-- ============================================================================
-- SEED DATA: Payroll Tax Rates
-- ============================================================================

INSERT INTO payroll_tax_rates (
  tax_year, 
  social_security_rate, 
  social_security_wage_base,
  medicare_rate,
  medicare_additional_rate,
  medicare_additional_threshold,
  futa_rate,
  futa_wage_base
) VALUES
(2024, 0.0620, 168600.00, 0.0145, 0.0090, 200000.00, 0.0060, 7000.00),
(2025, 0.0620, 176100.00, 0.0145, 0.0090, 200000.00, 0.0060, 7000.00);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_federal_tax_brackets_year ON federal_tax_brackets(tax_year, filing_status);
CREATE INDEX idx_state_tax_brackets_year_state ON state_tax_brackets(tax_year, state_code, filing_status);
CREATE INDEX idx_employee_w4_active ON employee_w4_forms(employee_id, is_active) WHERE is_active = true;
CREATE INDEX idx_contractor_1099_active ON contractor_1099_info(employee_id, is_active) WHERE is_active = true;
CREATE INDEX idx_form_1099_year ON form_1099_nec(tax_year, organization_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE federal_tax_brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE state_tax_brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_w4_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_state_withholding ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_1099_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_1099_nec ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_form_generation_log ENABLE ROW LEVEL SECURITY;

-- Tax brackets: Public read (everyone can see tax tables)
CREATE POLICY "Anyone can read tax brackets" ON federal_tax_brackets FOR SELECT USING (true);
CREATE POLICY "Anyone can read state tax brackets" ON state_tax_brackets FOR SELECT USING (true);
CREATE POLICY "Anyone can read payroll tax rates" ON payroll_tax_rates FOR SELECT USING (true);

-- W-4 Forms: Employees see their own, admins see all
CREATE POLICY "Employees can view own W-4" ON employee_w4_forms FOR SELECT
USING (
  employee_id IN (SELECT id FROM employees WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  OR
  organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('owner', 'admin'))
);

CREATE POLICY "Admins can manage W-4 forms" ON employee_w4_forms FOR ALL
USING (
  organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('owner', 'admin'))
);

-- Similar policies for other tables
CREATE POLICY "Admins manage state withholding" ON employee_state_withholding FOR ALL
USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('owner', 'admin')));

CREATE POLICY "Admins manage 1099 info" ON contractor_1099_info FOR ALL
USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('owner', 'admin')));

CREATE POLICY "Admins manage 1099 forms" ON form_1099_nec FOR ALL
USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('owner', 'admin')));

CREATE POLICY "Admins view tax form log" ON tax_form_generation_log FOR ALL
USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('owner', 'admin')));

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE federal_tax_brackets IS 'IRS federal income tax brackets by filing status and year';
COMMENT ON TABLE state_tax_brackets IS 'State income tax brackets (varies by state)';
COMMENT ON TABLE payroll_tax_rates IS 'FICA, Medicare, FUTA rates (updated annually by IRS)';
COMMENT ON TABLE employee_w4_forms IS 'Employee W-4 Federal Withholding Allowance Certificates';
COMMENT ON TABLE contractor_1099_info IS 'W-9 information for 1099 contractors';
COMMENT ON TABLE form_1099_nec IS 'Annual 1099-NEC forms for contractor payments';
