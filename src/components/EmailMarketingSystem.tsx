import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Mail, 
  Users, 
  BarChart3, 
  Settings, 
  Send, 
  Eye, 
  MousePointer, 
  TrendingUp,
  Calendar,
  Target,
  Zap
} from 'lucide-react';
import EmailTemplateManager from './EmailTemplateManager';
import CampaignBuilder from './CampaignBuilder';
import SubscriberManager from './SubscriberManager';
import EmailAnalytics from './EmailAnalytics';
import SendGridIntegration from './SendGridIntegration';
import VisualEmailBuilder from './VisualEmailBuilder';
import MarketingAutomation from './MarketingAutomation';

export default function EmailMarketingSystem() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const campaignStats = [
    {
      title: 'Total Subscribers',
      value: '12,847',
      change: '+8.2%',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Campaigns Sent',
      value: '156',
      change: '+12%',
      icon: Send,
      color: 'text-green-600'
    },
    {
      title: 'Avg Open Rate',
      value: '24.8%',
      change: '+2.1%',
      icon: Eye,
      color: 'text-purple-600'
    },
    {
      title: 'Avg Click Rate',
      value: '3.2%',
      change: '+0.8%',
      icon: MousePointer,
      color: 'text-orange-600'
    }
  ];

  const recentCampaigns = [
    {
      id: 1,
      name: 'Spring Cleaning Special',
      status: 'Sent',
      sent: '2,847',
      opens: '708',
      clicks: '91',
      date: '2024-03-15'
    },
    {
      id: 2,
      name: 'Healthcare Facility Services',
      status: 'Scheduled',
      sent: '1,234',
      opens: '0',
      clicks: '0',
      date: '2024-03-20'
    },
    {
      id: 3,
      name: 'Government Contract Updates',
      status: 'Draft',
      sent: '0',
      opens: '0',
      clicks: '0',
      date: '2024-03-18'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Email Marketing System</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Zap className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="sendgrid">SendGrid</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {campaignStats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-green-600">{stat.change}</p>
                    </div>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentCampaigns.map(campaign => (
                    <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{campaign.name}</div>
                        <div className="text-sm text-gray-600">{campaign.date}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={campaign.status === 'Sent' ? 'default' : campaign.status === 'Scheduled' ? 'secondary' : 'outline'}>
                          {campaign.status}
                        </Badge>
                        {campaign.status === 'Sent' && (
                          <div className="text-sm text-gray-600">
                            {campaign.opens}/{campaign.sent} opens
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Open Rate</span>
                    <span>24.8%</span>
                  </div>
                  <Progress value={24.8} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Click Rate</span>
                    <span>3.2%</span>
                  </div>
                  <Progress value={3.2} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Conversion Rate</span>
                    <span>1.8%</span>
                  </div>
                  <Progress value={1.8} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns">
          <CampaignBuilder />
        </TabsContent>

        <TabsContent value="builder">
          <VisualEmailBuilder />
        </TabsContent>

        <TabsContent value="templates">
          <EmailTemplateManager />
        </TabsContent>

        <TabsContent value="subscribers">
          <SubscriberManager />
        </TabsContent>

        <TabsContent value="analytics">
          <EmailAnalytics />
        </TabsContent>

        <TabsContent value="automation">
          <MarketingAutomation />
        </TabsContent>

        <TabsContent value="sendgrid">
          <SendGridIntegration />
        </TabsContent>
      </Tabs>
    </div>
  );
}