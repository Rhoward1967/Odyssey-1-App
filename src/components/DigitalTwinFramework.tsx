import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

interface DigitalTwin {
  id: string;
  name: string;
  type: 'bidding_environment' | 'market_sector' | 'competitor' | 'project';
  syncStatus: 'synced' | 'syncing' | 'outdated' | 'error';
  accuracy: number;
  lastUpdate: Date;
  metrics: {
    dataPoints: number;
    predictions: number;
    accuracy: number;
  };
}

interface RealTimeSync {
  dataStreams: number;
  latency: number;
  throughput: number;
  errors: number;
}

export const DigitalTwinFramework: React.FC = () => {
  const [twins, setTwins] = useState<DigitalTwin[]>([
    {
      id: 'twin_1',
      name: 'Federal Procurement Environment',
      type: 'bidding_environment',
      syncStatus: 'synced',
      accuracy: 0.94,
      lastUpdate: new Date(),
      metrics: { dataPoints: 15420, predictions: 847, accuracy: 0.89 }
    },
    {
      id: 'twin_2',
      name: 'Healthcare Market Sector',
      type: 'market_sector',
      syncStatus: 'syncing',
      accuracy: 0.87,
      lastUpdate: new Date(Date.now() - 300000),
      metrics: { dataPoints: 8934, predictions: 423, accuracy: 0.82 }
    }
  ]);

  const [syncMetrics, setSyncMetrics] = useState<RealTimeSync>({
    dataStreams: 12,
    latency: 45,
    throughput: 2340,
    errors: 2
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncMetrics(prev => ({
        dataStreams: prev.dataStreams + Math.floor(Math.random() * 3) - 1,
        latency: Math.max(20, prev.latency + Math.floor(Math.random() * 20) - 10),
        throughput: prev.throughput + Math.floor(Math.random() * 200) - 100,
        errors: Math.max(0, prev.errors + Math.floor(Math.random() * 2) - 1)
      }));

      setTwins(prev => prev.map(twin => ({
        ...twin,
        accuracy: Math.min(1, twin.accuracy + (Math.random() - 0.5) * 0.02),
        metrics: {
          ...twin.metrics,
          dataPoints: twin.metrics.dataPoints + Math.floor(Math.random() * 50),
          predictions: twin.metrics.predictions + Math.floor(Math.random() * 5)
        }
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const createNewTwin = (type: DigitalTwin['type']) => {
    const names = {
      bidding_environment: 'New Bidding Environment',
      market_sector: 'Emerging Market Sector',
      competitor: 'Competitor Analysis',
      project: 'Project Twin'
    };

    const newTwin: DigitalTwin = {
      id: `twin_${Date.now()}`,
      name: names[type],
      type,
      syncStatus: 'syncing',
      accuracy: 0.5 + Math.random() * 0.3,
      lastUpdate: new Date(),
      metrics: { dataPoints: 0, predictions: 0, accuracy: 0 }
    };

    setTwins(prev => [...prev, newTwin]);
  };

  return (
    <Card className="bg-gradient-to-br from-emerald-900 to-teal-900 border-emerald-500">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          🔄 Digital Twin Framework
          <Badge variant="outline" className="text-emerald-400 border-emerald-400">
            {twins.length} Twins Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-white">
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center">
            <div className="text-xl font-bold text-emerald-400">{syncMetrics.dataStreams}</div>
            <div className="text-xs text-gray-300">Data Streams</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-teal-400">{syncMetrics.latency}ms</div>
            <div className="text-xs text-gray-300">Latency</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-cyan-400">{syncMetrics.throughput.toLocaleString()}</div>
            <div className="text-xs text-gray-300">Throughput/s</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-red-400">{syncMetrics.errors}</div>
            <div className="text-xs text-gray-300">Errors</div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-emerald-300">Active Digital Twins</h4>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {twins.map((twin) => (
              <div key={twin.id} className="bg-black/20 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{twin.name}</span>
                  <Badge variant={twin.syncStatus === 'synced' ? 'default' : 'secondary'}>
                    {twin.syncStatus}
                  </Badge>
                </div>
                <Progress value={twin.accuracy * 100} className="mb-2" />
                <div className="text-xs space-y-1 text-gray-300">
                  <div>Accuracy: {(twin.accuracy * 100).toFixed(1)}%</div>
                  <div>Data Points: {twin.metrics.dataPoints.toLocaleString()}</div>
                  <div>Predictions: {twin.metrics.predictions}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button 
            size="sm" 
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => createNewTwin('bidding_environment')}
          >
            New Environment
          </Button>
          <Button 
            size="sm" 
            className="bg-teal-600 hover:bg-teal-700"
            onClick={() => createNewTwin('market_sector')}
          >
            Market Twin
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};