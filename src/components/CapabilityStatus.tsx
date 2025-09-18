import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { CheckCircle, Clock, Zap, Cpu, Database, Brain } from 'lucide-react';

interface Capability {
  name: string;
  status: 'operational' | 'development' | 'research';
  progress: number;
  description: string;
  icon: React.ComponentType<any>;
}

export const CapabilityStatus: React.FC = () => {
  const capabilities: Capability[] = [
    {
      name: 'AI Document Processing',
      status: 'operational',
      progress: 100,
      description: 'Real-time document analysis with OpenAI/Anthropic integration',
      icon: CheckCircle
    },
    {
      name: 'Government Contracting Tools',
      status: 'operational', 
      progress: 100,
      description: 'RFP analysis, bid optimization, proposal generation',
      icon: CheckCircle
    },
    {
      name: 'Supabase Backend',
      status: 'operational',
      progress: 100,
      description: 'Edge functions, real-time data, authentication',
      icon: Database
    },
    {
      name: 'Trading Algorithms',
      status: 'operational',
      progress: 85,
      description: 'Market analysis and automated trading systems',
      icon: Zap
    },
    {
      name: 'Autonomous Code Generation',
      status: 'development',
      progress: 25,
      description: 'AI-assisted code generation and optimization',
      icon: Brain
    },
    {
      name: 'Quantum Computing Integration',
      status: 'research',
      progress: 15,
      description: 'Cryptographic security and advanced computations',
      icon: Cpu
    },
    {
      name: 'Distributed Computing Clusters',
      status: 'research',
      progress: 8,
      description: 'Federated learning and distributed processing',
      icon: Cpu
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-600/20 text-green-300';
      case 'development': return 'bg-yellow-600/20 text-yellow-300';
      case 'research': return 'bg-blue-600/20 text-blue-300';
      default: return 'bg-gray-600/20 text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return <CheckCircle className="w-4 h-4" />;
      case 'development': return <Clock className="w-4 h-4" />;
      case 'research': return <Brain className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <Card className="bg-slate-800/50 border-green-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <Zap className="h-6 w-6 text-green-400" />
          ODYSSEY-1 Capability Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {capabilities.map((capability, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <capability.icon className="w-5 h-5 text-green-400" />
                <span className="font-medium text-white">{capability.name}</span>
              </div>
              <Badge className={getStatusColor(capability.status)}>
                {getStatusIcon(capability.status)}
                {capability.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-gray-400 text-sm ml-8">{capability.description}</p>
            <div className="flex items-center gap-3 ml-8">
              <Progress value={capability.progress} className="flex-1 h-2" />
              <span className="text-sm text-gray-300 min-w-[3rem]">{capability.progress}%</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CapabilityStatus;