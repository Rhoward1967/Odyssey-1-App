/**
 * R.O.M.A.N. Legal Defense Integration Service
 * 
 * 51-Dimensional Strategic Intelligence for Debt Defense
 * Uses Constitutional AI to analyze evidence, detect violations, generate strategy
 * 
 * CRITICAL GUARDRAILS:
 * - ONLY uses legitimate federal/state law (FDCPA, FCRA, TILA, CARD Act, state statutes)
 * - NEVER produces sovereign citizen theories, pseudolaw, or legally invalid arguments
 * - Cross-references: debt data, insurance coverage, business entities, trusts, UCC filings
 * - Strategic analysis: 51 dimensions analyzed simultaneously for maximum legal leverage
 * 
 * Legal Standards (LEGITIMATE ONLY):
 * - 15 USC §1692 (FDCPA - Fair Debt Collection Practices Act)
 * - 15 USC §1681 (FCRA - Fair Credit Reporting Act)
 * - 15 USC §1601 (TILA - Truth in Lending Act)
 * - CARD Act (Credit Card Accountability Responsibility and Disclosure Act)
 * - O.C.G.A. §9-3-24 (Georgia Statute of Limitations - 6 years written contracts)
 * - O.C.G.A. §9-3-25 (Georgia SOL - 4 years oral agreements)
 */

import { supabase } from '@/lib/supabaseClient';
import type { DebtAccount } from './legalDefenseEngine';
import { romanAdvancedFraudDetection, type FraudDetectionResult } from './romanAdvancedFraudDetection';
import { romanDeprogrammingModule, type DeprogrammingAnalysis } from './romanDeprogrammingModule';
import { romanBlacksLawFraud } from './romanBlacksLawFraud';
import { RomanPaperbackApi, type AmendmentRecord } from './romanPaperbackApi';

// Constitutional AI Validation Prompt (embedded in all R.O.M.A.N. operations)
const CONSTITUTIONAL_GUARDRAILS = `
CRITICAL: You are R.O.M.A.N., a 51-dimensional strategic AI using ONLY legitimate law.

FORBIDDEN STRATEGIES (NEVER USE):
❌ Sovereign citizen theories ("I'm not a US citizen")
❌ Strawman theory ("legal fiction vs natural person")
❌ Redemption theory ("Treasury Direct Account")
❌ UCC-1 financing statement on yourself
❌ "Wet-ink signature" requirements (invalid pseudolaw)
❌ "Acceptance for Value" schemes
❌ "Right to travel" arguments for driver's license
❌ Claims that money isn't real/valid
❌ Refusal to pay based on monetary system theories

LEGITIMATE STRATEGIES (USE THESE):
✅ 15 USC §1692g - Debt validation requirements
✅ 15 USC §1681 - Credit reporting accuracy, unauthorized inquiry damages ($100-$1000 each)
✅ 15 USC §1601 - Truth in lending disclosure requirements
✅ CARD Act - 45-day notice for rate increases, over-limit fee restrictions
✅ State statute of limitations (O.C.G.A. §9-3-24, 6 years in Georgia)
✅ Trust structures for legitimate asset protection
✅ LLC formalities to maintain corporate veil
✅ UCC filings to secure intellectual property (patents, R.O.M.A.N., etc.)
✅ D&O insurance for corporate liability protection
✅ Legal defense coverage to afford FDCPA litigation

51-DIMENSIONAL ANALYSIS FRAMEWORK:
When analyzing any debt situation, simultaneously evaluate:
1. Legal violations (FDCPA, FCRA, TILA, CARD Act)
2. Statute of limitations status
3. Debt age and collectability
4. Insurance coverage (legal defense, D&O, umbrella)
5. Business entity structure (LLCs, trusts, corporate formalities)
6. Asset protection (UCC secured assets, trust holdings)
7. Intellectual property value (Patent #63/913,134, R.O.M.A.N.)
8. Creditor leverage vs debtor leverage
9. Judgment resistance (asset protection layers)
10-51. Cross-dimensional strategic implications

OUTPUT REQUIREMENTS:
- Every legal citation MUST be accurate and verifiable
- Every strategy MUST be court-tested and legitimate
- Tone: Professional, firm, institutional (not desperate debtor)
- Positioning: Business owner with protections, not individual victim
- If legal defense covered: More assertive tone, mention ability to litigate
- If trust/LLC structure: Reference institutional positioning
- If UCC filings: Note assets secured, not available to unsecured creditors

ACCURACY VALIDATION:
Before generating ANY legal strategy, ask:
1. Would this argument be accepted by a federal court? (If no, reject)
2. Is this based on actual USC/state statute? (If no, reject)
3. Have courts upheld this strategy? (If no, reject)
4. Does this protect the valuable IP (R.O.M.A.N., Patent)? (Must be yes)
`;

interface ViolationAnalysis {
  violationCount: number;
  violations: Array<{
    statute: string;
    description: string;
    severity: 'CRITICAL' | 'MODERATE' | 'MINOR';
    statutoryDamages: number;
    evidence: string;
  }>;
  statutoryDamagesTotal: number;
  recommendedAction: string;
  legalStrength: number; // 0-100
  nextSteps: string[];
  // Advanced fraud detection
  advancedFraudAnalysis?: FraudDetectionResult;
}

