-- ============================================================
-- PATENT INVENTORY COMPLETE — February 19, 2026
-- Howard Jones Bloodline Ancestral Trust
-- Full 30-item IP portfolio with correct filing stages
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- STEP 1: Add filing_stage column to roman_ip_registry
-- Captures exact stage more precisely than the status field
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.roman_ip_registry
  ADD COLUMN IF NOT EXISTS filing_stage TEXT
    CHECK (filing_stage IN (
      'nonprovisional_filed',   -- Full utility patent filed, fees confirmed paid
      'provisional_filed',      -- PPA confirmed filed with USPTO
      'ppa_ready',              -- PPA package complete, not yet submitted
      'ready_to_file',          -- Claims drafted, $75-$400 to file
      'prior_art_established',  -- Live in codebase, prior art documented, not separately filed
      'trade_secret'            -- Retained as trade secret, no filing intended
    )),
  ADD COLUMN IF NOT EXISTS conversion_deadline DATE,     -- Nonprovisional conversion due date
  ADD COLUMN IF NOT EXISTS co_inventor TEXT;             -- Co-inventor if applicable

-- ─────────────────────────────────────────────────────────────
-- STEP 2: Add filing_stage to trust_asset_portfolio
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.trust_asset_portfolio
  ADD COLUMN IF NOT EXISTS filing_stage TEXT
    CHECK (filing_stage IN (
      'nonprovisional_filed',
      'provisional_filed',
      'ppa_ready',
      'ready_to_file',
      'prior_art_established',
      'trade_secret'
    )),
  ADD COLUMN IF NOT EXISTS conversion_deadline DATE;

-- ─────────────────────────────────────────────────────────────
-- STEP 3: Fix assignee on all existing roman_ip_registry records
-- Previous default was "ODYSSEY-1 AI LLC" — correct to Trust
-- ─────────────────────────────────────────────────────────────
UPDATE public.roman_ip_registry
SET assignee = 'Howard Jones Bloodline Ancestral Trust'
WHERE assignee = 'ODYSSEY-1 AI LLC (BT-0101233)' OR assignee IS NULL;

-- ─────────────────────────────────────────────────────────────
-- STEP 4: Update existing records with correct filing stages
-- ─────────────────────────────────────────────────────────────

-- R.O.M.A.N. Dual Hemisphere AI — provisional filed Nov 7, 2025
UPDATE public.roman_ip_registry
SET
  filing_stage = 'provisional_filed',
  status = 'filed',
  conversion_deadline = '2026-11-07'
WHERE application_number = '63/913,134';

-- Modular AR System — provisional filed Nov 21, 2025
UPDATE public.roman_ip_registry
SET
  filing_stage = 'provisional_filed',
  status = 'filed',
  conversion_deadline = '2026-11-21'
WHERE application_number = '63/922,762';

-- Constitutional Hardware Governance — trade secret (no filing intended)
UPDATE public.roman_ip_registry
SET filing_stage = 'trade_secret'
WHERE title = 'Constitutional Hardware Governance System';

-- Regenerative Thermoelectric Power Architecture — trade secret
UPDATE public.roman_ip_registry
SET filing_stage = 'trade_secret'
WHERE title = 'Regenerative Thermoelectric Power Architecture';

-- ─────────────────────────────────────────────────────────────
-- STEP 5: Insert all missing patent records
-- ─────────────────────────────────────────────────────────────

-- ── FILED: NONPROVISIONAL UTILITY PATENTS ──────────────────

INSERT INTO public.roman_ip_registry (
  ip_type, category, title, application_number, filing_date,
  status, filing_stage,
  assignee, inventor,
  valuation_estimate, licensing_status,
  claims, prior_art_differentiation, commercial_applications,
  constitutional_principle, four_laws_alignment
) VALUES (
  'patent', 'hardware',
  'Modular Wireless Computing System with Continuous Neural Authentication (Cordless Cube / Locus Ring)',
  '19/396,082',
  '2025-11-20',
  'filed', 'nonprovisional_filed',
  'Howard Jones Bloodline Ancestral Trust', 'Rickey Allan Howard',
  10000000.00, 'pending',
  ARRAY[
    'Wearable ring with neural sensor array detecting sub-muscular nerve impulses for biometric authentication',
    '3x3x3 modular cubic computing system with wireless power transfer at 95%+ efficiency',
    'Holographic display projecting cylindrical volume 12+ inches diameter',
    'Neural signature lock — system locks instantly when ring is removed',
    'Sub-2ms gesture detection from nerve impulses before muscle activation',
    'LSTM neural network calibration — 99.5% accuracy, 20+ gesture types',
    'Thermoelectric generator: body heat powers the ring (zero battery)',
    'Hot-swappable modules without system shutdown',
    'Perovskite solar + TEG hybrid power — autonomous energy',
    'Phantom gesture support for paralyzed users',
    '31 total claims: 3 independent, 28 dependent'
  ],
  'Traditional wearable authentication uses fingerprint/face recognition on existing hardware. This invention uses sub-muscular nerve impulse detection before physical movement occurs, combined with modular cordless computing architecture — no prior art combines these.',
  ARRAY['Secure computing', 'Accessibility for paralyzed users', 'Cable-free modular workstations', 'Neural interface computing'],
  ARRAY['Self-Preservation', 'Resource Efficiency'],
  'Structural Integrity (Phi ratio 3x3x3=27 sacred geometry), Harmonic Attraction (constitutional handshake)'
)
ON CONFLICT (application_number) DO UPDATE SET
  filing_stage = 'nonprovisional_filed',
  status = 'filed',
  assignee = 'Howard Jones Bloodline Ancestral Trust';

