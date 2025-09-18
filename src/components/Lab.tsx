import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface Agent {
  task: string;
  status: 'healthy' | 'unhealthy' | 'healing';
  errorLog: string[];
  codebase: string;
}

interface LabProps {
  quarantinedAgents: Agent[];
  onHealAgent: (agent: Agent) => void;
}

export const Lab: React.FC<LabProps> = ({ quarantinedAgents, onHealAgent }) => {
  const [healingProgress, setHealingProgress] = useState<{[key: string]: number}>({});
  const [analysisResults, setAnalysisResults] = useState<{[key: string]: string}>({});

  const analyzeAndHeal = (agent: Agent) => {
    console.log(`LAB: Analyzing agent for task '${agent.task}'`);
    
    // Simulate analysis process
    setHealingProgress(prev => ({ ...prev, [agent.task]: 0 }));
    
    const interval = setInterval(() => {
      setHealingProgress(prev => {
        const current = prev[agent.task] || 0;
        if (current >= 100) {
          clearInterval(interval);
          // Complete healing process
          const healedAgent = {
            ...agent,
            status: 'healthy' as const,
            errorLog: [],
            codebase: `healed_${agent.codebase}`
          };
          setAnalysisResults(prev => ({
            ...prev,
            [agent.task]: 'Agent successfully healed and optimized'
          }));
          onHealAgent(healedAgent);
          return prev;
        }
        return { ...prev, [agent.task]: current + 10 };
      });
    }, 200);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 Self-Healing Laboratory
          <Badge variant="outline">{quarantinedAgents.length} Agents in Analysis</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {quarantinedAgents.map((agent, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Task: {agent.task}</h4>
                <Badge variant={agent.status === 'healthy' ? 'default' : 'destructive'}>
                  {agent.status}
                </Badge>
              </div>
              
              {agent.errorLog.length > 0 && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  Errors: {agent.errorLog.join(', ')}
                </div>
              )}
              
              {healingProgress[agent.task] !== undefined && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Healing Progress</span>
                    <span>{healingProgress[agent.task]}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                      style={{ width: `${healingProgress[agent.task]}%` }}
                    />
                  </div>
                </div>
              )}
              
              {analysisResults[agent.task] && (
                <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                  {analysisResults[agent.task]}
                </div>
              )}
              
              <Button 
                onClick={() => analyzeAndHeal(agent)}
                disabled={healingProgress[agent.task] !== undefined}
                size="sm"
              >
                {healingProgress[agent.task] !== undefined ? 'Healing...' : 'Analyze & Heal'}
              </Button>
            </div>
          ))}
          
          {quarantinedAgents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No agents currently in quarantine
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};