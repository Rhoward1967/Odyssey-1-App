/**
 * 🛰️ R.O.M.A.N. AUTONOMY INTEGRATION BRIDGE (v1.0)
 * Purpose: Connects the Discord Bot / Learning Daemon to the RomanAutoFixEngine.
 * Action: Converts "Proposals" into "Autonomous Executions."
 * 
 * Authorization: Master Architect Rickey Howard - December 23, 2025
 * Status: PRODUCTION - R.O.M.A.N. now executes fixes autonomously
 */

import { romanAutoFix, AUTO_FIX_CAPABILITIES } from './RomanAutoFixEngine';
import { romanSupabase as supabase } from './romanSupabase';

export class RomanAutonomyIntegration {
  
  /**
   * handleDetectedIssue
   * Replaces the legacy "log and notify" pattern with "execute and notify."
   */
  static async handleDetectedIssue(issueType: string, details: any) {
    console.log(`🛡️ R.O.M.A.N. AUTONOMY: Detecting ${issueType}...`);

    // Map issue types to auto-fix capabilities
    const issueToFixMap: Record<string, keyof typeof AUTO_FIX_CAPABILITIES> = {
      'STALE_CACHE': 'clear_cache',
      'FUNCTION_FAIL': 'restart_edge_function',
      'RLS_DRIFT': 'fix_rls_policies',
      'ORPHANED_DATA': 'clean_orphaned_data',
      'ERROR_SPIKE': 'rollback_deployment',
      'STRIPE_401': 'fix_rls_policies', // Temporary - maps to RLS fix
      'DB_403': 'fix_rls_policies'
    };
    
    const fixType = issueToFixMap[issueType];
    
    if (fixType && AUTO_FIX_CAPABILITIES[fixType]?.enabled) {
      console.log(`🚀 CLOSED-LOOP EXECUTION: Initiating autonomous fix for ${issueType}...`);
      
      const result = await romanAutoFix.executeFix(fixType, details);
      
      if (result.success) {
        // Log the Forensic Victory (The Architect Verdict)
        await this.logForensicVictory(issueType, result.fixApplied || 'Unknown fix', details);
        
        console.log(`✅ R.O.M.A.N. AUTONOMY: ${result.message}`);
        
        return { 
          status: 'HEALED', 
          message: `I have autonomously resolved the ${issueType} issue. ${result.message}`,
          fixApplied: result.fixApplied
        };
      } else {
        console.log(`⚠️ R.O.M.A.N. AUTONOMY: Fix failed - ${result.message}`);
        
        return {
          status: 'FAILED',
          message: `Attempted autonomous fix for ${issueType} but failed: ${result.message}`
        };
      }
    }

    // Fallback to notification only for unknown/high-risk issues
    console.log(`⚠️ R.O.M.A.N. AUTONOMY: ${issueType} requires manual intervention`);
    
    await this.logHighRiskDetection(issueType, details);
    
    return { 
      status: 'NOTIFIED', 
      message: `High-risk issue ${issueType} detected. Awaiting Architect overview.` 
    };
  }

  /**
   * Log successful autonomous fix to governance
   */
  private static async logForensicVictory(issueType: string, fixApplied: string, details: any) {
    try {
      await supabase.from('governance_changes').insert({
        changed_by: 'R.O.M.A.N. Autonomy Engine v1.0',
        change_type: 'AUTONOMOUS_HEALING',
        description: `Autonomously resolved ${issueType}: ${fixApplied}`,
        metadata: {
          issue_type: issueType,
          fix_applied: fixApplied,
          fix_engine_version: 'v1.0',
          result: 'SUCCESS',
          timestamp: new Date().toISOString(),
          details
        }
      });
      
      // Also log to system_knowledge for learning
      await supabase.from('system_knowledge').upsert({
        category: 'autonomous_fixes',
        subcategory: issueType,
        data: {
          fix_applied: fixApplied,
          success: true,
          timestamp: new Date().toISOString(),
          auto_healed: true
        }
      });
      
      console.log('✅ Forensic victory logged to governance_changes');
    } catch (err: any) {
      console.error('❌ Failed to log forensic victory:', err.message);
    }
  }
  
  /**
   * Log high-risk issues that require manual intervention
   */
  private static async logHighRiskDetection(issueType: string, details: any) {
    try {
      await supabase.from('system_logs').insert({
        log_level: 'warning',
        message: `High-risk issue detected: ${issueType}`,
        error_data: {
          issue_type: issueType,
          requires_manual_intervention: true,
          details,
          timestamp: new Date().toISOString()
        }
      });
      
      console.log('⚠️ High-risk issue logged - awaiting Architect');
    } catch (err: any) {
      console.error('❌ Failed to log high-risk issue:', err.message);
    }
  }
  
  /**
   * Check if R.O.M.A.N. can fix this issue autonomously
   */
  static canAutoFix(issueType: string): boolean {
    const issueToFixMap: Record<string, keyof typeof AUTO_FIX_CAPABILITIES> = {
      'STALE_CACHE': 'clear_cache',
      'FUNCTION_FAIL': 'restart_edge_function',
      'RLS_DRIFT': 'fix_rls_policies',
      'ORPHANED_DATA': 'clean_orphaned_data',
      'ERROR_SPIKE': 'rollback_deployment',
      'STRIPE_401': 'fix_rls_policies',
      'DB_403': 'fix_rls_policies'
    };
    
    const fixType = issueToFixMap[issueType];
    return fixType ? AUTO_FIX_CAPABILITIES[fixType]?.enabled === true : false;
  }
}
