import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

const ExternalAPIIntegration = () => {
  const [activeConnections, setActiveConnections] = useState(12);
  const [dataIngested, setDataIngested] = useState(0);

  const apiSources = [
    {
      name: "arXiv Research Papers",
      status: "active",
      dataRate: "2.3 MB/s",
      lastSync: "2 minutes ago",
      reliability: 98,
      type: "Research"
    },
    {
      name: "GitHub Repositories",
      status: "active", 
      dataRate: "1.8 MB/s",
      lastSync: "1 minute ago",
      reliability: 96,
      type: "Code"
    },
    {
      name: "Stack Overflow",
      status: "active",
      dataRate: "950 KB/s",
      lastSync: "30 seconds ago",
      reliability: 94,
      type: "Q&A"
    },
    {
      name: "AI/ML Conferences",
      status: "active",
      dataRate: "1.2 MB/s",
      lastSync: "45 seconds ago",
      reliability: 97,
      type: "Academic"
    },
    {
      name: "Technical Blogs",
      status: "active",
      dataRate: "750 KB/s",
      lastSync: "1 minute ago",
      reliability: 89,
      type: "Industry"
    },
    {
      name: "Patent Databases",
      status: "syncing",
      dataRate: "2.1 MB/s",
      lastSync: "5 minutes ago",
      reliability: 92,
      type: "Innovation"
    }
  ];

  const realtimeData = [
    "📊 Processing 47 new ML research papers from arXiv",
    "🔍 Analyzing 23 GitHub repositories for coding patterns",
    "💡 Extracting insights from 156 Stack Overflow discussions",
    "📈 Integrating data from 8 AI conference proceedings",
    "🔬 Validating information from 34 technical articles",
    "⚡ Cross-referencing 89 patent applications"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setDataIngested(prev => (prev + Math.random() * 5) % 100);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/30">
        <CardHeader>
          <CardTitle className="text-green-300">External API Integration Hub</CardTitle>
          <p className="text-gray-300">Autonomous knowledge acquisition from global sources</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-green-900/10 border-green-500/30">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-400">{activeConnections}</div>
                <div className="text-sm text-gray-300">Active API Connections</div>
              </CardContent>
            </Card>
            <Card className="bg-blue-900/10 border-blue-500/30">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-400">847 GB</div>
                <div className="text-sm text-gray-300">Knowledge Processed Today</div>
              </CardContent>
            </Card>
            <Card className="bg-purple-900/10 border-purple-500/30">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-400">99.2%</div>
                <div className="text-sm text-gray-300">Data Validation Accuracy</div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-300">Connected Data Sources</h3>
            {apiSources.map((source, index) => (
              <Card key={index} className="border-gray-600">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        source.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'
                      }`}></div>
                      <h4 className="font-semibold text-white">{source.name}</h4>
                      <Badge variant="outline">{source.type}</Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-green-400">{source.dataRate}</div>
                      <div className="text-xs text-gray-400">{source.lastSync}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-300">Reliability:</span>
                    <Progress value={source.reliability} className="flex-1" />
                    <span className="text-xs text-gray-300">{source.reliability}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-6 bg-gray-900/50 border-gray-600">
            <CardHeader>
              <CardTitle className="text-blue-300">Real-time Processing Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {realtimeData.map((item, index) => (
                  <div key={index} className="text-sm text-gray-300 p-2 bg-gray-800/50 rounded">
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExternalAPIIntegration;