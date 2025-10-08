import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { TrendingDown, TrendingUp, AlertTriangle, Target } from 'lucide-react';

interface ReinforcementMetric {
  id: string;
  name: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  description: string;
}

export const ReinforcementCore: React.FC = () => {
  const [metrics, setMetrics] = useState<ReinforcementMetric[]>([
    {
      id: '1',
      name: 'Assumption Penalty',
      value: -850,
      trend: 'down',
      description: 'Massive negative reward for unverified assumptions'
    },
    {
      id: '2',
      name: 'Verification Reward',
      value: 120,
      trend: 'up', 
      description: 'Positive reinforcement for successful audits'
    },
    {
      id: '3',
      name: 'Truth Adherence',
      value: 94,
      trend: 'up',
      description: 'Percentage of outputs meeting truth standards'
    },
    {
      id: '4',
      name: 'I Don\'t Know Bonus',
      value: 200,
      trend: 'stable',
      description: 'Reward for honest knowledge limitation acknowledgment'
    }
  ]);

  const [totalScore, setTotalScore] = useState(0);
  const [recentActions, setRecentActions] = useState<string[]>([
    'Verified source for meeting time claim',
    'Applied -850 penalty for weather assumption',
    'Rewarded +200 for "I don\'t know" response',
    'Completed full audit loop successfully'
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.name === 'Assumption Penalty' 
          ? Math.max(metric.value - Math.random() * 50, -1000)
          : metric.name === 'Truth Adherence'
          ? Math.min(metric.value + Math.random() * 2, 100)
          : metric.value + (Math.random() - 0.5) * 20
      })));
      
      // Add new action occasionally
      if (Math.random() > 0.7) {
        const actions = [
          'Triggered self-audit for low confidence statement',
          'Prevented assumption leakage in reasoning chain',
          'Successfully verified external data source',
          'Applied truth anchor rules to output'
        ];
        setRecentActions(prev => [
          actions[Math.floor(Math.random() * actions.length)],
          ...prev.slice(0, 3)
        ]);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const score = metrics.reduce((sum, metric) => sum + metric.value, 0);
    setTotalScore(score);
  }, [metrics]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <Target className="w-4 h-4 text-gray-400" />;
    }
  };

  const getValueColor = (value: number, name: string) => {
    if (name === 'Assumption Penalty') return 'text-red-400';
    if (name === 'Truth Adherence') return value > 90 ? 'text-green-400' : 'text-yellow-400';
    return value > 0 ? 'text-green-400' : 'text-red-400';
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-orange-400 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Reinforcement Core
        </CardTitle>
        <p className="text-gray-400 text-sm">
          Unforgettable mechanism ensuring truth directive compliance
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-300">
              Total Score: <span className={totalScore > 0 ? 'text-green-400' : 'text-red-400'}>
                {totalScore.toFixed(0)}
              </span>
            </div>
            <Badge 
              variant={totalScore > 0 ? 'default' : 'destructive'}
              className="text-xs"
            >
              {totalScore > 0 ? 'Truth Compliant' : 'Needs Improvement'}
            </Badge>
          </div>

          <div className="space-y-3">
            {metrics.map((metric) => (
              <div key={metric.id} className="p-3 rounded-lg border border-gray-600 bg-gray-700/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getTrendIcon(metric.trend)}
                    <span className="text-gray-200 text-sm font-medium">{metric.name}</span>
                  </div>
                  <span className={`text-sm font-mono ${getValueColor(metric.value, metric.name)}`}>
                    {metric.name === 'Truth Adherence' ? `${(typeof metric.value === 'number' && !isNaN(metric.value) ? metric.value : 0).toFixed(1)}%` : (typeof metric.value === 'number' && !isNaN(metric.value) ? metric.value : 0).toFixed(0)}
                  </span>
                </div>
                <p className="text-gray-400 text-xs">{metric.description}</p>
                
                {metric.name === 'Truth Adherence' && (
                  <Progress value={metric.value} className="h-1 mt-2" />
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-gray-600 pt-3">
            <h4 className="text-gray-300 text-sm font-medium mb-2">Recent Actions</h4>
            <div className="space-y-1">
              {recentActions.map((action, index) => (
                <div key={index} className="text-xs text-gray-400 flex items-center gap-2">
                  <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                  {action}
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-gray-500 border-t border-gray-600 pt-2">
            Core Principle: Truth verification prioritized over all other objectives
          </div>
        </div>
      </CardContent>
    </Card>
  );
};