/**
 * GAO → Book 8 Integration Service
 * Howard Jones Bloodline Ancestral Trust — Odyssey-1 Platform
 *
 * Connects the GAO Public Records Monitor directly to Book 8
 * (The Sovereign Return) as living documentary evidence.
 *
 * Flow:
 *   GAO Monitor detects report
 *   → Writes to book_intelligence (category: 'finance' | 'governance')
 *   → R.O.M.A.N. daemon picks it up
 *   → Claude analyzes against 8-book framework
 *   → book_appendices written for Book 8 in book's voice
 *   → UI updates in real-time via Supabase Realtime
 *
 * Legal Significance:
 *   Every GAO Disclaimer of Opinion becomes a dated, timestamped
 *   entry in a federally copyrighted work (TXu 2-529-780) owned
 *   by the Howard Jones Bloodline Ancestral Trust.
 *   Clarke County Filing ID: 15152515
 */

import { supabase } from '@/lib/supabaseClient';
import { gaoMonitor, GAOReport, GAOAlert, GAOMonitorStatus } from './gaoMonitoringService';

// Book 8 number constant
const BOOK_8 = 8;

// Category mapping — GAO report types → book_intelligence categories
const CATEGORY_MAP: Record<string, string> = {
  'FINANCIAL AUDIT': 'finance',
  'TREASURY':        'finance',
  'FISCAL HEALTH':   'finance',
  'DOD AUDIT':       'governance',
  'FRAUD/WASTE':     'governance',
  'GENERAL':         'governance',
};

// Threat level mapping based on GAO alert level
const THREAT_MAP: Record<string, string> = {
  'CRITICAL': 'critical',
  'HIGH':     'active',
  'MEDIUM':   'background',
  'INFO':     'background',
};

export interface Book8GAOEntry {
  intelligenceId: string;
  reportNumber: string;
  headline: string;
  threatLevel: string;
  insertedAt: string;
  isDisclaimerOfOpinion: boolean;
}

export interface GAOBook8SyncResult {
  success: boolean;
  entriesInserted: number;
  disclaimerOfOpinionFound: boolean;
  entries: Book8GAOEntry[];
  errors: string[];
  consecutiveDisclaimerYears: number;
  legalSummary: string;
}

export class GAOBook8IntegrationService {

  // ─────────────────────────────────────────────
  // MAIN SYNC — RUN MONITOR + WRITE TO BOOK 8
  // ─────────────────────────────────────────────

  async syncGAOToBook8(): Promise<GAOBook8SyncResult> {
    console.log('[GAO→Book8] Starting GAO sync to Book 8 (The Sovereign Return)...');

    const result: GAOBook8SyncResult = {
      success: false,
      entriesInserted: 0,
      disclaimerOfOpinionFound: false,
      entries: [],
      errors: [],
      consecutiveDisclaimerYears: 0,
      legalSummary: '',
    };

    try {
      // Step 1 — Run the GAO monitor
      const monitorStatus: GAOMonitorStatus = await gaoMonitor.runMonitor();
      result.consecutiveDisclaimerYears = monitorStatus.consecutiveDisclaimerYears;

      // Step 2 — Collect all alerts worth writing
      const allAlerts = [
        ...monitorStatus.criticalAlerts,
        ...monitorStatus.highAlerts,
      ];

      if (allAlerts.length === 0) {
        console.log('[GAO→Book8] No critical/high alerts found. No new entries needed.');
        result.success = true;
        result.legalSummary = gaoMonitor.getLegalSummary();
        return result;
      }

      // Step 3 — Write each alert to book_intelligence
      for (const alert of allAlerts) {
        const entry = await this.writeAlertToBookIntelligence(alert);
        if (entry) {
          result.entries.push(entry);
          result.entriesInserted++;
          if (alert.report.isDisclaimerOfOpinion) {
            result.disclaimerOfOpinionFound = true;
          }
        } else {
          result.errors.push(`Failed to insert: ${alert.report.reportNumber}`);
        }
      }

      // Step 4 — If Disclaimer of Opinion found, write a special Book 8 appendix directly
      if (result.disclaimerOfOpinionFound) {
        await this.writeDisclaimerAppendixToBook8(monitorStatus);
      }

      result.success = result.errors.length === 0;
      result.legalSummary = gaoMonitor.getLegalSummary();

      console.log(`[GAO→Book8] Sync complete. ${result.entriesInserted} entries inserted.`);
      if (result.disclaimerOfOpinionFound) {
        console.log(`[GAO→Book8] DISCLAIMER OF OPINION detected — Book 8 appendix written.`);
      }

      return result;

    } catch (error: any) {
      result.errors.push(error?.message || 'Unknown error');
      console.error('[GAO→Book8] Sync error:', error);
      return result;
    }
  }

