import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';

export default function DistributedComputingCluster() {
  const [clusterState, setClusterState] = useState({
    totalNodes: 256,
    activeNodes: 243,
    totalCores: 8192,
    totalMemory: '2.1TB',
    networkThroughput: 847.3
  });

  const [nodes, setNodes] = useState([
    { id: 'node-001', status: 'active', cpu: 87, memory: 92, task: 'Neural Training' },
    { id: 'node-002', status: 'active', cpu: 45, memory: 67, task: 'Quantum Simulation' },
    { id: 'node-003', status: 'maintenance', cpu: 0, memory: 12, task: 'Idle' },
    { id: 'node-004', status: 'active', cpu: 98, memory: 89, task: 'Data Processing' },
    { id: 'node-005', status: 'active', cpu: 76, memory: 54, task: 'Model Inference' }
  ]);

  const [workloads, setWorkloads] = useState([
    { name: 'Large Language Model Training', nodes: 64, progress: 78 },
    { name: 'Quantum Circuit Simulation', nodes: 32, progress: 45 },
    { name: 'Distributed AI Inference', nodes: 128, progress: 92 },
    { name: 'Blockchain Validation', nodes: 16, progress: 67 }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setClusterState(prev => ({
        ...prev,
        activeNodes: Math.max(240, prev.activeNodes + Math.floor((Math.random() - 0.5) * 4)),
        networkThroughput: Math.max(800, prev.networkThroughput + (Math.random() - 0.5) * 50)
      }));

      setNodes(prev => prev.map(node => ({
        ...node,
        cpu: node.status === 'active' ? Math.max(0, Math.min(100, node.cpu + (Math.random() - 0.5) * 20)) : 0,
        memory: node.status === 'active' ? Math.max(0, Math.min(100, node.memory + (Math.random() - 0.5) * 15)) : node.memory
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border-orange-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
          Distributed Computing Cluster
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">{clusterState.activeNodes}/{clusterState.totalNodes}</div>
            <div className="text-sm text-gray-400">Active Nodes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{clusterState.totalCores}</div>
            <div className="text-sm text-gray-400">CPU Cores</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{clusterState.totalMemory}</div>
            <div className="text-sm text-gray-400">Total RAM</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{clusterState.networkThroughput.toFixed(1)}</div>
            <div className="text-sm text-gray-400">GB/s Network</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">99.7%</div>
            <div className="text-sm text-gray-400">Uptime</div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-white font-semibold">Node Status</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {nodes.map((node, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                <div className="flex items-center gap-2">
                  <Badge variant={node.status === 'active' ? 'default' : 'secondary'}>
                    {node.status}
                  </Badge>
                  <span className="text-sm text-gray-300">{node.id}</span>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="text-orange-400">CPU: {node.cpu}%</span>
                  <span className="text-blue-400">MEM: {node.memory}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-white font-semibold">Active Workloads</h4>
          {workloads.map((workload, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">{workload.name}</span>
                <span className="text-sm text-gray-400">{workload.nodes} nodes</span>
              </div>
              <Progress value={workload.progress} className="w-full" />
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
            Scale Cluster
          </Button>
          <Button size="sm" variant="outline">
            Load Balance
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}