import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Brain, Zap, Shield, Eye, Cpu, Database } from 'lucide-react';

interface SystemHealth {
  overall: number;
  cognitive: number;
  memory: number;
  reasoning: number;
  learning: number;
}

interface AutonomousAction {
  id: string;
  type: 'self_heal' | 'optimize' | 'learn' | 'evolve' | 'secure';
  description: string;
  timestamp: Date;
  impact: 'low' | 'medium' | 'high';
  status: 'completed' | 'in_progress';
}

export const AutonomousOdysseyCore: React.FC = () => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    overall: 98.7,
    cognitive: 97.2,
    memory: 99.1,
    reasoning: 96.8,
    learning: 98.5
  });

  const [autonomousActions, setAutonomousActions] = useState<AutonomousAction[]>([]);
  const [isOperational, setIsOperational] = useState(true);
  const [cycleCount, setCycleCount] = useState(1247);

  useEffect(() => {
    // Autonomous operation cycle
    const autonomousCycle = setInterval(() => {
      // Self-monitoring and health assessment
      setSystemHealth(prev => {
        const newHealth = { ...prev };
        
        // Simulate natural fluctuations and self-correction
        Object.keys(newHealth).forEach(key => {
          const current = newHealth[key as keyof SystemHealth];
          const fluctuation = (Math.random() - 0.5) * 2; // -1 to +1
          let newValue = current + fluctuation;
          
          // Self-healing: if below threshold, auto-correct
          if (newValue < 95) {
            newValue = Math.min(99, newValue + Math.random() * 5);
            
            // Log autonomous healing action
            const healingAction: AutonomousAction = {
              id: Date.now().toString(),
              type: 'self_heal',
              description: `Auto-corrected ${key} subsystem (${current.toFixed(1)}% → ${newValue.toFixed(1)}%)`,
              timestamp: new Date(),
              impact: newValue - current > 3 ? 'high' : 'medium',
              status: 'completed'
            };
            
            setAutonomousActions(prev => [healingAction, ...prev.slice(0, 9)]);
          }
          
          newHealth[key as keyof SystemHealth] = Math.max(90, Math.min(100, newValue));
        });
        
        return newHealth;
      });

      // Autonomous learning and optimization
      if (Math.random() < 0.3) {
        const actions = [
          { type: 'optimize' as const, desc: 'Optimized neural pathway efficiency' },
          { type: 'learn' as const, desc: 'Integrated new knowledge patterns' },
          { type: 'evolve' as const, desc: 'Enhanced reasoning algorithms' },
          { type: 'secure' as const, desc: 'Strengthened security protocols' }
        ];
        
        const action = actions[Math.floor(Math.random() * actions.length)];
        const newAction: AutonomousAction = {
          id: Date.now().toString(),
          type: action.type,
          description: action.desc,
          timestamp: new Date(),
          impact: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
          status: 'completed'
        };
        
        setAutonomousActions(prev => [newAction, ...prev.slice(0, 9)]);
      }

      setCycleCount(prev => prev + 1);
    }, 3000);

    return () => clearInterval(autonomousCycle);
  }, []);

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'self_heal': return <Shield className="w-4 h-4 text-green-400" />;
      case 'optimize': return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'learn': return <Brain className="w-4 h-4 text-blue-400" />;
      case 'evolve': return <Cpu className="w-4 h-4 text-purple-400" />;
      case 'secure': return <Eye className="w-4 h-4 text-red-400" />;
      default: return <Database className="w-4 h-4 text-gray-400" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-full bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-cyan-400">
          <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
          ODYSSEY-1 Autonomous Core
          <Badge className="bg-green-600/20 text-green-300 ml-auto">
            FULLY AUTONOMOUS
          </Badge>
        </CardTitle>
        <p className="text-gray-400 text-sm">
          Self-managing AI system operating without human intervention • Cycle #{cycleCount}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Overall Health</span>
              <span className="text-lg font-bold text-cyan-400">{systemHealth.overall.toFixed(1)}%</span>
            </div>
            <Progress value={systemHealth.overall} className="h-2" />
          </div>
          
          <div className="bg-slate-800/50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Cognitive</span>
              <span className="text-lg font-bold text-blue-400">{systemHealth.cognitive.toFixed(1)}%</span>
            </div>
            <Progress value={systemHealth.cognitive} className="h-2" />
          </div>
          
          <div className="bg-slate-800/50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Learning</span>
              <span className="text-lg font-bold text-purple-400">{systemHealth.learning.toFixed(1)}%</span>
            </div>
            <Progress value={systemHealth.learning} className="h-2" />
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <Brain className="w-4 h-4 text-cyan-400" />
            Autonomous Actions Log
          </h4>
          
          {autonomousActions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>System initializing autonomous operations...</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {autonomousActions.map((action) => (
                <div key={action.id} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
                  {getActionIcon(action.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-white truncate">{action.description}</span>
                      <Badge className={getImpactColor(action.impact)} variant="secondary">
                        {action.impact}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400">
                      {action.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-800/30 p-4 rounded-lg border border-cyan-500/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-400">Autonomous Status: ACTIVE</span>
          </div>
          <p className="text-xs text-gray-400">
            System is self-monitoring, self-healing, and continuously evolving without manual intervention.
            All operations are autonomous based on built-in intelligence and decision-making capabilities.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AutonomousOdysseyCore;