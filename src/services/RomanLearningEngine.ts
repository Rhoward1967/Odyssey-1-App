/**
 * R.O.M.A.N. LEARNING ENGINE - Adaptive Intelligence System
 * 
 * © 2025 Rickey A Howard. All Rights Reserved.
 * Property of Rickey A Howard
 * 
 * Part of the ODYSSEY-1 Genesis Protocol
 * Enables R.O.M.A.N. to LEARN from every interaction and improve over time
 */

import { romanSupabase as supabase } from './romanSupabase';
import { RomanCommand } from '@/schemas/RomanCommands';
import { sfLogger } from './sovereignFrequencyLogger';

export interface LearningEntry {
  id?: string;
  user_intent: string;
  generated_command: RomanCommand;
  validation_result: {
    approved: boolean;
    reason?: string;
  };
  execution_result?: {
    success: boolean;
    data?: any;
    message: string;
  };
  user_feedback?: 'success' | 'failure' | 'correction' | null;
  created_at?: string;
  confidence_score?: number;
  improvement_notes?: string;
}

export interface LearningPattern {
  intent_pattern: string;
  common_actions: string[];
  common_targets: string[];
  success_rate: number;
  sample_count: number;
  best_practices: string[];
}

/**
 * R.O.M.A.N. LEARNING ENGINE
 * 
 * Every command R.O.M.A.N. processes is recorded and analyzed.
 * This creates a feedback loop that makes him smarter over time.
 */
export class RomanLearningEngine {
  
