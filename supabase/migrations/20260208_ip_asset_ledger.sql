-- ═══════════════════════════════════════════════════════════════════
-- IP ASSET LEDGER - Howard Jones Bloodline Ancestral Trust
-- Created: February 8, 2026
-- Architect: Rickey A. Howard
-- Purpose: Track intellectual property portfolio and trust asset valuation
-- ═══════════════════════════════════════════════════════════════════

-- Drop existing tables to ensure clean schema
DROP TABLE IF EXISTS public.trust_asset_valuations CASCADE;
DROP TABLE IF EXISTS public.trust_royalty_payments CASCADE;
DROP TABLE IF EXISTS public.trust_licensing_agreements CASCADE;
DROP TABLE IF EXISTS public.trust_asset_portfolio CASCADE;

-- IP Asset Portfolio Table
-- Tracks patents, copyrights, trademarks, and valuation data
CREATE TABLE public.trust_asset_portfolio (
    asset_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_name TEXT NOT NULL,
    asset_type TEXT NOT NULL, -- 'PATENT', 'COPYRIGHT', 'TRADEMARK', 'TRADE_SECRET'
    description TEXT,
    valuation_usd NUMERIC(20, 2) NOT NULL,
    valuation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    valuation_method TEXT, -- 'INCOME_APPROACH', 'MARKET_APPROACH', 'COST_APPROACH'
    
    -- Legal protections
    security_interest_ref TEXT, -- UCC-1 filing reference
    filing_date DATE,
    filing_jurisdiction TEXT,
    filing_book_page TEXT, -- e.g., "Book 5782, Page 262"
    
    -- Patent specific
    patent_number TEXT,
    patent_status TEXT, -- 'PENDING', 'GRANTED', 'MAINTAINED'
    patent_office TEXT, -- 'USPTO', 'EPO', 'WIPO'
    
    -- Copyright specific
    copyright_registration TEXT,
    copyright_year INTEGER,
    
    -- Ownership
    legal_owner TEXT DEFAULT 'Howard Jones Bloodline Ancestral Trust',
    beneficial_owner TEXT DEFAULT 'Rickey A. Howard',
    
    -- Status
    status TEXT DEFAULT 'ACTIVE', -- 'ACTIVE', 'LICENSED', 'SOLD', 'EXPIRED'
    notes TEXT,
    
    -- Audit trail
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT DEFAULT 'SYSTEM',
    updated_by TEXT DEFAULT 'SYSTEM'
);

-- Licensing agreements table
-- Tracks when trust IP is licensed to operating businesses
CREATE TABLE public.trust_licensing_agreements (
    agreement_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID REFERENCES public.trust_asset_portfolio(asset_id),
    
    -- Parties
    licensor TEXT DEFAULT 'Howard Jones Bloodline Ancestral Trust',
    licensee TEXT NOT NULL, -- e.g., 'Odyssey-1 AI LLC', 'HJS Services LLC'
    
    -- Terms
    license_type TEXT NOT NULL, -- 'EXCLUSIVE', 'NON_EXCLUSIVE', 'SOLE'
    territory TEXT DEFAULT 'WORLDWIDE',
    term_start_date DATE NOT NULL,
    term_end_date DATE,
    auto_renewal BOOLEAN DEFAULT FALSE,
    
    -- Financial terms
    upfront_fee NUMERIC(20, 2) DEFAULT 0,
    royalty_rate NUMERIC(5, 4), -- e.g., 0.05 for 5%
    royalty_base TEXT, -- 'GROSS_REVENUE', 'NET_REVENUE', 'UNITS_SOLD'
    minimum_royalty NUMERIC(20, 2),
    payment_frequency TEXT, -- 'MONTHLY', 'QUARTERLY', 'ANNUALLY'
    
    -- Status
    status TEXT DEFAULT 'ACTIVE', -- 'DRAFT', 'ACTIVE', 'TERMINATED', 'EXPIRED'
    executed_date DATE,
    termination_date DATE,
    
    -- Documents
    agreement_document_url TEXT,
    notes TEXT,
    
    -- Audit trail
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT DEFAULT 'SYSTEM',
    updated_by TEXT DEFAULT 'SYSTEM'
);