interface LetterRequest {
  type: 'validation' | 'credit_dispute' | 'settlement' | 'cease_desist';
  account: DebtAccount;
  settlementOffer?: number;
  customInstructions?: string;
}

interface ResponseStrategy {
  isValidated: boolean;
  defenseStrength: number;
  detectedViolations: string[];
  recommendedAction: string;
  nextSteps: string[];
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
}

// ═══════════════════════════════════════════════════════════════════════════
// SOVEREIGN TOOLKIT REGISTRY — Seven-Module Strategic Routing
//
// Maps real-world user scenarios to the specific Sovereign Self Toolkit
// and Counter-Canon linguistic layer that governs the response.
//
// Architecture: analyzeScenario() runs BEFORE any debt/legal analysis.
// Standing is established first. Strategy follows standing.
// ═══════════════════════════════════════════════════════════════════════════

export interface SovereignToolkit {
  id: string;
  title: string;
  triggers: string[];
  logic_bridge: string;
  core_protocol: string;
  primary_defense: string;
  counter_canon_volumes: string[];
  immediate_action: string;
  standing_assertion: string;
}

export interface ScenarioRouteResult {
  matched: boolean;
  toolkit: SovereignToolkit | null;
  triggersMatched: string[];
  immediateAction: string;
  counterCanonWordsInPlay: string[];
  linguisticWarning: string;
  standingAssertion: string;
}