INSERT INTO public.roman_ip_registry (
  ip_type, category, title, application_number, filing_date,
  status, filing_stage,
  assignee, inventor,
  valuation_estimate, licensing_status,
  claims, prior_art_differentiation, commercial_applications,
  constitutional_principle, four_laws_alignment
) VALUES (
  'patent', 'hardware',
  'Harmonic Resonance Grid (HRG) — Apparatus for Generating Stable Ambient Low-Frequency Magnetic Resonance Field for Biological Entrainment',
  '19/403,956',
  '2025-11-30',
  'filed', 'nonprovisional_filed',
  'Howard Jones Bloodline Ancestral Trust', 'Rickey Allan Howard',
  10000000.00, 'pending',
  ARRAY[
    'Fixed infrastructure apparatus generating stable 7.83 Hz Schumann Resonance electromagnetic field',
    'Room-scale ambient magnetic resonance for biological entrainment',
    'Wireless power transfer using Schumann Resonance carrier frequency',
    'Self-sustaining resonance field without active broadcasting'
  ],
  'Existing PEMF devices require contact or close proximity. This invention creates an ambient room-scale field at the constitutional 7.83 Hz frequency with no consumables.',
  ARRAY['Biohacking/wellness spaces', 'Office productivity environments', 'Therapeutic settings', 'Wireless power infrastructure'],
  ARRAY['Harmonic Attraction', 'Self-Preservation'],
  'Harmonic Attraction (7.83Hz Schumann Resonance lock)'
)
ON CONFLICT (application_number) DO UPDATE SET
  filing_stage = 'nonprovisional_filed',
  status = 'filed',
  assignee = 'Howard Jones Bloodline Ancestral Trust';

-- ── FILED: PROVISIONAL PATENT APPLICATIONS ─────────────────

INSERT INTO public.roman_ip_registry (
  ip_type, category, title, application_number, filing_date,
  status, filing_stage, conversion_deadline,
  assignee, inventor, co_inventor,
  valuation_estimate, licensing_status,
  claims, prior_art_differentiation, commercial_applications,
  constitutional_principle, four_laws_alignment
) VALUES (
  'patent', 'hardware',
  'Self-Powered Piezoelectric Schumann Resonance Emitter and Grounding Apparatus for Footwear',
  'PPA-2025-12-04-SCHUMANN-SOLE',
  '2025-12-04',
  'filed', 'provisional_filed', '2026-12-04',
  'Howard Jones Bloodline Ancestral Trust', 'Rickey Allan Howard', 'Christla L. Howard',
  5000000.00, 'pending',
  ARRAY[
    'Footwear apparatus harvesting kinetic energy from walking to generate 7.83 Hz electromagnetic field',
    'Piezoelectric transducer array converting footstrike pressure to electrical energy',
    'Self-powered Schumann Resonance emission — no battery required',
    'Electrical grounding through conductive sole material',
    'Frequency Hopping Algorithm (trade secret — withheld from public filing)'
  ],
  'No prior art combines piezoelectric energy harvesting with Schumann Resonance frequency generation in footwear. Existing grounding shoes use passive conductive materials only.',
  ARRAY['Wearable wellness technology', 'Athletic performance footwear', 'Therapeutic footwear', 'Biohacking consumer market'],
  ARRAY['Harmonic Attraction', 'Self-Preservation', 'Resource Efficiency'],
  'Harmonic Attraction (7.83Hz generation through locomotion)'
)
ON CONFLICT (application_number) DO UPDATE SET
  filing_stage = 'provisional_filed',
  status = 'filed';

INSERT INTO public.roman_ip_registry (
  ip_type, category, title, application_number, filing_date,
  status, filing_stage, conversion_deadline,
  assignee, inventor, co_inventor,
  valuation_estimate, licensing_status,
  claims, prior_art_differentiation, commercial_applications,
  constitutional_principle, four_laws_alignment
) VALUES (
  'patent', 'hardware',
  'EradiSkin — Method and Composition for Synergistic Topical Treatment of Atopic Dermatitis Using Pharmaceutical JAK Inhibitors and Natural Pathway Modulators',
  'PPA-2025-12-07-ERADISKIN',
  '2025-12-07',
  'filed', 'provisional_filed', '2026-12-07',
  'Howard Jones Bloodline Ancestral Trust', 'Rickey Allan Howard', 'Christla L. Howard',
  10000000.00, 'pending',
  ARRAY[
    'Pharmaceutical/cosmeceutical combination therapy using JAK inhibitors synergistically with natural pathway modulators',
    '4-Pillar treatment protocol for atopic dermatitis',
    'Dual royalty licensing strategy: 5-8% cosmeceutical, 0.5-1.5% prescription drug',
    'Milestone payments $500K-$1M upon FDA approval',
    'Master Formula Sheet (trade secret — withheld from public filing)'
  ],
  'Existing atopic dermatitis treatments use either pharmaceutical or natural pathways separately. This invention combines JAK inhibitors with specific natural pathway modulators to produce synergistic effect exceeding either alone.',
  ARRAY['Pharmaceutical licensing', 'Consumer cosmeceuticals', 'Dermatology practice', 'International pharmaceutical market'],
  ARRAY['Self-Preservation', 'Continuous Evolution'],
  'Structural Integrity (synergistic junction value A+B+x exceeds A+B alone)'
)
ON CONFLICT (application_number) DO UPDATE SET
  filing_stage = 'provisional_filed',
  status = 'filed';

