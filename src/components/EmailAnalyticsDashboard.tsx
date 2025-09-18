import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, Mail, MousePointer, Users, AlertTriangle } from 'lucide-react';

const EmailAnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('30d');

  const analyticsData = {
    overview: {
      totalSent: 15420,
      totalDelivered: 14892,
      totalOpened: 5234,
      totalClicked: 1456,
      totalBounced: 528,
      totalUnsubscribed: 89
    },
    rates: {
      deliveryRate: 96.6,
      openRate: 35.1,
      clickRate: 9.8,
      bounceRate: 3.4,
      unsubscribeRate: 0.6
    },
    campaigns: [
      {
        id: 1,
        name: 'Summer Sale 2024',
        sent: 2500,
        opened: 875,
        clicked: 245,
        openRate: 35.0,
        clickRate: 9.8,
        revenue: 12450
      },
      {
        id: 2,
        name: 'Product Launch',
        sent: 1800,
        opened: 720,
        clicked: 198,
        openRate: 40.0,
        clickRate: 11.0,
        revenue: 8900
      },
      {
        id: 3,
        name: 'Newsletter #45',
        sent: 3200,
        opened: 960,
        clicked: 192,
        openRate: 30.0,
        clickRate: 6.0,
        revenue: 3200
      }
    ],
    topPerformers: [
      { subject: 'Flash Sale: 50% Off Everything!', openRate: 45.2, clickRate: 12.8 },
      { subject: 'New Product Alert 🚨', openRate: 42.1, clickRate: 11.5 },
      { subject: 'Your Weekly Digest', openRate: 38.9, clickRate: 10.2 }
    ],
    deviceStats: [
      { device: 'Mobile', percentage: 65.2, opens: 3412 },
      { device: 'Desktop', percentage: 28.1, opens: 1471 },
      { device: 'Tablet', percentage: 6.7, opens: 351 }
    ]
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Email Analytics Dashboard</h2>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sent</p>
                <p className="text-2xl font-bold">{formatNumber(analyticsData.overview.totalSent)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-2xl font-bold">{formatNumber(analyticsData.overview.totalDelivered)}</p>
                <p className="text-xs text-green-600">{analyticsData.rates.deliveryRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Opened</p>
                <p className="text-2xl font-bold">{formatNumber(analyticsData.overview.totalOpened)}</p>
                <p className="text-xs text-purple-600">{analyticsData.rates.openRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MousePointer className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Clicked</p>
                <p className="text-2xl font-bold">{formatNumber(analyticsData.overview.totalClicked)}</p>
                <p className="text-xs text-orange-600">{analyticsData.rates.clickRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bounced</p>
                <p className="text-2xl font-bold">{formatNumber(analyticsData.overview.totalBounced)}</p>
                <p className="text-xs text-red-600">{analyticsData.rates.bounceRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-gray-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unsubscribed</p>
                <p className="text-2xl font-bold">{formatNumber(analyticsData.overview.totalUnsubscribed)}</p>
                <p className="text-xs text-gray-600">{analyticsData.rates.unsubscribeRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.campaigns.map((campaign) => (
                <div key={campaign.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{campaign.name}</h3>
                    <Badge variant="outline">{formatCurrency(campaign.revenue)}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Sent:</span> {formatNumber(campaign.sent)}
                    </div>
                    <div>
                      <span className="text-gray-500">Open Rate:</span> {campaign.openRate}%
                    </div>
                    <div>
                      <span className="text-gray-500">Click Rate:</span> {campaign.clickRate}%
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${campaign.openRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Subject Lines */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Subject Lines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topPerformers.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">{item.subject}</h3>
                  <div className="flex justify-between text-sm">
                    <span>Open Rate: <strong>{item.openRate}%</strong></span>
                    <span>Click Rate: <strong>{item.clickRate}%</strong></span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${item.openRate}%` }}
                      ></div>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${item.clickRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Device Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analyticsData.deviceStats.map((device, index) => (
              <div key={index} className="p-4 border rounded-lg text-center">
                <h3 className="font-medium mb-2">{device.device}</h3>
                <p className="text-2xl font-bold">{device.percentage}%</p>
                <p className="text-sm text-gray-500">{formatNumber(device.opens)} opens</p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${device.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailAnalyticsDashboard;