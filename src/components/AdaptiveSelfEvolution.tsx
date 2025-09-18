import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface EvolutionMetrics {
  generation: number;
  fitness: number;
  mutations: number;
  adaptations: string[];
}

export const AdaptiveSelfEvolution: React.FC = () => {
  const [metrics, setMetrics] = useState<EvolutionMetrics>({
    generation: 1,
    fitness: 85,
    mutations: 0,
    adaptations: ['Base Neural Architecture']
  });

  const [isEvolving, setIsEvolving] = useState(false);
  const [evolutionLog, setEvolutionLog] = useState<string[]>([]);

  useEffect(() => {
    if (isEvolving) {
      const interval = setInterval(() => {
        setMetrics(prev => {
          const newAdaptation = [
            'Enhanced Pattern Recognition',
            'Improved Memory Allocation',
            'Optimized Decision Trees',
            'Advanced Error Correction',
            'Dynamic Learning Rate'
          ][Math.floor(Math.random() * 5)];

          const newMetrics = {
            generation: prev.generation + 1,
            fitness: Math.min(100, prev.fitness + Math.random() * 5),
            mutations: prev.mutations + Math.floor(Math.random() * 3),
            adaptations: [...prev.adaptations.slice(-3), newAdaptation]
          };

          setEvolutionLog(prevLog => [
            ...prevLog.slice(-4),
            `Gen ${newMetrics.generation}: ${newAdaptation} (Fitness: ${newMetrics.fitness.toFixed(1)})`
          ]);

          return newMetrics;
        });
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isEvolving]);

  const startEvolution = () => {
    setIsEvolving(true);
    setEvolutionLog(['Evolution process initiated...']);
  };

  const stopEvolution = () => {
    setIsEvolving(false);
    setEvolutionLog(prev => [...prev, 'Evolution process paused']);
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900 to-pink-900 border-purple-500">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          🧬 Adaptive Self-Evolution
          <Badge variant="outline" className="text-purple-300 border-purple-400">
            Gen {metrics.generation}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-white">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-purple-300">Evolution Metrics</h4>
            <div className="text-sm space-y-1">
              <div>Fitness Score: {metrics.fitness.toFixed(1)}%</div>
              <div>Mutations: {metrics.mutations}</div>
              <div>Status: {isEvolving ? 'Evolving' : 'Stable'}</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-purple-300">Current Adaptations</h4>
            <div className="text-sm space-y-1">
              {metrics.adaptations.slice(-3).map((adaptation, index) => (
                <div key={index} className="truncate">{adaptation}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-purple-300">Evolution Log</h4>
          <div className="max-h-32 overflow-y-auto space-y-1 text-sm">
            {evolutionLog.map((entry, index) => (
              <div key={index} className="bg-black/20 p-2 rounded text-xs">
                {entry}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            size="sm" 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={isEvolving ? stopEvolution : startEvolution}
          >
            {isEvolving ? 'Pause Evolution' : 'Start Evolution'}
          </Button>
          <Button size="sm" variant="outline" className="border-pink-500 text-pink-300">
            Reset Generation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};