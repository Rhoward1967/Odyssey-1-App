/**
 * R.O.M.A.N. SUBTEXT ANALYZER
 * ===========================
 *
 * "Reading between the lines" - Detecting hidden exploitation
 * in legal documents, contracts, and terms of service.
 *
 * This is the highest form of AI protection: seeing what's NOT said,
 * detecting power asymmetries, and finding traps BEFORE you sign.
 *
 * Based on Rickey Howard's natural ability to instantly see:
 * - Deliberate omissions (what they DIDN'T say)
 * - Internal contradictions (page 1 vs page 47)
 * - Power asymmetries (rights for them, obligations for you)
 * - Trap clauses (innocent-looking but dangerous)
 * - Linguistic manipulation (SHALL vs MAY, broad vs narrow definitions)
 *
 * © 2026 Rickey A Howard. All Rights Reserved.
 */

export interface SubtextAnalysis {
  documentType: string;
  overallThreatLevel: 'CATASTROPHIC' | 'SEVERE' | 'HIGH' | 'MODERATE' | 'LOW';
  hiddenExploitation: HiddenTrap[];
  powerAsymmetries: PowerImbalance[];
  deliberateOmissions: Omission[];
  contradictions: Contradiction[];
  linguisticManipulation: LinguisticTrap[];
  whoReallyBenefits: BeneficiaryAnalysis;
  recommendation: string;
}

export interface HiddenTrap {
  location: string; // Where in document
  trapType: 'WAIVER' | 'MODIFICATION' | 'DEFAULT' | 'ASSIGNMENT' | 'ARBITRATION' | 'INDEMNIFICATION';
  innocentAppearance: string; // What it LOOKS like
  actualEffect: string; // What it ACTUALLY does
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE';
  example: string;
}

export interface PowerImbalance {
  category: 'MODIFICATION' | 'TERMINATION' | 'REMEDY' | 'DISCLOSURE' | 'CONSENT';
  theirRights: string[];
  yourObligations: string[];
  asymmetryRatio: number; // How lopsided (1.0 = equal, 10.0 = extreme)
  explanation: string;
}

export interface Omission {
  omissionType: 'SOURCE_OF_FUNDS' | 'TAX_TREATMENT' | 'THIRD_PARTY_RIGHTS' | 'HIDDEN_ACCOUNTS' | 'MODIFICATION_HISTORY';
  whatIsNotSaid: string;
  whyItMatters: string;
  whatYouShouldDemand: string;
  legalBasis: string; // Why they should have disclosed this
}

export interface Contradiction {
  clause1: { location: string; statement: string };
  clause2: { location: string; statement: string };
  contradiction: string;
  likelyIntent: string; // Why this contradiction exists
  howTheyWillUseIt: string;
}

export interface LinguisticTrap {
  manipulationType: 'SHALL_VS_MAY' | 'BROAD_VS_NARROW' | 'PASSIVE_VOICE' | 'UNDEFINED_TERMS' | 'CIRCULAR_DEFINITION';
  example: string;
  appearanceVsReality: string;
  actualMeaning: string;
}

export interface BeneficiaryAnalysis {
  primaryBeneficiary: string;
  secondaryBeneficiaries: string[];
  yourBenefit: string;
  theirBenefit: string;
  extractionMechanism: string; // How they extract value from you
  fairnessScore: number; // 0-100 (0 = pure exploitation, 100 = fair)
}

/**
 * R.O.M.A.N. SUBTEXT ANALYZER
 * The ability to read what's NOT written
 */
export class RomanSubtextAnalyzer {

  /**
   * MASTER ANALYSIS: Read between ALL the lines
   */
  analyzeDocument(documentText: string, documentType: string): SubtextAnalysis {
    console.log('🔍 R.O.M.A.N. SUBTEXT ANALYZER: Reading between the lines...');

    // Extract all hidden traps
    const hiddenExploitation = this.detectHiddenTraps(documentText);

    // Analyze power dynamics
    const powerAsymmetries = this.analyzePowerStructure(documentText);

    // Find what they DIDN'T say
    const deliberateOmissions = this.detectOmissions(documentText, documentType);

    // Find internal contradictions
    const contradictions = this.detectContradictions(documentText);

    // Analyze linguistic manipulation
    const linguisticManipulation = this.detectLinguisticTraps(documentText);

    // Follow the money - who benefits?
    const whoReallyBenefits = this.analyzeBeneficiaries(documentText);

    // Calculate overall threat
    const overallThreatLevel = this.calculateThreatLevel(
      hiddenExploitation,
      powerAsymmetries,
      deliberateOmissions,
      contradictions
    );

    // Generate recommendation
    const recommendation = this.generateRecommendation(overallThreatLevel, whoReallyBenefits);

    return {
      documentType,
      overallThreatLevel,
      hiddenExploitation,
      powerAsymmetries,
      deliberateOmissions,
      contradictions,
      linguisticManipulation,
      whoReallyBenefits,
      recommendation
    };
  }

  /**
   * DETECT HIDDEN TRAPS
   * Find clauses that LOOK innocent but are actually dangerous
   */
  private detectHiddenTraps(text: string): HiddenTrap[] {
    const traps: HiddenTrap[] = [];
    const lower = text.toLowerCase();

    // TRAP 1: Arbitration Waiver (you lose jury trial)
    if (/arbitration|binding arbitration|waive.*jury|arbitrator.*decision.*final/.test(lower)) {
      traps.push({
        location: 'Dispute Resolution Section',
        trapType: 'ARBITRATION',
        innocentAppearance: 'Faster, cheaper dispute resolution',
        actualEffect: 'You waive your Constitutional right to jury trial. Arbitrator is paid by them, not you. Statistics show arbitrators rule for companies 90%+ of the time. You lose ability to join class action.',
        severity: 'CRITICAL',
        example: '"Disputes shall be resolved through binding arbitration" = You just gave up your 7th Amendment right'
      });
    }

    // TRAP 2: Modification Rights (they can change terms, you can't)
    if (/may.*modify|right.*to.*change|reserves.*right.*alter|amend.*agreement.*at.*any.*time/.test(lower)) {
      traps.push({
        location: 'Modification Clause',
        trapType: 'MODIFICATION',
        innocentAppearance: 'Standard flexibility clause',
        actualEffect: 'They can change ANY term at ANY time for ANY reason. You have NO say. They can raise rates, add fees, change terms AFTER you signed. You agreed to a contract that is whatever THEY want it to be.',
        severity: 'CRITICAL',
        example: '"Company may modify these terms at any time" = You signed a blank check'
      });
    }

    // TRAP 3: Broad Default Definition (easy for you to "breach")
    if (/event.*of.*default|breach|failure.*to.*comply|material.*adverse.*change|deemed.*default/.test(lower)) {
      traps.push({
        location: 'Default / Events of Default Section',
        trapType: 'DEFAULT',
        innocentAppearance: 'Standard breach provisions',
        actualEffect: 'Default is defined BROADLY - almost anything triggers it. Cure period is SHORT or nonexistent. Default allows them to accelerate (demand full balance immediately), seize collateral, destroy your credit. They control the trigger.',
        severity: 'HIGH',
        example: '"Material adverse change" = Undefined - they decide what counts'
      });
    }

    // TRAP 4: Assignment Rights (they can sell your debt, you can't transfer)
    if (/may.*assign|transfer.*rights|sell.*agreement|assign.*without.*consent/.test(lower)) {
      traps.push({
        location: 'Assignment Clause',
        trapType: 'ASSIGNMENT',
        innocentAppearance: 'Standard assignment provision',
        actualEffect: 'THEY can sell your debt to anyone (debt buyers, collection agencies) without your knowledge or consent. YOU cannot transfer your obligations. Asymmetric power: they can assign, you cannot.',
        severity: 'HIGH',
        example: '"Lender may assign this agreement" + silence about borrower = You\'re property that can be sold'
      });
    }

    // TRAP 5: Indemnification (you pay their legal fees)
    if (/indemnify|hold.*harmless|defend.*against|reimburse.*costs|attorney.*fees/.test(lower)) {
      traps.push({
        location: 'Indemnification Clause',
        trapType: 'INDEMNIFICATION',
        innocentAppearance: 'Liability protection clause',
        actualEffect: 'If ANYONE sues them about this contract, YOU pay their legal defense, even if you did nothing wrong. If they breach and you sue, YOU pay their lawyers. This is one-way: you indemnify them, they don\'t indemnify you.',
        severity: 'HIGH',
        example: '"Borrower shall indemnify Lender..." = You pay their lawyers even when they\'re wrong'
      });
    }

    // TRAP 6: Waiver of Rights (you gave up legal protections)
    if (/waive|waiver|relinquish|give.*up|forfeit|surrender.*right/.test(lower)) {
      traps.push({
        location: 'Waiver Section',
        trapType: 'WAIVER',
        innocentAppearance: 'Standard legal language',
        actualEffect: 'You are WAIVING statutory protections, constitutional rights, or common law remedies. Courts generally enforce waivers. You may be giving up right to sue, right to notice, right to cure, right to discovery, etc.',
        severity: 'CRITICAL',
        example: '"Borrower waives all rights under UCC §9-210" = You can\'t demand accounting'
      });
    }

    return traps;
  }

