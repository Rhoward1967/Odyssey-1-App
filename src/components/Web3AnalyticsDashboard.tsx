import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DecentralizedAnalytics } from './DecentralizedAnalytics';
import { IPFSMonitor } from './IPFSMonitor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, Database, Shield, Globe, Activity, TrendingUp } from 'lucide-react';
interface BlockchainMetrics {
  totalTransactions: number;
  gasUsed: number;
  blockHeight: number;
  networkFees: number;
  activeContracts: number;
}
export const Web3AnalyticsDashboard: React.FC = () => {
  const [blockchainMetrics, setBlockchainMetrics] = useState<BlockchainMetrics>({
    totalTransactions: 0,
    gasUsed: 0,
    blockHeight: 0,
    networkFees: 0,
    activeContracts: 0
  });
  const [isConnected, setIsConnected] = useState(false);
  useEffect(() => {
    loadBlockchainMetrics();
  }, []);
  const loadBlockchainMetrics = async () => {
    try {
      // Simulate blockchain data
      setBlockchainMetrics({
        totalTransactions: 234567,
        gasUsed: 15.7,
        blockHeight: 18945672,
        networkFees: 0.0034,
        activeContracts: 127
      });
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to load blockchain metrics:', error);
    }
  };
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Web3 Analytics Dashboard</h1>
          <p className="text-muted-foreground">Decentralized monitoring and analytics platform</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "secondary"}>
            <Shield className="w-3 h-3 mr-1" />
            {isConnected ? 'Blockchain Connected' : 'Connecting...'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blockchainMetrics.totalTransactions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total on-chain</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gas Used</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blockchainMetrics.gasUsed}M</div>
            <p className="text-xs text-muted-foreground">Total gas consumed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Block Height</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blockchainMetrics.blockHeight.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Current block</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Fees</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blockchainMetrics.networkFees} ETH</div>
            <p className="text-xs text-muted-foreground">Average fee</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Smart Contracts</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blockchainMetrics.activeContracts}</div>
            <p className="text-xs text-muted-foreground">Active contracts</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analytics">Decentralized</TabsTrigger>
          <TabsTrigger value="ipfs">IPFS Net</TabsTrigger>
          <TabsTrigger value="blockchain">Blockchain Data</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <DecentralizedAnalytics />
        </TabsContent>

        <TabsContent value="ipfs">
          <IPFSMonitor />
        </TabsContent>

        <TabsContent value="blockchain">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Smart Contract Analytics</CardTitle>
                <CardDescription>On-chain contract interactions and metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Analytics Contract</p>
                      <p className="text-sm text-muted-foreground">0x1234...5678</p>
                    </div>
                    <Badge>Active</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Storage Contract</p>
                      <p className="text-sm text-muted-foreground">0xabcd...efgh</p>
                    </div>
                    <Badge>Active</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Identity Contract</p>
                      <p className="text-sm text-muted-foreground">0x9876...5432</p>
                    </div>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Network Health</CardTitle>
                <CardDescription>Blockchain network status and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Network Status</span>
                    <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Block Time</span>
                    <span className="text-sm font-medium">12.3s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Pending Transactions</span>
                    <span className="text-sm font-medium">1,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Network Hashrate</span>
                    <span className="text-sm font-medium">234.5 TH/s</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>;
};