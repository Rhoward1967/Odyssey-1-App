import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Send, 
  Users, 
  Calendar, 
  Target,
  TestTube,
  BarChart3,
  Settings
} from 'lucide-react';

export default function CampaignBuilder() {
  const [campaign, setCampaign] = useState({
    name: '',
    subject: '',
    template: '',
    audience: '',
    schedule: 'now',
    abTest: false
  });

  const templates = [
    { id: 'welcome', name: 'Welcome Series' },
    { id: 'promo', name: 'Spring Promotion' },
    { id: 'newsletter', name: 'Monthly Newsletter' }
  ];

  const audiences = [
    { id: 'all', name: 'All Subscribers', count: 12847 },
    { id: 'healthcare', name: 'Healthcare Clients', count: 3421 },
    { id: 'government', name: 'Government Contacts', count: 2156 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">Campaign Builder</h3>
        <Button className="bg-green-600 hover:bg-green-700">
          <Send className="h-4 w-4 mr-2" />
          Send Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Campaign Name</label>
                <Input
                  placeholder="Enter campaign name"
                  value={campaign.name}
                  onChange={(e) => setCampaign({...campaign, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Subject Line</label>
                <Input
                  placeholder="Email subject line"
                  value={campaign.subject}
                  onChange={(e) => setCampaign({...campaign, subject: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Template</label>
                  <Select onValueChange={(value) => setCampaign({...campaign, template: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Audience</label>
                  <Select onValueChange={(value) => setCampaign({...campaign, audience: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      {audiences.map(audience => (
                        <SelectItem key={audience.id} value={audience.id}>
                          {audience.name} ({audience.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>A/B Testing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <TestTube className="h-8 w-8 text-blue-600" />
                <div>
                  <h4 className="font-semibold">Split Test Your Campaign</h4>
                  <p className="text-sm text-gray-600">Test different subject lines or content</p>
                </div>
                <Button variant="outline">Enable A/B Test</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Recipients</span>
                <Badge>12,847</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Estimated Delivery</span>
                <span className="text-sm text-gray-600">~15 minutes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Expected Opens</span>
                <span className="text-sm text-green-600">~3,186</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Expected Clicks</span>
                <span className="text-sm text-blue-600">~411</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Send className="h-4 w-4 mr-2" />
                  Send Now
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Later
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}