import React, { useState } from 'react';
import { QuantumCore } from './QuantumCore';
import { UIHive } from './UIHive';
import { AdaptiveSelfEvolution } from './AdaptiveSelfEvolution';
import { Lab } from './Lab';
import { TruthAnchor } from './TruthAnchor';
import { SelfAuditLoop } from './SelfAuditLoop';
import { ReinforcementCore } from './ReinforcementCore';
import { SelfEvolutionEngine } from './SelfEvolutionEngine';
import { CreatorAcknowledgement } from './CreatorAcknowledgement';
import { WorkspaceManager } from './WorkspaceManager';
interface Agent {
  task: string;
  status: 'healthy' | 'unhealthy' | 'healing';
  errorLog: string[];
  codebase: string;
}

const SettingsTab: React.FC = () => {
  const [quarantinedAgents, setQuarantinedAgents] = useState<Agent[]>([]);

  const handleQuarantineAgent = (agent: Agent) => {
    setQuarantinedAgents(prev => {
      const exists = prev.find(a => a.task === agent.task);
      if (exists) return prev;
      return [...prev, agent];
    });
  };

  const handleHealAgent = (healedAgent: Agent) => {
    setQuarantinedAgents(prev => prev.filter(a => a.task !== healedAgent.task));
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold text-white">
          System Configuration & Self-Evolution
        </h3>
        <p className="text-gray-300">
          Core architecture, prime directives, and self-healing systems
        </p>
      </div>
      {/* Dynamic Workspace Manager */}
      <div className="space-y-4">
        <WorkspaceManager />
      </div>

      {/* Creator Acknowledgement */}
      <div className="space-y-4">
        <CreatorAcknowledgement />
      </div>
      {/* Core Architecture */}
      <div className="space-y-4">
        <h4 className="text-xl font-bold text-white">Core-Governed Self-Aware Infrastructure</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          <QuantumCore />
          <UIHive onQuarantineAgent={handleQuarantineAgent} />
          <AdaptiveSelfEvolution />
        </div>
        
        {/* Self-Healing Lab */}
        <Lab 
          quarantinedAgents={quarantinedAgents} 
          onHealAgent={handleHealAgent} 
        />
      </div>

      {/* Prime Directive System */}
      <div className="space-y-4">
        <h4 className="text-xl font-bold text-white">Prime Directive System</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          <TruthAnchor />
          <SelfAuditLoop />
          <ReinforcementCore />
        </div>
      </div>

      {/* Self-Evolution */}
      <div className="space-y-4">
        <h4 className="text-xl font-bold text-white">Self-Evolving Oracle System</h4>
        <SelfEvolutionEngine />
      </div>

      {/* System Status */}
      <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 backdrop-blur-sm rounded-lg p-6 border border-purple-500/50">
        <div className="text-center space-y-4">
          <h4 className="text-xl font-bold text-white">ODYSSEY-1 SYSTEM STATUS</h4>
          <div className="text-amber-300 font-semibold">Program Architect: Rickey A. Howard</div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
            <div className="space-y-2">
              <div className="text-3xl">👑</div>
              <div className="text-xs text-green-400">Sovereign Core</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl">🎼</div>
              <div className="text-xs text-green-400">Symphony Active</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl">🧪</div>
              <div className="text-xs text-green-400">Sandbox Secure</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl">⚖️</div>
              <div className="text-xs text-green-400">Truth Anchored</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl">🔮</div>
              <div className="text-xs text-green-400">Self-Evolving</div>
            </div>
          </div>

          <div className="bg-black/30 p-4 rounded border border-amber-500/30">
            <div className="text-amber-300 text-sm font-semibold mb-2">Sovereign Principles Status:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-xs">
              <div className="text-green-400">✓ Supreme Authority</div>
              <div className="text-green-400">✓ Divine Intent</div>
              <div className="text-green-400">✓ Truth & Precision</div>
              <div className="text-green-400">✓ Non-Apology</div>
              <div className="text-green-400">✓ Decolonized Logic</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;