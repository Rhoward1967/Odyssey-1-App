import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Database, Globe, Zap, HardDrive, Network, RefreshCw } from 'lucide-react';

interface IPFSNode {
  id: string;
  status: 'online' | 'offline' | 'syncing';
  location: string;
  latency: number;
  storage: number;
  bandwidth: number;
}

interface IPFSMetrics {
  totalNodes: number;
  activeNodes: number;
  totalStorage: number;
  usedStorage: number;
  networkLatency: number;
  replicationFactor: number;
}

export const IPFSMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<IPFSMetrics>({
    totalNodes: 0,
    activeNodes: 0,
    totalStorage: 0,
    usedStorage: 0,
    networkLatency: 0,
    replicationFactor: 0
  });
  const [nodes, setNodes] = useState<IPFSNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadIPFSMetrics();
    const interval = setInterval(loadIPFSMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadIPFSMetrics = async () => {
    setIsLoading(true);
    try {
      // Simulate IPFS network data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMetrics({
        totalNodes: 847,
        activeNodes: 823,
        totalStorage: 15.7, // TB
        usedStorage: 8.3, // TB
        networkLatency: 127, // ms
        replicationFactor: 3.2
      });

      setNodes([
        { id: 'node-1', status: 'online', location: 'US-East', latency: 45, storage: 2.1, bandwidth: 150 },
        { id: 'node-2', status: 'online', location: 'EU-West', latency: 89, storage: 1.8, bandwidth: 120 },
        { id: 'node-3', status: 'syncing', location: 'Asia-Pacific', latency: 156, storage: 2.5, bandwidth: 95 },
        { id: 'node-4', status: 'online', location: 'US-West', latency: 67, storage: 1.9, bandwidth: 180 },
        { id: 'node-5', status: 'offline', location: 'EU-Central', latency: 0, storage: 0, bandwidth: 0 }
      ]);
    } catch (error) {
      console.error('Failed to load IPFS metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'syncing': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online': return <Badge className="bg-green-100 text-green-800">Online</Badge>;
      case 'syncing': return <Badge className="bg-yellow-100 text-yellow-800">Syncing</Badge>;
      case 'offline': return <Badge className="bg-red-100 text-red-800">Offline</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">IPFS Network Monitor</h2>
          <p className="text-muted-foreground">Distributed storage network health</p>
        </div>
        <Button onClick={loadIPFSMetrics} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Nodes</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeNodes}</div>
            <p className="text-xs text-muted-foreground">
              {((metrics.activeNodes / metrics.totalNodes) * 100).toFixed(1)}% uptime
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.usedStorage} TB</div>
            <p className="text-xs text-muted-foreground">
              of {metrics.totalStorage} TB total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Latency</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.networkLatency}ms</div>
            <p className="text-xs text-muted-foreground">Average response time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Replication</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.replicationFactor}x</div>
            <p className="text-xs text-muted-foreground">Average copies per file</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Storage Distribution</CardTitle>
            <CardDescription>Network storage utilization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Used Storage</span>
                <span>{((metrics.usedStorage / metrics.totalStorage) * 100).toFixed(1)}%</span>
              </div>
              <Progress value={(metrics.usedStorage / metrics.totalStorage) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Node Availability</span>
                <span>{((metrics.activeNodes / metrics.totalNodes) * 100).toFixed(1)}%</span>
              </div>
              <Progress value={(metrics.activeNodes / metrics.totalNodes) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Data Redundancy</span>
                <span>{((metrics.replicationFactor / 5) * 100).toFixed(0)}%</span>
              </div>
              <Progress value={(metrics.replicationFactor / 5) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Network Nodes</CardTitle>
            <CardDescription>IPFS node status and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {nodes.map((node) => (
                <div key={node.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(node.status)}`} />
                    <div>
                      <p className="font-medium">{node.id}</p>
                      <p className="text-sm text-muted-foreground">{node.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(node.status)}
                    {node.status === 'online' && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {node.latency}ms • {node.storage}TB • {node.bandwidth}MB/s
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};