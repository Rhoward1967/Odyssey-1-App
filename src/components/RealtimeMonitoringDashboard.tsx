import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Server, Database, Wifi, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function RealtimeMonitoringDashboard() {
  const [systemMetrics, setSystemMetrics] = useState({
    cpu: 45,
    memory: 67,
    disk: 23,
    network: 89
  });

  const [alerts, setAlerts] = useState([
    { id: 1, type: 'warning', message: 'High memory usage detected', timestamp: '2 mins ago', status: 'active' },
    { id: 2, type: 'error', message: 'Database connection timeout', timestamp: '5 mins ago', status: 'resolved' },
    { id: 3, type: 'info', message: 'Backup completed successfully', timestamp: '10 mins ago', status: 'resolved' }
  ]);

  const [services, setServices] = useState([
    { name: 'API Gateway', status: 'healthy', uptime: '99.9%', responseTime: '45ms' },
    { name: 'Database', status: 'healthy', uptime: '99.8%', responseTime: '12ms' },
    { name: 'Cache Layer', status: 'warning', uptime: '98.5%', responseTime: '78ms' },
    { name: 'Message Queue', status: 'healthy', uptime: '99.9%', responseTime: '23ms' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics(prev => ({
        cpu: Math.max(10, Math.min(90, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(20, Math.min(95, prev.memory + (Math.random() - 0.5) * 8)),
        disk: Math.max(10, Math.min(80, prev.disk + (Math.random() - 0.5) * 5)),
        network: Math.max(30, Math.min(100, prev.network + (Math.random() - 0.5) * 15))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Real-time Monitoring Dashboard</h2>
          <p className="text-muted-foreground">Live system performance and health monitoring</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Activity className="h-3 w-3 mr-1" />
            System Online
          </Badge>
          <Button variant="outline" size="sm">
            <Wifi className="h-4 w-4 mr-2" />
            Live Feed
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemMetrics.cpu.toFixed(1)}%</div>
                <Progress value={systemMetrics.cpu} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memory</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemMetrics.memory.toFixed(1)}%</div>
                <Progress value={systemMetrics.memory} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemMetrics.disk.toFixed(1)}%</div>
                <Progress value={systemMetrics.disk} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Network I/O</CardTitle>
                <Wifi className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemMetrics.network.toFixed(1)}%</div>
                <Progress value={systemMetrics.network} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Health Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(service.status)}
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-muted-foreground">Uptime: {service.uptime}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{service.responseTime}</div>
                      <div className="text-sm text-muted-foreground">Avg Response</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {alert.type === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                      {alert.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                      {alert.type === 'info' && <CheckCircle className="h-4 w-4 text-blue-500" />}
                      <div>
                        <div className="font-medium">{alert.message}</div>
                        <div className="text-sm text-muted-foreground">{alert.timestamp}</div>
                      </div>
                    </div>
                    <Badge variant={alert.status === 'active' ? 'destructive' : 'secondary'}>
                      {alert.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm space-y-1">
                <div>[2024-01-15 14:32:15] INFO: System startup completed</div>
                <div>[2024-01-15 14:32:16] INFO: Database connection established</div>
                <div>[2024-01-15 14:32:17] WARN: High memory usage detected (67%)</div>
                <div>[2024-01-15 14:32:18] INFO: Cache layer optimized</div>
                <div>[2024-01-15 14:32:19] INFO: API endpoints responding normally</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}