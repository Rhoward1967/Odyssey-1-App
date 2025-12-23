import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Lock, Key, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface SecurityPolicy {
  id: string;
  table: string;
  name: string;
  command: string;
  roles: string[];
  status: 'active' | 'inactive' | 'conflicted';
  lastModified: Date;
}

interface SecurityIssue {
  type: 'duplicate_policy' | 'missing_policy' | 'overpermissive' | 'performance';
  severity: 'high' | 'medium' | 'low';
  description: string;
  table: string;
  recommendation: string;
}

export function SecurityPolicyManager() {
  const [policies, setPolicies] = useState<SecurityPolicy[]>([]);
  const [issues, setIssues] = useState<SecurityIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string>('all');

  const loadPolicies = async () => {
    setLoading(true);
    try {
      // Query Supabase for security policies
      const { data: policyData, error: policyError } = await supabase
        .from('security_policies')
        .select('*');

      if (policyError) throw policyError;

      // Map backend data to SecurityPolicy interface
      const policies: SecurityPolicy[] = (policyData || []).map((p: any) => ({
        id: p.id,
        table: p.table,
        name: p.name,
        command: p.command,
        roles: p.roles || [],
        status: p.status,
        lastModified: p.last_modified ? new Date(p.last_modified) : new Date()
      }));
      setPolicies(policies);

      // Query Supabase for security issues
      const { data: issueData, error: issueError } = await supabase
        .from('security_issues')
        .select('*');

      if (issueError) throw issueError;

      const issues: SecurityIssue[] = (issueData || []).map((i: any) => ({
        type: i.type,
        severity: i.severity,
        description: i.description,
        table: i.table,
        recommendation: i.recommendation
      }));
      setIssues(issues);
    } catch (error) {
      console.error('Failed to load policies:', error);
      setPolicies([]);
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  const fixIssue = async (issue: SecurityIssue) => {
    try {
      console.log('Fixing security issue:', issue.type, 'on table:', issue.table);
      // Implementation would fix the specific issue
      await loadPolicies(); // Refresh after fix
    } catch (error) {
      console.error('Fix failed:', error);
    }
  };

  const createOptimizedPolicy = async (table: string) => {
    try {
      console.log('Creating optimized policy for table:', table);
      // Implementation would create new optimized policy
      await loadPolicies();
    } catch (error) {
      console.error('Policy creation failed:', error);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  const filteredPolicies = selectedTable === 'all' 
    ? policies 
    : policies.filter(p => p.table === selectedTable);

  const tables = [...new Set(policies.map(p => p.table))];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Policy Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="policies" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="policies">Policies</TabsTrigger>
              <TabsTrigger value="issues">Issues</TabsTrigger>
              <TabsTrigger value="audit">Audit</TabsTrigger>
            </TabsList>

            <TabsContent value="policies" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button onClick={loadPolicies} disabled={loading}>
                    {loading ? 'Loading...' : 'Refresh Policies'}
                  </Button>
                  <select 
                    value={selectedTable} 
                    onChange={(e) => setSelectedTable(e.target.value)}
                    className="px-3 py-1 border rounded"
                  >
                    <option value="all">All Tables</option>
                    {tables.map(table => (
                      <option key={table} value={table}>{table}</option>
                    ))}
                  </select>
                </div>
                <Badge variant="outline">
                  {filteredPolicies.length} Policies
                </Badge>
              </div>

              <div className="space-y-2">
                {filteredPolicies.map((policy) => (
                  <Card key={policy.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            <span className="font-medium">{policy.name}</span>
                            <Badge variant={policy.status === 'active' ? 'default' : 'secondary'}>
                              {policy.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Table: {policy.table} | Command: {policy.command} | Roles: {policy.roles.join(', ')}
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Edit Policy
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="issues" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Security Issues</h3>
                <Badge variant={issues.length > 0 ? 'destructive' : 'default'}>
                  {issues.length} Issues
                </Badge>
              </div>

              <div className="space-y-4">
                {issues.map((issue, index) => (
                  <Card key={index} className="border-l-4 border-l-red-500">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <span className="font-medium">{issue.description}</span>
                            <Badge variant={issue.severity === 'high' ? 'destructive' : 'secondary'}>
                              {issue.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Table: {issue.table}
                          </p>
                          <p className="text-sm">
                            <strong>Recommendation:</strong> {issue.recommendation}
                          </p>
                        </div>
                        <Button size="sm" onClick={() => fixIssue(issue)}>
                          Fix Issue
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {issues.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <p className="text-muted-foreground">No security issues found</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="audit" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Policy Coverage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Tables with RLS</span>
                        <span className="font-medium">12/15</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Optimized Policies</span>
                        <span className="font-medium">8/12</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Performance Issues</span>
                        <span className="font-medium text-red-500">3</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full" size="sm">
                      Run Full Security Audit
                    </Button>
                    <Button className="w-full" size="sm" variant="outline">
                      Export Policy Report
                    </Button>
                    <Button className="w-full" size="sm" variant="outline">
                      Backup Current Policies
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}