/**
 * R.O.M.A.N. Contract Analysis Engine
 * 
 * AI-powered legal document analyzer that finds exploitable flaws in creditor contracts.
 * Uses Claude/Gemini to analyze contracts and generate defensive/offensive strategies.
 * 
 * "Laws are written in imperfect language by imperfect humans - every word is an exploit vector."
 * 
 * Created: January 17, 2026
 */

import Anthropic from '@anthropic-ai/sdk';

// Constitutional AI: ONLY use legitimate legal strategies, NO pseudolaw
const FORBIDDEN_CONCEPTS = [
  'sovereign citizen',
  'strawman theory',
  'redemption theory',
  'UCC-1 financing statement to discharge debt', // UCC-1 is for SECURING assets, NOT discharging debt
  'accepting for value',
  'coupon theory',
  '1099-OID',
  'tax protester arguments'
];

interface ContractFlaw {
  type: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  description: string;
  legal_basis: string;
  exploitability: number; // 0-100%
}

interface AffirmativeDefense {
  defense: string;
  strength: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  basis: string;
  case_law?: string;
  statute?: string;
}

interface CounterclaimOpportunity {
  claim: string;
  estimated_damages: number;
  basis: string;
  statute: string;
  success_probability: number; // 0-100%
}

interface ContractAnalysisResult {
  exploitability_score: number; // 0-100%
  exploitability_level: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  flaws_detected: {
    missing_signatures: boolean;
    ambiguous_terms: string[];
    contradictory_clauses: Array<{ section_a: string; section_b: string; conflict: string }>;
    missing_essential_terms: string[];
    void_for_vagueness: boolean;
    statute_of_frauds_violation: boolean;
    unconscionable_terms: string[];
    procedural_defects: string[];
    robo_signed: boolean;
    no_chain_of_title: boolean;
  };
  standing_defects: {
    no_original_creditor_assignment: boolean;
    missing_chain_of_title: boolean;
    insufficient_documentation: boolean;
    robo_signed_affidavit: boolean;
    affiant_no_personal_knowledge: boolean;
  };
  affirmative_defenses: AffirmativeDefense[];
  counterclaim_potential: CounterclaimOpportunity[];
  recommended_strategy: 'AGGRESSIVE' | 'DEFENSIVE' | 'SETTLE' | 'IGNORE';
  strategy_reasoning: string;
  estimated_success_probability: number;
  motion_to_dismiss_draft: string;
  answer_with_defenses_draft: string;
  counterclaim_draft: string;
  discovery_requests_draft: string;
}

