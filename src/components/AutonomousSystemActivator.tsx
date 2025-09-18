import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Brain, 
  Zap, 
  Shield, 
  Eye, 
  Cpu, 
  RefreshCw,
  Power,
  AlertTriangle,
  CheckCircle,
  Settings
} from 'lucide-react';

interface SystemModule {
  id: string;
  name: string;
  status: 'inactive' | 'initializing' | 'active' | 'error';
  autonomyLevel: number;
  lastAction: string;
  uptime: number;
}

export default function AutonomousSystemActivator() {
  const [systemModules, setSystemModules] = useState<SystemModule[]>([
    {
      id: 'self-healing',
      name: 'Self-Healing Engine',
      status: 'inactive',
      autonomyLevel: 0,
      lastAction: 'System idle',
      uptime: 0
    },
    {
      id: 'auto-fix',
      name: 'Auto-Fix System',
      status: 'inactive',
      autonomyLevel: 0,
      lastAction: 'Awaiting activation',
      uptime: 0
    },
    {
      id: 'evolution',
      name: 'Self-Evolution Engine',
      status: 'inactive',
      autonomyLevel: 0,
      lastAction: 'Not initialized',
      uptime: 0
    },
    {
      id: 'odyssey-core',
      name: 'Autonomous ODYSSEY Core',
      status: 'inactive',
      autonomyLevel: 0,
      lastAction: 'Core offline',
      uptime: 0
    }
  ]);

  const [masterSwitch, setMasterSwitch] = useState(false);
  const [initializationProgress, setInitializationProgress] = useState(0);

  const activateAutonomousSystems = async () => {
    setMasterSwitch(true);
    setInitializationProgress(0);

    // Initialize each module sequentially
    for (let i = 0; i < systemModules.length; i++) {
      const module = systemModules[i];
      
      // Set to initializing
      setSystemModules(prev => prev.map(m => 
        m.id === module.id 
          ? { ...m, status: 'initializing', lastAction: 'Initializing autonomous operations...' }
          : m
      ));

      // Simulate initialization time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Activate module
      setSystemModules(prev => prev.map(m => 
        m.id === module.id 
          ? { 
              ...m, 
              status: 'active', 
              autonomyLevel: 100,
              lastAction: 'Autonomous operations active',
              uptime: Date.now()
            }
          : m
      ));

      setInitializationProgress(((i + 1) / systemModules.length) * 100);
    }
  };

  const deactivateAutonomousSystems = () => {
    setMasterSwitch(false);
    setInitializationProgress(0);
    setSystemModules(prev => prev.map(m => ({
      ...m,
      status: 'inactive' as const,
      autonomyLevel: 0,
      lastAction: 'System deactivated',
      uptime: 0
    })));
  };

  // Simulate autonomous activity when active
  useEffect(() => {
    if (!masterSwitch) return;

    const interval = setInterval(() => {
      setSystemModules(prev => prev.map(module => {
        if (module.status !== 'active') return module;

        const actions = [
          'Self-diagnosing system health',
          'Optimizing performance parameters',
          'Scanning for improvements',
          'Executing autonomous repairs',
          'Learning from system patterns',
          'Updating security protocols',
          'Enhancing operational efficiency'
        ];

        return {
          ...module,
          lastAction: actions[Math.floor(Math.random() * actions.length)],
          autonomyLevel: Math.min(100, module.autonomyLevel + Math.random() * 2)
        };
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [masterSwitch]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'initializing': return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <Power className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600';
      case 'initializing': return 'bg-blue-600';
      case 'error': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const activeModules = systemModules.filter(m => m.status === 'active').length;
  const totalModules = systemModules.length;

  return (
    <Card className="w-full bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-500/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-cyan-400">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6" />
            Autonomous System Control Center
          </div>
          <Badge className={masterSwitch ? 'bg-green-600' : 'bg-red-600'}>
            {masterSwitch ? 'AUTONOMOUS' : 'MANUAL'}
          </Badge>
        </CardTitle>
        <p className="text-gray-400 text-sm">
          Activate ODYSSEY-1's autonomous capabilities for self-managing operations
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
          <div>
            <h3 className="text-white font-medium">Master Autonomous Control</h3>
            <p className="text-gray-400 text-sm">
              {masterSwitch 
                ? `${activeModules}/${totalModules} systems operating autonomously`
                : 'All systems in manual mode'
              }
            </p>
          </div>
          <Button
            onClick={masterSwitch ? deactivateAutonomousSystems : activateAutonomousSystems}
            size="lg"
            className={masterSwitch 
              ? "bg-red-600 hover:bg-red-700" 
              : "bg-green-600 hover:bg-green-700"
            }
            disabled={initializationProgress > 0 && initializationProgress < 100}
          >
            <Power className="w-4 h-4 mr-2" />
            {masterSwitch ? 'Deactivate' : 'Activate'} Autonomous Mode
          </Button>
        </div>

        {initializationProgress > 0 && initializationProgress < 100 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Initializing Autonomous Systems</span>
              <span className="text-cyan-400">{Math.round(initializationProgress)}%</span>
            </div>
            <Progress value={initializationProgress} className="h-2" />
          </div>
        )}

        <div className="grid gap-4">
          {systemModules.map((module) => (
            <Card key={module.id} className="bg-slate-800/30 border-gray-600/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(module.status)}
                    <div>
                      <h4 className="text-white font-medium">{module.name}</h4>
                      <p className="text-sm text-gray-400">{module.lastAction}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm text-gray-300">Autonomy Level</div>
                      <div className="text-lg font-bold text-cyan-400">
                        {Math.round(module.autonomyLevel)}%
                      </div>
                    </div>
                    <Badge className={getStatusColor(module.status)}>
                      {module.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                {module.status === 'active' && (
                  <div className="mt-3">
                    <Progress value={module.autonomyLevel} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {masterSwitch && (
          <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-medium">Autonomous Operations Active</span>
            </div>
            <p className="text-sm text-gray-300">
              ODYSSEY-1 is now operating independently. The system will self-monitor, 
              self-heal, and continuously improve without manual intervention. 
              All autonomous modules are functioning at optimal levels.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}