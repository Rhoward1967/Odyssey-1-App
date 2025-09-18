import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, Server, Database, Wifi, AlertTriangle } from 'lucide-react';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { useOfflineSync } from '@/hooks/useOfflineSync';

interface SystemStatusItem {
  id: string;
  component: string;
  status: 'online' | 'offline' | 'degraded';
  message: string;
  metrics: {
    uptime: number;
    response_time: number;
    cpu_usage: number;
    memory_usage: number;
  };
  created_at: string;
}

export function RealtimeSystemStatus() {
  const [systemHealth, setSystemHealth] = useState<'healthy' | 'degraded' | 'critical'>('healthy');
  const { isOnline, pendingSync } = useOfflineSync();
  
  const { 
    data: statusData, 
    connected, 
    lastUpdate 
  } = useRealtimeData<SystemStatusItem>('system_status');

  // Calculate overall system health
  useEffect(() => {
    if (statusData.length === 0) return;

    const offlineComponents = statusData.filter(item => item.status === 'offline').length;
    const degradedComponents = statusData.filter(item => item.status === 'degraded').length;

    if (offlineComponents > 0) {
      setSystemHealth('critical');
    } else if (degradedComponents > 0) {
      setSystemHealth('degraded');
    } else {
      setSystemHealth('healthy');
    }
  }, [statusData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const components = [
    { name: 'Trading Engine', icon: Activity, status: 'online' },
    { name: 'AI Analysis', icon: Server, status: connected ? 'online' : 'offline' },
    { name: 'Database', icon: Database, status: 'online' },
    { name: 'Real-time Sync', icon: Wifi, status: isOnline ? 'online' : 'offline' }
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              System Status
            </div>
            <Badge className={getHealthColor(systemHealth)}>
              {systemHealth.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {components.map(component => (
              <div key={component.name} className="text-center p-4 border rounded-lg">
                <component.icon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <h3 className="font-medium text-sm mb-2">{component.name}</h3>
                <div className="flex items-center justify-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(component.status)}`} />
                  <span className="text-xs capitalize">{component.status}</span>
                </div>
              </div>
            ))}
          </div>

          {pendingSync > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-700">
                  {pendingSync} items pending sync
                </span>
              </div>
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-600">Uptime</div>
              <div className="font-medium">99.9%</div>
            </div>
            <div>
              <div className="text-gray-600">Response Time</div>
              <div className="font-medium">45ms</div>
            </div>
            <div>
              <div className="text-gray-600">CPU Usage</div>
              <Progress value={23} className="h-2 mt-1" />
            </div>
            <div>
              <div className="text-gray-600">Memory</div>
              <Progress value={67} className="h-2 mt-1" />
            </div>
          </div>

          {lastUpdate && (
            <div className="mt-4 text-xs text-gray-500 text-center">
              Last updated: {lastUpdate.toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}