import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Send, Play, Pause, BarChart3, Users } from 'lucide-react';
import { format } from 'date-fns';

const EmailCampaignManager = () => {
  const [campaigns, setCampaigns] = useState([
    { 
      id: 1, 
      name: 'Summer Sale 2024', 
      type: 'one_time', 
      status: 'sent',
      sent: 1250,
      opened: 375,
      clicked: 89,
      scheduledDate: '2024-06-15'
    },
    { 
      id: 2, 
      name: 'Welcome Series', 
      type: 'drip', 
      status: 'active',
      sent: 450,
      opened: 225,
      clicked: 67,
      scheduledDate: null
    },
    { 
      id: 3, 
      name: 'Product Launch', 
      type: 'one_time', 
      status: 'draft',
      sent: 0,
      opened: 0,
      clicked: 0,
      scheduledDate: '2024-07-01'
    }
  ]);

  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'one_time',
    template: '',
    scheduledDate: null as Date | null,
    targetAudience: 'all'
  });

  const [selectedDate, setSelectedDate] = useState<Date>();

  const handleCreateCampaign = () => {
    const campaign = {
      id: Date.now(),
      name: newCampaign.name,
      type: newCampaign.type,
      status: 'draft',
      sent: 0,
      opened: 0,
      clicked: 0,
      scheduledDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null
    };
    setCampaigns([...campaigns, campaign]);
    setNewCampaign({
      name: '',
      type: 'one_time',
      template: '',
      scheduledDate: null,
      targetAudience: 'all'
    });
    setSelectedDate(undefined);
  };

  const updateCampaignStatus = (id: number, newStatus: string) => {
    setCampaigns(campaigns.map(c => 
      c.id === id ? { ...c, status: newStatus } : c
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'default';
      case 'active': return 'default';
      case 'sending': return 'secondary';
      case 'draft': return 'outline';
      case 'paused': return 'secondary';
      default: return 'outline';
    }
  };

  const calculateOpenRate = (opened: number, sent: number) => {
    return sent > 0 ? ((opened / sent) * 100).toFixed(1) : '0';
  };

  const calculateClickRate = (clicked: number, sent: number) => {
    return sent > 0 ? ((clicked / sent) * 100).toFixed(1) : '0';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Send className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Email Campaign Manager</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            <Users className="h-4 w-4 mr-1" />
            2,450 Subscribers
          </Badge>
        </div>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Send className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sent</p>
                <p className="text-2xl font-bold">1,700</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Open Rate</p>
                <p className="text-2xl font-bold">35.3%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Click Rate</p>
                <p className="text-2xl font-bold">9.2%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Play className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create New Campaign */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Campaign</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="campaign-name">Campaign Name</Label>
              <Input
                id="campaign-name"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                placeholder="Summer Sale 2024"
              />
            </div>
            <div>
              <Label htmlFor="campaign-type">Campaign Type</Label>
              <Select value={newCampaign.type} onValueChange={(value) => setNewCampaign({...newCampaign, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one_time">One-time Campaign</SelectItem>
                  <SelectItem value="drip">Drip Campaign</SelectItem>
                  <SelectItem value="automated">Automated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="template">Email Template</Label>
              <Select value={newCampaign.template} onValueChange={(value) => setNewCampaign({...newCampaign, template: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="welcome">Welcome Email</SelectItem>
                  <SelectItem value="newsletter">Weekly Newsletter</SelectItem>
                  <SelectItem value="product">Product Launch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Schedule Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <Button onClick={handleCreateCampaign} className="w-full">
            Create Campaign
          </Button>
        </CardContent>
      </Card>

      {/* Campaign List */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-medium">{campaign.name}</h3>
                    <Badge variant={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                    <Badge variant="outline">{campaign.type}</Badge>
                  </div>
                  <div className="flex space-x-2">
                    {campaign.status === 'draft' && (
                      <Button size="sm" onClick={() => updateCampaignStatus(campaign.id, 'sending')}>
                        <Send className="h-4 w-4 mr-1" />
                        Send
                      </Button>
                    )}
                    {campaign.status === 'active' && (
                      <Button size="sm" variant="outline" onClick={() => updateCampaignStatus(campaign.id, 'paused')}>
                        <Pause className="h-4 w-4 mr-1" />
                        Pause
                      </Button>
                    )}
                    {campaign.status === 'paused' && (
                      <Button size="sm" onClick={() => updateCampaignStatus(campaign.id, 'active')}>
                        <Play className="h-4 w-4 mr-1" />
                        Resume
                      </Button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Sent:</span> {campaign.sent}
                  </div>
                  <div>
                    <span className="text-gray-500">Opened:</span> {campaign.opened} ({calculateOpenRate(campaign.opened, campaign.sent)}%)
                  </div>
                  <div>
                    <span className="text-gray-500">Clicked:</span> {campaign.clicked} ({calculateClickRate(campaign.clicked, campaign.sent)}%)
                  </div>
                  <div>
                    <span className="text-gray-500">Scheduled:</span> {campaign.scheduledDate || 'Not scheduled'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailCampaignManager;