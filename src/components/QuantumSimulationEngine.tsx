import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

interface SimulationScenario {
  id: string;
  name: string;
  type: 'monte_carlo' | 'market_dynamics' | 'bid_outcome' | 'risk_assessment';
  status: 'running' | 'completed' | 'failed' | 'queued';
  progress: number;
  iterations: number;
  results?: {
    successProbability: number;
    expectedValue: number;
    riskLevel: 'low' | 'medium' | 'high';
    confidence: number;
  };
}

export const QuantumSimulationEngine: React.FC = () => {
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quantumStates, setQuantumStates] = useState({
    superposition: 0.85,
    entanglement: 0.92,
    coherence: 0.78
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setScenarios(prev => prev.map(scenario => {
        if (scenario.status === 'running' && scenario.progress < 100) {
          const newProgress = Math.min(100, scenario.progress + Math.random() * 15);
          const isComplete = newProgress >= 100;
          
          return {
            ...scenario,
            progress: newProgress,
            status: isComplete ? 'completed' : 'running',
            results: isComplete ? {
              successProbability: 0.65 + Math.random() * 0.3,
              expectedValue: 50000 + Math.random() * 200000,
              riskLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
              confidence: 0.8 + Math.random() * 0.15
            } : scenario.results
          };
        }
        return scenario;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const runMonteCarloSimulation = () => {
    const newScenario: SimulationScenario = {
      id: `mc_${Date.now()}`,
      name: 'Bid Success Probability',
      type: 'monte_carlo',
      status: 'running',
      progress: 0,
      iterations: 10000
    };
    
    setScenarios(prev => [...prev, newScenario]);
    setIsProcessing(true);
  };

  const runMarketDynamics = () => {
    const newScenario: SimulationScenario = {
      id: `md_${Date.now()}`,
      name: 'Market Trend Analysis',
      type: 'market_dynamics',
      status: 'running',
      progress: 0,
      iterations: 5000
    };
    
    setScenarios(prev => [...prev, newScenario]);
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900 to-indigo-900 border-purple-500">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          ⚛️ Quantum Simulation Engine
          <Badge variant="outline" className="text-cyan-400 border-cyan-400">
            {scenarios.filter(s => s.status === 'running').length} Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-white">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">{(quantumStates.superposition * 100).toFixed(1)}%</div>
            <div className="text-sm text-gray-300">Superposition</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{(quantumStates.entanglement * 100).toFixed(1)}%</div>
            <div className="text-sm text-gray-300">Entanglement</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-400">{(quantumStates.coherence * 100).toFixed(1)}%</div>
            <div className="text-sm text-gray-300">Coherence</div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-blue-300">Active Simulations</h4>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {scenarios.map((scenario) => (
              <div key={scenario.id} className="bg-black/20 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{scenario.name}</span>
                  <Badge variant={scenario.status === 'completed' ? 'default' : 'secondary'}>
                    {scenario.status}
                  </Badge>
                </div>
                <Progress value={scenario.progress} className="mb-2" />
                {scenario.results && (
                  <div className="text-xs space-y-1 text-gray-300">
                    <div>Success: {(scenario.results.successProbability * 100).toFixed(1)}%</div>
                    <div>Expected Value: ${scenario.results.expectedValue.toLocaleString()}</div>
                    <div>Risk: {scenario.results.riskLevel.toUpperCase()}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button 
            size="sm" 
            className="bg-cyan-600 hover:bg-cyan-700"
            onClick={runMonteCarloSimulation}
            disabled={isProcessing}
          >
            Monte Carlo
          </Button>
          <Button 
            size="sm" 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={runMarketDynamics}
          >
            Market Dynamics
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};