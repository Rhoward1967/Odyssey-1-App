/**
 * Business Debt Defense Engine
 * 
 * CRITICAL DIFFERENCES FROM CONSUMER DEBT:
 * - FDCPA does NOT apply to business debt (15 USC §1692a(5))
 * - No 30-day validation requirement
 * - Collectors can be more aggressive
 * - BUT: Still can't harass, threaten, or commit fraud
 * 
 * Key Business Debt Defenses:
 * - Georgia Statute of Limitations (O.C.G.A. §9-3-24, §9-3-25)
 * - Uniform Commercial Code (UCC) defenses
 * - Contract law defenses
 * - Corporate veil protection
 * - Counterclaims
 */

export interface BusinessDebtAccount {
  creditor: string;
  creditorType: string;
  originalAmount: number;
  currentAmount: number;
  lastPaymentDate: Date;
  dateOfDefault: Date;
  accountNumber: string;
  contractType: 'written' | 'oral' | 'implied';
  personalGuarantee: boolean; // CRITICAL: Did you personally guarantee?
  corporateVeilIntact: boolean; // Is LLC protection still valid?
  businessEntityId?: string;
  collectionAgency?: string;
  demandLetterReceived?: Date;
  lawsuitFiled?: Date;
}

export interface BusinessLegalAnalysis {
  account: BusinessDebtAccount;
  statuteExpired: boolean;
  statuteExpiryDate: Date;
  personalLiability: boolean; // Are YOU personally liable?
  corporateShieldIntact: boolean;
  recommendedAction: string;
  applicableDefenses: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimatedDefenseStrength: number; // 0-100%
  nextSteps: string[];
  warnings: string[];
}

export class BusinessDebtDefenseEngine {
  private readonly GEORGIA_WRITTEN_CONTRACT_SOL = 6; // years (O.C.G.A. §9-3-24)
  private readonly GEORGIA_ORAL_CONTRACT_SOL = 4; // years (O.C.G.A. §9-3-25)

  /**
   * Analyzes business debt under Georgia commercial law
   */
  analyzeBusinessDebt(account: BusinessDebtAccount): BusinessLegalAnalysis {
    const statuteAnalysis = this.analyzeStatuteOfLimitations(account);
    const personalLiability = this.analyzePersonalLiability(account);
    const defenses = this.identifyDefenses(account);
    const risk = this.calculateRiskLevel(account, statuteAnalysis, personalLiability);
    
    return {
      account,
      statuteExpired: statuteAnalysis.expired,
      statuteExpiryDate: statuteAnalysis.expiryDate,
      personalLiability: personalLiability.isLiable,
      corporateShieldIntact: personalLiability.shieldIntact,
      recommendedAction: this.getRecommendedAction(account, statuteAnalysis, personalLiability, risk),
      applicableDefenses: defenses,
      riskLevel: risk,
      estimatedDefenseStrength: this.calculateDefenseStrength(account, statuteAnalysis, defenses),
      nextSteps: this.generateNextSteps(account, statuteAnalysis, personalLiability, risk),
      warnings: this.generateWarnings(account, personalLiability, risk)
    };
  }

