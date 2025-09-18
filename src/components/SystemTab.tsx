import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Server, 
  Database, 
  Cpu, 
  HardDrive, 
  MemoryStick, 
  Activity, 
  AlertTriangle, 
  CheckCircle 
} from 'lucide-react';

export default function SystemTab() {
  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">CPU Usage</p>
                <p className="text-2xl font-bold text-green-400">23%</p>
              </div>
              <Cpu className="w-8 h-8 text-green-400" />
            </div>
            <Progress value={23} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Memory</p>
                <p className="text-2xl font-bold text-yellow-400">67%</p>
              </div>
              <MemoryStick className="w-8 h-8 text-yellow-400" />
            </div>
            <Progress value={67} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Disk Space</p>
                <p className="text-2xl font-bold text-red-400">89%</p>
              </div>
              <HardDrive className="w-8 h-8 text-red-400" />
            </div>
            <Progress value={89} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Database</p>
                <Badge className="bg-green-600/20 text-green-400 border-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Healthy
                </Badge>
              </div>
              <Database className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Services Status */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Server className="w-5 h-5 mr-2 text-blue-400" />
            System Services
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Web Server', status: 'running', uptime: '15 days' },
              { name: 'Database Server', status: 'running', uptime: '15 days' },
              { name: 'Cache Server', status: 'running', uptime: '12 days' },
              { name: 'Background Jobs', status: 'warning', uptime: '2 hours' },
            ].map((service, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    service.status === 'running' ? 'bg-green-400' : 'bg-yellow-400'
                  } animate-pulse`}></div>
                  <span className="text-white font-medium">{service.name}</span>
                </div>
                <div className="text-right">
                  <Badge className={service.status === 'running' ? 
                    'bg-green-600/20 text-green-400 border-green-600' : 
                    'bg-yellow-600/20 text-yellow-400 border-yellow-600'
                  }>
                    {service.status === 'running' ? 'Running' : 'Warning'}
                  </Badge>
                  <p className="text-xs text-gray-400 mt-1">Uptime: {service.uptime}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}