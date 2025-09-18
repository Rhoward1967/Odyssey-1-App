import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Zap, Eye, Mic, Network, Cpu, Activity, FileText } from 'lucide-react';

export const AdvancedAICore = () => {
  const [metrics, setMetrics] = useState({
    nlpAccuracy: 0,
    visionAccuracy: 0,
    learningRate: 0,
    neuralActivity: 0,
    knowledgeNodes: 0,
    processingSpeed: 0
  });

  const [activeProcesses, setActiveProcesses] = useState([
    { name: 'Neural Pattern Recognition', status: 'active', accuracy: 97.3 },
    { name: 'Semantic Understanding', status: 'learning', accuracy: 94.8 },
    { name: 'Visual Object Detection', status: 'active', accuracy: 96.1 },
    { name: 'Language Generation', status: 'optimizing', accuracy: 95.7 },
    { name: 'Knowledge Integration', status: 'active', accuracy: 98.2 }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        nlpAccuracy: Math.min(99.9, prev.nlpAccuracy + Math.random() * 0.1),
        visionAccuracy: Math.min(99.8, prev.visionAccuracy + Math.random() * 0.1),
        learningRate: 85 + Math.random() * 10,
        neuralActivity: 70 + Math.random() * 25,
        knowledgeNodes: Math.floor(50000 + Math.random() * 1000),
        processingSpeed: 1200 + Math.random() * 300
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'learning': return 'bg-blue-500';
      case 'optimizing': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
            AI Core Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  NLP Accuracy
                </span>
                <span className="text-sm font-mono">{metrics.nlpAccuracy.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.nlpAccuracy} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  Vision Accuracy
                </span>
                <span className="text-sm font-mono">{metrics.visionAccuracy.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.visionAccuracy} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  Learning Rate
                </span>
                <span className="text-sm font-mono">{metrics.learningRate.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.learningRate} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-1">
                  <Activity className="w-4 h-4" />
                  Neural Activity
                </span>
                <span className="text-sm font-mono">{metrics.neuralActivity.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.neuralActivity} className="h-2" />
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-sm flex items-center gap-1">
                <Network className="w-4 h-4" />
                Knowledge Nodes
              </span>
              <span className="text-lg font-mono text-blue-400">
                {metrics.knowledgeNodes.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm flex items-center gap-1">
                <Cpu className="w-4 h-4" />
                Processing Speed
              </span>
              <span className="text-lg font-mono text-green-400">
                {metrics.processingSpeed.toFixed(0)} ops/sec
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-900/20 to-green-900/20 border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-blue-400" />
            Active AI Processes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeProcesses.map((process, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(process.status)} animate-pulse`} />
                <span className="text-sm font-medium">{process.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {process.status}
                </Badge>
                <span className="text-sm font-mono text-green-400">
                  {process.accuracy}%
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};