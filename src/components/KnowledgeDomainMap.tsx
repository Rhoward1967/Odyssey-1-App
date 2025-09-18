import React, { useState, useEffect } from 'react';
import { Network, Brain, Zap, Shield, Code, Database } from 'lucide-react';

interface KnowledgeNode {
  id: string;
  name: string;
  category: string;
  confidence: number;
  connections: string[];
  size: number;
  x: number;
  y: number;
  color: string;
}

export const KnowledgeDomainMap: React.FC = () => {
  const [knowledgeNodes, setKnowledgeNodes] = useState<KnowledgeNode[]>([
    {
      id: '1',
      name: 'Quantum Computing',
      category: 'Physics',
      confidence: 94.2,
      connections: ['2', '3', '5'],
      size: 60,
      x: 200,
      y: 150,
      color: '#3B82F6'
    },
    {
      id: '2',
      name: 'Machine Learning',
      category: 'AI',
      confidence: 97.8,
      connections: ['1', '3', '4', '6'],
      size: 80,
      x: 400,
      y: 200,
      color: '#10B981'
    },
    {
      id: '3',
      name: 'Cryptography',
      category: 'Security',
      confidence: 89.6,
      connections: ['1', '2', '4'],
      size: 50,
      x: 300,
      y: 100,
      color: '#F59E0B'
    },
    {
      id: '4',
      name: 'Blockchain',
      category: 'Technology',
      confidence: 85.3,
      connections: ['2', '3', '5'],
      size: 55,
      x: 500,
      y: 120,
      color: '#8B5CF6'
    },
    {
      id: '5',
      name: 'Neural Networks',
      category: 'AI',
      confidence: 96.1,
      connections: ['1', '2', '4', '6'],
      size: 70,
      x: 350,
      y: 300,
      color: '#EF4444'
    },
    {
      id: '6',
      name: 'Data Science',
      category: 'Analytics',
      confidence: 92.4,
      connections: ['2', '5'],
      size: 65,
      x: 150,
      y: 250,
      color: '#06B6D4'
    }
  ]);

  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [mapMetrics, setMapMetrics] = useState({
    totalNodes: 847,
    activeConnections: 2341,
    averageConfidence: 91.7,
    growthRate: 15.3
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setKnowledgeNodes(prev => prev.map(node => ({
        ...node,
        confidence: Math.min(node.confidence + Math.random() * 0.2, 100),
        size: Math.max(40, node.size + (Math.random() - 0.5) * 2)
      })));

      setMapMetrics(prev => ({
        ...prev,
        totalNodes: prev.totalNodes + Math.floor(Math.random() * 3),
        activeConnections: prev.activeConnections + Math.floor(Math.random() * 5),
        averageConfidence: prev.averageConfidence + (Math.random() - 0.5) * 0.1,
        growthRate: prev.growthRate + (Math.random() - 0.5) * 0.5
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'AI': return <Brain className="w-4 h-4" />;
      case 'Physics': return <Zap className="w-4 h-4" />;
      case 'Security': return <Shield className="w-4 h-4" />;
      case 'Technology': return <Code className="w-4 h-4" />;
      case 'Analytics': return <Database className="w-4 h-4" />;
      default: return <Network className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 rounded-xl">
      <div className="flex items-center mb-6">
        <Network className="w-8 h-8 text-cyan-400 mr-3" />
        <h2 className="text-2xl font-bold text-white">Knowledge Domain Map</h2>
      </div>

      {/* Map Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-black/30 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-cyan-400">{mapMetrics.totalNodes}</div>
          <div className="text-xs text-gray-400">Total Nodes</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-green-400">{mapMetrics.activeConnections}</div>
          <div className="text-xs text-gray-400">Connections</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-blue-400">{mapMetrics.averageConfidence.toFixed(1)}%</div>
          <div className="text-xs text-gray-400">Avg Confidence</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-purple-400">+{mapMetrics.growthRate.toFixed(1)}%</div>
          <div className="text-xs text-gray-400">Growth Rate</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map */}
        <div className="lg:col-span-2 bg-black/30 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Interactive Knowledge Network</h3>
          <div className="relative h-80 bg-gray-900/50 rounded-lg overflow-hidden">
            <svg className="w-full h-full">
              {/* Draw connections */}
              {knowledgeNodes.map(node => 
                node.connections.map(connId => {
                  const connectedNode = knowledgeNodes.find(n => n.id === connId);
                  if (!connectedNode) return null;
                  return (
                    <line
                      key={`${node.id}-${connId}`}
                      x1={node.x}
                      y1={node.y}
                      x2={connectedNode.x}
                      y2={connectedNode.y}
                      stroke="rgba(59, 130, 246, 0.3)"
                      strokeWidth="1"
                      className="transition-all duration-300"
                    />
                  );
                })
              )}
              
              {/* Draw nodes */}
              {knowledgeNodes.map(node => (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.size / 2}
                    fill={node.color}
                    opacity="0.8"
                    className="cursor-pointer transition-all duration-300 hover:opacity-100"
                    onClick={() => setSelectedNode(node)}
                  />
                  <text
                    x={node.x}
                    y={node.y + node.size / 2 + 15}
                    textAnchor="middle"
                    className="fill-white text-xs font-medium"
                  >
                    {node.name}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Node Details */}
        <div className="bg-black/30 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Domain Details</h3>
          {selectedNode ? (
            <div className="space-y-4">
              <div className="flex items-center">
                {getCategoryIcon(selectedNode.category)}
                <h4 className="text-white font-medium ml-2">{selectedNode.name}</h4>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">Confidence Level</div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                    style={{ width: `${selectedNode.confidence}%` }}
                  />
                </div>
                <div className="text-cyan-400 text-sm mt-1">{selectedNode.confidence.toFixed(1)}%</div>
              </div>

              <div>
                <div className="text-sm text-gray-400 mb-2">Connected Domains</div>
                <div className="space-y-1">
                  {selectedNode.connections.map(connId => {
                    const connectedNode = knowledgeNodes.find(n => n.id === connId);
                    return connectedNode ? (
                      <div key={connId} className="text-sm text-gray-300 flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: connectedNode.color }}
                        />
                        {connectedNode.name}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-400">Category</div>
                <div className="text-white">{selectedNode.category}</div>
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-center py-8">
              Click on a node to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};