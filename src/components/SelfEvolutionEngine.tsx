import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';

interface EvolutionCycle {
  id: string;
  phase: 'audit' | 'research' | 'hypothesis' | 'testing' | 'deployment';
  description: string;
  progress: number;
  status: 'active' | 'completed' | 'failed';
  improvements: string[];
}

interface CodeChange {
  module: string;
  type: 'optimization' | 'bug_fix' | 'feature_add';
  impact: 'low' | 'medium' | 'high';
  status: 'proposed' | 'testing' | 'deployed';
}

export const SelfEvolutionEngine: React.FC = () => {
  const [currentCycle, setCurrentCycle] = useState<EvolutionCycle>({
    id: '1',
    phase: 'audit',
    description: 'Scanning knowledge graph for inconsistencies',
    progress: 0,
    status: 'active',
    improvements: []
  });

  const [codeChanges, setCodeChanges] = useState<CodeChange[]>([
    {
      module: 'TruthAnchor.tsx',
      type: 'optimization',
      impact: 'medium',
      status: 'deployed'
    },
    {
      module: 'KnowledgeGraph.tsx',
      type: 'feature_add',
      impact: 'high',
      status: 'testing'
    },
    {
      module: 'InferenceEngine.tsx',
      type: 'bug_fix',
      impact: 'low',
      status: 'proposed'
    }
  ]);

  const [evolutionMetrics, setEvolutionMetrics] = useState({
    totalCycles: 47,
    successRate: 94.7,
    codebaseHealth: 98.2,
    knowledgeGrowth: 156.3
  });

  useEffect(() => {
    // Autonomous evolution - no manual intervention needed
    const interval = setInterval(() => {
      setCurrentCycle(prev => {
        const phases: EvolutionCycle['phase'][] = ['audit', 'research', 'hypothesis', 'testing', 'deployment'];
        const currentIndex = phases.indexOf(prev.phase);
        const newProgress = prev.progress + Math.random() * 15;
        
        if (newProgress >= 100) {
          const nextIndex = (currentIndex + 1) % phases.length;
          const nextPhase = phases[nextIndex];
          
          if (nextIndex === 0) {
            // Complete autonomous cycle, update metrics
            setEvolutionMetrics(prevMetrics => ({
              ...prevMetrics,
              totalCycles: prevMetrics.totalCycles + 1,
              knowledgeGrowth: prevMetrics.knowledgeGrowth + Math.random() * 5,
              successRate: Math.min(99.9, prevMetrics.successRate + (Math.random() - 0.5) * 0.5),
              codebaseHealth: Math.min(99.9, prevMetrics.codebaseHealth + (Math.random() - 0.3) * 0.8)
            }));
            
            // Autonomous code improvements
            const improvements = [
              'Optimized neural pathways for faster inference',
              'Enhanced memory allocation algorithms',
              'Improved error detection and correction',
              'Strengthened security protocols',
              'Refined learning algorithms'
            ];
            
            setCodeChanges(prev => [
              {
                module: `${['Neural', 'Memory', 'Security', 'Learning', 'Core'][Math.floor(Math.random() * 5)]}System.tsx`,
                type: ['optimization', 'bug_fix', 'feature_add'][Math.floor(Math.random() * 3)] as any,
                impact: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
                status: 'deployed' as const
              },
              ...prev.slice(0, 2)
            ]);
          }
          
          return {
            ...prev,
            phase: nextPhase,
            progress: 0,
            description: getPhaseDescription(nextPhase),
            improvements: nextIndex === 0 ? [] : [...prev.improvements, `${prev.phase} completed autonomously`]
          };
        }
        
        return {
          ...prev,
          progress: Math.min(100, newProgress)
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getPhaseDescription = (phase: EvolutionCycle['phase']): string => {
    switch (phase) {
      case 'audit': return 'Scanning knowledge graph for inconsistencies';
      case 'research': return 'Gathering external validation data';
      case 'hypothesis': return 'Generating improvement hypotheses';
      case 'testing': return 'Running automated test suite';
      case 'deployment': return 'Deploying validated improvements';
      default: return 'Processing...';
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'audit': return 'bg-blue-500';
      case 'research': return 'bg-purple-500';
      case 'hypothesis': return 'bg-yellow-500';
      case 'testing': return 'bg-orange-500';
      case 'deployment': return 'bg-green-500';
      default: return 'bg-gray-500';
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse"></div>
          Recursive Self-Improvement Engine
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <img 
            src="https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756713053275_210cc1c3.webp"
            alt="Self-Evolution Visualization"
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-6">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-xl font-bold text-blue-600">{evolutionMetrics.totalCycles}</div>
              <div className="text-xs text-gray-600">Evolution Cycles</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-xl font-bold text-green-600">{evolutionMetrics.successRate}%</div>
              <div className="text-xs text-gray-600">Success Rate</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-xl font-bold text-purple-600">{evolutionMetrics.codebaseHealth}%</div>
              <div className="text-xs text-gray-600">Codebase Health</div>
            </div>
            <div className="bg-cyan-50 p-3 rounded-lg">
              <div className="text-xl font-bold text-cyan-600">{evolutionMetrics.knowledgeGrowth}%</div>
              <div className="text-xs text-gray-600">Knowledge Growth</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Current Evolution Cycle</h4>
              <Badge className={getPhaseColor(currentCycle.phase)}>
                {currentCycle.phase.toUpperCase()}
              </Badge>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{currentCycle.description}</p>
            
            <div className="flex items-center gap-2 mb-3">
              <Progress value={currentCycle.progress} className="flex-1" />
              <span className="text-sm font-medium">{Math.round(currentCycle.progress)}%</span>
            </div>
            
            {currentCycle.improvements.length > 0 && (
              <div className="space-y-1">
                <h5 className="text-sm font-medium text-gray-700">Recent Improvements:</h5>
                {currentCycle.improvements.slice(-3).map((improvement, idx) => (
                  <p key={idx} className="text-xs text-green-600 bg-green-50 p-2 rounded">
                    ✓ {improvement}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-3">Code Evolution Pipeline</h4>
            <div className="space-y-3">
              {codeChanges.map((change, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-medium truncate max-w-32">{change.module}</span>
                      <Badge variant="outline" className="text-xs">{change.type}</Badge>
                      <Badge className={getImpactColor(change.impact)} variant="secondary">
                        {change.impact}
                      </Badge>
                    </div>
                  </div>
                  <Badge variant={change.status === 'deployed' ? 'default' : 'secondary'} className="ml-2 flex-shrink-0">
                    {change.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};