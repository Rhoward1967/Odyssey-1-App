import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Activity, AlertTriangle, TrendingUp, HardDrive, Zap, CheckCircle, Clock } from 'lucide-react';

interface DatabaseMetrics {
  connections: { active: number; max: number };
  queries: { avgTime: number; slowQueries: number };
  storage: { used: number; total: number };
  performance: { score: number; status: string };
}

interface TableHealth {
  name: string;
  rows: number;
  size: string;
  lastVacuum: string;
  health: 'excellent' | 'good' | 'warning' | 'critical';
  issues: string[];
}

export default function DatabaseHealthDashboard() {
  const [metrics, setMetrics] = useState<DatabaseMetrics>({
    connections: { active: 45, max: 100 },
    queries: { avgTime: 125, slowQueries: 3 },
    storage: { used: 2.4, total: 10 },
    performance: { score: 87, status: 'Good' }
  });

  const [tableHealth, setTableHealth] = useState<TableHealth[]>([
    {
      name: 'app_users',
      rows: 15420,
      size: '245 MB',
      lastVacuum: '2 hours ago',
      health: 'excellent',
      issues: []
    },
    {
      name: 'conversations',
      rows: 89340,
      size: '1.2 GB',
      lastVacuum: '1 day ago',
      health: 'good',
      issues: ['Index fragmentation detected']
    },
    {
      name: 'training_datasets',
      rows: 2340,
      size: '890 MB',
      lastVacuum: '5 days ago',
      health: 'warning',
      issues: ['Needs vacuum', 'Missing index on created_at']
    },
    {
      name: 'subscriptions',
      rows: 8920,
      size: '156 MB',
      lastVacuum: '12 hours ago',
      health: 'excellent',
      issues: []
    }
  ]);

  const [recommendations, setRecommendations] = useState([
    {
      type: 'performance',
      priority: 'high',
      title: 'Add index on training_datasets.created_at',
      description: 'This will improve query performance by 65%',
      impact: 'High performance gain'
    },
    {
      type: 'maintenance',
      priority: 'medium',
      title: 'Schedule vacuum on training_datasets',
      description: 'Table has not been vacuumed in 5 days',
      impact: 'Reclaim storage space'
    },
    {
      type: 'security',
      priority: 'low',
      title: 'Review RLS policies on conversations',
      description: 'Some policies could be optimized',
      impact: 'Slight performance improvement'
    }
  ]);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const refreshMetrics = () => {
    // Simulate metric refresh
    setMetrics(prev => ({
      ...prev,
      connections: { ...prev.connections, active: Math.floor(Math.random() * 80) + 20 },
      queries: { ...prev.queries, avgTime: Math.floor(Math.random() * 200) + 50 },
      performance: { ...prev.performance, score: Math.floor(Math.random() * 30) + 70 }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-blue-500" />
              <span>Database Health Dashboard</span>
            </div>
            <Button onClick={refreshMetrics} variant="outline" size="sm">
              <Activity className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Connections</p>
                <p className="text-2xl font-bold">{metrics.connections.active}/{metrics.connections.max}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={(metrics.connections.active / metrics.connections.max) * 100} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Query Time</p>
                <p className="text-2xl font-bold">{metrics.queries.avgTime}ms</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">{metrics.queries.slowQueries} slow queries</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Storage Used</p>
                <p className="text-2xl font-bold">{metrics.storage.used}GB</p>
              </div>
              <HardDrive className="h-8 w-8 text-purple-500" />
            </div>
            <Progress value={(metrics.storage.used / metrics.storage.total) * 100} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Performance</p>
                <p className="text-2xl font-bold">{metrics.performance.score}/100</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">{metrics.performance.status}</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Views */}
      <Tabs defaultValue="tables" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tables">Table Health</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="tables">
          <Card>
            <CardHeader>
              <CardTitle>Table Health Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tableHealth.map((table, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(table.health)}`}>
                        {table.health.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{table.name}</div>
                        <div className="text-sm text-gray-600">
                          {table.rows.toLocaleString()} rows • {table.size} • Vacuumed {table.lastVacuum}
                        </div>
                        {table.issues.length > 0 && (
                          <div className="text-sm text-red-600 mt-1">
                            Issues: {table.issues.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                    {table.health === 'excellent' && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {table.health === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>Performance Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${getPriorityColor(rec.priority)}`}></div>
                        <div>
                          <div className="font-medium">{rec.title}</div>
                          <div className="text-sm text-gray-600 mt-1">{rec.description}</div>
                          <div className="text-xs text-blue-600 mt-2">{rec.impact}</div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Apply Fix
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button className="h-20 flex-col">
                  <Zap className="h-6 w-6 mb-2" />
                  Run VACUUM
                </Button>
                <Button className="h-20 flex-col" variant="outline">
                  <Database className="h-6 w-6 mb-2" />
                  Analyze Tables
                </Button>
                <Button className="h-20 flex-col" variant="outline">
                  <HardDrive className="h-6 w-6 mb-2" />
                  Reindex All
                </Button>
                <Button className="h-20 flex-col" variant="outline">
                  <Activity className="h-6 w-6 mb-2" />
                  Update Statistics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}