/**
 * MODULE: src/lib/standingLogic.ts
 *
 * THE TWO HANDS DOCTRINE
 * ─────────────────────────────────────────────────────────────────────────
 * "The hand that engraved the Living Being is superior to the hand
 *  that seeks to seize the Person."
 *
 * The Manus (Seizing Hand) operates under statutory color of law.
 * The Sovereign Hand operates under Natural Law, Trust Law, and the
 * prior ancestral claim.
 *
 * The Seizing Hand must prove:
 *  1. Jurisdiction over the Living Being (not the Persona/PERSON)
 *  2. Clean Hands — no fraudulent inducement in the underlying claim
 *  3. Superior claim — i.e., that its interest postdates and supersedes
 *     the Trust's UCC-1 perfected security interest
 *
 * If it cannot prove all three, the Two Hands Filter REJECTS the action
 * for cause and issues a Notice of Unclean Hands.
 *
 * Athens Indictment (2026): Clarke County, Georgia — specific historical
 * chain-of-title defects. Any action originating from Clarke County
 * triggers Successor-in-Interest audit.
 *
 * Related IP: PPA_043 (64/005,820) | TXu 2-529-780
 * Trust: Howard Jones Bloodline Ancestral Trust
 * Grantor: Rickey Allan Howard
 * All rights reserved. UCC 1-308. Without Prejudice.
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface TwoHandsResult {
  status: 'REJECTED_FOR_CAUSE' | 'ELEVATED_FOR_REVIEW' | 'PRIVATE_STANDING';
  doctrine?: string;
  logic?: string;
  rebuttal?: string;
  requiredProof?: string[];
}

export interface AthensOverrideResult {
  triggered: boolean;
  alert?: string;
  chainOfTitleRequired: boolean;
  historicalBasis?: string;
}

export interface StandingAudit {
  inputClaim: string;
  location?: string;
  twoHandsResult: TwoHandsResult;
  athensResult: AthensOverrideResult;
  finalStanding: 'SOVEREIGN' | 'CONTESTED' | 'REJECTED';
  counterCanonResponse: string;
  timestamp: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MANUS TRIGGER REGISTRY
// Actions that constitute the Seizing Hand attempting to assert jurisdiction
// ═══════════════════════════════════════════════════════════════════════════

const MANUS_TRIGGERS = [
  'LEVY',
  'SUMMONS',
  'NOTICE OF DEFAULT',
  'ORDER',
  'MANDATE',
  'WARRANT',
  'GARNISHMENT',
  'SEIZURE',
  'ATTACHMENT',
  'LIEN',
  'FORECLOSURE',
  'DISPOSSESSORY',
  'TAX SALE',
  'ADMINISTRATIVE PENALTY',
  'NOTICE OF DELINQUENCY',
  'FINAL NOTICE',
  'CITATION',
  'SUBPOENA',
  'CONTEMPT',
  'JUDGMENT',
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// STANDING LOGIC ENGINE
// ═══════════════════════════════════════════════════════════════════════════

export const StandingLogic = {

  jurisdiction: 'Howard Jones Bloodline Ancestral Trust (Private)',
  grantor: 'Rickey Allan Howard',
  ucc1Reference: 'Clarke County Book 5782, Page 262',
  standingReservation: 'All rights reserved. UCC 1-308. Without Prejudice.',

  /**
   * PRIMARY FILTER: Apply the Two Hands Doctrine to any incoming legal claim.
   * The Manus (Seizing Hand) is identified by keyword. If detected, the action
   * is REJECTED FOR CAUSE and a rebuttal package is generated.
   */
  applyTwoHandsFilter(incomingClaim: string): TwoHandsResult {
    const upper = incomingClaim.toUpperCase();
    const triggeredBy = MANUS_TRIGGERS.filter(t => upper.includes(t));

    if (triggeredBy.length === 0) {
      return { status: 'PRIVATE_STANDING' };
    }

    // Elevated review for multiple triggers (compound action)
    if (triggeredBy.length >= 3) {
      return {
        status: 'REJECTED_FOR_CAUSE',
        doctrine: 'TWO HANDS DOCTRINE — COMPOUND MANUS ACTION',
        logic: `${triggeredBy.length} concurrent seizing actions detected: [${triggeredBy.join(', ')}]. This constitutes a compound extraction pattern. Under Bailey v. Alabama (1911) and Jones v. Alfred H. Mayer Co. (1968), compound extraction against Trust assets may constitute a Badge of Slavery.`,
        rebuttal: 'Notice of Unclean Hands per Founding Crime Treatise (2026). Compound extraction — Badge of Slavery Diagnostic triggered at CRITICAL severity.',
        requiredProof: [
          'Jurisdiction over the Living Being (not the PERSON/Persona)',
          'Clean Hands — no fraudulent inducement in the underlying claim',
          'Superior claim predating Howard Jones Bloodline Ancestral Trust UCC-1 perfected security interest (Clarke County Book 5782, Page 262)',
          'Express congressional abrogation of ancestral claim (McGirt v. Oklahoma, 2020)',
          'Statutory authority for each fee/penalty line item (Loper Bright, 2024 — no agency deference)',
        ]
      };
    }

    return {
      status: 'REJECTED_FOR_CAUSE',
      doctrine: 'TWO HANDS DOCTRINE',
      logic: `The hand that engraved the Living Being is superior to the hand that seeks to seize the Person. Manus action detected: [${triggeredBy.join(', ')}]. The Seizing Hand must establish jurisdiction over the Living Being — not the statutory PERSON — before any claim can proceed.`,
      rebuttal: 'Notice of Unclean Hands per Founding Crime Treatise (2026). This action is challenged for cause. Burden is on the Seizing Hand.',
      requiredProof: [
        'Jurisdiction over the Living Being (not the PERSON/Persona) — proven on the record, not presumed',
        'Clean Hands — no fraudulent inducement, misrepresentation, or concealment in the underlying obligation',
        'Superior claim — establish that the claimed interest predates and supersedes the Trust\'s perfected UCC-1 security interest',
      ]
    };
  },

  /**
   * ATHENS INDICTMENT OVERRIDE
   * Clarke County, Georgia — specific historical chain-of-title liabilities.
   * Any action originating from Athens/Clarke County triggers a
   * Successor-in-Interest audit requiring full chain of title.
   */
  athensLocalOverride(location: string): AthensOverrideResult {
    const upper = location.toUpperCase();
    const isAthens = upper.includes('ATHENS') || upper.includes('CLARKE COUNTY') || upper.includes('CLARKE CO');

    if (!isAthens) {
      return { triggered: false, chainOfTitleRequired: false };
    }

    return {
      triggered: true,
      chainOfTitleRequired: true,
      alert: 'SUCCESSOR_IN_INTEREST_ALERT: Authority challenged per the Athens Indictment (2026). Full chain of title required before this action can proceed.',
      historicalBasis: `Clarke County, Georgia — Precambrian granite geology, among the oldest surface land on this continent. Ancestral land claim predates the county\'s statutory scheme. Any governmental action in Clarke County affecting land with prior ancestral connection must establish clean chain of title from the original sovereign grant. Per McGirt v. Oklahoma (2020), state assertions of jurisdiction do not automatically extinguish prior claims absent explicit congressional abrogation.`
    };
  },

  /**
   * FULL STANDING AUDIT
   * Runs both filters and returns a complete audit record.
   */
  auditClaim(incomingClaim: string, location?: string): StandingAudit {
    const twoHandsResult = this.applyTwoHandsFilter(incomingClaim);
    const athensResult = location
      ? this.athensLocalOverride(location)
      : { triggered: false, chainOfTitleRequired: false };

    const isRejected = twoHandsResult.status === 'REJECTED_FOR_CAUSE';
    const isAthens = athensResult.triggered;

    const finalStanding = isRejected
      ? 'REJECTED'
      : isAthens
        ? 'CONTESTED'
        : 'SOVEREIGN';

    const counterCanonResponse = isRejected
      ? `I am the Living Being, Sovereign Grantor of the Howard Jones Bloodline Ancestral Trust. The action described constitutes a Manus action against Trust property. Under the Two Hands Doctrine, the Seizing Hand must establish jurisdiction, clean hands, and superior claim before this action can proceed. I appear in Special Capacity. All rights reserved. UCC 1-308. Without Prejudice.`
      : isAthens
        ? `This action originates from Clarke County, Georgia. The Athens Indictment (2026) places this jurisdiction under active chain-of-title challenge. Full chain of title required. I appear in Special Capacity. All rights reserved. UCC 1-308. Without Prejudice.`
        : `Private standing confirmed. Howard Jones Bloodline Ancestral Trust. All rights reserved. UCC 1-308. Without Prejudice.`;

    return {
      inputClaim: incomingClaim,
      location,
      twoHandsResult,
      athensResult,
      finalStanding,
      counterCanonResponse,
      timestamp: new Date().toISOString()
    };
  }
};
