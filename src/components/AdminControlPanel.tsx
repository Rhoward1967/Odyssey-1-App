import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Shield,
  Users,
  Database,
  Activity,
  Settings,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SystemStatus {
  database: 'healthy' | 'warning' | 'error';
  api: 'healthy' | 'warning' | 'error';
  storage: 'healthy' | 'warning' | 'error';
  functions: 'healthy' | 'warning' | 'error';
}

export default function AdminControlPanel() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: 'healthy',
    api: 'healthy',
    storage: 'warning',
    functions: 'healthy',
  });
  const [activeUsers, setActiveUsers] = useState(12);
  const [totalEmployees, setTotalEmployees] = useState(45);
  const [pendingApprovals, setPendingApprovals] = useState(3);

  const checkSystemHealth = async () => {
    try {
      // Test database connection
      const { error: dbError } = await supabase
        .from('employees')
        .select('count')
        .limit(1);

      // Test function availability
      const { error: funcError } = await supabase.functions.invoke(
        'time-clock-manager',
        {
          body: { action: 'health-check' },
        }
      );

      setSystemStatus(prev => ({
        ...prev,
        database: dbError ? 'error' : 'healthy',
        functions: funcError ? 'warning' : 'healthy',
      }));
    } catch (error) {
      console.error('Health check failed:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className='w-4 h-4 text-green-500' />;
      case 'warning':
        return <AlertTriangle className='w-4 h-4 text-yellow-500' />;
      case 'error':
        return <AlertTriangle className='w-4 h-4 text-red-500' />;
      default:
        return <AlertTriangle className='w-4 h-4 text-gray-500' />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className='space-y-6 p-6'>
      <div className='flex items-center justify-end'>
        <div className='flex gap-2'>
          <Button onClick={checkSystemHealth} variant='outline'>
            <Activity className='w-4 h-4 mr-2' />
            Health Check
          </Button>
          <Badge className='bg-red-600 text-white'>ADMIN ACCESS</Badge>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Active Users
                </p>
                <p className='text-2xl font-bold text-blue-600'>
                  {activeUsers}
                </p>
              </div>
              <Users className='w-8 h-8 text-blue-600' />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Total Employees
                </p>
                <p className='text-2xl font-bold text-green-600'>
                  {totalEmployees}
                </p>
              </div>
              <Users className='w-8 h-8 text-green-600' />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Pending Approvals
                </p>
                <p className='text-2xl font-bold text-orange-600'>
                  {pendingApprovals}
                </p>
              </div>
              <AlertTriangle className='w-8 h-8 text-orange-600' />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  System Status
                </p>
                <p className='text-sm font-bold text-green-600'>
                  All Systems Operational
                </p>
              </div>
              <CheckCircle className='w-8 h-8 text-green-600' />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue='system' className='w-full'>
        <TabsList className='flex overflow-x-auto gap-2 md:grid md:grid-cols-4 md:gap-0'>
          <TabsTrigger value='system' className='flex-shrink-0 md:w-full'>
            <span className='md:hidden'>Sys</span>
            <span className='hidden md:inline'>System Status</span>
          </TabsTrigger>
          <TabsTrigger value='users' className='flex-shrink-0 md:w-full'>
            <span className='md:hidden'>Users</span>
            <span className='hidden md:inline'>User Management</span>
          </TabsTrigger>
          <TabsTrigger value='database' className='flex-shrink-0 md:w-full'>
            <span className='md:hidden'>DB</span>
            <span className='hidden md:inline'>Database</span>
          </TabsTrigger>
          <TabsTrigger value='settings' className='flex-shrink-0 md:w-full'>
            <span className='md:hidden'>Set</span>
            <span className='hidden md:inline'>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value='system'>
          <Card>
            <CardHeader>
              <CardTitle>System Health Monitor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {Object.entries(systemStatus).map(([service, status]) => (
                  <div
                    key={service}
                    className='flex items-center justify-between p-3 border rounded-lg'
                  >
                    <div className='flex items-center gap-3'>
                      {getStatusIcon(status)}
                      <div>
                        <p className='font-medium capitalize'>{service}</p>
                        <p className='text-sm text-gray-600'>
                          {service === 'database' &&
                            'PostgreSQL connection and queries'}
                          {service === 'api' &&
                            'REST API endpoints and authentication'}
                          {service === 'storage' && 'File storage and backups'}
                          {service === 'functions' &&
                            'Edge functions and serverless operations'}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(status)}>
                      {status.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='users'>
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex justify-between items-center'>
                  <h3 className='text-lg font-medium'>Active Sessions</h3>
                  <Button size='sm'>View All Users</Button>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='p-4 bg-blue-50 rounded-lg'>
                    <h4 className='font-medium text-blue-800'>
                      Administrators
                    </h4>
                    <p className='text-2xl font-bold text-blue-600'>3</p>
                    <p className='text-sm text-blue-600'>Currently online</p>
                  </div>
                  <div className='p-4 bg-green-50 rounded-lg'>
                    <h4 className='font-medium text-green-800'>Employees</h4>
                    <p className='text-2xl font-bold text-green-600'>
                      {activeUsers - 3}
                    </p>
                    <p className='text-sm text-green-600'>Currently online</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='database'>
          <Card>
            <CardHeader>
              <CardTitle>Database Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div className='p-4 bg-purple-50 rounded-lg'>
                    <h4 className='font-medium text-purple-800'>Tables</h4>
                    <p className='text-2xl font-bold text-purple-600'>15</p>
                    <p className='text-sm text-purple-600'>Active tables</p>
                  </div>
                  <div className='p-4 bg-indigo-50 rounded-lg'>
                    <h4 className='font-medium text-indigo-800'>Records</h4>
                    <p className='text-2xl font-bold text-indigo-600'>2,847</p>
                    <p className='text-sm text-indigo-600'>Total records</p>
                  </div>
                  <div className='p-4 bg-pink-50 rounded-lg'>
                    <h4 className='font-medium text-pink-800'>Storage</h4>
                    <p className='text-2xl font-bold text-pink-600'>156 MB</p>
                    <p className='text-sm text-pink-600'>Database size</p>
                  </div>
                </div>
                <div className='flex gap-2'>
                  <Button variant='outline'>
                    <Database className='w-4 h-4 mr-2' />
                    Backup Database
                  </Button>
                  <Button variant='outline'>
                    <Activity className='w-4 h-4 mr-2' />
                    Performance Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='settings'>
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex items-center justify-between p-3 border rounded-lg'>
                  <div>
                    <p className='font-medium'>Automatic Backups</p>
                    <p className='text-sm text-gray-600'>
                      Daily database backups at 2 AM
                    </p>
                  </div>
                  <Badge className='bg-green-100 text-green-800'>Enabled</Badge>
                </div>
                <div className='flex items-center justify-between p-3 border rounded-lg'>
                  <div>
                    <p className='font-medium'>Email Notifications</p>
                    <p className='text-sm text-gray-600'>
                      System alerts and user notifications
                    </p>
                  </div>
                  <Badge className='bg-green-100 text-green-800'>Enabled</Badge>
                </div>
                <div className='flex items-center justify-between p-3 border rounded-lg'>
                  <div>
                    <p className='font-medium'>Maintenance Mode</p>
                    <p className='text-sm text-gray-600'>
                      Disable user access during updates
                    </p>
                  </div>
                  <Badge className='bg-gray-100 text-gray-800'>Disabled</Badge>
                </div>
                <Button className='w-full'>
                  <Settings className='w-4 h-4 mr-2' />
                  Advanced Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
