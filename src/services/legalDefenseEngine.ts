/**
 * Legal Defense Engine - Consumer Protection Suite
 *
 * Uses ACTUAL federal consumer protection laws:
 * - FDCPA (15 USC §1692) - Fair Debt Collection Practices Act
 * - FCRA (15 USC §1681) - Fair Credit Reporting Act
 * - TILA (15 USC §1601) - Truth in Lending Act
 * - Georgia Statute of Limitations (O.C.G.A. §9-3-24, §9-3-25)
 *
 * LAYER 0 — CONSTITUTIONAL AUDITOR (runs first):
 * - 13th Amendment Badge of Slavery Diagnostic
 * - Jones v. Alfred H. Mayer Co. (1968) — all badges and incidents of slavery
 * - Bailey v. Alabama (1911) — peonage / debt bondage = involuntary servitude
 * - Counter-Canon Vol. 6 — Equity: Badge / Remedy
 *
 * Architecture: Badge of Slavery Diagnostic runs above all statutory analysis.
 * Constitutional arguments supersede consumer protection arguments.
 */

import { RomanBadgeOfSlaveryDiagnostic, type DiagnosticResult } from './romanBadgeOfSlaveryDiagnostic';

export interface DebtAccount {
  creditor: string;
  originalAmount: number;
  currentAmount: number;
  lastPaymentDate: Date;
  dateOfDefault: Date;
  accountNumber: string;
  collectionAgency?: string;
  collectionLetterReceived?: Date;
}

export interface LegalAnalysis {
  account: DebtAccount;
  statuteExpired: boolean;
  validationDeadline: Date | null;
  recommendedAction: string;
  applicableLaw: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  estimatedDefenseStrength: number; // 0-100%
}

export class LegalDefenseEngine {
  private readonly GEORGIA_WRITTEN_CONTRACT_SOL = 6; // years
  private readonly GEORGIA_ORAL_CONTRACT_SOL = 4; // years
  private readonly FDCPA_VALIDATION_WINDOW = 30; // days
  private readonly FCRA_DISPUTE_WINDOW = 30; // days

