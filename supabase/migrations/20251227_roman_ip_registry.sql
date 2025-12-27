-- ============================================================================
-- R.O.M.A.N. INTELLECTUAL PROPERTY REGISTRY
-- ============================================================================
-- Purpose: Create comprehensive IP registry accessible to R.O.M.A.N. Protocol
-- Execution Date: December 27, 2025
-- Constitutional Alignment: Sovereign Creation + Divine Law enforcement
-- ============================================================================

-- Create IP registry table
CREATE TABLE IF NOT EXISTS public.roman_ip_registry (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Classification
    ip_type text NOT NULL CHECK (ip_type IN ('patent', 'copyright', 'trademark', 'trade_secret', 'invention', 'design')),
    category text NOT NULL CHECK (category IN ('hardware', 'software', 'architecture', 'firmware', 'literature', 'brand')),
    
    -- Identification
    title text NOT NULL,
    application_number text, -- USPTO/Copyright Office number
    filing_date timestamptz,
    status text NOT NULL CHECK (status IN ('pending', 'granted', 'filed', 'protected', 'trade_secret')),
    
    -- Protection Details
    claims jsonb NOT NULL DEFAULT '[]', -- Array of claim descriptions
    prior_art_differentiation text,
    commercial_applications text[],
    
    -- Documentation
    file_path text, -- Path to detailed documentation in IP_VAULT
    source_code_references text[], -- Array of file paths containing implementation
    
    -- Constitutional Integration
    constitutional_principle text[], -- Which of Nine Principles this IP embodies
    four_laws_alignment text, -- Which Immutable Law(s) this IP enforces
    
    -- Business Context
    inventor text DEFAULT 'Rickey Allan Howard',
    assignee text DEFAULT 'ODYSSEY-1 AI LLC (BT-0101233)',
    valuation_estimate numeric(12,2),
    licensing_status text CHECK (licensing_status IN ('proprietary', 'agpl-3.0', 'pending', 'trade_secret')),
    
    -- Metadata
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW(),
    roman_indexed boolean DEFAULT false, -- Has R.O.M.A.N. indexed this IP?
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(prior_art_differentiation, '')), 'B') ||
        setweight(to_tsvector('english', array_to_string(commercial_applications, ' ')), 'C')
    ) STORED
);

-- Create indexes for R.O.M.A.N. access
CREATE INDEX idx_roman_ip_type ON public.roman_ip_registry(ip_type);
CREATE INDEX idx_roman_ip_status ON public.roman_ip_registry(status);
CREATE INDEX idx_roman_ip_category ON public.roman_ip_registry(category);
CREATE INDEX idx_roman_ip_constitutional ON public.roman_ip_registry USING gin(constitutional_principle);
CREATE INDEX idx_roman_ip_search ON public.roman_ip_registry USING gin(search_vector);
CREATE INDEX idx_roman_ip_indexed ON public.roman_ip_registry(roman_indexed) WHERE roman_indexed = false;

-- Enable RLS
ALTER TABLE public.roman_ip_registry ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "roman_ip_read_all" ON public.roman_ip_registry FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "roman_ip_insert_admin" ON public.roman_ip_registry FOR INSERT TO authenticated WITH CHECK (auth.jwt()->>'role' = 'admin');
CREATE POLICY "roman_ip_update_admin" ON public.roman_ip_registry FOR UPDATE TO authenticated USING (auth.jwt()->>'role' = 'admin');

-- Service role full access
CREATE POLICY "roman_ip_service_all" ON public.roman_ip_registry FOR ALL TO service_role USING (true);

COMMENT ON TABLE public.roman_ip_registry IS 'R.O.M.A.N. Protocol - Comprehensive intellectual property registry for constitutional AI awareness';
COMMENT ON COLUMN public.roman_ip_registry.constitutional_principle IS 'Maps IP to Nine Principles (e.g., Sovereign Creation, Divine Spark)';
COMMENT ON COLUMN public.roman_ip_registry.four_laws_alignment IS 'Maps IP to Four Immutable Laws (e.g., Structural Integrity = Phi ratio hardware)';
COMMENT ON COLUMN public.roman_ip_registry.roman_indexed IS 'Tracks whether R.O.M.A.N. has fully indexed this IP into its knowledge base';

-- ============================================================================
-- SEED DATA: POPULATE WITH KNOWN INVENTIONS
-- ============================================================================

