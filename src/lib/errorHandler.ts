/**
 * Global Error Handler with Pattern Learning Integration
 * 
 * Use this throughout the app to handle errors consistently
 * and automatically learn from them.
 */

import { PatternLearningEngine } from '@/services/patternLearningEngine';
import { romanSupabase as supabase } from '@/services/romanSupabase';

// Initialize pattern learning engine (singleton)
let patternEngine: PatternLearningEngine | null = null;

function getPatternEngine(): PatternLearningEngine | null {
  if (!patternEngine) {
    try {
      const supabaseUrl = typeof process !== 'undefined' && process.env?.SUPABASE_URL
        ? process.env.SUPABASE_URL
        : (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL);
      
      const supabaseKey = typeof process !== 'undefined' && process.env?.SUPABASE_SERVICE_ROLE_KEY
        ? process.env.SUPABASE_SERVICE_ROLE_KEY
        : (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_SERVICE_ROLE_KEY);
      
      patternEngine = new PatternLearningEngine();
    } catch (err) {
      console.error('❌ Failed to initialize pattern learning engine:', err);
      return null;
    }
  }
  return patternEngine;
}

export interface ErrorHandlerOptions {
  /** Source component/service where error occurred */
  source: string;
  /** Error severity level */
  severity?: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  /** Additional metadata to log */
  metadata?: Record<string, any>;
  /** Whether to attempt auto-fix */
  attemptAutoFix?: boolean;
  /** Whether to log to console */
  silent?: boolean;
}

export interface ErrorHandlerResult {
  /** Whether error was logged successfully */
  logged: boolean;
  /** System log ID */
  logId?: number;
  /** Whether pattern was learned */
  learned: boolean;
  /** Whether auto-fix was applied */
  autoFixed: boolean;
  /** Auto-fix pattern details */
  fixPattern?: {
    pattern_id: string;
    pattern_signature: string;
    success_rate: number;
  };
}

/**
 * Handle error with automatic pattern learning and optional auto-fix
 * 
 * @example
 * ```typescript
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   const result = await handleError(error, {
 *     source: 'payment-service',
 *     severity: 'error',
 *     attemptAutoFix: true
 *   });
 *   
 *   if (result.autoFixed) {
 *     console.log('✅ Error auto-fixed!');
 *   }
 * }
 * ```
 */
export async function handleError(
  error: Error | unknown,
  options: ErrorHandlerOptions
): Promise<ErrorHandlerResult> {
  const {
    source,
    severity = 'error',
    metadata = {},
    attemptAutoFix = false,
    silent = false
  } = options;

  const result: ErrorHandlerResult = {
    logged: false,
    learned: false,
    autoFixed: false
  };

  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  if (!silent) {
    console.error(`❌ [${source}] ${errorMessage}`);
  }

  try {
    // Log error to system_logs (using only existing columns)
    const { data: logEntry, error: logError } = await supabase
      .from('system_logs')
      .insert({
        log_level: severity,
        message: `[${source}] ${errorMessage}`,
        metadata: {
          stack: errorStack,
          source,
          ...metadata
        }
      })
      .select()
      .single();

    if (logError || !logEntry) {
      // Silently fail logging to avoid cascading errors
      if (!silent) {
        console.warn('⚠️ Error logging skipped:', logError?.message);
      }
      return result;
    }

    result.logged = true;
    result.logId = logEntry.id;

    // Learn from error
    try {
      const engine = getPatternEngine();
      if (!engine) {
        if (!silent) {
          console.log('Pattern learning unavailable (missing credentials)');
        }
        return result;
      }

      const pattern = await engine.learnFromError(
        errorMessage,
        source,
        severity,
        logEntry.id
      );

      result.learned = !!pattern;

      if (!silent && pattern) {
        console.log(`📚 Pattern learned: ${pattern.pattern_signature}`);
      }

      // Attempt auto-fix if requested
      if (attemptAutoFix && pattern) {
        const fixResult = await engine.findAndApplyPattern(
          errorMessage,
          source,
          severity,
          logEntry.id
        );

        if (fixResult.applied && fixResult.pattern) {
          result.autoFixed = true;
          result.fixPattern = {
            pattern_id: fixResult.pattern.pattern_id,
            pattern_signature: fixResult.pattern.pattern_signature,
            success_rate: fixResult.pattern.success_rate
          };

          if (!silent) {
            console.log(`🔧 Auto-fix applied: ${fixResult.pattern.pattern_signature} (${fixResult.pattern.success_rate}% success rate)`);
          }

          // Log auto-fix to R.O.M.A.N. events
          await supabase.from('ops.roman_events').insert({
            event_type: 'auto_fix_applied',
            severity: 'info',
            source,
            description: `Auto-fix applied for ${source} error`,
            metadata: {
              pattern_id: fixResult.pattern.pattern_id,
              error_message: errorMessage,
              success_rate: fixResult.pattern.success_rate
            }
          });
        }
      }
    } catch (learnError) {
      if (!silent) {
        console.log('Pattern learning skipped:', learnError);
      }
    }

  } catch (handlerError) {
    console.error('Error handler failed:', handlerError);
  }

  return result;
}

/**
 * Create error boundary wrapper for async functions
 * 
 * @example
 * ```typescript
 * const safeFunction = withErrorHandler(
 *   async () => await riskyOperation(),
 *   { source: 'my-component', attemptAutoFix: true }
 * );
 * 
 * await safeFunction();
 * ```
 */
export function withErrorHandler<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: ErrorHandlerOptions
): (...args: Parameters<T>) => Promise<ReturnType<T> | null> {
  return async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      await handleError(error, options);
      return null;
    }
  };
}

/**
 * Get pattern learning statistics
 */
export async function getPatternStatistics(): Promise<Record<string, any>> {
  try {
    const engine = getPatternEngine();
    if (!engine) {
      return {
        total_patterns: 0,
        avg_success_rate: 0,
        total_applications: 0,
        recent_patterns: []
      };
    }
    return await engine.getStatistics();
  } catch (error) {
    console.error('Failed to get pattern statistics:', error);
    return {};
  }
}

export default {
  handleError,
  withErrorHandler,
  getPatternStatistics
};
