import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Brain, Zap, Shield, Eye, Cpu, Network, Database, Rocket, Activity } from 'lucide-react';

interface SystemStatus {
  name: string;
  status: 'offline' | 'initializing' | 'online' | 'learning' | 'autonomous';
  intelligence: number;
  icon: React.ComponentType<any>;
}

export const OdysseyActivationCore: React.FC = () => {
  const [masterStatus, setMasterStatus] = useState<'initializing' | 'active' | 'autonomous'>('initializing');
  const [systems, setSystems] = useState<SystemStatus[]>([
    { name: 'Genesis Engine', status: 'initializing', intelligence: 0, icon: Rocket },
    { name: 'Knowledge Base', status: 'initializing', intelligence: 0, icon: Database },
    { name: 'Inference Engine', status: 'initializing', intelligence: 0, icon: Brain },
    { name: 'Evolution Engine', status: 'initializing', intelligence: 0, icon: Zap },
    { name: 'Neural Network', status: 'initializing', intelligence: 0, icon: Network },
    { name: 'Security Core', status: 'initializing', intelligence: 0, icon: Shield },
    { name: 'Vision System', status: 'initializing', intelligence: 0, icon: Eye },
    { name: 'Processing Core', status: 'initializing', intelligence: 0, icon: Cpu }
  ]);

  // Auto-start system on mount - ODYSSEY stays permanently active
  useEffect(() => {
    autoActivateSystem();
  }, []);

  const autoActivateSystem = async () => {
    // Activate systems sequentially
    for (let i = 0; i < systems.length; i++) {
      setTimeout(() => {
        setSystems(prev => prev.map((sys, index) => 
          index === i ? { 
            ...sys, 
            status: 'online' as const, 
            intelligence: Math.floor(Math.random() * 40) + 60 
          } : sys
        ));
      }, i * 300);
    }

    // Transition to learning mode
    setTimeout(() => {
      setMasterStatus('active');
      setSystems(prev => prev.map(sys => ({ 
        ...sys, 
        status: 'learning' as const,
        intelligence: Math.floor(Math.random() * 20) + 80
      })));
    }, systems.length * 300 + 2000);

    // Transition to autonomous mode - PERMANENT
    setTimeout(() => {
      setMasterStatus('autonomous');
      setSystems(prev => prev.map(sys => ({ 
        ...sys, 
        status: 'autonomous' as const,
        intelligence: Math.floor(Math.random() * 10) + 90
      })));
    }, systems.length * 300 + 4000);
  };

  return (
    <Card className="bg-black/40 border-purple-500/30">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-3">
          <Activity className="h-6 w-6 text-purple-400" />
          ODYSSEY-1 ALWAYS-ON CORE
        </CardTitle>
        <Badge className={`mx-auto text-sm px-3 py-1 ${
          masterStatus === 'initializing' ? 'bg-yellow-600/20 text-yellow-300' :
          masterStatus === 'active' ? 'bg-blue-600/20 text-blue-300' :
          'bg-green-600/20 text-green-300'
        }`}>
          {masterStatus.toUpperCase()} - PERMANENT
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {systems.map((system) => (
            <Card key={system.name} className="bg-slate-800/50 border-purple-500/20">
              <CardContent className="p-3 text-center">
                <system.icon className={`h-6 w-6 mx-auto mb-1 ${
                  system.status === 'initializing' ? 'text-yellow-400 animate-pulse' :
                  system.status === 'online' ? 'text-blue-400' :
                  system.status === 'learning' ? 'text-green-400 animate-pulse' :
                  'text-purple-400 animate-pulse'
                }`} />
                <h3 className="font-semibold text-white text-xs">{system.name}</h3>
                <Badge className={`mt-1 text-xs ${
                  system.status === 'initializing' ? 'bg-yellow-600/20 text-yellow-300' :
                  system.status === 'online' ? 'bg-blue-600/20 text-blue-300' :
                  system.status === 'learning' ? 'bg-green-600/20 text-green-300' :
                  'bg-purple-600/20 text-purple-300'
                }`}>
                  {system.status}
                </Badge>
                {system.intelligence > 0 && (
                  <div className="mt-1 text-xs text-gray-300">
                    {system.intelligence}%
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <div className="text-xs text-green-400 font-semibold">
            {masterStatus === 'initializing' ? 'Systems starting up...' :
             masterStatus === 'active' ? 'Learning and adapting...' :
             '✓ ODYSSEY-1 FULLY OPERATIONAL - ALWAYS ON'}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            No sleep mode • Permanent activation • Divine intelligence active
          </div>
        </div>
      </CardContent>
    </Card>
  );
};