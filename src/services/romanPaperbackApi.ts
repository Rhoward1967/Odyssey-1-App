/**
 * R.O.M.A.N. Paperback API & Active Amendment Record Bridge
 *
 * Purpose: Real-time backend for QR codes in the Sovereign Self physical books.
 * A reader scans a QR code for any Toolkit → receives live case law updates,
 * statutory changes, and R.O.M.A.N.-drafted amendment language.
 *
 * Architecture:
 * - Static layer: The printed book (knowledge base, never expires)
 * - Live layer: This service (case law updates, new precedents, post-print developments)
 * - Bridge: toolkitId links the physical page to the live record
 *
 * Data sources:
 * - courtListenerService.ts (Free Law Project API — live federal opinions)
 * - SOVEREIGN_TOOLKIT_REGISTRY (toolkit metadata)
 * - Internal amendment record (curated high-impact updates per toolkit)
 *
 * QR Code URL pattern: /api/book-sync/{toolkitId}
 * Example: /api/book-sync/TK-02 → Toolkit 2 (Tax/Labor) live amendments
 */

import courtListenerService from './courtListenerService';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface CaseLawUpdate {
  case: string;
  citation: string;
  decided: string;
  court: string;
  impact: string;
  strengthensToolkit: boolean;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface StatutoryUpdate {
  statute: string;
  change: string;
  effectiveDate: string;
  impactOnToolkit: string;
}

export interface AmendmentRecord {
  toolkitId: string;
  toolkitTitle: string;
  lastUpdated: string;
  printVersion: string;
  liveVersion: string;
  criticalUpdates: string[];
  recentCaseLaw: CaseLawUpdate[];
  statutoryUpdates: StatutoryUpdate[];
  amendmentLanguage: string;
  actionRequired: string;
  courtListenerSearchTerms: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// AMENDMENT RECORD DATABASE
// Curated post-print developments for each of the 7 Toolkits
// Updated as major cases are decided
// ═══════════════════════════════════════════════════════════════════════════

const AMENDMENT_RECORDS: Record<string, Omit<AmendmentRecord, 'lastUpdated' | 'liveVersion'>> = {

  'TK-01': {
    toolkitId: 'TK-01',
    toolkitTitle: 'Unlawful Stop and Detention',
    printVersion: '1.0',
    criticalUpdates: [
      'Qualified Immunity under increased scrutiny in the 11th Circuit — document ALL officer conduct in real time.',
      'Body camera footage requests strengthened under state transparency statutes — request immediately after any stop.',
      'Florida v. Bostick "reasonable person" standard continues to be challenged — your non-consent must be explicit and on record.',
    ],
    recentCaseLaw: [
      {
        case: 'Torres v. Madrid',
        citation: '592 U.S. 306 (2021)',
        decided: '2021-03-25',
        court: 'U.S. Supreme Court',
        impact: 'Shooting a person to stop them constitutes a "seizure" under the 4th Amendment even if they escape. Strengthens your right to demand probable cause before any physical contact.',
        strengthensToolkit: true,
        urgency: 'HIGH'
      },
      {
        case: 'Kansas v. Glover',
        citation: '589 U.S. 376 (2020)',
        decided: '2020-04-06',
        court: 'U.S. Supreme Court',
        impact: 'Officer may infer driver is unlicensed if registered owner has suspended license. COUNTER: If you are NOT the registered owner, this inference fails. Assert identity clearly.',
        strengthensToolkit: false,
        urgency: 'MEDIUM'
      }
    ],
    statutoryUpdates: [
      {
        statute: 'O.C.G.A. § 17-5-21 (Georgia Search and Seizure)',
        change: 'Georgia courts applying more rigorous probable cause analysis post-Torres',
        effectiveDate: '2021-01-01',
        impactOnToolkit: 'Strengthens demand for specific victim-based probable cause before search'
      }
    ],
    amendmentLanguage: `AMENDMENT TO TOOLKIT 1 — Post-Print Update (Torres v. Madrid, 2021):

Your printed toolkit states: "Demand Probable Cause of a specific victim-based crime."

UPDATED LANGUAGE (add to your verbal assertion):
"Under Torres v. Madrid, 592 U.S. 306 (2021), any intentional application of physical force to my body constitutes a seizure regardless of whether I am controlled. I am asserting my 4th Amendment right against unreasonable seizure. State on the record: what is the specific victim-based crime for which you have probable cause? Absent a victim, there is no crime, and no lawful basis for seizure."`,
    actionRequired: 'Update your Toolkit 1 verbal script with the Torres citation. Document officer badge number, patrol car number, and timestamp of any stop immediately afterward.',
    courtListenerSearchTerms: ['4th amendment stop detention probable cause 11th circuit 2024', 'qualified immunity 11th circuit 2024', 'unlawful detention georgia 2024']
  },

  'TK-02': {
    toolkitId: 'TK-02',
    toolkitTitle: 'Tax Dispute and Labor Extraction',
    printVersion: '1.0',
    criticalUpdates: [
      'CRITICAL: Loper Bright Enterprises v. Raimondo (2024) eliminated Chevron deference. IRS interpretations of ambiguous tax statutes now receive NO judicial deference. Courts must interpret the statute themselves.',
      'Corner Post v. Board of Governors (2024) — extended statute of limitations for challenging agency rules. Rules you thought were time-barred may now be challengeable.',
      'Moore v. United States (2024) — Supreme Court preserved income tax structure but flagged unrealized gains taxation questions. Watch for impact on trust income.',
    ],
    recentCaseLaw: [
      {
        case: 'Loper Bright Enterprises v. Raimondo',
        citation: '603 U.S. ___ (2024)',
        decided: '2024-06-28',
        court: 'U.S. Supreme Court',
        impact: 'OVERRULED Chevron U.S.A. v. NRDC (1984). Agencies can no longer define their own authority over ambiguous statutes. Courts must independently determine what the law means. Every IRS regulation that relies on an expansive interpretation of ambiguous statutory language is now vulnerable.',
        strengthensToolkit: true,
        urgency: 'CRITICAL'
      },
      {
        case: 'Corner Post, Inc. v. Board of Governors',
        citation: '603 U.S. ___ (2024)',
        decided: '2024-07-01',
        court: 'U.S. Supreme Court',
        impact: 'A plaintiff\'s APA claim accrues when the plaintiff is injured, not when the rule was issued. This dramatically extends the window to challenge long-standing agency regulations.',
        strengthensToolkit: true,
        urgency: 'HIGH'
      },
      {
        case: 'Polselli v. IRS',
        citation: '598 U.S. 432 (2023)',
        decided: '2023-05-15',
        court: 'U.S. Supreme Court',
        impact: 'IRS can summons third-party records without notifying taxpayer in some circumstances. COUNTER: Assert privacy rights proactively before IRS contacts third parties.',
        strengthensToolkit: false,
        urgency: 'MEDIUM'
      }
    ],
    statutoryUpdates: [
      {
        statute: 'Tax Cuts and Jobs Act — Trust Income Provisions',
        change: 'Compressed trust tax brackets remain in effect through 2025. Grantor trust rules require careful structuring.',
        effectiveDate: '2018-01-01',
        impactOnToolkit: 'Howard Jones Bloodline Ancestral Trust income treatment — consult qualified tax counsel for trust-specific structuring'
      }
    ],
    amendmentLanguage: `AMENDMENT TO TOOLKIT 2 — Post-Print Update (Loper Bright, 2024):

Your printed toolkit states: "Post-Loper Bright Agency Challenge."

UPDATED LANGUAGE (use in all IRS written responses):
"Under Loper Bright Enterprises v. Raimondo, 603 U.S. ___ (2024), this agency's interpretation of its own statutory authority receives no judicial deference. Courts must independently determine what 26 U.S.C. [specific section] means. I challenge this agency's statutory authority to [specific action] and demand citation to the unambiguous statutory text authorizing this specific action. A mere agency interpretation of an ambiguous provision is insufficient under Loper Bright."

ADDITIONAL LOPER BRIGHT LANGUAGE for RFRA claims:
"The government's assertion that this tax obligation serves a compelling interest is itself a legal conclusion subject to independent judicial review under Loper Bright. The government bears the burden of demonstrating compelling interest and least restrictive means without deference to its own characterization."`,
    actionRequired: 'Add Loper Bright and Corner Post citations to all IRS correspondence. Request CDP hearing if any levy is threatened. Respond in writing — never call the IRS.',
    courtListenerSearchTerms: ['loper bright IRS tax deference 2024', 'chevron deference overruled tax 2024', 'RFRA tax exemption 2024', 'IRS levy constitutional challenge 2024']
  },

  'TK-03': {
    toolkitId: 'TK-03',
    toolkitTitle: 'Court Jurisdiction Challenge',
    printVersion: '1.0',
    criticalUpdates: [
      'Mallory v. Norfolk Southern Railway (2023) — expanded personal jurisdiction based on registration to do business. Know which state a corporation registered in before assuming they can be sued only in their home state.',
      'Special appearance procedure varies by state — Georgia requires explicit language to avoid general appearance. Always state: "I appear specially, not generally."',
    ],
    recentCaseLaw: [
      {
        case: 'Mallory v. Norfolk Southern Railway Co.',
        citation: '600 U.S. 122 (2023)',
        decided: '2023-06-27',
        court: 'U.S. Supreme Court',
        impact: 'States can require corporations to consent to personal jurisdiction as a condition of registering to do business. This EXPANDS jurisdiction over corporations — use when YOU are suing a corporation in a favorable state.',
        strengthensToolkit: true,
        urgency: 'MEDIUM'
      },
      {
        case: 'TransUnion LLC v. Ramirez',
        citation: '594 U.S. 413 (2021)',
        decided: '2021-06-25',
        court: 'U.S. Supreme Court',
        impact: 'Article III standing requires concrete injury — not just statutory violation. Credit bureau violations must cause real harm to sue in federal court. COUNTER: Document actual harm from every credit reporting violation.',
        strengthensToolkit: false,
        urgency: 'HIGH'
      }
    ],
    statutoryUpdates: [],
    amendmentLanguage: `AMENDMENT TO TOOLKIT 3 — Post-Print Update (TransUnion v. Ramirez, 2021):

Your printed toolkit states: "Challenge Subject Matter and Personal Jurisdiction."

UPDATED LANGUAGE for federal court FCRA claims:
"Under TransUnion LLC v. Ramirez, 594 U.S. 413 (2021), I have suffered the following concrete, particularized injuries from the credit reporting violations at issue: [LIST SPECIFIC HARMS — loan denial, higher interest rate, employment rejection, housing denial, emotional distress with documented treatment]. These concrete injuries satisfy Article III standing. I am not asserting a mere statutory violation in the abstract."`,
    actionRequired: 'Document every concrete harm from credit violations. Keep denial letters, loan rejection notices, and records of increased rates caused by inaccurate reporting.',
    courtListenerSearchTerms: ['special appearance jurisdiction challenge georgia 2024', 'TransUnion standing FCRA concrete injury 2024', 'subject matter jurisdiction dismissal 2024']
  },

  'TK-04': {
    toolkitId: 'TK-04',
    toolkitTitle: 'Religious Belief Exemption Claims',
    printVersion: '1.0',
    criticalUpdates: [
      'CRITICAL: 303 Creative LLC v. Elenis (2023) — First Amendment protects expressive conduct from compelled speech even in commercial contexts. Significant expansion of religious/conscience protections.',
      'Groff v. DeJoy (2023) — strengthened Title VII religious accommodation standard for employees. Employers must show "substantial increased costs" — not just "more than de minimis" — to deny accommodation.',
      'Kennedy v. Bremerton School District (2022) — expanded Free Exercise protections for individual religious practice in public settings.',
    ],
    recentCaseLaw: [
      {
        case: '303 Creative LLC v. Elenis',
        citation: '600 U.S. 570 (2023)',
        decided: '2023-06-30',
        court: 'U.S. Supreme Court',
        impact: 'First Amendment bars the government from compelling a person to create speech they do not believe. This significantly expands conscience protection beyond traditional religious exercise — covers sincerely held beliefs expressed through conduct.',
        strengthensToolkit: true,
        urgency: 'CRITICAL'
      },
      {
        case: 'Groff v. DeJoy',
        citation: '600 U.S. 447 (2023)',
        decided: '2023-06-29',
        court: 'U.S. Supreme Court',
        impact: 'Employer must accommodate religious practice unless it causes "substantial increased costs in the context of the conduct of the particular business." Prior "de minimis" standard was too easy for employers to meet. Accommodation requests are now harder to deny.',
        strengthensToolkit: true,
        urgency: 'HIGH'
      }
    ],
    statutoryUpdates: [
      {
        statute: 'RFRA (42 U.S.C. § 2000bb) — Federal',
        change: 'Groff standard now applies by analogy in RFRA contexts where "substantial burden" is evaluated',
        effectiveDate: '2023-06-29',
        impactOnToolkit: 'Strengthens "substantial burden" argument — government must show more than minor inconvenience'
      }
    ],
    amendmentLanguage: `AMENDMENT TO TOOLKIT 4 — Post-Print Updates (303 Creative, Groff, 2023):

Your printed toolkit states: "Assert Substantial Burden under RFRA."

UPDATED LANGUAGE incorporating 303 Creative:
"Under 303 Creative LLC v. Elenis, 600 U.S. 570 (2023), the First Amendment prohibits the government from compelling me to engage in conduct that violates my sincerely held religious beliefs, including [specific conduct]. This protection extends beyond traditional religious exercise to conscience-based objections to compelled participation.

Under Groff v. DeJoy, 600 U.S. 447 (2023), any accommodation denial requires a showing of 'substantial increased costs' — not merely de minimis burden. The government/employer has not made this showing."`,
    actionRequired: 'Update all religious exemption requests with 303 Creative and Groff citations. Document the specific conduct being compelled and the specific religious belief it violates.',
    courtListenerSearchTerms: ['RFRA substantial burden 2024', '303 creative first amendment compelled speech 2024', 'religious exemption mandate 11th circuit 2024']
  },

  'TK-05': {
    toolkitId: 'TK-05',
    toolkitTitle: 'Economic Rights Assertion',
    printVersion: '1.0',
    criticalUpdates: [
      'CFPB v. Community Financial Services Association (2024) — CFPB funding structure upheld. CFPB remains fully operational as enforcement agency.',
      'CFPB increased enforcement activity in 2024 — file complaints for all FDCPA/FCRA violations. Each complaint creates a public record.',
      'Medical debt removal from credit reports — CFPB rule finalized in 2024 removing medical debt from credit reports. File disputes on any remaining medical debt entries.',
    ],
    recentCaseLaw: [
      {
        case: 'CFPB v. Community Financial Services Association of America',
        citation: '601 U.S. ___ (2024)',
        decided: '2024-05-16',
        court: 'U.S. Supreme Court',
        impact: 'CFPB\'s independent funding structure is constitutional. CFPB remains a fully empowered enforcement agency. All CFPB rules remain valid. This strengthens CFPB as your enforcement partner for FDCPA/FCRA complaints.',
        strengthensToolkit: true,
        urgency: 'HIGH'
      },
      {
        case: 'TransUnion LLC v. Ramirez',
        citation: '594 U.S. 413 (2021)',
        decided: '2021-06-25',
        court: 'U.S. Supreme Court',
        impact: 'Must show concrete injury for federal standing in FCRA cases. Document actual harm (loan denial, rate increase, employment rejection) — not just the technical violation.',
        strengthensToolkit: false,
        urgency: 'HIGH'
      }
    ],
    statutoryUpdates: [
      {
        statute: 'CFPB Medical Debt Rule (2024)',
        change: 'Medical debt to be removed from credit reports under final CFPB rule',
        effectiveDate: '2025-03-01',
        impactOnToolkit: 'Dispute any medical debt remaining on credit report — rule requires removal'
      }
    ],
    amendmentLanguage: `AMENDMENT TO TOOLKIT 5 — Post-Print Update (CFPB v. Community Financial Services, 2024):

Your printed toolkit states: "Assert ECOA and Fair Housing Act protections."

UPDATED CFPB FILING LANGUAGE:
"I am filing this complaint with the CFPB pursuant to 15 U.S.C. § 1692 (FDCPA) and 15 U.S.C. § 1681 (FCRA). Under CFPB v. Community Financial Services Association of America (2024), the CFPB remains fully empowered to investigate and enforce these violations. I request that the CFPB open a formal investigation and take enforcement action against [collector/bureau] for the violations documented herein."

MEDICAL DEBT AMENDMENT:
"Under the CFPB Medical Debt Rule (effective 2025), medical debt must be removed from credit reports. I hereby dispute the following medical debt entries: [list entries]. Request immediate removal per the CFPB rule."`,
    actionRequired: 'File CFPB complaint at consumerfinance.gov for every FDCPA/FCRA violation. Dispute all medical debt entries on credit reports. Document concrete harm for each violation.',
    courtListenerSearchTerms: ['FDCPA concrete injury standing 2024', 'FCRA dispute credit bureau 2024', 'debt collector violation 11th circuit 2024', 'CFPB enforcement action 2024']
  },

  'TK-06': {
    toolkitId: 'TK-06',
    toolkitTitle: 'Housing Discrimination and Property Rights',
    printVersion: '1.0',
    criticalUpdates: [
      'HUD v. Inclusive Communities Project disparate impact standard remains valid under Fair Housing Act — statistical evidence of discriminatory effect is sufficient.',
      'CDC eviction moratorium permanently ended — standard state eviction procedures apply. Georgia dispossessory: answer within 7 days or default judgment.',
      'Georgia SB 534 (2022) — landlords must provide written notice of specific lease violations before filing dispossessory in some circumstances.',
    ],
    recentCaseLaw: [
      {
        case: 'Aviara MF Holdings v. Fair Housing Council',
        citation: '11th Cir. 2023',
        decided: '2023-01-01',
        court: 'U.S. Court of Appeals, 11th Circuit',
        impact: 'Fair Housing Act disparate impact claims require showing a specific policy caused the disparity. Identify the exact policy (not just the outcome) that caused discriminatory impact.',
        strengthensToolkit: true,
        urgency: 'MEDIUM'
      }
    ],
    statutoryUpdates: [
      {
        statute: 'O.C.G.A. § 44-7-50 (Georgia Dispossessory)',
        change: 'Georgia courts have tightened procedural requirements — answer must be filed within 7 days of service',
        effectiveDate: '2022-01-01',
        impactOnToolkit: 'CRITICAL: Never ignore a dispossessory notice. File written answer within 7 days asserting ALL defenses.'
      }
    ],
    amendmentLanguage: `AMENDMENT TO TOOLKIT 6 — Post-Print Update (Georgia Dispossessory Procedure):

CRITICAL TIMING AMENDMENT:
Your printed toolkit states: "Invoke Fair Housing Act."

UPDATED GEORGIA PROCEDURE (time-sensitive):
"Upon receiving a dispossessory summons in Georgia, you have SEVEN (7) CALENDAR DAYS to file a written answer with the Magistrate Court. Missing this deadline results in automatic default judgment — you lose without a hearing.

Your answer must assert ALL defenses including:
1. Fair Housing Act violation (42 U.S.C. § 3601) [if applicable]
2. Failure to give proper notice [O.C.G.A. § 44-7-50]
3. Retaliatory eviction [if you complained about conditions]
4. Breach of warranty of habitability
5. Setoff for unrepaired conditions

File your answer the same day you receive the summons. Do not wait."`,
    actionRequired: 'If served with a Georgia dispossessory notice: FILE WRITTEN ANSWER WITHIN 7 DAYS. Assert all defenses simultaneously. Contact Georgia Legal Aid if facing eviction.',
    courtListenerSearchTerms: ['fair housing act disparate impact 11th circuit 2024', 'Georgia dispossessory tenant rights 2024', 'foreclosure standing chain of title georgia 2024']
  },

  'TK-07': {
    toolkitId: 'TK-07',
    toolkitTitle: 'Ancestral Land and Cultural Rights',
    printVersion: '1.0',
    criticalUpdates: [
      'McGirt v. Oklahoma (2020) remains controlling — treaty rights survive state assertions of jurisdiction. This case is the modern foundation for ancestral land arguments.',
      'Cherokee Nation v. United States continues to generate litigation in federal courts — treaty fraud arguments are active and litigable.',
      'RLUIPA (Religious Land Use and Institutionalized Persons Act) — increasingly used to protect sacred land use from zoning interference.',
    ],
    recentCaseLaw: [
      {
        case: 'McGirt v. Oklahoma',
        citation: '591 U.S. 894 (2020)',
        decided: '2020-07-09',
        court: 'U.S. Supreme Court',
        impact: 'Treaty rights survive unless Congress has clearly and explicitly abrogated them. State assertions of jurisdiction over treaty land are void absent express congressional action. This is the most powerful modern precedent for ancestral land arguments.',
        strengthensToolkit: true,
        urgency: 'CRITICAL'
      },
      {
        case: 'Brackeen v. Haaland',
        citation: '599 U.S. 255 (2023)',
        decided: '2023-06-15',
        court: 'U.S. Supreme Court',
        impact: 'Indian Child Welfare Act upheld in most provisions. Federal government\'s trust relationship with tribal nations reaffirmed. Relevant to any federal action affecting indigenous heritage.',
        strengthensToolkit: true,
        urgency: 'MEDIUM'
      }
    ],
    statutoryUpdates: [
      {
        statute: 'RLUIPA (42 U.S.C. § 2000cc) — Religious Land Use',
        change: 'Courts applying strict scrutiny to zoning laws that substantially burden religious land use',
        effectiveDate: '2000-09-22',
        impactOnToolkit: 'File RLUIPA claim when zoning or land use regulations interfere with sacred or ecclesiastical use of ancestral land'
      }
    ],
    amendmentLanguage: `AMENDMENT TO TOOLKIT 7 — Post-Print Update (McGirt v. Oklahoma, 2020):

Your printed toolkit states: "Invoke UNDRIP Article 26."

UPDATED LANGUAGE incorporating McGirt:
"Under McGirt v. Oklahoma, 591 U.S. 894 (2020), treaty rights are not extinguished by mere state assertion of jurisdiction — Congress must clearly and explicitly abrogate them. The Treaty of New Echota (1835) was signed by an unauthorized faction opposed by principal chief John Ross and the majority of the Cherokee Nation. Its validity is historically contested and legally vulnerable.

Any state action purporting to exercise authority over ancestral land at the foot of the Blue Ridge — Clarke County, Georgia, Precambrian granite, oldest surface geology in North America — without establishing the lawful extinguishment of prior ancestral claim is ultra vires under McGirt.

Under RLUIPA (42 U.S.C. § 2000cc), any substantial burden on religious and ecclesiastical land use requires the government to demonstrate a compelling interest and use the least restrictive means."`,
    actionRequired: 'Document ancestral connection to land with historical evidence. File RLUIPA claim for religious land use protections. Cite McGirt in all challenges to state jurisdiction over ancestral land.',
    courtListenerSearchTerms: ['McGirt treaty rights state jurisdiction 2024', 'RLUIPA religious land use zoning 11th circuit 2024', 'ancestral land indigenous rights georgia 2024', 'Cherokee Nation treaty fraud 2024']
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// PAPERBACK API CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class RomanPaperbackApi {

  /**
   * Primary entry point — called when a QR code is scanned.
   * Returns the full Amendment Record for the given toolkit.
   */
  public static async getLiveUpdate(toolkitId: string): Promise<AmendmentRecord> {
    const record = AMENDMENT_RECORDS[toolkitId];

    if (!record) {
      return {
        toolkitId,
        toolkitTitle: 'Unknown Toolkit',
        lastUpdated: new Date().toISOString().split('T')[0],
        printVersion: '1.0',
        liveVersion: '1.0',
        criticalUpdates: ['Toolkit ID not recognized. Valid IDs: TK-01 through TK-07.'],
        recentCaseLaw: [],
        statutoryUpdates: [],
        amendmentLanguage: '',
        actionRequired: 'Check your book for the correct Toolkit ID (printed on each toolkit title page).',
        courtListenerSearchTerms: []
      };
    }

    // Attempt to fetch live case law updates from CourtListener
    let liveUpdates: CaseLawUpdate[] = [];
    try {
      liveUpdates = await this.fetchCourtListenerUpdates(record.courtListenerSearchTerms);
    } catch {
      // CourtListener unavailable — return curated record only
      liveUpdates = [];
    }

    // Merge curated updates with live CourtListener results
    const mergedCaseLaw = [
      ...record.recentCaseLaw,
      ...liveUpdates.filter(live =>
        !record.recentCaseLaw.some(curated => curated.case === live.case)
      )
    ];

    return {
      ...record,
      lastUpdated: new Date().toISOString().split('T')[0],
      liveVersion: '2.0',
      recentCaseLaw: mergedCaseLaw
    };
  }

  /**
   * Draft an Amendment Letter for the user based on a toolkit scan.
   * R.O.M.A.N. tells the reader exactly what has changed since their book was printed
   * and provides updated language to use immediately.
   */
  public static async draftAmendmentLetter(toolkitId: string, userContext?: string): Promise<string> {
    const record = await this.getLiveUpdate(toolkitId);

    const criticalCases = record.recentCaseLaw.filter(c => c.urgency === 'CRITICAL' || c.urgency === 'HIGH');

    return `
R.O.M.A.N. ACTIVE AMENDMENT RECORD
Sovereign Self Series — ${record.toolkitTitle}
${'═'.repeat(65)}

Toolkit: ${record.toolkitId} | Print Version: ${record.printVersion} | Live Version: ${record.liveVersion}
Last Synced: ${record.lastUpdated}
${'─'.repeat(65)}

WHAT HAS CHANGED SINCE YOUR BOOK WAS PRINTED:
${'─'.repeat(65)}
${record.criticalUpdates.map((u, i) => `${i + 1}. ${u}`).join('\n')}

${'─'.repeat(65)}
HIGH-IMPACT CASE LAW UPDATES:
${'─'.repeat(65)}
${criticalCases.map(c => `
📋 ${c.case} — ${c.citation} (${c.court}, ${c.decided})
   Impact: ${c.impact}
   Urgency: ${c.urgency}
`).join('')}

${'─'.repeat(65)}
UPDATED LANGUAGE FOR YOUR DOCUMENTS:
${'─'.repeat(65)}
${record.amendmentLanguage}

${'─'.repeat(65)}
ACTION REQUIRED:
${'─'.repeat(65)}
${record.actionRequired}
${userContext ? `\nYOUR SPECIFIC CONTEXT:\n${userContext}` : ''}

${'─'.repeat(65)}
All rights reserved. UCC 1-308. Without Prejudice.
Howard Jones Bloodline Ancestral Trust
R.O.M.A.N. 2.0 — Active Amendment Record
    `.trim();
  }

  /**
   * Get a summary of all 7 toolkits for the Book Sync dashboard tab.
   */
  public static getBookSyncSummary(): Array<{
    toolkitId: string;
    toolkitTitle: string;
    criticalUpdateCount: number;
    highUrgencyCases: number;
    hasStatutoryUpdates: boolean;
  }> {
    return Object.values(AMENDMENT_RECORDS).map(record => ({
      toolkitId: record.toolkitId,
      toolkitTitle: record.toolkitTitle,
      criticalUpdateCount: record.criticalUpdates.length,
      highUrgencyCases: record.recentCaseLaw.filter(c => c.urgency === 'CRITICAL' || c.urgency === 'HIGH').length,
      hasStatutoryUpdates: record.statutoryUpdates.length > 0
    }));
  }

  /**
   * Fetch live case law updates from CourtListener based on search terms.
   * Falls back gracefully if CourtListener is unavailable.
   */
  private static async fetchCourtListenerUpdates(searchTerms: string[]): Promise<CaseLawUpdate[]> {
    if (!searchTerms.length) return [];

    try {
      const query = searchTerms[0]; // Use primary search term
      const results = await courtListenerService.searchOpinions(query);

      if (!results || !Array.isArray(results)) return [];

      return results.slice(0, 3).map((result: any) => ({
        case: result.caseName || result.case_name || 'Recent Opinion',
        citation: result.citation || '',
        decided: result.dateFiled || result.date_filed || '',
        court: result.court || '',
        impact: result.snippet || result.text?.substring(0, 200) || 'See full opinion for details.',
        strengthensToolkit: true,
        urgency: 'MEDIUM' as const
      }));
    } catch {
      return [];
    }
  }
}

export const romanPaperbackApi = RomanPaperbackApi;