  /**
   * Georgia Statute of Limitations for Commercial Debt
   * O.C.G.A. §9-3-24: Written contracts - 6 years
   * O.C.G.A. §9-3-25: Oral agreements - 4 years
   */
  private analyzeStatuteOfLimitations(account: BusinessDebtAccount): {
    expired: boolean;
    expiryDate: Date;
    yearsRemaining: number;
  } {
    const sol = account.contractType === 'written' 
      ? this.GEORGIA_WRITTEN_CONTRACT_SOL 
      : this.GEORGIA_ORAL_CONTRACT_SOL;
    
    const expiryDate = new Date(account.dateOfDefault);
    expiryDate.setFullYear(expiryDate.getFullYear() + sol);
    
    const today = new Date();
    const expired = today > expiryDate;
    
    const yearsRemaining = (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    return {
      expired,
      expiryDate,
      yearsRemaining: Math.max(0, yearsRemaining)
    };
  }

  /**
   * CRITICAL: Analyze if YOU are personally liable
   * 
   * Personal liability exists if:
   * 1. You signed a personal guarantee
   * 2. Corporate veil was pierced (commingling funds, no corporate formalities)
   * 3. Fraudulent transfers
   * 4. Alter ego doctrine applies
   */
  private analyzePersonalLiability(account: BusinessDebtAccount): {
    isLiable: boolean;
    shieldIntact: boolean;
    reasons: string[];
  } {
    const reasons: string[] = [];
    let isLiable = false;
    let shieldIntact = account.corporateVeilIntact;

    // Did you personally guarantee the debt?
    if (account.personalGuarantee) {
      isLiable = true;
      reasons.push('You signed a personal guarantee - LLC shield does NOT protect you');
    }

    // Is corporate veil intact?
    if (!account.corporateVeilIntact) {
      isLiable = true;
      shieldIntact = false;
      reasons.push('Corporate veil pierced - personal assets at risk');
    }

    // If no personal guarantee and veil intact, you're protected
    if (!account.personalGuarantee && account.corporateVeilIntact) {
      reasons.push('LLC shield protects your personal assets');
    }

    return { isLiable, shieldIntact, reasons };
  }

  /**
   * Identify applicable defenses for business debt
   */
  private identifyDefenses(account: BusinessDebtAccount): string[] {
    const defenses: string[] = [];

    // Statute of Limitations
    const sol = this.analyzeStatuteOfLimitations(account);
    if (sol.expired) {
      defenses.push('Statute of Limitations (O.C.G.A. §9-3-24/25) - Debt time-barred');
    }

    // Contract Defenses
    defenses.push('Lack of Consideration - Did you receive what was promised?');
    defenses.push('Breach by Creditor - Did THEY breach first?');
    defenses.push('Fraudulent Inducement - Were you tricked into the contract?');
    defenses.push('Unconscionable Terms - Is contract grossly unfair?');
    defenses.push('Statute of Frauds - Contract required to be in writing?');
    
    // UCC Defenses (for sales of goods)
    defenses.push('UCC §2-725: 4-year SOL for sale of goods');
    defenses.push('UCC §2-607: Failure to properly notify of breach');
    defenses.push('UCC §2-715: Consequential damages');
    
    // Payment Defenses
    defenses.push('Accord and Satisfaction - Already settled?');
    defenses.push('Payment in Full - Already paid?');
    defenses.push('Account Stated - Failure to object to billing');
    
    // Procedural Defenses
    defenses.push('Lack of Standing - Can they even sue?');
    defenses.push('Failure to Prove Debt - Where\'s the proof?');
    defenses.push('Improper Service of Process');
    
    // Counterclaims
    defenses.push('Breach of Contract (counterclaim)');
    defenses.push('Fraud (counterclaim)');
    defenses.push('Negligence (counterclaim)');

    return defenses;
  }

  /**
   * Calculate risk level
   */
  private calculateRiskLevel(
    account: BusinessDebtAccount,
    sol: { expired: boolean },
    liability: { isLiable: boolean; shieldIntact: boolean }
  ): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    // Statute expired = LOW risk
    if (sol.expired) return 'LOW';

    // Personal guarantee + lawsuit filed = CRITICAL
    if (liability.isLiable && account.lawsuitFiled) return 'CRITICAL';

    // Personal guarantee = HIGH risk
    if (liability.isLiable) return 'HIGH';

    // LLC shield intact = MEDIUM risk
    if (liability.shieldIntact) return 'MEDIUM';

    return 'HIGH';
  }

