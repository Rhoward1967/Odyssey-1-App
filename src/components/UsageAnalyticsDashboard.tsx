import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { BarChart3, TrendingUp, Calendar, Download, RefreshCw, Activity } from 'lucide-react';

interface UsageData {
  date: string;
  queries: number;
  cost: number;
}

interface UsageStats {
  total_queries: number;
  queries_this_month: number;
  avg_daily_queries: number;
  peak_usage_day: string;
  total_cost: number;
  monthly_cost: number;
}

export default function UsageAnalyticsDashboard() {
  const [usageData, setUsageData] = useState<UsageData[]>([]);
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadUsageAnalytics();
  }, [timeRange]);

  const loadUsageAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setLoading(true);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      startDate.setDate(endDate.getDate() - days);

      // Get usage data
      const { data: usage } = await supabase
        .from('ai_research_usage')
        .select('created_at, query_cost')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      // Process data for chart
      const dailyUsage: { [key: string]: { queries: number; cost: number } } = {};
      
      usage?.forEach(record => {
        const date = new Date(record.created_at).toISOString().split('T')[0];
        if (!dailyUsage[date]) {
          dailyUsage[date] = { queries: 0, cost: 0 };
        }
        dailyUsage[date].queries += 1;
        dailyUsage[date].cost += record.query_cost || 0;
      });

      const chartData = Object.entries(dailyUsage).map(([date, data]) => ({
        date,
        queries: data.queries,
        cost: data.cost
      }));

      setUsageData(chartData);

      // Calculate stats
      const totalQueries = usage?.length || 0;
      const totalCost = usage?.reduce((sum, record) => sum + (record.query_cost || 0), 0) || 0;
      const avgDaily = totalQueries / days;
      
      // Find peak usage day
      const peakDay = Object.entries(dailyUsage).reduce((peak, [date, data]) => 
        data.queries > peak.queries ? { date, queries: data.queries } : peak,
        { date: '', queries: 0 }
      );

      setStats({
        total_queries: totalQueries,
        queries_this_month: totalQueries,
        avg_daily_queries: Math.round(avgDaily * 10) / 10,
        peak_usage_day: peakDay.date,
        total_cost: Math.round(totalCost * 100) / 100,
        monthly_cost: Math.round(totalCost * 100) / 100
      });

    } catch (error) {
      console.error('Error loading usage analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    const csv = [
      'Date,Queries,Cost',
      ...usageData.map(row => `${row.date},${row.queries},${row.cost}`)
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usage-analytics-${timeRange}.csv`;
    a.click();
  };

  if (loading) return <div className="animate-pulse">Loading analytics...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Usage Analytics</h2>
          <p className="text-gray-600">Track your AI research usage patterns</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadUsageAnalytics}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportData}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        {[
          { key: '7d', label: 'Last 7 Days' },
          { key: '30d', label: 'Last 30 Days' },
          { key: '90d', label: 'Last 90 Days' }
        ].map(range => (
          <Button
            key={range.key}
            variant={timeRange === range.key ? 'default' : 'outline'}
            onClick={() => setTimeRange(range.key as any)}
          >
            {range.label}
          </Button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Queries</p>
                <p className="text-2xl font-bold">{stats?.total_queries || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Daily Average</p>
                <p className="text-2xl font-bold">{stats?.avg_daily_queries || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold">${stats?.total_cost || 0}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Peak Day</p>
                <p className="text-lg font-bold">
                  {stats?.peak_usage_day ? 
                    new Date(stats.peak_usage_day).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Usage Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-1">
            {usageData.length > 0 ? usageData.map((day, index) => {
              const maxQueries = Math.max(...usageData.map(d => d.queries));
              const height = maxQueries > 0 ? (day.queries / maxQueries) * 100 : 0;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="bg-blue-500 w-full rounded-t transition-all hover:bg-blue-600"
                    style={{ height: `${height}%`, minHeight: day.queries > 0 ? '4px' : '0' }}
                    title={`${day.date}: ${day.queries} queries, $${day.cost}`}
                  />
                  <span className="text-xs text-gray-500 mt-1 rotate-45 origin-left">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              );
            }) : (
              <div className="w-full text-center text-gray-500">
                No usage data for selected period
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}