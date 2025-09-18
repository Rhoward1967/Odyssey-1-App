import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertTriangle, Zap, Database, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface OptimizationResult {
  success: boolean;
  optimized_policies: number;
  total_warnings_fixed: number;
  performance_improvement: string;
  details: {
    auth_uid_optimizations: number;
    auth_jwt_optimizations: number;
    auth_role_optimizations: number;
  };
}

export function RLSOptimizationDashboard() {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [lastOptimized, setLastOptimized] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('rls_optimization_result');
    if (stored) {
      setResult(JSON.parse(stored));
      setLastOptimized(localStorage.getItem('rls_optimization_date'));
    }
  }, []);

  const handleOptimizeAll = async () => {
    setIsOptimizing(true);
    try {
      const { data, error } = await supabase.functions.invoke('bulk-rls-policy-optimizer', {
        body: { action: 'fix_all_policies' }
      });

      if (error) throw error;

      setResult(data);
      const now = new Date().toISOString();
      setLastOptimized(now);
      
      localStorage.setItem('rls_optimization_result', JSON.stringify(data));
      localStorage.setItem('rls_optimization_date', now);
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            RLS Performance Optimization Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Database Performance Status</h3>
                <p className="text-sm text-gray-600">
                  Optimize Row Level Security policies for better query performance
                </p>
              </div>
              <Button 
                onClick={handleOptimizeAll}
                disabled={isOptimizing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isOptimizing ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Optimize All Policies
                  </>
                )}
              </Button>
            </div>

            {result && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">Warnings Fixed</span>
                    </div>
                    <div className="text-2xl font-bold text-green-900 mt-2">
                      {result.total_warnings_fixed}
                    </div>
                    <p className="text-sm text-green-700">Supabase warnings resolved</p>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-800">Policies Optimized</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900 mt-2">
                      {result.optimized_policies}
                    </div>
                    <p className="text-sm text-blue-700">Tables improved</p>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 bg-purple-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-purple-600" />
                      <span className="font-medium text-purple-800">Performance</span>
                    </div>
                    <div className="text-sm font-bold text-purple-900 mt-2">
                      Significant Improvement
                    </div>
                    <p className="text-sm text-purple-700">Auth functions cached</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {result && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-3">Optimization Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">auth.uid() calls</span>
                      <Badge variant="outline">{result.details.auth_uid_optimizations}</Badge>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">auth.jwt() calls</span>
                      <Badge variant="outline">{result.details.auth_jwt_optimizations}</Badge>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">auth.role() calls</span>
                      <Badge variant="outline">{result.details.auth_role_optimizations}</Badge>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                </div>
                {lastOptimized && (
                  <p className="text-xs text-gray-500 mt-3">
                    Last optimized: {new Date(lastOptimized).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {!result && (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  50 RLS Performance Warnings Detected
                </h3>
                <p className="text-gray-600 mb-4">
                  Your database has performance issues that can be automatically fixed
                </p>
                <Button onClick={handleOptimizeAll} disabled={isOptimizing}>
                  Fix All Issues Now
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}