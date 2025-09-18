import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Workflow, 
  Play, 
  Pause, 
  Plus, 
  Clock, 
  Users, 
  Mail,
  Target,
  Zap,
  Settings,
  BarChart3,
  Calendar
} from 'lucide-react';

interface AutomationWorkflow {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'draft';
  trigger: string;
  actions: string[];
  subscribers: number;
  openRate: number;
  clickRate: number;
}

export default function MarketingAutomation() {
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([
    {
      id: '1',
      name: 'Welcome Series',
      status: 'active',
      trigger: 'New Subscriber',
      actions: ['Welcome Email', 'Product Tour', 'Feature Highlights'],
      subscribers: 1247,
      openRate: 45.2,
      clickRate: 12.8
    },
    {
      id: '2',
      name: 'Abandoned Cart Recovery',
      status: 'active',
      trigger: 'Cart Abandoned',
      actions: ['Reminder Email', 'Discount Offer', 'Final Notice'],
      subscribers: 892,
      openRate: 38.7,
      clickRate: 15.3
    },
    {
      id: '3',
      name: 'Re-engagement Campaign',
      status: 'paused',
      trigger: 'Inactive 30 Days',
      actions: ['Win-back Email', 'Special Offer'],
      subscribers: 543,
      openRate: 22.1,
      clickRate: 8.4
    }
  ]);

  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);

  const triggers = [
    { id: 'new_subscriber', name: 'New Subscriber', icon: Users },
    { id: 'purchase', name: 'Purchase Made', icon: Target },
    { id: 'cart_abandon', name: 'Cart Abandoned', icon: Clock },
    { id: 'inactive', name: 'Inactive User', icon: Calendar },
    { id: 'birthday', name: 'Birthday', icon: Calendar },
    { id: 'custom_event', name: 'Custom Event', icon: Zap }
  ];

  const actions = [
    { id: 'send_email', name: 'Send Email', icon: Mail },
    { id: 'wait', name: 'Wait Period', icon: Clock },
    { id: 'add_tag', name: 'Add Tag', icon: Target },
    { id: 'remove_tag', name: 'Remove Tag', icon: Target },
    { id: 'update_field', name: 'Update Field', icon: Settings }
  ];

  const toggleWorkflowStatus = (id: string) => {
    setWorkflows(workflows.map(w => 
      w.id === id 
        ? { ...w, status: w.status === 'active' ? 'paused' : 'active' }
        : w
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Workflow className="h-6 w-6 text-purple-600" />
          Marketing Automation
        </h2>
        <Button onClick={() => setShowBuilder(true)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {showBuilder ? (
        <Card>
          <CardHeader>
            <CardTitle>Workflow Builder</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="trigger" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="trigger">1. Trigger</TabsTrigger>
                <TabsTrigger value="actions">2. Actions</TabsTrigger>
                <TabsTrigger value="settings">3. Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="trigger" className="space-y-4">
                <div>
                  <Label>Workflow Name</Label>
                  <Input placeholder="Enter workflow name" />
                </div>
                <div>
                  <Label>Select Trigger</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {triggers.map(trigger => (
                      <Card key={trigger.id} className="cursor-pointer hover:bg-gray-50 border-2 border-transparent hover:border-purple-200">
                        <CardContent className="p-4 text-center">
                          <trigger.icon className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                          <p className="text-sm font-medium">{trigger.name}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="actions" className="space-y-4">
                <div>
                  <Label>Workflow Actions</Label>
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-purple-600">1</span>
                      </div>
                      <Mail className="h-5 w-5 text-gray-600" />
                      <span>Send Welcome Email</span>
                      <Button variant="outline" size="sm" className="ml-auto">Edit</Button>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-purple-600">2</span>
                      </div>
                      <Clock className="h-5 w-5 text-gray-600" />
                      <span>Wait 3 days</span>
                      <Button variant="outline" size="sm" className="ml-auto">Edit</Button>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-purple-600">3</span>
                      </div>
                      <Mail className="h-5 w-5 text-gray-600" />
                      <span>Send Product Tour Email</span>
                      <Button variant="outline" size="sm" className="ml-auto">Edit</Button>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-3">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Action
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Target Audience</Label>
                    <select className="w-full p-2 border rounded">
                      <option>All Subscribers</option>
                      <option>New Subscribers</option>
                      <option>Active Users</option>
                      <option>VIP Customers</option>
                    </select>
                  </div>
                  <div>
                    <Label>Time Zone</Label>
                    <select className="w-full p-2 border rounded">
                      <option>Subscriber's Time Zone</option>
                      <option>EST (UTC-5)</option>
                      <option>PST (UTC-8)</option>
                      <option>UTC</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Play className="h-4 w-4 mr-2" />
                    Activate Workflow
                  </Button>
                  <Button variant="outline" onClick={() => setShowBuilder(false)}>
                    Save as Draft
                  </Button>
                  <Button variant="outline" onClick={() => setShowBuilder(false)}>
                    Cancel
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {workflows.map(workflow => (
            <Card key={workflow.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{workflow.name}</h3>
                    <Badge variant={workflow.status === 'active' ? 'default' : workflow.status === 'paused' ? 'secondary' : 'outline'}>
                      {workflow.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleWorkflowStatus(workflow.id)}
                    >
                      {workflow.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Trigger</p>
                    <p className="font-medium">{workflow.trigger}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Subscribers</p>
                    <p className="font-medium">{workflow.subscribers.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Open Rate</p>
                    <p className="font-medium text-green-600">{workflow.openRate}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Click Rate</p>
                    <p className="font-medium text-blue-600">{workflow.clickRate}%</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Actions</p>
                  <div className="flex flex-wrap gap-2">
                    {workflow.actions.map((action, index) => (
                      <Badge key={index} variant="outline">{action}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}