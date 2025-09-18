import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, Cpu, Database, HardDrive, Wifi, AlertCircle } from 'lucide-react';

interface PerformanceMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_latency: number;
  database_connections: number;
  query_performance: number;
  uptime: string;
  status: 'healthy' | 'warning' | 'critical';
}

interface Alert {
  id: string;
  type: 'warning' | 'error';
  message: string;
  timestamp: string;
}

export default function RealtimePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cpu_usage: 0,
    memory_usage: 0,
    disk_usage: 0,
    network_latency: 0,
    database_connections: 0,
    query_performance: 0,
    uptime: '0d 0h 0m',
    status: 'healthy'
  });

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);

  const generateRandomMetrics = (): PerformanceMetrics => {
    const cpu = Math.random() * 100;
    const memory = Math.random() * 100;
    const disk = Math.random() * 100;
    const latency = Math.random() * 200;
    const connections = Math.floor(Math.random() * 50) + 10;
    const queryPerf = Math.random() * 1000;

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (cpu > 80 || memory > 85 || latency > 150) {
      status = 'critical';
    } else if (cpu > 60 || memory > 70 || latency > 100) {
      status = 'warning';
    }

    return {
      cpu_usage: cpu,
      memory_usage: memory,
      disk_usage: disk,
      network_latency: latency,
      database_connections: connections,
      query_performance: queryPerf,
      uptime: '2d 14h 32m',
      status
    };
  };

  const checkForAlerts = (newMetrics: PerformanceMetrics) => {
    const newAlerts: Alert[] = [];

    if (newMetrics.cpu_usage > 80) {
      newAlerts.push({
        id: `cpu-${Date.now()}`,
        type: 'error',
        message: `High CPU usage: ${newMetrics.cpu_usage.toFixed(1)}%`,
        timestamp: new Date().toLocaleTimeString()
      });
    }

    if (newMetrics.memory_usage > 85) {
      newAlerts.push({
        id: `memory-${Date.now()}`,
        type: 'error',
        message: `High memory usage: ${newMetrics.memory_usage.toFixed(1)}%`,
        timestamp: new Date().toLocaleTimeString()
      });
    }

    if (newMetrics.network_latency > 150) {
      newAlerts.push({
        id: `latency-${Date.now()}`,
        type: 'warning',
        message: `High network latency: ${newMetrics.network_latency.toFixed(1)}ms`,
        timestamp: new Date().toLocaleTimeString()
      });
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 10));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getProgressColor = (value: number, thresholds = { warning: 70, critical: 85 }) => {
    if (value >= thresholds.critical) return 'bg-red-500';
    if (value >= thresholds.warning) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      const newMetrics = generateRandomMetrics();
      setMetrics(newMetrics);
      checkForAlerts(newMetrics);
    }, 2000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Real-time Performance Monitor</h2>
          <p className="text-muted-foreground">Monitor system and database performance in real-time</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={`${getStatusColor(metrics.status)} text-white`}>
            <Activity className="w-4 h-4 mr-1" />
            {metrics.status.toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cpu_usage.toFixed(1)}%</div>
            <Progress 
              value={metrics.cpu_usage} 
              className="mt-2"
              style={{ backgroundColor: getProgressColor(metrics.cpu_usage) }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.memory_usage.toFixed(1)}%</div>
            <Progress 
              value={metrics.memory_usage} 
              className="mt-2"
              style={{ backgroundColor: getProgressColor(metrics.memory_usage) }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Latency</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.network_latency.toFixed(1)}ms</div>
            <Progress 
              value={Math.min(metrics.network_latency / 2, 100)} 
              className="mt-2"
              style={{ backgroundColor: getProgressColor(metrics.network_latency, { warning: 100, critical: 150 }) }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DB Connections</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.database_connections}</div>
            <p className="text-xs text-muted-foreground mt-1">Active connections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Query Performance</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.query_performance.toFixed(1)}ms</div>
            <p className="text-xs text-muted-foreground mt-1">Avg query time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.uptime}</div>
            <p className="text-xs text-muted-foreground mt-1">Days, hours, minutes</p>
          </CardContent>
        </Card>
      </div>

      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.type === 'error' 
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}