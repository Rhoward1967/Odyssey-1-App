import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, Database, Server, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface BackupStatus {
  type: string;
  lastBackup: string;
  status: 'success' | 'failed' | 'running';
  size: string;
}

export default function DisasterRecoverySystem() {
  const [backups] = useState<BackupStatus[]>([
    { type: 'Database', lastBackup: '2 hours ago', status: 'success', size: '2.3 GB' },
    { type: 'Files', lastBackup: '1 hour ago', status: 'success', size: '850 MB' },
    { type: 'Configuration', lastBackup: '30 min ago', status: 'success', size: '15 MB' },
    { type: 'User Data', lastBackup: '45 min ago', status: 'running', size: '1.2 GB' }
  ]);

  const [recoveryPlan] = useState({
    rto: '4 hours',
    rpo: '1 hour',
    lastTest: '7 days ago',
    nextTest: '23 days'
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'running': return <Clock className="w-4 h-4 text-blue-600 animate-spin" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Disaster Recovery System</h1>
        <Badge variant="outline" className="text-green-600 border-green-600">
          <Shield className="w-4 h-4 mr-2" />
          Protected
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">RTO</p>
                <p className="text-2xl font-bold">{recoveryPlan.rto}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">RPO</p>
                <p className="text-2xl font-bold">{recoveryPlan.rpo}</p>
              </div>
              <Database className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Test</p>
                <p className="text-2xl font-bold">{recoveryPlan.lastTest}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Next Test</p>
                <p className="text-2xl font-bold">{recoveryPlan.nextTest}</p>
              </div>
              <Server className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Backup Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {backups.map((backup, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(backup.status)}
                  <div>
                    <div className="font-medium">{backup.type} Backup</div>
                    <div className="text-sm text-gray-500">Last: {backup.lastBackup}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{backup.size}</div>
                  <Badge className={backup.status === 'success' ? 'bg-green-100 text-green-600' : 
                    backup.status === 'running' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}>
                    {backup.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recovery Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="outline">
              <Database className="w-4 h-4 mr-2" />
              Restore Database
            </Button>
            <Button className="w-full" variant="outline">
              <Server className="w-4 h-4 mr-2" />
              Failover to Backup Site
            </Button>
            <Button className="w-full" variant="outline">
              <Shield className="w-4 h-4 mr-2" />
              Test Recovery Plan
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span>Primary Site</span>
                  <Badge className="bg-green-100 text-green-600">Operational</Badge>
                </div>
                <Progress value={100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>Backup Site</span>
                  <Badge className="bg-green-100 text-green-600">Ready</Badge>
                </div>
                <Progress value={95} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>Data Sync</span>
                  <Badge className="bg-blue-100 text-blue-600">Syncing</Badge>
                </div>
                <Progress value={87} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}