export class ContractAnalysisEngine {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY
    });
  }

  /**
   * Main entry point: Analyze contract and generate legal warfare strategy
   */
  async analyzeContract(
    contractDocumentId: string,
    extractedText: string,
    debtAmount: number,
    debtType: 'consumer' | 'business'
  ): Promise<ContractAnalysisResult> {
    
    // Step 1: AI analyzes contract for flaws
    const aiAnalysis = await this.runAIAnalysis(extractedText, debtAmount, debtType);
    
    // Step 2: Calculate exploitability score
    const exploitabilityScore = this.calculateExploitabilityScore(aiAnalysis);
    
    // Step 3: Identify affirmative defenses
    const affirmativeDefenses = this.identifyAffirmativeDefenses(aiAnalysis, debtType);
    
    // Step 4: Find counterclaim opportunities
    const counterclaimPotential = this.findCounterclaimOpportunities(aiAnalysis, debtType);
    
    // Step 5: Generate strategy
    const strategy = this.generateStrategy(exploitabilityScore, affirmativeDefenses, counterclaimPotential);
    
    // Step 6: Generate legal documents
    const motionToDismiss = await this.generateMotionToDismiss(aiAnalysis, affirmativeDefenses);
    const answerWithDefenses = await this.generateAnswerWithDefenses(aiAnalysis, affirmativeDefenses);
    const counterclaim = await this.generateCounterclaim(counterclaimPotential);
    const discoveryRequests = await this.generateDiscoveryRequests(aiAnalysis);
    
    return {
      exploitability_score: exploitabilityScore,
      exploitability_level: this.getExploitabilityLevel(exploitabilityScore),
      flaws_detected: aiAnalysis.flaws_detected,
      standing_defects: aiAnalysis.standing_defects,
      affirmative_defenses: affirmativeDefenses,
      counterclaim_potential: counterclaimPotential,
      recommended_strategy: strategy.strategy,
      strategy_reasoning: strategy.reasoning,
      estimated_success_probability: strategy.success_probability,
      motion_to_dismiss_draft: motionToDismiss,
      answer_with_defenses_draft: answerWithDefenses,
      counterclaim_draft: counterclaim,
      discovery_requests_draft: discoveryRequests
    };
  }

  /**
   * Use Claude to analyze contract text for legal flaws
   */
  private async runAIAnalysis(contractText: string, debtAmount: number, debtType: 'consumer' | 'business'): Promise<any> {
    
    const prompt = `You are R.O.M.A.N., a constitutional AI legal analyst. Analyze this ${debtType} debt contract for LEGITIMATE legal flaws.

CONTRACT TEXT:
${contractText}

DEBT AMOUNT: $${debtAmount.toLocaleString()}
DEBT TYPE: ${debtType === 'consumer' ? 'Consumer (FDCPA protected)' : 'Business (commercial law)'}

CRITICAL: ONLY identify LEGITIMATE legal defenses. FORBIDDEN concepts:
${FORBIDDEN_CONCEPTS.join(', ')}

ANALYZE FOR:

1. **Missing Signatures**: Are all parties signed? Notarized if required?
2. **Ambiguous Terms**: Payment dates, interest rates, "reasonable time", etc.
3. **Contradictory Clauses**: Does Section 3 conflict with Section 7?
4. **Missing Essential Terms**: Price, delivery, timeline, consideration?
5. **Void for Vagueness**: Terms so unclear the contract is unenforceable?
6. **Statute of Frauds**: Contracts > $500 MUST be in writing (UCC §2-201)
7. **Unconscionable Terms**: 427% APR, confession of judgment, oppressive?
8. **Procedural Defects**: Missing witness, not notarized, wrong venue?
9. **Robo-Signing**: Signatures without personal knowledge (fraud)?
10. **Chain of Title**: Can current creditor prove they own the debt?

STANDING ISSUES:
- Did debt buyer provide assignment agreement?
- Does affidavit show personal knowledge or is it robo-signed?
- Can they prove they have legal right to sue?

Return JSON with this structure:
{
  "flaws_detected": {
    "missing_signatures": boolean,
    "ambiguous_terms": string[],
    "contradictory_clauses": [{section_a, section_b, conflict}],
    "missing_essential_terms": string[],
    "void_for_vagueness": boolean,
    "statute_of_frauds_violation": boolean,
    "unconscionable_terms": string[],
    "procedural_defects": string[],
    "robo_signed": boolean,
    "no_chain_of_title": boolean
  },
  "standing_defects": {
    "no_original_creditor_assignment": boolean,
    "missing_chain_of_title": boolean,
    "insufficient_documentation": boolean,
    "robo_signed_affidavit": boolean,
    "affiant_no_personal_knowledge": boolean
  },
  "severity_analysis": string,
  "key_weaknesses": string[]
}`;

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      // Extract JSON from response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    throw new Error('Failed to parse AI analysis response');
  }

  /**
   * Calculate overall exploitability score (0-100%)
   */
  private calculateExploitabilityScore(aiAnalysis: any): number {
    let score = 0;

    const flaws = aiAnalysis.flaws_detected;
    const standing = aiAnalysis.standing_defects;

    // Critical flaws (20 points each)
    if (standing.no_original_creditor_assignment) score += 20;
    if (standing.missing_chain_of_title) score += 20;
    if (flaws.robo_signed) score += 20;
    if (flaws.void_for_vagueness) score += 20;

    // High-value flaws (15 points each)
    if (flaws.missing_signatures) score += 15;
    if (flaws.statute_of_frauds_violation) score += 15;
    if (standing.robo_signed_affidavit) score += 15;

    // Moderate flaws (10 points each)
    if (flaws.no_chain_of_title) score += 10;
    if (flaws.missing_essential_terms.length > 0) score += 10;
    if (standing.insufficient_documentation) score += 10;

    // Minor flaws (5 points each)
    if (flaws.ambiguous_terms.length > 0) score += 5;
    if (flaws.contradictory_clauses.length > 0) score += 5;
    if (flaws.procedural_defects.length > 0) score += 5;
    if (flaws.unconscionable_terms.length > 0) score += 5;

    return Math.min(100, score);
  }

  /**
   * Identify available affirmative defenses
   */
  private identifyAffirmativeDefenses(aiAnalysis: any, debtType: 'consumer' | 'business'): AffirmativeDefense[] {
    const defenses: AffirmativeDefense[] = [];

    const flaws = aiAnalysis.flaws_detected;
    const standing = aiAnalysis.standing_defects;

    // Lack of Standing (MOST POWERFUL DEFENSE)
    if (standing.missing_chain_of_title || standing.no_original_creditor_assignment) {
      defenses.push({
        defense: 'Lack of Standing',
        strength: 'CRITICAL',
        basis: 'Plaintiff cannot prove legal right to sue. No assignment agreement or chain of title provided.',
        case_law: 'Hundal v. Select Portfolio Servicing, 211 F.Supp.3d 1117 (2016)',
        statute: 'O.C.G.A. §9-11-12(b)(6) - Failure to state a claim'
      });
    }

    // Statute of Frauds
    if (flaws.statute_of_frauds_violation) {
      defenses.push({
        defense: 'Statute of Frauds',
        strength: 'HIGH',
        basis: 'Contract for sale of goods over $500 must be in writing. No signed writing provided.',
        statute: 'UCC §2-201, O.C.G.A. §11-2-201'
      });
    }

    // Void for Vagueness
    if (flaws.void_for_vagueness) {
      defenses.push({
        defense: 'Void for Vagueness',
        strength: 'HIGH',
        basis: 'Contract terms are so ambiguous and unclear that the contract is unenforceable.',
        case_law: 'Georgia law requires contract terms to be definite and certain'
      });
    }

    // Missing Essential Terms
    if (flaws.missing_essential_terms.length > 0) {
      defenses.push({
        defense: 'Lack of Mutual Assent',
        strength: 'HIGH',
        basis: `Contract missing essential terms: ${flaws.missing_essential_terms.join(', ')}. No meeting of the minds.`,
        case_law: 'O.C.G.A. §13-3-1 - Essential elements of a contract'
      });
    }

    // Fraud/Robo-Signing
    if (flaws.robo_signed || standing.robo_signed_affidavit) {
      defenses.push({
        defense: 'Fraud on the Court',
        strength: 'CRITICAL',
        basis: 'Affidavit signed without personal knowledge (robo-signing). Constitutes fraud on the court.',
        case_law: 'In re Foreclosure Cases, 521 F.Supp.2d 650 (S.D. Ohio 2007)'
      });
    }

    // Unconscionability
    if (flaws.unconscionable_terms.length > 0) {
      defenses.push({
        defense: 'Unconscionability',
        strength: 'MODERATE',
        basis: `Contract contains unconscionable terms: ${flaws.unconscionable_terms.join(', ')}`,
        statute: 'O.C.G.A. §13-8-2 - Unconscionable contracts'
      });
    }

    return defenses;
  }

  /**
   * Find counterclaim opportunities (OFFENSE)
   */
  private findCounterclaimOpportunities(aiAnalysis: any, debtType: 'consumer' | 'business'): CounterclaimOpportunity[] {
    const counterclaims: CounterclaimOpportunity[] = [];

    // FDCPA violations (consumer debt only)
    if (debtType === 'consumer') {
      if (aiAnalysis.flaws_detected.robo_signed) {
        counterclaims.push({
          claim: 'FDCPA Violation - False Affidavit',
          estimated_damages: 1000,
          basis: 'Robo-signed affidavit violates FDCPA §1692e (false or misleading representations)',
          statute: '15 USC §1692e, §1692k - $1,000 statutory damages + attorney fees',
          success_probability: 85
        });
      }
    }

    // Fraud
    if (aiAnalysis.flaws_detected.robo_signed) {
      counterclaims.push({
        claim: 'Fraud',
        estimated_damages: 5000,
        basis: 'Defendant made material misrepresentations in affidavit signed without personal knowledge',
        statute: 'O.C.G.A. §51-6-1 - Fraud and deceit',
        success_probability: 70
      });
    }

    return counterclaims;
  }

  /**
   * Generate recommended strategy
   */
  private generateStrategy(
    exploitabilityScore: number,
    defenses: AffirmativeDefense[],
    counterclaims: CounterclaimOpportunity[]
  ): { strategy: 'AGGRESSIVE' | 'DEFENSIVE' | 'SETTLE' | 'IGNORE'; reasoning: string; success_probability: number } {
    
    const hasCriticalDefense = defenses.some(d => d.strength === 'CRITICAL');
    const hasHighDefense = defenses.some(d => d.strength === 'HIGH');
    const hasCounterclaim = counterclaims.length > 0;

    if (exploitabilityScore >= 75 && hasCriticalDefense) {
      return {
        strategy: 'AGGRESSIVE',
        reasoning: 'Contract has critical flaws. File Motion to Dismiss + Counterclaim. High probability of complete victory.',
        success_probability: 90
      };
    }

    if (exploitabilityScore >= 50 && (hasCriticalDefense || hasCounterclaim)) {
      return {
        strategy: 'AGGRESSIVE',
        reasoning: 'Strong defenses available. File Answer with Affirmative Defenses + Counterclaim. Force them to drop or settle favorably.',
        success_probability: 75
      };
    }

    if (exploitabilityScore >= 30 && hasHighDefense) {
      return {
        strategy: 'DEFENSIVE',
        reasoning: 'Moderate defenses. File Answer with Affirmative Defenses. Leverage defenses for favorable settlement.',
        success_probability: 60
      };
    }

    if (exploitabilityScore < 30) {
      return {
        strategy: 'SETTLE',
        reasoning: 'Contract appears valid. Negotiate settlement for 40-60% of debt amount.',
        success_probability: 50
      };
    }

    return {
      strategy: 'DEFENSIVE',
      reasoning: 'Standard defensive posture. File Answer with available defenses.',
      success_probability: 50
    };
  }

  /**
   * Generate Motion to Dismiss
   */
  private async generateMotionToDismiss(aiAnalysis: any, defenses: AffirmativeDefense[]): Promise<string> {
    const criticalDefenses = defenses.filter(d => d.strength === 'CRITICAL' || d.strength === 'HIGH');
    
    if (criticalDefenses.length === 0) {
      return 'N/A - No grounds for Motion to Dismiss. File Answer with Affirmative Defenses instead.';
    }

    // Generate motion based on strongest defense
    const strongestDefense = criticalDefenses[0];
    
    return `IN THE STATE COURT OF [COUNTY NAME]
STATE OF GEORGIA

[PLAINTIFF NAME],
  Plaintiff,
v.
[DEFENDANT NAME],
  Defendant.

DEFENDANT'S MOTION TO DISMISS
PURSUANT TO O.C.G.A. §9-11-12(b)(6)

COMES NOW the Defendant and moves this Court to dismiss Plaintiff's Complaint with prejudice pursuant to O.C.G.A. §9-11-12(b)(6) for failure to state a claim upon which relief can be granted.

GROUNDS FOR DISMISSAL

${strongestDefense.defense.toUpperCase()}

${strongestDefense.basis}

Legal Authority: ${strongestDefense.statute || strongestDefense.case_law}

Plaintiff has failed to establish standing to bring this action. Without proper documentation of ownership of the alleged debt, Plaintiff cannot proceed.

WHEREFORE, Defendant respectfully requests that this Court:
1. DISMISS Plaintiff's Complaint with prejudice;
2. Award Defendant costs and attorney fees;
3. Grant such other relief as the Court deems just and proper.

Respectfully submitted,

[Your Name]
Defendant, Pro Se
[Address]
[Phone]
[Email]`;
  }

  /**
   * Generate Answer with Affirmative Defenses
   */
  private async generateAnswerWithDefenses(aiAnalysis: any, defenses: AffirmativeDefense[]): Promise<string> {
    const defensesText = defenses.map((d, i) => `
${i + 1}. ${d.defense.toUpperCase()}

${d.basis}

Legal Authority: ${d.statute || d.case_law || 'Common law defense'}
`).join('\n');

    return `IN THE STATE COURT OF [COUNTY NAME]
STATE OF GEORGIA

[PLAINTIFF NAME],
  Plaintiff,
v.
[DEFENDANT NAME],
  Defendant.

DEFENDANT'S ANSWER AND AFFIRMATIVE DEFENSES

COMES NOW the Defendant and answers Plaintiff's Complaint as follows:

GENERAL DENIAL

Defendant denies each and every allegation contained in Plaintiff's Complaint except as specifically admitted herein.

AFFIRMATIVE DEFENSES

${defensesText}

WHEREFORE, having fully answered, Defendant prays that:
1. Plaintiff's Complaint be DISMISSED with prejudice;
2. Defendant be awarded costs and attorney fees;
3. The Court grant such other relief as is just and proper.

Respectfully submitted,

[Your Name]
Defendant, Pro Se`;
  }

  /**
   * Generate Counterclaim
   */
  private async generateCounterclaim(counterclaims: CounterclaimOpportunity[]): Promise<string> {
    if (counterclaims.length === 0) {
      return 'N/A - No counterclaim opportunities identified.';
    }

    const claims = counterclaims.map((c, i) => `
COUNT ${i + 1}: ${c.claim.toUpperCase()}

${c.basis}

Damages: $${c.estimated_damages.toLocaleString()}

Legal Authority: ${c.statute}
`).join('\n');

    return `DEFENDANT'S COUNTERCLAIM

${claims}

PRAYER FOR RELIEF

WHEREFORE, Defendant prays for judgment against Plaintiff as follows:
1. Actual damages in the amount of $${counterclaims.reduce((sum, c) => sum + c.estimated_damages, 0).toLocaleString()};
2. Statutory damages as provided by law;
3. Attorney fees and costs;
4. Punitive damages;
5. Such other relief as the Court deems just and proper.`;
  }

  /**
   * Generate Discovery Requests
   */
  private async generateDiscoveryRequests(aiAnalysis: any): Promise<string> {
    return `DEFENDANT'S FIRST INTERROGATORIES AND REQUEST FOR PRODUCTION OF DOCUMENTS

INTERROGATORIES:

1. State the name and address of the original creditor.

2. Provide the complete chain of title showing all assignments of this alleged debt from original creditor to present plaintiff.

3. Identify the individual with personal knowledge who signed the affidavit in support of plaintiff's complaint.

4. State the last date defendant made a payment on this alleged account.

5. State the exact amount owed, including principal, interest, fees, and how each was calculated.

REQUEST FOR PRODUCTION:

1. The original signed contract or credit agreement between defendant and original creditor.

2. All assignment agreements transferring this debt from original creditor to plaintiff.

3. Complete account statements showing all charges, payments, and fees.

4. Documents supporting plaintiff's standing to sue (chain of title, assignments, bills of sale).

5. All communications between plaintiff and defendant regarding this alleged debt.

Defendant reserves the right to supplement these discovery requests.`;
  }

  /**
   * Get exploitability level from score
   */
  private getExploitabilityLevel(score: number): 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' {
    if (score >= 75) return 'CRITICAL';
    if (score >= 50) return 'HIGH';
    if (score >= 30) return 'MODERATE';
    if (score >= 10) return 'LOW';
    return 'NONE';
  }
}
