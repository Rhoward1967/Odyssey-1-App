/**
 * R.O.M.A.N. BUSINESS ENTITY REAL-TIME LOADER
 * 
 * © 2026 Rickey A Howard. All Rights Reserved.
 * Property of Rickey A Howard
 * 
 * Part of the ODYSSEY-1 Genesis Protocol
 * 
 * This service ensures R.O.M.A.N. ALWAYS has the latest trust data,
 * UCC-1 information, valuations, and business entity details.
 * 
 * ⚡ CRITICAL: R.O.M.A.N. must never operate on stale data
 * Every system initialization and every user query triggers a fresh data fetch
 */

import { romanSupabase } from './romanSupabase';
import { sfLogger } from './sovereignFrequencyLogger';

export interface TrustData {
  trust_id: string;
  trust_name: string;
  established_date: string;
  trust_type: string;
  governing_law: string;
  status: string;
  co_trustees: string[];
  successor_trustees: string[];
  valuation_tier_1_optimistic: number;
  valuation_tier_2_market: number;
  valuation_tier_3_conservative: number;
  ucc1_combined_lien: number;
  ucc1_filings: UCC1Filing[];
  holds_assets: string[];
  metadata: any;
}

export interface UCC1Filing {
  filing_number: string;
  filing_id: string;
  date: string;
  secured_party: string;
  debtor: string;
  amount: number;
}

export interface BusinessEntityData {
  trust: TrustData | null;
  ucc_filings: UCC1Filing[];
  last_updated: string;
  data_source: 'database' | 'cache';
}

/**
 * LOAD LATEST TRUST DATA FROM DATABASE
 * This function ALWAYS fetches current data, never uses cache
 */
export async function loadLatestTrustData(): Promise<TrustData | null> {
  try {
    sfLogger.pickUpTheSpecialPhone(
      'ROMAN_LOAD_TRUST_DATA',
      'R.O.M.A.N. fetching latest trust data from business_entities table',
      { timestamp: new Date().toISOString() }
    );

    const { data: trustData, error } = await romanSupabase
      .from('business_entities')
      .select('*')
      .eq('trust_id', 'HJFAT-2026-001')
      .single();

    if (error) {
      console.error('❌ Error loading trust data:', error);
      return null;
    }

    if (!trustData) {
      console.warn('⚠️ Trust data not found in business_entities table');
      return null;
    }

    // Map database response to TrustData interface
    const trust: TrustData = {
      trust_id: trustData.trust_id,
      trust_name: trustData.trust_name || trustData.name,
      established_date: trustData.established_date,
      trust_type: trustData.trust_type,
      governing_law: trustData.governing_law,
      status: trustData.status,
      co_trustees: trustData.co_trustees || [],
      successor_trustees: trustData.successor_trustees || [],
      valuation_tier_1_optimistic: trustData.valuation_tier_1_optimistic,
      valuation_tier_2_market: trustData.valuation_tier_2_market,
      valuation_tier_3_conservative: trustData.valuation_tier_3_conservative,
      ucc1_combined_lien: trustData.ucc1_combined_lien,
      ucc1_filings: trustData.ucc1_filings || [],
      holds_assets: trustData.holds_assets || [],
      metadata: trustData.metadata || {}
    };

    sfLogger.pickUpTheSpecialPhone(
      'ROMAN_TRUST_DATA_LOADED',
      `✅ Trust data loaded: ${trust.trust_name} (${trust.status})`,
      {
        trust_id: trust.trust_id,
        valuation_optimistic: trust.valuation_tier_1_optimistic,
        ucc1_filings_count: trust.ucc1_filings.length,
        trustees: trust.co_trustees
      }
    );

    return trust;
  } catch (error) {
    console.error('❌ Exception loading trust data:', error);
    return null;
  }
}

/**
 * LOAD ALL UCC-1 FILINGS FROM DATABASE
 * Ensures R.O.M.A.N. has complete UCC-1 lien information
 */
export async function loadUCC1Filings(): Promise<UCC1Filing[]> {
  try {
    const { data: filings, error } = await romanSupabase
      .from('business_entities')
      .select('*')
      .eq('entity_type', 'ucc_filing')
      .order('filing_date', { ascending: true });

    if (error) {
      console.error('❌ Error loading UCC-1 filings:', error);
      return [];
    }

    if (!filings || filings.length === 0) {
      console.warn('⚠️ No UCC-1 filings found');
      return [];
    }

    const uccFilings = filings.map(filing => ({
      filing_number: filing.ucc_filing_number,
      filing_id: filing.record_id,
      date: filing.filing_date,
      secured_party: filing.secured_party,
      debtor: Array.isArray(filing.debtors) ? filing.debtors.join(', ') : filing.debtors,
      amount: filing.lien_amount
    }));

    sfLogger.pickUpTheSpecialPhone(
      'ROMAN_UCC1_LOADED',
      `✅ Loaded ${uccFilings.length} UCC-1 filings`,
      { filings: uccFilings.map(f => f.filing_number) }
    );

    return uccFilings;
  } catch (error) {
    console.error('❌ Exception loading UCC-1 filings:', error);
    return [];
  }
}