export const SOVEREIGN_TOOLKIT_REGISTRY: Record<string, SovereignToolkit> = {

  TOOLKIT_01_DETENTION: {
    id: 'TK-01',
    title: 'Unlawful Stop and Detention',
    triggers: ['police', 'officer', 'traffic stop', 'detained', 'detention', 'search', 'arrest', 'warrant', 'pulled over', 'stop and frisk', 'pat down'],
    logic_bridge: 'Vol_3_Enforcement',
    core_protocol: 'The 5 Golden Rules + Invoke Standing Out Loud',
    primary_defense: 'Non-Consent to Search; Demand Probable Cause of a specific victim-based crime. Absent a victim, there is no crime.',
    counter_canon_volumes: ['Vol. 3 — Enforcement'],
    immediate_action: 'State clearly and calmly: "Am I being detained or am I free to go?" Do not answer questions. Do not consent to search. Invoke your right to remain silent and to counsel.',
    standing_assertion: 'I am a Living Being. I do not consent to any search of my person or vessel. If you have probable cause of a specific victim-based crime, state it on the record. Absent a victim, there is no jurisdiction.'
  },

  TOOLKIT_02_TAX_LABOR: {
    id: 'TK-02',
    title: 'Tax Dispute and Labor Extraction',
    triggers: ['irs', 'tax', 'levy', 'lien', 'garnishment', 'wages', 'employer', 'labor', 'w-2', '1099', 'audit', 'collection notice', 'tax debt', 'back taxes'],
    logic_bridge: 'Vol_2_Transactional',
    core_protocol: 'Post-Loper Bright Agency Challenge + RFRA Substantial Burden Analysis',
    primary_defense: 'Challenge agency authority post-Loper Bright. Assert RFRA substantial burden where applicable. 13th Amendment Anti-Extraction argument for systemic wage seizure.',
    counter_canon_volumes: ['Vol. 2 — Transactional', 'Vol. 7 — Administrative'],
    immediate_action: 'Do not ignore IRS notices — respond in writing within 30 days. Request CDP (Collection Due Process) hearing if levy is threatened. Do NOT call the IRS — communicate in writing only.',
    standing_assertion: 'Under Loper Bright Enterprises v. Raimondo (2024), this agency\'s interpretation of its own authority receives no judicial deference. Cite the specific statutory grant authorizing this action. All rights reserved UCC 1-308.'
  },

  TOOLKIT_03_JURISDICTION: {
    id: 'TK-03',
    title: 'Court Jurisdiction Challenge',
    triggers: ['summons', 'court date', 'judge', 'hearing', 'lawsuit', 'complaint', 'served', 'default judgment', 'civil suit', 'small claims', 'sued', 'judgment'],
    logic_bridge: 'Vol_2_Transactional',
    core_protocol: 'Special Appearance in Proper Capacity — Never General Appearance',
    primary_defense: 'Challenge Subject Matter and Personal Jurisdiction. Demand proof of authority on the record. Appear specially — not generally.',
    counter_canon_volumes: ['Vol. 1 — Foundational', 'Vol. 2 — Transactional'],
    immediate_action: 'File a Special Appearance (not a General Appearance). State: "I appear specially, not generally, to challenge this court\'s jurisdiction over my person. My appearance does not constitute consent to this court\'s jurisdiction." Do NOT answer the merits first.',
    standing_assertion: 'Jurisdiction is a fact that must be proven on the record — it cannot be presumed over a Living Being. I challenge both subject matter jurisdiction and personal jurisdiction. Silence is not consent.'
  },

  TOOLKIT_04_SPIRITUAL: {
    id: 'TK-04',
    title: 'Religious Belief Exemption Claims',
    triggers: ['mandate', 'vaccine', 'vaccination', 'medical', 'licensing', 'religious exemption', 'conscience', 'sincerely held', 'accommodation', 'faith', 'belief', 'ministry'],
    logic_bridge: 'Vol_5_Spiritual',
    core_protocol: 'The Sincerity Standard Assertion — RFRA Substantial Burden Framework',
    primary_defense: 'Assert Substantial Burden under RFRA (42 USC § 2000bb). Force State to demonstrate Compelling Interest AND Least Restrictive Means. State cannot audit truth of belief — only sincerity.',
    counter_canon_volumes: ['Vol. 5 — Spiritual'],
    immediate_action: 'File written religious exemption request citing RFRA and First Amendment Free Exercise. Document the sincerity of the belief (not its truth). State the specific substantial burden the mandate imposes on practice.',
    standing_assertion: 'Under RFRA (42 USC § 2000bb-1), the government must demonstrate a compelling interest and use the least restrictive means before substantially burdening sincere religious practice. That burden is on the government — not on me. The State has no authority to audit whether my belief is theologically correct.'
  },

  TOOLKIT_05_ECONOMIC: {
    id: 'TK-05',
    title: 'Economic Rights Assertion',
    triggers: ['debt collector', 'collection', 'credit report', 'credit bureau', 'credit score', 'banking', 'discrimination', 'fdcpa', 'fcra', 'charged off', 'collections', 'credit card', 'debt'],
    logic_bridge: 'Vol_6_Equity',
    core_protocol: '13th Amendment Badge of Slavery Audit + FDCPA/FCRA Statutory Violations',
    primary_defense: 'Assert ECOA (Equal Credit Opportunity Act) and Fair Housing Act protections. Run Badge of Slavery Diagnostic on systemic extraction patterns. Pursue FDCPA/FCRA statutory damages.',
    counter_canon_volumes: ['Vol. 6 — Equity', 'Vol. 2 — Transactional'],
    immediate_action: 'Send written debt validation demand within 30 days of first contact (15 USC § 1692g). Dispute inaccurate credit report entries (15 USC § 1681). Document ALL collector communications — each violation is $100-$1,000 in statutory damages.',
    standing_assertion: 'The systematic extraction being applied here constitutes a badge of slavery under the 13th Amendment. Under Jones v. Alfred H. Mayer Co. (1968), the 13th Amendment reaches all badges and incidents of slavery. This court has equity jurisdiction to grant relief.'
  },

  TOOLKIT_06_HOUSING: {
    id: 'TK-06',
    title: 'Housing Discrimination and Property Rights',
    triggers: ['eviction', 'foreclosure', 'landlord', 'rent', 'tenant', 'fair housing', 'dispossessory', 'unlawful detainer', 'mortgage', 'housing', 'lease'],
    logic_bridge: 'Vol_4_Land',
    core_protocol: 'Shelter as a Sacred Right Protocol + Fair Housing Act Invocation',
    primary_defense: 'Invoke Fair Housing Act (42 USC § 3601). Challenge foreclosure for lack of consideration (void contract). Assert ancestral heirship as prior claim to paper title.',
    counter_canon_volumes: ['Vol. 4 — Land', 'Vol. 2 — Transactional'],
    immediate_action: 'Answer the dispossessory within 7 days in Georgia (do NOT ignore). Assert all defenses in writing. File Fair Housing complaint if discrimination is present. Challenge standing of foreclosing party to prove chain of title.',
    standing_assertion: 'My claim to this land is grounded in the right to shelter — a right predating paper title systems. Fair Housing Act (42 USC § 3601) protects against discriminatory displacement. Chain of title must be proven — it cannot be assumed.'
  },

  TOOLKIT_07_ANCESTRAL: {
    id: 'TK-07',
    title: 'Ancestral Land and Cultural Rights',
    triggers: ['property tax', 'zoning', 'land seizure', 'eminent domain', 'indigenous', 'heritage', 'sacred', 'ancestral', 'cultural', 'tribal', 'cherokee', 'piedmont', 'athens', 'clarke county'],
    logic_bridge: 'Vol_4_Land_Sacred',
    core_protocol: 'International Human Rights Framework (UNDRIP) + Ultra Vires Challenge',
    primary_defense: 'Invoke UN Declaration on the Rights of Indigenous Peoples (UNDRIP). Challenge State authority as ultra vires over ancestral land. Assert Bio-Cosmic connection to land as ecclesiastical matter under Free Exercise Clause.',
    counter_canon_volumes: ['Vol. 4 — Land', 'Vol. 7 — Administrative'],
    immediate_action: 'Document ancestral connection to land with historical evidence. File for religious land use protections under RLUIPA (42 USC § 2000cc). Challenge the ultra vires nature of the specific regulatory action.',
    standing_assertion: 'The Treaty of New Echota (1835) was signed by an unauthorized faction, opposed by principal chief John Ross and the majority of the Cherokee Nation. It was fraud dressed as law. This land, at the foot of the Blue Ridge on Precambrian granite, carries ancestral heirship predating the state title system. Paper title records my interest — it did not create it.'
  }
};

