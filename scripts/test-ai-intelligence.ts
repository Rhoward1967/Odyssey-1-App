/**
 * ============================================================================
 * TEST ROMAN AI INTELLIGENCE SYSTEM
 * ============================================================================
 * Tests the AI Technology Intelligence monitoring system
 * ============================================================================
 */

import { romanAIIntelligence } from './src/services/romanAIIntelligence';
import { supabase } from './src/services/supabase';

async function testAIIntelligence() {
  console.log('🧠 Testing R.O.M.A.N AI Intelligence System...\n');

  try {
    // 1. Test database connection
    console.log('1️⃣ Testing database connection...');
    const { data: testQuery, error: testError } = await supabase
      .from('ai_technology_tracking')
      .select('count');
    
    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      console.log('\n⚠️  Tables may not be deployed yet. Run migrations first!\n');
      return;
    }
    console.log('✅ Database connection successful\n');

    // 2. Check if tables exist and have data
    console.log('2️⃣ Checking AI Technology Intelligence tables...');
    
    const { data: advancements, error: advError } = await supabase
      .from('ai_technology_tracking')
      .select('*')
      .limit(5);
    
    if (advError) {
      console.error('❌ ai_technology_tracking table error:', advError.message);
    } else {
      console.log(`✅ ai_technology_tracking: ${advancements?.length || 0} records`);
    }

    const { data: models, error: modelsError } = await supabase
      .from('ai_model_benchmarks')
      .select('*');
    
    if (modelsError) {
      console.error('❌ ai_model_benchmarks table error:', modelsError.message);
    } else {
      console.log(`✅ ai_model_benchmarks: ${models?.length || 0} models`);
      if (models && models.length > 0) {
        console.log('   Pre-loaded models:');
        models.forEach(m => {
          console.log(`   - ${m.model_name} (${m.provider}): ${m.roman_rating}/100`);
        });
      }
    }

    const { data: papers, error: papersError } = await supabase
      .from('ai_research_papers')
      .select('*')
      .limit(5);
    
    if (papersError) {
      console.error('❌ ai_research_papers table error:', papersError.message);
    } else {
      console.log(`✅ ai_research_papers: ${papers?.length || 0} papers`);
    }

    const { data: evolution, error: evolError } = await supabase
      .from('roman_capability_evolution')
      .select('*')
      .limit(5);
    
    if (evolError) {
      console.error('❌ roman_capability_evolution table error:', evolError.message);
    } else {
      console.log(`✅ roman_capability_evolution: ${evolution?.length || 0} upgrades`);
    }

    const { data: predictions, error: predError } = await supabase
      .from('agi_timeline_predictions')
      .select('*');
    
    if (predError) {
      console.error('❌ agi_timeline_predictions table error:', predError.message);
    } else {
      console.log(`✅ agi_timeline_predictions: ${predictions?.length || 0} predictions`);
      if (predictions && predictions.length > 0) {
        console.log('   AGI Timeline:');
        predictions.forEach(p => {
          console.log(`   - ${p.predicted_year}: ${p.milestone_description} (${p.confidence_percentage}% confidence)`);
        });
      }
    }

    console.log('\n3️⃣ Testing SQL functions...');
    
    // Test get_recommended_models
    const { data: recommended, error: recError } = await supabase
      .rpc('get_recommended_models', { use_case: 'document_analysis' });
    
    if (recError) {
      console.error('❌ get_recommended_models failed:', recError.message);
    } else {
      console.log(`✅ get_recommended_models: ${recommended?.length || 0} recommendations`);
      if (recommended && recommended.length > 0) {
        console.log('   Best model for document_analysis:');
        const best = recommended[0];
        console.log(`   - ${best.model_name}: ${best.roman_rating}/100, $${best.cost_per_1k_input_tokens}/1K tokens`);
      }
    }

    // Test calculate_roman_evolution_score
    const { data: score, error: scoreError } = await supabase
      .rpc('calculate_roman_evolution_score');
    
    if (scoreError) {
      console.error('❌ calculate_roman_evolution_score failed:', scoreError.message);
    } else {
      console.log(`✅ ROMAN Evolution Score: ${score}/100`);
    }

    console.log('\n4️⃣ Testing AI Intelligence monitoring cycle...');
    console.log('⏳ Running daily cycle (this may take a minute)...');
    
    await romanAIIntelligence.runDailyCycle();
    
    console.log('✅ Daily cycle complete!');

    // Check for new data after cycle
    const { data: newAdvancements } = await supabase
      .from('ai_technology_tracking')
      .select('*')
      .order('detected_at', { ascending: false })
      .limit(3);
    
    if (newAdvancements && newAdvancements.length > 0) {
      console.log('\n   Latest AI advancements detected:');
      newAdvancements.forEach(adv => {
        console.log(`   - ${adv.title} (${adv.impact_level})`);
      });
    }

    console.log('\n============================================================================');
    console.log('✅ TEST COMPLETE - R.O.M.A.N AI Intelligence System is operational!');
    console.log('============================================================================\n');
    console.log('Next steps:');
    console.log('1. View AIIntelligenceDashboard in the app');
    console.log('2. Set up daily cron job for automatic monitoring');
    console.log('3. Review pending upgrades and approve beneficial ones\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.log('\nTroubleshooting:');
    console.log('1. Ensure migrations are deployed in Supabase Dashboard');
    console.log('2. Check Supabase connection in .env file');
    console.log('3. Verify service role key has necessary permissions\n');
  }
}

// Run test
testAIIntelligence();
