import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, Globe, Zap, Database, TrendingUp } from 'lucide-react';

interface APIEndpoint {
  id: string;
  name: string;
  url: string;
  status: 'active' | 'warning' | 'error' | 'maintenance';
  responseTime: number;
  uptime: number;
  requestsPerMinute: number;
  errorRate: number;
  lastChecked: string;
  dataIngested: number;
}

const RealTimeAPIMonitor: React.FC = () => {
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([
    {
      id: '1',
      name: 'arXiv Research API',
      url: 'https://export.arxiv.org/api',
      status: 'active',
      responseTime: 127,
      uptime: 99.97,
      requestsPerMinute: 45,
      errorRate: 0.02,
      lastChecked: new Date().toISOString(),
      dataIngested: 2847
    },
    {
      id: '2',
      name: 'GitHub GraphQL API',
      url: 'https://api.github.com/graphql',
      status: 'active',
      responseTime: 89,
      uptime: 99.99,
      requestsPerMinute: 73,
      errorRate: 0.01,
      lastChecked: new Date().toISOString(),
      dataIngested: 5234
    },
    {
      id: '3',
      name: 'Stack Overflow API',
      url: 'https://api.stackexchange.com',
      status: 'warning',
      responseTime: 234,
      uptime: 98.7,
      requestsPerMinute: 28,
      errorRate: 1.2,
      lastChecked: new Date().toISOString(),
      dataIngested: 1567
    },
    {
      id: '4',
      name: 'OpenAI Research API',
      url: 'https://api.openai.com/v1',
      status: 'active',
      responseTime: 156,
      uptime: 99.8,
      requestsPerMinute: 67,
      errorRate: 0.15,
      lastChecked: new Date().toISOString(),
      dataIngested: 3892
    }
  ]);

  const [globalMetrics, setGlobalMetrics] = useState({
    totalRequests: 47293,
    successRate: 98.7,
    avgResponseTime: 142,
    dataProcessed: 847.3,
    activeConnections: 847
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setEndpoints(prev => prev.map(endpoint => ({
        ...endpoint,
        responseTime: endpoint.responseTime + (Math.random() - 0.5) * 20,
        requestsPerMinute: Math.max(0, endpoint.requestsPerMinute + Math.floor((Math.random() - 0.5) * 10)),
        errorRate: Math.max(0, endpoint.errorRate + (Math.random() - 0.5) * 0.1),
        dataIngested: endpoint.dataIngested + Math.floor(Math.random() * 50),
        lastChecked: new Date().toISOString()
      })));

      setGlobalMetrics(prev => ({
        ...prev,
        totalRequests: prev.totalRequests + Math.floor(Math.random() * 100),
        avgResponseTime: prev.avgResponseTime + (Math.random() - 0.5) * 10,
        dataProcessed: prev.dataProcessed + Math.random() * 5,
        activeConnections: prev.activeConnections + Math.floor((Math.random() - 0.5) * 20)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      default: return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'border-green-500 bg-green-500/10';
      case 'warning': return 'border-yellow-500 bg-yellow-500/10';
      case 'error': return 'border-red-500 bg-red-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6 rounded-xl">
      <div className="flex items-center mb-6">
        <Globe className="w-8 h-8 text-cyan-400 mr-3" />
        <h2 className="text-2xl font-bold text-white">Real-Time API Monitoring</h2>
      </div>

      {/* Global Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-black/30 rounded-lg p-3">
          <div className="text-sm text-gray-400">Total Requests</div>
          <div className="text-cyan-400 font-mono text-lg">{globalMetrics.totalRequests.toLocaleString()}</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3">
          <div className="text-sm text-gray-400">Success Rate</div>
          <div className="text-green-400 font-mono text-lg">{globalMetrics.successRate.toFixed(1)}%</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3">
          <div className="text-sm text-gray-400">Avg Response</div>
          <div className="text-blue-400 font-mono text-lg">{Math.round(globalMetrics.avgResponseTime)}ms</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3">
          <div className="text-sm text-gray-400">Data Processed</div>
          <div className="text-purple-400 font-mono text-lg">{globalMetrics.dataProcessed.toFixed(1)}GB</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3">
          <div className="text-sm text-gray-400">Active APIs</div>
          <div className="text-orange-400 font-mono text-lg">{endpoints.length}</div>
        </div>
      </div>

      {/* API Endpoints Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {endpoints.map(endpoint => (
          <div key={endpoint.id} className={`border-l-4 ${getStatusColor(endpoint.status)} p-4 rounded-r-lg`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                {getStatusIcon(endpoint.status)}
                <h3 className="text-white font-semibold ml-2">{endpoint.name}</h3>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 font-mono text-sm">{Math.round(endpoint.responseTime)}ms</span>
              </div>
            </div>

            <div className="text-xs text-gray-400 mb-3">{endpoint.url}</div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-400">Uptime</div>
                <div className="text-green-300 font-mono">{endpoint.uptime.toFixed(2)}%</div>
              </div>
              <div>
                <div className="text-gray-400">Requests/min</div>
                <div className="text-blue-300 font-mono">{endpoint.requestsPerMinute}</div>
              </div>
              <div>
                <div className="text-gray-400">Error Rate</div>
                <div className="text-red-300 font-mono">{endpoint.errorRate.toFixed(2)}%</div>
              </div>
              <div>
                <div className="text-gray-400">Data Ingested</div>
                <div className="text-purple-300 font-mono">{endpoint.dataIngested.toLocaleString()}</div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Last checked: {new Date(endpoint.lastChecked).toLocaleTimeString()}</span>
                <div className="flex items-center">
                  <TrendingUp className="w-3 h-3 text-green-400 mr-1" />
                  <span className="text-green-400">Live</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RealTimeAPIMonitor;