  /**
   * Calculate defense strength (0-100%)
   */
  private calculateDefenseStrength(
    account: BusinessDebtAccount,
    sol: { expired: boolean },
    defenses: string[]
  ): number {
    let strength = 0;

    // Statute expired = automatic 100%
    if (sol.expired) return 100;

    // Corporate shield intact = +40%
    if (account.corporateVeilIntact && !account.personalGuarantee) {
      strength += 40;
    }

    // No personal guarantee = +30%
    if (!account.personalGuarantee) {
      strength += 30;
    }

    // Multiple defenses available = +20%
    strength += Math.min(20, defenses.length * 2);

    // Written contract = +10% (easier to defend than oral)
    if (account.contractType === 'written') {
      strength += 10;
    }

    return Math.min(100, strength);
  }

  /**
   * Generate recommended action
   */
  private getRecommendedAction(
    account: BusinessDebtAccount,
    sol: { expired: boolean; yearsRemaining: number },
    liability: { isLiable: boolean; shieldIntact: boolean },
    risk: string
  ): string {
    if (sol.expired) {
      return 'File Motion to Dismiss based on Statute of Limitations. DO NOT ACKNOWLEDGE DEBT.';
    }

    if (account.lawsuitFiled) {
      return 'URGENT: File Answer within 30 days. Hire attorney immediately. Raise all defenses.';
    }

    if (liability.isLiable && risk === 'CRITICAL') {
      return 'HIGH RISK: Consult bankruptcy attorney. Consider Chapter 7/11. Protect personal assets NOW.';
    }

    if (liability.shieldIntact && !liability.isLiable) {
      return 'GOOD POSITION: LLC shield protects personal assets. Do NOT make payment (could revive debt). Consult attorney about corporate defense.';
    }

    if (sol.yearsRemaining < 1) {
      return 'WAIT IT OUT: Statute expires soon. Do NOT make payment or acknowledge debt. This would restart SOL.';
    }

    return 'Demand proof of debt. Raise all applicable defenses. Consult business attorney.';
  }

  /**
   * Generate next steps
   */
  private generateNextSteps(
    account: BusinessDebtAccount,
    sol: { expired: boolean },
    liability: { isLiable: boolean },
    risk: string
  ): string[] {
    const steps: string[] = [];

    if (account.lawsuitFiled) {
      steps.push('1. File Answer within 30 days (CRITICAL DEADLINE)');
      steps.push('2. Raise all affirmative defenses');
      steps.push('3. File counterclaim if applicable');
      steps.push('4. Demand discovery - make them prove it');
    } else {
      steps.push('1. Do NOT acknowledge debt in writing');
      steps.push('2. Do NOT make any payments (restarts SOL)');
      steps.push('3. Demand verification of debt in writing');
      steps.push('4. Review contract for breach by creditor');
      steps.push('5. Document all collection activity');
    }

    if (liability.isLiable) {
      steps.push('6. Consider asset protection strategies');
      steps.push('7. Consult bankruptcy attorney');
    }

    if (sol.expired) {
      steps.push('8. File Motion to Dismiss based on SOL');
    }

    return steps;
  }

  /**
   * Generate warnings
   */
  private generateWarnings(
    account: BusinessDebtAccount,
    liability: { isLiable: boolean; shieldIntact: boolean },
    risk: string
  ): string[] {
    const warnings: string[] = [];

    if (account.personalGuarantee) {
      warnings.push('⚠️ DANGER: Personal guarantee makes YOU liable - LLC does NOT protect you');
    }

    if (!liability.shieldIntact) {
      warnings.push('⚠️ CRITICAL: Corporate veil pierced - personal assets at risk');
    }

    if (account.lawsuitFiled) {
      warnings.push('⚠️ URGENT: Lawsuit filed - you have 30 days to respond or face default judgment');
    }

    if (risk === 'CRITICAL') {
      warnings.push('⚠️ EXTREME RISK: Consult attorney IMMEDIATELY');
    }

    warnings.push('⚠️ DO NOT make payments - may restart statute of limitations');
    warnings.push('⚠️ DO NOT sign anything without attorney review');
    warnings.push('⚠️ FDCPA does NOT protect business debt - collectors can be more aggressive');

    return warnings;
  }
}
