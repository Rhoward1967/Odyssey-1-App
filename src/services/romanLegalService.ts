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

class RomanLegalService {
  /**
   * Analyze evidence image using Claude vision
   * Detects FDCPA violations, reads amounts, dates, etc.
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
      
      return {
        violationCount: analysis.violations.length,
        violations: analysis.violations,
        statutoryDamagesTotal: analysis.violations.reduce((sum: number, v: any) => sum + v.statutoryDamages, 0),
        recommendedAction: analysis.recommendedAction,
        legalStrength: analysis.legalStrength,
        nextSteps: analysis.nextSteps
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
}

export const romanLegalService = new RomanLegalService();
