import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Database, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  Settings,
  Download,
  Upload,
  HardDrive
} from 'lucide-react';

interface BackupJob {
  id: string;
  name: string;
  type: string;
  schedule: string;
  lastRun: string;
  nextRun: string;
  status: 'success' | 'failed' | 'running' | 'scheduled';
  size: string;
}

const DataBackupScheduler = () => {
  const [selectedFrequency, setSelectedFrequency] = useState('daily');

  const backupJobs: BackupJob[] = [
    {
      id: '1',
      name: 'User Database',
      type: 'Full Backup',
      schedule: 'Daily at 2:00 AM',
      lastRun: '2024-01-15 02:00',
      nextRun: '2024-01-16 02:00',
      status: 'success',
      size: '2.4 GB'
    },
    {
      id: '2',
      name: 'Application Logs',
      type: 'Incremental',
      schedule: 'Every 6 hours',
      lastRun: '2024-01-15 12:00',
      nextRun: '2024-01-15 18:00',
      status: 'running',
      size: '450 MB'
    },
    {
      id: '3',
      name: 'Configuration Files',
      type: 'Full Backup',
      schedule: 'Weekly on Sunday',
      lastRun: '2024-01-14 01:00',
      nextRun: '2024-01-21 01:00',
      status: 'success',
      size: '15 MB'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      case 'running': return <Clock className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Database className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold">Data Backup Scheduler</h1>
          <p className="text-gray-600">Manage automated data backups and recovery</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Successful Backups</p>
                <p className="text-2xl font-bold">156</p>
                <p className="text-xs text-green-600">Last 30 days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <HardDrive className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Storage Used</p>
                <p className="text-2xl font-bold">47.2 GB</p>
                <p className="text-xs text-blue-600">of 100 GB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold">8</p>
                <p className="text-xs text-yellow-600">2 running now</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Failed Jobs</p>
                <p className="text-2xl font-bold">2</p>
                <p className="text-xs text-red-600">Need attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="jobs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="jobs">Backup Jobs</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Backup Jobs</CardTitle>
              <CardDescription>Monitor and manage backup operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <Button>Create New Job</Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
              </div>

              <div className="space-y-4">
                {backupJobs.map((job) => (
                  <Card key={job.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h4 className="font-medium">{job.name}</h4>
                            <Badge variant="outline">{job.type}</Badge>
                            <Badge className={getStatusColor(job.status)}>
                              {getStatusIcon(job.status)}
                              {job.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{job.schedule}</p>
                          <div className="flex gap-4 text-xs text-gray-500">
                            <span>Last: {job.lastRun}</span>
                            <span>Next: {job.nextRun}</span>
                            <span>Size: {job.size}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm">Run Now</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Backup Schedule</CardTitle>
              <CardDescription>Configure backup timing and frequency</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Backup Frequency</label>
                  <Select value={selectedFrequency} onValueChange={setSelectedFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Every Hour</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Backup Time</label>
                  <Input type="time" defaultValue="02:00" />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Retention Period (days)</label>
                  <Input type="number" defaultValue="30" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Auto-cleanup Old Backups</h4>
                    <p className="text-sm text-gray-600">Remove backups older than retention period</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <Button>Save Schedule</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Backup Settings</CardTitle>
              <CardDescription>Configure backup preferences and storage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Storage Location</label>
                  <Select defaultValue="s3">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local Storage</SelectItem>
                      <SelectItem value="s3">Amazon S3</SelectItem>
                      <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                      <SelectItem value="azure">Azure Blob Storage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Compression Level</label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Compression</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Encrypt Backups</h4>
                    <p className="text-sm text-gray-600">Use AES-256 encryption for backup files</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Send alerts for backup status</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataBackupScheduler;