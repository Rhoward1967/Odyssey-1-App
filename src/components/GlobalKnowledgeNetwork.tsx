import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

const GlobalKnowledgeNetwork = () => {
  const [connectedNodes, setConnectedNodes] = useState(2847);
  const [knowledgeBase, setKnowledgeBase] = useState(47.2);
  const [syncStatus, setSyncStatus] = useState(98.7);
  const [isOnline, setIsOnline] = useState(true);
  const [dataTransfer, setDataTransfer] = useState(1247);

  useEffect(() => {
    const interval = setInterval(() => {
      setConnectedNodes(prev => prev + Math.floor(Math.random() * 10) - 3);
      setKnowledgeBase(prev => Math.min(100, prev + Math.random() * 0.1));
      setSyncStatus(prev => Math.max(95, Math.min(100, prev + (Math.random() - 0.5) * 0.5)));
      setDataTransfer(prev => prev + Math.floor(Math.random() * 100));
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const regions = [
    { name: 'North America', nodes: 847, status: 'optimal' },
    { name: 'Europe', nodes: 623, status: 'optimal' },
    { name: 'Asia Pacific', nodes: 892, status: 'high-load' },
    { name: 'South America', nodes: 234, status: 'optimal' },
    { name: 'Africa', nodes: 156, status: 'expanding' },
    { name: 'Oceania', nodes: 95, status: 'optimal' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-green-400';
      case 'high-load': return 'text-yellow-400';
      case 'expanding': return 'text-blue-400';
      default: return 'text-red-400';
    }
  };

  const knowledgeDomains = [
    'Scientific Research', 'Medical Knowledge', 'Engineering', 'Arts & Culture',
    'Technology', 'History', 'Languages', 'Mathematics'
  ];

  return (
    <Card className="bg-gradient-to-br from-green-900/20 to-blue-900/20 border-green-500/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-green-300">Global Knowledge Network</span>
          <Badge variant="outline" className={`border-${isOnline ? 'green' : 'red'}-400 text-${isOnline ? 'green' : 'red'}-300`}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-gray-400">Connected Nodes</div>
            <div className="text-2xl font-bold text-green-300">{connectedNodes.toLocaleString()}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-400">Knowledge Base</div>
            <div className="text-2xl font-bold text-blue-400">{knowledgeBase.toFixed(1)} TB</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Sync Status</span>
            <span className="text-green-400">{syncStatus.toFixed(1)}%</span>
          </div>
          <Progress value={syncStatus} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Data Transfer (MB/s)</span>
            <span className="text-blue-400">{dataTransfer}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-300">Regional Distribution</div>
          <div className="space-y-2">
            {regions.map((region, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-300">{region.name}</span>
                  <span className={`text-xs ${getStatusColor(region.status)}`}>
                    {region.status}
                  </span>
                </div>
                <span className="text-sm text-gray-400">{region.nodes} nodes</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-300">Knowledge Domains</div>
          <div className="flex flex-wrap gap-2">
            {knowledgeDomains.map((domain, index) => (
              <Badge key={index} variant="secondary" className="bg-green-900/30 text-green-300 border-green-500/30">
                {domain}
              </Badge>
            ))}
          </div>
        </div>

        <Button 
          onClick={() => setIsOnline(!isOnline)}
          className={`w-full ${isOnline ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {isOnline ? 'Disconnect Network' : 'Connect to Network'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default GlobalKnowledgeNetwork;