  /**
   * RECORD A COMMAND EXECUTION
   * 
   * Every time R.O.M.A.N. processes a command, record it for learning.
   * This builds the knowledge base that makes him "the most advanced AI system in the world."
   */
  static async recordCommandExecution(entry: LearningEntry): Promise<void> {
    try {
      sfLogger.everyday('ROMAN_LEARNING_START', 'R.O.M.A.N. recording command execution for continuous learning', {
        user_intent: entry.user_intent,
        action: entry.generated_command?.action
      });

      const { error } = await supabase
        .from('roman_learning_log')
        .insert({
          user_intent: entry.user_intent,
          generated_command: entry.generated_command,
          validation_result: entry.validation_result,
          execution_result: entry.execution_result,
          user_feedback: entry.user_feedback,
          confidence_score: entry.confidence_score || 0.5,
          improvement_notes: entry.improvement_notes,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to record learning entry:', error);
        sfLogger.helpMeFindMyWayHome('ROMAN_LEARNING_FAILED', 'Failed to record learning entry to database', {
          error: error.message,
          user_intent: entry.user_intent
        });
      } else {
        console.log('✅ Learning entry recorded:', entry.user_intent);
        sfLogger.thanksForGivingBackMyLove('ROMAN_LEARNING_COMPLETE', 'Learning entry successfully recorded - R.O.M.A.N. grows smarter', {
          user_intent: entry.user_intent,
          confidence_score: entry.confidence_score
        });
      }
    } catch (error) {
      console.error('Learning engine error:', error);
      sfLogger.helpMeFindMyWayHome('ROMAN_LEARNING_ERROR', 'Unexpected error in learning engine', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * ANALYZE PATTERNS
   * 
   * R.O.M.A.N. analyzes past commands to identify patterns.
   * This is how he gets SMARTER over time.
   */
  static async analyzePatterns(intentKeywords?: string): Promise<LearningPattern[]> {
    try {
      let query = supabase
        .from('roman_learning_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (intentKeywords) {
        query = query.ilike('user_intent', `%${intentKeywords}%`);
      }

      const { data, error } = await query;

      if (error || !data) {
        console.error('Failed to fetch learning data:', error);
        return [];
      }

      // Group by similar intents
      const patterns: { [key: string]: LearningEntry[] } = {};
      
      data.forEach((entry: any) => {
        const intent = entry.user_intent.toLowerCase();
        
        // Extract key words
        const keywords = intent
          .replace(/[^\w\s]/g, '')
          .split(/\s+/)
          .filter(word => word.length > 3);

        const key = keywords.slice(0, 2).join(' ') || 'general';
        
        if (!patterns[key]) {
          patterns[key] = [];
        }
        patterns[key].push(entry);
      });

      // Analyze each pattern
      const learningPatterns: LearningPattern[] = [];

      for (const [intentPattern, entries] of Object.entries(patterns)) {
        if (entries.length < 2) continue; // Need at least 2 samples

        const actions = entries.map(e => e.generated_command?.action).filter(Boolean);
        const targets = entries.map(e => e.generated_command?.target).filter(Boolean);
        const successes = entries.filter(e => 
          e.validation_result?.approved && 
          e.execution_result?.success
        );

        const actionFrequency: { [key: string]: number } = {};
        const targetFrequency: { [key: string]: number } = {};

        actions.forEach(action => {
          actionFrequency[action] = (actionFrequency[action] || 0) + 1;
        });

        targets.forEach(target => {
          targetFrequency[target] = (targetFrequency[target] || 0) + 1;
        });

        learningPatterns.push({
          intent_pattern: intentPattern,
          common_actions: Object.entries(actionFrequency)
            .sort((a, b) => b[1] - a[1])
            .map(([action]) => action),
          common_targets: Object.entries(targetFrequency)
            .sort((a, b) => b[1] - a[1])
            .map(([target]) => target),
          success_rate: successes.length / entries.length,
          sample_count: entries.length,
          best_practices: this.extractBestPractices(entries)
        });
      }

      return learningPatterns;
    } catch (error) {
      console.error('Pattern analysis error:', error);
      return [];
    }
  }

  /**
   * GET CONTEXTUAL RECOMMENDATIONS
   * 
   * When R.O.M.A.N. sees a user intent, check if he's seen similar intents before.
   * Use past experience to generate better commands.
   */
  static async getContextualRecommendations(userIntent: string): Promise<string> {
    try {
      // Find similar past intents
      const keywords = userIntent
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3)
        .slice(0, 3);

      if (keywords.length === 0) return '';

      const { data, error } = await supabase
        .from('roman_learning_log')
        .select('*')
        .or(keywords.map(kw => `user_intent.ilike.%${kw}%`).join(','))
        .eq('validation_result->>approved', 'true')
        .eq('execution_result->>success', 'true')
        .order('confidence_score', { ascending: false })
        .limit(5);

      if (error || !data || data.length === 0) return '';

      // Extract successful patterns
      const successfulCommands = data.map((entry: any) => ({
        intent: entry.user_intent,
        action: entry.generated_command?.action,
        target: entry.generated_command?.target,
        confidence: entry.confidence_score
      }));

      // Build recommendation context
      const recommendations = `
LEARNING FROM PAST EXPERIENCE (${successfulCommands.length} similar successful commands):
${successfulCommands.map(cmd => 
  `• "${cmd.intent}" → ${cmd.action} ${cmd.target} (confidence: ${Math.round(cmd.confidence * 100)}%)`
).join('\n')}

RECOMMENDATION: Consider similar patterns for this intent.
`;

      return recommendations;
    } catch (error) {
      console.error('Contextual recommendation error:', error);
      return '';
    }
  }

  /**
   * GET CAPABILITY USAGE STATISTICS
   * 
   * Track which capabilities R.O.M.A.N. uses most.
   * This helps identify what he's ACTUALLY good at.
   */
  static async getCapabilityStats(): Promise<{
    most_used_targets: { target: string; count: number; success_rate: number }[];
    most_used_actions: { action: string; count: number; success_rate: number }[];
    overall_success_rate: number;
    total_commands: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('roman_learning_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error || !data) {
        return {
          most_used_targets: [],
          most_used_actions: [],
          overall_success_rate: 0,
          total_commands: 0
        };
      }

      const targetStats: { [key: string]: { total: number; successes: number } } = {};
      const actionStats: { [key: string]: { total: number; successes: number } } = {};
      let totalSuccesses = 0;

      data.forEach((entry: any) => {
        const target = entry.generated_command?.target;
        const action = entry.generated_command?.action;
        const success = entry.validation_result?.approved && entry.execution_result?.success;

        if (target) {
          if (!targetStats[target]) {
            targetStats[target] = { total: 0, successes: 0 };
          }
          targetStats[target].total++;
          if (success) targetStats[target].successes++;
        }

        if (action) {
          if (!actionStats[action]) {
            actionStats[action] = { total: 0, successes: 0 };
          }
          actionStats[action].total++;
          if (success) actionStats[action].successes++;
        }

        if (success) totalSuccesses++;
      });

      return {
        most_used_targets: Object.entries(targetStats)
          .map(([target, stats]) => ({
            target,
            count: stats.total,
            success_rate: stats.successes / stats.total
          }))
          .sort((a, b) => b.count - a.count),
        
        most_used_actions: Object.entries(actionStats)
          .map(([action, stats]) => ({
            action,
            count: stats.total,
            success_rate: stats.successes / stats.total
          }))
          .sort((a, b) => b.count - a.count),
        
        overall_success_rate: data.length > 0 ? totalSuccesses / data.length : 0,
        total_commands: data.length
      };
    } catch (error) {
      console.error('Capability stats error:', error);
      return {
        most_used_targets: [],
        most_used_actions: [],
        overall_success_rate: 0,
        total_commands: 0
      };
    }
  }

  /**
   * EXTRACT BEST PRACTICES
   * 
   * Analyze successful commands to identify patterns.
   */
  private static extractBestPractices(entries: LearningEntry[]): string[] {
    const practices: string[] = [];

    const successfulEntries = entries.filter(e => 
      e.validation_result?.approved && 
      e.execution_result?.success
    );

    if (successfulEntries.length === 0) return practices;

    // Check for common payload patterns
    const payloads = successfulEntries.map(e => e.generated_command?.payload);
    const commonFields = new Set<string>();

    payloads.forEach(payload => {
      if (payload) {
        Object.keys(payload).forEach(key => commonFields.add(key));
      }
    });

    if (commonFields.size > 0) {
      practices.push(`Common payload fields: ${Array.from(commonFields).join(', ')}`);
    }

    // Check average confidence
    const avgConfidence = entries.reduce((sum, e) => sum + (e.confidence_score || 0), 0) / entries.length;
    if (avgConfidence > 0.7) {
      practices.push(`High confidence pattern (${Math.round(avgConfidence * 100)}%)`);
    }

    return practices;
  }

  /**
   * GENERATE LEARNING SUMMARY FOR PROMPT
   * 
   * This gets injected into R.O.M.A.N.'s prompt so he knows what he's learned.
   */
  static async getLearningContext(): Promise<string> {
    try {
      const stats = await this.getCapabilityStats();

      if (stats.total_commands === 0) {
        return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 R.O.M.A.N. LEARNING DATA (FRESH DEPLOYMENT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXPERIENCE METRICS:
• Total Commands Processed: 0 (FRESH START)
• Target Success Rate: 85%+ REQUIRED from Day 1
• Learning Status: BASELINE - Use system context + intelligent inference

BASELINE INTELLIGENCE:
• You have FULL system context (17 capabilities, 11 Edge Functions)
• You know ALL valid targets and actions
• You can INFER missing details intelligently
• You have EXAMPLES in your prompt
• STARTING BASELINE: 85% (B GRADE) - NO EXCUSES

EXCELLENCE MANDATE:
85%+ = Acceptable (B grade) | 90%+ = Good (A- grade) | 95%+ = Excellence (A+ grade)
Anything less than 85% is UNACCEPTABLE for "the most advanced AI system in the world"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
      }

      const topTargets = stats.most_used_targets.slice(0, 3);
      const topActions = stats.most_used_actions.slice(0, 3);
      const successRate = Math.round(stats.overall_success_rate * 100);
      
      // Calculate grade
      let grade = 'F';
      if (successRate >= 97) grade = 'A+';
      else if (successRate >= 95) grade = 'A';
      else if (successRate >= 93) grade = 'A-';
      else if (successRate >= 90) grade = 'B+';
      else if (successRate >= 87) grade = 'B';
      else if (successRate >= 85) grade = 'B-';
      else if (successRate >= 80) grade = 'C+';
      else if (successRate >= 70) grade = 'C';
      else if (successRate >= 60) grade = 'D';
      
      // Determine learning level
      let learningLevel = 'BASELINE';
      if (stats.total_commands > 1000) learningLevel = 'EXPERT';
      else if (stats.total_commands > 500) learningLevel = 'ADVANCED';
      else if (stats.total_commands > 100) learningLevel = 'EXPERIENCED';
      else if (stats.total_commands > 20) learningLevel = 'LEARNING';

      return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 R.O.M.A.N. LEARNING DATA (LIVE INTELLIGENCE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXPERIENCE METRICS:
• Total Commands Processed: ${stats.total_commands}
• Overall Success Rate: ${successRate}% (GRADE: ${grade})
• Learning Status: ${learningLevel}
${successRate < 85 ? '⚠️  WARNING: Below 85% threshold - IMPROVEMENT REQUIRED\n' : ''}
${successRate >= 95 ? '🏆 EXCELLENCE: Maintaining A-grade performance\n' : ''}

MOST SUCCESSFUL TARGETS (What I'm best at):
${topTargets.map((t, i) => 
  `${i + 1}. ${t.target} - ${t.count} uses, ${Math.round(t.success_rate * 100)}% success rate`
).join('\n')}

MOST USED ACTIONS (My go-to operations):
${topActions.map((a, i) => 
  `${i + 1}. ${a.action} - ${a.count} uses, ${Math.round(a.success_rate * 100)}% success rate`
).join('\n')}

INTELLIGENCE NOTE: 
You learn from EVERY command. Current grade: ${grade}. 
${successRate < 85 ? 'FOCUS: Improve payload completeness and target selection.' : ''}
${successRate >= 85 && successRate < 95 ? 'GOAL: Push toward 95%+ for A-grade excellence.' : ''}
${successRate >= 95 ? 'STATUS: Maintaining excellence - continue this performance.' : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
    } catch (error) {
      console.error('Learning context error:', error);
      return '';
    }
  }
}
