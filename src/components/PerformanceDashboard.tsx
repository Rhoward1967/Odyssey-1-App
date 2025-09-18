import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Cpu, Database, Globe, Zap, TrendingUp, AlertTriangle } from 'lucide-react';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

interface SystemHealth {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  uptime: string;
  responseTime: number;
}

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([
    { name: 'API Response Time', value: 120, unit: 'ms', status: 'good', trend: 'stable' },
    { name: 'Database Queries/sec', value: 450, unit: 'qps', status: 'good', trend: 'up' },
    { name: 'Active Users', value: 1247, unit: 'users', status: 'good', trend: 'up' },
    { name: 'Error Rate', value: 0.02, unit: '%', status: 'good', trend: 'down' },
    { name: 'Throughput', value: 2.3, unit: 'MB/s', status: 'warning', trend: 'stable' },
    { name: 'Cache Hit Rate', value: 94.5, unit: '%', status: 'good', trend: 'up' }
  ]);

  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    cpu: 45,
    memory: 67,
    disk: 23,
    network: 89,
    uptime: '15d 7h 23m',
    responseTime: 120
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      default: return <div className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Performance Dashboard</h1>
        <Badge variant="outline" className="text-green-600 border-green-600">
          <Activity className="w-4 h-4 mr-2" />
          System Healthy
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
          <TabsTrigger value="api">API Performance</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics.map((metric, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  {getTrendIcon(metric.trend)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metric.value} <span className="text-sm text-gray-500">{metric.unit}</span>
                  </div>
                  <Badge className={`mt-2 ${getStatusColor(metric.status)}`}>
                    {metric.status.toUpperCase()}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Cpu className="w-5 h-5 mr-2" />
                  System Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>CPU Usage</span>
                    <span>{systemHealth.cpu}%</span>
                  </div>
                  <Progress value={systemHealth.cpu} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Memory Usage</span>
                    <span>{systemHealth.memory}%</span>
                  </div>
                  <Progress value={systemHealth.memory} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Disk Usage</span>
                    <span>{systemHealth.disk}%</span>
                  </div>
                  <Progress value={systemHealth.disk} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Network I/O</span>
                    <span>{systemHealth.network}%</span>
                  </div>
                  <Progress value={systemHealth.network} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Uptime</span>
                  <span className="font-mono">{systemHealth.uptime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Response Time</span>
                  <span>{systemHealth.responseTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  <Badge className="bg-green-100 text-green-600">Operational</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">99.9%</div>
                    <div className="text-sm text-gray-500">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">120ms</div>
                    <div className="text-sm text-gray-500">Avg Response</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">1.2K</div>
                    <div className="text-sm text-gray-500">Requests/min</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">0.02%</div>
                    <div className="text-sm text-gray-500">Error Rate</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Recent Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <div className="font-medium">High Memory Usage</div>
                    <div className="text-sm text-gray-500">Memory usage at 67% - approaching threshold</div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-600">Warning</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium">Database Optimization Complete</div>
                    <div className="text-sm text-gray-500">Query performance improved by 15%</div>
                  </div>
                  <Badge className="bg-green-100 text-green-600">Resolved</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}