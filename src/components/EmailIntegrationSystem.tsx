import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Settings, FileText, Users, BarChart3 } from 'lucide-react';
import EmailProviderSetup from './EmailProviderSetup';
import EmailTemplateEditor from './EmailTemplateEditor';
import EmailCampaignManager from './EmailCampaignManager';
import EmailSubscriberManager from './EmailSubscriberManager';
import EmailAnalyticsDashboard from './EmailAnalyticsDashboard';

const EmailIntegrationSystem = () => {
  const [activeTab, setActiveTab] = useState('providers');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center space-x-3 mb-8">
          <Mail className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Email Integration System</h1>
            <p className="text-gray-600 mt-1">Comprehensive email marketing and automation platform</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm">
            <TabsTrigger value="providers" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Providers</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Templates</span>
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>Campaigns</span>
            </TabsTrigger>
            <TabsTrigger value="subscribers" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Subscribers</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="providers">
            <EmailProviderSetup />
          </TabsContent>

          <TabsContent value="templates">
            <EmailTemplateEditor />
          </TabsContent>

          <TabsContent value="campaigns">
            <EmailCampaignManager />
          </TabsContent>

          <TabsContent value="subscribers">
            <EmailSubscriberManager />
          </TabsContent>

          <TabsContent value="analytics">
            <EmailAnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EmailIntegrationSystem;