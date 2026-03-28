/**
 * GAO Public Records Monitoring Service
 * Howard Jones Bloodline Ancestral Trust — Odyssey-1 Platform
 *
 * Monitors the U.S. Government Accountability Office for:
 * - Annual Disclaimer of Opinion (federal financial statements)
 * - Treasury Department audit reports
 * - DOD financial audit failures
 * - Debt ceiling and fiscal health reports
 * - Any new insolvency-related admissions
 *
 * Data Sources:
 * - GovInfo RSS: https://www.govinfo.gov/rss/gaoreports.xml
 * - GovInfo API: https://api.govinfo.gov/ (free key from api.data.gov)
 * - GAO Direct:  https://www.gao.gov/reports-testimonies
 *
 * Legal Purpose:
 * Every Disclaimer of Opinion issued is a documented admission that strengthens
 * the Failure of Consideration and Insolvency Doctrine defenses preserved in
 * Clarke County public record (Filing ID: 15152515).
 */

export interface GAOReport {
  reportNumber: string;
  title: string;
  publishDate: string;
  url: string;
  category: string;
  relevanceScore: number;         // 0-100 — how relevant to insolvency defense
  isDisclaimerOfOpinion: boolean;
  isTreasuryAudit: boolean;
  isDODAudit: boolean;
  isFiscalHealth: boolean;
  summary?: string;
}

export interface GAOAlert {
  level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  title: string;
  message: string;
  report: GAOReport;
  legalRelevance: string;
  timestamp: string;
}

export interface GAOMonitorStatus {
  lastChecked: string;
  totalReportsFound: number;
  criticalAlerts: GAOAlert[];
  highAlerts: GAOAlert[];
  recentReports: GAOReport[];
  consecutiveDisclaimerYears: number;
  latestFiscalYear: string;
}

// ─────────────────────────────────────────────
// KEYWORDS THAT TRIGGER HIGH RELEVANCE SCORING
// ─────────────────────────────────────────────

const CRITICAL_KEYWORDS = [
  'disclaimer of opinion',
  'disclaimer opinion',
  'unable to express',
  'material weakness',
  'consolidated financial statements',
  'federal financial statements',
  'fiscal year financial',
  'insolvent',
  'insolvency',
  'unfunded obligations',
  'negative net position',
];

const HIGH_KEYWORDS = [
  'treasury department',
  'department of treasury',
  'federal debt',
  'debt ceiling',
  'fiscal health',
  'deficit',
  'unauditable',
  'audit failure',
  'dod financial',
  'department of defense financial',
  'gao financial audit',
  'social insurance',
  'unfunded liabilities',
];

const MEDIUM_KEYWORDS = [
  'debt management',
  'fiscal future',
  'budget outlook',
  'spending accountability',
  'financial management',
  'internal controls',
  'fraud risk',
  'improper payments',
];

// ─────────────────────────────────────────────
// KEY GAO REPORT URLS FOR DIRECT MONITORING
// ─────────────────────────────────────────────

const MONITORED_REPORT_PAGES = [
  {
    url: 'https://www.gao.gov/federal-financial-accountability',
    label: 'Federal Financial Accountability Hub',
    priority: 'CRITICAL'
  },
  {
    url: 'https://www.gao.gov/americas-fiscal-future',
    label: "America's Fiscal Future",
    priority: 'CRITICAL'
  },
  {
    url: 'https://www.gao.gov/federal-debt',
    label: 'Federal Debt & Debt Management',
    priority: 'HIGH'
  },
];

// ─────────────────────────────────────────────
// RSS FEED ENDPOINT (NO API KEY REQUIRED)
// ─────────────────────────────────────────────

const GAO_RSS_FEED = 'https://www.govinfo.gov/rss/gaoreports.xml';

// ─────────────────────────────────────────────
// GOVINFO API ENDPOINT (FREE KEY REQUIRED)
// ─────────────────────────────────────────────

const GOVINFO_API_BASE = 'https://api.govinfo.gov';
const GOVINFO_COLLECTION = 'gaoreports';

// ─────────────────────────────────────────────
// KNOWN DISCLAIMER OF OPINION REPORTS
// (Documented record — 29 consecutive years)
// ─────────────────────────────────────────────

const KNOWN_DISCLAIMER_REPORTS: Record<string, string> = {
  'FY2024': 'GAO-25-107421',
  'FY2023': 'GAO-24-106701',
  'FY2022': 'GAO-23-106246',
  'FY2021': 'GAO-22-105122',
  'FY2020': 'GAO-21-105086',
  'FY2019': 'GAO-20-301R',
  'FY2018': 'GAO-19-283R',
  'FY2017': 'GAO-18-299R',
  'FY2016': 'GAO-17-283R',
  'FY2015': 'GAO-16-357R',
  // Pattern continues back to FY1996 — 29 consecutive years
};

export class GAOMonitoringService {

  private apiKey: string | null;
  private consecutiveDisclaimerYears: number = 29;

  constructor() {
    this.apiKey = import.meta.env?.VITE_GOVINFO_API_KEY || null;
  }

  // ─────────────────────────────────────────────
  // SCORE REPORT RELEVANCE TO INSOLVENCY DEFENSE
  // ─────────────────────────────────────────────

  private scoreRelevance(title: string, summary?: string): {
    score: number;
    isDisclaimerOfOpinion: boolean;
    isTreasuryAudit: boolean;
    isDODAudit: boolean;
    isFiscalHealth: boolean;
  } {
    const text = `${title} ${summary || ''}`.toLowerCase();

    let score = 0;
    let isDisclaimerOfOpinion = false;
    let isTreasuryAudit = false;
    let isDODAudit = false;
    let isFiscalHealth = false;

    // Critical keywords — 25 points each
    CRITICAL_KEYWORDS.forEach(kw => {
      if (text.includes(kw)) {
        score += 25;
        if (kw.includes('disclaimer')) isDisclaimerOfOpinion = true;
      }
    });

    // High keywords — 15 points each
    HIGH_KEYWORDS.forEach(kw => {
      if (text.includes(kw)) {
        score += 15;
        if (kw.includes('treasury')) isTreasuryAudit = true;
        if (kw.includes('dod') || kw.includes('defense')) isDODAudit = true;
        if (kw.includes('fiscal') || kw.includes('debt')) isFiscalHealth = true;
      }
    });

    // Medium keywords — 5 points each
    MEDIUM_KEYWORDS.forEach(kw => {
      if (text.includes(kw)) score += 5;
    });

    return {
      score: Math.min(score, 100),
      isDisclaimerOfOpinion,
      isTreasuryAudit,
      isDODAudit,
      isFiscalHealth
    };
  }

  // ─────────────────────────────────────────────
  // DETERMINE ALERT LEVEL
  // ─────────────────────────────────────────────

