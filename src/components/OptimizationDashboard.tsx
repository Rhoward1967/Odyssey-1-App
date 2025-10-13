import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, DollarSign, Settings, Zap } from 'lucide-react';
import APIOptimizer from './APIOptimizer';
import CostAlertManager from './CostAlertManager';
import DatabaseQueryAnalyzer from './DatabaseQueryAnalyzer';
import RevenueTracker from './RevenueTracker';

export default function OptimizationDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            System Optimization Center
          </h1>
          <p className="text-muted-foreground">
            Monitor performance, optimize costs, and track revenue milestones
          </p>
        </div>

        <Tabs defaultValue="api" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1">
            <TabsTrigger value="api" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-1 md:px-3">
              <Zap className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden md:inline">API Optimization</span>
              <span className="md:hidden">API</span>
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-1 md:px-3">
              <Database className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden md:inline">Database Queries</span>
              <span className="md:hidden">DB</span>
            </TabsTrigger>
            <TabsTrigger value="costs" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-1 md:px-3">
              <Settings className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden md:inline">Cost Monitoring</span>
              <span className="md:hidden">Cost</span>
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Revenue Tracking
            </TabsTrigger>
          </TabsList>

          <TabsContent value="api">
            <APIOptimizer />
          </TabsContent>

          <TabsContent value="database">
            <DatabaseQueryAnalyzer />
          </TabsContent>

          <TabsContent value="costs">
            <CostAlertManager />
          </TabsContent>

          <TabsContent value="revenue">
            <RevenueTracker />
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <Zap className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="font-medium">API Caching</div>
                <div className="text-sm text-muted-foreground">87% hit rate</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <Database className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="font-medium">Query Performance</div>
                <div className="text-sm text-muted-foreground">78% optimized</div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg text-center">
                <Settings className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                <div className="font-medium">Cost Alerts</div>
                <div className="text-sm text-muted-foreground">3 active</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <div className="font-medium">Revenue Growth</div>
                <div className="text-sm text-muted-foreground">+23.5%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}