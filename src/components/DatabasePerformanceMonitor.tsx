import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Database, Activity, Clock, Zap, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

interface SlowQuery {
  query: string;
  duration: number;
  calls: number;
  table: string;
}

export function DatabasePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [slowQueries, setSlowQueries] = useState<SlowQuery[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      // Mock performance data - in real app would query pg_stat_statements
      const mockMetrics: PerformanceMetric[] = [
        { name: 'Query Response Time', value: 45, unit: 'ms', status: 'good', trend: 'stable' },
        { name: 'Connection Pool Usage', value: 72, unit: '%', status: 'warning', trend: 'up' },
        { name: 'Cache Hit Ratio', value: 94, unit: '%', status: 'good', trend: 'stable' },
        { name: 'Index Usage', value: 87, unit: '%', status: 'good', trend: 'up' },
        { name: 'Lock Wait Time', value: 12, unit: 'ms', status: 'good', trend: 'down' },
        { name: 'Dead Tuples', value: 3.2, unit: '%', status: 'warning', trend: 'up' }
      ];

      const mockSlowQueries: SlowQuery[] = [
        {
          query: 'SELECT * FROM documents WHERE user_id = $1',
          duration: 234,
          calls: 1250,
          table: 'documents'
        },
        {
          query: 'SELECT * FROM subscriptions JOIN users ON...',
          duration: 189,
          calls: 890,
          table: 'subscriptions'
        }
      ];

      setMetrics(mockMetrics);
      setSlowQueries(mockSlowQueries);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const optimizeQuery = async (query: SlowQuery) => {
    try {
      console.log('Optimizing query for table:', query.table);
      // Would implement query optimization
    } catch (error) {
      console.error('Optimization failed:', error);
    }
  };

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Performance Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <Button onClick={loadMetrics} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh Metrics'}
            </Button>
            {lastUpdate && (
              <span className="text-sm text-muted-foreground">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {metrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{metric.name}</span>
                    <Activity className={`h-4 w-4 ${getStatusColor(metric.status)}`} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{metric.value}</span>
                    <span className="text-sm text-muted-foreground">{metric.unit}</span>
                  </div>
                  {metric.name === 'Connection Pool Usage' && (
                    <Progress value={metric.value} className="mt-2" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Slow Queries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {slowQueries.map((query, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="space-y-1">
                        <code className="text-xs bg-muted p-1 rounded">
                          {query.query.substring(0, 60)}...
                        </code>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Table: {query.table}</span>
                          <span>Duration: {query.duration}ms</span>
                          <span>Calls: {query.calls}</span>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => optimizeQuery(query)}>
                        <Zap className="h-3 w-3 mr-1" />
                        Optimize
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}