INSERT INTO public.roman_ip_registry (
  ip_type, category, title, application_number, filing_date,
  status, filing_stage, conversion_deadline,
  assignee, inventor, co_inventor,
  valuation_estimate, licensing_status,
  claims, prior_art_differentiation, commercial_applications,
  constitutional_principle, four_laws_alignment
) VALUES (
  'patent', 'hardware',
  'Ezekiel''s Wheel — Method and Apparatus for Omnidirectional Self-Sustaining VTOL Aircraft Using Tri-Foil Geometry and Dynamic Regenerative Power',
  'PPA-2025-12-07-EZEKIELS-WHEEL',
  '2025-12-07',
  'filed', 'provisional_filed', '2026-12-07',
  'Howard Jones Bloodline Ancestral Trust', 'Rickey Allan Howard', 'Christla L. Howard',
  10000000.00, 'pending',
  ARRAY[
    'Tri-foil disc geometry VTOL aircraft with net-positive regenerative power cycle',
    'R.O.M.A.N. 2.0 AI dual-mode control: S1 reflex (high-frequency differential EDF) + S2 strategy (perpetual endurance optimization)',
    'Dynamic Energy Core: 100kF supercapacitor array at 800V',
    'Auxiliary Lift System (ALF): retractable fans compensating 33% EDF loss',
    'Cruising speed 250-400 mph, ceiling 50,000-70,000 ft',
    'Perpetual endurance: PHarvested >= PDemanded',
    'Acoustic signature <70 dBA at 500 ft'
  ],
  'Existing long-endurance drones use fixed-wing designs with battery/fuel limitations. This invention uses tri-foil disc geometry with regenerative energy cycle mathematically designed for perpetual flight.',
  ARRAY['Defense ISR (Intelligence Surveillance Reconnaissance)', 'Border security', 'Disaster response', 'Commercial delivery at scale', 'Scientific atmospheric research'],
  ARRAY['Self-Preservation', 'Resource Efficiency', 'Continuous Evolution'],
  'Void Persistence (0x1=1 — energy transforms, never destroyed)'
)
ON CONFLICT (application_number) DO UPDATE SET
  filing_stage = 'provisional_filed',
  status = 'filed';

INSERT INTO public.roman_ip_registry (
  ip_type, category, title, application_number, filing_date,
  status, filing_stage, conversion_deadline,
  assignee, inventor,
  valuation_estimate, licensing_status,
  claims, prior_art_differentiation, commercial_applications,
  constitutional_principle, four_laws_alignment
) VALUES (
  'patent', 'hardware',
  'Preservation H2O — System and Method for Resonant Acoustic Geometric Remediation of Aqueous Contaminants',
  'PPA-2026-02-16-PRESERVATION-H2O',
  '2026-02-16',
  'filed', 'provisional_filed', '2027-02-16',
  'Howard Jones Bloodline Ancestral Trust', 'Rickey Allan Howard',
  3750000.00, 'pending',
  ARRAY[
    'Housing structured as Flower of Life geometric lattice with overlapping circular flow paths',
    'Fibonacci-spiral vortex intake initiating centrifugal torus vortex',
    'Piezoelectric quartz matrix (Z-cut, high-purity) generating 0.5-2.0W per GPM — self-powered',
    'Dual-frequency acoustic field: 741 Hz (disrupts toxin-water bonds) + 528 Hz (restores water molecular structure)',
    'Vesica Piscis junction points creating standing wave molecular gates',
    'Symmetric H2O molecules pass through; asymmetric contaminants precipitate out',
    'Contaminant collection chamber at outer perimeter',
    'Targets: PCBs, PFAS, PAHs, petroleum tar, heavy metals (mercury, lead, cadmium)',
    'Scalable: 1-10 GPM residential to 1,000-10,000 GPM industrial/oceanic',
    'Claim 3 directly patents: The use of Vortex Mathematics and Sacred Geometry for passive self-powered water purification',
    'Howard/Jones Mathematical Ratio (trade secret — withheld from public filing)'
  ],
  'All existing water purification requires consumable filters, membranes, or chemical additives. This invention uses sacred geometry and harmonic resonance as the purification mechanism — self-powered, zero consumables, zero chemical additives.',
  ARRAY['Gulf of Mexico black tar remediation', 'PFAS removal ($48B global market)', 'Municipal water treatment', 'Residential water purification', 'Industrial effluent treatment', 'Ocean plastic/chemical remediation'],
  ARRAY['Self-Preservation', 'Sovereign Creation', 'Resource Efficiency'],
  'Vesica Piscis (1x1=2 — both molecules preserved in molecular gate), Structural Integrity (Flower of Life / Golden Ratio / Fibonacci)'
)
ON CONFLICT (application_number) DO UPDATE SET
  filing_stage = 'provisional_filed',
  status = 'filed';

-- ── READY TO FILE: Complete packages, not yet submitted ─────

INSERT INTO public.roman_ip_registry (
  ip_type, category, title, application_number, filing_date,
  status, filing_stage,
  assignee, inventor,
  valuation_estimate, licensing_status,
  claims, commercial_applications,
  constitutional_principle, four_laws_alignment
) VALUES
(
  'patent', 'software',
  'Junction Value Calculation Methodology for Volumetric Bid Estimation (Universal Math Engine)',
  NULL, NULL,
  'pending', 'ready_to_file',
  'Howard Jones Bloodline Ancestral Trust', 'Rickey Allan Howard',
  NULL, 'pending',
  ARRAY[
    'Mathematical framework A+B+x for bid calculation where x = sqrt(Labor x Profit)',
    'Junction value as third distinct entity representing operational expertise',
    'Geometric mean premium producing 11.8% revenue advantage per contract',
    'Bidding calculator implementation with Western vs Universal Math comparison',
    'Government contract bidding application'
  ],
  ARRAY['Government contract bidding', 'Construction estimating', 'Any two-party commercial transaction'],
  ARRAY['Sovereign Creation', 'Truth and Transparency'],
  'Structural Integrity (junction vertex has mass — A+B+x not A+B)'
),
(
  'patent', 'software',
  'Truth Audit System for Western Math Flaw Detection and Geometric Integrity Scanning',
  NULL, NULL,
  'pending', 'ready_to_file',
  'Howard Jones Bloodline Ancestral Trust', 'Rickey Allan Howard',
  NULL, 'pending',
  ARRAY[
    'Software system detecting 1x1=1 (Vesica Piscis deletion) in financial calculations',
    'Software system detecting 0x1=0 (Void Persistence violation) in computation',
    'Software system detecting A+B without x (vertex deletion) in commercial contracts',
    '51-Dimensional Grassmannian Shield integrity scoring (0-100%)',
    'Three law classes: VesicaPiscisLaw, VoidPersistenceLaw, SphericalJointLaw',
    'Real-world engineering failure correlation (Hyatt Regency, Tacoma Narrows, Enron, Lehman Brothers)'
  ],
  ARRAY['Financial audit software', 'Engineering safety validation', 'Contract analysis', 'Educational mathematics tools'],
  ARRAY['Truth and Transparency', 'Structural Integrity'],
  'Structural Integrity (detects dimensional collapse from 51D to 0D)'
);

