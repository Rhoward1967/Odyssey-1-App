/**
 * SYSTEM TELEMETRY & OBSERVABILITY SERVICE
 * 
 * Comprehensive monitoring for ODYSSEY-1 ecosystem:
 * - Real-time performance metrics
 * - Error tracking and alerting
 * - User behavior analytics
 * - System health monitoring
 * - Cost tracking
 * - Feature usage analytics
 */

import { supabase } from '@/lib/supabase';

// ============================================================================
// METRIC TYPES
// ============================================================================

export interface SystemMetric {
  metric_id?: string;
  timestamp: Date;
  metric_type: MetricType;
  metric_name: string;
  metric_value: number;
  unit: string;
  dimensions?: Record<string, any>;
  metadata?: Record<string, any>;
}

export type MetricType = 
  | 'performance'      // Response times, latency, throughput
  | 'availability'     // Uptime, downtime, health checks
  | 'reliability'      // Error rates, success rates, retries
  | 'usage'           // Feature adoption, user engagement
  | 'business'        // Revenue, costs, conversions
  | 'security'        // Auth attempts, violations, threats
  | 'ai_intelligence' // R.O.M.A.N. decisions, accuracy
  | 'compliance';     // Policy checks, violations

export interface SystemAlert {
  alert_id?: string;
  timestamp: Date;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  alert_type: string;
  message: string;
  details: Record<string, any>;
  resolved: boolean;
  resolved_at?: Date;
  resolved_by?: string;
}

export interface PerformanceSnapshot {
  timestamp: Date;
  
  // API Performance
  avg_response_time_ms: number;
  p95_response_time_ms: number;
  p99_response_time_ms: number;
  requests_per_second: number;
  error_rate_percent: number;
  
  // System Health
  cpu_usage_percent: number;
  memory_usage_percent: number;
  active_connections: number;
  database_query_time_ms: number;
  
  // User Activity
  active_users_now: number;
  active_sessions: number;
  new_users_today: number;
  
  // Business Metrics
  revenue_today: number;
  costs_today: number;
  net_profit_today: number;
}

// ============================================================================
// TELEMETRY SERVICE
// ============================================================================

export class SystemTelemetryService {
  private static instance: SystemTelemetryService;
  private metricsBuffer: SystemMetric[] = [];
  private flushInterval: number = 10000; // Flush every 10 seconds
  private flushTimer?: NodeJS.Timeout;

  private constructor() {
    this.startFlushTimer();
  }

  static getInstance(): SystemTelemetryService {
    if (!SystemTelemetryService.instance) {
      SystemTelemetryService.instance = new SystemTelemetryService();
    }
    return SystemTelemetryService.instance;
  }

  // ==========================================================================
  // METRIC RECORDING
  // ==========================================================================

  /**
   * Record a single metric (buffered, auto-flushes)
   */
  recordMetric(
    metricType: MetricType,
    metricName: string,
    value: number,
    unit: string,
    dimensions?: Record<string, any>,
    metadata?: Record<string, any>
  ): void {
    const metric: SystemMetric = {
      timestamp: new Date(),
      metric_type: metricType,
      metric_name: metricName,
      metric_value: value,
      unit: unit,
      dimensions: dimensions || {},
      metadata: metadata || {}
    };

    this.metricsBuffer.push(metric);

    // Auto-flush if buffer gets large
    if (this.metricsBuffer.length >= 100) {
      this.flush();
    }
  }

  /**
   * Record performance metric (response time, latency, etc.)
   */
  recordPerformance(
    operationName: string,
    durationMs: number,
    success: boolean,
    metadata?: Record<string, any>
  ): void {
    this.recordMetric(
      'performance',
      `${operationName}_duration`,
      durationMs,
      'milliseconds',
      { operation: operationName, success },
      metadata
    );

    // Also record success/failure count
    this.recordMetric(
      'reliability',
      `${operationName}_${success ? 'success' : 'failure'}`,
      1,
      'count',
      { operation: operationName, success }
    );
  }

  /**
   * Record AI intelligence metric (R.O.M.A.N. decisions)
   */
  recordAIIntelligence(
    decisionType: string,
    confidenceScore: number,
    outcome: 'correct' | 'incorrect' | 'pending',
    metadata?: Record<string, any>
  ): void {
    this.recordMetric(
      'ai_intelligence',
      `roman_decision_${decisionType}`,
      confidenceScore,
      'confidence_score',
      { decision_type: decisionType, outcome },
      metadata
    );
  }

  /**
   * Record compliance check
   */
  recordCompliance(
    checkType: string,
    passed: boolean,
    severityLevel: string,
    metadata?: Record<string, any>
  ): void {
    this.recordMetric(
      'compliance',
      `compliance_check_${checkType}`,
      passed ? 1 : 0,
      'boolean',
      { check_type: checkType, passed, severity: severityLevel },
      metadata
    );
  }

