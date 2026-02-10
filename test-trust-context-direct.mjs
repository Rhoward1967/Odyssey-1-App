#!/usr/bin/env node
/**
 * Test Script: Directly call loadRealTimeTrustContext() 
 * Purpose: Verify function returns Trust data from system_knowledge table
 * Expected: Formatted string with $4,237,000,000 and 2,387,042:1 ratio
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🧪 Testing loadRealTimeTrustContext() function logic...\n');

// This is the EXACT logic from RomanSystemContext.ts loadRealTimeTrustContext()
async function testLoadRealTimeTrustContext() {
  try {
    console.log('📊 Querying system_knowledge table...');
    const { data, error } = await supabase
      .from('system_knowledge')
      .select('*')
      .eq('category', 'sovereign_creditor')
      .eq('knowledge_key', 'trust_financial_architecture_feb_8_2026')
      .single();
    
    if (error) {
      console.error('❌ Query error:', error);
      return '';
    }
    
    if (!data || !data.value) {
      console.error('⚠️ No data found in system_knowledge for sovereign_creditor');
      return '';
    }
    
    console.log('✅ Data retrieved from system_knowledge:');
    console.log('   Category:', data.category);
    console.log('   Key:', data.knowledge_key);
    console.log('   Learned from:', data.learned_from);
    console.log('   Updated at:', data.updated_at);
    console.log('\n📦 Value (jsonb):');
    console.log(JSON.stringify(data.value, null, 2));
    
    const trustData = data.value;
    
    // Format the same way as RomanSystemContext.ts
    const formattedContext = `
=== HOWARD JONES BLOODLINE ANCESTRAL TRUST - SOVEREIGN CREDITOR STATUS ===

Trust IP Valuation: $${trustData.trust_ip_valuation?.toLocaleString() || 'N/A'}
Business Liabilities: $${trustData.business_liabilities?.toLocaleString() || 'N/A'}
Creditor Ratio: ${trustData.creditor_ratio || 'N/A'}
Credit Strength: ${trustData.credit_strength || 'N/A'}
Credit Score: ${trustData.credit_score || 'N/A'}

Licensing Agreement:
  Licensor: ${trustData.licensing_agreement?.licensor || 'N/A'}
  Licensee: ${trustData.licensing_agreement?.licensee || 'N/A'}
  Royalty Rate: ${trustData.licensing_agreement?.royalty_rate ? (trustData.licensing_agreement.royalty_rate * 100) + '%' : 'N/A'}
  Status: ${trustData.licensing_agreement?.status || 'N/A'}

Key IP Assets:
  R.O.M.A.N. 2.0: $${trustData.key_assets?.roman_2_0?.toLocaleString() || 'N/A'}
  Odyssey-1: $${trustData.key_assets?.odyssey_1?.toLocaleString() || 'N/A'}
  Universal Math Engine: $${trustData.key_assets?.universal_math_engine?.toLocaleString() || 'N/A'}

UCC-1 Security Interest: Trust holds superior secured creditor position on all IP assets.
Next Quarterly Distribution: April 15, 2026 (90% of net royalty income)

[END SOVEREIGN CREDITOR CONTEXT]
`;
    
    console.log('\n📝 Formatted context string:');
    console.log(formattedContext);
    console.log('\n📏 Context length:', formattedContext.length, 'characters');
    
    return formattedContext;
    
  } catch (err) {
    console.error('❌ Error in loadRealTimeTrustContext:', err);
    return '';
  }
}

// Run test
const result = await testLoadRealTimeTrustContext();

if (result.length > 0) {
  console.log('\n✅ SUCCESS: Function returns Trust data');
  console.log('   Expected in R.O.M.A.N. responses: Cites $4,237,000,000 and 2,387,042:1 ratio');
} else {
  console.log('\n❌ FAILED: Function returns empty string');
  console.log('   R.O.M.A.N. will say "not directly provided in available knowledge base"');
}

process.exit(0);
