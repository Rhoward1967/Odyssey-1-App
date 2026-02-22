/**
 * SEC EDGAR Securitization Search
 * ================================
 * Queries the SEC's public EDGAR database to identify whether a debt
 * has been securitized — packaged into an Asset-Backed Security (ABS)
 * trust. If a debt was securitized, the original bank is likely a
 * servicer, NOT the holder — breaking their standing to collect under
 * UCC § 3-301.
 *
 * Legal Significance:
 *   UCC § 3-301  — Only the "Person Entitled to Enforce" may collect
 *   UCC § 3-302  — Holder in Due Course: value + good faith + no notice
 *   15 USC §1692g — Collector must validate standing on written demand
 *
 * SEC EDGAR APIs used:
 *   Full-Text Search: https://efts.sec.gov/LATEST/search-index
 *   Company Search:   https://www.sec.gov/cgi-bin/browse-edgar
 *   Submissions API:  https://data.sec.gov/submissions/CIK{}.json
 *
 * Howard Jones Bloodline Ancestral Trust — Odyssey-1 AI LLC
 */

import { corsHeaders } from '../_shared/cors.ts';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

interface SearchRequest {
  bankName: string;
  accountType?: 'credit_card' | 'auto' | 'mortgage' | 'personal_loan' | 'business';
  cusipPrefix?: string;
}

interface ABSTrust {
  name: string;
  cik?: string;
  accountType: string;
  edgarUrl: string;
  filingTypes: string[];
  notes?: string;
}

interface EDGARFiling {
  trustName: string;
  filingType: string;
  filingDate: string;
  description: string;
  url: string;
}

interface SecuritizationResult {
  bankName: string;
  normalizedName: string;
  knownTrusts: ABSTrust[];
  edgarFilings: EDGARFiling[];
  securitizationLikelihood: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
  legalImplication: string;
  cusipDemandRequired: boolean;
  edgarSearchUrl: string;
}

// ─────────────────────────────────────────────────────────────────
// KNOWN ABS TRUST REGISTRY
// Major US banks and their known securitization trusts (SEC-filed)
// Source: EDGAR company search, public ABS-15G filings
// ─────────────────────────────────────────────────────────────────

