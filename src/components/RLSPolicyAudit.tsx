import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Shield, Database } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface PolicyIssue {
  table: string;
  role: string;
  action: string;
  policies: string[];
  severity: 'high' | 'medium' | 'low';
}

export function RLSPolicyAudit() {
  const [issues, setIssues] = useState<PolicyIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastScan, setLastScan] = useState<Date | null>(null);

  const scanPolicies = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('audit_rls_policies');
      if (error) throw error;
      
      // Mock data for demonstration
      const mockIssues: PolicyIssue[] = [
        {
          table: 'users',
          role: 'authenticated',
          action: 'SELECT',
          policies: ['Users can view profiles', 'Users can read own data'],
          severity: 'medium'
        },
        {
          table: 'invoices',
          role: 'dashboard_user',
          action: 'UPDATE',
          policies: ['Users can edit invoices', 'Users can modify own invoices'],
          severity: 'high'
        }
      ];
      
      setIssues(mockIssues);
      setLastScan(new Date());
    } catch (error) {
      console.error('Policy audit failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const fixPolicy = async (issue: PolicyIssue) => {
    try {
      // Implementation would consolidate policies
      console.log('Fixing policy for:', issue.table);
      await scanPolicies(); // Refresh after fix
    } catch (error) {
      console.error('Fix failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            RLS Policy Audit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button onClick={scanPolicies} disabled={loading}>
                {loading ? 'Scanning...' : 'Scan Policies'}
              </Button>
              {lastScan && (
                <span className="text-sm text-muted-foreground">
                  Last scan: {lastScan.toLocaleString()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={issues.length > 0 ? 'destructive' : 'default'}>
                {issues.length} Issues
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            {issues.map((issue, index) => (
              <Card key={index} className="border-l-4 border-l-orange-500">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <span className="font-medium">Table: {issue.table}</span>
                        <Badge variant={issue.severity === 'high' ? 'destructive' : 'secondary'}>
                          {issue.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Multiple permissive policies for {issue.role} role on {issue.action} action
                      </p>
                      <div className="space-y-1">
                        {issue.policies.map((policy, pIndex) => (
                          <div key={pIndex} className="text-xs bg-muted p-2 rounded">
                            {policy}
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button size="sm" onClick={() => fixPolicy(issue)}>
                      Fix Policy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {issues.length === 0 && lastScan && (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="text-muted-foreground">No policy issues found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}