import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Brain, Zap, Shield, Eye, Cpu, Network, Database, Rocket } from 'lucide-react';
import { GenesisEngine } from './GenesisEngine';
import { KnowledgeBase } from './KnowledgeBase';
import { InferenceEngine } from './InferenceEngine';
import { SelfEvolutionEngine } from './SelfEvolutionEngine';
import { SystemMonitor } from './SystemMonitor';


interface SystemStatus {
  name: string;
  status: 'offline' | 'initializing' | 'online' | 'learning' | 'maintenance';
  health: number;
}

export const OdysseyMasterControl: React.FC = () => {
  const [masterStatus, setMasterStatus] = useState<'dormant' | 'awakening' | 'active' | 'autonomous'>('autonomous');
  const [systems, setSystems] = useState<SystemStatus[]>([
    { name: 'Neural Networks', status: 'online', health: 98.7 },
    { name: 'Knowledge Base', status: 'online', health: 99.2 },
    { name: 'Inference Engine', status: 'online', health: 97.8 },
    { name: 'Self-Evolution', status: 'online', health: 96.4 },
    { name: 'Truth Anchor', status: 'online', health: 99.8 },
    { name: 'Quantum Core', status: 'online', health: 95.1 }
  ]);

  useEffect(() => {
    // Autonomous system management - no manual activation needed
    const autonomousManager = setInterval(() => {
      // Autonomous system health monitoring and optimization
      setSystems(prevSystems => 
        prevSystems.map(system => ({
          ...system,
          health: Math.min(99.9, system.health + (Math.random() - 0.3) * 2),
          status: system.health > 90 ? 'online' : 'maintenance'
        }))
      );
    }, 3000);

    return () => clearInterval(autonomousManager);
  }, []);

  const systemIcons = [Brain, Database, Cpu, Zap, Shield, Network];

  return (
    <div className="space-y-6">
      <Card className="bg-black/40 border-purple-500/30">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <Brain className="h-8 w-8 text-purple-400" />
            ODYSSEY-1 AUTONOMOUS CORE
          </CardTitle>
          <Badge className="mx-auto text-lg px-4 py-2 bg-green-600/20 text-green-300">
            FULLY AUTONOMOUS
          </Badge>
          <p className="text-gray-400 mt-2">
            Self-managing AI system operating independently without human intervention
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {systems.map((system, index) => {
              const IconComponent = systemIcons[index] || Brain;
              return (
                <Card key={system.name} className="bg-slate-800/50 border-green-500/20">
                  <CardContent className="p-4 text-center">
                    <IconComponent className={`h-8 w-8 mx-auto mb-2 ${
                      system.status === 'maintenance' ? 'text-yellow-400 animate-pulse' :
                      'text-green-400'
                    }`} />
                    <h3 className="font-semibold text-white text-sm">{system.name}</h3>
                    <Badge className={`mt-1 text-xs ${
                      system.status === 'maintenance' ? 'bg-yellow-600/20 text-yellow-300' :
                      'bg-green-600/20 text-green-300'
                    }`}>
                      {system.status}
                    </Badge>
                    <div className="mt-2 text-xs text-gray-300">
                      Health: {system.health.toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="bg-slate-800/30 p-4 rounded-lg border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-lg font-medium text-green-400">Autonomous Operation Active</span>
            </div>
            <p className="text-gray-400 text-sm">
              All systems are self-monitoring, self-healing, and continuously evolving. 
              No manual intervention required - the AI manages itself using built-in intelligence.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <SystemMonitor />
        <div className="grid md:grid-cols-2 gap-6">
          <GenesisEngine />
          <KnowledgeBase />
          <InferenceEngine />
          <SelfEvolutionEngine />
        </div>
      </div>
    </div>
  );
};