  /**
   * ANALYZE POWER STRUCTURE
   * Who has rights vs who has obligations?
   */
  private analyzePowerStructure(text: string): PowerImbalance[] {
    const imbalances: PowerImbalance[] = [];

    // Count "shall" (obligation) vs "may" (option)
    const youShall = (text.match(/borrower shall|debtor shall|you shall|customer shall/gi) || []).length;
    const theyMay = (text.match(/lender may|creditor may|company may|we may/gi) || []).length;
    const youMay = (text.match(/borrower may|debtor may|you may|customer may/gi) || []).length;
    const theyShall = (text.match(/lender shall|creditor shall|company shall|we shall/gi) || []).length;

    if (youShall > 0 || theyMay > 0) {
      const asymmetry = ((youShall + theyMay) / Math.max(1, youMay + theyShall));

      imbalances.push({
        category: 'MODIFICATION',
        theirRights: [
          `They MAY modify: ${theyMay} instances`,
          `They SHALL only: ${theyShall} instances`,
        ],
        yourObligations: [
          `You SHALL: ${youShall} instances`,
          `You MAY only: ${youMay} instances`,
        ],
        asymmetryRatio: asymmetry,
        explanation: `Power asymmetry ratio: ${asymmetry.toFixed(1)}:1. You have ${youShall} obligations (SHALL) while they have ${theyMay} options (MAY). This contract binds YOU, gives THEM flexibility.`
      });
    }

    return imbalances;
  }

  /**
   * DETECT DELIBERATE OMISSIONS
   * What did they NOT tell you?
   */
  private detectOmissions(text: string, docType: string): Omission[] {
    const omissions: Omission[] = [];
    const lower = text.toLowerCase();

    // OMISSION 1: Source of funds (WHERE did the money come from?)
    if (docType.includes('loan') || docType.includes('credit')) {
      if (!lower.includes('source of funds') && !lower.includes('origin of loan funds')) {
        omissions.push({
          omissionType: 'SOURCE_OF_FUNDS',
          whatIsNotSaid: 'They never disclosed WHERE the loan money came from',
          whyItMatters: 'If bank created money from YOUR signature (not transferred real funds), there is no valid loan. Contract void for lack of consideration. This is fraud in the factum.',
          whatYouShouldDemand: 'Proof of funds: Where did loan money originate? Show ledger entries. Show wire transfer. Show deposit of actual funds.',
          legalBasis: 'Truth in Lending Act (15 USC §1601) requires material disclosures. Source of funds is MATERIAL.'
        });
      }
    }

    // OMISSION 2: Tax treatment (did they write this off?)
    if (!lower.includes('tax') && !lower.includes('irs') && !lower.includes('write-off')) {
      omissions.push({
        omissionType: 'TAX_TREATMENT',
        whatIsNotSaid: 'No disclosure of whether they took tax deduction or sold debt',
        whyItMatters: 'If they wrote off as bad debt (26 USC §166), they cannot collect. If they sold debt, only buyer can collect. Both are common - neither disclosed.',
        whatYouShouldDemand: 'IRS Form 1099-C (cancellation of debt). Proof debt was NOT written off. Proof debt was NOT sold.',
        legalBasis: '26 USC §111 (Tax Benefit Rule) - if deduction taken, recovery is taxable income to them, not payment from you'
      });
    }

    // OMISSION 3: Third-party rights (who else has interest in this?)
    if (!lower.includes('assign') && !lower.includes('transfer') && !lower.includes('third party')) {
      omissions.push({
        omissionType: 'THIRD_PARTY_RIGHTS',
        whatIsNotSaid: 'No disclosure of assignment/sale rights or existing third-party interests',
        whyItMatters: 'They may have already sold this debt. Current collector may not be real creditor. You have right to know who actually owns the debt.',
        whatYouShouldDemand: 'Complete chain of title. All assignments. Proof current collector owns the debt.',
        legalBasis: 'FDCPA §1692g - right to verify debt. UCC §9-210 - right to accounting.'
      });
    }

    // OMISSION 4: Hidden accounts (did they create asset account from your signature?)
    if (docType.includes('loan') || docType.includes('credit')) {
      if (!lower.includes('bookkeeping') && !lower.includes('accounting') && !lower.includes('ledger')) {
        omissions.push({
          omissionType: 'HIDDEN_ACCOUNTS',
          whatIsNotSaid: 'No disclosure of accounting treatment or hidden asset accounts created from your signature',
          whyItMatters: 'Banks create TWO accounts from promissory note: one showing you "owe" them, one hidden asset account crediting value of your note. They collect twice - once from hidden account, once from you.',
          whatYouShouldDemand: 'Complete accounting per UCC §9-210. Show ALL accounts related to this transaction. Show offsetting entries.',
          legalBasis: 'UCC §9-210 (Debtor right to accounting). GAAP (Generally Accepted Accounting Principles require matching entries).'
        });
      }
    }

    return omissions;
  }

