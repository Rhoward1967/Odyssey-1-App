/**
 * SEC EDGAR Securitization Service
 * ==================================
 * Frontend service for querying the SEC EDGAR database to identify
 * whether a creditor has securitized debt — packaged into an ABS trust.
 *
 * If securitized: the bank is a SERVICER, not the Holder under UCC § 3-301.
 * This automatically upgrades the §1692g letter to include Section 3
 * demands: CUSIP, Trust name, Trustee identity, Pooling & Servicing Agreement.
 *
 * Howard Jones Bloodline Ancestral Trust — Odyssey-1 AI LLC
 */

import { supabase } from '@/lib/supabaseClient';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export interface ABSTrust {
  name: string;
  cik?: string;
  accountType: string;
  edgarUrl: string;
  filingTypes: string[];
  notes?: string;
}

export interface EDGARFiling {
  trustName: string;
  filingType: string;
  filingDate: string;
  description: string;
  url: string;
}

export type SecuritizationLikelihood = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

export interface SecuritizationResult {
  bankName: string;
  normalizedName: string;
  knownTrusts: ABSTrust[];
  edgarFilings: EDGARFiling[];
  securitizationLikelihood: SecuritizationLikelihood;
  legalImplication: string;
  cusipDemandRequired: boolean;
  edgarSearchUrl: string;
}

export type AccountType = 'credit_card' | 'auto' | 'mortgage' | 'personal_loan' | 'business';

// ─────────────────────────────────────────────────────────────────
// LIKELIHOOD BADGE CONFIG
// ─────────────────────────────────────────────────────────────────

export const LIKELIHOOD_CONFIG: Record<SecuritizationLikelihood, {
  label: string;
  color: string;
  bgColor: string;
  description: string;
}> = {
  HIGH: {
    label: 'HIGH — Securitized',
    color: 'text-red-700',
    bgColor: 'bg-red-100 border-red-300',
    description: 'Bank has documented ABS trusts on EDGAR. Section 3 CUSIP demands required.',
  },
  MEDIUM: {
    label: 'MEDIUM — Possible',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100 border-amber-300',
    description: 'SEC filings found. Include CUSIP demand as precaution.',
  },
  LOW: {
    label: 'LOW — Unlikely',
    color: 'text-green-700',
    bgColor: 'bg-green-100 border-green-300',
    description: 'No ABS trust registry match. Standard §1692g letter applies.',
  },
  UNKNOWN: {
    label: 'UNKNOWN',
    color: 'text-slate-700',
    bgColor: 'bg-slate-100 border-slate-300',
    description: 'Unable to determine. Review EDGAR manually.',
  },
};

// ─────────────────────────────────────────────────────────────────
// MAIN SEARCH
// ─────────────────────────────────────────────────────────────────

/**
 * Search SEC EDGAR for securitization trusts associated with a bank.
 * Routes through the sec-edgar-search edge function to avoid CORS
 * and to add proper SEC User-Agent headers.
 */
export async function searchSecuritization(
  bankName: string,
  accountType?: AccountType,
): Promise<SecuritizationResult> {
  const { data, error } = await supabase.functions.invoke('sec-edgar-search', {
    body: { bankName, accountType },
  });

  if (error) throw new Error(`EDGAR search failed: ${error.message}`);
  return data as SecuritizationResult;
}

// ─────────────────────────────────────────────────────────────────
// AUTO-APPLY TO DEBT VECTOR
// ─────────────────────────────────────────────────────────────────

/**
 * After identifying securitization, update the debt_vectors record
 * with the CUSIP/trust info so the letter generator automatically
 * triggers Section 3 demands.
 */
export async function applySecuritizationToDebt(
  debtVectorId: string,
  result: SecuritizationResult,
  selectedTrust?: ABSTrust,
): Promise<void> {
  const trustName = selectedTrust?.name || result.knownTrusts[0]?.name || null;
  const cusipNote = trustName
    ? `SECURITIZED — Trust: ${trustName} | EDGAR: ${result.edgarSearchUrl}`
    : result.edgarSearchUrl;

  const { error } = await supabase
    .from('debt_vectors')
    .update({
      cusip_id: trustName || 'SECURITIZED — SEE EDGAR',
      notes: cusipNote,
    })
    .eq('id', debtVectorId);

  if (error) throw new Error(`Failed to update debt vector: ${error.message}`);
}

// ─────────────────────────────────────────────────────────────────
// EDGAR URL BUILDERS (for manual research links)
// ─────────────────────────────────────────────────────────────────

/** Direct EDGAR company search for a trust by name */
export function buildEdgarCompanyUrl(trustName: string): string {
  return `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&company=${encodeURIComponent(trustName)}&type=10-D&dateb=&owner=include&count=40`;
}

/** EDGAR full-text search for ABS filings mentioning a bank */
export function buildEdgarFullTextUrl(bankName: string): string {
  return `https://efts.sec.gov/LATEST/search-index?q=${encodeURIComponent('"' + bankName + '"')}&forms=ABS-15G,10-D`;
}

/** SEC EDGAR ABS-15G filing search — securitization shelf registrations */
export function buildABS15GUrl(bankName: string): string {
  return `https://efts.sec.gov/LATEST/search-index?q=${encodeURIComponent(bankName)}&forms=ABS-15G`;
}

// ─────────────────────────────────────────────────────────────────
// ACCOUNT TYPE LABELS
// ─────────────────────────────────────────────────────────────────

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  credit_card: 'Credit Card',
  auto: 'Auto Loan',
  mortgage: 'Mortgage',
  personal_loan: 'Personal Loan',
  business: 'Business Loan',
};

// ─────────────────────────────────────────────────────────────────
// UCC STANDING SUMMARY
// Returns the legal language for the §1692g letter based on result
// ─────────────────────────────────────────────────────────────────

export function buildUCCStandingSummary(result: SecuritizationResult): string {
  if (result.securitizationLikelihood === 'HIGH' && result.knownTrusts.length > 0) {
    const trust = result.knownTrusts[0];
    return (
      `SECURITIZATION IDENTIFIED: ${result.bankName} has documented ABS trusts ` +
      `on file with the SEC (e.g., "${trust.name}"). Under UCC § 3-301, only the ` +
      `Person Entitled to Enforce — the Trust acting through its Trustee — may collect. ` +
      `The servicer (${result.bankName}) lacks standing. CUSIP, Trust name, Trustee ` +
      `identity, and Pooling & Servicing Agreement are demanded under Section 3.`
    );
  }

  if (result.securitizationLikelihood === 'MEDIUM') {
    return (
      `POSSIBLE SECURITIZATION: SEC filings found for ${result.bankName}. ` +
      `CUSIP demand included as precaution under §1692g Section 3.`
    );
  }

  return (
    `Standard UCC § 3-301 standing demand. No ABS trust registry match found for ` +
    `${result.bankName}, but original note and chain of title still required.`
  );
}