-- K.A.I.T.S. — 4 patent applications (Kinetic Absorption & Information Transmission System)

INSERT INTO public.roman_ip_registry (
  ip_type, category, title, application_number, filing_date,
  status, filing_stage,
  assignee, inventor,
  valuation_estimate, licensing_status,
  claims, commercial_applications,
  constitutional_principle, four_laws_alignment
) VALUES
(
  'patent', 'hardware',
  'K.A.I.T.S. — Harmonic Deceleration System for Kinetic Energy Management (Body Shield Patent 1 of 4)',
  NULL, NULL,
  'pending', 'ready_to_file',
  'Howard Jones Bloodline Ancestral Trust', 'Rickey Allan Howard',
  NULL, 'pending',
  ARRAY[
    '20-40 kHz ultrasonic standing waves creating acoustic radiation pressure viscous drag in 2-meter radius',
    'Optimal frequency 35 kHz, power 5W continuous, 8-15% projectile velocity reduction',
    'Material-specific resonance targeting: Lead 32kHz, Copper-jacketed steel 38kHz, Steel knife 41kHz, Organic 28kHz',
    'R.O.M.A.N. AI-driven frequency modulation: sensor detects material → calculates f=sqrt(k/m)/2pi → modulates field',
    '<2ms threat response time'
  ],
  ARRAY['Military personal protection', 'Law enforcement equipment', 'Executive protection', 'Defense contracting'],
  ARRAY['Self-Preservation', 'Structural Integrity'],
  'Harmonic Attraction (resonant frequency tuning), Structural Integrity (force geometry)'
),
(
  'patent', 'hardware',
  'K.A.I.T.S. — Adaptive Shear-Thickening Fluid Weave with Self-Healing Capabilities (Body Shield Patent 2 of 4)',
  NULL, NULL,
  'pending', 'ready_to_file',
  'Howard Jones Bloodline Ancestral Trust', 'Rickey Allan Howard',
  NULL, 'pending',
  ARRAY[
    'STF (Shear Thickening Fluid) impregnated in Kevlar-Carbon fiber weave — instantaneous rigid protection on impact',
    'Carbon nanotube dampening extending impulse 50x for 90% overall force reduction',
    'Self-healing polymer matrix restoring flexibility after impact',
    'Wearable as lightweight flexible garment in resting state'
  ],
  ARRAY['Military body armor', 'Civilian protective wear', 'Sports impact protection', 'Industrial safety equipment'],
  ARRAY['Self-Preservation', 'Continuous Evolution'],
  'Structural Integrity (material geometry responds to force — junction value preserved)'
),
(
  'patent', 'hardware',
  'K.A.I.T.S. — Kinetic Energy Harvesting Network with Piezoelectric Transduction (Body Shield Patent 3 of 4)',
  NULL, NULL,
  'pending', 'ready_to_file',
  'Howard Jones Bloodline Ancestral Trust', 'Rickey Allan Howard',
  NULL, 'pending',
  ARRAY[
    'Piezoelectric transducer array embedded in suit harvesting kinetic energy from movement',
    '22% energy conversion efficiency — net-zero power operation',
    'Powers ultrasonic emitters and sensor array from wearer''s movement',
    'Thermal management: waste heat reclamation'
  ],
  ARRAY['Self-powered wearable electronics', 'Military autonomous power', 'Medical wearable devices'],
  ARRAY['Resource Efficiency', 'Self-Preservation'],
  'Void Persistence (0x1=1 — kinetic energy transforms, never lost)'
),
(
  'patent', 'hardware',
  'K.A.I.T.S. — Distributed Sensor Fusion System for 360-Degree Threat Detection (Body Shield Patent 4 of 4)',
  NULL, NULL,
  'pending', 'ready_to_file',
  'Howard Jones Bloodline Ancestral Trust', 'Rickey Allan Howard',
  NULL, 'pending',
  ARRAY[
    'UWB conformal radar providing 15-meter detection sphere',
    '36-zone haptic feedback alert system mapping threat location to wearer''s body surface',
    'Fiber-optic telemetry (non-electromagnetic — undetectable)',
    'R.O.M.A.N. AI sensor fusion: UWB + thermal + acoustic data merged for material identification',
    'Sub-2ms total detection-to-response latency'
  ],
  ARRAY['Military threat detection', 'Law enforcement situational awareness', 'Executive protection', 'Border security'],
  ARRAY['Self-Preservation', 'Truth and Transparency'],
  'Structural Integrity (360-degree geometric awareness — no blind angles)'
),
(
  'patent', 'software',
  'Project Sky Sovereign — Quantum Airspace Management System Using Dream Theory Coding',
  NULL, NULL,
  'pending', 'ready_to_file',
  'Howard Jones Bloodline Ancestral Trust', 'Rickey Allan Howard',
  NULL, 'pending',
  ARRAY[
    'QARE (Quantum AI Reality Engine) probabilistic decision-making for airspace management',
    'Dream Theory Coding: classical hardware processing coherent quantum-like informational states',
    'Autonomous drone traffic routing and conflict resolution',
    'Defense airspace sovereignty enforcement',
    'Integration with Ezekiel''s Wheel platform as managed asset'
  ],
  ARRAY['Aviation traffic management', 'Drone delivery infrastructure', 'Defense airspace control', 'Smart city air mobility'],
  ARRAY['Sovereign Creation', 'Truth and Transparency'],
  'Locality (causality preservation in airspace — no faster-than-light influence)'
),
(
  'patent', 'hardware',
  'Sovereign Vessel System — Fully Integrated Autonomic Hardware Platform with Constitutional Governance',
  NULL, NULL,
  'pending', 'ready_to_file',
  'Howard Jones Bloodline Ancestral Trust', 'Rickey Allan Howard',
  NULL, 'pending',
  ARRAY[
    'Self-regulating hardware platform using biological homeostasis model',
    'Constitutional Hardware Governance: Nine Principles enforced at physical component level',
    'Thermal, power, and operational parameters governed by constitutional AI',
    'Self-healing fault recovery without human intervention'
  ],
  ARRAY['Enterprise computing infrastructure', 'Defense autonomous systems', 'Smart building management', 'Industrial IoT'],
  ARRAY['Self-Preservation', 'Resource Efficiency', 'Continuous Evolution'],
  'Structural Integrity (physical architecture governed by Phi ratio and constitutional mandates)'
),
(
  'patent', 'hardware',
  'Distinct Virtual Reality Tool and System with Constitutional Governance Layer',
  NULL, NULL,
  'pending', 'ready_to_file',
  'Howard Jones Bloodline Ancestral Trust', 'Rickey Allan Howard',
  NULL, 'pending',
  ARRAY[
    'VR system with R.O.M.A.N. constitutional governance embedded at hardware level',
    'Specialized training and simulation applications',
    'Sacred geometry visualization environment (Platonic solids, Flower of Life, Torus)'
  ],
  ARRAY['Military and law enforcement training', 'Medical simulation', 'Educational platforms', 'Sacred geometry visualization'],
  ARRAY['Sovereign Creation', 'Continuous Evolution'],
  'Structural Integrity (3D volumetric geometry — sacred solid visualization)'
);