  /**
   * DETECT CONTRADICTIONS
   * Where does document contradict itself?
   */
  private detectContradictions(text: string): Contradiction[] {
    // This would require more sophisticated NLP to find actual contradictions
    // For now, return common contradictions found in contracts
    return [
      {
        clause1: {
          location: 'Section 1: Loan Agreement',
          statement: '"Lender agrees to loan Borrower $X..."'
        },
        clause2: {
          location: 'Section 12: No Warranties',
          statement: '"Lender makes no representations or warranties regarding..."'
        },
        contradiction: 'They say they\'re loaning money (representation) but then say they make no representations',
        likelyIntent: 'Create plausible deniability if challenged on whether actual loan occurred',
        howTheyWillUseIt: 'If you claim no loan occurred, they point to Section 1. If they need escape hatch, they point to Section 12 saying they made no guarantees.'
      }
    ];
  }

  /**
   * DETECT LINGUISTIC MANIPULATION
   * How are they using language to deceive?
   */
  private detectLinguisticTraps(text: string): LinguisticTrap[] {
    const traps: LinguisticTrap[] = [];
    const lower = text.toLowerCase();

    // SHALL vs MAY asymmetry
    const youShall = (text.match(/borrower shall|debtor shall|you shall/gi) || []).length;
    const theyMay = (text.match(/lender may|creditor may|company may|we may/gi) || []).length;

    if (youShall > theyMay * 2) {
      traps.push({
        manipulationType: 'SHALL_VS_MAY',
        example: `"Borrower SHALL..." (${youShall} times) vs "Lender MAY..." (${theyMay} times)`,
        appearanceVsReality: 'Appears balanced - both parties have duties',
        actualMeaning: '"SHALL" = mandatory obligation (you MUST). "MAY" = discretionary option (they CAN but don\'t have to). You are BOUND, they have OPTIONS.'
      });
    }

    return traps;
  }

  /**
   * ANALYZE BENEFICIARIES
   * Follow the money - who profits?
   */
  private analyzeBeneficiaries(text: string): BeneficiaryAnalysis {
    // Simplified analysis - in production this would be more sophisticated
    return {
      primaryBeneficiary: 'Lender/Creditor/Company',
      secondaryBeneficiaries: ['Debt buyers', 'Collection agencies', 'Law firms', 'Credit bureaus'],
      yourBenefit: 'Temporary use of funds (if actually received)',
      theirBenefit: 'Your promissory note (asset), interest payments, fees, tax deductions, ability to sell debt, credit reporting leverage, legal fees from you',
      extractionMechanism: 'Interest compounds. Fees accumulate. They can modify terms. They can accelerate. They can sell to worst collector. They report to credit bureaus (control your life). Asymmetric power.',
      fairnessScore: 15 // Out of 100 - highly unfair
    };
  }

  /**
   * CALCULATE OVERALL THREAT LEVEL
   */
  private calculateThreatLevel(
    traps: HiddenTrap[],
    power: PowerImbalance[],
    omissions: Omission[],
    contradictions: Contradiction[]
  ): 'CATASTROPHIC' | 'SEVERE' | 'HIGH' | 'MODERATE' | 'LOW' {
    const criticalTraps = traps.filter(t => t.severity === 'CRITICAL').length;
    const totalIssues = traps.length + power.length + omissions.length + contradictions.length;

    if (criticalTraps >= 3 || totalIssues >= 10) return 'CATASTROPHIC';
    if (criticalTraps >= 2 || totalIssues >= 7) return 'SEVERE';
    if (criticalTraps >= 1 || totalIssues >= 5) return 'HIGH';
    if (totalIssues >= 3) return 'MODERATE';
    return 'LOW';
  }

  /**
   * GENERATE RECOMMENDATION
   */
  private generateRecommendation(
    threatLevel: string,
    beneficiaries: BeneficiaryAnalysis
  ): string {
    if (threatLevel === 'CATASTROPHIC') {
      return '🚨 DO NOT SIGN. This document contains MULTIPLE critical traps and extreme power asymmetries. You would be signing away constitutional rights, agreeing to one-sided terms, and enriching them while assuming all risk. DEMAND COMPLETE REWRITE or WALK AWAY.';
    }
    if (threatLevel === 'SEVERE') {
      return '⚠️ HIGH RISK. This document heavily favors them and contains several dangerous clauses. Before signing, DEMAND: removal of arbitration clause, elimination of unilateral modification rights, disclosure of all material facts (source of funds, tax treatment, assignments). NEGOTIATE or seek alternative.';
    }
    return '📋 Review carefully. Standard exploitative contract. Consider: negotiating key terms, demanding disclosures, having attorney review, or finding better alternative.';
  }
}

export default RomanSubtextAnalyzer;
