/**
 * R.O.M.A.N. TRUST DATA VERIFICATION SCRIPT
 * 
 * © 2026 Rickey A Howard. All Rights Reserved.
 * Property of Rickey A Howard
 * 
 * Run this script to verify that R.O.M.A.N. is operating on current trust data,
 * not stale 2025 information
 * 
 * Usage:
 *   npx tsx verify-roman-trust-data.mts
 */

import { RomanBusinessEntityLoader } from './src/services/RomanBusinessEntityLoader';

async function verifyRomanTrustData() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('🔍 R.O.M.A.N. TRUST DATA VERIFICATION');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  try {
    console.log('📚 LOADING LATEST TRUST DATA...\n');
    
    // Load the actual trust data from database
    const trustData = await RomanBusinessEntityLoader.loadLatestTrustData();
    
    if (!trustData) {
      console.error('❌ ERROR: Could not load trust data from database');
      process.exit(1);
    }

    // Display what R.O.M.A.N. knows
    console.log('✅ TRUST DATA LOADED FROM DATABASE:\n');
    console.log(`   Trust Name: ${trustData.trust_name}`);
    console.log(`   Trust ID: ${trustData.trust_id}`);
    console.log(`   Status: ${trustData.status}`);
    console.log(`   Established: ${trustData.established_date}`);
    console.log(`   Governing Law: ${trustData.governing_law}\n`);

    console.log('💰 VALUATIONS:');
    console.log(`   • Tier 1 (Optimistic): $${(trustData.valuation_tier_1_optimistic / 1000000000).toFixed(2)}B`);
    console.log(`   • Tier 2 (Market): $${(trustData.valuation_tier_2_market / 1000000).toFixed(0)}M`);
    console.log(`   • Tier 3 (Conservative): $${(trustData.valuation_tier_3_conservative / 1000000).toFixed(0)}M\n`);

    console.log('🔐 UCC-1 TRIPLE-LOCK:');
    console.log(`   • Total Combined Lien: $${(trustData.ucc1_combined_lien / 1000).toFixed(0)}K`);
    console.log(`   • Number of Filings: ${trustData.ucc1_filings.length}`);
    trustData.ucc1_filings.forEach((filing, i) => {
      console.log(`     ${i + 1}. ${filing.filing_number} (${filing.filing_id})`);
      console.log(`        Amount: $${(filing.amount / 1000).toFixed(0)}K | Date: ${filing.date}`);
      console.log(`        Secured Party: ${filing.secured_party}`);
      console.log(`        Debtor: ${filing.debtor}\n`);
    });

    console.log('👥 TRUSTEES:');
    console.log(`   Co-Trustees: ${trustData.co_trustees.join(', ')}`);
    console.log(`   Successors: ${trustData.successor_trustees.join(', ')}\n`);

    // Get human-readable summary
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('\n📋 FULL TRUST SUMMARY FOR R.O.M.A.N. CONTEXT:\n');
    const summary = await RomanBusinessEntityLoader.getTrustSummaryForContext();
    console.log(summary);

    // Verification checklist
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('\n✅ VERIFICATION CHECKLIST:\n');
    
    const checks = [
      { name: 'Trust Name (Should be BLOODLINE)', pass: trustData.trust_name.includes('BLOODLINE'), expected: 'BLOODLINE', actual: trustData.trust_name },
      { name: 'Valuation Tier 1 (Should be $6.71B)', pass: trustData.valuation_tier_1_optimistic === 6710000000, expected: '$6.71B', actual: `$${(trustData.valuation_tier_1_optimistic / 1000000000).toFixed(2)}B` },
      { name: 'Valuation Tier 2 (Should be $950M)', pass: trustData.valuation_tier_2_market === 950000000, expected: '$950M', actual: `$${(trustData.valuation_tier_2_market / 1000000).toFixed(0)}M` },
      { name: 'Valuation Tier 3 (Should be $366M)', pass: trustData.valuation_tier_3_conservative === 366000000, expected: '$366M', actual: `$${(trustData.valuation_tier_3_conservative / 1000000).toFixed(0)}M` },
      { name: 'UCC-1 Combined Lien (Should be $1.05M)', pass: trustData.ucc1_combined_lien === 1050000, expected: '$1.05M', actual: `$${(trustData.ucc1_combined_lien / 1000).toFixed(0)}K` },
      { name: 'UCC-1 Filing Count (Should be 3)', pass: trustData.ucc1_filings.length === 3, expected: '3', actual: trustData.ucc1_filings.length.toString() },
      { name: 'Co-Trustee: Christla Howard', pass: trustData.co_trustees.includes('Christla Howard'), expected: 'Christla Howard', actual: trustData.co_trustees.join(', ') },
      { name: 'Co-Trustee: Teara Howard', pass: trustData.co_trustees.includes('Teara Howard'), expected: 'Teara Howard', actual: trustData.co_trustees.join(', ') },
      { name: 'Successor: Kenneth Howard', pass: trustData.successor_trustees.includes('Kenneth Howard'), expected: 'Kenneth Howard', actual: trustData.successor_trustees.join(', ') },
      { name: 'Successor: Joseph Lumpkin Jr', pass: trustData.successor_trustees.includes('Joseph Lumpkin Jr'), expected: 'Joseph Lumpkin Jr', actual: trustData.successor_trustees.join(', ') },
      { name: 'Established Date (Should be 2026-01-07)', pass: trustData.established_date === '2026-01-07', expected: '2026-01-07', actual: trustData.established_date }
    ];

    let allPass = true;
    checks.forEach((check) => {
      const status = check.pass ? '✅' : '❌';
      console.log(`${status} ${check.name}`);
      if (!check.pass) {
        console.log(`   Expected: ${check.expected}`);
        console.log(`   Actual: ${check.actual}`);
        allPass = false;
      }
    });

    console.log('\n═══════════════════════════════════════════════════════════════════');
    
    if (allPass) {
      console.log('✅ ALL CHECKS PASSED - R.O.M.A.N. IS OPERATING ON CURRENT DATA');
      console.log('═══════════════════════════════════════════════════════════════════\n');
      process.exit(0);
    } else {
      console.log('❌ SOME CHECKS FAILED - R.O.M.A.N. NEEDS DATA UPDATE');
      console.log('═══════════════════════════════════════════════════════════════════\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Exception during verification:', error);
    process.exit(1);
  }
}

verifyRomanTrustData();
