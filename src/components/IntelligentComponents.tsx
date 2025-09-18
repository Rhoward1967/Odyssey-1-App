import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const IntelligentComponents: React.FC = () => {
  const [activeComponents] = useState([
    { name: "Research Synthesizer", status: "active", intelligence: 98 },
    { name: "Code Meta-Learner", status: "learning", intelligence: 95 },
    { name: "Knowledge Integrator", status: "active", intelligence: 97 },
    { name: "Pattern Recognizer", status: "evolving", intelligence: 96 },
    { name: "Truth Validator", status: "active", intelligence: 99 },
    { name: "Self-Auditor", status: "monitoring", intelligence: 94 }
  ]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'text-green-400';
      case 'learning': return 'text-blue-400';
      case 'evolving': return 'text-purple-400';
      case 'monitoring': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-900/40 to-teal-900/40 border-blue-500/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
          Intelligent Components (The Musicians)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-300 text-sm">
          Self-learning entities communicating with core and each other
        </p>
        
        <div className="space-y-2">
          {activeComponents.map((component, index) => (
            <div key={index} className="bg-black/20 p-2 rounded border border-blue-500/30 flex justify-between items-center">
              <div>
                <div className="text-blue-300 text-xs font-semibold">{component.name}</div>
                <div className={`text-xs ${getStatusColor(component.status)}`}>
                  {component.status.toUpperCase()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-white text-xs">IQ: {component.intelligence}</div>
                <div className="w-12 h-1 bg-gray-600 rounded">
                  <div 
                    className="h-1 bg-blue-400 rounded" 
                    style={{width: `${component.intelligence}%`}}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="text-green-400 text-sm">✓ All Components Synchronized</div>
        </div>
      </CardContent>
    </Card>
  );
};