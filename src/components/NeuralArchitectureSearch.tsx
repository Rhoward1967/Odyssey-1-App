import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';

export default function NeuralArchitectureSearch() {
  const [searchState, setSearchState] = useState({
    generation: 47,
    topAccuracy: 98.7,
    architecturesEvaluated: 2847,
    currentSearch: 'Transformer Variants'
  });

  const [architectures, setArchitectures] = useState([
    { name: 'OdysseyNet-V4', accuracy: 98.7, params: '1.2B', status: 'champion' },
    { name: 'QuantumTransformer', accuracy: 97.9, params: '890M', status: 'evaluating' },
    { name: 'AdaptiveConvNet', accuracy: 96.4, params: '450M', status: 'training' },
    { name: 'HybridAttention', accuracy: 95.8, params: '2.1B', status: 'completed' }
  ]);

  const [searchProgress, setSearchProgress] = useState(73);

  useEffect(() => {
    const interval = setInterval(() => {
      setSearchProgress(prev => (prev + 1) % 100);
      setSearchState(prev => ({
        ...prev,
        architecturesEvaluated: prev.architecturesEvaluated + Math.floor(Math.random() * 3),
        topAccuracy: Math.min(99.9, prev.topAccuracy + Math.random() * 0.1)
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-gradient-to-br from-green-900/20 to-teal-900/20 border-green-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          Neural Architecture Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{searchState.generation}</div>
            <div className="text-sm text-gray-400">Generation</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-teal-400">{searchState.topAccuracy.toFixed(1)}%</div>
            <div className="text-sm text-gray-400">Best Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{searchState.architecturesEvaluated}</div>
            <div className="text-sm text-gray-400">Evaluated</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-400">{searchProgress}%</div>
            <div className="text-sm text-gray-400">Search Progress</div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-white">Current Search: {searchState.currentSearch}</span>
          </div>
          <Progress value={searchProgress} className="w-full" />
        </div>

        <div className="space-y-3">
          <h4 className="text-white font-semibold">Top Architectures</h4>
          {architectures.map((arch, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant={arch.status === 'champion' ? 'default' : 'secondary'}>
                  {arch.status}
                </Badge>
                <div>
                  <div className="text-white font-medium">{arch.name}</div>
                  <div className="text-sm text-gray-400">{arch.params} parameters</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-400">{arch.accuracy}%</div>
                <div className="text-sm text-gray-400">accuracy</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            Start New Search
          </Button>
          <Button size="sm" variant="outline">
            Deploy Champion
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}