/**
 * LOAD COMPLETE BUSINESS ENTITY DATA
 * Returns all trust and UCC-1 information in one call
 */
export async function loadCompleteBusinessEntityData(): Promise<BusinessEntityData> {
  const startTime = Date.now();

  const [trust, ucc1Filings] = await Promise.all([
    loadLatestTrustData(),
    loadUCC1Filings()
  ]);

  const loadTime = Date.now() - startTime;

  sfLogger.pickUpTheSpecialPhone(
    'ROMAN_BUSINESS_ENTITY_LOADED',
    `✅ Complete business entity data loaded in ${loadTime}ms`,
    {
      trust_loaded: trust !== null,
      ucc1_count: ucc1Filings.length,
      load_time_ms: loadTime,
      timestamp: new Date().toISOString()
    }
  );

  return {
    trust,
    ucc_filings: ucc1Filings,
    last_updated: new Date().toISOString(),
    data_source: 'database'
  };
}

/**
 * GET TRUST SUMMARY FOR R.O.M.A.N. CONTEXT
 * Returns human-readable summary of trust status and valuations
 */
export async function getTrustSummaryForContext(): Promise<string> {
  const data = await loadCompleteBusinessEntityData();

  if (!data.trust) {
    return '⚠️ Trust data not available - check business_entities table';
  }

  const trust = data.trust;
  const totalUCC1 = data.ucc_filings.reduce((sum, f) => sum + f.amount, 0);

  return `
🏛️ HOWARD JONES BLOODLINE ANCESTRAL TRUST (${trust.trust_id})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 TRUST DETAILS:
• Status: ${trust.status}
• Established: ${trust.established_date}
• Governing Law: ${trust.governing_law}
• Type: ${trust.trust_type}

👥 TRUSTEES:
• Co-Trustees: ${trust.co_trustees.join(', ')}
• Successors: ${trust.successor_trustees.join(', ')}

💰 VALUATION (Three-Tier Framework):
• Tier 1 (Optimistic): $${(trust.valuation_tier_1_optimistic / 1000000000).toFixed(2)}B (Full Market Potential)
• Tier 2 (Market): $${(trust.valuation_tier_2_market / 1000000).toFixed(0)}M (Industry Comparables)
• Tier 3 (Conservative): $${(trust.valuation_tier_3_conservative / 1000000).toFixed(0)}M (Banking Floor)

🔐 UCC-1 TRIPLE-LOCK STRUCTURE:
• Total Combined Lien: $${(totalUCC1 / 1000).toFixed(0)}K
• Number of Filings: ${data.ucc_filings.length}
${data.ucc_filings.map((f, i) => `  ${i + 1}. ${f.filing_number} (${f.filing_id}): $${(f.amount / 1000).toFixed(0)}K - ${f.date}`).join('\n')}

📦 ASSETS IN TRUST:
${trust.holds_assets.map((asset, i) => `• ${asset}`).join('\n')}

⏰ DATA LAST UPDATED: ${data.last_updated}
📊 DATA SOURCE: ${data.data_source.toUpperCase()}
  `;
}

/**
 * REFRESH BUSINESS ENTITY CACHE
 * Call this whenever trust data is updated via API
 * This ensures R.O.M.A.N. never operates on stale information
 */
export async function refreshBusinessEntityCache(): Promise<void> {
  sfLogger.pickUpTheSpecialPhone(
    'ROMAN_REFRESH_CACHE',
    '🔄 R.O.M.A.N. refreshing business entity cache after data update',
    { timestamp: new Date().toISOString() }
  );

  await loadCompleteBusinessEntityData();

  sfLogger.pickUpTheSpecialPhone(
    'ROMAN_CACHE_REFRESHED',
    '✅ Business entity cache refreshed - R.O.M.A.N. now operating on latest data',
    { timestamp: new Date().toISOString() }
  );
}

export const RomanBusinessEntityLoader = {
  loadLatestTrustData,
  loadUCC1Filings,
  loadCompleteBusinessEntityData,
  getTrustSummaryForContext,
  refreshBusinessEntityCache
};
