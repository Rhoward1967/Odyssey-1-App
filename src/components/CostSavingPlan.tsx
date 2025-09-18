import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingDown, 
  DollarSign, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';

interface CostMetrics {
  category: string;
  current: number;
  budget: number;
  savings: number;
  efficiency: number;
}

export const CostSavingPlan: React.FC = () => {
  const [metrics, setMetrics] = useState<CostMetrics[]>([
    { category: 'API Calls', current: 245, budget: 500, savings: 125, efficiency: 85 },
    { category: 'Database Queries', current: 1200, budget: 2000, savings: 300, efficiency: 78 },
    { category: 'Storage Usage', current: 2.3, budget: 5, savings: 1.2, efficiency: 92 },
    { category: 'Function Invocations', current: 89, budget: 200, savings: 45, efficiency: 88 }
  ]);

  const totalBudget = 10000;
  const currentSpend = 2688.44;
  const projectedSavings = 2156.78;
  const efficiency = 87;

  const savingStrategies = [
    { name: 'Query Optimization', impact: '$450/month', status: 'active' },
    { name: 'Cache Implementation', impact: '$320/month', status: 'pending' },
    { name: 'Resource Cleanup', impact: '$180/month', status: 'active' },
    { name: 'API Rate Limiting', impact: '$290/month', status: 'planned' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-blue-600">${totalBudget}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Spend</p>
                <p className="text-2xl font-bold text-orange-600">${currentSpend}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Projected Savings</p>
                <p className="text-2xl font-bold text-green-600">${projectedSavings}</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Efficiency Score</p>
                <p className="text-2xl font-bold text-purple-600">{efficiency}%</p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resource Usage & Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{metric.category}</span>
                    <Badge variant={metric.current / metric.budget > 0.8 ? "destructive" : "secondary"}>
                      {Math.round((metric.current / metric.budget) * 100)}%
                    </Badge>
                  </div>
                  <Progress value={(metric.current / metric.budget) * 100} className="h-2" />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{metric.current} / {metric.budget}</span>
                    <span className="text-green-600">-${metric.savings} saved</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Saving Strategies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {savingStrategies.map((strategy, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {strategy.status === 'active' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : strategy.status === 'pending' ? (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <p className="font-medium">{strategy.name}</p>
                      <p className="text-sm text-gray-600">{strategy.impact}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      strategy.status === 'active' ? 'default' : 
                      strategy.status === 'pending' ? 'secondary' : 'outline'
                    }
                  >
                    {strategy.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Current spending is at 27% of annual budget. Implementing all planned cost-saving strategies 
          could reduce expenses by up to $1,240/month, keeping the project well under budget.
        </AlertDescription>
      </Alert>

      <div className="flex space-x-4">
        <Button className="flex items-center space-x-2">
          <Target className="h-4 w-4" />
          <span>Implement Savings Plan</span>
        </Button>
        <Button variant="outline" className="flex items-center space-x-2">
          <TrendingDown className="h-4 w-4" />
          <span>Generate Cost Report</span>
        </Button>
      </div>
    </div>
  );
};