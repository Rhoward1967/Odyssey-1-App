import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Activity, Zap, Database } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface APIUsage {
  provider: string;
  dailyCost: number;
  monthlyCost: number;
  requests: number;
  tokens?: number;
  limit: number;
  status: 'healthy' | 'warning' | 'critical';
}

export default function APIUsageTracker() {
  const [apiUsage, setApiUsage] = useState<APIUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchAPIUsage();
    const interval = setInterval(fetchAPIUsage, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchAPIUsage = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('cost-optimization-engine', {
        body: { action: 'get_real_time_costs' }
      });

      if (data?.breakdown) {
        const usage: APIUsage[] = [
          {
            provider: 'OpenAI GPT-4',
            dailyCost: data.breakdown.openai,
            monthlyCost: data.breakdown.openai * 30,
            requests: 245,
            tokens: 50000,
            limit: 100,
            status: data.breakdown.openai > 2 ? 'warning' : 'healthy'
          },
          {
            provider: 'Anthropic Claude',
            dailyCost: data.breakdown.anthropic,
            monthlyCost: data.breakdown.anthropic * 30,
            requests: 156,
            tokens: 30000,
            limit: 80,
            status: data.breakdown.anthropic > 1.5 ? 'warning' : 'healthy'
          },
          {
            provider: 'HuggingFace',
            dailyCost: data.breakdown.huggingface,
            monthlyCost: data.breakdown.huggingface * 30,
            requests: 89,
            tokens: 20000,
            limit: 50,
            status: 'healthy'
          },
          {
            provider: 'Supabase',
            dailyCost: data.breakdown.supabase,
            monthlyCost: data.breakdown.supabase * 30,
            requests: data.functionCalls,
            limit: 1000000,
            status: data.functionCalls > 100000 ? 'warning' : 'healthy'
          }
        ];
        
        setApiUsage(usage);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching API usage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': return <Activity className="h-4 w-4 text-red-500" />;
      case 'warning': return <Zap className="h-4 w-4 text-yellow-500" />;
      default: return <Database className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">API Usage Tracker</h2>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <Button onClick={fetchAPIUsage} variant="outline" size="sm" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {apiUsage.map((api, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {getStatusIcon(api.status)}
                  {api.provider}
                </CardTitle>
                <Badge variant={getStatusColor(api.status) as any}>
                  {api.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Daily Cost</p>
                  <p className="text-2xl font-bold">${(api.dailyCost || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Est.</p>
                  <p className="text-2xl font-bold">${(api.monthlyCost || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Requests</p>
                  <p className="text-2xl font-bold">{api.requests.toLocaleString()}</p>
                </div>
                {api.tokens && (
                  <div>
                    <p className="text-sm text-muted-foreground">Tokens</p>
                    <p className="text-2xl font-bold">{api.tokens.toLocaleString()}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Usage vs Limit</span>
                  <span>{((api.requests / api.limit) * 100).toFixed(1)}%</span>
                </div>
                <Progress value={(api.requests / api.limit) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}