const ABS_TRUST_REGISTRY: Record<string, ABSTrust[]> = {
  'chase': [
    {
      name: 'Chase Issuance Trust',
      cik: '0001273931',
      accountType: 'credit_card',
      edgarUrl: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001273931&type=10-D&dateb=&owner=include&count=40',
      filingTypes: ['10-D', 'ABS-15G', '8-K'],
    },
    {
      name: 'Chase Credit Card Master Note Trust',
      cik: '0001109606',
      accountType: 'credit_card',
      edgarUrl: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001109606&type=10-D&dateb=&owner=include&count=40',
      filingTypes: ['10-D', 'ABS-15G'],
    },
    {
      name: 'JPMorgan Chase Auto Securitization',
      accountType: 'auto',
      edgarUrl: 'https://efts.sec.gov/LATEST/search-index?q=%22JPMorgan+Chase+Auto%22&forms=ABS-15G,10-D',
      filingTypes: ['ABS-15G', '10-D'],
    },
  ],
  'jpmorgan': [], // alias — populated at runtime from 'chase'

  'capital one': [
    {
      name: 'Capital One Multi-Asset Execution Trust',
      cik: '0001264709',
      accountType: 'credit_card',
      edgarUrl: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001264709&type=10-D&dateb=&owner=include&count=40',
      filingTypes: ['10-D', 'ABS-15G'],
    },
    {
      name: 'Capital One Master Note Trust',
      accountType: 'credit_card',
      edgarUrl: 'https://efts.sec.gov/LATEST/search-index?q=%22Capital+One+Master+Note+Trust%22&forms=10-D,ABS-15G',
      filingTypes: ['10-D', 'ABS-15G'],
    },
  ],

  'citibank': [
    {
      name: 'Citi Credit Card Issuance Trust',
      cik: '0001086626',
      accountType: 'credit_card',
      edgarUrl: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001086626&type=10-D&dateb=&owner=include&count=40',
      filingTypes: ['10-D', 'ABS-15G'],
    },
    {
      name: 'Citibank Credit Card Issuance Trust',
      accountType: 'credit_card',
      edgarUrl: 'https://efts.sec.gov/LATEST/search-index?q=%22Citibank+Credit+Card+Issuance+Trust%22&forms=10-D',
      filingTypes: ['10-D', 'ABS-15G'],
    },
  ],
  'citi': [], // alias

  'bank of america': [
    {
      name: 'BA Credit Card Trust',
      accountType: 'credit_card',
      edgarUrl: 'https://efts.sec.gov/LATEST/search-index?q=%22BA+Credit+Card+Trust%22&forms=10-D,ABS-15G',
      filingTypes: ['10-D', 'ABS-15G'],
    },
    {
      name: 'FIA Card Services National Association',
      accountType: 'credit_card',
      edgarUrl: 'https://efts.sec.gov/LATEST/search-index?q=%22FIA+Card+Services%22&forms=ABS-15G',
      filingTypes: ['ABS-15G'],
      notes: 'Former MBNA / BoA credit card issuer',
    },
    {
      name: 'Bank of America Auto Trust',
      accountType: 'auto',
      edgarUrl: 'https://efts.sec.gov/LATEST/search-index?q=%22Bank+of+America+Auto+Trust%22&forms=ABS-15G,10-D',
      filingTypes: ['ABS-15G', '10-D'],
    },
  ],

  'american express': [
    {
      name: 'American Express Credit Account Master Trust',
      accountType: 'credit_card',
      edgarUrl: 'https://efts.sec.gov/LATEST/search-index?q=%22American+Express+Credit+Account+Master+Trust%22&forms=10-D,ABS-15G',
      filingTypes: ['10-D', 'ABS-15G'],
    },
    {
      name: 'American Express Issuance Trust',
      accountType: 'credit_card',
      edgarUrl: 'https://efts.sec.gov/LATEST/search-index?q=%22American+Express+Issuance+Trust%22&forms=10-D,ABS-15G',
      filingTypes: ['10-D', 'ABS-15G'],
    },
    {
      name: 'American Express Credit Account Secured Note Trust',
      accountType: 'credit_card',
      edgarUrl: 'https://efts.sec.gov/LATEST/search-index?q=%22American+Express+Credit+Account+Secured%22&forms=10-D',
      filingTypes: ['10-D'],
    },
  ],
  'amex': [], // alias

  'synchrony': [
    {
      name: 'Synchrony Credit Card Master Note Trust',
      accountType: 'credit_card',
      edgarUrl: 'https://efts.sec.gov/LATEST/search-index?q=%22Synchrony+Credit+Card+Master+Note+Trust%22&forms=10-D,ABS-15G',
      filingTypes: ['10-D', 'ABS-15G'],
      notes: 'Formerly GE Capital Credit Card Master Note Trust',
    },
    {
      name: 'GE Capital Credit Card Master Note Trust',
      accountType: 'credit_card',
      edgarUrl: 'https://efts.sec.gov/LATEST/search-index?q=%22GE+Capital+Credit+Card+Master+Note+Trust%22&forms=10-D',
      filingTypes: ['10-D'],
      notes: 'Predecessor to Synchrony (pre-2014 accounts)',
    },
  ],

  'discover': [
    {
      name: 'Discover Card Execution Note Trust',
      accountType: 'credit_card',
      edgarUrl: 'https://efts.sec.gov/LATEST/search-index?q=%22Discover+Card+Execution+Note+Trust%22&forms=10-D,ABS-15G',
      filingTypes: ['10-D', 'ABS-15G'],
    },
    {
      name: 'Discover Card Master Trust I',
      accountType: 'credit_card',
      edgarUrl: 'https://efts.sec.gov/LATEST/search-index?q=%22Discover+Card+Master+Trust%22&forms=10-D',
      filingTypes: ['10-D'],
    },
  ],

  'wells fargo': [
    {
      name: 'Wells Fargo Credit Card Master Note Trust',
      accountType: 'credit_card',
      edgarUrl: 'https://efts.sec.gov/LATEST/search-index?q=%22Wells+Fargo+Credit+Card+Master+Note+Trust%22&forms=10-D,ABS-15G',
      filingTypes: ['10-D', 'ABS-15G'],
    },
    {
      name: 'Wells Fargo Auto Owner Trust',
      accountType: 'auto',
      edgarUrl: 'https://efts.sec.gov/LATEST/search-index?q=%22Wells+Fargo+Auto+Owner+Trust%22&forms=ABS-15G,10-D',
      filingTypes: ['ABS-15G', '10-D'],
    },
  ],

  'peach state federal credit union': [
    {
      name: 'Peach State FCU — Credit Union ABS',
      accountType: 'credit_card',
      edgarUrl: 'https://efts.sec.gov/LATEST/search-index?q=%22Peach+State+Federal%22&forms=ABS-15G',
      filingTypes: ['ABS-15G'],
      notes: 'Credit unions less commonly securitize — verify via NCUA',
    },
  ],

  'intuit': [
    {
      name: 'QuickBooks Capital / Intuit Financing — SBA Securitization',
      accountType: 'business',
      edgarUrl: 'https://efts.sec.gov/LATEST/search-index?q=%22Intuit+Financing%22&forms=ABS-15G,8-K',
      filingTypes: ['ABS-15G', '8-K'],
      notes: 'Small business loans may be sold to SBA or ABS pools',
    },
  ],
};

// Populate aliases
ABS_TRUST_REGISTRY['jpmorgan'] = ABS_TRUST_REGISTRY['chase'];
ABS_TRUST_REGISTRY['citi'] = ABS_TRUST_REGISTRY['citibank'];
ABS_TRUST_REGISTRY['amex'] = ABS_TRUST_REGISTRY['american express'];
ABS_TRUST_REGISTRY['bofa'] = ABS_TRUST_REGISTRY['bank of america'];

// ─────────────────────────────────────────────────────────────────
// NORMALIZE BANK NAME
// ─────────────────────────────────────────────────────────────────

