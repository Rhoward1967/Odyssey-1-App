import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface KnowledgeNode {
  id: string;
  concept: string;
  confidence: number;
  timestamp: Date;
  connections: string[];
  status: 'verified' | 'pending' | 'conflicted';
}

export const KnowledgeGraph: React.FC = () => {
  const [nodes, setNodes] = useState<KnowledgeNode[]>([
    {
      id: '1',
      concept: 'Truth Verification Protocol',
      confidence: 98,
      timestamp: new Date(),
      connections: ['2', '3'],
      status: 'verified'
    },
    {
      id: '2',
      concept: 'Self-Audit Mechanisms',
      confidence: 95,
      timestamp: new Date(),
      connections: ['1', '4'],
      status: 'verified'
    },
    {
      id: '3',
      concept: 'Dynamic Code Generation',
      confidence: 87,
      timestamp: new Date(),
      connections: ['1', '5'],
      status: 'pending'
    },
    {
      id: '4',
      concept: 'Reinforcement Learning Core',
      confidence: 92,
      timestamp: new Date(),
      connections: ['2'],
      status: 'verified'
    },
    {
      id: '5',
      concept: 'External Research API',
      confidence: 73,
      timestamp: new Date(),
      connections: ['3'],
      status: 'conflicted'
    }
  ]);

  const [activeConnections, setActiveConnections] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveConnections(prev => (prev + 1) % 12);
      
      // Simulate knowledge evolution
      setNodes(prev => prev.map(node => ({
        ...node,
        confidence: Math.min(100, node.confidence + Math.random() * 2 - 1)
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'conflicted': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          Dynamic Knowledge Graph
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <img 
            src="https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756713052392_39ff1d8e.webp"
            alt="Knowledge Graph Visualization"
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
          <div className="flex justify-between text-sm text-gray-600 mb-4">
            <span>Active Connections: {activeConnections}</span>
            <span>Total Nodes: {nodes.length}</span>
            <span>Avg Confidence: {Math.round(nodes.reduce((sum, n) => sum + n.confidence, 0) / nodes.length)}%</span>
          </div>
        </div>

        <div className="space-y-4">
          {nodes.map((node) => (
            <div key={node.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{node.concept}</h4>
                <Badge className={getStatusColor(node.status)}>
                  {node.status}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Confidence:</span>
                  <Progress value={node.confidence} className="flex-1" />
                  <span className="text-sm font-medium">{Math.round(node.confidence)}%</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Connections:</span>
                  <span className="font-medium">{node.connections.length}</span>
                  <span>•</span>
                  <span>Updated: {node.timestamp.toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};