  private getAlertLevel(report: GAOReport): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO' {
    if (report.isDisclaimerOfOpinion) return 'CRITICAL';
    if (report.isTreasuryAudit && report.relevanceScore >= 50) return 'CRITICAL';
    if (report.relevanceScore >= 60) return 'HIGH';
    if (report.relevanceScore >= 30) return 'MEDIUM';
    return 'INFO';
  }

  // ─────────────────────────────────────────────
  // BUILD LEGAL RELEVANCE MESSAGE
  // ─────────────────────────────────────────────

  private buildLegalRelevance(report: GAOReport): string {
    if (report.isDisclaimerOfOpinion) {
      this.consecutiveDisclaimerYears++;
      return `CRITICAL LEGAL ASSET: This is year ${this.consecutiveDisclaimerYears} of consecutive Disclaimers of Opinion. ` +
        `Each new disclaimer strengthens the Failure of Consideration defense preserved in Clarke County public record ` +
        `(Filing ID: 15152515). The government has now admitted for ${this.consecutiveDisclaimerYears} consecutive years ` +
        `that it cannot certify its own financial statements. This report should be added to the evidentiary record ` +
        `in all pending debt challenge proceedings including Citibank Account 2751.`;
    }

    if (report.isTreasuryAudit) {
      return `HIGH LEGAL VALUE: New Treasury audit data. Any documented deterioration of the government's net position ` +
        `(currently -$41.72 trillion) strengthens the insolvency doctrine arguments in HJBAT-CITI-2751-CHALLENGE-033026 ` +
        `and supports the constitutional defect claims under Article I Section 10.`;
    }

    if (report.isDODAudit) {
      return `HIGH LEGAL VALUE: DOD financial audit failure documentation. The DOD has never passed an audit. ` +
        `This confirms that the largest single component of federal spending remains unaccountable — ` +
        `supporting the 29-year audit failure argument in the Affidavit of Notice (RAHN-AFFIDAVIT-CLEAN-032426).`;
    }

    if (report.isFiscalHealth) {
      return `MODERATE LEGAL VALUE: Fiscal health data supporting the insolvency doctrine defense. ` +
        `Review for any updated debt projections or deficit data that exceed prior disclosures.`;
    }

    return `Monitor for relevance to insolvency defense and Trust legal proceedings.`;
  }

  // ─────────────────────────────────────────────
  // FETCH RSS FEED (NO API KEY NEEDED)
  // ─────────────────────────────────────────────

  async fetchRSSFeed(): Promise<GAOReport[]> {
    try {
      const response = await fetch(GAO_RSS_FEED);
      if (!response.ok) throw new Error(`RSS fetch failed: ${response.status}`);

      const xmlText = await response.text();
      const reports: GAOReport[] = [];

      // Parse XML items from RSS feed
      const itemMatches = xmlText.match(/<item>([\s\S]*?)<\/item>/g) || [];

      itemMatches.forEach(item => {
        const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ||
                      item.match(/<title>(.*?)<\/title>/)?.[1] || '';
        const link = item.match(/<link>(.*?)<\/link>/)?.[1] || '';
        const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
        const description = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] ||
                            item.match(/<description>(.*?)<\/description>/)?.[1] || '';

        // Extract report number from URL
        const reportNumMatch = link.match(/GAO-[\d]+-[\d]+[A-Z]*/);
        const reportNumber = reportNumMatch ? reportNumMatch[0] : 'UNKNOWN';

        const scoring = this.scoreRelevance(title, description);

        // Only include reports with some relevance
        if (scoring.score >= 10) {
          reports.push({
            reportNumber,
            title,
            publishDate: pubDate,
            url: link,
            category: this.categorizeReport(title),
            relevanceScore: scoring.score,
            isDisclaimerOfOpinion: scoring.isDisclaimerOfOpinion,
            isTreasuryAudit: scoring.isTreasuryAudit,
            isDODAudit: scoring.isDODAudit,
            isFiscalHealth: scoring.isFiscalHealth,
            summary: description.substring(0, 300),
          });
        }
      });

      return reports.sort((a, b) => b.relevanceScore - a.relevanceScore);
    } catch (error) {
      console.error('[GAO Monitor] RSS feed error:', error);
      return [];
    }
  }

  // ─────────────────────────────────────────────
  // FETCH VIA GOVINFO API (REQUIRES FREE KEY)
  // ─────────────────────────────────────────────

  async fetchViaAPI(searchTerms: string[] = []): Promise<GAOReport[]> {
    if (!this.apiKey) {
      console.warn('[GAO Monitor] No GovInfo API key — falling back to RSS feed');
      return this.fetchRSSFeed();
    }

    const defaultTerms = [
      'disclaimer opinion financial statements',
      'treasury department financial audit',
      'federal debt fiscal health',
      'department defense financial audit',
    ];

    const terms = searchTerms.length > 0 ? searchTerms : defaultTerms;
    const reports: GAOReport[] = [];

    for (const term of terms) {
      try {
        const response = await fetch(`${GOVINFO_API_BASE}/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': this.apiKey,
          },
          body: JSON.stringify({
            query: `collection:${GOVINFO_COLLECTION} ${term}`,
            pageSize: 20,
            offsetMark: '*',
            sorts: [{ field: 'publishdate', sortOrder: 'DESC' }],
            resultLevel: 'package',
          }),
        });

        if (!response.ok) continue;

        const data = await response.json();
        const results = data.results || [];

        results.forEach((result: any) => {
          const title = result.title || '';
          const scoring = this.scoreRelevance(title, result.content);

          if (scoring.score >= 10) {
            reports.push({
              reportNumber: result.packageId?.replace('GAOREPORTS-', '') || 'UNKNOWN',
              title,
              publishDate: result.dateIssued || result.publishdate || '',
              url: `https://www.govinfo.gov/app/details/${result.packageId}`,
              category: this.categorizeReport(title),
              relevanceScore: scoring.score,
              isDisclaimerOfOpinion: scoring.isDisclaimerOfOpinion,
              isTreasuryAudit: scoring.isTreasuryAudit,
              isDODAudit: scoring.isDODAudit,
              isFiscalHealth: scoring.isFiscalHealth,
              summary: result.content?.substring(0, 300),
            });
          }
        });
      } catch (error) {
        console.error(`[GAO Monitor] API search error for "${term}":`, error);
      }
    }

    // Deduplicate by report number
    const seen = new Set<string>();
    return reports
      .filter(r => {
        if (seen.has(r.reportNumber)) return false;
        seen.add(r.reportNumber);
        return true;
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  // ─────────────────────────────────────────────
  // CATEGORIZE REPORT BY TITLE
  // ─────────────────────────────────────────────

  private categorizeReport(title: string): string {
    const t = title.toLowerCase();
    if (t.includes('financial audit') || t.includes('financial statement')) return 'FINANCIAL AUDIT';
    if (t.includes('defense') || t.includes('dod') || t.includes('military')) return 'DOD AUDIT';
    if (t.includes('debt') || t.includes('fiscal')) return 'FISCAL HEALTH';
    if (t.includes('treasury')) return 'TREASURY';
    if (t.includes('fraud') || t.includes('improper payment')) return 'FRAUD/WASTE';
    return 'GENERAL';
  }

  // ─────────────────────────────────────────────
  // FULL MONITOR RUN — RETURNS STATUS REPORT
  // ─────────────────────────────────────────────

  async runMonitor(): Promise<GAOMonitorStatus> {
    console.log('[GAO Monitor] Running full monitor scan...');

    const reports = await this.fetchRSSFeed();
    const criticalAlerts: GAOAlert[] = [];
    const highAlerts: GAOAlert[] = [];

    reports.forEach(report => {
      const level = this.getAlertLevel(report);
      const legalRelevance = this.buildLegalRelevance(report);

      const alert: GAOAlert = {
        level,
        title: report.isDisclaimerOfOpinion
          ? `DISCLAIMER OF OPINION DETECTED — Year ${this.consecutiveDisclaimerYears}`
          : `New GAO Report: ${report.reportNumber}`,
        message: report.title,
        report,
        legalRelevance,
        timestamp: new Date().toISOString(),
      };

      if (level === 'CRITICAL') criticalAlerts.push(alert);
      else if (level === 'HIGH') highAlerts.push(alert);
    });

    const status: GAOMonitorStatus = {
      lastChecked: new Date().toISOString(),
      totalReportsFound: reports.length,
      criticalAlerts,
      highAlerts,
      recentReports: reports.slice(0, 10),
      consecutiveDisclaimerYears: this.consecutiveDisclaimerYears,
      latestFiscalYear: this.getLatestFiscalYear(),
    };

    this.logStatus(status);
    return status;
  }

  // ─────────────────────────────────────────────
  // GET KNOWN DISCLAIMER REPORT BY FISCAL YEAR
  // ─────────────────────────────────────────────

  getKnownDisclaimerReport(fiscalYear: string): string | null {
    return KNOWN_DISCLAIMER_REPORTS[fiscalYear] || null;
  }

  getKnownDisclaimerHistory(): Record<string, string> {
    return KNOWN_DISCLAIMER_REPORTS;
  }

  private getLatestFiscalYear(): string {
    const years = Object.keys(KNOWN_DISCLAIMER_REPORTS).sort().reverse();
    return years[0] || 'FY2024';
  }

  // ─────────────────────────────────────────────
  // GET DIRECT REPORT URL
  // ─────────────────────────────────────────────

  getReportURL(reportNumber: string): string {
    const packageId = `GAOREPORTS-${reportNumber}`;
    return `https://www.govinfo.gov/content/pkg/${packageId}/pdf/${packageId}.pdf`;
  }

  getReportPageURL(reportNumber: string): string {
    return `https://www.gao.gov/products/${reportNumber.toLowerCase()}`;
  }

  // ─────────────────────────────────────────────
  // LOG STATUS TO CONSOLE
  // ─────────────────────────────────────────────

  private logStatus(status: GAOMonitorStatus): void {
    console.log('═══════════════════════════════════════════════════');
    console.log('  GAO MONITOR — HOWARD JONES BLOODLINE ANCESTRAL TRUST');
    console.log('═══════════════════════════════════════════════════');
    console.log(`  Last Checked:         ${status.lastChecked}`);
    console.log(`  Reports Found:        ${status.totalReportsFound}`);
    console.log(`  Critical Alerts:      ${status.criticalAlerts.length}`);
    console.log(`  High Alerts:          ${status.highAlerts.length}`);
    console.log(`  Disclaimer Years:     ${status.consecutiveDisclaimerYears} consecutive`);
    console.log(`  Latest Fiscal Year:   ${status.latestFiscalYear}`);

    if (status.criticalAlerts.length > 0) {
      console.log('\n  ⚠ CRITICAL ALERTS:');
      status.criticalAlerts.forEach(a => {
        console.log(`    • ${a.title}`);
        console.log(`      ${a.report.url}`);
      });
    }
    console.log('═══════════════════════════════════════════════════');
  }

  // ─────────────────────────────────────────────
  // LEGAL SUMMARY — FOR DOCUMENT USE
  // ─────────────────────────────────────────────

  getLegalSummary(): string {
    const history = this.getKnownDisclaimerHistory();
    const years = Object.keys(history).sort().reverse();

    return `
GOVERNMENT ACCOUNTABILITY OFFICE — DISCLAIMER OF OPINION RECORD
Howard Jones Bloodline Ancestral Trust — Legal Reference

The U.S. Government Accountability Office has issued a Disclaimer of
Opinion on the United States government's consolidated financial
statements for ${this.consecutiveDisclaimerYears} CONSECUTIVE YEARS.

A Disclaimer of Opinion means the government's own auditors CANNOT
CONFIRM whether the financial statements are fairly presented.

DOCUMENTED RECORD:
${years.map(y => `  ${y}: Report ${history[y]}`).join('\n')}
  ... continuing back to FY1996

LEGAL SIGNIFICANCE (Clarke County Filing ID: 15152515):
Each consecutive year of Disclaimer strengthens:
  1. Failure of Consideration — O.C.G.A. § 13-3-40
  2. Constructive Fraud — O.C.G.A. § 23-2-51
  3. Constitutional Defect — Article I Section 10
  4. UCC 1-308 Reservation — All commercial transactions

Sources: GAO Federal Financial Accountability Hub
         https://www.gao.gov/federal-financial-accountability
    `.trim();
  }
}

// ─────────────────────────────────────────────
// SINGLETON EXPORT
// ─────────────────────────────────────────────

export const gaoMonitor = new GAOMonitoringService();
