import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabaseClient';
import { DollarSign, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';

interface CostData {
  service: string;
  totalCost?: number;
  fees?: number;
  estimated?: boolean;
  error?: string;
  requests?: number;
  transactions?: number;
  totalRevenue?: number;
}

interface CostResponse {
  success: boolean;
  totalCosts: number;
  breakdown: Record<string, CostData>;
  lastUpdated: string;
}

export default function RealCostDashboard() {
  const [costData, setCostData] = useState<CostResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState('30d');

  const fetchRealCosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('comprehensive-cost-tracker', {
        body: { service: 'all', timeframe }
      });

      if (error) throw error;
      setCostData(data);
    } catch (error) {
      console.error('Error fetching costs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealCosts();
  }, [timeframe]);

  const getServiceIcon = (service: string) => {
    const icons = {
      openai: '🤖',
      anthropic: '🧠',
      stripe: '💳',
      twilio: '📱',
      supabase: '🗄️',
      vercel: '▲',
      github: '🐙',
      google: '🔍'
    };
    return icons[service as keyof typeof icons] || '💼';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Odyssey-1 Real Cost Tracking</h2>
          <p className="text-muted-foreground">Monitor actual spending across all integrated services</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button onClick={fetchRealCosts} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {costData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Monthly Costs</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(costData.totalCosts)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(costData.lastUpdated).toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue (Stripe)</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {costData.breakdown.stripe?.totalRevenue 
                    ? formatCurrency(costData.breakdown.stripe.totalRevenue)
                    : 'N/A'
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  {costData.breakdown.stripe?.transactions || 0} transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  (costData.breakdown.stripe?.totalRevenue || 0) - costData.totalCosts > 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {formatCurrency((costData.breakdown.stripe?.totalRevenue || 0) - costData.totalCosts)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Revenue - Total Costs
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Service Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(costData.breakdown).map(([service, data]) => (
                  <div key={service} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getServiceIcon(service)}</span>
                        <span className="font-medium capitalize">{service}</span>
                      </div>
                      {data.estimated && (
                        <Badge variant="secondary">Estimated</Badge>
                      )}
                    </div>
                    
                    {data.error ? (
                      <p className="text-red-500 text-sm">{data.error}</p>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-lg font-bold">
                          {formatCurrency(data.totalCost || data.fees || 0)}
                        </p>
                        {data.requests && (
                          <p className="text-xs text-muted-foreground">
                            {data.requests.toLocaleString()} requests
                          </p>
                        )}
                        {data.transactions && (
                          <p className="text-xs text-muted-foreground">
                            {data.transactions} transactions
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}