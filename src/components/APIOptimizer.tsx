import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Database, Clock, TrendingUp, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface CacheStats {
  hitRate: number;
  totalRequests: number;
  cacheSize: string;
  savedCosts: number;
}

interface APIEndpoint {
  name: string;
  calls: number;
  avgLatency: number;
  cost: number;
  cached: boolean;
}

export default function APIOptimizer() {
  const [cacheStats, setCacheStats] = useState<CacheStats>({
    hitRate: 87,
    totalRequests: 15420,
    cacheSize: '2.4 GB',
    savedCosts: 234.50
  });
  
  const [endpoints] = useState<APIEndpoint[]>([
    { name: 'User Profiles', calls: 5420, avgLatency: 120, cost: 54.20, cached: true },
    { name: 'Market Data', calls: 3200, avgLatency: 340, cost: 96.00, cached: false },
    { name: 'Analytics', calls: 2800, avgLatency: 80, cost: 28.00, cached: true },
    { name: 'Notifications', calls: 4000, avgLatency: 200, cost: 40.00, cached: false }
  ]);

  const [isOptimizing, setIsOptimizing] = useState(false);
  const { toast } = useToast();

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      const { data, error } = await supabase.functions.invoke('cost-optimization-engine', {
        body: { action: 'optimize_api_calls' }
      });

      if (error) throw error;

      toast({
        title: "Optimization Complete",
        description: "API caching and query optimization applied."
      });
    } catch (error) {
      toast({
        title: "Optimization Failed",
        description: "Unable to apply optimizations.",
        variant: "destructive"
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            API Performance Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{cacheStats.hitRate}%</div>
              <div className="text-sm text-muted-foreground">Cache Hit Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{cacheStats.totalRequests.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{cacheStats.cacheSize}</div>
              <div className="text-sm text-muted-foreground">Cache Size</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${cacheStats.savedCosts}</div>
              <div className="text-sm text-muted-foreground">Costs Saved</div>
            </div>
          </div>

          <Tabs defaultValue="endpoints">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
              <TabsTrigger value="optimization">Optimization</TabsTrigger>
            </TabsList>
            
            <TabsContent value="endpoints" className="space-y-4">
              {endpoints.map((endpoint, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{endpoint.name}</h4>
                      <Badge variant={endpoint.cached ? "default" : "secondary"}>
                        {endpoint.cached ? "Cached" : "Not Cached"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div>{endpoint.calls.toLocaleString()} calls</div>
                      <div>{endpoint.avgLatency}ms avg</div>
                      <div>${(endpoint.cost || 0).toFixed(2)} cost</div>
                    </div>
                  </div>
                  <Progress value={endpoint.cached ? 85 : 45} className="w-20" />
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="optimization" className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-medium">Optimization Recommendations</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Enable caching for Market Data endpoint (96% cost reduction)
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Implement query batching for Notifications (40% latency reduction)
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Add CDN caching for static assets (60% faster load times)
                  </li>
                </ul>
                
                <Button onClick={handleOptimize} disabled={isOptimizing} className="w-full">
                  <RefreshCw className={`h-4 w-4 mr-2 ${isOptimizing ? 'animate-spin' : ''}`} />
                  {isOptimizing ? 'Optimizing...' : 'Apply Optimizations'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}