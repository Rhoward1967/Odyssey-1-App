import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabaseClient';
import {
  getActiveAlerts,
  getPerformanceSnapshot,
  getSystemHealth,
  type PerformanceSnapshot,
  type SystemAlert
} from '@/services/systemTelemetry';
import {
  Activity, AlertTriangle,
  Brain,
  CheckCircle2,
  Database,
  DollarSign,
  Server,
  Shield,
  TrendingDown,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

/**
 * SYSTEM OBSERVABILITY DASHBOARD
 * 
 * Real-time monitoring for ODYSSEY-1, R.O.M.A.N., and all subsystems
 */

export default function SystemObservabilityDashboard() {
  const [snapshot, setSnapshot] = useState<PerformanceSnapshot | null>(null);
  const [health, setHealth] = useState<any>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [romanMetrics, setRomanMetrics] = useState<any>(null);
  const [complianceScore, setComplianceScore] = useState<any>(null);
  const [topFeatures, setTopFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadDashboardData();

    if (autoRefresh) {
      const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load all metrics in parallel
      const [
        snapshotData,
        healthData,
        alertsData,
        romanData,
        complianceData,
        featuresData
      ] = await Promise.all([
        getPerformanceSnapshot(),
        getSystemHealth(),
        getActiveAlerts(),
        fetchRomanMetrics(),
        fetchComplianceScore(),
        fetchTopFeatures()
      ]);

      setSnapshot(snapshotData);
      setHealth(healthData);
      setAlerts(alertsData);
      setRomanMetrics(romanData);
      setComplianceScore(complianceData);
      setTopFeatures(featuresData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRomanMetrics = async () => {
    const { data, error } = await supabase.rpc('get_roman_accuracy', {
      time_range: '7 days'
    });
    return error ? null : data;
  };

  const fetchComplianceScore = async () => {
    const { data, error } = await supabase.rpc('get_compliance_score', {
      time_range: '30 days'
    });
    return error ? null : (data && data[0]);
  };

  const fetchTopFeatures = async () => {
    const { data, error } = await supabase.rpc('get_top_features', {
      time_range: '7 days',
      limit_count: 10
    });
    return error ? [] : data;
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthBadge = (status: string) => {
    const colors = {
      healthy: 'bg-green-100 text-green-800',
      degraded: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-red-100 text-red-800'
    };
    return <Badge className={colors[status as keyof typeof colors]}>{status.toUpperCase()}</Badge>;
  };

  if (loading && !snapshot) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">Loading system telemetry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Observability</h1>
          <p className="text-gray-600 mt-1">Real-time monitoring for ODYSSEY-1 ecosystem</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={loadDashboardData}
            variant="outline"
            size="sm"
          >
            <Activity className="h-4 w-4 mr-2" />
            Refresh Now
          </Button>
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
          >
            {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <Card className="border-l-4 border-l-blue-600">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Server className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Overall system status and uptime</CardDescription>
              </div>
            </div>
            {health && getHealthBadge(health.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-4xl font-bold ${health && getHealthColor(health.status)}`}>
                {health?.uptime_percent.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 mt-1">Uptime (24h)</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">
                {snapshot?.active_users_now || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">
                {snapshot?.avg_response_time_ms.toFixed(0)}ms
              </div>
              <div className="text-sm text-gray-600 mt-1">Avg Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">
                {snapshot?.error_rate_percent.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 mt-1">Error Rate</div>
            </div>
          </div>

          {health && health.issues.length > 0 && (
            <Alert className="mt-4 border-yellow-300 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription>
                <strong>Issues Detected:</strong>
                <ul className="list-disc list-inside mt-2">
                  {health.issues.map((issue: string, idx: number) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card className="border-l-4 border-l-red-600">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <div>
                <CardTitle>Active Alerts ({alerts.length})</CardTitle>
                <CardDescription>Unresolved system alerts requiring attention</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.slice(0, 5).map((alert) => (
                <Alert key={alert.alert_id} className="border-red-200 bg-red-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-red-100 text-red-800">
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-gray-600 mt-1">{alert.alert_type}</p>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics Tabs */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="roman">R.O.M.A.N. AI</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              icon={<Zap className="h-5 w-5" />}
              title="Response Time"
              value={`${snapshot?.avg_response_time_ms.toFixed(0)}ms`}
              subtitle="Average"
              trend={snapshot?.avg_response_time_ms < 500 ? 'up' : 'down'}
            />
            <MetricCard
              icon={<Activity className="h-5 w-5" />}
              title="Requests/sec"
              value={snapshot?.requests_per_second.toFixed(1)}
              subtitle="Throughput"
              trend="up"
            />
            <MetricCard
              icon={<Database className="h-5 w-5" />}
              title="DB Query Time"
              value={`${snapshot?.database_query_time_ms.toFixed(0)}ms`}
              subtitle="Average"
              trend={snapshot?.database_query_time_ms < 100 ? 'up' : 'down'}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Percentiles</CardTitle>
              <CardDescription>Response time distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-bold">{snapshot?.avg_response_time_ms.toFixed(0)}ms</div>
                  <div className="text-sm text-gray-600">Average (P50)</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{snapshot?.p95_response_time_ms.toFixed(0)}ms</div>
                  <div className="text-sm text-gray-600">95th Percentile</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{snapshot?.p99_response_time_ms.toFixed(0)}ms</div>
                  <div className="text-sm text-gray-600">99th Percentile</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* R.O.M.A.N. AI Tab */}
        <TabsContent value="roman" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Brain className="h-6 w-6 text-purple-600" />
                <div>
                  <CardTitle>R.O.M.A.N. AI Intelligence</CardTitle>
                  <CardDescription>Decision accuracy and performance (7 days)</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {romanMetrics && romanMetrics.length > 0 ? (
                <div className="space-y-4">
                  {romanMetrics.map((metric: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{metric.decision_type}</div>
                        <div className="text-sm text-gray-600">
                          {metric.total_decisions} decisions | Avg confidence: {(metric.avg_confidence * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {metric.accuracy_percent.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">Accuracy</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No AI decisions recorded yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              icon={<Shield className="h-5 w-5" />}
              title="Compliance Score"
              value={`${complianceScore?.compliance_score?.toFixed(1) || 0}%`}
              subtitle="Last 30 days"
              trend={complianceScore?.compliance_score > 90 ? 'up' : 'down'}
            />
            <MetricCard
              icon={<CheckCircle2 className="h-5 w-5" />}
              title="Passed Checks"
              value={complianceScore?.passed_checks || 0}
              subtitle={`of ${complianceScore?.total_checks || 0} total`}
              trend="up"
            />
            <MetricCard
              icon={<AlertTriangle className="h-5 w-5" />}
              title="Critical Violations"
              value={complianceScore?.critical_violations || 0}
              subtitle="Requires immediate action"
              trend={complianceScore?.critical_violations === 0 ? 'up' : 'down'}
            />
          </div>

          {complianceScore && complianceScore.remediation_rate && (
            <Card>
              <CardHeader>
                <CardTitle>Remediation Status</CardTitle>
                <CardDescription>Progress on fixing compliance issues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">
                    {complianceScore.remediation_rate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Issues Remediated</div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Features (7 days)</CardTitle>
              <CardDescription>Most used features and adoption rates</CardDescription>
            </CardHeader>
            <CardContent>
              {topFeatures.length > 0 ? (
                <div className="space-y-2">
                  {topFeatures.map((feature, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="font-medium">{feature.feature_name}</div>
                        <div className="text-sm text-gray-600">
                          {feature.unique_users} users | Success rate: {feature.success_rate?.toFixed(1)}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">{feature.usage_count}</div>
                        <div className="text-xs text-gray-600">uses</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No feature usage data yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Tab */}
        <TabsContent value="business" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              icon={<DollarSign className="h-5 w-5" />}
              title="Revenue Today"
              value={`$${snapshot?.revenue_today.toFixed(2) || '0.00'}`}
              subtitle="Total revenue"
              trend="up"
            />
            <MetricCard
              icon={<TrendingDown className="h-5 w-5" />}
              title="Costs Today"
              value={`$${snapshot?.costs_today.toFixed(2) || '0.00'}`}
              subtitle="Operating costs"
              trend="down"
            />
            <MetricCard
              icon={<TrendingUp className="h-5 w-5" />}
              title="Net Profit"
              value={`$${snapshot?.net_profit_today.toFixed(2) || '0.00'}`}
              subtitle="Revenue - Costs"
              trend={snapshot?.net_profit_today > 0 ? 'up' : 'down'}
            />
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>New user registrations</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">
                  {snapshot?.new_users_today || 0}
                </div>
                <div className="text-sm text-gray-600 mt-1">New Users Today</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper component for metric cards
function MetricCard({ 
  icon, 
  title, 
  value, 
  subtitle, 
  trend 
}: { 
  icon: React.ReactNode; 
  title: string; 
  value: string | number; 
  subtitle: string; 
  trend: 'up' | 'down';
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <div className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>
            {icon}
          </div>
          {trend === 'up' ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-gray-600">{title}</div>
        <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
      </CardContent>
    </Card>
  );
}