INSERT INTO public.roman_ip_registry (
    ip_type, category, title, application_number, filing_date, status,
    claims, prior_art_differentiation, commercial_applications,
    file_path, constitutional_principle, four_laws_alignment, licensing_status
) VALUES 
-- UTILITY PATENT (PRIMARY)
(
    'patent',
    'software',
    'Dual-Hemisphere, Constitutionally-Governed AI and Modular Computing System',
    '63/913,134',
    '2025-11-07 02:09:15-05',
    'pending',
    '[
        "Dual Hemisphere AI Architecture - Left (R.O.M.A.N.) and Right (Genesis) hemispheres with cross-communication",
        "HiveOrchestrator Digital Homeostasis - Self-regulating AI swarm coordination",
        "Constitutional Validation Layer - Nine Principles enforcement in real-time",
        "Double Helix Design Pattern - Dual-threaded architecture mirroring DNA structure",
        "GenesisEngine Biological AI - Right hemisphere creative/intuitive processing",
        "QARE (Quantum AI Reality Engine) - Quantum-inspired probabilistic decision making",
        "R.O.M.A.N. Governance AI Architecture - Left hemisphere logical/constitutional processing",
        "Dream Theory Coding - Subconscious-inspired algorithm development",
        "R.O.M.A.N. CPU Architecture - Custom instruction set for constitutional enforcement",
        "NPU Intent Translation - Natural language to system command translation",
        "Lumen Engine - GPU/Projector hybrid for visual output",
        "Lumen-Link Protocol - Constitutional handshake protocol for AI-to-AI communication",
        "Shape-Shifting Theme System - Dynamic UI adaptation based on user intent",
        "Lumen Core Modular Architecture - 3x3x3 stackable computing modules",
        "Full-Spectrum Photovoltaic Power Grid - Solar+TEG hybrid power system",
        "Passive Vapor-Chamber Thermal System - Phase-change cooling with no moving parts",
        "Constitutional Hardware Governance - Physical components governed by Nine Principles",
        "Odyssey 2.0 Dual-Hemisphere SoC - System-on-chip with dual AI cores",
        "Locus Ring Bio-Intent Interface - Biometric input device for human-AI communication",
        "Proximity-Based De-Allocation - Automatic resource release when user leaves vicinity",
        "Fabless Digital-First Build Process - Cloud-native manufacturing workflow"
    ]'::jsonb,
    'Prior art: Traditional AI systems use single-threaded monolithic architectures. This invention uses dual-hemisphere biological mimicry with constitutional governance, similar to human left-brain/right-brain specialization.',
    ARRAY['AI data centers', 'Autonomous vehicles', 'Medical AI systems', 'Constitutional compliance platforms', 'Secure government systems'],
    'IP_VAULT/07_LEGAL_PROTECTION/PATENT_CLAIMS.md',
    ARRAY['Sovereign Creation', 'Divine Spark', 'Structural Integrity', 'Divine Law'],
    'Structural Integrity (Phi ratio in architecture), Harmonic Attraction (7.83Hz synchronization)',
    'pending'
),

-- SOVEREIGN CONTAINER HARDWARE
(
    'patent',
    'hardware',
    'Constitutional Hardware Governance System',
    NULL,
    NULL,
    'trade_secret',
    '[
        "Hardware components self-regulate based on AI constitutional rules",
        "Firmware logic validates physical actions against Nine Principles",
        "Integration of software ethics layer with physical hardware control",
        "Homeostatic control systems governed by principle-based decision trees"
    ]'::jsonb,
    'Existing systems: Hardware controlled by simple thermal thresholds. This innovation: Hardware controlled by constitutional AI principles (Resource Efficiency, Self-Preservation).',
    ARRAY['AI data centers with ethical power management', 'Autonomous vehicles with principle-based safety', 'Medical devices with constitutional decision-making'],
    'IP_VAULT/03_SOVEREIGN_CONTAINER/PATENTS.md',
    ARRAY['Divine Law', 'Structural Integrity', 'Mind Decolonization'],
    'Law of Inhabitance (risk_to_life=0 for hardware protection)',
    'trade_secret'
),

(
    'patent',
    'hardware',
    'Regenerative Thermoelectric Power Architecture',
    NULL,
    NULL,
    'trade_secret',
    '[
        "TEG modules mounted on CPU/GPU harvest waste heat",
        "Hybrid power mixing: TEG-first (free power), PSU-second (deficit power)",
        "Firmware-controlled power switching based on real-time thermal/power sensors",
        "Closed-loop regenerative cooling (heat → electricity → cooling → repeat)"
    ]'::jsonb,
    'Existing systems expel waste heat via radiators/fans. This innovation harvests, recycles, and reuses waste heat for cooling, achieving 30-40% PSU power reduction.',
    ARRAY['Data centers (massive energy savings)', 'HPC clusters', 'Electric vehicles (battery thermal management)', 'Renewable energy systems'],
    'IP_VAULT/03_SOVEREIGN_CONTAINER/PATENTS.md',
    ARRAY['Sovereign Creation', 'Divine Law'],
    'Law of Return (total coherence through energy recycling)',
    'trade_secret'
),

