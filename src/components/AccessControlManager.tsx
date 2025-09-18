import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Shield, Users, Crown, Star, Zap, Settings } from 'lucide-react';

interface AccessRule {
  id: string;
  feature: string;
  description: string;
  allowedTiers: string[];
  isEnabled: boolean;
}

const AccessControlManager = () => {
  const [accessRules, setAccessRules] = useState<AccessRule[]>([
    {
      id: '1',
      feature: 'AI Research Assistant',
      description: 'Advanced AI-powered research capabilities',
      allowedTiers: ['pro', 'enterprise'],
      isEnabled: true
    },
    {
      id: '2',
      feature: 'Trading Dashboard',
      description: 'Real-time trading data and analytics',
      allowedTiers: ['basic', 'pro', 'enterprise'],
      isEnabled: true
    },
    {
      id: '3',
      feature: 'Odyssey Core',
      description: 'Full AI consciousness and autonomous operations',
      allowedTiers: ['enterprise'],
      isEnabled: true
    },
    {
      id: '4',
      feature: 'Email Marketing',
      description: 'Automated email campaigns and templates',
      allowedTiers: ['pro', 'enterprise'],
      isEnabled: true
    },
    {
      id: '5',
      feature: 'Budget Analytics',
      description: 'Advanced budget tracking and forecasting',
      allowedTiers: ['basic', 'pro', 'enterprise'],
      isEnabled: true
    }
  ]);

  const subscriptionTiers = [
    { name: 'trial', label: 'Trial', icon: Shield, color: 'bg-gray-500', users: 45 },
    { name: 'basic', label: 'Basic', icon: Star, color: 'bg-blue-500', users: 128 },
    { name: 'pro', label: 'Pro', icon: Zap, color: 'bg-purple-500', users: 67 },
    { name: 'enterprise', label: 'Enterprise', icon: Crown, color: 'bg-gold-500', users: 23 }
  ];

  const toggleFeature = (ruleId: string) => {
    setAccessRules(rules => 
      rules.map(rule => 
        rule.id === ruleId 
          ? { ...rule, isEnabled: !rule.isEnabled }
          : rule
      )
    );
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'trial': return 'bg-gray-100 text-gray-800';
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'pro': return 'bg-purple-100 text-purple-800';
      case 'enterprise': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold">Access Control Manager</h1>
          <p className="text-gray-600">Manage subscription-based feature access</p>
        </div>
      </div>

      <Tabs defaultValue="features" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="features">Feature Access</TabsTrigger>
          <TabsTrigger value="tiers">Subscription Tiers</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Access Control</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {accessRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">{rule.feature}</h3>
                      <Switch
                        checked={rule.isEnabled}
                        onCheckedChange={() => toggleFeature(rule.id)}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {rule.allowedTiers.map((tier) => (
                        <Badge key={tier} className={getTierBadgeColor(tier)}>
                          {tier}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {subscriptionTiers.map((tier) => (
              <Card key={tier.name}>
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 ${tier.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <tier.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{tier.label}</h3>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{tier.users}</p>
                  <p className="text-sm text-gray-600">Active Users</p>
                  
                  <div className="mt-4 space-y-2">
                    <p className="text-xs text-gray-500">Features Available:</p>
                    <div className="text-xs">
                      {accessRules
                        .filter(rule => rule.allowedTiers.includes(tier.name) && rule.isEnabled)
                        .length} / {accessRules.filter(rule => rule.isEnabled).length}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AccessControlManager;