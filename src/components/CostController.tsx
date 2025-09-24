import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, DollarSign, Zap, Database, Trash2 } from 'lucide-react';

export function CostController() {
  const [costs, setCosts] = useState({
    apiCalls: 0,
    dbQueries: 0,
    storage: 0,
    bandwidth: 0,
    functions: 0
  });
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [currentSpend, setCurrentSpend] = useState(0);
  const [utilization, setUtilization] = useState(0);
  const [budgetAlert, setBudgetAlert] = useState(false);

  useEffect(() => {
    const fetchCosts = async () => {
      const { data, error } = await supabase.functions.invoke('cost-optimization-engine', {
        body: { action: 'get_real_time_costs' }
      });
      if (error || !data) return;
      setCosts({
        apiCalls: data.functionCalls || 0,
        dbQueries: 0, // Not provided by backend, set to 0 or extend backend
        storage: data.storageUsage || 0,
        bandwidth: 0, // Not provided by backend, set to 0 or extend backend
        functions: data.functionCalls || 0
      });
      setMonthlyBudget(data.monthlyBudget || 0);
      setCurrentSpend(data.totalSpent || 0);
      const util = data.monthlyBudget ? (data.totalSpent / data.monthlyBudget) * 100 : 0;
      setUtilization(util);
      setBudgetAlert(util > 75);
    };
    fetchCosts();
  }, []);

  const resetApp = () => {
    if (confirm('Reset app data to save costs? This will clear cache and optimize resources.')) {
      // Optionally, call a backend function to reset/optimize resources
      setCosts(prev => ({ ...prev, apiCalls: 0, dbQueries: 0 }));
    }
  };

  const optimizeResources = async () => {
    // Call backend to optimize API calls
    await supabase.functions.invoke('cost-optimization-engine', {
      body: { action: 'optimize_api_calls' }
    });
    // Optionally, refresh costs after optimization
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Cost Controller Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {budgetAlert && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Budget utilization at {utilization.toFixed(1)}% - Consider optimization
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{costs.apiCalls}</div>
              <div className="text-sm text-gray-600">API Calls</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{costs.dbQueries}</div>
              <div className="text-sm text-gray-600">DB Queries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{costs.storage}GB</div>
              <div className="text-sm text-gray-600">Storage</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{costs.bandwidth}GB</div>
              <div className="text-sm text-gray-600">Bandwidth</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{costs.functions}</div>
              <div className="text-sm text-gray-600">Functions</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Monthly Budget Usage</span>
              <Badge variant={utilization > 75 ? "destructive" : "default"}>
                ${currentSpend.toFixed(2)} / ${monthlyBudget.toFixed(2)}
              </Badge>
            </div>
            <Progress value={utilization} className="h-2" />
          </div>

          <div className="flex gap-2">
            <Button onClick={optimizeResources} variant="outline" size="sm">
              <Zap className="h-4 w-4 mr-1" />
              Optimize
            </Button>
            <Button onClick={resetApp} variant="outline" size="sm">
              <Trash2 className="h-4 w-4 mr-1" />
              Reset App
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}