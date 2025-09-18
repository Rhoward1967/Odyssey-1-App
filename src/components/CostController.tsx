import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, DollarSign, Zap, Database, Trash2 } from 'lucide-react';

export function CostController() {
  const [costs, setCosts] = useState({
    apiCalls: 247,
    dbQueries: 1832,
    storage: 2.3,
    bandwidth: 15.7,
    functions: 89
  });

  const [budgetAlert, setBudgetAlert] = useState(false);
  const monthlyBudget = 833.33;
  const currentSpend = 312.45;
  const utilization = (currentSpend / monthlyBudget) * 100;

  useEffect(() => {
    if (utilization > 75) setBudgetAlert(true);
  }, [utilization]);

  const resetApp = () => {
    if (confirm('Reset app data to save costs? This will clear cache and optimize resources.')) {
      // Reset logic here
      setCosts(prev => ({ ...prev, apiCalls: 0, dbQueries: 0 }));
    }
  };

  const optimizeResources = () => {
    // Cleanup unused resources
    setCosts(prev => ({
      ...prev,
      storage: prev.storage * 0.8,
      bandwidth: prev.bandwidth * 0.9
    }));
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