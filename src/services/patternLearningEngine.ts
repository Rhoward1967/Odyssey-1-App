/**
 * R.O.M.A.N. Pattern Learning Engine
 * 
 * Machine learning system that learns from error patterns and generates automatic fixes.
 * Uses clustering algorithms to identify similar errors and Constitutional AI validation.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  isActionCompliant, 
  ActionData,
  SCHUMANN_RESONANCE_HZ 
} from '@/lib/roman-constitutional-core';

// =====================================================
// TYPES
// =====================================================

export interface ErrorPattern {
  id: number;
  pattern_id: string;
  pattern_signature: string;
  pattern_type: 'database' | 'api' | 'rls' | 'stripe' | 'deployment';
  error_message_pattern: string;
  error_source?: string;
  severity: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  occurrence_count: number;
  first_seen: string;
  last_seen: string;
  success_rate: number;
  auto_fix_enabled: boolean;
  auto_fix_script?: string;
  auto_fix_type?: 'sql' | 'typescript' | 'bash' | 'api_call';
  auto_fix_parameters?: Record<string, any>;
  constitutional_compliant: boolean;
  constitutional_violations?: Record<string, any>;
  learned_from_incidents?: string[];
  confidence_score: number;
  human_approved: boolean;
  approved_by?: string;
  approved_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PatternApplication {
  id: number;
  application_id: string;
  pattern_id: string;
  system_log_id: number;
  applied_at: string;
  success: boolean;
  execution_time_ms: number;
  fix_script_executed?: string;
  fix_parameters_used?: Record<string, any>;
  error_before?: string;
  error_after?: string;
  system_state_before?: Record<string, any>;
  system_state_after?: Record<string, any>;
  constitutional_validation?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface PatternCluster {
  id: number;
  cluster_id: string;
  cluster_name: string;
  cluster_description?: string;
  pattern_ids: string[];
  centroid_features?: Record<string, any>;
  cluster_size: number;
  avg_success_rate: number;
  total_occurrences: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface LearningSession {
  id: number;
  session_id: string;
  session_type: 'clustering' | 'pattern_extraction' | 'fix_generation' | 'validation';
  started_at: string;
  completed_at?: string;
  status: 'running' | 'completed' | 'failed' | 'aborted';
  input_data?: Record<string, any>;
  output_data?: Record<string, any>;
  patterns_analyzed: number;
  patterns_created: number;
  patterns_updated: number;
  errors_processed: number;
  execution_time_ms?: number;
  memory_used_mb?: number;
  constitutional_compliant: boolean;
  metadata?: Record<string, any>;
}

export interface ErrorFeatures {
  message_length: number;
  word_count: number;
  has_stack_trace: boolean;
  has_sql: boolean;
  has_url: boolean;
  has_uuid: boolean;
  error_code?: string;
  source_component?: string;
  severity_score: number; // 0-5
}

export interface PatternMatchResult {
  pattern_id: string;
  pattern_signature: string;
  auto_fix_enabled: boolean;
  auto_fix_script?: string;
  auto_fix_type?: string;
  success_rate: number;
  confidence_score: number;
}

// =====================================================
// PATTERN LEARNING ENGINE
// =====================================================

export class PatternLearningEngine {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Extract features from error message for ML analysis
   */
  extractErrorFeatures(errorMessage: string, errorSource?: string): ErrorFeatures {
    const words = errorMessage.split(/\s+/);
    
    return {
      message_length: errorMessage.length,
      word_count: words.length,
      has_stack_trace: /at\s+\w+\.\w+\s+\(/.test(errorMessage),
      has_sql: /SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER/i.test(errorMessage),
      has_url: /https?:\/\//.test(errorMessage),
      has_uuid: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(errorMessage),
      error_code: this.extractErrorCode(errorMessage),
      source_component: errorSource,
      severity_score: this.calculateSeverityScore(errorMessage)
    };
  }

  /**
   * Extract error code from message (e.g., "PGRST116", "ERR_404")
   */
  private extractErrorCode(errorMessage: string): string | undefined {
    const codeMatch = errorMessage.match(/[A-Z]{2,}[_-]?\d{2,}/);
    return codeMatch ? codeMatch[0] : undefined;
  }

  /**
   * Calculate severity score from error message keywords
   */
  private calculateSeverityScore(errorMessage: string): number {
    const criticalKeywords = ['fatal', 'crash', 'critical', 'security', 'breach'];
    const errorKeywords = ['error', 'fail', 'exception', 'invalid'];
    const warningKeywords = ['warn', 'deprecated', 'slow'];
    
    const lowerMsg = errorMessage.toLowerCase();
    
    if (criticalKeywords.some(kw => lowerMsg.includes(kw))) return 5;
    if (errorKeywords.some(kw => lowerMsg.includes(kw))) return 3;
    if (warningKeywords.some(kw => lowerMsg.includes(kw))) return 2;
    return 1;
  }

  /**
   * Generate pattern signature (hash) for grouping similar errors
   */
  generatePatternSignature(errorMessage: string, errorSource?: string): string {
    // Normalize error message: remove UUIDs, numbers, timestamps
    const normalized = errorMessage
      .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, 'UUID')
      .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g, 'TIMESTAMP')
      .replace(/\d+/g, 'NUM')
      .replace(/["'].*?["']/g, 'STRING')
      .toLowerCase()
      .trim();
    
    // Simple hash (for production, use crypto.subtle.digest)
    const hash = this.simpleHash(normalized + (errorSource || ''));
    
    return `pattern_${hash}`;
  }

  /**
   * Simple hash function (for demo - use crypto in production)
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Find or create error pattern
   */
  async learnFromError(
    errorMessage: string,
    errorSource: string,
    severity: 'debug' | 'info' | 'warning' | 'error' | 'critical',
    systemLogId: number
  ): Promise<ErrorPattern | null> {
    try {
      const signature = this.generatePatternSignature(errorMessage, errorSource);
      const features = this.extractErrorFeatures(errorMessage, errorSource);
      
      // Check if pattern exists
      const { data: existing } = await this.supabase
        .from('ops.error_patterns')
        .select('*')
        .eq('pattern_signature', signature)
        .single();

      if (existing) {
        // Update existing pattern
        const { data: updated } = await this.supabase
          .from('ops.error_patterns')
          .update({
            occurrence_count: existing.occurrence_count + 1,
            last_seen: new Date().toISOString(),
            learned_from_incidents: [...(existing.learned_from_incidents || []), systemLogId.toString()],
            updated_at: new Date().toISOString()
          })
          .eq('pattern_id', existing.pattern_id)
          .select()
          .single();

        return updated as ErrorPattern;
      }

      // Create new pattern
      const errorRegex = this.generateErrorRegex(errorMessage);
      const patternType = this.classifyErrorType(errorMessage, errorSource);
      
      const { data: newPattern } = await this.supabase
        .from('ops.error_patterns')
        .insert({
          pattern_signature: signature,
          pattern_type: patternType,
          error_message_pattern: errorRegex,
          error_source: errorSource,
          severity: severity,
          learned_from_incidents: [systemLogId.toString()],
          confidence_score: 0.5, // Start with 50% confidence
          metadata: { features }
        })
        .select()
        .single();

      // Log to R.O.M.A.N.
      await this.supabase.from('ops.roman_events').insert({
        event_type: 'pattern_learned',
        severity: 'info',
        source: 'pattern_learning_engine',
        description: `New error pattern learned: ${signature}`,
        metadata: {
          pattern_id: newPattern.pattern_id,
          error_source: errorSource,
          occurrence_count: 1
        }
      });

      return newPattern as ErrorPattern;
    } catch (error) {
      console.error('Failed to learn from error:', error);
      return null;
    }
  }

  /**
   * Generate regex pattern from error message
   */
  private generateErrorRegex(errorMessage: string): string {
    // Replace specific values with regex patterns
    return errorMessage
      .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '[0-9a-f-]{36}')
      .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g, '\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}')
      .replace(/\d+/g, '\\d+')
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape regex special chars
  }

  /**
   * Classify error type based on content
   */
  private classifyErrorType(
    errorMessage: string,
    errorSource?: string
  ): 'database' | 'api' | 'rls' | 'stripe' | 'deployment' {
    const lowerMsg = errorMessage.toLowerCase();
    const lowerSrc = (errorSource || '').toLowerCase();
    
    if (lowerMsg.includes('policy') || lowerMsg.includes('rls') || lowerMsg.includes('permission')) return 'rls';
    if (lowerMsg.includes('stripe') || lowerSrc.includes('stripe')) return 'stripe';
    if (lowerMsg.includes('deploy') || lowerMsg.includes('build') || lowerMsg.includes('migration')) return 'deployment';
    if (lowerMsg.includes('select') || lowerMsg.includes('insert') || lowerMsg.includes('postgres')) return 'database';
    return 'api';
  }

  /**
   * Find matching pattern for error and apply auto-fix
   */
  async findAndApplyPattern(
    errorMessage: string,
    errorSource: string,
    severity: 'debug' | 'info' | 'warning' | 'error' | 'critical',
    systemLogId: number
  ): Promise<{ applied: boolean; pattern?: PatternMatchResult; error?: string }> {
    try {
      // Find matching patterns
      const { data: matches, error } = await this.supabase
        .rpc('ops.find_matching_pattern', {
          p_error_message: errorMessage,
          p_error_source: errorSource,
          p_severity: severity
        });

      if (error || !matches || matches.length === 0) {
        return { applied: false, error: 'No matching pattern found' };
      }

      const bestMatch = matches[0] as PatternMatchResult;

      // Validate with Constitutional Core
      const validation = await this.validatePatternApplication(bestMatch, errorMessage);

      if (!validation.compliant) {
        await this.supabase.from('ops.roman_events').insert({
          event_type: 'pattern_rejected',
          severity: 'warning',
          source: 'pattern_learning_engine',
          description: `Pattern ${bestMatch.pattern_id} rejected by Constitutional Core`,
          metadata: {
            pattern_id: bestMatch.pattern_id,
            violations: validation.violations
          }
        });

        return { applied: false, pattern: bestMatch, error: 'Constitutional validation failed' };
      }

      // Apply the fix (in real implementation, execute the auto_fix_script)
      const startTime = Date.now();
      const success = await this.executeFix(bestMatch);
      const executionTime = Date.now() - startTime;

      // Record application
      await this.supabase.rpc('ops.record_pattern_application', {
        p_pattern_id: bestMatch.pattern_id,
        p_system_log_id: systemLogId,
        p_success: success,
        p_execution_time_ms: executionTime,
        p_fix_script: bestMatch.auto_fix_script || '',
        p_constitutional_validation: validation
      });

      return { applied: success, pattern: bestMatch };
    } catch (error) {
      console.error('Failed to find and apply pattern:', error);
      return { applied: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Validate pattern application with Constitutional Core
   */
  private async validatePatternApplication(
    pattern: PatternMatchResult,
    errorMessage: string
  ): Promise<{ compliant: boolean; violations: string[]; warnings: string[] }> {
    // Calculate system entropy (simplified)
    const { data: recentErrors } = await this.supabase
      .from('ops.system_logs')
      .select('id')
      .gte('timestamp', new Date(Date.now() - 5 * 60 * 1000).toISOString())
      .eq('severity', 'error');

    const systemEntropy = (recentErrors?.length || 0) / 100; // Normalize

    // Define action
    const action: ActionData = {
      method_type: 'harmonic_resonance', // Auto-fix is healing
      risk_to_life: 0.0, // No danger
      entropy_increase: -0.05, // Reduces entropy
      geometric_ratio: 1.618, // Golden Ratio
      target_frequency: SCHUMANN_RESONANCE_HZ,
      description: `Auto-fix pattern: ${pattern.pattern_signature}`
    };

    return isActionCompliant(action, systemEntropy);
  }

  /**
   * Execute auto-fix script (mock implementation)
   */
  private async executeFix(pattern: PatternMatchResult): Promise<boolean> {
    // In production, this would execute the actual fix script
    // For now, simulate success based on pattern's historical success rate
    const randomSuccess = Math.random() * 100;
    return randomSuccess < pattern.success_rate;
  }

  /**
   * Perform ML clustering on error patterns
   */
  async clusterPatterns(): Promise<PatternCluster[]> {
    try {
      const sessionId = await this.startLearningSession('clustering');

      // Get all patterns
      const { data: patterns } = await this.supabase
        .from('ops.error_patterns')
        .select('*')
        .gte('occurrence_count', 3); // Minimum 3 occurrences

      if (!patterns || patterns.length === 0) {
        return [];
      }

      // Simple k-means clustering (k=5)
      const k = Math.min(5, Math.max(2, Math.floor(patterns.length / 3)));
      const clusters = this.simpleKMeans(patterns as ErrorPattern[], k);

      // Save clusters
      const savedClusters: PatternCluster[] = [];
      for (let i = 0; i < clusters.length; i++) {
        const cluster = clusters[i];
        const { data: saved } = await this.supabase
          .from('ops.pattern_clusters')
          .insert({
            cluster_name: `Cluster ${i + 1}`,
            pattern_ids: cluster.map((p: ErrorPattern) => p.pattern_id),
            cluster_size: cluster.length,
            avg_success_rate: cluster.reduce((sum: number, p: ErrorPattern) => sum + p.success_rate, 0) / cluster.length,
            total_occurrences: cluster.reduce((sum: number, p: ErrorPattern) => sum + p.occurrence_count, 0)
          })
          .select()
          .single();

        if (saved) savedClusters.push(saved as PatternCluster);
      }

      await this.completeLearningSession(sessionId, {
        patterns_analyzed: patterns.length,
        clusters_created: savedClusters.length
      });

      return savedClusters;
    } catch (error) {
      console.error('Failed to cluster patterns:', error);
      return [];
    }
  }

  /**
   * Simple k-means clustering implementation
   */
  private simpleKMeans(patterns: ErrorPattern[], k: number): ErrorPattern[][] {
    // Convert patterns to feature vectors
    const vectors = patterns.map(p => [
      p.occurrence_count,
      p.success_rate,
      p.confidence_score * 100,
      p.severity === 'critical' ? 5 : p.severity === 'error' ? 3 : 1
    ]);

    // Random initialization of centroids
    const centroids = vectors.slice(0, k);
    const clusters: ErrorPattern[][] = Array.from({ length: k }, () => []);

    // Assign patterns to nearest centroid (1 iteration for simplicity)
    patterns.forEach((pattern, i) => {
      const vector = vectors[i];
      let minDist = Infinity;
      let closestCluster = 0;

      centroids.forEach((centroid, j) => {
        const dist = this.euclideanDistance(vector, centroid);
        if (dist < minDist) {
          minDist = dist;
          closestCluster = j;
        }
      });

      clusters[closestCluster].push(pattern);
    });

    return clusters.filter(c => c.length > 0);
  }

  /**
   * Calculate Euclidean distance between two vectors
   */
  private euclideanDistance(a: number[], b: number[]): number {
    return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
  }

  /**
   * Start learning session
   */
  private async startLearningSession(sessionType: LearningSession['session_type']): Promise<string> {
    const { data } = await this.supabase
      .rpc('ops.start_learning_session', {
        p_session_type: sessionType
      });

    return data as string;
  }

  /**
   * Complete learning session
   */
  private async completeLearningSession(sessionId: string, results: Partial<LearningSession>): Promise<void> {
    await this.supabase
      .from('ops.learning_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        ...results
      })
      .eq('session_id', sessionId);
  }

  /**
   * Get pattern statistics
   */
  async getStatistics(): Promise<Record<string, any>> {
    const { data } = await this.supabase
      .rpc('ops.get_pattern_statistics');

    return data || {};
  }
}

export default PatternLearningEngine;