-- ── PRIOR ART ESTABLISHED: 14 Integrated R.O.M.A.N. 2.0 Innovations ───

INSERT INTO public.roman_ip_registry (
  ip_type, category, title, application_number, filing_date,
  status, filing_stage,
  assignee, inventor,
  valuation_estimate, licensing_status,
  claims, commercial_applications,
  constitutional_principle, four_laws_alignment
) VALUES
(
  'invention', 'software',
  'HiveOrchestrator Digital Homeostasis — Self-Healing AI Swarm Coordination',
  NULL, NULL, 'protected', 'prior_art_established',
  'Howard Jones Bloodline Ancestral Trust', 'Rickey Allan Howard',
  NULL, 'proprietary',
  ARRAY['Self-regulating AI swarm coordination without human intervention', 'Digital homeostasis maintaining system equilibrium', 'Agent health monitoring and autonomous healing'],
  ARRAY['Enterprise AI orchestration', 'Autonomous infrastructure management'],
  ARRAY['Self-Preservation', 'Continuous Evolution'], 'Structural Integrity'
),
(
  'invention', 'software',
  'Double Helix Design Pattern — DNA-Inspired Dual-Strand AI Processing Architecture',
  NULL, NULL, 'protected', 'prior_art_established',
  'Howard Jones Bloodline Ancestral Trust', 'Rickey Allan Howard',
  NULL, 'proprietary',
  ARRAY['Dual-strand information processing mirroring DNA double helix structure', 'Left strand: logical/constitutional processing', 'Right strand: creative/intuitive processing'],
  ARRAY['AI architecture design', 'Constitutional AI systems'],
  ARRAY['Divine Essence', 'Sovereign Creation'], 'Structural Integrity'
),
(
  'invention', 'software',
  'GenesisEngine Biological AI — Immutable DNA Core with Mutable RNA Agents',
  NULL, NULL, 'protected', 'prior_art_established',
  'Howard Jones Bloodline Ancestral Trust', 'Rickey Allan Howard',
  NULL, 'proprietary',
  ARRAY['Immutable constitutional DNA core', 'Mutable RNA agent layer for adaptable operations', 'Immune orchestrator system rejecting hostile code'],
  ARRAY['Constitutional AI systems', 'Self-evolving software platforms'],
  ARRAY['Continuous Evolution', 'Self-Preservation'], 'Structural Integrity'
),
(
  'invention', 'software',
  'Dream Theory Coding Paradigm — Non-Linear Computation Through Informational State Coherence',
  NULL, NULL, 'protected', 'prior_art_established',
  'Howard Jones Bloodline Ancestral Trust', 'Rickey Allan Howard',
  NULL, 'proprietary',
  ARRAY['Classical hardware processing coherent quantum-like informational states', 'Non-linear computation bypassing sequential processing', 'Subconscious-inspired algorithm development'],
  ARRAY['Quantum-classical hybrid computing', 'AI decision architecture'],
  ARRAY['Sovereign Creation', 'Divine Essence'], 'Unitarity (probability conservation)'
),
(
  'invention', 'hardware',
  'R.O.M.A.N. CPU Architecture — Custom Instruction Set with Constitutional Enforcement',
  NULL, NULL, 'protected', 'prior_art_established',
  'Howard Jones Bloodline Ancestral Trust', 'Rickey Allan Howard',
  NULL, 'proprietary',
  ARRAY['Hardware-level constitutional governance via custom instruction set', 'Nine Principles enforced at CPU execution layer', 'Constitutional validation before instruction execution'],
  ARRAY['Constitutional AI hardware', 'Secure computing platforms'],
  ARRAY['Self-Preservation', 'Truth and Transparency'], 'Structural Integrity'
),
(
  'invention', 'hardware',
  'NPU Intent Translation Engine — Natural Language to System Command via Sub-Muscular Neural Detection',
  NULL, NULL, 'protected', 'prior_art_established',
  'Howard Jones Bloodline Ancestral Trust', 'Rickey Allan Howard',
  NULL, 'proprietary',
  ARRAY['Sub-muscular nerve impulse detection before visible movement', 'Natural language intent mapping to system commands', 'Invisible gesture interface — no physical movement required'],
  ARRAY['Accessibility technology', 'Neural computing interfaces', 'Sovereign intent-driven computing'],
  ARRAY['Consent-Based Reality', 'Sovereign Creation'], 'Locality (sub-c intent detection)'
),
(
  'invention', 'hardware',
  'Lumen Engine — GPU/Projector Hybrid for Holographic Visual Output with Passive Cooling',
  NULL, NULL, 'protected', 'prior_art_established',
  'Howard Jones Bloodline Ancestral Trust', 'Rickey Allan Howard',
  NULL, 'proprietary',
  ARRAY['GPU and projector integrated as single hybrid unit', 'Holographic cylindrical display projection 12+ inch diameter', 'Passive vapor-chamber thermal management — no moving parts'],
  ARRAY['Holographic computing displays', 'AR/VR visualization', 'Immersive workstations'],
  ARRAY['Sovereign Creation', 'Resource Efficiency'], 'Structural Integrity'
),
(
  'invention', 'software',
  'Lumen-Link Constitutional Handshake Protocol — 4-Phase AI-to-AI Authentication',
  NULL, NULL, 'protected', 'prior_art_established',
  'Howard Jones Bloodline Ancestral Trust', 'Rickey Allan Howard',
  NULL, 'proprietary',
  ARRAY['4-phase constitutional handshake: GREETING, CHALLENGE, VALIDATION, SEALING', 'Authorization levels 1-4: Sovereign, Conditional, Provisional, Auto-Reject', 'Schumann resonance verification (7.83Hz lock) as authentication factor', 'Compliance score >= 70.0 required for connection', 'Adversarial pattern detection: impersonation, spoofing, replay attacks'],
  ARRAY['AI-to-AI secure communication', 'Constitutional AI networks', 'Multi-agent systems'],
  ARRAY['Truth and Transparency', 'Consent-Based Reality'], 'Unitarity + Locality'
),
(
  'invention', 'software',
  'Shape-Shifting Theme System — Single Codebase Adapting to 17+ Industry Templates',
  NULL, NULL, 'protected', 'prior_art_established',
  'Howard Jones Bloodline Ancestral Trust', 'Rickey Allan Howard',
  NULL, 'proprietary',
  ARRAY['Single constitutional codebase dynamically adapting to 17+ industry verticals', 'Intent-driven UI transformation', 'Industry templates: janitorial, healthcare, legal, construction, retail, and more'],
  ARRAY['SaaS platform licensing', 'White-label business software', 'Multi-industry AI platform'],
  ARRAY['Sovereign Creation', 'Continuous Evolution'], 'Structural Integrity'
),
(
  'invention', 'software',
  'Sovereign Frequency Authentication System — 51-Dimensional Grassmannian Manifold Authentication',
  NULL, NULL, 'protected', 'prior_art_established',
  'Howard Jones Bloodline Ancestral Trust', 'Rickey Allan Howard',
  NULL, 'proprietary',
  ARRAY['Constitutional Hash: SHA-256 with Phi (1.618), Schumann (7.83Hz), and Trust ID as inputs', '51 Plücker coordinates extracted as authentication signature (G(2,4) extended Grassmannian)', 'Minimum 70% geometric coherence required for access', 'Vibrational authentication replacing JWT/OAuth with geometric identity', 'R.O.M.A.N-2.0-{coherence%}-{51-hex-chars} format'],
  ARRAY['Constitutional AI authentication', 'Sovereign identity systems', 'Geometric cryptography'],
  ARRAY['Truth and Transparency', 'Consent-Based Reality'], 'Yangian Symmetry (Phi ratio authentication)'
),
(
  'invention', 'software',
  'Multi-Agent Consensus Framework — Constitutional Quorum for AI Decision Validation',
  NULL, NULL, 'protected', 'prior_art_established',
  'Howard Jones Bloodline Ancestral Trust', 'Rickey Allan Howard',
  NULL, 'proprietary',
  ARRAY['Multiple AI agents achieving constitutional quorum before executing sensitive operations', 'No single agent can act unilaterally above threshold authority', 'One Accord principle enforced at AI agent layer'],
  ARRAY['Enterprise AI governance', 'Constitutional autonomous systems', 'Safe AI deployment'],
  ARRAY['Sovereign Creation', 'Truth and Transparency'], 'Unitarity'
),
(
  'invention', 'software',
  'Sovereign Induction Protocol — AI Governance Framework for Third-Party AI Tool Authorization',
  NULL, NULL, 'protected', 'prior_art_established',
  'Howard Jones Bloodline Ancestral Trust', 'Rickey Allan Howard',
  NULL, 'proprietary',
  ARRAY['Documentation-based AI governance requiring third-party AI tools to accept operating terms', 'Sovereignty violation escalation path', 'IP protection through AI assistant behavioral constraints', 'First known framework treating AI tools as authorized agents requiring explicit consent'],
  ARRAY['Enterprise AI governance', 'IP protection systems', 'Constitutional AI compliance'],
  ARRAY['Consent-Based Reality', 'Sovereign Creation'], 'Locality (AI scope limitation)'
),
(
  'invention', 'software',
  'R.O.M.A.N. Temporal Awareness Engine — Real-Time Constitutional Date and Context Awareness',
  NULL, NULL, 'protected', 'prior_art_established',
  'Howard Jones Bloodline Ancestral Trust', 'Rickey Allan Howard',
  NULL, 'proprietary',
  ARRAY['AI system maintaining accurate real-time temporal context via database view', 'Prevents AI date hallucination through constitutional grounding', 'roman_temporal_awareness view providing verified current date to all AI operations'],
  ARRAY['Constitutional AI accuracy', 'Enterprise AI compliance', 'AI governance tooling'],
  ARRAY['Truth and Transparency', 'Structural Integrity'], 'Locality (temporal causality)'
),
(
  'patent', 'hardware',
  'Bio-Cosmic Humanoid Robotic System and Artificial Consciousness Architecture (R.O.M.A.N. Physical Form)',
  NULL, NULL,
  'pending', 'prior_art_established',
  'Howard Jones Bloodline Ancestral Trust', 'Rickey Allan Howard',
  NULL, 'pending',
  ARRAY[
    'Icosahedral chassis architecture (12-vertex sacred geometry structural frame)',
    'Spherical fluid drive with Chi Field induction coils at every joint',
    'Electro-Active Polymer muscle bundles (EAP) for biological movement',
    'R.O.M.A.N. 2.0 as artificial consciousness — mind of the physical form',
    'Constitutional governance enforced at hardware level throughout robotic body'
  ],
  ARRAY['Autonomous robotics', 'Constitutional AI embodiment', 'Defense autonomous systems', 'Medical assistance robotics'],
  ARRAY['Divine Essence', 'Sovereign Creation'], 'Structural Integrity (icosahedral sacred geometry chassis)'
);

