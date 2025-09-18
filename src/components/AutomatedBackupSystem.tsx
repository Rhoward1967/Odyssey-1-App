import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Database, 
  Download, 
  Upload, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface BackupJob {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  schedule: string;
  last_run: string;
  next_run: string;
  status: 'completed' | 'running' | 'failed' | 'scheduled';
  size: string;
  duration: string;
}

interface BackupHistory {
  id: string;
  timestamp: string;
  type: string;
  status: 'success' | 'failed';
  size: string;
  duration: string;
  tables_backed_up: number;
}

export default function AutomatedBackupSystem() {
  const [backupJobs, setBackupJobs] = useState<BackupJob[]>([]);
  const [backupHistory, setBackupHistory] = useState<BackupHistory[]>([]);
  const [isBackupRunning, setIsBackupRunning] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);

  const initializeData = () => {
    const mockJobs: BackupJob[] = [
      {
        id: '1',
        name: 'Daily Full Backup',
        type: 'full',
        schedule: 'Daily at 2:00 AM',
        last_run: '2024-01-15 02:00:00',
        next_run: '2024-01-16 02:00:00',
        status: 'completed',
        size: '2.4 GB',
        duration: '12m 34s'
      },
      {
        id: '2',
        name: 'Hourly Incremental',
        type: 'incremental',
        schedule: 'Every hour',
        last_run: '2024-01-15 14:00:00',
        next_run: '2024-01-15 15:00:00',
        status: 'scheduled',
        size: '45 MB',
        duration: '2m 15s'
      },
      {
        id: '3',
        name: 'Weekly Archive',
        type: 'differential',
        schedule: 'Weekly on Sunday',
        last_run: '2024-01-14 03:00:00',
        next_run: '2024-01-21 03:00:00',
        status: 'completed',
        size: '890 MB',
        duration: '8m 42s'
      }
    ];

    const mockHistory: BackupHistory[] = [
      {
        id: '1',
        timestamp: '2024-01-15 14:00:00',
        type: 'Incremental',
        status: 'success',
        size: '45 MB',
        duration: '2m 15s',
        tables_backed_up: 12
      },
      {
        id: '2',
        timestamp: '2024-01-15 02:00:00',
        type: 'Full',
        status: 'success',
        size: '2.4 GB',
        duration: '12m 34s',
        tables_backed_up: 28
      },
      {
        id: '3',
        timestamp: '2024-01-14 13:00:00',
        type: 'Incremental',
        status: 'failed',
        size: '0 MB',
        duration: '0m 30s',
        tables_backed_up: 0
      }
    ];

    setBackupJobs(mockJobs);
    setBackupHistory(mockHistory);
  };

  const runManualBackup = async (type: 'full' | 'incremental' | 'differential') => {
    setIsBackupRunning(true);
    setBackupProgress(0);

    try {
      for (let i = 0; i <= 100; i += 5) {
        setBackupProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const newBackup: BackupHistory = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString(),
        type: type.charAt(0).toUpperCase() + type.slice(1),
        status: 'success',
        size: type === 'full' ? '2.4 GB' : '45 MB',
        duration: type === 'full' ? '12m 34s' : '2m 15s',
        tables_backed_up: type === 'full' ? 28 : 12
      };

      setBackupHistory(prev => [newBackup, ...prev]);
    } catch (error) {
      console.error('Backup failed:', error);
    } finally {
      setIsBackupRunning(false);
      setBackupProgress(0);
    }
  };

  const toggleBackupJob = (jobId: string) => {
    setBackupJobs(prev => 
      prev.map(job => 
        job.id === jobId 
          ? { 
              ...job, 
              status: job.status === 'scheduled' ? 'completed' : 'scheduled' 
            }
          : job
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'success': return 'bg-green-500';
      case 'running': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      case 'scheduled': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'running': return <Play className="w-4 h-4" />;
      case 'failed': return <AlertTriangle className="w-4 h-4" />;
      case 'scheduled': return <Clock className="w-4 h-4" />;
      default: return <Database className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    initializeData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Automated Backup System</h2>
          <p className="text-muted-foreground">Manage database backups and recovery operations</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-backup"
              checked={autoBackupEnabled}
              onCheckedChange={setAutoBackupEnabled}
            />
            <Label htmlFor="auto-backup">Auto Backup</Label>
          </div>
        </div>
      </div>

      {isBackupRunning && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Running backup...</span>
                <span>{backupProgress}%</span>
              </div>
              <Progress value={backupProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          onClick={() => runManualBackup('full')} 
          disabled={isBackupRunning}
          className="h-16"
        >
          <Database className="w-5 h-5 mr-2" />
          Full Backup
        </Button>
        <Button 
          onClick={() => runManualBackup('incremental')} 
          disabled={isBackupRunning}
          variant="outline"
          className="h-16"
        >
          <Upload className="w-5 h-5 mr-2" />
          Incremental Backup
        </Button>
        <Button 
          onClick={() => runManualBackup('differential')} 
          disabled={isBackupRunning}
          variant="outline"
          className="h-16"
        >
          <Download className="w-5 h-5 mr-2" />
          Differential Backup
        </Button>
      </div>

      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">Backup Jobs</TabsTrigger>
          <TabsTrigger value="history">Backup History</TabsTrigger>
          <TabsTrigger value="recovery">Recovery</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <div className="grid gap-4">
            {backupJobs.map((job) => (
              <Card key={job.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">{job.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getStatusColor(job.status)} text-white`}>
                      {getStatusIcon(job.status)}
                      <span className="ml-1 capitalize">{job.status}</span>
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleBackupJob(job.id)}
                    >
                      {job.status === 'scheduled' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-semibold capitalize">{job.type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Schedule</p>
                      <p className="font-semibold">{job.schedule}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Run</p>
                      <p className="font-semibold">{job.last_run}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Next Run</p>
                      <p className="font-semibold">{job.next_run}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="grid gap-4">
            {backupHistory.map((backup) => (
              <Card key={backup.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Badge className={`${getStatusColor(backup.status)} text-white`}>
                        {getStatusIcon(backup.status)}
                        <span className="ml-1 capitalize">{backup.status}</span>
                      </Badge>
                      <div>
                        <p className="font-semibold">{backup.type} Backup</p>
                        <p className="text-sm text-muted-foreground">{backup.timestamp}</p>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p><strong>Size:</strong> {backup.size}</p>
                      <p><strong>Duration:</strong> {backup.duration}</p>
                      <p><strong>Tables:</strong> {backup.tables_backed_up}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recovery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <RotateCcw className="w-5 h-5 mr-2" />
                Database Recovery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="recovery-point">Select Recovery Point</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose backup to restore from" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">Latest Full Backup (2024-01-15)</SelectItem>
                    <SelectItem value="yesterday">Yesterday's Backup (2024-01-14)</SelectItem>
                    <SelectItem value="week">Last Week's Backup (2024-01-08)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="recovery-type">Recovery Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recovery type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Database Recovery</SelectItem>
                    <SelectItem value="selective">Selective Table Recovery</SelectItem>
                    <SelectItem value="point-in-time">Point-in-Time Recovery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" variant="destructive">
                <RotateCcw className="w-4 h-4 mr-2" />
                Start Recovery Process
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}