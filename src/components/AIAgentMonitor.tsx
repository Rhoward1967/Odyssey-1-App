import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertTriangle, Brain, CheckCircle, Eye, Zap } from 'lucide-react';
import { useState } from 'react';

interface AIAgent {
  id: string;
  name: string;
  type: 'predictive_bidding' | 'document_analysis' | 'research_assistant' | 'universal_ai';
  status: 'active' | 'idle' | 'error' | 'training';
  last_activity: string;
  requests_today: number;
  confidence_score: number;
  model_version: string;
}

export default function AIAgentMonitor() {
  const [agents] = useState<AIAgent[]>([
    {
      id: 'genesis_bidding',
      name: 'Genesis Predictive Bidding',
      type: 'predictive_bidding',
      status: 'active',
      last_activity: new Date().toISOString(),
      requests_today: 47,
      confidence_score: 0.94,
      model_version: 'v1.0.0-genesis'
    },
    {
      id: 'roman_universal',
      name: 'R.O.M.A.N. Universal Interpreter',
      type: 'universal_ai',
      status: 'idle',
      last_activity: new Date(Date.now() - 300000).toISOString(),
      requests_today: 0,
      confidence_score: 0.98,
      model_version: 'v1.0.0-prototype'
    },
    {
      id: 'document_processor',
      name: 'Document Analysis Engine',
      type: 'document_analysis',
      status: 'active',
      last_activity: new Date(Date.now() - 60000).toISOString(),
      requests_today: 23,
      confidence_score: 0.87,
      model_version: 'v1.2.1'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'idle': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'training': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Activity className="h-4 w-4" />;
      case 'idle': return <Eye className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      case 'training': return <Brain className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-purple-600" />
          AI Agent Monitoring
          <Badge className="bg-purple-100 text-purple-800">
            Genesis Platform
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 p-3 rounded border">
            <div className="text-2xl font-bold text-green-600">
              {agents.filter(a => a.status === 'active').length}
            </div>
            <div className="text-sm text-green-700">Active Agents</div>
          </div>
          <div className="bg-blue-50 p-3 rounded border">
            <div className="text-2xl font-bold text-blue-600">
              {agents.reduce((sum, a) => sum + a.requests_today, 0)}
            </div>
            <div className="text-sm text-blue-700">Requests Today</div>
          </div>
          <div className="bg-purple-50 p-3 rounded border">
            <div className="text-2xl font-bold text-purple-600">
              {(agents.reduce((sum, a) => sum + a.confidence_score, 0) / agents.length * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-purple-700">Avg Confidence</div>
          </div>
          <div className="bg-orange-50 p-3 rounded border">
            <div className="text-2xl font-bold text-orange-600">
              {agents.filter(a => a.status === 'error').length}
            </div>
            <div className="text-sm text-orange-700">Errors</div>
          </div>
        </div>

        {/* Agent List */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-800">AI Agents Status</h3>
          {agents.map((agent) => (
            <div key={agent.id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(agent.status)}
                    <div>
                      <div className="font-medium">{agent.name}</div>
                      <div className="text-sm text-gray-500">
                        {agent.type.replace(/_/g, ' ')} • v{agent.model_version}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm">
                    <div className="text-gray-600">
                      {agent.requests_today} requests today
                    </div>
                    <div className="text-gray-500">
                      Confidence: {(agent.confidence_score * 100).toFixed(0)}%
                    </div>
                  </div>
                  <Badge className={getStatusColor(agent.status)}>
                    {agent.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
              
              <div className="mt-2 text-xs text-gray-500">
                Last activity: {new Date(agent.last_activity).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* Genesis Platform Status */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-purple-600" />
            <span className="font-semibold text-purple-800">Genesis Platform AI Status</span>
          </div>
          <div className="text-sm text-purple-700">
            Universal AI Engine operational • Predictive Bidding Model deployed • 
            R.O.M.A.N. prototype ready • Document processing active
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