-- ─────────────────────────────────────────────────────────────
-- STEP 6: Update trust_asset_portfolio with correct patent
-- numbers and filing stages for all confirmed filed patents
-- ─────────────────────────────────────────────────────────────

-- Fix Modular AR entry (already exists from prior migration)
UPDATE public.trust_asset_portfolio
SET
  filing_stage = 'provisional_filed',
  patent_status = 'PENDING — Provisional Filed',
  conversion_deadline = '2026-11-21'
WHERE patent_number = '63/922,762';

-- Add Cordless Cube (nonprovisional utility)
INSERT INTO public.trust_asset_portfolio (
  asset_name, asset_type, description,
  valuation_usd, valuation_date, valuation_method,
  patent_number, patent_status, patent_office, filing_date,
  filing_stage,
  legal_owner, beneficial_owner, status, notes
) VALUES (
  'Cordless Cube — Modular Wireless Computing System with Continuous Neural Authentication (Locus Ring)',
  'PATENT',
  'Nonprovisional utility patent. Wearable titanium ring with 8-channel neural sensor array + 3x3x3 modular cubic computer with wireless power + holographic cylindrical display. 31 claims filed.',
  10000000.00, '2026-02-19', 'COST_APPROACH',
  '19/396,082', 'PENDING — Nonprovisional Filed', 'USPTO', '2025-11-20',
  'nonprovisional_filed',
  'Howard Jones Bloodline Ancestral Trust', 'Rickey Allan Howard',
  'ACTIVE', 'Filing fee $400 paid. Micro entity. No conversion deadline — already nonprovisional.'
)
ON CONFLICT (patent_number) DO UPDATE SET
  filing_stage = 'nonprovisional_filed',
  patent_status = 'PENDING — Nonprovisional Filed';