  /**
   * Analyzes debt account using Georgia statute of limitations
   * O.C.G.A. §9-3-24 (written contracts - 6 years)
   * O.C.G.A. §9-3-25 (oral agreements - 4 years)
   */
  analyzeStatuteOfLimitations(account: DebtAccount, contractType: 'written' | 'oral' = 'written'): boolean {
    const sol = contractType === 'written' 
      ? this.GEORGIA_WRITTEN_CONTRACT_SOL 
      : this.GEORGIA_ORAL_CONTRACT_SOL;
    
    const today = new Date();
    const lastActivity = account.lastPaymentDate;
    const yearsSinceActivity = (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    return yearsSinceActivity > sol;
  }

  /**
   * Calculates FDCPA debt validation deadline
   * 15 USC §1692g(a) - 30 days from initial communication
   */
  calculateValidationDeadline(collectionLetterDate: Date): Date {
    const deadline = new Date(collectionLetterDate);
    deadline.setDate(deadline.getDate() + this.FDCPA_VALIDATION_WINDOW);
    return deadline;
  }

  /**
   * Generates comprehensive legal analysis of debt account
   */
  analyzeAccount(account: DebtAccount): LegalAnalysis {
    const today = new Date();
    const statuteExpired = this.analyzeStatuteOfLimitations(account);
    
    let validationDeadline: Date | null = null;
    if (account.collectionLetterReceived) {
      validationDeadline = this.calculateValidationDeadline(account.collectionLetterReceived);
    }

    const applicableLaw: string[] = [];
    let recommendedAction = '';
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
    let estimatedDefenseStrength = 50;

    // Statute of Limitations Analysis
    if (statuteExpired) {
      applicableLaw.push('O.C.G.A. §9-3-24 (Statute of Limitations - EXPIRED)');
      recommendedAction = 'DO NOT ACKNOWLEDGE DEBT. Statute has expired - debt is unenforceable in court. If sued, raise SOL as affirmative defense.';
      riskLevel = 'LOW';
      estimatedDefenseStrength = 95;
    } else {
      applicableLaw.push('O.C.G.A. §9-3-24 (Statute of Limitations - ACTIVE)');
    }

    // FDCPA Validation Rights
    if (account.collectionAgency && validationDeadline) {
      applicableLaw.push('15 USC §1692g (FDCPA - Debt Validation Rights)');
      
      if (today <= validationDeadline) {
        recommendedAction = `SEND DEBT VALIDATION LETTER IMMEDIATELY (${this.daysUntil(validationDeadline)} days remaining). Demand proof of: (1) Original creditor, (2) Amount owed, (3) Proof of assignment to collection agency.`;
        riskLevel = 'MEDIUM';
        estimatedDefenseStrength = 70;
      } else {
        recommendedAction = 'Validation window expired. Consider credit report dispute under FCRA §1681i.';
      }
    }

    // FCRA Credit Report Rights
    applicableLaw.push('15 USC §1681i (FCRA - Credit Report Dispute Rights)');

    return {
      account,
      statuteExpired,
      validationDeadline,
      recommendedAction,
      applicableLaw,
      riskLevel,
      estimatedDefenseStrength
    };
  }

  /**
   * Generates FDCPA-compliant debt validation letter
   * Template uses 15 USC §1692g statutory language
   */
  generateValidationLetter(account: DebtAccount, yourName: string, yourAddress: string): string {
    const today = new Date().toLocaleDateString('en-US');
    
    return `${today}

${account.collectionAgency || account.creditor}
[Collection Agency Address - UPDATE THIS]

RE: Account #${account.accountNumber}
Debt Validation Request Under 15 USC §1692g

To Whom It May Concern:

This letter is sent in response to a notice I received from your agency regarding the above-referenced account. This is NOT a refusal to pay, but a notice sent pursuant to the Fair Debt Collection Practices Act, 15 USC §1692g, that your claim is disputed and validation is requested.

Under 15 USC §1692g(b), I have the right to request validation of this debt. Please provide the following within 30 days:

1. **Proof of Original Creditor**: Name and address of the original creditor
2. **Verification of Amount**: Complete breakdown of claimed debt, including:
   - Original principal amount
   - All accrued interest
   - Any fees or charges added
   - Date of last payment received by original creditor
3. **Proof of Assignment**: Documentation showing legal assignment of this debt to your agency
4. **Signed Contract**: Copy of original agreement bearing my signature
5. **Licensing**: Proof your agency is licensed to collect debts in Georgia

Under 15 USC §1692g(b), you must cease all collection activity until you provide this validation. Further, under 15 USC §1692e(8), communicating credit information known to be false is prohibited.

I dispute this debt. Do NOT contact me by phone. All future correspondence must be in writing to the address below.

Sincerely,

${yourName}
${yourAddress}

---
CERTIFIED MAIL - RETURN RECEIPT REQUESTED
Keep tracking number for FDCPA compliance monitoring
`;
  }

  /**
   * Analyzes collection agency response and generates rebuttal strategy
   */
  analyzeResponse(response: string, account: DebtAccount): {
    isValidated: boolean;
    violations: string[];
    nextAction: string;
  } {
    const violations: string[] = [];
    let isValidated = true;
    let nextAction = '';

    // Check for common FDCPA violations
    if (response.length < 100) {
      violations.push('15 USC §1692g(b) - Insufficient validation (generic response)');
      isValidated = false;
    }

    if (!response.toLowerCase().includes('original creditor') && !response.toLowerCase().includes(account.creditor.toLowerCase())) {
      violations.push('15 USC §1692g - Failed to identify original creditor');
      isValidated = false;
    }

    if (!response.toLowerCase().includes('assign') && !response.toLowerCase().includes('purchase')) {
      violations.push('15 USC §1692g - Failed to prove legal assignment of debt');
      isValidated = false;
    }

    if (response.toLowerCase().includes('statement') && !response.toLowerCase().includes('original agreement')) {
      violations.push('15 USC §1692g - Account statement is not validation (original signed contract required)');
      isValidated = false;
    }

    // Generate next action
    if (!isValidated) {
      nextAction = `SEND NOTICE OF INSUFFICIENT VALIDATION. Collection agency has violated FDCPA. File complaint with:
1. Consumer Financial Protection Bureau (CFPB) - consumerfinance.gov/complaint
2. Georgia Governor's Office of Consumer Protection
3. Consider consulting attorney for FDCPA lawsuit (statutory damages: $1,000 + actual damages + attorney fees)`;
    } else {
      nextAction = 'Validation appears complete. Review options: (1) Settlement negotiation, (2) Payment plan, (3) Bankruptcy consultation.';
    }

    return {
      isValidated,
      violations,
      nextAction
    };
  }

  /**
   * Tracks compliance deadlines for all legal processes
   */
  private daysUntil(date: Date): number {
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Generates credit report dispute letter (FCRA §1681i)
   */
  generateCreditDisputeLetter(
    accountNumber: string,
    creditorName: string,
    disputeReason: string,
    yourName: string,
    yourAddress: string,
    ssn: string
  ): string {
    const today = new Date().toLocaleDateString('en-US');

    return `${today}

[Credit Bureau Name]
[Credit Bureau Address]

RE: Formal Dispute Under 15 USC §1681i(a)
SSN: XXX-XX-${ssn.slice(-4)}

To Whom It May Concern:

I am writing to dispute the following information in my credit file. Under the Fair Credit Reporting Act, 15 USC §1681i(a)(1)(A), you must investigate and verify this information within 30 days or remove it from my report.

DISPUTED ITEM:
- Creditor: ${creditorName}
- Account Number: ${accountNumber}
- Reason for Dispute: ${disputeReason}

This item is: [CHECK ONE]
☐ Not mine - I never had an account with this creditor
☐ Inaccurate - The amount/date/status is incorrect
☐ Unverifiable - Creditor cannot prove this debt belongs to me

Under 15 USC §1681i(a)(5)(A), you must provide me with a description of the procedure used to verify this information. Please send me copies of all documents the creditor provided to verify this account.

If you cannot verify this information within 30 days, it must be removed from my credit report under 15 USC §1681i(a)(1)(A).

Enclosed: Copy of driver's license, recent utility bill (address verification)

Sincerely,

${yourName}
${yourAddress}

---
CERTIFIED MAIL - RETURN RECEIPT REQUESTED
Send to: Equifax, Experian, TransUnion (all 3 bureaus)
`;
  }

  /**
   * Calculate settlement offer based on debt age and collectability
   * Industry standard: Older debt = lower settlement percentage
   */
  calculateSettlementOffer(account: DebtAccount): {
    recommendedOffer: number;
    maxOffer: number;
    strategy: string;
    reasoning: string;
  } {
    const today = new Date();
    const yearsOld = (today.getTime() - account.dateOfDefault.getTime()) / (1000 * 60 * 60 * 24 * 365);
    const statuteExpired = this.analyzeStatuteOfLimitations(account);

    let offerPercentage = 0.5; // Default 50%
    let maxPercentage = 0.7; // Max 70%
    let strategy = '';
    let reasoning = '';

    if (statuteExpired) {
      offerPercentage = 0.1; // Offer 10%
      maxPercentage = 0.25; // Max 25%
      strategy = 'ULTRA LOW - Statute Expired';
      reasoning = 'Debt is unenforceable in court (6+ years old in Georgia). They cannot sue. Offer 10% max 25%. They bought this for 4 cents on the dollar - anything is profit.';
    } else if (yearsOld >= 4) {
      offerPercentage = 0.25; // Offer 25%
      maxPercentage = 0.40; // Max 40%
      strategy = 'LOW - Approaching Statute';
      reasoning = 'Debt is 4+ years old, approaching statute of limitations. Collectability decreases with age. Offer 25% max 40%.';
    } else if (yearsOld >= 2) {
      offerPercentage = 0.35; // Offer 35%
      maxPercentage = 0.50; // Max 50%
      strategy = 'MEDIUM - Standard Settlement';
      reasoning = 'Debt is 2-4 years old. Standard settlement range. Offer 35% max 50%.';
    } else {
      offerPercentage = 0.50; // Offer 50%
      maxPercentage = 0.70; // Max 70%
      strategy = 'HIGHER - Recent Debt';
      reasoning = 'Debt is less than 2 years old. Higher collectability. Offer 50% max 70%.';
    }

    return {
      recommendedOffer: Math.round(account.currentAmount * offerPercentage),
      maxOffer: Math.round(account.currentAmount * maxPercentage),
      strategy,
      reasoning
    };
  }

  /**
   * Generate settlement negotiation letter
   */
  generateSettlementLetter(
    account: DebtAccount,
    offerAmount: number,
    yourName: string,
    yourAddress: string
  ): string {
    const today = new Date().toLocaleDateString('en-US');
    const offerPercentage = Math.round((offerAmount / account.currentAmount) * 100);

    return `${today}

${account.collectionAgency || account.creditor}
[Collection Agency Address - UPDATE THIS]

RE: Account #${account.accountNumber}
Settlement Offer - ${offerPercentage}% of Balance

To Whom It May Concern:

This letter constitutes a formal settlement offer for the above-referenced account.

CURRENT BALANCE: $${account.currentAmount.toLocaleString()}
SETTLEMENT OFFER: $${offerAmount.toLocaleString()} (${offerPercentage}% of balance)

TERMS OF SETTLEMENT:
1. Payment of $${offerAmount.toLocaleString()} constitutes full and final settlement of this account
2. Upon receipt of payment, creditor will report account to credit bureaus as "PAID IN FULL" or delete entirely
3. Creditor will provide written confirmation of settlement terms BEFORE payment
4. No partial payments - lump sum only
5. This offer expires 30 days from the date of this letter

REQUIRED DOCUMENTATION (Before Payment):
- Written settlement agreement on company letterhead
- Confirmation that account will be reported as "PAID IN FULL" or deleted
- Statement that no 1099-C will be issued for forgiven amount
- Signature of authorized representative

PAYMENT METHOD:
Upon receipt of signed settlement agreement, payment will be made via cashier's check or money order.
NO electronic payments (protects against unauthorized future withdrawals).

This offer is made without admission of liability. I reserve all rights under the Fair Debt Collection Practices Act (15 USC §1692) and Fair Credit Reporting Act (15 USC §1681).

If this offer is not acceptable, please provide your counteroffer in writing within 15 days.

Sincerely,

${yourName}
${yourAddress}

---
CERTIFIED MAIL - RETURN RECEIPT REQUESTED
KEEP COPY FOR YOUR RECORDS
`;
  }

  /**
   * Advanced response analyzer - detects specific FDCPA violations
   */
  analyzeResponseAdvanced(response: string, account: DebtAccount): {
    isValidated: boolean;
    violations: Array<{
      statute: string;
      description: string;
      severity: 'CRITICAL' | 'MODERATE' | 'MINOR';
      statutoryDamages: number;
    }>;
    nextAction: string;
    legalStrength: number; // 0-100%
  } {
    const violations: Array<{
      statute: string;
      description: string;
      severity: 'CRITICAL' | 'MODERATE' | 'MINOR';
      statutoryDamages: number;
    }> = [];

    let isValidated = true;
    let legalStrength = 100;

    // Check for insufficient validation
    if (response.length < 100) {
      violations.push({
        statute: '15 USC §1692g(b)',
        description: 'Insufficient validation - Generic response without required documentation',
        severity: 'CRITICAL',
        statutoryDamages: 1000
      });
      isValidated = false;
      legalStrength = 90;
    }

    // Check for missing original creditor
    if (!response.toLowerCase().includes('original creditor') && 
        !response.toLowerCase().includes(account.creditor.toLowerCase())) {
      violations.push({
        statute: '15 USC §1692g(a)(2)',
        description: 'Failed to identify original creditor',
        severity: 'CRITICAL',
        statutoryDamages: 1000
      });
      isValidated = false;
      legalStrength = Math.min(legalStrength, 85);
    }

    // Check for missing assignment proof
    if (!response.toLowerCase().includes('assign') && 
        !response.toLowerCase().includes('purchase') &&
        !response.toLowerCase().includes('transfer')) {
      violations.push({
        statute: '15 USC §1692g',
        description: 'Failed to prove legal right to collect (no assignment documentation)',
        severity: 'CRITICAL',
        statutoryDamages: 1000
      });
      isValidated = false;
      legalStrength = Math.min(legalStrength, 80);
    }

    // Check if they sent statement instead of signed contract
    if (response.toLowerCase().includes('statement') && 
        !response.toLowerCase().includes('original agreement')) {
      violations.push({
        statute: '15 USC §1692g',
        description: 'Account statement is not validation - signed contract required',
        severity: 'MODERATE',
        statutoryDamages: 1000
      });
      isValidated = false;
      legalStrength = Math.min(legalStrength, 75);
    }

    // Check for threatening language
    const threats = ['sue', 'lawsuit', 'legal action', 'attorney', 'garnish', 'wage', 'arrest', 'jail'];
    const hasThreats = threats.some(threat => response.toLowerCase().includes(threat));
    if (hasThreats && !isValidated) {
      violations.push({
        statute: '15 USC §1692e(5)',
        description: 'Threatening legal action on unvalidated debt',
        severity: 'CRITICAL',
        statutoryDamages: 1000
      });
      legalStrength = Math.min(legalStrength, 95);
    }

    // Check for false urgency
    const urgencyWords = ['immediate', 'urgent', 'final notice', 'last chance'];
    const hasUrgency = urgencyWords.some(word => response.toLowerCase().includes(word));
    if (hasUrgency) {
      violations.push({
        statute: '15 USC §1692e(10)',
        description: 'False sense of urgency to coerce payment',
        severity: 'MODERATE',
        statutoryDamages: 1000
      });
    }

    // Check if they reported to credit bureaus before validation
    if (response.toLowerCase().includes('credit') && !isValidated) {
      violations.push({
        statute: '15 USC §1692e(8)',
        description: 'Reporting unvalidated debt to credit bureaus',
        severity: 'CRITICAL',
        statutoryDamages: 1000
      });
      legalStrength = Math.min(legalStrength, 70);
    }

    // Calculate total statutory damages
    const totalDamages = violations.reduce((sum, v) => sum + v.statutoryDamages, 0);

    // Generate next action
    let nextAction = '';
    if (violations.length === 0 && isValidated) {
      nextAction = 'Validation appears complete. Review settlement options or payment plans.';
    } else if (violations.length > 0) {
      nextAction = `FDCPA VIOLATIONS DETECTED (${violations.length} violations, $${totalDamages} potential damages).

IMMEDIATE ACTIONS:
1. FILE CFPB COMPLAINT: consumerfinance.gov/complaint
2. FILE FTC COMPLAINT: reportfraud.ftc.gov
3. SEND CEASE & DESIST LETTER: Stop all contact
4. CONSULT ATTORNEY: Free consultation for FDCPA cases (attorney fees paid by violator)

VIOLATIONS SUMMARY:
${violations.map(v => `- ${v.statute}: ${v.description} ($${v.statutoryDamages})`).join('\n')}

You may sue in federal or state court within 1 year of violation. Damages: $1,000 per violation + actual damages + attorney fees.`;
    } else {
      nextAction = 'Validation incomplete but no clear violations detected. Send follow-up demand for complete documentation.';
    }

    return {
      isValidated,
      violations,
      nextAction,
      legalStrength
    };
  }

  /**
   * Generate Cease & Desist letter (15 USC §1692c)
   */
  generateCeaseAndDesistLetter(
    account: DebtAccount,
    yourName: string,
    yourAddress: string,
    reason: 'all' | 'phone_only' = 'all'
  ): string {
    const today = new Date().toLocaleDateString('en-US');

    const phoneOnlyText = reason === 'phone_only' 
      ? 'This is a request to CEASE telephone contact only. Written communication to the address below is permitted.'
      : 'This is a request to CEASE ALL COMMUNICATION regarding this alleged debt.';

    return `${today}

${account.collectionAgency || account.creditor}
[Collection Agency Address - UPDATE THIS]

RE: Account #${account.accountNumber}
CEASE AND DESIST - 15 USC §1692c(c)

To Whom It May Concern:

${phoneOnlyText}

Under the Fair Debt Collection Practices Act, 15 USC §1692c(c), I hereby notify you to cease all communication with me regarding the above-referenced account.

${reason === 'all' 
  ? `Upon receipt of this notice, you may only contact me to:
1. Confirm receipt of this cease and desist notice
2. Notify me of specific legal action you intend to take

Any other communication is prohibited by federal law.`
  : `Do NOT contact me by telephone. All future correspondence must be in writing to the address below.`}

This letter does NOT constitute acknowledgment that I owe this debt. I reserve all rights under the FDCPA and FCRA.

VIOLATION WARNING: Continued contact after receipt of this notice violates 15 USC §1692c(c) and subjects your agency to statutory damages of $1,000 plus actual damages and attorney fees.

All future written correspondence ONLY to:
${yourName}
${yourAddress}

Sincerely,

${yourName}

---
CERTIFIED MAIL - RETURN RECEIPT REQUESTED
Date received = Date cease & desist takes effect
Any contact after = FDCPA violation
`;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LAYER 0: CONSTITUTIONAL AUDITOR
  // Runs above all statutory analysis. Constitutional injury supersedes
  // consumer protection violation.
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Run the 13th Amendment Badge of Slavery Diagnostic on a debt account.
   * Call this FIRST — before any FDCPA/FCRA/TILA analysis.
   * If a badge is detected at HIGH or CRITICAL severity, the constitutional
   * argument leads the defense strategy.
   */
  runBadgeDiagnostic(account: DebtAccount, additionalContext?: string): DiagnosticResult {
    const description = [
      `Creditor: ${account.creditor}`,
      `Original amount: $${account.originalAmount}`,
      `Current amount: $${account.currentAmount}`,
      account.collectionAgency ? `Collection agency: ${account.collectionAgency}` : '',
      additionalContext || ''
    ].filter(Boolean).join('. ');

    return RomanBadgeOfSlaveryDiagnostic.analyzeExtraction({
      description,
      extractingParty: account.collectionAgency || account.creditor,
      amount: account.currentAmount,
      isRecurring: false,
      affectedLineage: false,
      historicalPattern: account.currentAmount > account.originalAmount * 2
    });
  }

  /**
   * Generate a full Badge of Slavery diagnostic report for a debt account.
   */
  generateBadgeDiagnosticReport(account: DebtAccount, additionalContext?: string): string {
    return RomanBadgeOfSlaveryDiagnostic.generateReport({
      description: [
        `Creditor: ${account.creditor}`,
        `Original amount: $${account.originalAmount}`,
        `Current amount: $${account.currentAmount}`,
        account.collectionAgency ? `Collection agency: ${account.collectionAgency}` : '',
        additionalContext || ''
      ].filter(Boolean).join('. '),
      extractingParty: account.collectionAgency || account.creditor,
      amount: account.currentAmount,
      isRecurring: false,
      affectedLineage: false,
      historicalPattern: account.currentAmount > account.originalAmount * 2
    });
  }
}

// Export singleton instance
export const legalDefenseEngine = new LegalDefenseEngine();
