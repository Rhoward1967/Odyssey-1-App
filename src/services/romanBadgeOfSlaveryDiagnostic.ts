/**
 * R.O.M.A.N. Badge of Slavery Diagnostic
 *
 * Based on: Formal Legal Doctrine Section VII & Counter-Canon Vol. 6 (Equity)
 *
 * "Any systemic extraction or disability rooted in the historical involuntary
 *  servitude of a people constitutes a Badge of Slavery. The 13th Amendment
 *  Enforcement Clause mandates its remedy."
 *
 * This module is the High-Level Constitutional Auditor.
 * Standard legal engines look for consumer violations.
 * This engine looks for Constitutional injuries.
 *
 * Architecture: Runs above legalDefenseEngine.ts and businessDebtDefenseEngine.ts.
 * Any extraction that clears the Badge threshold triggers a constitutional
 * argument that supersedes statutory debt defense.
 *
 * Legal Foundation:
 * - U.S. Const. Amend. XIII, §1 (Prohibition of Slavery and Involuntary Servitude)
 * - U.S. Const. Amend. XIII, §2 (Enforcement Clause — Congress has power to enforce)
 * - Jones v. Alfred H. Mayer Co., 392 U.S. 409 (1968) — 13th Amendment reaches all
 *   badges and incidents of slavery, not just literal enslavement
 * - Civil Rights Act of 1866, 42 U.S.C. § 1982 — equal property rights
 * - 42 U.S.C. § 1983 — deprivation of constitutional rights under color of law
 * - Bailey v. Alabama, 219 U.S. 219 (1911) — peonage (debt bondage) is involuntary servitude
 * - United States v. Reynolds, 235 U.S. 133 (1914) — contract labor systems = peonage
 * - Counter-Canon Vol. 6 — Equity: Badge of Slavery / Remedy
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface BadgeIndicator {
  term: string;
  description: string;
  indicators: string[];
  doctrine: string;
  caselaw: string[];
  severityWeight: number; // 1 = moderate, 2 = serious, 3 = critical
}

export interface DiagnosticResult {
  isBadgeDetected: boolean;
  severity: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  severityScore: number;
  detectedBadges: string[];
  doctrinalBasis: string[];
  caselaw: string[];
  remedyPath: string;
  constitutionalArgument: string;
  equityArgument: string;
  filingStrategy: string[];
  counterCanonVolume: string;
}

export interface ExtractionProfile {
  description: string;            // User's description of the extraction
  extractionType?: string;        // 'wage_garnishment' | 'tax_levy' | 'foreclosure' | 'detention' | etc.
  extractingParty?: string;       // IRS, debt collector, landlord, police, etc.
  amount?: number;                // Dollar amount if applicable
  isRecurring?: boolean;          // Is this a recurring extraction?
  affectedLineage?: boolean;      // Does this affect family/bloodline?
  historicalPattern?: boolean;    // Part of a documented pattern against this community?
}

// ═══════════════════════════════════════════════════════════════════════════
// BADGE INDICATOR REGISTRY
// Grounded in Jones v. Alfred H. Mayer Co. and 13th Amendment jurisprudence
// ═══════════════════════════════════════════════════════════════════════════

const BADGE_INDICATORS: BadgeIndicator[] = [
  {
    term: 'Involuntary Economic Extraction',
    description: 'Forced removal of earned wages, assets, or property without full consent and due process',
    indicators: ['garnishment', 'levy', 'automatic deduction', 'compulsory payment', 'wage seizure', 'bank levy', 'asset seizure', 'tax lien', 'forced sale'],
    doctrine: '13th Amendment §1 (Involuntary Servitude); Bailey v. Alabama (1911) — debt bondage is peonage; Counter-Canon Vol. 6',
    caselaw: [
      'Bailey v. Alabama, 219 U.S. 219 (1911) — peonage through debt bondage is involuntary servitude',
      'United States v. Reynolds, 235 U.S. 133 (1914) — contract labor to repay debt = peonage',
      'Pollock v. Williams, 322 U.S. 4 (1944) — economic pressure to labor = badge of slavery'
    ],
    severityWeight: 3
  },
  {
    term: 'Restriction of Mobility and Movement',
    description: 'Conditions, licenses, or penalties that restrict the Living Being\'s freedom of movement',
    indicators: ['license suspension', 'registration hold', 'travel restriction', 'passport hold', 'house arrest', 'curfew', 'bail condition', 'probation restriction', 'detained'],
    doctrine: 'Right to Travel (Crandall v. Nevada, 1867); Badge of Slavery (Jones v. Mayer, 1968); 13th Amendment §1',
    caselaw: [
      'Jones v. Alfred H. Mayer Co., 392 U.S. 409 (1968) — 13th Amendment reaches all badges and incidents of slavery',
      'Crandall v. Nevada, 73 U.S. 35 (1867) — right of free movement is a fundamental right',
      'Saenz v. Roe, 526 U.S. 489 (1999) — right to travel is a fundamental constitutional right'
    ],
    severityWeight: 2
  },
  {
    term: 'Disproportionate Economic Peonage',
    description: 'Penalty structures, compound interest, and fee-on-fee systems that create mathematically unpayable obligations — debt bondage by design',
    indicators: ['excessive fine', 'compounded interest', 'penalty-on-penalty', 'fee on fee', 'interest on interest', 'accruing penalties', 'unpayable debt', 'compound daily', 'default interest'],
    doctrine: '8th Amendment (Excessive Fines Clause); 13th Amendment Economic Peonage; Timbs v. Indiana (2019)',
    caselaw: [
      'Timbs v. Indiana, 586 U.S. ___ (2019) — Excessive Fines Clause incorporated against states',
      'Bailey v. Alabama, 219 U.S. 219 (1911) — obligation impossible to discharge = involuntary servitude',
      'United States v. Kozminski, 487 U.S. 931 (1988) — psychological coercion through unpayable debt'
    ],
    severityWeight: 3
  },
  {
    term: 'Imposed Personhood and Forced Joinder',
    description: 'Compelling appearance, response, or participation in proceedings without establishing jurisdiction or consent',
    indicators: ['joinder', 'appearance required', 'failure to appear warrant', 'compulsory appearance', 'bench warrant', 'contempt', 'ordered to appear', 'mandatory'],
    doctrine: 'Doctrine of Pre-Political Sovereign Being; Forced Persona (Counter-Canon Vol. 1); 13th Amendment §1',
    caselaw: [
      'Jones v. Alfred H. Mayer Co., 392 U.S. 409 (1968) — badges of slavery include forced subjection',
      'Hale v. Henkel, 201 U.S. 43 (1906) — individual vs. corporation distinction in compelled appearance',
      'Boyd v. United States, 116 U.S. 616 (1886) — forced production = compelled servitude'
    ],
    severityWeight: 2
  },
  {
    term: 'Discriminatory Property Denial',
    description: 'Denial of property rights, credit, or economic opportunity on discriminatory basis',
    indicators: ['denied credit', 'credit discrimination', 'redlining', 'discriminatory appraisal', 'denied loan', 'disparate impact', 'unequal treatment', 'denied housing'],
    doctrine: 'Civil Rights Act of 1866 (42 U.S.C. § 1982); Fair Housing Act; Jones v. Mayer (1968)',
    caselaw: [
      'Jones v. Alfred H. Mayer Co., 392 U.S. 409 (1968) — 42 USC §1982 bars ALL racial discrimination in property',
      'Runyon v. McCrary, 427 U.S. 160 (1976) — §1981 reaches private discrimination in contracts',
      'Memphis v. Greene, 451 U.S. 100 (1981) — street closing analyzed under 13th Amendment'
    ],
    severityWeight: 3
  },
  {
    term: 'Ancestral Land Extraction',
    description: 'Seizure, taxation, or regulation of land with ancestral and indigenous significance',
    indicators: ['property tax seizure', 'eminent domain', 'zoning violation', 'land seizure', 'tax sale', 'adverse possession', 'title challenge', 'ancestral land', 'indigenous land'],
    doctrine: 'UNDRIP Art. 26 (Rights to ancestral lands); 13th Amendment (dispossession as badge); Treaty Law',
    caselaw: [
      'Lone Wolf v. Hitchcock, 187 U.S. 553 (1903) — treaty violation analysis (landmark injustice)',
      'United States v. Sioux Nation, 448 U.S. 371 (1980) — government taking of Indigenous land = unconstitutional taking',
      'McGirt v. Oklahoma, 591 U.S. ___ (2020) — treaty rights survive state assertion of jurisdiction'
    ],
    severityWeight: 3
  },
  {
    term: 'Systemic Debt Bondage',
    description: 'Debt collection systems designed to maintain perpetual obligation — mathematically structured so full repayment is impossible',
    indicators: ['charged off', 'sold to collections', 'zombie debt', 'time-barred debt', 'purchased debt', 'debt buyer', 'third party collector', 're-aged debt'],
    doctrine: 'Bailey v. Alabama (1911) — systemic debt bondage = peonage; Counter-Canon Vol. 2',
    caselaw: [
      'Bailey v. Alabama, 219 U.S. 219 (1911) — obligation impossible to satisfy = involuntary servitude',
      'Taylor v. Georgia, 315 U.S. 25 (1942) — peonage statutes void',
      'Pollock v. Williams, 322 U.S. 4 (1944) — debt-labor compulsion = 13th Amendment violation'
    ],
    severityWeight: 2
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// DIAGNOSTIC ENGINE
// ═══════════════════════════════════════════════════════════════════════════

export class RomanBadgeOfSlaveryDiagnostic {

  /**
   * CORE ANALYSIS: Analyze any extraction, mandate, or administrative action
   * for Badges and Incidents of Slavery under the 13th Amendment.
   *
   * This is the High-Level Constitutional Auditor.
   * Run this BEFORE statutory analysis — constitutional arguments
   * supersede consumer protection arguments.
   */
  public static analyzeExtraction(profile: ExtractionProfile): DiagnosticResult {
    const input = profile.description.toLowerCase();
    const detected: string[] = [];
    const doctrinalBasis: string[] = [];
    const allCaselaw: string[] = [];
    let severityScore = 0;

    // Score each badge indicator against the input
    BADGE_INDICATORS.forEach(badge => {
      const matched = badge.indicators.some(indicator =>
        input.includes(indicator.toLowerCase())
      );

      if (matched) {
        detected.push(badge.term);
        doctrinalBasis.push(badge.doctrine);
        badge.caselaw.forEach(c => {
          if (!allCaselaw.includes(c)) allCaselaw.push(c);
        });
        severityScore += badge.severityWeight;
      }
    });

    // Amplifiers: recurring extraction and bloodline impact increase severity
    if (profile.isRecurring) severityScore += 1;
    if (profile.affectedLineage) severityScore += 2;
    if (profile.historicalPattern) severityScore += 2;

    const severity = this.scoreSeverity(severityScore, detected.length);

    if (!detected.length) {
      return {
        isBadgeDetected: false,
        severity: 'NONE',
        severityScore: 0,
        detectedBadges: [],
        doctrinalBasis: [],
        caselaw: [],
        remedyPath: 'No 13th Amendment badges detected in this scenario. Proceed with standard statutory analysis (FDCPA, FCRA, TILA, O.C.G.A.).',
        constitutionalArgument: '',
        equityArgument: '',
        filingStrategy: [],
        counterCanonVolume: 'Vol. 6 — Equity'
      };
    }

    return {
      isBadgeDetected: true,
      severity,
      severityScore,
      detectedBadges: detected,
      doctrinalBasis: [...new Set(doctrinalBasis)],
      caselaw: allCaselaw,
      remedyPath: this.buildRemedyPath(detected, severity, profile),
      constitutionalArgument: this.buildConstitutionalArgument(detected, doctrinalBasis, allCaselaw),
      equityArgument: this.buildEquityArgument(detected, profile),
      filingStrategy: this.buildFilingStrategy(detected, severity, profile),
      counterCanonVolume: 'Vol. 6 — Equity (Badge of Slavery / Mandatory Remedy)'
    };
  }

  /**
   * Quick analysis from a plain-text string (for chat interface / Discord bot use)
   */
  public static analyzeText(text: string): DiagnosticResult {
    return this.analyzeExtraction({ description: text });
  }

  // ─── PRIVATE BUILDERS ────────────────────────────────────────────────────

  private static scoreSeverity(
    score: number,
    badgeCount: number
  ): 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (score === 0) return 'NONE';
    if (score <= 2 && badgeCount === 1) return 'LOW';
    if (score <= 4) return 'MEDIUM';
    if (score <= 7) return 'HIGH';
    return 'CRITICAL';
  }

  private static buildRemedyPath(
    detected: string[],
    severity: string,
    profile: ExtractionProfile
  ): string {
    const paths = [
      'Invoke 13th Amendment § 2 Enforcement Clause as constitutional baseline.',
      'Cite Jones v. Alfred H. Mayer Co. (1968) — 13th Amendment reaches ALL badges and incidents of slavery.',
    ];

    if (detected.includes('Involuntary Economic Extraction') || detected.includes('Systemic Debt Bondage')) {
      paths.push('Cite Bailey v. Alabama (1911) — mathematically unpayable debt obligations constitute peonage and involuntary servitude.');
    }
    if (detected.includes('Disproportionate Economic Peonage')) {
      paths.push('Invoke 8th Amendment Excessive Fines Clause (Timbs v. Indiana, 2019) in addition to 13th Amendment peonage argument.');
    }
    if (detected.includes('Ancestral Land Extraction')) {
      paths.push('Invoke UNDRIP Article 26 (ancestral land rights) and McGirt v. Oklahoma (2020) for treaty rights analysis.');
    }
    if (detected.includes('Discriminatory Property Denial')) {
      paths.push('File 42 U.S.C. § 1982 civil rights claim — ALL racial discrimination in property transactions is barred.');
    }
    if (severity === 'CRITICAL') {
      paths.push('File 42 U.S.C. § 1983 civil rights complaint — deprivation of constitutional rights under color of law.');
      paths.push('Request equitable remedy: structural injunction, restitution of extracted value, and declaratory relief.');
    }
    if (profile.affectedLineage) {
      paths.push('Assert Howard Jones Bloodline Ancestral Trust standing — extraction affecting bloodline assets triggers Trust\'s UCC-1 perfected security interest.');
    }

    return paths.join('\n');
  }

  private static buildConstitutionalArgument(
    detected: string[],
    basis: string[],
    caselaw: string[]
  ): string {
    return `
CONSTITUTIONAL ARGUMENT — 13TH AMENDMENT BADGE OF SLAVERY
${'─'.repeat(65)}

ISSUE: The action described constitutes a badge and incident of
involuntary servitude prohibited by the 13th Amendment to the
United States Constitution.

BADGES DETECTED:
${detected.map((d, i) => `${i + 1}. ${d}`).join('\n')}

DOCTRINAL BASIS:
${[...new Set(basis)].map(b => `• ${b}`).join('\n')}

CONTROLLING AUTHORITY:
In Jones v. Alfred H. Mayer Co., 392 U.S. 409 (1968), the Supreme
Court held that the 13th Amendment "clothed Congress with the power
to pass all laws necessary and proper for abolishing all badges and
incidents of slavery." The Amendment's reach is not limited to
literal enslavement — it extends to ALL systemic conditions that
constitute incidents of servitude.

The Enforcement Clause (§2) empowers courts of equity to fashion
remedies commensurate with the constitutional wrong. A monetary
remedy alone is insufficient for a constitutional injury rooted in
the badges of slavery. This court has inherent equitable power to
grant structural relief.

SUPPORTING CASELAW:
${caselaw.map(c => `• ${c}`).join('\n')}

BURDEN: The burden is on the state actor or private party to
demonstrate that the challenged action does NOT constitute a badge
or incident of slavery. The 13th Amendment places an affirmative
obligation on government to remedy — not merely to refrain from —
the badges of slavery.
    `.trim();
  }

  private static buildEquityArgument(
    detected: string[],
    profile: ExtractionProfile
  ): string {
    const lines = [
      'EQUITY ARGUMENT — COUNTER-CANON VOL. 6',
      '─'.repeat(65),
      '',
      'COUNTER-CANON DEFINITION: Badge of Slavery',
      '"Any systemic extraction or disability rooted in the historical',
      'involuntary servitude of a people." — Counter-Canon Vol. 6',
      '',
      'COUNTER-CANON DEFINITION: Remedy',
      '"The mandatory correction of a Badge of Slavery, required by',
      'the 13th Amendment Enforcement Clause." — Counter-Canon Vol. 6',
      '',
      'EQUITY ANALYSIS:',
    ];

    if (detected.includes('Involuntary Economic Extraction')) {
      lines.push('The forced removal of earned wages or assets without free and informed consent mirrors the economic structure of involuntary servitude — work performed, value extracted, laborer not compensated. This is the economic architecture of slavery translated into administrative procedure.');
    }
    if (detected.includes('Disproportionate Economic Peonage')) {
      lines.push('Compound interest and penalty-on-penalty structures create mathematically unpayable obligations. When the system is designed so that full payment is impossible, the obligation is not a debt — it is a permanent condition of economic servitude. Bailey v. Alabama (1911) recognized this architecture as peonage.');
    }
    if (detected.includes('Ancestral Land Extraction')) {
      lines.push('The land at the foot of the Blue Ridge — Clarke County, Georgia, Precambrian granite — carries ancestral heirship predating the paper title system. The Treaty of New Echota (1835) was fraud dressed as law. Any extraction of ancestral land through administrative procedure repeats that fraud in modern form.');
    }
    if (profile.affectedLineage) {
      lines.push('The extraction targets assets held by the Howard Jones Bloodline Ancestral Trust — assets designated for bloodline preservation across generations. An extraction that diminishes bloodline assets is not a consumer debt action. It is an intergenerational wealth stripping event with historical roots in the badges of slavery.');
    }

    lines.push('');
    lines.push('MANDATORY REMEDY:');
    lines.push('Courts of equity have inherent authority to fashion remedies matching the magnitude of the constitutional wrong. Standard statutory damages (FDCPA/FCRA) are floor — not ceiling — when a 13th Amendment badge is present. This court should consider: declaratory relief, structural injunction, restitution of extracted value, and prospective relief preventing future extractions of this character.');

    return lines.join('\n');
  }

  private static buildFilingStrategy(
    detected: string[],
    severity: string,
    profile: ExtractionProfile
  ): string[] {
    const strategy: string[] = [];

    strategy.push('STEP 1: File written notice invoking 13th Amendment constitutional standing BEFORE responding on the merits.');
    strategy.push('STEP 2: Cite Jones v. Alfred H. Mayer Co. (1968) in all written communications — establishes constitutional scope.');

    if (detected.includes('Involuntary Economic Extraction') || detected.includes('Systemic Debt Bondage')) {
      strategy.push('STEP 3: Demand validation under 15 USC § 1692g (FDCPA) simultaneously — stack constitutional and statutory claims.');
      strategy.push('STEP 4: Request complete accounting showing how the debt amount was calculated. Mathematically impossible repayment structures = Bailey v. Alabama peonage argument.');
    }

    if (detected.includes('Disproportionate Economic Peonage')) {
      strategy.push('STEP 3-ALT: File 8th Amendment Excessive Fines challenge (Timbs v. Indiana, 2019) if government is the extracting party.');
    }

    if (detected.includes('Discriminatory Property Denial')) {
      strategy.push('STEP 3-ALT: File 42 U.S.C. § 1982 civil rights complaint with DOJ Civil Rights Division.');
      strategy.push('File ECOA complaint with CFPB if credit discrimination is present.');
    }

    if (detected.includes('Ancestral Land Extraction')) {
      strategy.push('STEP 3-ALT: File RLUIPA (42 USC § 2000cc) religious land use claim if land has spiritual/ecclesiastical significance.');
      strategy.push('Request recognition of ancestral heirship as prior and superior claim to paper title.');
    }

    if (severity === 'CRITICAL') {
      strategy.push('FINAL: File 42 U.S.C. § 1983 civil rights complaint for deprivation of constitutional rights under color of law.');
      strategy.push('FINAL: Request federal court review — 13th Amendment claims can be removed to federal jurisdiction.');
      strategy.push('FINAL: Assert Howard Jones Bloodline Ancestral Trust UCC-1 perfected security interest in all affected assets.');
    }

    strategy.push('ALL STEPS: Reserve all rights. UCC 1-308. Without Prejudice.');

    return strategy;
  }

  /**
   * Generate a full diagnostic report for display or filing
   */
  public static generateReport(profile: ExtractionProfile): string {
    const result = this.analyzeExtraction(profile);

    if (!result.isBadgeDetected) {
      return `
R.O.M.A.N. BADGE OF SLAVERY DIAGNOSTIC — CLEAR
${'═'.repeat(65)}

No 13th Amendment badges detected in this scenario.

Proceeding to standard statutory analysis:
• FDCPA (15 USC § 1692) — Fair Debt Collection Practices
• FCRA (15 USC § 1681) — Fair Credit Reporting
• TILA (15 USC § 1601) — Truth in Lending
• O.C.G.A. §9-3-24/25 — Georgia Statute of Limitations

All rights reserved. UCC 1-308. Without Prejudice.
      `.trim();
    }

    return `
╔${'═'.repeat(67)}╗
║  R.O.M.A.N. BADGE OF SLAVERY DIAGNOSTIC                          ║
║  Constitutional Auditor — 13th Amendment Analysis                ║
║  Counter-Canon Vol. 6 — Equity                                   ║
╚${'═'.repeat(67)}╝

SEVERITY: ${result.severity}  |  SCORE: ${result.severityScore}  |  BADGES: ${result.detectedBadges.length}

${'═'.repeat(69)}
BADGES DETECTED
${'═'.repeat(69)}
${result.detectedBadges.map((b, i) => `${i + 1}. ${b}`).join('\n')}

${'═'.repeat(69)}
${result.constitutionalArgument}

${'═'.repeat(69)}
${result.equityArgument}

${'═'.repeat(69)}
FILING STRATEGY
${'═'.repeat(69)}
${result.filingStrategy.join('\n')}

${'═'.repeat(69)}
REMEDY PATH
${'═'.repeat(69)}
${result.remedyPath}

${'─'.repeat(69)}
Counter-Canon: ${result.counterCanonVolume}
All rights reserved. UCC 1-308. Without Prejudice.
Howard Jones Bloodline Ancestral Trust — Grantor: Rickey Allan Howard
    `.trim();
  }
}

// Export singleton for service injection
export const romanBadgeOfSlaveryDiagnostic = RomanBadgeOfSlaveryDiagnostic;
