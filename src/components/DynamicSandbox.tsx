import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

export const DynamicSandbox: React.FC = () => {
  const [experiments] = useState([
    { id: 1, name: "Neural Architecture Search", status: "running", safety: "isolated" },
    { id: 2, name: "Quantum Algorithm Testing", status: "completed", safety: "verified" },
    { id: 3, name: "Self-Modification Protocol", status: "testing", safety: "contained" },
    { id: 4, name: "Knowledge Graph Expansion", status: "running", safety: "monitored" }
  ]);

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'running': return '🔄';
      case 'completed': return '✅';
      case 'testing': return '🧪';
      default: return '⏸️';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-500/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          Dynamic Sandbox Environment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-300 text-sm">
          Self-contained virtual space for safe experimentation and testing
        </p>
        
        <div className="space-y-2">
          {experiments.map(exp => (
            <div key={exp.id} className="bg-black/20 p-2 rounded border border-green-500/30">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getStatusIcon(exp.status)}</span>
                  <div>
                    <div className="text-green-300 text-xs font-semibold">{exp.name}</div>
                    <div className="text-gray-400 text-xs">Safety: {exp.safety}</div>
                  </div>
                </div>
                <div className="text-xs text-green-400">{exp.status.toUpperCase()}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="text-xs">New Experiment</Button>
          <Button size="sm" variant="outline" className="text-xs">Isolate Test</Button>
        </div>

        <div className="text-center">
          <div className="text-green-400 text-sm">✓ Sandbox Secure & Isolated</div>
        </div>
      </CardContent>
    </Card>
  );
};