import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings2 as Optimize, 
  TrendingUp, 
  Settings, 
  BarChart3,
  RefreshCw,
  Shield,
  Zap
} from 'lucide-react';

interface OptimizationRule {
  id: string;
  name: string;
  description: string;
  savings: number;
  enabled: boolean;
  category: 'performance' | 'cost' | 'efficiency';
}

export const BudgetOptimizer: React.FC = () => {
  const [optimizing, setOptimizing] = useState(false);
  const [rules, setRules] = useState<OptimizationRule[]>([
    {
      id: '1',
      name: 'Auto-cleanup Unused Resources',
      description: 'Automatically remove unused database connections and cached data',
      savings: 180,
      enabled: true,
      category: 'cost'
    },
    {
      id: '2',
      name: 'Query Result Caching',
      description: 'Cache frequently accessed query results to reduce database calls',
      savings: 320,
      enabled: true,
      category: 'performance'
    },
    {
      id: '3',
      name: 'API Rate Limiting',
      description: 'Implement smart rate limiting to prevent excessive API usage',
      savings: 290,
      enabled: false,
      category: 'cost'
    },
    {
      id: '4',
      name: 'Batch Processing',
      description: 'Group similar operations to reduce processing overhead',
      savings: 150,
      enabled: true,
      category: 'efficiency'
    }
  ]);

  const totalSavings = rules.filter(r => r.enabled).reduce((sum, r) => sum + r.savings, 0);
  const optimizationScore = Math.round((totalSavings / 1000) * 100);

  const handleOptimize = async () => {
    setOptimizing(true);
    // Simulate optimization process
    await new Promise(resolve => setTimeout(resolve, 3000));
    setOptimizing(false);
  };

  const toggleRule = (id: string) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Savings</p>
                <p className="text-2xl font-bold text-green-600">${totalSavings}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Optimization Score</p>
                <p className="text-2xl font-bold text-blue-600">{optimizationScore}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Rules</p>
                <p className="text-2xl font-bold text-purple-600">
                  {rules.filter(r => r.enabled).length}/{rules.length}
                </p>
              </div>
              <Settings className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rules" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rules">Optimization Rules</TabsTrigger>
          <TabsTrigger value="analytics">Cost Analytics</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget Optimization Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {rule.category === 'cost' && <Shield className="h-5 w-5 text-green-500" />}
                        {rule.category === 'performance' && <Zap className="h-5 w-5 text-blue-500" />}
                        {rule.category === 'efficiency' && <Optimize className="h-5 w-5 text-purple-500" />}
                      </div>
                      <div>
                        <h4 className="font-medium">{rule.name}</h4>
                        <p className="text-sm text-gray-600">{rule.description}</p>
                        <p className="text-sm font-medium text-green-600">Saves ${rule.savings}/month</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={rule.enabled ? "default" : "outline"}>
                        {rule.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleRule(rule.id)}
                      >
                        {rule.enabled ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cost Reduction Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Database Optimization</label>
                    <Progress value={85} className="h-3" />
                    <p className="text-sm text-gray-600">85% reduction in query costs</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">API Efficiency</label>
                    <Progress value={72} className="h-3" />
                    <p className="text-sm text-gray-600">72% reduction in API calls</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Storage Optimization</label>
                    <Progress value={91} className="h-3" />
                    <p className="text-sm text-gray-600">91% storage efficiency</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Function Usage</label>
                    <Progress value={68} className="h-3" />
                    <p className="text-sm text-gray-600">68% reduction in executions</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automated Cost Control</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Daily Budget Monitoring</h4>
                  <p className="text-sm text-gray-600">Automatically track and alert on daily spending</p>
                </div>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Resource Auto-Cleanup</h4>
                  <p className="text-sm text-gray-600">Clean up unused resources every 24 hours</p>
                </div>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Smart Scaling</h4>
                  <p className="text-sm text-gray-600">Automatically scale resources based on usage</p>
                </div>
                <Badge variant="secondary">Pending</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex space-x-4">
        <Button 
          onClick={handleOptimize}
          disabled={optimizing}
          className="flex items-center space-x-2"
        >
          {optimizing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Optimize className="h-4 w-4" />
          )}
          <span>{optimizing ? 'Optimizing...' : 'Run Optimization'}</span>
        </Button>
        <Button variant="outline">
          Export Report
        </Button>
      </div>
    </div>
  );
};