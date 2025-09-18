import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Globe, Shield, Database, Activity, Users, TrendingUp } from 'lucide-react';

interface AnalyticsEvent {
  id: string;
  type: string;
  timestamp: number;
  data: any;
  ipfsHash?: string;
  blockHash?: string;
}

interface DecentralizedMetrics {
  totalEvents: number;
  uniqueUsers: number;
  pageViews: number;
  sessionDuration: number;
  bounceRate: number;
  ipfsNodes: number;
  blockchainTxs: number;
}

export const DecentralizedAnalytics: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [metrics, setMetrics] = useState<DecentralizedMetrics>({
    totalEvents: 0,
    uniqueUsers: 0,
    pageViews: 0,
    sessionDuration: 0,
    bounceRate: 0,
    ipfsNodes: 0,
    blockchainTxs: 0
  });
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    initializeDecentralizedAnalytics();
    loadMetrics();
  }, []);

  const initializeDecentralizedAnalytics = async () => {
    setIsLoading(true);
    try {
      // Simulate IPFS connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsConnected(true);
      
      // Load sample metrics
      setMetrics({
        totalEvents: 15847,
        uniqueUsers: 3421,
        pageViews: 8934,
        sessionDuration: 342,
        bounceRate: 23.4,
        ipfsNodes: 127,
        blockchainTxs: 89
      });
    } catch (error) {
      console.error('Failed to initialize decentralized analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMetrics = () => {
    // Simulate loading recent events
    const sampleEvents: AnalyticsEvent[] = [
      {
        id: '1',
        type: 'page_view',
        timestamp: Date.now() - 300000,
        data: { page: '/dashboard', user: '0x1234...5678' },
        ipfsHash: 'QmX1Y2Z3...',
        blockHash: '0xabc123...'
      },
      {
        id: '2',
        type: 'user_action',
        timestamp: Date.now() - 600000,
        data: { action: 'click', element: 'connect_wallet' },
        ipfsHash: 'QmA1B2C3...',
        blockHash: '0xdef456...'
      }
    ];
    setEvents(sampleEvents);
  };

  const trackEvent = async (eventType: string, data: any) => {
    const event: AnalyticsEvent = {
      id: Date.now().toString(),
      type: eventType,
      timestamp: Date.now(),
      data
    };

    try {
      // Simulate IPFS storage
      const ipfsHash = `QmX${Math.random().toString(36).substr(2, 9)}`;
      event.ipfsHash = ipfsHash;
      
      setEvents(prev => [event, ...prev.slice(0, 9)]);
      setMetrics(prev => ({ ...prev, totalEvents: prev.totalEvents + 1 }));
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Decentralized Analytics</h2>
          <p className="text-muted-foreground">Privacy-first, censorship-resistant monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "secondary"}>
            <Globe className="w-3 h-3 mr-1" />
            {isConnected ? 'IPFS Connected' : 'Connecting...'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEvents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Stored on IPFS</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.uniqueUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Privacy preserved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IPFS Nodes</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.ipfsNodes}</div>
            <p className="text-xs text-muted-foreground">Distributed storage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blockchain Txs</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.blockchainTxs}</div>
            <p className="text-xs text-muted-foreground">Immutable records</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
            <CardDescription>Latest analytics events stored on IPFS</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{event.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">IPFS: {event.ipfsHash}</p>
                    {event.blockHash && (
                      <p className="text-xs text-muted-foreground">Block: {event.blockHash}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Decentralization Status</CardTitle>
            <CardDescription>Network health and distribution metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>IPFS Network Health</span>
                <span>94%</span>
              </div>
              <Progress value={94} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Data Replication</span>
                <span>87%</span>
              </div>
              <Progress value={87} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Blockchain Sync</span>
                <span>100%</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Analytics</CardTitle>
          <CardDescription>Test the decentralized tracking system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button onClick={() => trackEvent('test_click', { button: 'primary' })}>
              Track Click Event
            </Button>
            <Button variant="outline" onClick={() => trackEvent('page_view', { page: '/test' })}>
              Track Page View
            </Button>
            <Button variant="outline" onClick={() => trackEvent('user_action', { action: 'test' })}>
              Track User Action
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};