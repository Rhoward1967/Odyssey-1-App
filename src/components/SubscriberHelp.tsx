import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { AdminSystemManual } from './AdminSystemManual';
import { UserManual } from './UserManual';
import { AdminChangeLog } from './AdminChangeLog';
import { SystemArchitectureGuide } from './SystemArchitectureGuide';
import { TroubleshootingGuide } from './TroubleshootingGuide';
import { DeploymentGuide } from './DeploymentGuide';
import AdminAuthGuard from './AdminAuthGuard';
import { 
  BookOpen, Shield, Wrench, Rocket, HelpCircle, Phone, Mail, MessageSquare, AlertTriangle
} from 'lucide-react';

export const SubscriberHelp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('admin');

  const supportChannels = [
    {
      icon: Phone,
      title: 'Emergency Support',
      description: '24/7 critical system support',
      contact: '1-800-HJS-HELP',
      availability: 'Always Available'
    },
    {
      icon: Mail,
      title: 'Technical Support',
      description: 'System administration help',
      contact: 'admin@hjssystems.com',
      availability: 'Business Hours'
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      description: 'Real-time assistance',
      contact: 'Available in system',
      availability: 'Mon-Fri 8AM-6PM'
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/30">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <HelpCircle className="h-8 w-8 text-purple-400" />
            ODYSSEY-1 HELP CENTER
          </CardTitle>
          <Badge className="mx-auto bg-green-600/20 text-green-300 text-lg px-4 py-2">
            COMPREHENSIVE SYSTEM DOCUMENTATION
          </Badge>
        </CardHeader>
      </Card>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7 bg-slate-800/50">
          <TabsTrigger value="admin">Admin Manual</TabsTrigger>
          <TabsTrigger value="user">User Guide</TabsTrigger>
          <TabsTrigger value="changelog">Change Log</TabsTrigger>
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>
        
        <TabsContent value="admin">
          <AdminSystemManual />
        </TabsContent>
        
        <TabsContent value="architecture">
          <SystemArchitectureGuide />
        </TabsContent>
        
        <TabsContent value="troubleshooting">
          <TroubleshootingGuide />
        </TabsContent>

        <TabsContent value="deployment">
          <DeploymentGuide />
        </TabsContent>

        <TabsContent value="user">
          <UserManual />
        </TabsContent>

        <TabsContent value="changelog">
          <AdminChangeLog />
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {supportChannels.map((channel, idx) => (
              <Card key={idx} className="bg-slate-800/50 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white">
                    <channel.icon className="h-5 w-5 text-purple-400" />
                    {channel.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-300 text-sm">{channel.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Contact:</span>
                      <span className="text-purple-300 text-sm font-mono">{channel.contact}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Available:</span>
                      <Badge className="bg-green-600/20 text-green-300 text-xs">
                        {channel.availability}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-red-900/20 border-red-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-red-300">
                <AlertTriangle className="h-5 w-5" />
                Critical System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-200 text-sm">
                For system outages, security breaches, or critical errors, immediately contact emergency support.
                All critical incidents are logged and escalated to HJS engineering team within 5 minutes.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};