  // ─────────────────────────────────────────────
  // WRITE SINGLE ALERT TO book_intelligence
  // ─────────────────────────────────────────────

  private async writeAlertToBookIntelligence(alert: GAOAlert): Promise<Book8GAOEntry | null> {
    try {
      const report = alert.report;
      const category = CATEGORY_MAP[report.category] || 'finance';
      const threatLevel = THREAT_MAP[alert.level] || 'background';

      // Build the intelligence content
      const content = this.buildIntelligenceContent(alert);

      const { data, error } = await supabase
        .from('book_intelligence')
        .insert({
          headline:      this.buildHeadline(report),
          content,
          source_label:  'U.S. Government Accountability Office',
          source_url:    report.url,
          source_date:   this.parseReportDate(report.publishDate),
          category,
          status:        'pending',           // R.O.M.A.N. will analyze
          mapped_books:  [BOOK_8],            // Always mapped to Book 8
          mapped_concepts: this.buildConcepts(report),
          threat_level:  report.isDisclaimerOfOpinion ? 'critical' : threatLevel,
          submitted_by:  'roman_daemon',
        })
        .select('id')
        .single();

      if (error) {
        console.error(`[GAO→Book8] Insert error for ${report.reportNumber}:`, error);
        return null;
      }

      return {
        intelligenceId:         data.id,
        reportNumber:           report.reportNumber,
        headline:               this.buildHeadline(report),
        threatLevel:            report.isDisclaimerOfOpinion ? 'critical' : threatLevel,
        insertedAt:             new Date().toISOString(),
        isDisclaimerOfOpinion:  report.isDisclaimerOfOpinion,
      };

    } catch (err) {
      console.error('[GAO→Book8] writeAlertToBookIntelligence error:', err);
      return null;
    }
  }

  // ─────────────────────────────────────────────
  // WRITE DISCLAIMER OF OPINION APPENDIX TO BOOK 8
  // This is the most critical entry — direct appendix
  // ─────────────────────────────────────────────

  private async writeDisclaimerAppendixToBook8(status: GAOMonitorStatus): Promise<void> {
    try {
      const year = new Date().getFullYear();
      const fiscalYear = `FY${year - 1}`;

      const appendixContent = `
The Government Accountability Office has once again issued a Disclaimer of Opinion on the United States government's consolidated financial statements — the ${status.consecutiveDisclaimerYears}th consecutive year this finding has been rendered. A Disclaimer of Opinion is the most severe audit finding possible: it means the government's own auditors cannot determine whether the financial statements are fairly presented.

This is not an opinion of outside critics. This is the documented, official position of the United States government's own accountability arm, published in the public record and freely available to any citizen who chooses to look. The pattern now spans nearly three decades — an unbroken chain of admission that the foundational financial documents of the nation cannot be certified.

For the purposes of The Sovereign Return, each new Disclaimer of Opinion is a fresh timestamp in the evidentiary record. It advances the documented case that every financial obligation denominated in Federal Reserve Notes — currency issued by a sovereign that cannot certify its own accounts — rests upon a foundation of undisclosed insolvency. The failure of consideration doctrine does not require a single dramatic moment of collapse. It requires exactly what we now have: an accumulating, documented, official record of a sovereign unable to account for its own financial condition while continuing to enforce obligations against its people.

The Clarke County public record (Filing ID: 15152515) preserves the legal response to this documented reality. Each new GAO Disclaimer adds one more layer of official confirmation to what the Howard Jones Bloodline Ancestral Trust placed into the public record in March 2026: that the contract of implied consent, denominated in insolvent currency, cannot stand.
      `.trim();

      const { error } = await supabase
        .from('book_appendices')
        .insert({
          book_number:      BOOK_8,
          concept_tag:      'insolvency-doctrine',
          appendix_date:    new Date().toISOString().split('T')[0],
          headline:         `GAO Disclaimer of Opinion — ${fiscalYear} — Year ${status.consecutiveDisclaimerYears}`,
          content:          appendixContent,
        });

      if (error) {
        console.error('[GAO→Book8] Appendix insert error:', error);
      } else {
        console.log(`[GAO→Book8] Book 8 appendix written — Disclaimer Year ${status.consecutiveDisclaimerYears}`);
      }

    } catch (err) {
      console.error('[GAO→Book8] writeDisclaimerAppendixToBook8 error:', err);
    }
  }