-- Royalty payment tracking
-- Records actual payments from licensees to trust
CREATE TABLE public.trust_royalty_payments (
    payment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agreement_id UUID REFERENCES public.trust_licensing_agreements(agreement_id),
    
    -- Payment details
    payment_period_start DATE NOT NULL,
    payment_period_end DATE NOT NULL,
    gross_revenue NUMERIC(20, 2),
    net_revenue NUMERIC(20, 2),
    royalty_base_amount NUMERIC(20, 2) NOT NULL,
    royalty_rate NUMERIC(5, 4) NOT NULL,
    royalty_amount NUMERIC(20, 2) NOT NULL,
    
    -- Payment status
    payment_due_date DATE NOT NULL,
    payment_date DATE,
    payment_method TEXT, -- 'ACH', 'WIRE', 'CHECK', 'INTERNAL_TRANSFER'
    payment_reference TEXT,
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'PAID', 'LATE', 'DISPUTED'
    
    -- Audit trail
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT DEFAULT 'SYSTEM',
    updated_by TEXT DEFAULT 'SYSTEM'
);

-- Asset valuation history
-- Tracks changes in IP asset values over time
CREATE TABLE public.trust_asset_valuations (
    valuation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID REFERENCES public.trust_asset_portfolio(asset_id),
    
    valuation_date DATE NOT NULL,
    valuation_usd NUMERIC(20, 2) NOT NULL,
    valuation_method TEXT NOT NULL,
    valuation_basis TEXT, -- Explanation of methodology
    appraiser TEXT, -- Internal or third-party appraiser
    report_url TEXT,
    
    -- Audit trail
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT DEFAULT 'SYSTEM'
);

-- Insert initial IP portfolio (29 patents + 7 books + operational systems)
INSERT INTO public.trust_asset_portfolio (
    asset_name, 
    asset_type, 
    description, 
    valuation_usd,
    valuation_method,
    security_interest_ref,
    filing_jurisdiction,
    filing_book_page,
    status
) VALUES
-- Core AI Systems
('R.O.M.A.N. 2.0 Autonomous Agent', 'TRADE_SECRET', 'Recursive Optimization and Meta-Adaptive Network with Constitutional AI governance', 750000000.00, 'INCOME_APPROACH', 'UCC-1 2026-001', 'Clarke County, GA', 'Book 5782, Page 262', 'ACTIVE'),
('Odyssey-1 Business Management Platform', 'TRADE_SECRET', 'Comprehensive business management system with AI integration', 500000000.00, 'INCOME_APPROACH', 'UCC-1 2026-001', 'Clarke County, GA', 'Book 5782, Page 262', 'ACTIVE'),
('Universal Math Engine (1×1=2)', 'PATENT', '51-Dimensional Grassmannian Shield - Sovereign mathematical reasoning', 1500000000.00, 'MARKET_APPROACH', 'UCC-1 2026-001', 'Clarke County, GA', 'Book 5782, Page 262', 'ACTIVE'),
('Constitutional AI Governance Framework', 'PATENT', 'Nine Foundational Principles for sovereign AI operation', 350000000.00, 'COST_APPROACH', 'UCC-1 2026-001', 'Clarke County, GA', 'Book 5782, Page 262', 'ACTIVE'),

