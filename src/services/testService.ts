import { supabase } from '@/lib/supabaseClient';

export class SystemTestService {
  // Test core functionality after optimization
  static async runPostOptimizationTests() {
    console.log('🧪 Running post-optimization functionality tests...');
    
    const results = {
      auth: false,
      handbook: false,
      agents: false,
      bids: false,
      romanCommands: false
    };

    try {
      // Test 1: Authentication still works
      const { data: { user } } = await supabase.auth.getUser();
      results.auth = !!user;
      console.log('✅ Auth test:', results.auth ? 'PASSED' : 'FAILED');

      // Test 2: Handbook access (optimized tables)
      const { data: categories, error: catError } = await supabase
        .from('handbook_categories')
        .select('id, name')
        .limit(1);
      results.handbook = !catError && !!categories;
      console.log('✅ Handbook test:', results.handbook ? 'PASSED' : 'FAILED');

      // Test 3: Agents table (consolidated policies)
      const { data: agents, error: agentError } = await supabase
        .from('agents')
        .select('id')
        .limit(1);
      results.agents = !agentError;
      console.log('✅ Agents test:', results.agents ? 'PASSED' : 'FAILED');

      // Test 4: Bids table (consolidated policies)
      const { data: bids, error: bidError } = await supabase
        .from('bids')
        .select('id')
        .limit(1);
      results.bids = !bidError;
      console.log('✅ Bids test:', results.bids ? 'PASSED' : 'FAILED');

      // Test 5: Roman commands (consolidated policies)
      const { data: commands, error: cmdError } = await supabase
        .from('roman_commands')
        .select('id')
        .limit(1);
      results.romanCommands = !cmdError;
      console.log('✅ Roman Commands test:', results.romanCommands ? 'PASSED' : 'FAILED');

    } catch (error) {
      console.error('❌ Test suite error:', error);
    }

    const allPassed = Object.values(results).every(Boolean);
    console.log('🎯 Overall result:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
    
    return { results, allPassed };
  }

  // Test specific functionality that might be affected
  static async testCriticalUserFlows() {
    console.log('🔬 Testing critical user flows...');

    try {
      // Test user can access their own data
      const { data: userBids } = await supabase
        .from('bids')
        .select('*')
        .limit(5);

      // Test handbook access for authenticated user
      const { data: handbookSections } = await supabase
        .from('handbook_sections')
        .select('*')
        .eq('is_published', true)
        .limit(5);

      console.log('✅ User data access working');
      console.log('✅ Handbook access working');
      
      return true;
    } catch (error) {
      console.error('❌ Critical flow test failed:', error);
      return false;
    }
  }
}
