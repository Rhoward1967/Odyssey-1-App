/**
 * CourtListener Legal Research Service
 * 
 * Free Law Project API Integration for Odyssey-1
 * Provides access to 5M+ court opinions, federal/state case law,
 * and RECAP federal court documents.
 * 
 * API Documentation: https://www.courtlistener.com/api/rest-info/
 * 
 * Features:
 * - Search UCC-1 related case law
 * - Monitor Georgia jurisdiction filings
 * - Track Trust-related precedents
 * - Real-time alerts for new cases
 * - RECAP federal court document access
 */

import { supabase } from '@/lib/supabaseClient';

// Free Law Project API Configuration
const COURTLISTENER_API_BASE = 'https://www.courtlistener.com/api/rest/v3';
const COURTLISTENER_API_KEY = process.env.COURTLISTENER_API_KEY || '';

interface CourtListenerSearchParams {
  query: string;
  jurisdiction?: 'georgia' | 'federal' | 'all';
  type?: 'opinions' | 'oral-arguments' | 'recap' | 'all';
  dateRange?: {
    start?: string; // YYYY-MM-DD
    end?: string;
  };
  limit?: number;
}

interface CourtListenerCase {
  id: number;
  caseName: string;
  court: string;
  dateFiled: string;
  docketNumber: string;
  citation: string[];
  snippet: string;
  url: string;
  absoluteUrl: string;
}

interface CourtListenerResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CourtListenerCase[];
}

/**
 * Search CourtListener for legal precedents
 */
