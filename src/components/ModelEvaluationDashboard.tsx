import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Target, TrendingUp, Award, Zap, Play, Download } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface Model {
  id: string;
  name: string;
  base_model: string;
  deployment_status: string;
  performance_metrics: any;
  created_at: string;
}

interface EvaluationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  perplexity: number;
  bleu_score: number;
}

export default function ModelEvaluationDashboard() {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const { data, error } = await supabase
        .from('fine_tuned_models')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setModels(data || []);
      if (data && data.length > 0) {
        setSelectedModel(data[0]);
      }
    } catch (error) {
      console.error('Error loading models:', error);
    } finally {
      setLoading(false);
    }
  };

  const runEvaluation = async (modelId: string) => {
    setEvaluating(true);
    try {
      const { data, error } = await supabase.functions.invoke('model-training-manager', {
        body: {
          action: 'evaluate_model',
          data: { modelId }
        }
      });

      if (error) throw error;

      // Update model with evaluation results
      await supabase
        .from('fine_tuned_models')
        .update({ performance_metrics: data.metrics })
        .eq('id', modelId);

      loadModels();
    } catch (error) {
      console.error('Error running evaluation:', error);
    } finally {
      setEvaluating(false);
    }
  };

  const deployModel = async (modelId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('model-training-manager', {
        body: {
          action: 'deploy_model',
          data: { modelId }
        }
      });

      if (error) throw error;

      await supabase
        .from('fine_tuned_models')
        .update({ 
          deployment_status: 'active',
          api_endpoint: data.endpoint 
        })
        .eq('id', modelId);

      loadModels();
    } catch (error) {
      console.error('Error deploying model:', error);
    }
  };

  const getMetricsData = (metrics: EvaluationMetrics) => [
    { metric: 'Accuracy', value: metrics.accuracy * 100 },
    { metric: 'Precision', value: metrics.precision * 100 },
    { metric: 'Recall', value: metrics.recall * 100 },
    { metric: 'F1 Score', value: metrics.f1_score * 100 },
  ];

  const getRadarData = (metrics: EvaluationMetrics) => [
    { metric: 'Accuracy', value: metrics.accuracy * 100, fullMark: 100 },
    { metric: 'Precision', value: metrics.precision * 100, fullMark: 100 },
    { metric: 'Recall', value: metrics.recall * 100, fullMark: 100 },
    { metric: 'F1', value: metrics.f1_score * 100, fullMark: 100 },
    { metric: 'BLEU', value: metrics.bleu_score * 100, fullMark: 100 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Model Evaluation</h1>
          <p className="text-gray-600">Evaluate and compare model performance</p>
        </div>
        {selectedModel && (
          <Button 
            onClick={() => runEvaluation(selectedModel.id)}
            disabled={evaluating}
            className="bg-gradient-to-r from-green-600 to-blue-600"
          >
            <Target className="w-4 h-4 mr-2" />
            {evaluating ? 'Evaluating...' : 'Run Evaluation'}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Available Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {models.map((model) => (
                <div
                  key={model.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedModel?.id === model.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedModel(model)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{model.name}</p>
                      <p className="text-sm text-gray-600">{model.base_model}</p>
                    </div>
                    <Badge variant={model.deployment_status === 'active' ? 'default' : 'secondary'}>
                      {model.deployment_status}
                    </Badge>
                  </div>
                </div>
              ))}
              {models.length === 0 && (
                <p className="text-gray-500 text-center py-4">No models available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          {selectedModel && selectedModel.performance_metrics ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Award className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="text-sm text-gray-600">Accuracy</p>
                        <p className="text-2xl font-bold">
                          {(selectedModel.performance_metrics.accuracy * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">F1 Score</p>
                        <p className="text-2xl font-bold">
                          {(selectedModel.performance_metrics.f1_score * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">BLEU Score</p>
                        <p className="text-2xl font-bold">
                          {(selectedModel.performance_metrics.bleu_score * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Target className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600">Perplexity</p>
                        <p className="text-2xl font-bold">
                          {selectedModel.performance_metrics.perplexity.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getMetricsData(selectedModel.performance_metrics)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="metric" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Overall Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={getRadarData(selectedModel.performance_metrics)}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="metric" />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} />
                          <Radar
                            name="Performance"
                            dataKey="value"
                            stroke="#3b82f6"
                            fill="#3b82f6"
                            fillOpacity={0.3}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Model Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4">
                    <Button
                      onClick={() => deployModel(selectedModel.id)}
                      disabled={selectedModel.deployment_status === 'active'}
                      className="bg-gradient-to-r from-green-600 to-blue-600"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {selectedModel.deployment_status === 'active' ? 'Deployed' : 'Deploy Model'}
                    </Button>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export Results
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {selectedModel ? 'No evaluation data available' : 'Select a model to view evaluation results'}
                </p>
                {selectedModel && (
                  <Button 
                    onClick={() => runEvaluation(selectedModel.id)}
                    disabled={evaluating}
                    className="mt-4"
                  >
                    Run Evaluation
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}