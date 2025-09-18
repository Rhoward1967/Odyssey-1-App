import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  Users,
  Mail,
  Target,
  Calendar
} from 'lucide-react';

export default function EmailAnalytics() {
  const campaignPerformance = [
    {
      name: 'Spring Cleaning Special',
      sent: 2847,
      delivered: 2801,
      opens: 708,
      clicks: 91,
      conversions: 23,
      revenue: '$4,680',
      date: '2024-03-15'
    },
    {
      name: 'Healthcare Services Update',
      sent: 1234,
      delivered: 1221,
      opens: 367,
      clicks: 45,
      conversions: 12,
      revenue: '$2,340',
      date: '2024-03-10'
    },
    {
      name: 'Government Contract News',
      sent: 856,
      delivered: 847,
      opens: 234,
      clicks: 28,
      conversions: 8,
      revenue: '$1,560',
      date: '2024-03-08'
    }
  ];

  const metrics = [
    {
      title: 'Total Campaigns',
      value: '156',
      change: '+12%',
      icon: Mail,
      color: 'text-blue-600'
    },
    {
      title: 'Average Open Rate',
      value: '24.8%',
      change: '+2.1%',
      icon: Eye,
      color: 'text-green-600'
    },
    {
      title: 'Average Click Rate',
      value: '3.2%',
      change: '+0.8%',
      icon: MousePointer,
      color: 'text-purple-600'
    },
    {
      title: 'Conversion Rate',
      value: '1.8%',
      change: '+0.3%',
      icon: Target,
      color: 'text-orange-600'
    }
  ];

  const topPerformers = [
    { subject: 'Spring Into Clean - 20% Off', openRate: 32.4, clickRate: 4.8 },
    { subject: 'Healthcare Compliance Update', openRate: 29.7, clickRate: 3.9 },
    { subject: 'New Government Opportunities', openRate: 27.3, clickRate: 3.2 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">Email Analytics</h3>
        <div className="flex gap-2">
          <Badge variant="outline">Last 30 Days</Badge>
          <Badge variant="outline">All Campaigns</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className="text-sm text-green-600">{metric.change}</p>
                </div>
                <metric.icon className={`h-8 w-8 ${metric.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaignPerformance.map((campaign, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{campaign.name}</h4>
                    <Badge variant="outline">{campaign.date}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Sent</div>
                      <div className="font-semibold">{campaign.sent.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Opens</div>
                      <div className="font-semibold">{campaign.opens} ({((campaign.opens/campaign.sent)*100).toFixed(1)}%)</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Clicks</div>
                      <div className="font-semibold">{campaign.clicks} ({((campaign.clicks/campaign.sent)*100).toFixed(1)}%)</div>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <div className="text-sm">
                      <span className="text-gray-600">Revenue: </span>
                      <span className="font-semibold text-green-600">{campaign.revenue}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Conversions: </span>
                      <span className="font-semibold">{campaign.conversions}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Subject Lines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topPerformers.map((performer, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{performer.subject}</span>
                  <Badge variant="secondary">{performer.openRate}%</Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Open Rate</span>
                    <span>{performer.openRate}%</span>
                  </div>
                  <Progress value={performer.openRate} className="h-2" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Click Rate</span>
                    <span>{performer.clickRate}%</span>
                  </div>
                  <Progress value={performer.clickRate} className="h-2" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Engagement Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Advanced Charts Coming Soon</h3>
            <p className="text-gray-600">Detailed engagement trends and performance charts will be available here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}