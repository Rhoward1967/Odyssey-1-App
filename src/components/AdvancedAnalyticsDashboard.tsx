import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Users, Activity, Download, RefreshCw } from 'lucide-react';

interface AnalyticsData {
  users: {
    total: number;
    active: number;
    new: number;
    retention: number;
  };
  engagement: {
    sessions: number;
    pageViews: number;
    avgDuration: string;
    bounceRate: number;
  };
  revenue: {
    total: number;
    monthly: number;
    growth: number;
    conversion: number;
  };
  performance: {
    apiCalls: number;
    responseTime: number;
    uptime: number;
    errors: number;
  };
}

export const AdvancedAnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData>({
    users: { total: 12847, active: 8934, new: 1247, retention: 78.5 },
    engagement: { sessions: 45623, pageViews: 189234, avgDuration: '4:32', bounceRate: 23.4 },
    revenue: { total: 284750, monthly: 47892, growth: 12.3, conversion: 3.8 },
    performance: { apiCalls: 1847293, responseTime: 245, uptime: 99.97, errors: 23 }
  });

  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const exportData = () => {
    const csvData = Object.entries(data).map(([key, values]) => 
      `${key},${Object.values(values).join(',')}`
    ).join('\n');
    
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analytics-data.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Advanced Analytics</h1>
            <p className="text-muted-foreground">Comprehensive business intelligence dashboard</p>
          </div>
        </div>
        <div className="flex gap-2">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button variant="outline" onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.users.total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +{data.users.new} new this week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${data.revenue.total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +{data.revenue.growth}% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Calls</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.performance.apiCalls.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {data.performance.responseTime}ms avg response
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                <Badge variant="outline" className="text-green-600">
                  {data.performance.uptime}%
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Excellent</div>
                <p className="text-xs text-muted-foreground">
                  {data.performance.errors} errors this week
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>User Growth Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted rounded">
                  <p className="text-muted-foreground">Interactive chart would be rendered here</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted rounded">
                  <p className="text-muted-foreground">Revenue chart would be rendered here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{data.users.active.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Currently online</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>New Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{data.users.new.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">This period</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Retention Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{data.users.retention}%</div>
                <p className="text-sm text-muted-foreground">7-day retention</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.engagement.sessions.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Page Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.engagement.pageViews.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Avg Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.engagement.avgDuration}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Bounce Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.engagement.bounceRate}%</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${data.revenue.total.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${data.revenue.monthly.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Growth Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">+{data.revenue.growth}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.revenue.conversion}%</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>API Calls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.performance.apiCalls.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.performance.responseTime}ms</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Uptime</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{data.performance.uptime}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Errors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{data.performance.errors}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};