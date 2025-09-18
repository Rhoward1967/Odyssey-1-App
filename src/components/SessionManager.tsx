import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Clock, Users, Monitor, Smartphone, Globe, LogOut, Shield } from 'lucide-react';

interface Session {
  id: string;
  userId: string;
  userEmail: string;
  device: string;
  browser: string;
  ipAddress: string;
  location: string;
  startTime: string;
  lastActivity: string;
  status: 'active' | 'idle' | 'expired';
  duration: number;
}

export default function SessionManager() {
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: '1',
      userId: 'admin-1',
      userEmail: 'admin@hjsservices.com',
      device: 'Desktop',
      browser: 'Chrome 118',
      ipAddress: '192.168.1.100',
      location: 'Atlanta, GA',
      startTime: '2025-09-16T08:00:00Z',
      lastActivity: '2025-09-16T10:05:00Z',
      status: 'active',
      duration: 125
    },
    {
      id: '2',
      userId: 'user-1',
      userEmail: 'user@example.com',
      device: 'Mobile',
      browser: 'Safari 17',
      ipAddress: '192.168.1.101',
      location: 'Miami, FL',
      startTime: '2025-09-16T09:30:00Z',
      lastActivity: '2025-09-16T09:45:00Z',
      status: 'idle',
      duration: 35
    }
  ]);

  const [sessionSettings, setSessionSettings] = useState({
    maxDuration: 480, // 8 hours
    idleTimeout: 30, // 30 minutes
    maxConcurrentSessions: 3,
    requireReauth: true
  });

  const terminateSession = (sessionId: string) => {
    setSessions(sessions.filter(s => s.id !== sessionId));
  };

  const getDeviceIcon = (device: string) => {
    return device === 'Mobile' ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      idle: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors];
  };

  const activeSessions = sessions.filter(s => s.status === 'active').length;
  const totalSessions = sessions.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Session Management</h2>
          <p className="text-muted-foreground">Monitor and control user sessions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{activeSessions}</p>
                <p className="text-xs text-muted-foreground">Active Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{totalSessions}</p>
                <p className="text-xs text-muted-foreground">Total Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{Math.round(sessions.reduce((acc, s) => acc + s.duration, 0) / sessions.length)}</p>
                <p className="text-xs text-muted-foreground">Avg Duration (min)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{sessionSettings.maxConcurrentSessions}</p>
                <p className="text-xs text-muted-foreground">Max Concurrent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Sessions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Current Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getDeviceIcon(session.device)}
                      <div>
                        <p className="font-semibold">{session.userEmail}</p>
                        <p className="text-sm text-muted-foreground">
                          {session.browser} • {session.location} • {session.ipAddress}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Started: {new Date(session.startTime).toLocaleString()} • Duration: {session.duration}m
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => terminateSession(session.id)}
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Session Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Max Session Duration (minutes)</label>
                  <input 
                    type="number" 
                    value={sessionSettings.maxDuration}
                    onChange={(e) => setSessionSettings({...sessionSettings, maxDuration: parseInt(e.target.value)})}
                    className="w-full mt-1 p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Idle Timeout (minutes)</label>
                  <input 
                    type="number" 
                    value={sessionSettings.idleTimeout}
                    onChange={(e) => setSessionSettings({...sessionSettings, idleTimeout: parseInt(e.target.value)})}
                    className="w-full mt-1 p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Max Concurrent Sessions</label>
                  <input 
                    type="number" 
                    value={sessionSettings.maxConcurrentSessions}
                    onChange={(e) => setSessionSettings({...sessionSettings, maxConcurrentSessions: parseInt(e.target.value)})}
                    className="w-full mt-1 p-2 border rounded"
                  />
                </div>
                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}