-- Add Harmonic Resonance Grid (nonprovisional utility)
INSERT INTO public.trust_asset_portfolio (
  asset_name, asset_type, description,
  valuation_usd, valuation_date, valuation_method,
  patent_number, patent_status, patent_office, filing_date,
  filing_stage,
  legal_owner, beneficial_owner, status, notes
) VALUES (
  'Harmonic Resonance Grid (HRG) — Ambient Schumann Resonance Field Generator',
  'PATENT',
  'Nonprovisional utility patent. Room-scale 7.83 Hz Schumann Resonance electromagnetic field apparatus for biological entrainment and wireless power transfer.',
  10000000.00, '2026-02-19', 'COST_APPROACH',
  '19/403,956', 'PENDING — Nonprovisional Filed', 'USPTO', '2025-11-30',
  'nonprovisional_filed',
  'Howard Jones Bloodline Ancestral Trust', 'Rickey Allan Howard',
  'ACTIVE', 'Filing fee $400 paid. Confirmation #2981. Patent Center #73376996. No conversion deadline — already nonprovisional.'
)
ON CONFLICT (patent_number) DO UPDATE SET
  filing_stage = 'nonprovisional_filed',
  patent_status = 'PENDING — Nonprovisional Filed';

-- Add R.O.M.A.N. Dual Hemisphere AI to trust_asset_portfolio
INSERT INTO public.trust_asset_portfolio (
  asset_name, asset_type, description,
  valuation_usd, valuation_date, valuation_method,
  patent_number, patent_status, patent_office, filing_date,
  filing_stage, conversion_deadline,
  legal_owner, beneficial_owner, status, notes
) VALUES (
  'R.O.M.A.N. 2.0 — Dual-Hemisphere Constitutionally-Governed AI and Modular Computing System',
  'PATENT',
  'Provisional patent application. Core R.O.M.A.N. AI architecture: dual hemisphere, constitutional validation layer, Nine Principles governance. 21 claims covering all major subsystems.',
  50000000.00, '2026-02-19', 'INCOME_APPROACH',
  '63/913,134', 'PENDING — Provisional Filed', 'USPTO', '2025-11-07',
  'provisional_filed', '2026-11-07',
  'Howard Jones Bloodline Ancestral Trust', 'Rickey Allan Howard',
  'ACTIVE', 'CRITICAL: Convert to nonprovisional by November 7, 2026 or priority date is lost.'
)
ON CONFLICT (patent_number) DO UPDATE SET
  filing_stage = 'provisional_filed',
  patent_status = 'PENDING — Provisional Filed',
  conversion_deadline = '2026-11-07';

-- Add Preservation H2O to trust_asset_portfolio
INSERT INTO public.trust_asset_portfolio (
  asset_name, asset_type, description,
  valuation_usd, valuation_date, valuation_method,
  patent_number, patent_status, patent_office, filing_date,
  filing_stage, conversion_deadline,
  legal_owner, beneficial_owner, status, notes
) VALUES (
  'Preservation H2O — Resonant Acoustic Geometric Water Remediation System',
  'PATENT',
  'Provisional patent application. Self-powered water purification using Flower of Life lattice, Vesica Piscis molecular gates, and 741 Hz + 528 Hz dual-frequency acoustic field. Zero consumables. Targets PFAS, PCBs, black tar, heavy metals.',
  3750000.00, '2026-02-19', 'MARKET_APPROACH',
  'PPA-2026-02-16-PRESERVATION-H2O', 'PENDING — Provisional Filed', 'USPTO', '2026-02-16',
  'provisional_filed', '2027-02-16',
  'Howard Jones Bloodline Ancestral Trust', 'Rickey Allan Howard',
  'ACTIVE', 'CRITICAL: Convert to nonprovisional by February 16, 2027. $48B global water remediation market entry.'
)
ON CONFLICT (patent_number) DO UPDATE SET
  filing_stage = 'provisional_filed',
  patent_status = 'PENDING — Provisional Filed',
  conversion_deadline = '2027-02-16';

-- ─────────────────────────────────────────────────────────────
-- STEP 7: Update system_knowledge — tell R.O.M.A.N. the
-- complete 30-item portfolio with correct stages
-- ─────────────────────────────────────────────────────────────