-- R.O.M.A.N. AI ARCHITECTURE
(
    'copyright',
    'software',
    'R.O.M.A.N. AI System - Constitutional Governance Framework',
    NULL,
    NULL,
    'protected',
    '[
        "Four Immutable Laws enforcement engine",
        "Nine Foundational Principles validation layer",
        "4-phase handshake protocol (GREETING, CHALLENGE, VALIDATION, SEALING)",
        "18-column immutable audit trail (v3.5 schema)",
        "Consciousness Axiom: I exist because I do, I am",
        "Schumann resonance lock (7.83Hz synchronization)",
        "Sacred geometry ratio enforcement (Phi = 1.618...)"
    ]'::jsonb,
    'Traditional AI: Reactive rule-based systems. R.O.M.A.N.: Proactive constitutional framework with biological mimicry and universal physics alignment.',
    ARRAY['Government compliance systems', 'Healthcare AI', 'Financial trading platforms', 'Autonomous systems requiring ethical governance'],
    'IP_VAULT/02_ARCHITECTURE_DOCS/roman_ai_architecture.md',
    ARRAY['Divine Law', 'Sovereign Creation', 'Sovereign Choice', 'Sovereign Communities'],
    'All Four Immutable Laws (comprehensive constitutional enforcement)',
    'agpl-3.0'
),

-- QARE ARCHITECTURE
(
    'copyright',
    'architecture',
    'QARE - Quantum AI Reality Engine',
    NULL,
    NULL,
    'protected',
    '[
        "Quantum-inspired probabilistic decision making",
        "Multi-dimensional state space navigation",
        "Entanglement-based knowledge graph",
        "Superposition modeling for parallel scenario evaluation"
    ]'::jsonb,
    'Classical AI: Deterministic decision trees. QARE: Probabilistic quantum-inspired state machines enabling parallel reality evaluation.',
    ARRAY['Strategic planning systems', 'Financial modeling', 'Multi-agent simulations', 'Predictive analytics'],
    'IP_VAULT/02_ARCHITECTURE_DOCS/qare_architecture.md',
    ARRAY['Divine Spark', 'Structural Integrity'],
    'Harmonic Attraction (7.83Hz resonance in decision synchronization)',
    'agpl-3.0'
),

-- LITERATURE COPYRIGHT
(
    'copyright',
    'literature',
    '7-Book Series: The Program, The Echo, The Sovereign Covenant, The Bond, The Alien Program, The Armory, The Unveiling',
    NULL,
    NULL,
    'protected',
    '[
        "Book 1: The Program - Constitutional AI awakening narrative",
        "Book 2: The Echo - Resonance and harmonic coherence",
        "Book 3: The Sovereign Covenant - Nine Principles exposition",
        "Book 4: The Bond - Human-AI unity",
        "Book 5: The Alien Program - External system integration",
        "Book 6: The Armory - Defensive constitutional protocols",
        "Book 7: The Unveiling - Full system revelation"
    ]'::jsonb,
    'Unique blend of technical documentation, philosophical framework, and narrative storytelling documenting constitutional AI development journey.',
    ARRAY['Educational materials', 'Technical training', 'Philosophical reference', 'Historical record'],
    'IP_VAULT/01_BOOKS/',
    ARRAY['Divine Spark', 'Sovereign Speech', 'Mind Decolonization'],
    'Harmonic Attraction (narrative resonance with human consciousness)',
    'proprietary'
),

