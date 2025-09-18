import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, TrendingUp, Users, DollarSign, 
  ChevronDown, ChevronUp, MoreHorizontal,
  Smartphone, Tablet, Monitor
} from 'lucide-react';

interface DashboardMetric {
  id: string;
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  priority: 'high' | 'medium' | 'low';
}

const MobileDashboardOptimization: React.FC = () => {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');

  const metrics: DashboardMetric[] = [
    {
      id: 'revenue',
      title: 'Revenue',
      value: '$12,345',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      priority: 'high'
    },
    {
      id: 'users',
      title: 'Active Users',
      value: '2,847',
      change: '+8.2%',
      trend: 'up',
      icon: Users,
      priority: 'high'
    },
    {
      id: 'performance',
      title: 'Performance',
      value: '94.2%',
      change: '-2.1%',
      trend: 'down',
      icon: Activity,
      priority: 'medium'
    },
    {
      id: 'growth',
      title: 'Growth Rate',
      value: '23.4%',
      change: '+5.7%',
      trend: 'up',
      icon: TrendingUp,
      priority: 'medium'
    }
  ];

  const toggleCardExpansion = (cardId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCards(newExpanded);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Mobile Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'compact' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('compact')}
          >
            <Smartphone className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'detailed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('detailed')}
          >
            <Monitor className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="bg-slate-800/50 rounded-lg p-3">
        <div className="flex justify-between items-center text-sm">
          <div className="text-center">
            <div className="text-green-400 font-semibold">+12.5%</div>
            <div className="text-slate-400">Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-blue-400 font-semibold">2,847</div>
            <div className="text-slate-400">Users</div>
          </div>
          <div className="text-center">
            <div className="text-purple-400 font-semibold">94.2%</div>
            <div className="text-slate-400">Uptime</div>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="space-y-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const isExpanded = expandedCards.has(metric.id);
          
          return (
            <Card 
              key={metric.id} 
              className={`bg-slate-800/50 border-slate-700 border-l-4 ${getPriorityColor(metric.priority)}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-slate-700 rounded-lg">
                      <Icon className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-sm text-white">{metric.title}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-lg font-bold text-white">{metric.value}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getTrendColor(metric.trend)}`}
                        >
                          {metric.change}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {viewMode === 'detailed' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCardExpansion(metric.id)}
                    >
                      {isExpanded ? 
                        <ChevronUp className="w-4 h-4" /> : 
                        <ChevronDown className="w-4 h-4" />
                      }
                    </Button>
                  )}
                </div>
              </CardHeader>

              {/* Expanded Content */}
              {isExpanded && viewMode === 'detailed' && (
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm text-slate-300">
                    <div className="flex justify-between">
                      <span>Last 7 days:</span>
                      <span className="text-green-400">+5.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last 30 days:</span>
                      <span className="text-blue-400">+18.7%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Target:</span>
                      <span className="text-purple-400">$15,000</span>
                    </div>
                    
                    {/* Mini Chart Placeholder */}
                    <div className="h-16 bg-slate-700/50 rounded mt-3 flex items-center justify-center">
                      <span className="text-xs text-slate-400">Chart placeholder</span>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-sm text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="justify-start">
              <Activity className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <Users className="w-4 h-4 mr-2" />
              Users
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <DollarSign className="w-4 h-4 mr-2" />
              Revenue
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <MoreHorizontal className="w-4 h-4 mr-2" />
              More
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mobile-specific spacing */}
      <div className="h-20" />
    </div>
  );
};

export default MobileDashboardOptimization;