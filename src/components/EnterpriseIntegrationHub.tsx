import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Zap, Database, Cloud, Settings, CheckCircle, AlertCircle } from 'lucide-react';

export default function EnterpriseIntegrationHub() {
  const [integrations] = useState([
    { name: 'Salesforce CRM', status: 'connected', type: 'CRM', lastSync: '2 mins ago' },
    { name: 'Microsoft 365', status: 'connected', type: 'Productivity', lastSync: '5 mins ago' },
    { name: 'SAP ERP', status: 'pending', type: 'ERP', lastSync: 'Never' },
    { name: 'Slack', status: 'connected', type: 'Communication', lastSync: '1 min ago' }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Enterprise Integration Hub</h2>
          <p className="text-muted-foreground">Connect and manage enterprise systems</p>
        </div>
        <Button>
          <Zap className="h-4 w-4 mr-2" />
          Add Integration
        </Button>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Integrations</TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4">
            {integrations.map((integration, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Database className="h-8 w-8 text-blue-500" />
                      <div>
                        <h3 className="font-semibold">{integration.name}</h3>
                        <p className="text-sm text-muted-foreground">{integration.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-sm">Last sync: {integration.lastSync}</div>
                        <Badge variant={integration.status === 'connected' ? 'default' : 'secondary'}>
                          {integration.status === 'connected' ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <AlertCircle className="h-3 w-3 mr-1" />
                          )}
                          {integration.status}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['Oracle Database', 'AWS Services', 'Google Workspace', 'Jira', 'Confluence', 'ServiceNow'].map((service, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Cloud className="h-6 w-6 text-gray-500" />
                      <span className="font-medium">{service}</span>
                    </div>
                    <Button size="sm">Connect</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Auto-sync enabled</div>
                  <div className="text-sm text-muted-foreground">Automatically sync data every 5 minutes</div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Error notifications</div>
                  <div className="text-sm text-muted-foreground">Get notified when integrations fail</div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}