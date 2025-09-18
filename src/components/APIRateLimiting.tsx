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
  Zap, 
  Shield, 
  Clock, 
  TrendingUp, 
  AlertCircle, 
  Settings, 
  BarChart3,
  Users,
  Globe,
  Ban
} from 'lucide-react';

interface RateLimit {
  id: string;
  endpoint: string;
  method: string;
  limit: number;
  window: string;
  current: number;
  status: 'active' | 'exceeded' | 'warning';
}

interface APIUser {
  id: string;
  name: string;
  apiKey: string;
  requestsToday: number;
  dailyLimit: number;
  status: 'active' | 'suspended' | 'blocked';
  lastRequest: string;
}

const APIRateLimiting = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');

  const rateLimits: RateLimit[] = [
    {
      id: '1',
      endpoint: '/api/v1/users',
      method: 'GET',
      limit: 1000,
      window: '1 hour',
      current: 750,
      status: 'warning'
    },
    {
      id: '2',
      endpoint: '/api/v1/auth',
      method: 'POST',
      limit: 100,
      window: '1 hour',
      current: 45,
      status: 'active'
    },
    {
      id: '3',
      endpoint: '/api/v1/data',
      method: 'GET',
      limit: 5000,
      window: '1 hour',
      current: 5000,
      status: 'exceeded'
    },
    {
      id: '4',
      endpoint: '/api/v1/upload',
      method: 'POST',
      limit: 50,
      window: '1 hour',
      current: 12,
      status: 'active'
    }
  ];

  const apiUsers: APIUser[] = [
    {
      id: '1',
      name: 'Mobile App',
      apiKey: 'sk-mob***************',
      requestsToday: 2450,
      dailyLimit: 10000,
      status: 'active',
      lastRequest: '2 minutes ago'
    },
    {
      id: '2',
      name: 'Web Dashboard',
      apiKey: 'sk-web***************',
      requestsToday: 8900,
      dailyLimit: 10000,
      status: 'active',
      lastRequest: '30 seconds ago'
    },
    {
      id: '3',
      name: 'Analytics Service',
      apiKey: 'sk-ana***************',
      requestsToday: 15000,
      dailyLimit: 15000,
      status: 'blocked',
      lastRequest: '1 hour ago'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'exceeded': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-orange-100 text-orange-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Zap className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold">API Rate Limiting</h1>
          <p className="text-gray-600">Monitor and control API usage and rate limits</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold">45.2K</p>
                <p className="text-xs text-green-600">+12% from yesterday</p>
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
                <p className="text-sm text-gray-600">Rate Limited</p>
                <p className="text-2xl font-bold">127</p>
                <p className="text-xs text-red-600">+5% from yesterday</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active APIs</p>
                <p className="text-2xl font-bold">23</p>
                <p className="text-xs text-green-600">2 new this week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Ban className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Blocked IPs</p>
                <p className="text-2xl font-bold">8</p>
                <p className="text-xs text-gray-600">Last 24 hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="endpoints" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="endpoints" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Endpoints
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            API Users
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Endpoint Rate Limits</CardTitle>
              <CardDescription>Monitor rate limits for API endpoints</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-center">
                <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">Last Hour</SelectItem>
                    <SelectItem value="24h">Last 24h</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>

              <div className="space-y-4">
                {rateLimits.map((limit) => (
                  <Card key={limit.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{limit.method}</Badge>
                          <span className="font-mono text-sm">{limit.endpoint}</span>
                        </div>
                        <Badge className={getStatusColor(limit.status)}>
                          {limit.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Usage: {limit.current}/{limit.limit} requests per {limit.window}</span>
                          <span>{getUsagePercentage(limit.current, limit.limit).toFixed(1)}%</span>
                        </div>
                        <Progress 
                          value={getUsagePercentage(limit.current, limit.limit)} 
                          className="h-2"
                        />
                      </div>

                      <div className="flex justify-end mt-3">
                        <Button variant="outline" size="sm">
                          Configure
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Users</CardTitle>
              <CardDescription>Manage API keys and user limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {apiUsers.map((user) => (
                  <Card key={user.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h4 className="font-medium">{user.name}</h4>
                            <Badge className={getStatusColor(user.status)}>
                              {user.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 font-mono">{user.apiKey}</p>
                          <p className="text-xs text-gray-500">Last request: {user.lastRequest}</p>
                        </div>
                        
                        <div className="text-right space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">{user.requestsToday.toLocaleString()}</span>
                            <span className="text-gray-500">/{user.dailyLimit.toLocaleString()}</span>
                          </div>
                          <Progress 
                            value={getUsagePercentage(user.requestsToday, user.dailyLimit)} 
                            className="h-2 w-32"
                          />
                          <Button variant="outline" size="sm">
                            Manage
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rate Limiting Settings</CardTitle>
              <CardDescription>Configure global rate limiting policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Enable Rate Limiting</h4>
                    <p className="text-sm text-gray-600">Apply rate limits to all API endpoints</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Auto-block Abusive IPs</h4>
                    <p className="text-sm text-gray-600">Automatically block IPs that exceed limits</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Send Rate Limit Headers</h4>
                    <p className="text-sm text-gray-600">Include rate limit info in response headers</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Default Rate Limit (requests per hour)</label>
                  <Input type="number" defaultValue="1000" className="w-32" />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Burst Allowance (%)</label>
                  <Input type="number" defaultValue="20" className="w-32" />
                </div>
              </div>

              <div className="flex gap-3">
                <Button>Save Settings</Button>
                <Button variant="outline">Reset to Defaults</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default APIRateLimiting;