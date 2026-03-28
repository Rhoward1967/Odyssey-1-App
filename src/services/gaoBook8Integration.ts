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
}

// ─────────────────────────────────────────────
// SINGLETON EXPORT
// ─────────────────────────────────────────────

export const gaoBook8 = new GAOBook8IntegrationService();