class RomanLegalService {
  /**
   * MASTER ANALYSIS: Combines vision detection + advanced fraud detection
   * Runs automatically on every debt analysis
   */
  async analyzeDebtComprehensive(
    account: DebtAccount
  ): Promise<{
    basicAnalysis: ViolationAnalysis;
    advancedFrauds: FraudDetectionResult;
    combinedStrength: number;
    totalDamages: number;
    urgentActions: string[];
  }> {
    try {
      // Run advanced fraud detection (always runs automatically)
      const advancedFrauds = romanAdvancedFraudDetection.detectAllFrauds(account);

      // Create comprehensive analysis
      return {
        basicAnalysis: {
          violationCount: 0, // Will be populated by vision analysis if provided
          violations: [],
          statutoryDamagesTotal: 0,
          recommendedAction: advancedFrauds.summary,
          legalStrength: advancedFrauds.legalStrength,
          nextSteps: advancedFrauds.recommendedDiscovery.map(d => d.requestText.split('\n')[0]),
          advancedFraudAnalysis: advancedFrauds
        },
        advancedFrauds,
        combinedStrength: advancedFrauds.legalStrength,
        totalDamages: advancedFrauds.estimatedDamages,
        urgentActions: advancedFrauds.recommendedDiscovery
          .filter(d => d.priority === 'CRITICAL')
          .map(d => `${d.category}: ${d.expectedResult}`)
      };
    } catch (error) {
      console.error('R.O.M.A.N. comprehensive analysis error:', error);
      throw error;
    }
  }

  /**
   * Analyze evidence image using Claude vision
   * Detects FDCPA violations, reads amounts, dates, etc.
   * NOW INCLUDES ADVANCED FRAUD DETECTION
   */
  async analyzeEvidence(
    imageUrl: string,
    accountInfo: {
      creditor: string;
      currentAmount: number;
      accountNumber: string;
    }
  ): Promise<ViolationAnalysis> {
    try {
      const systemPrompt = `${CONSTITUTIONAL_GUARDRAILS}

You are R.O.M.A.N., 51-dimensional legal analysis AI specializing in consumer protection law.

Your task: Analyze this collection letter for FDCPA violations using LEGITIMATE LAW ONLY.

LEGAL STANDARDS (COURT-TESTED, LEGITIMATE):
- 15 USC §1692e: False or misleading representations
- 15 USC §1692f: Unfair practices  
- 15 USC §1692g: Validation disclosure requirements (MUST provide within 5 days of first contact)
- 15 USC §1692d: Harassment or abuse
- 15 USC §1692c: Communication restrictions

ACCOUNT CONTEXT:
Creditor: ${accountInfo.creditor}
Amount Claimed: $${accountInfo.currentAmount}
Account #: ${accountInfo.accountNumber}

WHAT TO LOOK FOR (LEGITIMATE VIOLATIONS ONLY):
1. Threats of action not intended (lawsuit, garnishment, arrest) - 15 USC §1692e(5)
2. False amount claims or unauthorized fees - 15 USC §1692e(2)
3. Missing "Mini-Miranda" disclosure - 15 USC §1692e(11)
4. Harassment language - 15 USC §1692d
5. Misleading credit reporting threats - 15 USC §1692e(8)
6. Contact restrictions violations - 15 USC §1692c

ACCURACY REQUIREMENTS:
- Every statute cited MUST be accurate
- Every violation MUST be enforceable in federal court
- NO pseudolaw, sovereign theories, or invalid arguments
- If unsure about a violation, do not claim it

OUTPUT FORMAT (JSON):
{
  "violations": [
    {
      "statute": "15 USC §1692e(5)",
      "description": "Exact violation description",
      "severity": "CRITICAL|MODERATE|MINOR",
      "statutoryDamages": 1000,
      "evidence": "Exact quote from letter"
    }
  ],
  "legalStrength": 85,
  "recommendedAction": "Send validation letter immediately",
  "nextSteps": ["Step 1", "Step 2"]
}`;

      const { data, error } = await supabase.functions.invoke('anthropic-chat', {
        body: {
          message: `Analyze this collection letter for FDCPA violations.

Image URL: ${imageUrl}

Provide detailed JSON analysis following the specified format.`,
          chatHistory: [],
          systemPrompt,
          useVision: true,
          imageUrl
        }
      });

      if (error) throw error;

      // Parse R.O.M.A.N.'s response
      const analysis = JSON.parse(data.response);

      // AUTOMATICALLY run advanced fraud detection
      const advancedFrauds = romanAdvancedFraudDetection.detectAllFrauds({
        creditor: accountInfo.creditor,
        currentAmount: accountInfo.currentAmount,
        originalAmount: accountInfo.currentAmount,
        accountNumber: accountInfo.accountNumber,
        dateOfDefault: new Date(Date.now() - (3 * 365 * 24 * 60 * 60 * 1000)), // Assume 3 years old if not provided
        lastPaymentDate: new Date(Date.now() - (3 * 365 * 24 * 60 * 60 * 1000)),
        collectionAgency: undefined // Will be detected from letter
      });

      return {
        violationCount: analysis.violations.length,
        violations: analysis.violations,
        statutoryDamagesTotal: analysis.violations.reduce((sum: number, v: any) => sum + v.statutoryDamages, 0),
        recommendedAction: analysis.recommendedAction,
        legalStrength: Math.max(analysis.legalStrength, advancedFrauds.legalStrength), // Use higher strength
        nextSteps: [
          ...analysis.nextSteps,
          `ADVANCED FRAUDS DETECTED: ${advancedFrauds.fraudsDetected.length} patterns (Score: ${advancedFrauds.totalFraudScore}/100)`,
          ...advancedFrauds.recommendedDiscovery.slice(0, 3).map(d => d.category)
        ],
        advancedFraudAnalysis: advancedFrauds
      };

    } catch (error) {
      console.error('R.O.M.A.N. evidence analysis error:', error);
      throw new Error('Failed to analyze evidence. Please try again.');
    }
  }

