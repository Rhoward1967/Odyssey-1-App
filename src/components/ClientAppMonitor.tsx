import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Clock, Cpu, Globe, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MetricData {
  label: string;
  value: string | number;
  change: string;
  status: 'good' | 'warning' | 'error';
}

interface UserSession {
  id: string;
  userId: string;
  page: string;
  duration: number;
  actions: number;
  timestamp: Date;
}

export default function ClientAppMonitor() {
  const [metrics, setMetrics] = useState<MetricData[]>([
    { label: 'Active Users', value: 1247, change: '+12%', status: 'good' },
    { label: 'Page Load Time', value: '1.2s', change: '-5%', status: 'good' },
    { label: 'Error Rate', value: '0.3%', change: '+0.1%', status: 'warning' },
    { label: 'API Response', value: '245ms', change: '-15ms', status: 'good' }
  ]);

  const [sessions, setSessions] = useState<UserSession[]>([
    { id: '1', userId: 'user_123', page: '/dashboard', duration: 45, actions: 8, timestamp: new Date() },
    { id: '2', userId: 'user_456', page: '/bidding-calculator', duration: 120, actions: 15, timestamp: new Date() }
  ]);

  const [realTimeData, setRealTimeData] = useState({
    cpuUsage: 45,
    memoryUsage: 62,
    activeConnections: 89,
    requestsPerMinute: 156
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        cpuUsage: Math.max(20, Math.min(90, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(30, Math.min(85, prev.memoryUsage + (Math.random() - 0.5) * 8)),
        activeConnections: Math.max(50, Math.min(200, prev.activeConnections + Math.floor((Math.random() - 0.5) * 20))),
        requestsPerMinute: Math.max(100, Math.min(300, prev.requestsPerMinute + Math.floor((Math.random() - 0.5) * 40)))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Client App Monitor</h1>
          <p className="text-gray-600">Real-time monitoring and analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Globe className="w-4 h-4 mr-2" />
            Live View
          </Button>
          <Button size="sm">
            <Activity className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{metric.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                </div>
                <Badge className={getStatusColor(metric.status)}>
                  {metric.change}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Real-time System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Cpu className="w-5 h-5 mr-2 text-blue-600" />
              System Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>CPU Usage</span>
                <span>{realTimeData.cpuUsage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${realTimeData.cpuUsage}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Memory Usage</span>
                <span>{realTimeData.memoryUsage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${realTimeData.memoryUsage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-green-600" />
              User Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{realTimeData.activeConnections}</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{realTimeData.requestsPerMinute}</div>
                <div className="text-sm text-gray-600">Requests/min</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2 text-purple-600" />
            Recent User Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900">{session.userId}</p>
                    <p className="text-sm text-gray-600">{session.page}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{session.duration}s</p>
                  <p className="text-xs text-gray-500">{session.actions} actions</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}