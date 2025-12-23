import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabaseClient';

interface PerformanceMetrics {
  slow_queries: number;
  cache_hit_rate: number;
  avg_rows_per_call: number;
  recommendations: string[];
}

interface OptimizationResult {
  optimizations_applied: string[];
  estimated_improvement: string;
  cache_hit_improvement: string;
}

export default function DatabasePerformanceOptimizer() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [optimized, setOptimized] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);

  useEffect(() => {
    loadPerformanceMetrics();
  }, []);

  const loadPerformanceMetrics = async () => {
    try {
      const { data } = await supabase.functions.invoke('database-performance-optimizer', {
        body: { action: 'analyze_performance' }
      });
      
      if (data?.success) {
        setMetrics(data.data);
      }
    } catch (error) {
      console.error('Failed to load performance metrics:', error);
    }
  };

  const optimizeDatabase = async () => {
    setOptimizing(true);
    try {
      const { data } = await supabase.functions.invoke('database-performance-optimizer', {
        body: { action: 'optimize_queries' }
      });
      
      if (data?.success) {
        setResult(data.data);
        setOptimized(true);
        // Reload metrics to show improvement
        setTimeout(loadPerformanceMetrics, 1000);
      }
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setOptimizing(false);
    }
  };

  const clearCache = async () => {
    try {
      await supabase.functions.invoke('database-performance-optimizer', {
        body: { action: 'get_schema_info', schema: 'public', force_refresh: true }
      });
      loadPerformanceMetrics();
    } catch (error) {
      console.error('Cache clear failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Database Performance Optimizer</h2>
        <div className="flex gap-2">
          <Button onClick={clearCache} variant="outline">Clear Cache</Button>
          <Button onClick={optimizeDatabase} disabled={optimizing}>
            {optimizing ? 'Optimizing...' : 'Optimize Now'}
          </Button>
        </div>
      </div>

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Slow Queries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{metrics.slow_queries}</div>
              <Badge variant={metrics.slow_queries > 10 ? "destructive" : "secondary"}>
                {metrics.slow_queries > 10 ? "High" : "Normal"}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{metrics.cache_hit_rate}%</div>
              <Progress value={metrics.cache_hit_rate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Avg Rows/Call</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.avg_rows_per_call}</div>
              <Badge variant="outline">Efficient</Badge>
            </CardContent>
          </Card>
        </div>
      )}

      {metrics?.recommendations && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {metrics.recommendations.map((rec, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {optimized && result && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Optimization Complete!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Applied Optimizations:</h4>
                <ul className="space-y-1">
                  {result.optimizations_applied.map((opt, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      {opt}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Performance Improvement</div>
                  <div className="font-semibold text-green-700">{result.estimated_improvement}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Cache Hit Rate</div>
                  <div className="font-semibold text-green-700">{result.cache_hit_improvement}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}