  /**
   * Record user engagement
   */
  recordUsage(
    featureName: string,
    userId?: string,
    metadata?: Record<string, any>
  ): void {
    this.recordMetric(
      'usage',
      `feature_usage_${featureName}`,
      1,
      'count',
      { feature: featureName, user_id: userId },
      metadata
    );
  }

  /**
   * Record business metric (revenue, cost)
   */
  recordBusiness(
    metricName: string,
    amount: number,
    currency: string = 'USD',
    metadata?: Record<string, any>
  ): void {
    this.recordMetric(
      'business',
      metricName,
      amount,
      currency,
      { currency },
      metadata
    );
  }

  // ==========================================================================
  // ALERTING
  // ==========================================================================

  /**
   * Create system alert
   */
  async createAlert(
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info',
    alertType: string,
    message: string,
    details: Record<string, any>
  ): Promise<void> {
    const alert: SystemAlert = {
      timestamp: new Date(),
      severity,
      alert_type: alertType,
      message,
      details,
      resolved: false
    };

    const { error } = await supabase
      .from('system_alerts')
      .insert([alert]);

    if (error) {
      console.error('Failed to create alert:', error);
    }

    // If critical, could trigger additional notifications (email, SMS, Slack)
    if (severity === 'critical') {
      console.error(`🚨 CRITICAL ALERT: ${message}`, details);
      // TODO: Send to external monitoring service (PagerDuty, etc.)
    }
  }

  /**
   * Resolve alert
   */
  async resolveAlert(alertId: string, resolvedBy: string): Promise<void> {
    const { error } = await supabase
      .from('system_alerts')
      .update({
        resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by: resolvedBy
      })
      .eq('alert_id', alertId);

    if (error) {
      console.error('Failed to resolve alert:', error);
    }
  }

  // ==========================================================================
  // PERFORMANCE MONITORING
  // ==========================================================================

  /**
   * Time an async operation and record metrics
   */
  async timeOperation<T>(
    operationName: string,
    operation: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = performance.now();
    let success = true;
    let result: T;

    try {
      result = await operation();
    } catch (error) {
      success = false;
      throw error;
    } finally {
      const duration = performance.now() - startTime;
      this.recordPerformance(operationName, duration, success, metadata);
    }

    return result!;
  }

  /**
   * Get current performance snapshot
   */
  async getPerformanceSnapshot(): Promise<PerformanceSnapshot> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Query aggregated metrics for today
    const { data: metrics, error } = await supabase
      .from('system_metrics')
      .select('*')
      .gte('timestamp', startOfDay.toISOString());

    if (error) {
      console.error('Failed to fetch metrics:', error);
      throw error;
    }

    // Calculate aggregates
    const performanceMetrics = metrics?.filter(m => m.metric_type === 'performance') || [];
    const responseTimes = performanceMetrics
      .filter(m => m.metric_name.includes('duration'))
      .map(m => m.metric_value);

    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

    const sortedTimes = [...responseTimes].sort((a, b) => a - b);
    const p95Index = Math.floor(sortedTimes.length * 0.95);
    const p99Index = Math.floor(sortedTimes.length * 0.99);

    // Get active users from sessions
    const { data: activeSessions } = await supabase
      .from('user_sessions')
      .select('user_id')
      .gte('last_activity', new Date(Date.now() - 15 * 60 * 1000).toISOString()); // Active in last 15 min

    // Get business metrics
    const businessMetrics = metrics?.filter(m => m.metric_type === 'business') || [];
    const revenue = businessMetrics
      .filter(m => m.metric_name.includes('revenue'))
      .reduce((sum, m) => sum + m.metric_value, 0);
    const costs = businessMetrics
      .filter(m => m.metric_name.includes('cost'))
      .reduce((sum, m) => sum + m.metric_value, 0);