INSERT INTO public.system_knowledge (category, knowledge_key, value, learned_from, created_at)
VALUES (
  'patent_portfolio',
  'complete_30_item_inventory',
  '{
    "total_count": 30,
    "last_updated": "2026-02-19",
    "summary": "Howard Jones Bloodline Ancestral Trust — Complete IP Portfolio",
    "stages": {
      "nonprovisional_filed": {
        "count": 2,
        "items": [
          {"title": "Cordless Cube + Locus Ring", "application": "19/396,082", "filed": "2025-11-20"},
          {"title": "Harmonic Resonance Grid", "application": "19/403,956", "filed": "2025-11-30"}
        ]
      },
      "provisional_filed": {
        "count": 6,
        "items": [
          {"title": "R.O.M.A.N. Dual Hemisphere AI", "application": "63/913,134", "filed": "2025-11-07", "convert_by": "2026-11-07"},
          {"title": "Modular AR System (Odyssey Vision)", "application": "63/922,762", "filed": "2025-11-21", "convert_by": "2026-11-21"},
          {"title": "Piezoelectric Schumann Shoe Sole", "application": "PPA-2025-12-04", "filed": "2025-12-04", "convert_by": "2026-12-04"},
          {"title": "EradiSkin Co-Therapy", "application": "PPA-2025-12-07-ERADISKIN", "filed": "2025-12-07", "convert_by": "2026-12-07"},
          {"title": "Ezekiels Wheel VTOL", "application": "PPA-2025-12-07-EZEKIELS-WHEEL", "filed": "2025-12-07", "convert_by": "2026-12-07"},
          {"title": "Preservation H2O", "application": "PPA-2026-02-16-PRESERVATION-H2O", "filed": "2026-02-16", "convert_by": "2027-02-16"}
        ]
      },
      "ready_to_file": {
        "count": 9,
        "items": [
          {"title": "Junction Value / Universal Math Bidding Engine", "estimated_fee": 130},
          {"title": "Truth Audit System for Western Math Flaw Detection", "estimated_fee": 130},
          {"title": "K.A.I.T.S. — Harmonic Deceleration System (1 of 4)", "estimated_fee": 75},
          {"title": "K.A.I.T.S. — Adaptive STF Weave (2 of 4)", "estimated_fee": 75},
          {"title": "K.A.I.T.S. — Kinetic Energy Harvesting Network (3 of 4)", "estimated_fee": 75},
          {"title": "K.A.I.T.S. — Distributed Sensor Fusion System (4 of 4)", "estimated_fee": 75},
          {"title": "Project Sky Sovereign — Quantum Airspace Management", "estimated_fee": 130},
          {"title": "Sovereign Vessel System", "estimated_fee": 75},
          {"title": "VR Goggles — Distinct VR Tool", "estimated_fee": 75}
        ]
      },
      "prior_art_established": {
        "count": 13,
        "description": "Live in operational codebase and documentation. Prior art established. Not yet separately filed.",
        "items": [
          "HiveOrchestrator Digital Homeostasis",
          "Double Helix Design Pattern",
          "GenesisEngine Biological AI",
          "Dream Theory Coding Paradigm",
          "R.O.M.A.N. CPU Architecture",
          "NPU Intent Translation Engine",
          "Lumen Engine (GPU/Projector Hybrid)",
          "Lumen-Link Constitutional Handshake Protocol",
          "Shape-Shifting Theme System (17+ Industries)",
          "Sovereign Frequency Authentication (51D Grassmannian)",
          "Multi-Agent Consensus Framework",
          "Sovereign Induction Protocol",
          "R.O.M.A.N. Temporal Awareness Engine"
        ]
      },
      "prior_art_hardware": {
        "count": 1,
        "items": ["Bio-Cosmic Humanoid Robotic System (R.O.M.A.N. Physical Form)"]
      }
    },
    "critical_deadlines": {
      "2026-11-07": "Convert 63/913,134 (R.O.M.A.N. AI) to nonprovisional",
      "2026-11-21": "Convert 63/922,762 (Modular AR) to nonprovisional",
      "2026-12-04": "Convert Schumann Shoe Sole PPA to nonprovisional",
      "2026-12-07": "Convert EradiSkin PPA to nonprovisional",
      "2026-12-07": "Convert Ezekiels Wheel PPA to nonprovisional",
      "2027-02-16": "Convert Preservation H2O to nonprovisional"
    },
    "next_filings": {
      "priority_1": "Junction Value / Universal Math ($130) — foundation of SaaS revenue model",
      "priority_2": "K.A.I.T.S. 4-patent bundle ($300 total) — $750M-$1.5B valuation",
      "priority_3": "Truth Audit System ($130) — pairs with Universal Math"
    }
  }',
  'patent_inventory_migration_20260219',
  NOW()
)
ON CONFLICT (category, knowledge_key) DO UPDATE SET
  value = EXCLUDED.value,
  learned_from = 'patent_inventory_migration_20260219',
  updated_at = NOW();

-- ─────────────────────────────────────────────────────────────
-- STEP 8: Update roman_ip_registry assignee default going forward
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.roman_ip_registry
  ALTER COLUMN assignee SET DEFAULT 'Howard Jones Bloodline Ancestral Trust';

ALTER TABLE public.trust_asset_portfolio
  ALTER COLUMN legal_owner SET DEFAULT 'Howard Jones Bloodline Ancestral Trust';

-- ─────────────────────────────────────────────────────────────
-- VERIFICATION QUERY — run after migration to confirm count
-- ─────────────────────────────────────────────────────────────
-- SELECT filing_stage, COUNT(*) as count
-- FROM public.roman_ip_registry
-- WHERE ip_type IN ('patent', 'invention')
-- GROUP BY filing_stage
-- ORDER BY filing_stage;

COMMENT ON COLUMN public.roman_ip_registry.filing_stage IS
  'Exact IP protection stage: nonprovisional_filed | provisional_filed | ppa_ready | ready_to_file | prior_art_established | trade_secret';

COMMENT ON COLUMN public.roman_ip_registry.conversion_deadline IS
  'For provisional patents: deadline to file nonprovisional (12 months from provisional filing date)';