export async function searchCases(params: CourtListenerSearchParams): Promise<CourtListenerResponse> {
  const { query, jurisdiction = 'all', type = 'opinions', dateRange, limit = 20 } = params;

  // Build query parameters
  const queryParams = new URLSearchParams({
    q: query,
    type: type === 'all' ? 'o,oa,r' : type === 'opinions' ? 'o' : type === 'oral-arguments' ? 'oa' : 'r',
    order_by: 'dateFiled desc',
    stat_Precedential: 'Published', // Only published opinions
  });

  // Add jurisdiction filter
  if (jurisdiction === 'georgia') {
    queryParams.append('court', 'gactapp'); // Georgia Court of Appeals
    queryParams.append('court', 'ga'); // Georgia Supreme Court
    queryParams.append('court', 'gamd'); // Georgia Middle District
    queryParams.append('court', 'gand'); // Georgia Northern District
    queryParams.append('court', 'gasd'); // Georgia Southern District
  } else if (jurisdiction === 'federal') {
    queryParams.append('court_id__in', 'scotus,ca11,ca1,ca2,ca3,ca4,ca5,ca6,ca7,ca8,ca9,ca10,cadc,cafc');
  }

  // Add date range
  if (dateRange?.start) {
    queryParams.append('filed_after', dateRange.start);
  }
  if (dateRange?.end) {
    queryParams.append('filed_before', dateRange.end);
  }

  // Pagination
  queryParams.append('page_size', limit.toString());

  try {
    const response = await fetch(`${COURTLISTENER_API_BASE}/search/?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Token ${COURTLISTENER_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CourtListener API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Log search to database for R.O.M.A.N. learning
    await logLegalSearch({
      query,
      jurisdiction,
      resultsCount: data.count,
      timestamp: new Date().toISOString(),
    });

    return data;
  } catch (error) {
    console.error('CourtListener search failed:', error);
    throw error;
  }
}

/**
 * Search for UCC-1 related case law in Georgia
 */
export async function searchUCC1Cases(): Promise<CourtListenerCase[]> {
  const queries = [
    'UCC-1 financing statement',
    'secured creditor priority',
    'perfected security interest',
    'uniform commercial code article 9',
    'debtor creditor UCC',
  ];

  const allResults: CourtListenerCase[] = [];

  for (const query of queries) {
    const response = await searchCases({
      query,
      jurisdiction: 'georgia',
      type: 'opinions',
      limit: 10,
    });

    allResults.push(...response.results);
  }

  // Deduplicate by case ID
  const uniqueCases = Array.from(
    new Map(allResults.map(c => [c.id, c])).values()
  );

  return uniqueCases;
}

/**
 * Search for Trust-related precedents
 */
export async function searchTrustCases(): Promise<CourtListenerCase[]> {
  const queries = [
    'irrevocable trust creditor protection',
    'trust third party wall',
    'trust asset protection',
    'spendthrift trust',
    'trust beneficiary rights',
  ];

  const allResults: CourtListenerCase[] = [];

  for (const query of queries) {
    const response = await searchCases({
      query,
      jurisdiction: 'georgia',
      type: 'opinions',
      limit: 10,
    });

    allResults.push(...response.results);
  }

  const uniqueCases = Array.from(
    new Map(allResults.map(c => [c.id, c])).values()
  );

  return uniqueCases;
}

/**
 * Monitor RECAP for federal filings related to specific entities
 */
export async function monitorRECAPFilings(entityName: string): Promise<CourtListenerCase[]> {
  const response = await searchCases({
    query: entityName,
    jurisdiction: 'federal',
    type: 'recap',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
    },
    limit: 50,
  });

  return response.results;
}

/**
 * Get full case details by ID
 */
export async function getCaseDetails(caseId: number) {
  try {
    const response = await fetch(`${COURTLISTENER_API_BASE}/opinions/${caseId}/`, {
      headers: {
        'Authorization': `Token ${COURTLISTENER_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch case ${caseId}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching case ${caseId}:`, error);
    throw error;
  }
}

/**
 * Set up real-time alerts for specific legal topics
 */
export async function createLegalAlert(params: {
  query: string;
  jurisdiction: 'georgia' | 'federal' | 'all';
  email?: string;
  webhookUrl?: string;
}) {
  // Free Law Project supports Webhooks for paid members ($10-$25/month)
  // For now, we'll store the alert in our database and poll manually
  
  const { data, error } = await supabase
    .from('legal_alerts')
    .insert({
      query: params.query,
      jurisdiction: params.jurisdiction,
      email: params.email,
      webhook_url: params.webhookUrl,
      created_at: new Date().toISOString(),
      active: true,
    });

  if (error) {
    console.error('Failed to create legal alert:', error);
    throw error;
  }

  return data;
}

/**
 * Poll for new cases matching saved alerts
 */
export async function checkLegalAlerts() {
  const { data: alerts, error } = await supabase
    .from('legal_alerts')
    .select('*')
    .eq('active', true);

  if (error || !alerts) {
    console.error('Failed to fetch alerts:', error);
    return;
  }

  for (const alert of alerts) {
    const results = await searchCases({
      query: alert.query,
      jurisdiction: alert.jurisdiction,
      dateRange: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 7 days
      },
      limit: 10,
    });

    if (results.count > 0) {
      // Send notification (email or webhook)
      await notifyLegalAlert(alert, results.results);
    }
  }
}

/**
 * Send notification for new cases matching alert
 */
async function notifyLegalAlert(alert: any, cases: CourtListenerCase[]) {
  // Log to database
  await supabase.from('legal_alert_notifications').insert({
    alert_id: alert.id,
    cases_found: cases.length,
    notification_sent_at: new Date().toISOString(),
  });

  // Send email if configured
  if (alert.email) {
    await supabase.functions.invoke('send-email', {
      body: {
        to: alert.email,
        subject: `Legal Alert: ${cases.length} new cases matching "${alert.query}"`,
        html: `
          <h2>Legal Alert Notification</h2>
          <p>New cases have been found matching your search: <strong>${alert.query}</strong></p>
          <ul>
            ${cases.map(c => `
              <li>
                <strong>${c.caseName}</strong><br>
                ${c.court} - ${c.dateFiled}<br>
                <a href="${c.absoluteUrl}">View Case</a>
              </li>
            `).join('')}
          </ul>
        `,
      },
    });
  }

  // Call webhook if configured
  if (alert.webhook_url) {
    await fetch(alert.webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alert, cases }),
    });
  }
}

/**
 * Log legal search for R.O.M.A.N. learning
 */
async function logLegalSearch(params: {
  query: string;
  jurisdiction: string;
  resultsCount: number;
  timestamp: string;
}) {
  await supabase.from('legal_research_log').insert({
    query: params.query,
    jurisdiction: params.jurisdiction,
    results_count: params.resultsCount,
    searched_at: params.timestamp,
  });
}

/**
 * Bulk download Georgia UCC case law for offline access
 */
export async function downloadGeorgiaUCCCaselaw() {
  // Free Law Project offers bulk data downloads
  // This would be a one-time operation to ingest historical data
  
  const bulkDataUrl = 'https://www.courtlistener.com/api/bulk-data/opinions/ga.tar.gz';
  
  console.log('Bulk download feature requires Free Law Project API access.');
  console.log(`Download URL: ${bulkDataUrl}`);
  console.log('For Odyssey-1: Extract, parse, and store in local database for offline research.');
  
  // Implementation would involve:
  // 1. Download .tar.gz file
  // 2. Extract JSON files
  // 3. Parse and filter for UCC-related cases
  // 4. Store in Supabase for fast local queries
}

// Export all functions
export default {
  searchCases,
  searchUCC1Cases,
  searchTrustCases,
  monitorRECAPFilings,
  getCaseDetails,
  createLegalAlert,
  checkLegalAlerts,
  downloadGeorgiaUCCCaselaw,
};
