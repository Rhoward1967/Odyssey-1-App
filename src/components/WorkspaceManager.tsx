import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Brain, TrendingUp, Calculator, Users, Settings, BarChart3, Zap, Shield } from 'lucide-react';

interface DashboardModule {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: 'AI' | 'Analytics' | 'Tools' | 'Business';
  enabled: boolean;
  premium?: boolean;
}

export const WorkspaceManager: React.FC = () => {
  const [modules, setModules] = useState<DashboardModule[]>([
    {
      id: 'ai-assistant',
      name: 'AI Assistant',
      description: 'Industry-tuned intelligent assistant',
      icon: Brain,
      category: 'AI',
      enabled: false,
      premium: true
    },
    {
      id: 'trading-dashboard',
      name: 'Trading Dashboard',
      description: 'Real-time trading analytics',
      icon: TrendingUp,
      category: 'Analytics',
      enabled: true
    },
    {
      id: 'bid-calculator',
      name: 'Bid Calculator',
      description: 'Smart bidding calculations',
      icon: Calculator,
      category: 'Tools',
      enabled: true
    },
    {
      id: 'team-collaboration',
      name: 'Team Collaboration',
      description: 'Multi-user workspace tools',
      icon: Users,
      category: 'Business',
      enabled: false
    },
    {
      id: 'web3-analytics',
      name: 'Web3 Analytics',
      description: 'Blockchain data insights',
      icon: BarChart3,
      category: 'Analytics',
      enabled: true
    },
    {
      id: 'performance-optimizer',
      name: 'Performance Optimizer',
      description: 'System optimization tools',
      icon: Zap,
      category: 'Tools',
      enabled: false
    },
    {
      id: 'security-monitor',
      name: 'Security Monitor',
      description: 'Real-time security dashboard',
      icon: Shield,
      category: 'Tools',
      enabled: false,
      premium: true
    }
  ]);

  const toggleModule = (moduleId: string) => {
    setModules(prev => prev.map(module => 
      module.id === moduleId 
        ? { ...module, enabled: !module.enabled }
        : module
    ));
  };

  const categories = ['AI', 'Analytics', 'Tools', 'Business'] as const;
  const categoryColors = {
    AI: 'bg-purple-600/20 text-purple-300 border-purple-500/50',
    Analytics: 'bg-blue-600/20 text-blue-300 border-blue-500/50',
    Tools: 'bg-green-600/20 text-green-300 border-green-500/50',
    Business: 'bg-orange-600/20 text-orange-300 border-orange-500/50'
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold text-white">
          Dynamic Workspace Manager
        </h3>
        <p className="text-gray-300">
          Customize your dashboard by enabling or disabling modules
        </p>
      </div>

      {categories.map(category => (
        <Card key={category} className="bg-slate-800/50 border-slate-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Badge className={categoryColors[category]}>
                {category}
              </Badge>
              <span>
                {modules.filter(m => m.category === category && m.enabled).length} / {modules.filter(m => m.category === category).length} Active
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {modules
              .filter(module => module.category === category)
              .map(module => {
                const IconComponent = module.icon;
                return (
                  <div 
                    key={module.id}
                    className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/50"
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-white">{module.name}</h4>
                          {module.premium && (
                            <Badge className="bg-yellow-600/20 text-yellow-300 border-yellow-500/50 text-xs">
                              Premium
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">{module.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={module.enabled}
                      onCheckedChange={() => toggleModule(module.id)}
                    />
                  </div>
                );
              })}
          </CardContent>
        </Card>
      ))}

      <Card className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 backdrop-blur-sm border-purple-500/50">
        <CardContent className="p-6 text-center">
          <h4 className="text-lg font-bold text-white mb-2">Workspace Status</h4>
          <p className="text-gray-300 mb-4">
            {modules.filter(m => m.enabled).length} modules active • Dashboard will update automatically
          </p>
          <Button className="bg-purple-600 hover:bg-purple-700">
            Apply Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};