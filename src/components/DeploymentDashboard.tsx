import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink,
  GitBranch,
  Zap,
  Globe,
  Database
} from 'lucide-react';

interface DeploymentStatus {
  platform: string;
  status: 'success' | 'failed' | 'pending' | 'unknown';
  lastDeploy: string;
  url?: string;
  branch: string;
  commit: string;
}

export default function DeploymentDashboard() {
  const [deployments, setDeployments] = useState<DeploymentStatus[]>([
    {
      platform: 'Vercel Production',
      status: 'success',
      lastDeploy: '2 minutes ago',
      url: 'https://your-app.vercel.app',
      branch: 'main',
      commit: 'abc123f'
    },
    {
      platform: 'Vercel Preview',
      status: 'pending',
      lastDeploy: '5 minutes ago',
      url: 'https://your-app-git-dev.vercel.app',
      branch: 'dev',
      commit: 'def456a'
    },
    {
      platform: 'Supabase Functions',
      status: 'success',
      lastDeploy: '1 hour ago',
      branch: 'main',
      commit: 'abc123f'
    },
    {
      platform: 'GitHub Actions',
      status: 'failed',
      lastDeploy: '3 hours ago',
      branch: 'main',
      commit: 'ghi789b'
    }
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshStatus = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update some statuses randomly for demo
    setDeployments(prev => prev.map(dep => ({
      ...dep,
      lastDeploy: 'Just now',
      status: Math.random() > 0.3 ? 'success' : dep.status
    })));
    
    setIsRefreshing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-400" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'bg-green-600',
      failed: 'bg-red-600',
      pending: 'bg-yellow-600',
      unknown: 'bg-gray-600'
    };
    return <Badge className={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const healthScore = deployments.filter(d => d.status === 'success').length / deployments.length * 100;

  return (
    <div className="space-y-6">
      <Card className="bg-black/20 backdrop-blur-sm border-blue-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-6 w-6 text-blue-400" />
              Deployment Dashboard
            </CardTitle>
            <Button
              onClick={refreshStatus}
              disabled={isRefreshing}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-black/30 border-green-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-sm text-gray-300">Health Score</p>
                    <p className="text-2xl font-bold text-white">{Math.round(healthScore)}%</p>
                  </div>
                </div>
                <Progress value={healthScore} className="mt-2" />
              </CardContent>
            </Card>
            
            <Card className="bg-black/30 border-blue-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-300">Active Deployments</p>
                    <p className="text-2xl font-bold text-white">
                      {deployments.filter(d => d.status === 'success').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-black/30 border-yellow-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-300">Issues</p>
                    <p className="text-2xl font-bold text-white">
                      {deployments.filter(d => d.status === 'failed').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {deployments.map((deployment, index) => (
              <Card key={index} className="bg-black/30 border-gray-600/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(deployment.status)}
                      <div>
                        <h4 className="text-white font-medium">{deployment.platform}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <GitBranch className="h-3 w-3" />
                          {deployment.branch} • {deployment.commit} • {deployment.lastDeploy}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(deployment.status)}
                      {deployment.url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(deployment.url, '_blank')}
                          className="text-white border-gray-600"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}