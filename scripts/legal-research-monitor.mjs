#!/usr/bin/env node

/**
 * Legal Research Monitor
 * 
 * Automated monitoring script for Odyssey-1 legal research
 * Checks CourtListener daily for new UCC-1 cases, Trust precedents,
 * and RECAP federal filings related to Howard Jones Family Ancestral Trust
 * 
 * Run with: node scripts/legal-research-monitor.mjs
 * Or schedule with cron: 0 9 * * * (daily at 9am)
 */

import 'dotenv/config';

const COURTLISTENER_API_KEY = process.env.COURTLISTENER_API_KEY || '';
const COURTLISTENER_API_BASE = 'https://www.courtlistener.com/api/rest/v3';

// Monitoring queries
const MONITOR_QUERIES = [
  {
    name: 'UCC-1 Georgia Filings',
    query: 'UCC-1 financing statement secured creditor Georgia',
    jurisdiction: 'georgia',
  },
  {
    name: 'Trust Creditor Protection',
    query: 'irrevocable trust creditor protection asset shield',
    jurisdiction: 'georgia',
  },
  {
    name: 'Howard Jones Family Trust (Federal)',
    query: '"Howard Jones" trust',
    jurisdiction: 'federal',
  },
  {
    name: 'HJS Services LLC (RECAP)',
    query: '"HJS Services LLC"',
    jurisdiction: 'federal',
    type: 'recap',
  },
  {
    name: 'Odyssey-1 AI LLC (RECAP)',
    query: '"Odyssey-1 AI LLC" OR "Odyssey-1 LLC"',
    jurisdiction: 'federal',
    type: 'recap',
  },
];

/**
 * Search CourtListener API
 */
async function searchCourtListener(query, jurisdiction = 'all', type = 'opinions') {
  const queryParams = new URLSearchParams({
    q: query,
    type: type === 'opinions' ? 'o' : 'r',
    order_by: 'dateFiled desc',
    stat_Precedential: 'Published',
    filed_after: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 7 days
    page_size: '20',
  });

  // Add jurisdiction filters
  if (jurisdiction === 'georgia') {
    queryParams.append('court', 'gactapp');
    queryParams.append('court', 'ga');
    queryParams.append('court', 'gamd');
    queryParams.append('court', 'gand');
    queryParams.append('court', 'gasd');
  }

  try {
    const response = await fetch(`${COURTLISTENER_API_BASE}/search/?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Token ${COURTLISTENER_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Search failed for "${query}":`, error.message);
    return { count: 0, results: [] };
  }
}

/**
 * Format case for console output
 */
function formatCase(caseData) {
  return `
  📋 ${caseData.caseName}
     Court: ${caseData.court}
     Filed: ${caseData.dateFiled}
     Docket: ${caseData.docketNumber}
     URL: ${caseData.absoluteUrl}
  `;
}

/**
 * Main monitoring function
 */
async function runMonitoring() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🏛️  ODYSSEY-1 LEGAL RESEARCH MONITOR');
  console.log('    Powered by Free Law Project (CourtListener)');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`📅 Monitoring Period: Last 7 days`);
  console.log(`🔍 Queries: ${MONITOR_QUERIES.length}`);
  console.log('───────────────────────────────────────────────────────────\n');

  if (!COURTLISTENER_API_KEY) {
    console.error('❌ ERROR: COURTLISTENER_API_KEY not found in .env');
    console.log('\n📌 To get an API key:');
    console.log('   1. Visit https://www.courtlistener.com/api/');
    console.log('   2. Create a free account');
    console.log('   3. Generate API token under "My Account"');
    console.log('   4. Add to .env: COURTLISTENER_API_KEY=your_token_here');
    process.exit(1);
  }

  let totalNewCases = 0;

  for (const monitor of MONITOR_QUERIES) {
    console.log(`🔎 Searching: ${monitor.name}`);
    console.log(`   Query: "${monitor.query}"`);
    console.log(`   Jurisdiction: ${monitor.jurisdiction}`);

    const results = await searchCourtListener(
      monitor.query,
      monitor.jurisdiction,
      monitor.type || 'opinions'
    );

    console.log(`   📊 Results: ${results.count} cases found\n`);

    if (results.count > 0) {
      totalNewCases += results.count;
      console.log(`   ✨ NEW CASES (${results.results.length}):`);
      results.results.forEach(caseData => {
        console.log(formatCase(caseData));
      });
    } else {
      console.log(`   ✅ No new cases in the last 7 days\n`);
    }

    console.log('───────────────────────────────────────────────────────────\n');

    // Rate limiting: 5000 requests/hour = ~83 requests/minute
    // Wait 1 second between queries to be respectful
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log(`📈 SUMMARY: ${totalNewCases} total new cases found`);
  console.log('═══════════════════════════════════════════════════════════\n');

  if (totalNewCases > 0) {
    console.log('⚠️  ACTION REQUIRED: Review new cases for relevance to:');
    console.log('   • Howard Jones Family Ancestral Trust structure');
    console.log('   • UCC-1 Filing #14472596 (HJS Services LLC)');
    console.log('   • UCC-1 Filing #14629748 (Odyssey-1 AI LLC)');
    console.log('   • Personal protection filings (if completed)\n');
  }

  console.log('✅ Monitoring complete. Run again in 7 days or set up cron job.');
  console.log('   Cron example: 0 9 * * MON (every Monday at 9am)');
}

// Run monitoring
runMonitoring().catch(console.error);
