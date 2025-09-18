import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, TrendingDown, Activity } from 'lucide-react';

export function CostAnalytics() {
  const costProjections = {
    nextMonth: 215.50,
    nextQuarter: 647.25,
    yearlyProjection: 2589.00
  };

  const costOptimizations = [
    { service: 'Edge Functions', potential: 15.67, action: 'Optimize cold starts' },
    { service: 'Storage', potential: 8.23, action: 'Compress old files' },
    { service: 'Bandwidth', potential: 12.45, action: 'Enable CDN caching' }
  ];

  const usageMetrics = {
    dbConnections: { current: 234, limit: 500, percentage: 46.8 },
    storageGB: { current: 12.7, limit: 100, percentage: 12.7 },
    functionInvocations: { current: 45678, limit: 100000, percentage: 45.7 },
    bandwidth: { current: 89.3, limit: 250, percentage: 35.7 }
  };

  return (
    <div className="space-y-6">
      {/* Cost Projections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Cost Projections & Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Next Month</p>
              <p className="text-2xl font-bold text-blue-600">${costProjections.nextMonth}</p>
              <p className="text-xs text-green-600">↓ 3.2% vs current</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Next Quarter</p>
              <p className="text-2xl font-bold text-purple-600">${costProjections.nextQuarter}</p>
              <p className="text-xs text-green-600">↓ 5.8% optimized</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Yearly Projection</p>
              <p className="text-2xl font-bold text-orange-600">${costProjections.yearlyProjection}</p>
              <p className="text-xs text-green-600">↓ 12% with optimization</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Resource Usage Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Database Connections</span>
                <span>{usageMetrics.dbConnections.current}/{usageMetrics.dbConnections.limit}</span>
              </div>
              <Progress value={usageMetrics.dbConnections.percentage} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Storage Usage (GB)</span>
                <span>{usageMetrics.storageGB.current}/{usageMetrics.storageGB.limit}</span>
              </div>
              <Progress value={usageMetrics.storageGB.percentage} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Function Invocations</span>
                <span>{usageMetrics.functionInvocations.current.toLocaleString()}/{usageMetrics.functionInvocations.limit.toLocaleString()}</span>
              </div>
              <Progress value={usageMetrics.functionInvocations.percentage} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Bandwidth (GB)</span>
                <span>{usageMetrics.bandwidth.current}/{usageMetrics.bandwidth.limit}</span>
              </div>
              <Progress value={usageMetrics.bandwidth.percentage} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Optimization Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Cost Optimization Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {costOptimizations.map((opt, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{opt.service}</p>
                  <p className="text-sm text-muted-foreground">{opt.action}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">-${opt.potential}/mo</p>
                  <Badge variant="outline" className="text-xs">Potential Saving</Badge>
                </div>
              </div>
            ))}
            <div className="pt-3 border-t">
              <p className="text-sm font-medium text-green-600">
                Total Monthly Savings Potential: ${costOptimizations.reduce((sum, opt) => sum + opt.potential, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}