import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Zap, Database, Shield, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface PolicyIssue {
  table: string;
  issues: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export default function AutomatedPolicyOptimization() {
  const [issues, setIssues] = useState<PolicyIssue[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [fixProgress, setFixProgress] = useState(0);
  const [lastScan, setLastScan] = useState<Date | null>(null);

  const scanForIssues = async () => {
    setIsScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke('bulk-rls-policy-optimizer', {
        body: { action: 'scan' }
      });
      
      if (error) throw error;
      setIssues(data.issues);
      setLastScan(new Date());
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const fixAllIssues = async () => {
    setIsFixing(true);
    setFixProgress(0);
    
    try {
      const tables = issues.map(issue => issue.table);
      
      for (let i = 0; i < tables.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing
        setFixProgress(((i + 1) / tables.length) * 100);
      }

      const { data, error } = await supabase.functions.invoke('bulk-rls-policy-optimizer', {
        body: { action: 'fix', tables }
      });
      
      if (error) throw error;
      
      // Clear issues after successful fix
      setIssues([]);
      setLastScan(new Date());
    } catch (error) {
      console.error('Fix failed:', error);
    } finally {
      setIsFixing(false);
      setFixProgress(0);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    return severity === 'critical' || severity === 'high' ? 
      <AlertTriangle className="h-4 w-4" /> : 
      <Shield className="h-4 w-4" />;
  };

  useEffect(() => {
    scanForIssues();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-blue-500" />
            <span>Automated Policy Optimization</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Automatically detect and fix RLS policy issues across all database tables
              </p>
              {lastScan && (
                <p className="text-xs text-gray-500 mt-1">
                  Last scan: {lastScan.toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={scanForIssues}
                disabled={isScanning}
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
                {isScanning ? 'Scanning...' : 'Scan Now'}
              </Button>
              {issues.length > 0 && (
                <Button 
                  onClick={fixAllIssues}
                  disabled={isFixing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Fix All Issues
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fix Progress */}
      {isFixing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Fixing policy issues...</span>
                <span>{Math.round(fixProgress)}%</span>
              </div>
              <Progress value={fixProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Issues Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {issues.filter(i => i.severity === 'critical').length}
              </div>
              <div className="text-sm text-gray-600">Critical Issues</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {issues.filter(i => i.severity === 'high').length}
              </div>
              <div className="text-sm text-gray-600">High Priority</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {issues.filter(i => i.severity === 'medium').length}
              </div>
              <div className="text-sm text-gray-600">Medium Priority</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {issues.filter(i => i.severity === 'low').length}
              </div>
              <div className="text-sm text-gray-600">Low Priority</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Issues List */}
      {issues.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Policy Issues Detected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {issues.map((issue, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${getSeverityColor(issue.severity)} text-white`}>
                      {getSeverityIcon(issue.severity)}
                    </div>
                    <div>
                      <div className="font-medium flex items-center space-x-2">
                        <Database className="h-4 w-4" />
                        <span>{issue.table}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {issue.issues.join(', ')}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className={getSeverityColor(issue.severity) + ' text-white'}>
                    {issue.severity.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Issues Found</h3>
              <p className="text-gray-600">All RLS policies are optimized and performing well.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}