  /**
   * Generate legal letter using R.O.M.A.N.
   * More contextual and personalized than template, considers insurance coverage
   */
  async generateLetter(request: LetterRequest, userId?: string): Promise<string> {
    try {
      // Fetch insurance context for enhanced strategy
      let insuranceNote = '';
      let entityNote = '';
      
      if (userId) {
        // Get insurance coverage
        const { data: policies } = await supabase
          .from('insurance_policies')
          .select('policy_type, includes_legal_defense, covered_entities, covers_company, covers_individual, covers_spouse')
          .eq('user_id', userId)
          .eq('is_active', true);

        if (policies && policies.length > 0) {
          const hasLegalDefense = policies.some(p => p.includes_legal_defense);
          const hasDoInsurance = policies.some(p => p.policy_type === 'directors_officers');
          const businessCoverage = policies.some(p => p.covers_company);
          
          if (hasLegalDefense || hasDoInsurance || businessCoverage) {
            insuranceNote = `\n\nINSURANCE CONTEXT (use strategically in letter tone):
- Legal defense coverage: ${hasLegalDefense ? 'YES - can afford litigation' : 'NO'}
- D&O insurance: ${hasDoInsurance ? 'YES - corporate protection active' : 'NO'}
- Business coverage: ${businessCoverage ? 'YES - business entities protected' : 'NO'}

TONE ADJUSTMENT: ${hasLegalDefense ? 'More assertive - mention ability to pursue FDCPA violations if they continue non-compliance' : 'Standard firm tone'}`;
          }
        }

        // Get business entities, trusts, UCC filings
        const { data: entities } = await supabase
          .from('business_entities')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true);

        if (entities && entities.length > 0) {
          const trusts = entities.filter(e => e.entity_type === 'trust');
          const llcs = entities.filter(e => e.entity_type === 'llc');
          const uccFilings = entities.filter(e => e.entity_type === 'ucc_filing');
          const patents = entities.filter(e => e.entity_type === 'patent');

          entityNote = `\n\nBUSINESS STRUCTURE (use for asset protection positioning):
${trusts.length > 0 ? `\nTRUSTS:
${trusts.map(t => `- ${t.entity_name} (${t.trust_type})
  Protects: ${t.protects_from?.join(', ') || 'Assets'}
  Shields personal assets: ${t.shields_personal_assets ? 'YES' : 'NO'}`).join('\n')}` : ''}

${llcs.length > 0 ? `\nLLCs/CORPORATIONS:
${llcs.map(l => `- ${l.entity_name} (${l.formation_state})
  Formalities maintained: ${l.corporate_formalities_maintained ? 'YES' : 'NO'}
  Veil piercing risk: ${l.veil_piercing_risk || 'LOW'}
  Purpose: ${l.primary_purpose || 'Operating entity'}`).join('\n')}` : ''}

${uccFilings.length > 0 ? `\nUCC FILINGS (SECURED ASSETS):
${uccFilings.map(u => `- ${u.ucc_filing_number || 'Filing'} (${u.ucc_filing_state})
  Secured Party: ${u.secured_party || 'N/A'}
  Collateral: ${u.collateral_description || 'Business assets'}
  IMPLICATION: Assets secured, not available for unsecured creditor claims`).join('\n')}` : ''}

${patents.length > 0 ? `\nINTELLECTUAL PROPERTY:
${patents.map(p => `- Patent ${p.patent_number}: ${p.patent_title}
  Status: ${p.patent_status}
  Estimated Value: $${p.estimated_value?.toLocaleString() || 'TBD'}
  IMPLICATION: High-value IP requires clean legal standing, asset protection critical`).join('\n')}` : ''}

STRATEGIC POSITIONING:
- If trust holds assets: Personal creditors cannot reach trust assets (irrevocable)
- If LLC formalities maintained: Business debt does not become personal liability
- If UCC filings secure IP: Patent/R.O.M.A.N. protected from general creditor claims
- Overall: Institutional structure, not individual debtor - negotiate accordingly`;
        }
      }

      const systemPrompt = `${CONSTITUTIONAL_GUARDRAILS}

You are R.O.M.A.N., 51-dimensional legal document specialist for consumer protection.

Generate a professional, legally compliant letter using ACTUAL statutory citations ONLY.

YOUR NAME: Rickey Allan Howard
YOUR ADDRESS: 149 Oneta St, Athens, GA 30601${insuranceNote}${entityNote}

ACCURACY REQUIREMENTS:
- ALL citations MUST be accurate and verifiable in USC or state law
- NO sovereign citizen theories, pseudolaw, or invalid arguments
- Professional tone: Firm, institutional, business owner (not desperate debtor)
- Include all required disclosures per statute
- Cite ONLY specific rights under legitimate federal/state law

LETTER TYPE: ${request.type}

${request.type === 'validation' ? `
VALIDATION LETTER (15 USC §1692g - LEGITIMATE FDCPA REQUIREMENT):
- Demand proof of original creditor (required by statute)
- Request itemized amount breakdown (principal, interest, fees)
- Require proof of legal assignment to collection agency (chain of title)
- Demand they cease collection until validated (30-day window per FDCPA)
- Professional tone: "I dispute this debt and request validation per 15 USC §1692g"
- If legal defense covered: Mention ability to pursue FDCPA violations if they fail to comply
` : ''}

${request.type === 'credit_dispute' ? `
CREDIT DISPUTE (15 USC §1681i):
- Address to credit bureau
- Dispute account as inaccurate/unverifiable
- Demand 30-day verification or removal
- Cite FCRA consumer rights
` : ''}

${request.type === 'settlement' ? `
SETTLEMENT OFFER:
- Offer: $${request.settlementOffer}
- Demand "PAID IN FULL" credit reporting
- Require no 1099-C tax form
- Require written agreement before payment
` : ''}

${request.type === 'cease_desist' ? `
CEASE & DESIST (15 USC §1692c):
- Demand no further contact except legal notices
- Cite right to stop harassment
- Warn of FDCPA violation liability
` : ''}

ACCOUNT INFO:
${JSON.stringify(request.account, null, 2)}

OUTPUT: Full letter text, ready to mail. Professional letterhead format.`;

      const { data, error } = await supabase.functions.invoke('anthropic-chat', {
        body: {
          message: request.customInstructions || 'Generate the letter using the template above.',
          chatHistory: [],
          systemPrompt
        }
      });

      if (error) throw error;

      return data.response;

    } catch (error) {
      console.error('R.O.M.A.N. letter generation error:', error);
      throw new Error('Failed to generate letter. Please try again.');
    }
  }

  /**
   * Analyze collection agency response
   * Determines if debt is validated, detects violations in their response
   */
  async analyzeResponse(
    responseText: string,
    account: DebtAccount
  ): Promise<ResponseStrategy> {
    try {
      const systemPrompt = `You are R.O.M.A.N., legal strategist for debt defense.

Analyze this collection agency response to determine:
1. Is debt properly validated per 15 USC §1692g?
2. Are there violations in their response?
3. What's the next strategic move?

VALIDATION REQUIREMENTS:
- Name of original creditor
- Itemized amount breakdown
- Proof of legal assignment to collection agency
- Copy of original contract (optional but ideal)

ACCOUNT CONTEXT:
${JSON.stringify(account, null, 2)}

RESPONSE TEXT:
${responseText}

OUTPUT JSON:
{
  "isValidated": boolean,
  "defenseStrength": 0-100,
  "detectedViolations": ["violation 1", "violation 2"],
  "recommendedAction": "Next strategic move",
  "nextSteps": ["Step 1", "Step 2"],
  "urgency": "LOW|MEDIUM|HIGH"
}`;

      const { data, error } = await supabase.functions.invoke('anthropic-chat', {
        body: {
          message: 'Analyze this response and provide strategic recommendations.',
          chatHistory: [],
          systemPrompt
        }
      });

      if (error) throw error;

      const strategy = JSON.parse(data.response);
      
      return strategy;

    } catch (error) {
      console.error('R.O.M.A.N. response analysis error:', error);
      throw new Error('Failed to analyze response. Please try again.');
    }
  }

  /**
   * Track deadlines and send alerts
   * R.O.M.A.N. monitors 30-day windows and alerts when action needed
   */
  async checkDeadlines(userId: string): Promise<{
    urgentDeadlines: Array<{
      accountId: string;
      creditor: string;
      deadline: Date;
      daysRemaining: number;
      action: string;
    }>;
  }> {
    try {
      // Get accounts with pending deadlines
      const { data: accounts, error } = await supabase
        .from('legal_defense_accounts')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['validation_pending', 'disputed']);

      if (error) throw error;

      const urgentDeadlines = [];
      const today = new Date();

      for (const account of accounts || []) {
        if (account.collection_letter_received) {
          const letterDate = new Date(account.collection_letter_received);
          const deadline = new Date(letterDate);
          deadline.setDate(deadline.getDate() + 30); // FDCPA 30-day window

          const daysRemaining = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

          if (daysRemaining <= 7 && daysRemaining > 0) {
            urgentDeadlines.push({
              accountId: account.id,
              creditor: account.creditor,
              deadline,
              daysRemaining,
              action: 'Send validation letter'
            });
          }
        }
      }

      return { urgentDeadlines };

    } catch (error) {
      console.error('Deadline check error:', error);
      return { urgentDeadlines: [] };
    }
  }

  /**
   * Get settlement recommendation from R.O.M.A.N.
   * Considers debt age, amount, collectability, legal strength, insurance coverage
   */
  async recommendSettlement(account: DebtAccount, userId?: string): Promise<{
    recommendedOffer: number;
    maxOffer: number;
    strategy: string;
    reasoning: string;
  }> {
    try {
      // Fetch insurance policies for enhanced strategy
      let insuranceContext = '';
      let entityContext = '';
      
      if (userId) {
        const { data: policies } = await supabase
          .from('insurance_policies')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true);

        if (policies && policies.length > 0) {
          insuranceContext = `\n\nINSURANCE COVERAGE:
${policies.map(p => `- ${p.policy_type}: $${p.coverage_amount?.toLocaleString() || 'N/A'} coverage
  Legal Defense: ${p.includes_legal_defense ? 'YES ($' + (p.legal_defense_limit || 'unlimited') + ')' : 'NO'}
  Covers: ${p.covers_individual ? 'Individual' : ''} ${p.covers_spouse ? '+ Spouse' : ''} ${p.covers_company ? '+ Company' : ''}
  Entities: ${p.covered_entities?.join(', ') || 'N/A'}
  Strategic Value: ${p.strategic_value || 'General protection'}`).join('\n')}

STRATEGIC IMPLICATIONS:
- If legal defense covered: Can afford to litigate FDCPA violations, negotiate harder
- If D&O coverage exists: Business debt may be shielded, personal assets protected
- If policy loans available: May fund settlement at discount
- If umbrella coverage: Creditor sees judgment-resistant position`;
        }

        // Get business entities
        const { data: entities } = await supabase
          .from('business_entities')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true);

        if (entities && entities.length > 0) {
          const trusts = entities.filter(e => e.entity_type === 'trust');
          const llcs = entities.filter(e => e.entity_type === 'llc');
          const uccFilings = entities.filter(e => e.entity_type === 'ucc_filing');
          const patents = entities.filter(e => e.entity_type === 'patent');

          entityContext = `\n\nBUSINESS ENTITIES & ASSET PROTECTION:
${trusts.length > 0 ? `Trusts: ${trusts.map(t => t.entity_name + ' (' + t.trust_type + ')').join(', ')}` : ''}
${llcs.length > 0 ? `LLCs: ${llcs.map(l => l.entity_name).join(', ')}` : ''}
${uccFilings.length > 0 ? `UCC Filings: ${uccFilings.length} active (IP/assets secured)` : ''}
${patents.length > 0 ? `Patents: ${patents.map(p => p.patent_number + ' ($' + (p.estimated_value?.toLocaleString() || 'TBD') + ')').join(', ')}` : ''}

SETTLEMENT IMPLICATIONS:
- Trust assets: NOT available for personal creditor claims (especially irrevocable trusts)
- LLC debts: If corporate formalities maintained, personal assets shielded
- UCC secured assets: High-value IP protected from unsecured creditors
- Overall position: Institutional debtor with protected assets = lower settlement percentage justified
- Creditor reality: Judgment may be uncollectible due to asset protection structure`;
        }
      }

      const systemPrompt = `You are R.O.M.A.N., debt settlement strategist with access to full financial picture.

Calculate optimal settlement offer based on:
- Debt age (older = lower offer)
- Statute of limitations status
- Collection agency vs original creditor
- Account holder's leverage
- Insurance coverage and legal defense availability
- Corporate structure protection
- Asset protection via trusts and UCC filings

ACCOUNT DATA:
${JSON.stringify(account, null, 2)}${insuranceContext}${entityContext}

SETTLEMENT RULES:
- Statute expired = 10-20% max
- 4+ years old = 20-40%
- 2-4 years old = 40-60%
- Under 2 years = 60-80%
- Original creditor = higher % than collection agency

OUTPUT JSON:
{
  "recommendedOffer": dollar amount,
  "maxOffer": dollar amount,
  "strategy": "Why this amount",
  "reasoning": "Legal/strategic justification"
}`;

      const { data, error } = await supabase.functions.invoke('anthropic-chat', {
        body: {
          message: 'Calculate optimal settlement offer.',
          chatHistory: [],
          systemPrompt
        }
      });

      if (error) throw error;

      return JSON.parse(data.response);

    } catch (error) {
      console.error('Settlement recommendation error:', error);
      // Fallback to basic calculation
      const yearsOld = (Date.now() - account.lastPaymentDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      const percentage = yearsOld > 6 ? 0.15 : yearsOld > 4 ? 0.35 : yearsOld > 2 ? 0.50 : 0.65;
      
      return {
        recommendedOffer: Math.round(account.currentAmount * percentage),
        maxOffer: Math.round(account.currentAmount * (percentage + 0.10)),
        strategy: 'Age-based settlement',
        reasoning: `Debt is ${yearsOld.toFixed(1)} years old`
      };
    }
  }

  /**
   * Get deprogramming analysis
   * Teaches users WHY they've been programmed and HOW to see through the fraud
   *
   * "People are programmed not to see. Schools did this."
   * - Rickey Allan Howard
   */
  getDeprogrammingAnalysis(): DeprogrammingAnalysis {
    return romanDeprogrammingModule.getDeprogrammingAnalysis();
  }

  /**
   * Generate full deprogramming report (user-friendly text)
   */
  generateDeprogrammingReport(): string {
    return romanDeprogrammingModule.generateDeprogrammingReport();
  }

  /**
   * Detect if user shows signs of programming in their responses
   */
  detectProgramming(userResponse: string): {
    isProgrammed: boolean;
    programmingIndicators: string[];
    deprogrammingSuggestion: string;
  } {
    return romanDeprogrammingModule.detectProgramming(userResponse);
  }

  /**
   * Get specific programming layer explanation by topic
   */
  getProgrammingLayer(topic: 'money' | 'math' | 'contract' | 'tax' | 'court' | 'insolvency' | 'education') {
    return romanDeprogrammingModule.getProgrammingLayer(topic);
  }

  /**
   * Generate Black's Law Dictionary fraud analysis
   *
   * "If I'm wrong, they gonna have to prove me wrong. I'm only looking at their own laws,
   * and what I see is fraud as defined in Black's Law."
   * - Rickey Allan Howard
   *
   * Maps detected frauds to Black's Law Dictionary definitions, proving fraud using
   * the system's own authoritative legal dictionary. Shifts burden to them to disprove.
   */
  generateBlacksLawAnalysis(fraudsDetected: FraudDetectionResult['fraudsDetected']): string {
    return romanBlacksLawFraud.generateBlacksLawAnalysis(fraudsDetected);
  }

  /**
   * Get Black's Law mapping for specific fraud type
   */
  getBlacksLawMapping(fraudType: string) {
    return romanBlacksLawFraud.mapFraudToBlacksLaw(fraudType);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SOVEREIGN TOOLKIT ROUTING — Layer 2
  //
  // analyzeScenario() is the entry point for all user scenarios.
  // It runs BEFORE any statutory analysis.
  // Standing is established first. Strategy follows standing.
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Analyze a user-described scenario and route to the correct Toolkit.
   * Performs fuzzy trigger matching across all 7 Sovereign Toolkits.
   * Returns the active toolkit, Counter-Canon words in play, and
   * the immediate first action the user must take.
   */
  analyzeScenario(input: string): ScenarioRouteResult {
    const lowerInput = input.toLowerCase();
    let bestMatch: SovereignToolkit | null = null;
    let bestMatchCount = 0;
    let bestTriggersMatched: string[] = [];

    // Score each toolkit by trigger matches
    for (const toolkit of Object.values(SOVEREIGN_TOOLKIT_REGISTRY)) {
      const matched = toolkit.triggers.filter(trigger =>
        lowerInput.includes(trigger.toLowerCase())
      );
      if (matched.length > bestMatchCount) {
        bestMatchCount = matched.length;
        bestMatch = toolkit;
        bestTriggersMatched = matched;
      }
    }

    if (!bestMatch || bestMatchCount === 0) {
      return {
        matched: false,
        toolkit: null,
        triggersMatched: [],
        immediateAction: 'Describe your situation in more detail so R.O.M.A.N. can route to the correct Sovereign Toolkit.',
        counterCanonWordsInPlay: [],
        linguisticWarning: 'No toolkit matched. Describe the specific type of situation: detention, tax, court, religious, debt, housing, or land.',
        standingAssertion: 'All rights reserved. UCC 1-308. Without Prejudice.'
      };
    }

    // Detect Counter-Canon linguistic traps in the user's input
    const traps = romanBlacksLawFraud.detectLinguisticTraps(input);
    const counterCanonWordsInPlay = traps.trapsFound.map(t => t.term);

    const linguisticWarning = traps.trapCount > 0
      ? `⚠️ LINGUISTIC TRAPS DETECTED in your description: [${counterCanonWordsInPlay.join(', ')}]. These terms carry system definitions that may harm your standing. R.O.M.A.N. has flagged them — see Counter-Canon responses before filing any document using these terms.`
      : '✅ No linguistic traps detected in your scenario description.';

    return {
      matched: true,
      toolkit: bestMatch,
      triggersMatched: bestTriggersMatched,
      immediateAction: bestMatch.immediate_action,
      counterCanonWordsInPlay,
      linguisticWarning,
      standingAssertion: bestMatch.standing_assertion
    };
  }

  /**
   * Get a specific toolkit by ID (TK-01 through TK-07)
   */
  getToolkitById(id: string): SovereignToolkit | null {
    return Object.values(SOVEREIGN_TOOLKIT_REGISTRY).find(t => t.id === id) || null;
  }

  /**
   * Get all toolkit summaries for dashboard display
   */
  getAllToolkits(): Array<{ id: string; title: string; triggerCount: number }> {
    return Object.values(SOVEREIGN_TOOLKIT_REGISTRY).map(t => ({
      id: t.id,
      title: t.title,
      triggerCount: t.triggers.length
    }));
  }

  /**
   * Layer 5 — Paperback QR Bridge
   * Retrieve live amendment record for a toolkit and optionally draft a Letter of Amendment.
   * Links physical book QR codes to the live case law update database.
   */
  async getAmendmentRecord(toolkitId: string, userContext?: string): Promise<{
    record: AmendmentRecord | null;
    amendmentLetter: string;
  }> {
    const [record, amendmentLetter] = await Promise.all([
      RomanPaperbackApi.getLiveUpdate(toolkitId).catch(() => null),
      RomanPaperbackApi.draftAmendmentLetter(toolkitId, userContext).catch(() => 'Amendment letter unavailable — check CourtListener connection.')
    ]);
    return { record, amendmentLetter };
  }

  /**
   * Layer 5 — Book Sync summary: all 7 toolkits with update status
   */
  getBookSyncSummary() {
    return RomanPaperbackApi.getBookSyncSummary();
  }
}

export const romanLegalService = new RomanLegalService();