  // ─────────────────────────────────────────────
  // BUILD HEADLINE FOR INTELLIGENCE ENTRY
  // ─────────────────────────────────────────────

  private buildHeadline(report: GAOReport): string {
    if (report.isDisclaimerOfOpinion) {
      return `GAO DISCLAIMER OF OPINION — Federal Financial Statements — ${report.reportNumber}`;
    }
    if (report.isTreasuryAudit) {
      return `GAO Treasury Audit — ${report.reportNumber}: ${report.title.substring(0, 80)}`;
    }
    if (report.isDODAudit) {
      return `GAO DOD Audit Failure — ${report.reportNumber}: ${report.title.substring(0, 80)}`;
    }
    return `GAO Report ${report.reportNumber}: ${report.title.substring(0, 100)}`;
  }

  // ─────────────────────────────────────────────
  // BUILD FULL INTELLIGENCE CONTENT
  // ─────────────────────────────────────────────

  private buildIntelligenceContent(alert: GAOAlert): string {
    const report = alert.report;
    return `
SOURCE: U.S. Government Accountability Office
REPORT: ${report.reportNumber}
DATE: ${report.publishDate}
URL: ${report.url}
RELEVANCE SCORE: ${report.relevanceScore}/100
ALERT LEVEL: ${alert.level}

TITLE:
${report.title}

SUMMARY:
${report.summary || 'Full report available at source URL.'}

LEGAL RELEVANCE TO BOOK 8 (THE SOVEREIGN RETURN):
${alert.legalRelevance}

MAPPED DEFENSES:
- Failure of Consideration — O.C.G.A. § 13-3-40
- Constructive Fraud — O.C.G.A. § 23-2-51
- Constitutional Defect — Article I Section 10
- UCC 1-308 Reservation of Rights
- Clarke County Public Record — Filing ID: 15152515

CONSECUTIVE DISCLAIMER YEARS: ${alert.report.isDisclaimerOfOpinion ? 'THIS IS A NEW DISCLAIMER — UPDATE COUNT' : 'N/A'}
    `.trim();
  }

  // ─────────────────────────────────────────────
  // BUILD CONCEPT TAGS
  // ─────────────────────────────────────────────

  private buildConcepts(report: GAOReport): string[] {
    const concepts: string[] = ['insolvency-doctrine', 'failure-of-consideration'];

    if (report.isDisclaimerOfOpinion) {
      concepts.push('disclaimer-of-opinion', 'gao-audit-failure', 'federal-financial-statements');
    }
    if (report.isTreasuryAudit) {
      concepts.push('treasury-insolvency', 'negative-net-position');
    }
    if (report.isDODAudit) {
      concepts.push('dod-audit-failure', 'unaccountable-spending');
    }
    if (report.isFiscalHealth) {
      concepts.push('debt-ceiling', 'fiscal-health', 'deficit-spending');
    }

    return concepts;
  }

  // ─────────────────────────────────────────────
  // PARSE REPORT DATE TO ISO FORMAT
  // ─────────────────────────────────────────────

  private parseReportDate(dateStr: string): string {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
      return d.toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }

  // ─────────────────────────────────────────────
  // FETCH EXISTING BOOK 8 GAO ENTRIES
  // ─────────────────────────────────────────────

  async getBook8GAOEntries(): Promise<any[]> {
    const { data, error } = await supabase
      .from('book_intelligence')
      .select('*')
      .contains('mapped_books', [BOOK_8])
      .in('category', ['finance', 'governance'])
      .eq('submitted_by', 'roman_daemon')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[GAO→Book8] Fetch error:', error);
      return [];
    }