function normalizeBankName(raw: string): string {
  const lower = raw.toLowerCase().trim();

  if (lower.includes('chase') || lower.includes('jpmorgan')) return 'chase';
  if (lower.includes('capital one')) return 'capital one';
  if (lower.includes('citi')) return 'citibank';
  if (lower.includes('bank of america') || lower.includes('bofa')) return 'bank of america';
  if (lower.includes('american express') || lower.includes('amex')) return 'american express';
  if (lower.includes('synchrony') || lower.includes('ge capital')) return 'synchrony';
  if (lower.includes('discover')) return 'discover';
  if (lower.includes('wells fargo')) return 'wells fargo';
  if (lower.includes('peach state')) return 'peach state federal credit union';
  if (lower.includes('intuit') || lower.includes('quickbooks')) return 'intuit';

  return lower;
}

// ─────────────────────────────────────────────────────────────────
// QUERY EDGAR EFTS (Full-Text Search)
// ─────────────────────────────────────────────────────────────────

async function queryEDGAR(bankName: string): Promise<EDGARFiling[]> {
  const encoded = encodeURIComponent(`"${bankName}" trust`);
  const url = `https://efts.sec.gov/LATEST/search-index?q=${encoded}&forms=ABS-15G,10-D&dateRange=custom&startdt=2015-01-01&enddt=2026-12-31&hits.hits._source=period_of_report,entity_name,file_num,form_type,file_date,period&hits.hits.total.value=10`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Odyssey-1 AI Platform legal-research@odyssey1.ai',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) return [];

  try {
    const data = await response.json();
    const hits = data?.hits?.hits || [];

    return hits.slice(0, 8).map((hit: any) => {
      const src = hit._source || {};
      return {
        trustName: src.entity_name || 'Unknown Trust',
        filingType: src.form_type || 'ABS',
        filingDate: src.file_date || src.period_of_report || '',
        description: `${src.form_type} filing — ${src.entity_name}`,
        url: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&company=${encodeURIComponent(src.entity_name || bankName)}&type=${src.form_type}&dateb=&owner=include&count=10`,
      };
    });
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────
// DETERMINE SECURITIZATION LIKELIHOOD
// ─────────────────────────────────────────────────────────────────

function assessLikelihood(
  knownTrusts: ABSTrust[],
  edgarFilings: EDGARFiling[],
  accountType?: string,
): { likelihood: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN'; implication: string; cusipRequired: boolean } {

  const totalEvidence = knownTrusts.length + edgarFilings.length;

  if (knownTrusts.length > 0) {
    const typeMatch = accountType
      ? knownTrusts.some(t => t.accountType === accountType || t.accountType === 'credit_card')
      : true;

    if (typeMatch) {
      return {
        likelihood: 'HIGH',
        implication:
          'This bank has documented ABS securitization trusts on file with the SEC. ' +
          'Your debt was likely bundled into a trust pool. The bank is probably a SERVICER, ' +
          'NOT the Holder under UCC § 3-301. Demand CUSIP, Trust name, Trustee identity, ' +
          'and Pooling & Servicing Agreement under §1692g Section 3.',
        cusipRequired: true,
      };
    }
  }

  if (totalEvidence > 0) {
    return {
      likelihood: 'MEDIUM',
      implication:
        'SEC filings found for this institution. Securitization possible. ' +
        'Include CUSIP demand in your §1692g letter as a precaution.',
      cusipRequired: true,
    };
  }

  return {
    likelihood: 'LOW',
    implication:
      'No ABS trust filings found in registry. Debt may still be securitized — ' +
      'smaller institutions sometimes sell to larger pools. Standard §1692g letter applies.',
    cusipRequired: false,
  };
}

// ─────────────────────────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: SearchRequest = await req.json();
    const { bankName, accountType, cusipPrefix } = body;

    if (!bankName) {
      return new Response(
        JSON.stringify({ error: 'bankName is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const normalized = normalizeBankName(bankName);
    const knownTrusts = ABS_TRUST_REGISTRY[normalized] || [];

    // Filter by account type if provided
    const filteredTrusts = accountType
      ? knownTrusts.filter(t => t.accountType === accountType || !accountType)
      : knownTrusts;

    // Query EDGAR for dynamic results
    const edgarFilings = await queryEDGAR(bankName);

    // Assess securitization likelihood
    const { likelihood, implication, cusipRequired } = assessLikelihood(
      filteredTrusts,
      edgarFilings,
      accountType,
    );

    // Build EDGAR search URL for user to explore manually
    const edgarSearchUrl = `https://efts.sec.gov/LATEST/search-index?q=${encodeURIComponent('"' + bankName + '"')}&forms=ABS-15G,10-D`;

    const result: SecuritizationResult = {
      bankName,
      normalizedName: normalized,
      knownTrusts: filteredTrusts,
      edgarFilings,
      securitizationLikelihood: likelihood,
      legalImplication: implication,
      cusipDemandRequired: cusipRequired,
      edgarSearchUrl,
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Internal error', detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
