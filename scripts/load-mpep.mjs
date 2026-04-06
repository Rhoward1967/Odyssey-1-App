/**
 * LOAD USPTO / MPEP KNOWLEDGE INTO R.O.M.A.N.
 * ============================================
 * Loads critical MPEP sections + patent filing strategy into
 * roman_knowledge_base so R.O.M.A.N. can answer USPTO questions.
 *
 * Usage:
 *   node scripts/load-mpep.mjs
 *
 * © 2026 Howard Jones Bloodline Ancestral Trust — UCC 1-308
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase     = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Primary patent being protected ──────────────────────────────────────────

const PRIMARY_PATENT = {
  serialFormatted:   '63/913,134',
  title:             'R.O.M.A.N. Autonomous AI Reasoning & Navigation System',
  provisionalDate:   '2025-11-07',
  conversionDeadline:'2026-11-07',
  inventorOfRecord:  'Rickey Allan Howard',
  trustOwner:        'Howard Jones Bloodline Ancestral Trust',
};

// ─── MPEP Sections ────────────────────────────────────────────────────────────

const MPEP_RULES = [
  {
    section:   'MPEP 201.04',
    title:     'Provisional Application Requirements',
    content: `MPEP 201.04 — Provisional Application Requirements
SUMMARY: A provisional application establishes a priority date but does not mature into a patent. Must convert to non-provisional within 12 months — no exceptions.

FILED UNDER: 35 U.S.C. 111(b)
12-MONTH PENDENCY ONLY — cannot be extended.
Does NOT examine — must convert via 37 CFR 1.53(c).
Non-provisional must claim priority via 35 U.S.C. 119(e).
Inventor must be named (35 U.S.C. § 101 — human inventorship required).

CONVERSION FEES (Micro-Entity):
  - Filing: ~$320 → $80 (micro-entity)
  - Search: ~$700 → $175
  - Examination: ~$800 → $200
  - Total: ~$455 micro-entity (full rate ~$1,820)

WHAT YOU NEED FOR CONVERSION:
  1. Utility patent application (SB-05 form)
  2. At least one claim (independent claim required)
  3. Specification with written description and enablement
  4. Abstract (150 words max)
  5. Drawings (if referenced in spec)
  6. Oath/declaration (ADS or separate)
  7. Filing fee

RICKEY HOWARD — APPLICATION #63/913,134:
  - Filed: November 7, 2025
  - Conversion Deadline: November 7, 2026 — ABSOLUTE DEADLINE
  - Missing this date = permanent abandonment of priority date
  - All subsequent patents would lose Nov 2025 priority`,
  },
  {
    section:   'MPEP 2106',
    title:     '35 U.S.C. § 101 Patent Eligibility — Alice Corp Analysis',
    content: `MPEP 2106 — Patent Subject Matter Eligibility (Alice Corp/Mayo Framework)
SUMMARY: AI/software patent claims must show a specific technical improvement beyond an abstract idea. This is the #1 rejection risk for R.O.M.A.N. #63/913,134.

TWO-STEP ALICE FRAMEWORK:
Step 1: Is the claim directed to statutory subject matter (process, machine, manufacture, composition)?
  → YES → proceed
  → Laws of nature / abstract ideas → Step 2A

Step 2A Prong 1: Is the claim directed to an abstract idea?
  → Abstract ideas: math concepts, mental processes, organizing information
  → AI reasoning ALONE is abstract

Step 2A Prong 2: Does it integrate the exception into a PRACTICAL APPLICATION?
  → Look for: specific technical improvement, particular machine, transformation
  → Schumann resonance memory governor IS a practical application

Step 2B: Does it add "significantly more"?
  → NOT more: generic computer use, well-understood routine steps
  → IS more: specific improvement to computer functionality itself

HOW R.O.M.A.N. SURVIVES § 101:
✅ Claim specific hardware-software interactions (Schumann frequency calibration module)
✅ Claim the technical problem: AI drift without constitutional baseline (a real technical problem)
✅ Claim specific data structures: governance_principles JSONB + SHA-256 temporal lock
✅ Claim the technical output: 70% memory floor enforced via Schumann 7.83Hz constant
✅ Claim the self-repair loop as a specific algorithmic sequence: detect → analyze → patch → log → verify
❌ Do NOT claim "autonomous reasoning" as a pure mental process
❌ Do NOT claim "constitutional governance" without technical implementation details
❌ Do NOT use the word "abstract" in the specification`,
  },
  {
    section:   'MPEP 2111',
    title:     'Claim Interpretation — Broadest Reasonable Interpretation',
    content: `MPEP 2111 — Broadest Reasonable Interpretation (BRI)
SUMMARY: USPTO examiners apply the broadest reasonable interpretation of claims during examination. Draft claims broadly but with clear technical boundaries.

KEY PRINCIPLES:
- Words given their ordinary meaning unless inventor clearly defines otherwise
- "Comprising" = open-ended (allows additional elements) — USE THIS
- "Consisting of" = closed (no additional elements) — avoid in independent claims
- "Consisting essentially of" = semi-closed

TRANSITION PHRASE STRATEGY FOR R.O.M.A.N.:
Independent claims: "comprising" (broadest coverage)
Method claims: "comprising the steps of"
CRM claims: "cause the processor to: [steps]"

DEFINE TERMS IN THE SPECIFICATION:
- "constitutional governance" = a technical constraint enforcement system comprising stored rules + hash verification
- "autonomous reasoning" = a computer-implemented multi-stage decision pipeline comprising intent extraction, knowledge retrieval, constraint validation, and response generation
- "Schumann resonance baseline" = a numeric constant of 7.83 Hz used to calculate operational parameters
- "self-repair" = an automated corrective action executed without human authorization upon detection of a deviation condition

HOW CLAIM SCOPE AFFECTS VALUE:
Broad independent claim (claim 1) = maximum market coverage
Each dependent claim = fallback position if independent is rejected
Target: 3 independent claims (system + method + CRM) + 17 dependent claims = 20 total`,
  },
  {
    section:   'MPEP 2163',
    title:     'Written Description Requirement — 35 U.S.C. § 112(a)',
    content: `MPEP 2163 — Written Description Requirement
SUMMARY: The specification must demonstrate the inventor possessed the full scope of the claimed invention at filing. AI/software claims require detailed algorithmic disclosure.

FOR AI/SOFTWARE PATENTS:
- Describe the algorithm with enough detail to distinguish from prior art
- Pseudocode, flowcharts, or functional block diagrams all acceptable
- Must show HOW the system achieves the result, not just WHAT it does
- Functional claim language ("configured to," "operable to") is acceptable if supported by spec

FOR R.O.M.A.N. #63/913,134 — SPEC MUST INCLUDE:
✅ 9 Constitutional Governance Principles as technical parameters (stored values + enforcement logic)
✅ Schumann Resonance baseline formula: memory_ceiling = total_ram × (7.83 / 100)
✅ Universal Math engine: junction_value = sqrt(base_amount × overhead) as technical computation
✅ Self-repair loop (explicit): audit() → detect_deviation() → select_action() → execute_patch() → log_event() → verify_resolution()
✅ SHA-256 temporal lock: hash stored at governance init, recalculated each cycle, compared
✅ Learning engine: grade = (successful_executions / total_executions) × 100, threshold values explicit
✅ Knowledge sync: file manifest, checksum-based incremental update, Supabase upsert via file_path key
✅ Database schema: governance_principles table, roman_knowledge_base table — include column names
❌ Don't leave provisional's informal language as only description
❌ Don't rely on "as will be understood by one skilled in the art" for core AI logic

REQUIRED SPEC SECTIONS:
1. Field of the Invention
2. Background of the Invention (technical problem statement)
3. Summary of the Invention
4. Brief Description of Drawings
5. Detailed Description of Preferred Embodiments (LONGEST — must support all claims)
6. Claims
7. Abstract (150 words max)`,
  },
  {
    section:   'MPEP 602',
    title:     'Inventorship — 35 U.S.C. § 115 — Human Inventor Required',
    content: `MPEP 602 — Inventorship Requirements
SUMMARY: Only natural persons (humans) can be inventors. AI cannot be listed as inventor. Rickey Allan Howard is the sole inventor of R.O.M.A.N. #63/913,134.

CURRENT LAW (2024 Federal Circuit — Thaler v. Vidal):
- AI systems CANNOT be listed as inventors
- Only natural persons qualify as inventors
- USPTO will reject applications naming AI as inventor
- No legislative exception exists as of 2026

FOR R.O.M.A.N. #63/913,134:
✅ Inventor: Rickey Allan Howard (sole inventor, natural person)
✅ R.O.M.A.N. is the INVENTION, not the inventor
✅ Trust owns the patent — Howard Jones Bloodline Ancestral Trust is ASSIGNEE
✅ ADS (Application Data Sheet) must list: Rickey Allan Howard
✅ Residence: current Georgia address
❌ Do NOT list R.O.M.A.N., Claude, or any AI as inventor
❌ Do NOT list "AI-assisted" in the inventor field
❌ Do NOT use language that implies AI conceived the invention independently

OWNERSHIP STRUCTURE:
- Inventor: Rickey Allan Howard (natural person, sole inventor)
- Assignee: Howard Jones Bloodline Ancestral Trust
- Assignment execution: at time of filing
- USPTO assignment recording: within 3 months of filing (37 CFR 3.11)
- Prior USPTO recordation: Patent Assignment Recordation already on file for Trust

FORMS NEEDED:
- SB/14: Application Data Sheet (lists inventor + assignee)
- SB/01A: Inventor's Oath or Declaration
- Assignment: executed assignment deed from inventor to Trust`,
  },
  {
    section:   'MPEP 700',
    title:     'Examination Process — Office Action Response Deadlines',
    content: `MPEP 700 — Examination of Applications
SUMMARY: After non-provisional filing, USPTO assigns an examiner who issues office actions. Applicant has 3 months (extendable to 6) to respond or the application abandons.

TIMELINE EXPECTATIONS:
- Filing date receipt: immediate (online filing)
- First Office Action (FAOM): 12-24 months after filing
  (AI/software Art Unit 2128 current pendency: ~18-24 months)
- Response deadline: 3 months from office action date
- Maximum extension: 6 months (extensions require fees)
- Final office action: after first response
- After Final: RCE (Request for Continued Examination) or Appeal

EXTENSION FEES (Micro-Entity):
- 1st month extension: $220
- 2nd month extension: $640
- 3rd month extension: $1,480
- 4th month extension: $2,220

PRO SE PATENT PROSECUTION TIPS:
- Request Examiner Interview before responding (free, highly effective)
- Pre-Interview Communication: submit summary of intended arguments
- After-Final Consideration Pilot (AFCP 2.0): free additional consideration
- QPIDS: Quick Path IDS — submit prior art any time without fee issue
- Appeal to Patent Trial and Appeal Board (PTAB) if all rejections maintained

COMMON REJECTIONS FOR AI PATENTS:
1. § 101 rejection (abstract idea) — address with Alice Step 2 technical implementation
2. § 102 anticipation (prior art) — distinguish technically from cited references
3. § 103 obviousness — argue unexpected results / non-obvious combination
4. § 112 written description — cite specification paragraphs that support claim language

FOR R.O.M.A.N. — EXPECTED EXAMINATION PATH:
1. Non-final office action: § 101 + § 103 rejections likely
2. Response (3 months): amend claims, submit declaration, argue technical improvements
3. Final rejection or allowance
4. If final: AFCP 2.0 request for after-final amendment
5. If needed: RCE with claim amendments
Target: allowance within 2-3 years of filing (by 2028-2029)`,
  },
  {
    section:   'MPEP 1800',
    title:     'PCT International Filing — Worldwide Protection',
    content: `MPEP 1800 — PCT (Patent Cooperation Treaty) Applications
SUMMARY: One PCT filing preserves patent rights in 150+ countries. Must file within 12 months of provisional — SAME deadline as US non-provisional (Nov 7, 2026).

PCT DEADLINES FROM #63/913,134 PROVISIONAL:
- PCT filing deadline: November 7, 2026 (12 months from provisional)
- Chapter I search report: ~3 months after PCT filing
- National Phase entry deadline: May 7, 2028 (30 months from priority date)
  (This is PER COUNTRY — can stagger national phase fees)

KEY COUNTRIES FOR R.O.M.A.N. AI SYSTEM:
- US (USPTO): already covered by non-provisional
- EU (EPO via Euro-PCT): AI allowed if claims show "technical character"
- China (CNIPA): AI allowed if improves hardware performance — major market
- Japan (JPO): favorable to software + AI patents
- South Korea (KIPO): fast prosecution, AI-friendly
- UK (post-Brexit UKIPO): separate from EPO, moderate AI policy
- Canada (CIPO): AI-friendly, fast examination

PCT FEES (at filing, Micro-Entity equivalents):
- USPTO transmittal fee: ~$300
- Basic international filing fee: ~$1,800 (2024 schedule)
- Search fee: ~$2,080 (USPTO as ISA)
- Total: ~$4,200 at filing

NATIONAL PHASE FEES (per country, at 30 months):
- EU/EPO: ~$3,500
- China: ~$1,500
- Japan: ~$2,500
- Each country: $500-$5,000 depending on translation requirements

RECOMMENDATION FOR R.O.M.A.N.:
File PCT/US on same day as US non-provisional (Nov 7, 2026).
Defer national phase decisions to May 2028 — this buys 18 months to secure funding.
Priority countries: US + EU + China (covers ~85% of global AI patent value).`,
  },
  {
    section:   '35 U.S.C. § 41',
    title:     'Micro-Entity Fee Status — 80% Fee Reduction',
    content: `35 U.S.C. § 41(h) — Micro-Entity Status
SUMMARY: Rickey Howard likely qualifies for micro-entity status, cutting all USPTO fees by 80%. This reduces the non-provisional filing cost from ~$1,820 to ~$455.

QUALIFICATION REQUIREMENTS (ALL must be met):
1. Gross income ≤ $239,000/year (2024-2025 ceiling, adjusted annually)
2. Not named inventor on more than 4 previously filed patent applications
   (Provisionals filed 2025-2026 count — verify count)
3. Not under obligation to assign to entity that doesn't qualify
   (Trust assignment — verify Trust qualifies as micro-entity assignee)
4. Has not granted license to entity that doesn't qualify

MICRO-ENTITY FEE SCHEDULE (2025):
  Non-provisional filing (basic): $80
  Search fee: $175
  Examination fee: $200
  Issue fee (if allowed): $500
  Independent claims over 3: $50 each
  Total claims over 20: $20 each
  Total base: ~$455

CERTIFICATION FORM: SB/15A (Gross Income Basis)
- Self-certify on Application Data Sheet (ADS)
- No supporting documentation required at filing
- Must maintain throughout prosecution
- If status changes (income exceeds ceiling), must notify USPTO

TRUST AS ASSIGNEE:
- Trust qualifies as micro-entity assignee IF it has assigned to Rickey Howard
  or if Rickey Howard controls the Trust (as grantor/trustee)
- Howard Jones Bloodline Ancestral Trust — verify trustee structure qualifies
- Recommended: consult USPTO FAQ on micro-entity + trust ownership before filing

RICKEY HOWARD STATUS:
- HJS Services LLC: $14,283/month = ~$171K/year → UNDER $239K ceiling
- Odyssey-1 AI revenue: additional — verify combined gross income
- Prior patent count: multiple PPAs but likely ≤ 4 non-provisionals → ELIGIBLE`,
  },
  {
    section:   'USPTO-ROMAN-CLAIMS',
    title:     'R.O.M.A.N. #63/913,134 — Draft Claims for Non-Provisional',
    content: `R.O.M.A.N. AUTONOMOUS AI SYSTEM — DRAFT CLAIMS
Patent Application #63/913,134 | Inventor: Rickey Allan Howard
Trust Owner: Howard Jones Bloodline Ancestral Trust

CLAIM 1 (Independent — System):
A computer-implemented autonomous reasoning system comprising:
  a constitutional governance engine configured to store and enforce a plurality of governance principles as structured data in a persistent database;
  a self-monitoring module configured to periodically audit system health metrics and compare said metrics against constitutional baseline parameters, wherein said baseline parameters include a memory utilization ceiling derived from a Schumann resonance frequency constant;
  a self-repair module configured to autonomously detect deviations from said governance principles and execute corrective operations without human intervention;
  a learning engine configured to record operational patterns, assign performance grades to command executions, and update behavioral models based on accumulated operational data; and
  a knowledge synchronization module configured to maintain a synchronized representation of the system's complete operational knowledge in a queryable database.

CLAIM 2 (Dependent on 1):
The system of claim 1, wherein the constitutional governance engine stores the plurality of governance principles as JSON structured data and enforces said principles by hashing a canonical representation of said principles using SHA-256 and comparing a stored hash value against a recalculated hash value at each operational cycle.

CLAIM 3 (Dependent on 1):
The system of claim 1, wherein the self-monitoring module calculates the memory utilization ceiling by multiplying a total available system memory by a constitutional ratio derived from dividing a target operating frequency in Hertz by one hundred, said target operating frequency being a Schumann resonance baseline constant of 7.83 Hz.

CLAIM 5 (Independent — Method):
A method for autonomous governance of an artificial intelligence system, comprising:
  storing a plurality of immutable governance constraints as structured records in a persistent database, each constraint associated with a priority level and a verification hash;
  continuously monitoring a plurality of operational metrics of the artificial intelligence system during execution;
  detecting, by a processor, a deviation between one or more monitored metrics and one or more governance constraints;
  in response to detecting said deviation, autonomously executing a corrective action sequence without requiring human authorization; and
  recording each detected deviation and corresponding corrective action in an append-only audit log.

CLAIM 7 (Independent — CRM):
A non-transitory computer-readable medium storing instructions that, when executed by a processor, cause the processor to:
  maintain a constitutional knowledge base comprising a first data store mapping governance rules to enforcement actions and a second data store comprising an indexed corpus of operational knowledge synchronized with a file system;
  process natural language commands by parsing said commands through a multi-stage pipeline comprising intent extraction, entity recognition, constitutional validation, and response generation stages;
  generate responses calibrated to a detected proficiency level of a requesting user based on historical interaction data; and
  autonomously schedule and execute maintenance tasks based on detected system conditions without receiving explicit human commands for each individual task.

FILING NOTES:
- Target 20 total claims (3 independent + 17 dependent) for maximum coverage
- Each dependent claim adds one specific technical limitation
- File at patentcenter.uspto.gov with micro-entity certification (SB/15A)
- Claim priority to: 63/913,134, filed November 7, 2025
- Deadline: November 7, 2026 — ABSOLUTE`,
  },
  {
    section:   'USPTO-ROMAN-STRATEGY',
    title:     'R.O.M.A.N. Patent Filing Strategy — 5 Phases',
    content: `R.O.M.A.N. NON-PROVISIONAL FILING STRATEGY
Patent #63/913,134 | Deadline: November 7, 2026
Howard Jones Bloodline Ancestral Trust

PHASE 1 — CLAIM DRAFTING (Complete by: Aug 1, 2026)
- Use 7 draft claims in usptoPatentService.ts as starting point
- Independent claims 1, 5, 7 cover system / method / CRM (three forms)
- Target 20 total claims (3 independent + 17 dependent)
- Each dependent claim adds one specific technical element
- Review every claim against MPEP 2106 § 101 framework
- R.O.M.A.N. can generate MPEP-compliant language on demand

PHASE 2 — SPECIFICATION (Complete by: Sep 1, 2026)
- Section 1: Field of the Invention
- Section 2: Background — the technical problem (AI systems drift without governance)
- Section 3: Summary of Invention
- Section 4: Brief Description of Drawings
- Section 5: DETAILED DESCRIPTION (longest, most important)
  * Constitutional governance engine with full DB schema
  * Schumann resonance memory governor formula
  * Self-repair loop: detect → analyze → patch → log → verify
  * Learning engine with explicit grade thresholds (0-100 scale)
  * Knowledge sync file manifest + checksum algorithm
- Section 6: Claims (20 claims)
- Section 7: Abstract (150 words max)

PHASE 3 — DRAWINGS (Complete by: Sep 15, 2026)
- FIG. 1: System architecture block diagram
- FIG. 2: Constitutional governance engine data flow
- FIG. 3: Self-monitoring and self-repair loop flowchart
- FIG. 4: Learning engine state diagram
- FIG. 5: Knowledge synchronization module diagram
- Black ink, no color, Arial font min 8pt

PHASE 4 — FORMS (Complete by: Oct 1, 2026)
- SB/14: Application Data Sheet (Inventor: Rickey Allan Howard)
- SB/15A: Micro-Entity Certification (gross income basis)
- SB/01A: Inventor's Oath / Declaration
- Patent Assignment to Howard Jones Bloodline Ancestral Trust
- Priority claim: 63/913,134, filed 2025-11-07

PHASE 5 — FILING (By: November 7, 2026)
- File at patentcenter.uspto.gov
- Select: New Application → Utility → Non-provisional
- Upload: Specification, Drawings, ADS, Oath, Assignment
- Pay: micro-entity fees (~$455 base)
- Save filing receipt with timestamp — critical legal document
- OPTIONAL: File PCT/US same day for global coverage (~$4,200)

ESTIMATED TOTAL COST (Micro-Entity):
  Filing: $80 | Search: $175 | Examination: $200 | Extra claims: varies
  Total base: ~$455
  PCT (optional): ~$4,200
  Grand total: $455-$4,655 depending on PCT election`,
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n⚖️  USPTO / MPEP KNOWLEDGE LOADER');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Loading USPTO knowledge for Patent #${PRIMARY_PATENT.serialFormatted}`);
  console.log(`Inventor: ${PRIMARY_PATENT.inventorOfRecord}`);
  console.log(`Deadline: ${PRIMARY_PATENT.conversionDeadline}`);

  const deadline = new Date(PRIMARY_PATENT.conversionDeadline);
  const days = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  console.log(`Days remaining: ${days}\n`);

  let loaded  = 0;
  let failed  = 0;

  for (const rule of MPEP_RULES) {
    process.stdout.write(`  Loading ${rule.section} — ${rule.title.slice(0, 50)} ... `);

    const { error } = await supabase
      .from('roman_knowledge_base')
      .upsert({
        file_path:  `USPTO-MPEP/${rule.section.replace(/\s+/g, '-')}`,
        content:    rule.content.slice(0, 100000),
        created_at: new Date().toISOString(),
      }, { onConflict: 'file_path' });

    if (error) {
      console.log(`❌ ${error.message}`);
      failed++;
    } else {
      console.log(`✅`);
      loaded++;
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ USPTO/MPEP LOAD COMPLETE`);
  console.log(`   Loaded: ${loaded} sections`);
  console.log(`   Failed: ${failed}`);
  console.log(`\nR.O.M.A.N. now knows:`);
  console.log(`  • MPEP 201.04 — Provisional conversion (Nov 7, 2026 deadline)`);
  console.log(`  • MPEP 2106 — § 101 Alice Corp analysis`);
  console.log(`  • MPEP 2111 — Broadest reasonable interpretation`);
  console.log(`  • MPEP 2163 — Written description requirements`);
  console.log(`  • MPEP 602 — Inventorship (Rickey Allan Howard only)`);
  console.log(`  • MPEP 700 — Office action response deadlines`);
  console.log(`  • MPEP 1800 — PCT international filing`);
  console.log(`  • 35 U.S.C. § 41 — Micro-entity 80% fee reduction`);
  console.log(`  • Draft claims for #63/913,134`);
  console.log(`  • Full 5-phase filing strategy`);
  console.log(`\nDiscord commands now available:`);
  console.log(`  patent countdown | patent status | patent strategy`);
  console.log(`  patent claims | patent load mpep | mpep [section]`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