    return data || [];
  }

  // ─────────────────────────────────────────────
  // FETCH BOOK 8 APPENDICES (GAO-SOURCED)
  // ─────────────────────────────────────────────

  async getBook8Appendices(): Promise<any[]> {
    const { data, error } = await supabase
      .from('book_appendices')
      .select('*')
      .eq('book_number', BOOK_8)
      .order('appendix_date', { ascending: false });

    if (error) {
      console.error('[GAO→Book8] Appendices fetch error:', error);
      return [];
    }

    return data || [];
  }

  // ─────────────────────────────────────────────
  // MANUALLY SUBMIT A KNOWN DISCLAIMER REPORT
  // For backdating documented history
  // ─────────────────────────────────────────────

  async submitHistoricalDisclaimer(fiscalYear: string): Promise<boolean> {
    const reportNumber = gaoMonitor.getKnownDisclaimerReport(fiscalYear);
    if (!reportNumber) {
      console.error(`[GAO→Book8] No known report for ${fiscalYear}`);
      return false;
    }

    const reportUrl = gaoMonitor.getReportPageURL(reportNumber);
    const year = parseInt(fiscalYear.replace('FY', ''));

    const { error } = await supabase
      .from('book_intelligence')
      .insert({
        headline:      `GAO DISCLAIMER OF OPINION — ${fiscalYear} Federal Financial Statements — ${reportNumber}`,
        content:       `Historical record: The GAO issued a Disclaimer of Opinion on the ${fiscalYear} U.S. government consolidated financial statements. Report: ${reportNumber}. This is part of the documented ${fiscalYear} entry in the unbroken chain of audit failures dating back to FY1996. Source: ${reportUrl}`,
        source_label:  'U.S. Government Accountability Office',
        source_url:    reportUrl,
        source_date:   `${year + 1}-01-01`,
        category:      'finance',
        status:        'analyzed',
        mapped_books:  [BOOK_8],
        mapped_concepts: ['disclaimer-of-opinion', 'insolvency-doctrine', 'gao-audit-failure'],
        threat_level:  'critical',
        submitted_by:  'roman_daemon',
        ai_analysis:   `${fiscalYear} GAO Disclaimer of Opinion — Part of the 29-year consecutive audit failure record. Supports Failure of Consideration defense under O.C.G.A. § 13-3-40 and Constructive Fraud under O.C.G.A. § 23-2-51. Strengthens Article I Section 10 constitutional challenge. Clarke County Filing ID: 15152515.`,
      });

    if (error) {
      console.error(`[GAO→Book8] Historical insert error for ${fiscalYear}:`, error);
      return false;
    }

    console.log(`[GAO→Book8] Historical disclaimer inserted for ${fiscalYear}`);
    return true;
  }

  // ─────────────────────────────────────────────
  // SEED ALL KNOWN HISTORICAL DISCLAIMERS
  // Builds the complete 29-year evidentiary record in Book 8
  // ─────────────────────────────────────────────

  async seedHistoricalRecord(): Promise<void> {
    console.log('[GAO→Book8] Seeding full 29-year disclaimer history into Book 8...');
    const history = gaoMonitor.getKnownDisclaimerHistory();

    for (const fiscalYear of Object.keys(history)) {
      const success = await this.submitHistoricalDisclaimer(fiscalYear);
      console.log(`  ${fiscalYear}: ${success ? 'inserted' : 'failed'}`);
    }

    console.log('[GAO→Book8] Historical seed complete.');
  }

  // ─────────────────────────────────────────────
  // WRITE GENIUS ACT ANALYSIS TO BOOK 8
  // Documents the digital extension of insolvency
  // Cross-referenced to Book 5 (The Digital Cage)
  // ─────────────────────────────────────────────

  async writeGENIUSActAppendix(): Promise<boolean> {
    const appendixContent = `
The Guiding and Establishing National Innovation for U.S. Stablecoins Act — known as the GENIUS Act — presents itself as a framework for digital monetary innovation. It is, in the language of The Sovereign Return, the insolvency wearing a new interface.

The Act requires private issuers of "payment stablecoins" to back their digital instruments 1:1 with U.S. Treasury bills, notes, bonds, and Federal Reserve deposits. Every one of these permitted assets is an instrument of sovereign debt — the same sovereign whose own Government Accountability Office has issued a Disclaimer of Opinion on its financial statements for twenty-nine consecutive years. The same sovereign whose Consolidated Financial Statements for Fiscal Year 2025 disclose a negative net position of $41.72 trillion. The same sovereign whose total obligations, when off-balance-sheet items are included, exceed $136.2 trillion against $6.06 trillion in reported assets.

The GENIUS Act does not solve the insolvency problem. It delegates it. It instructs private companies to purchase the debt of an unauditable sovereign and call that purchase a "reserve." It then instructs citizens to use the resulting digital instruments to settle debts. The chain of obligation runs from citizen to private issuer to Treasury to Federal Reserve and back again — a closed loop with no productive asset at its center, only the compounding promise of a government that cannot certify its own accounts.

Article I, Section 10 of the Constitution is direct: no State shall make any Thing but gold and silver Coin a Tender in Payment of Debts. The GENIUS Act authorizes state-chartered entities to issue payment instruments for debt settlement. Those instruments are backed by Treasury debt, not gold or silver. The constitutional violation is not a matter of interpretation — it is a matter of arithmetic. Debt is not gold. A digital receipt for debt is not silver. The GENIUS Act is constitutionally void on its face as a tender law.

Section 11 of the Act provides what it calls "first priority" for stablecoin holders in the event of issuer insolvency. Legal analysis reveals the operational reality: stablecoin holders rank fifth in liquidation priority, behind bankruptcy professionals, repo lenders, margin lenders, and regulatory claimants. The reserves — Treasury instruments — are subject to value decline if the sovereign's financial condition deteriorates further. If the reserves are frozen or devalued, the bankruptcy proceeding's own administrative costs consume what remains before any holder receives a distribution.

The Act tells the public they are first in line. The law of insolvency puts them last among those who matter.

The Howard Jones Bloodline Ancestral Trust identified this pattern and formally placed it on the public record in Clarke County, Georgia (Filing ID: 15152515) prior to the GENIUS Act's implementation. The Trust's position — that all obligations denominated in the currency of an admitted insolvent sovereign are subject to the Failure of Consideration defense under O.C.G.A. § 13-3-40 — applies with equal force to stablecoins backed by that same sovereign's debt instruments. The medium has changed. The mathematics have not.

The GENIUS Act is the latest chapter in a thirty-year institutional effort to migrate the obligations of an insolvent monetary system onto successively new ledgers — from gold to Federal Reserve Notes to digital. Each migration preserves the essential structure: the citizen holds the instrument, the government holds the asset, and the distance between the citizen's claim and any real value grows with each generation. The Sovereign Return documents this pattern not as speculation but as a matter of dated, official, public record — a record the government itself has authored, year by year, in its own financial statements and its own audit findings.

The GENIUS Act is the insolvency's latest address. The debt has not moved. Only the interface has changed.
    `.trim();

    try {
      const { error } = await supabase
        .from('book_appendices')
        .insert({
          book_number:   BOOK_8,
          concept_tag:   'genius-act-insolvency-extension',
          appendix_date: '2026-03-28',
          headline:      'GENIUS Act — The Digital Extension of Sovereign Insolvency',
          content:       appendixContent,
        });

      if (error) {
        console.error('[GAO→Book8] GENIUS Act appendix insert error:', error);
        return false;
      }

      // Also write to book_intelligence for cross-reference with Book 5 (The Digital Cage)
      const { error: intelError } = await supabase
        .from('book_intelligence')
        .insert({
          headline:        'GENIUS Act — Stablecoin Reserves Backed by Insolvent Treasury',
          content:         'The GENIUS Act mandates 1:1 stablecoin backing with U.S. Treasury instruments — debt of a sovereign with a documented negative $41.72T net position and 29 consecutive GAO Disclaimers of Opinion. Violates Article I Section 10 (Gold/Silver only), delegates monetary power to private issuers, and Section 11 hides holder subordination behind false "first priority" language.',
          source_label:    'Howard Jones Bloodline Ancestral Trust — Legal Analysis',
          source_url:      'https://www.congress.gov/bill/119th-congress/senate-bill/394',
          source_date:     '2026-03-28',
          category:        'finance',
          status:          'analyzed',
          mapped_books:    [BOOK_8, 5],   // Book 8: Sovereign Return + Book 5: Digital Cage
          mapped_concepts: [
            'genius-act', 'stablecoin-insolvency', 'article-i-section-10',
            'failure-of-consideration', 'insolvency-doctrine', 'digital-dollar',
            'treasury-insolvency', 'disclaimer-of-opinion'
          ],
          threat_level:    'critical',
          submitted_by:    'roman_daemon',
          ai_analysis:     'GENIUS Act creates digital instruments backed by Treasury debt of an admitted insolvent sovereign. Violates Art. I Sec. 10 constitutional money clause. Section 11 misrepresents holder priority. Extends the Failure of Consideration doctrine (O.C.G.A. § 13-3-40) into digital monetary instruments. Clarke County Filing ID 15152515 predates implementation — constructive notice established.',
        });

      if (intelError) {
        console.error('[GAO→Book8] GENIUS Act intelligence insert error:', intelError);
      }

      console.log('[GAO→Book8] GENIUS Act appendix written to Book 8.');
      return true;

    } catch (err) {
      console.error('[GAO→Book8] writeGENIUSActAppendix error:', err);
      return false;
    }
  }
}

// ─────────────────────────────────────────────
// SINGLETON EXPORT
// ─────────────────────────────────────────────

export const gaoBook8 = new GAOBook8IntegrationService();