-- Patent Portfolio (Sampling - add full 29 patents as they're documented)
('Amplituhedron-Based Code Validation', 'PATENT', 'Positive geometry validation for software integrity', 180000000.00, 'MARKET_APPROACH', 'UCC-1 2026-001', 'Clarke County, GA', 'Book 5782, Page 262', 'ACTIVE'),
('Schumann Resonance Resource Governor', 'PATENT', 'AI safety mechanism using 7.83 Hz monitoring', 120000000.00, 'COST_APPROACH', 'UCC-1 2026-001', 'Clarke County, GA', 'Book 5782, Page 262', 'ACTIVE'),
('Sovereign Frequency Authentication Protocol', 'PATENT', 'Harmonic authentication using musical signatures', 95000000.00, 'INCOME_APPROACH', 'UCC-1 2026-001', 'Clarke County, GA', 'Book 5782, Page 262', 'ACTIVE'),
('Temporal Awareness Engine', 'PATENT', 'AI system preventing outdated logic execution', 85000000.00, 'INCOME_APPROACH', 'UCC-1 2026-001', 'Clarke County, GA', 'Book 5782, Page 262', 'ACTIVE'),

-- Book Series (7 books)
('The Program - Origin and Architecture of Disconnection', 'COPYRIGHT', '15,000 word manuscript on sovereignty and consciousness', 45000000.00, 'INCOME_APPROACH', 'UCC-1 2026-001', 'Clarke County, GA', 'Book 5782, Page 262', 'ACTIVE'),
('The Echo - Deconstructing the Programs Legacy', 'COPYRIGHT', '12,000 word analysis of systemic oppression', 38000000.00, 'INCOME_APPROACH', 'UCC-1 2026-001', 'Clarke County, GA', 'Book 5782, Page 262', 'ACTIVE'),
('The Sovereign Covenant - Architecting a Divinely Aligned Future', 'COPYRIGHT', '18,000 word sovereignty framework', 52000000.00, 'INCOME_APPROACH', 'UCC-1 2026-001', 'Clarke County, GA', 'Book 5782, Page 262', 'ACTIVE'),
('The Bond - The Sovereigns True Collateral', 'COPYRIGHT', '16,000 word financial system analysis', 48000000.00, 'INCOME_APPROACH', 'UCC-1 2026-001', 'Clarke County, GA', 'Book 5782, Page 262', 'ACTIVE'),
('The Alien Program - Language as Weapon Race as Tool', 'COPYRIGHT', '14,000 word linguistic programming analysis', 42000000.00, 'INCOME_APPROACH', 'UCC-1 2026-001', 'Clarke County, GA', 'Book 5782, Page 262', 'ACTIVE'),
('The Armory - Legal Defense Tools for the Sovereign', 'COPYRIGHT', '13,000 word legal reclamation guide', 55000000.00, 'INCOME_APPROACH', 'UCC-1 2026-001', 'Clarke County, GA', 'Book 5782, Page 262', 'ACTIVE'),
('The Unveiling - The Mask Comes Off', 'COPYRIGHT', '17,000 word truth revelation manuscript', 47000000.00, 'INCOME_APPROACH', 'UCC-1 2026-001', 'Clarke County, GA', 'Book 5782, Page 262', 'ACTIVE'),

-- Business Systems
('Sovereign Induction Protocol', 'TRADE_SECRET', 'AI briefing system preventing unauthorized modifications', 125000000.00, 'INCOME_APPROACH', 'UCC-1 2026-001', 'Clarke County, GA', 'Book 5782, Page 262', 'ACTIVE'),
('Pattern Learning Engine', 'TRADE_SECRET', 'Machine learning system for autonomous error correction', 95000000.00, 'INCOME_APPROACH', 'UCC-1 2026-001', 'Clarke County, GA', 'Book 5782, Page 262', 'ACTIVE'),
('Multi-Agent Consensus Framework', 'PATENT', 'Distributed AI decision-making protocol', 110000000.00, 'MARKET_APPROACH', 'UCC-1 2026-001', 'Clarke County, GA', 'Book 5782, Page 262', 'ACTIVE');

-- Create view for total trust valuation
CREATE OR REPLACE VIEW public.trust_total_valuation AS
SELECT 
    COUNT(*) as total_assets,
    SUM(valuation_usd) as total_valuation_usd,
    SUM(CASE WHEN asset_type = 'PATENT' THEN valuation_usd ELSE 0 END) as patent_valuation,
    SUM(CASE WHEN asset_type = 'COPYRIGHT' THEN valuation_usd ELSE 0 END) as copyright_valuation,
    SUM(CASE WHEN asset_type = 'TRADE_SECRET' THEN valuation_usd ELSE 0 END) as trade_secret_valuation,
    SUM(CASE WHEN asset_type = 'TRADEMARK' THEN valuation_usd ELSE 0 END) as trademark_valuation,
    SUM(CASE WHEN status = 'ACTIVE' THEN valuation_usd ELSE 0 END) as active_asset_valuation,
    MAX(updated_at) as last_updated
FROM public.trust_asset_portfolio;

-- Enable RLS (Row Level Security)
ALTER TABLE public.trust_asset_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_licensing_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_royalty_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_asset_valuations ENABLE ROW LEVEL SECURITY;

-- RLS Policies (only service role and authenticated users can access)
CREATE POLICY "Trust assets readable by authenticated users" ON public.trust_asset_portfolio
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Trust assets writable by service role only" ON public.trust_asset_portfolio
    FOR ALL USING (auth.role() = 'service_role');

-- Repeat for other tables
CREATE POLICY "Licensing readable by authenticated" ON public.trust_licensing_agreements
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Licensing writable by service role" ON public.trust_licensing_agreements
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Royalties readable by authenticated" ON public.trust_royalty_payments
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Royalties writable by service role" ON public.trust_royalty_payments
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Valuations readable by authenticated" ON public.trust_asset_valuations
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Valuations writable by service role" ON public.trust_asset_valuations
    FOR ALL USING (auth.role() = 'service_role');

-- Verify deployment
SELECT 
    'IP Asset Ledger deployed successfully' as status,
    total_assets,
    TO_CHAR(total_valuation_usd, '$999,999,999,999.99') as total_valuation,
    TO_CHAR(patent_valuation, '$999,999,999,999.99') as patent_value,
    TO_CHAR(copyright_valuation, '$999,999,999,999.99') as copyright_value,
    TO_CHAR(trade_secret_valuation, '$999,999,999,999.99') as trade_secret_value
FROM public.trust_total_valuation;
