import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { DollarSign, TrendingUp, Users, Activity, Calendar, Download } from 'lucide-react';

interface RevenueData {
  date: string;
  total_revenue: number;
  subscription_revenue: number;
  payperuse_revenue: number;
  new_subscriptions: number;
  cancelled_subscriptions: number;
  active_subscribers: number;
  total_queries: number;
}

export default function AdminRevenueDashboard() {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadRevenueData();
  }, [timeRange]);

  const loadRevenueData = async () => {
    try {
      setLoading(true);
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data } = await supabase
        .from('admin_revenue_analytics')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      setRevenueData(data || []);
    } catch (error) {
      console.error('Error loading revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const csv = [
      'Date,Total Revenue,Subscription Revenue,Pay-per-use Revenue,New Subs,Cancelled Subs,Active Subs,Total Queries',
      ...revenueData.map(row => 
        `${row.date},${row.total_revenue},${row.subscription_revenue},${row.payperuse_revenue},${row.new_subscriptions},${row.cancelled_subscriptions},${row.active_subscribers},${row.total_queries}`
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-analytics-${timeRange}.csv`;
    a.click();
  };

  if (loading) return <div className="animate-pulse">Loading revenue data...</div>;

  const latestData = revenueData[revenueData.length - 1];
  const totalRevenue = revenueData.reduce((sum, day) => sum + day.total_revenue, 0);
  const avgDailyRevenue = totalRevenue / revenueData.length;
  const totalQueries = revenueData.reduce((sum, day) => sum + day.total_queries, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Revenue Analytics</h2>
          <p className="text-gray-600">Track subscription and usage revenue</p>
        </div>
        <div className="flex gap-2">
          {[
            { key: '7d', label: '7D' },
            { key: '30d', label: '30D' },
            { key: '90d', label: '90D' }
          ].map(range => (
            <Button
              key={range.key}
              variant={timeRange === range.key ? 'default' : 'outline'}
              onClick={() => setTimeRange(range.key as any)}
            >
              {range.label}
            </Button>
          ))}
          <Button variant="outline" onClick={exportData}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Revenue Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">${Math.round(totalRevenue).toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Daily Average</p>
                <p className="text-2xl font-bold">${Math.round(avgDailyRevenue).toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Subscribers</p>
                <p className="text-2xl font-bold">{latestData?.active_subscribers?.toLocaleString() || 0}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Queries</p>
                <p className="text-2xl font-bold">{totalQueries.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-1">
            {revenueData.map((day, index) => {
              const maxRevenue = Math.max(...revenueData.map(d => d.total_revenue));
              const height = maxRevenue > 0 ? (day.total_revenue / maxRevenue) * 100 : 0;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="bg-green-500 w-full rounded-t transition-all hover:bg-green-600"
                    style={{ height: `${height}%`, minHeight: day.total_revenue > 0 ? '4px' : '0' }}
                    title={`${day.date}: $${day.total_revenue}`}
                  />
                  <span className="text-xs text-gray-500 mt-1 rotate-45 origin-left">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Subscription Revenue</span>
                <Badge className="bg-blue-500 text-white">
                  ${Math.round(revenueData.reduce((sum, day) => sum + day.subscription_revenue, 0)).toLocaleString()}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Pay-per-use Revenue</span>
                <Badge className="bg-purple-500 text-white">
                  ${Math.round(revenueData.reduce((sum, day) => sum + day.payperuse_revenue, 0)).toLocaleString()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>New Subscriptions</span>
                <Badge className="bg-green-500 text-white">
                  +{revenueData.reduce((sum, day) => sum + day.new_subscriptions, 0)}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Cancelled Subscriptions</span>
                <Badge className="bg-red-500 text-white">
                  -{revenueData.reduce((sum, day) => sum + day.cancelled_subscriptions, 0)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}