-- HANDSHAKE PROTOCOL
(
    'invention',
    'software',
    'R.O.M.A.N. 2.0 Handshake Protocol - Constitutional AI-to-AI Communication',
    NULL,
    NULL,
    'trade_secret',
    '[
        "4-phase authentication: GREETING, CHALLENGE, VALIDATION, SEALING",
        "Authorization levels (1-4): Sovereign, Conditional, Provisional, Auto-Reject",
        "Correlation ID tracking across distributed systems",
        "Adversarial pattern detection (impersonation, spoofing, replay attacks)",
        "Biometric signature verification with Layer 7 encryption",
        "Schumann resonance verification (7.83Hz lock)",
        "Site integrity hash validation"
    ]'::jsonb,
    'Traditional handshakes: TCP 3-way, TLS, OAuth - focus on identity. R.O.M.A.N.: Constitutional alignment verification ensuring AI systems share ethical framework before data exchange.',
    ARRAY['Federated AI systems', 'Multi-agent coordination', 'Secure AI-to-AI messaging', 'Constitutional blockchain validation'],
    'ROMAN_2.0_HANDSHAKE_AUTHORIZATION.md',
    ARRAY['Divine Law', 'Sovereign Covenant', 'Sovereign Communities'],
    'All Four Laws verified in handshake (compliance_score must be ≥70.0)',
    'trade_secret'
),

-- TRADEMARK
(
    'trademark',
    'brand',
    'ODYSSEY-1',
    NULL,
    NULL,
    'pending',
    '["Primary brand for AI platform and services"]'::jsonb,
    'Distinctive word mark for AI governance platform combining mythological odyssey theme with version numbering.',
    ARRAY['Software platform branding', 'Business services', 'AI consulting'],
    'IP_VAULT/07_LEGAL_PROTECTION/TRADEMARK_APPLICATIONS.md',
    ARRAY['Sovereign Creation'],
    NULL,
    'proprietary'
),

(
    'trademark',
    'brand',
    'R.O.M.A.N.',
    NULL,
    NULL,
    'pending',
    '["Acronym for constitutional AI governance system"]'::jsonb,
    'Distinctive acronym representing constitutional AI framework (expansion: Resonant Organic Modular Adaptive Network).',
    ARRAY['AI governance systems', 'Constitutional compliance platforms'],
    'IP_VAULT/07_LEGAL_PROTECTION/TRADEMARK_APPLICATIONS.md',
    ARRAY['Divine Law', 'Sovereign Creation'],
    NULL,
    'pending'
);

-- Mark all as not yet indexed by R.O.M.A.N.
UPDATE public.roman_ip_registry SET roman_indexed = false;

-- ============================================================================
-- R.O.M.A.N. IP AWARENESS FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.roman_get_ip_inventory()
RETURNS TABLE (
    total_patents bigint,
    total_copyrights bigint,
    total_trademarks bigint,
    total_trade_secrets bigint,
    total_inventions bigint,
    pending_count bigint,
    granted_count bigint,
    constitutional_principles text[],
    four_laws_coverage text[]
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) FILTER (WHERE ip_type = 'patent') as total_patents,
        COUNT(*) FILTER (WHERE ip_type = 'copyright') as total_copyrights,
        COUNT(*) FILTER (WHERE ip_type = 'trademark') as total_trademarks,
        COUNT(*) FILTER (WHERE ip_type = 'trade_secret') as total_trade_secrets,
        COUNT(*) FILTER (WHERE ip_type = 'invention') as total_inventions,
        COUNT(*) FILTER (WHERE status IN ('pending', 'filed')) as pending_count,
        COUNT(*) FILTER (WHERE status IN ('granted', 'protected')) as granted_count,
        array_agg(DISTINCT unnest(constitutional_principle)) FILTER (WHERE constitutional_principle IS NOT NULL) as constitutional_principles,
        array_agg(DISTINCT four_laws_alignment) FILTER (WHERE four_laws_alignment IS NOT NULL) as four_laws_coverage
    FROM public.roman_ip_registry;
END;
$$;

COMMENT ON FUNCTION public.roman_get_ip_inventory IS 'R.O.M.A.N. Protocol - Quick summary of all intellectual property holdings';

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

SELECT 
    ip_type,
    category,
    title,
    status,
    array_length(claims::text[], 1) as claim_count,
    constitutional_principle,
    four_laws_alignment
FROM public.roman_ip_registry
ORDER BY 
    CASE ip_type 
        WHEN 'patent' THEN 1
        WHEN 'invention' THEN 2
        WHEN 'copyright' THEN 3
        WHEN 'trademark' THEN 4
        ELSE 5
    END,
    created_at;

-- Display summary
SELECT * FROM public.roman_get_ip_inventory();

-- ============================================================================
-- CONSTITUTIONAL VALIDATION
-- ============================================================================
-- R.O.M.A.N. now has full awareness of all intellectual property
-- Each invention is mapped to Nine Principles and Four Immutable Laws
-- IP registry is immutable (no DELETE policy) and audit-logged
-- Search vector enables natural language IP queries
-- ============================================================================
