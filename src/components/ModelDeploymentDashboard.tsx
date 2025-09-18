import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Rocket, Activity, BarChart3, GitBranch, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface DeployedModel {
  id: string;
  name: string;
  version: string;
  status: string;
  traffic_percentage: number;
  performance_score: number;
  endpoint_url: string;
  created_at: string;
}

export default function ModelDeploymentDashboard() {
  const [deployedModels, setDeployedModels] = useState<DeployedModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  useEffect(() => {
    loadDeployedModels();
  }, []);

  const loadDeployedModels = async () => {
    try {
      const { data } = await supabase
        .from('deployed_models')
        .select('*')
        .order('created_at', { ascending: false });
      
      setDeployedModels(data || []);
    } catch (error) {
      console.error('Error loading models:', error);
    } finally {
      setLoading(false);
    }
  };

  const rollbackModel = async (modelId: string) => {
    try {
      await supabase.functions.invoke('model-deployment', {
        body: { action: 'rollback', modelId }
      });
      loadDeployedModels();
    } catch (error) {
      console.error('Rollback failed:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'testing': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Model Deployment</h1>
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
          <Rocket className="w-4 h-4 mr-2" />
          Deploy Model
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Rocket className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Active Models</p>
                <p className="text-2xl font-bold">{deployedModels.filter(m => m.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Avg Performance</p>
                <p className="text-2xl font-bold">
                  {Math.round(deployedModels.reduce((acc, m) => acc + m.performance_score, 0) / deployedModels.length || 0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <GitBranch className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">A/B Tests</p>
                <p className="text-2xl font-bold">{deployedModels.filter(m => m.status === 'testing').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">API Calls</p>
                <p className="text-2xl font-bold">1.2M</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="models" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="testing">A/B Testing</TabsTrigger>
          <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          {deployedModels.map((model) => (
            <Card key={model.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <span>{model.name}</span>
                    <Badge className={getStatusColor(model.status)}>{model.status}</Badge>
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => rollbackModel(model.id)}>
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Rollback
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Traffic</p>
                    <Progress value={model.traffic_percentage} className="mt-1" />
                    <p className="text-xs mt-1">{model.traffic_percentage}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Performance</p>
                    <div className="flex items-center mt-1">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      <span className="font-medium">{model.performance_score}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Endpoint</p>
                    <p className="text-xs font-mono bg-gray-100 p-1 rounded mt-1">{model.endpoint_url}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900">Response Time</h3>
                    <p className="text-2xl font-bold text-blue-700">245ms</p>
                    <p className="text-sm text-blue-600">avg last 24h</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-900">Success Rate</h3>
                    <p className="text-2xl font-bold text-green-700">99.8%</p>
                    <p className="text-sm text-green-600">last 7 days</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing">
          <Card>
            <CardHeader>
              <CardTitle>A/B Testing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Configure A/B tests for model versions</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {deployedModels.map((model) => (
                  <div key={model.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{model.name}</p>
                        <p className="text-sm font-mono text-gray-600">{model.endpoint_url}</p>
                      </div>
                      <Button size="sm" variant="outline">Copy</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}