    return {
      timestamp: now,
      avg_response_time_ms: avgResponseTime,
      p95_response_time_ms: sortedTimes[p95Index] || 0,
      p99_response_time_ms: sortedTimes[p99Index] || 0,
      requests_per_second: performanceMetrics.length / ((Date.now() - startOfDay.getTime()) / 1000),
      error_rate_percent: this.calculateErrorRate(metrics || []),
      cpu_usage_percent: 0, // Would need system-level monitoring
      memory_usage_percent: 0, // Would need system-level monitoring
      active_connections: activeSessions?.length || 0,
      database_query_time_ms: this.calculateAvgQueryTime(metrics || []),
      active_users_now: activeSessions?.length || 0,
      active_sessions: activeSessions?.length || 0,
      new_users_today: await this.getNewUsersToday(),
      revenue_today: revenue,
      costs_today: costs,
      net_profit_today: revenue - costs
    };
  }

  // ==========================================================================
  // ANALYTICS QUERIES
  // ==========================================================================

  /**
   * Get metrics by type and time range
   */
  async getMetrics(
    metricType: MetricType,
    startDate: Date,
    endDate: Date,
    metricName?: string
  ): Promise<SystemMetric[]> {
    let query = supabase
      .from('system_metrics')
      .select('*')
      .eq('metric_type', metricType)
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())
      .order('timestamp', { ascending: true });

    if (metricName) {
      query = query.eq('metric_name', metricName);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch metrics:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get unresolved alerts
   */
  async getActiveAlerts(severityFilter?: string): Promise<SystemAlert[]> {
    let query = supabase
      .from('system_alerts')
      .select('*')
      .eq('resolved', false)
      .order('timestamp', { ascending: false });

    if (severityFilter) {
      query = query.eq('severity', severityFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch alerts:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'critical';
    issues: string[];
    uptime_percent: number;
    last_incident?: Date;
  }> {
    const snapshot = await this.getPerformanceSnapshot();
    const activeAlerts = await this.getActiveAlerts();
    
    const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');
    const highAlerts = activeAlerts.filter(a => a.severity === 'high');

    let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
    const issues: string[] = [];

    // Determine health status
    if (criticalAlerts.length > 0) {
      status = 'critical';
      issues.push(`${criticalAlerts.length} critical alerts`);
    } else if (highAlerts.length > 0 || snapshot.error_rate_percent > 5) {
      status = 'degraded';
      if (highAlerts.length > 0) issues.push(`${highAlerts.length} high severity alerts`);
      if (snapshot.error_rate_percent > 5) issues.push(`High error rate: ${snapshot.error_rate_percent.toFixed(1)}%`);
    }

    if (snapshot.avg_response_time_ms > 1000) {
      status = status === 'healthy' ? 'degraded' : status;
      issues.push(`Slow response time: ${snapshot.avg_response_time_ms.toFixed(0)}ms`);
    }

    // Calculate uptime (simplified - would need more sophisticated tracking)
    const uptimePercent = 100 - snapshot.error_rate_percent;

    return {
      status,
      issues,
      uptime_percent: uptimePercent,
      last_incident: criticalAlerts[0]?.timestamp
    };
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private calculateErrorRate(metrics: SystemMetric[]): number {
    const reliabilityMetrics = metrics.filter(m => m.metric_type === 'reliability');
    const failures = reliabilityMetrics.filter(m => m.metric_name.includes('failure')).length;
    const total = reliabilityMetrics.length;
    return total > 0 ? (failures / total) * 100 : 0;
  }

  private calculateAvgQueryTime(metrics: SystemMetric[]): number {
    const dbMetrics = metrics.filter(m => 
      m.metric_name.includes('database') || m.metric_name.includes('query')
    );
    if (dbMetrics.length === 0) return 0;
    return dbMetrics.reduce((sum, m) => sum + m.metric_value, 0) / dbMetrics.length;
  }

  private async getNewUsersToday(): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfDay.toISOString());

    if (error) {
      console.error('Failed to count new users:', error);
      return 0;
    }

    return count || 0;
  }

  /**
   * Flush buffered metrics to database
   */
  private async flush(): Promise<void> {
    if (this.metricsBuffer.length === 0) return;

    const metricsToFlush = [...this.metricsBuffer];
    this.metricsBuffer = [];

    const { error } = await supabase
      .from('system_metrics')
      .insert(metricsToFlush);

    if (error) {
      console.error('Failed to flush metrics:', error);
      // Put metrics back in buffer if flush failed
      this.metricsBuffer.unshift(...metricsToFlush);
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * Stop telemetry service (cleanup)
   */
  stop(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush(); // Final flush
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

const telemetry = SystemTelemetryService.getInstance();

export const recordMetric = telemetry.recordMetric.bind(telemetry);
export const recordPerformance = telemetry.recordPerformance.bind(telemetry);
export const recordAIIntelligence = telemetry.recordAIIntelligence.bind(telemetry);
export const recordCompliance = telemetry.recordCompliance.bind(telemetry);
export const recordUsage = telemetry.recordUsage.bind(telemetry);
export const recordBusiness = telemetry.recordBusiness.bind(telemetry);
export const createAlert = telemetry.createAlert.bind(telemetry);
export const timeOperation = telemetry.timeOperation.bind(telemetry);
export const getPerformanceSnapshot = telemetry.getPerformanceSnapshot.bind(telemetry);
export const getSystemHealth = telemetry.getSystemHealth.bind(telemetry);
export const getMetrics = telemetry.getMetrics.bind(telemetry);
export const getActiveAlerts = telemetry.getActiveAlerts.bind(telemetry);

export default telemetry;
