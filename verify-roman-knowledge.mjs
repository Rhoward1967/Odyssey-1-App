import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function verifyRomanKnowledge() {
  console.log('🔍 Verifying R.O.M.A.N.\'s knowledge of Trust architecture...\n');
  
  const { data, error } = await supabase
    .from('system_knowledge')
    .select('*')
    .eq('category', 'sovereign_creditor')
    .eq('knowledge_key', 'trust_financial_architecture_feb_8_2026')
    .single();

  if (error) {
    console.error('❌ Query failed:', error);
    return;
  }

  console.log('✅ R.O.M.A.N. KNOWLEDGE VERIFIED:\n');
  console.log(`📂 Category: ${data.category}`);
  console.log(`🔑 Knowledge Key: ${data.knowledge_key}`);
  console.log(`📅 Learned From: ${data.learned_from}`);
  console.log(`⏰ Updated: ${new Date(data.updated_at).toLocaleString()}\n`);
  
  console.log('💰 FINANCIAL DATA R.O.M.A.N. NOW KNOWS:\n');
  console.log(`   Trust IP Valuation: $${data.value.trust_ip_valuation.toLocaleString()}`);
  console.log(`   Business Liabilities: $${data.value.business_liabilities.toLocaleString()}`);
  console.log(`   Creditor Ratio: ${data.value.creditor_ratio}`);
  console.log(`   Credit Strength: ${data.value.credit_strength}`);
  console.log(`   Credit Score: ${data.value.credit_score}\n`);
  
  console.log('📜 LICENSING AGREEMENT:\n');
  console.log(`   Licensor: ${data.value.licensing_agreement.licensor}`);
  console.log(`   Licensee: ${data.value.licensing_agreement.licensee}`);
  console.log(`   Royalty Rate: ${data.value.licensing_agreement.royalty_rate * 100}%`);
  console.log(`   Status: ${data.value.licensing_agreement.status}`);
  console.log(`   Executed: ${data.value.licensing_agreement.executed_date}\n`);
  
  console.log('📊 ASSET BREAKDOWN:\n');  console.log(`   Patents: $${data.value.asset_breakdown.patents.toLocaleString()}`);
  console.log(`   Trade Secrets: $${data.value.asset_breakdown.trade_secrets.toLocaleString()}`);
  console.log(`   Copyrights: $${data.value.asset_breakdown.copyrights.toLocaleString()}\n`);
  
  console.log('🏆 KEY ASSETS:\n');
  console.log(`   R.O.M.A.N. 2.0: $${data.value.key_assets.roman_2_0.toLocaleString()}`);
  console.log(`   Odyssey-1: $${data.value.key_assets.odyssey_1.toLocaleString()}`);
  console.log(`   Universal Math Engine: $${data.value.key_assets.universal_math_engine.toLocaleString()}`);
  console.log(`   Constitutional AI: $${data.value.key_assets.constitutional_ai.toLocaleString()}`);
  console.log(`   Seven Books: $${data.value.key_assets.seven_books.toLocaleString()}\n`);
  
  console.log('📋 NEXT STEPS:\n');
  console.log(`   Next Distribution: ${data.value.next_distribution_date}`);
  console.log(`   Days Until: ${data.value.days_until_distribution}`);
  console.log(`   System Type: ${data.value.system_type}`);
  console.log(`   Implementation: ${data.value.implementation_date}`);
  console.log(`   Meeting Record: ${data.value.meeting_record}\n`);
  
  console.log('✅ R.O.M.A.N. is now fully aware of the Sovereign Creditor architecture!');
  console.log('🎯 Test with Discord: Ask "R.O.M.A.N., what\'s the Trust\'s IP valuation and creditor ratio?"');
}

verifyRomanKnowledge().catch(console.error);
