import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Activity,
    AlertTriangle,
    Brain,
    CheckCircle,
    Crown,
    DollarSign,
    Target,
    TrendingUp,
    Users
} from 'lucide-react';
import { useState } from 'react';

interface ExecutiveMetrics {
  labor_costs: {
    total_gross_payroll: number;
    overtime_trends: number;
    cost_per_employee: number;
    payroll_efficiency: number;
  };
  sales_performance: {
    win_loss_ratio: number;
    predicted_margins: number;
    bid_accuracy: number;
    revenue_forecast: number;
  };
  system_health: {
    ai_agents_active: number;
    platform_uptime: number;
    data_quality_score: number;
    security_status: string;
  };
}

export default function AdvancedAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<ExecutiveMetrics>({
    labor_costs: {
      total_gross_payroll: 487500,
      overtime_trends: 12.5,
      cost_per_employee: 62500,
      payroll_efficiency: 94.2
    },
    sales_performance: {
      win_loss_ratio: 73.4,
      predicted_margins: 24.8,
      bid_accuracy: 89.1,
      revenue_forecast: 2850000
    },
    system_health: {
      ai_agents_active: 3,
      platform_uptime: 99.7,
      data_quality_score: 96.3,
      security_status: 'optimal'
    }
  });

  const getHealthColor = (value: number, threshold: number = 90) => {
    if (value >= threshold) return 'text-green-600';
    if (value >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthIcon = (value: number, threshold: number = 90) => {
    if (value >= threshold) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (value >= 70) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <Card className="border-purple-400 bg-gradient-to-r from-purple-100 to-gold-100">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl text-purple-800">
            <Crown className="h-8 w-8 text-gold-600" />
            Advanced Analytics Dashboard
            <Crown className="h-8 w-8 text-gold-600" />
          </CardTitle>
          <Badge className="mx-auto bg-purple-200 text-purple-800 text-lg px-4 py-2">
            Executive Command Center - Divine Law Governance
          </Badge>
        </CardHeader>
      </Card>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Total Revenue Forecast</p>
                <p className="text-2xl font-bold text-green-800">
                  ${(metrics.sales_performance.revenue_forecast / 1000000).toFixed(2)}M
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Win Rate</p>
                <p className="text-2xl font-bold text-blue-800">
                  {metrics.sales_performance.win_loss_ratio}%
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">Labor Efficiency</p>
                <p className="text-2xl font-bold text-orange-800">
                  {metrics.labor_costs.payroll_efficiency}%
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Platform Health</p>
                <p className="text-2xl font-bold text-purple-800">
                  {metrics.system_health.platform_uptime}%
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="executive-summary" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="executive-summary">Executive Summary</TabsTrigger>
          <TabsTrigger value="labor-analytics">Labor Analytics</TabsTrigger>
          <TabsTrigger value="sales-intelligence">Sales Intelligence</TabsTrigger>
          <TabsTrigger value="system-monitoring">System Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="executive-summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-gold-600" />
                Divine Law Governance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800">Strategic Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Revenue Growth Trajectory</span>
                      <span className="font-semibold text-green-600">+18.3%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Operational Efficiency</span>
                      <span className="font-semibold text-blue-600">94.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Genesis AI Performance</span>
                      <span className="font-semibold text-purple-600">96.3%</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800">Risk Assessment</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Security Posture</span>
                      <Badge className="bg-green-100 text-green-800">Optimal</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Compliance Status</span>
                      <Badge className="bg-green-100 text-green-800">Full</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Market Position</span>
                      <Badge className="bg-blue-100 text-blue-800">Strong</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="labor-analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-600" />
                Workforce Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-orange-50 p-4 rounded border">
                  <div className="text-2xl font-bold text-orange-800">
                    ${(metrics.labor_costs.total_gross_payroll / 1000).toFixed(0)}K
                  </div>
                  <div className="text-sm text-orange-600">Total Gross Payroll</div>
                </div>
                <div className="bg-orange-50 p-4 rounded border">
                  <div className="text-2xl font-bold text-orange-800">
                    {metrics.labor_costs.overtime_trends}%
                  </div>
                  <div className="text-sm text-orange-600">Overtime Trends</div>
                </div>
                <div className="bg-orange-50 p-4 rounded border">
                  <div className="text-2xl font-bold text-orange-800">
                    ${(metrics.labor_costs.cost_per_employee / 1000).toFixed(0)}K
                  </div>
                  <div className="text-sm text-orange-600">Cost Per Employee</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales-intelligence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Predictive Sales Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800">Performance Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Win/Loss Ratio</span>
                      <span className="font-semibold text-blue-600">
                        {metrics.sales_performance.win_loss_ratio}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Bid Accuracy</span>
                      <span className="font-semibold text-green-600">
                        {metrics.sales_performance.bid_accuracy}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Predicted Margins</span>
                      <span className="font-semibold text-purple-600">
                        {metrics.sales_performance.predicted_margins}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded border">
                  <h4 className="font-semibold text-blue-800 mb-2">AI Insights</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>• Genesis Predictive Model active</p>
                    <p>• Optimal margin recommendations</p>
                    <p>• Win probability calculations</p>
                    <p>• Market trend analysis</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system-monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Genesis Platform Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800">System Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Platform Uptime</span>
                      <div className="flex items-center gap-1">
                        {getHealthIcon(metrics.system_health.platform_uptime)}
                        <span className={`font-semibold ${getHealthColor(metrics.system_health.platform_uptime)}`}>
                          {metrics.system_health.platform_uptime}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Data Quality Score</span>
                      <div className="flex items-center gap-1">
                        {getHealthIcon(metrics.system_health.data_quality_score)}
                        <span className={`font-semibold ${getHealthColor(metrics.system_health.data_quality_score)}`}>
                          {metrics.system_health.data_quality_score}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">AI Agents Active</span>
                      <span className="font-semibold text-purple-600">
                        {metrics.system_health.ai_agents_active}/3
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded border">
                  <h4 className="font-semibold text-purple-800 mb-2">Universal AI Status</h4>
                  <div className="text-sm text-purple-700 space-y-1">
                    <p>• Genesis Predictive Bidding: Active</p>
                    <p>• Document Analysis Engine: Active</p>
                    <p>• R.O.M.A.N. Universal AI: Standby</p>
                    <p>• Security status: Optimal</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}