import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface CostData {
  totalSpent: number;
  dailySpent: number;
  monthlyBudget: number;
  supabaseUsage: number;
  apiCosts: number;
  functionCalls: number;
  storageUsage: number;
  alerts: Array<{
    type: 'warning' | 'danger';
    message: string;
    timestamp: string;
  }>;
}

export default function RealTimeCostMonitor() {
  const [costData, setCostData] = useState<CostData>({
    totalSpent: 0,
    dailySpent: 0,
    monthlyBudget: 100,
    supabaseUsage: 0,
    apiCosts: 0,
    functionCalls: 0,
    storageUsage: 0,
    alerts: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCostData();
    const interval = setInterval(fetchCostData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchCostData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('cost-optimization-engine', {
        body: { action: 'get_real_time_costs' }
      });

      if (data) {
        const newAlerts = [];
        
        // Check for budget alerts
        if (data.dailySpent > data.monthlyBudget * 0.8) {
          newAlerts.push({
            type: 'danger' as const,
            message: `Daily spending at ${((data.dailySpent / data.monthlyBudget) * 100).toFixed(1)}% of monthly budget`,
            timestamp: new Date().toISOString()
          });
        }

        if (data.apiCosts > 50) {
          newAlerts.push({
            type: 'warning' as const,
            message: `High API costs detected: $${data.apiCosts.toFixed(2)}`,
            timestamp: new Date().toISOString()
          });
        }

        setCostData({
          ...data,
          alerts: newAlerts
        });
      }
    } catch (error) {
      console.error('Error fetching cost data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const budgetUsagePercent = (costData.dailySpent / costData.monthlyBudget) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Real-Time Cost Monitor</h2>
        <Button onClick={fetchCostData} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {costData.alerts.length > 0 && (
        <div className="space-y-2">
          {costData.alerts.map((alert, index) => (
            <Alert key={index} variant={alert.type === 'danger' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${costData.dailySpent.toFixed(2)}</div>
            <Badge variant={budgetUsagePercent > 80 ? 'destructive' : budgetUsagePercent > 60 ? 'secondary' : 'default'}>
              {budgetUsagePercent.toFixed(1)}% of budget
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Supabase Usage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${costData.supabaseUsage.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">DB + Storage + Functions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Costs</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${costData.apiCosts.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">External API calls</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Function Calls</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{costData.functionCalls.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}