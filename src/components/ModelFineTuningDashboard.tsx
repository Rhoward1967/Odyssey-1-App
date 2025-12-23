import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Brain, Database, TrendingUp, Rocket, Upload, Play, Pause, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface TrainingJob {
  id: string;
  name: string;
  status: string;
  progress_percentage: number;
  base_model: string;
  created_at: string;
}

interface Dataset {
  id: string;
  name: string;
  data_type: string;
  size_mb: number;
  sample_count: number;
  status: string;
}

export default function ModelFineTuningDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [jobsResponse, datasetsResponse] = await Promise.all([
        supabase.from('training_jobs').select('*').order('created_at', { ascending: false }),
        supabase.from('training_datasets').select('*').order('created_at', { ascending: false })
      ]);

      if (jobsResponse.data) setTrainingJobs(jobsResponse.data);
      if (datasetsResponse.data) setDatasets(datasetsResponse.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'training': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

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
          <h1 className="text-3xl font-bold">AI Model Fine-Tuning</h1>
          <p className="text-gray-600">Train custom models on your data</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
          <Upload className="w-4 h-4 mr-2" />
          Upload Dataset
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Datasets</p>
                <p className="text-2xl font-bold">{datasets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Training Jobs</p>
                <p className="text-2xl font-bold">{trainingJobs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active Training</p>
                <p className="text-2xl font-bold">
                  {trainingJobs.filter(j => j.status === 'training').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Rocket className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Deployed Models</p>
                <p className="text-2xl font-bold">
                  {trainingJobs.filter(j => j.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="datasets">Datasets</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Training Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trainingJobs.slice(0, 5).map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                      <div>
                        <p className="font-medium">{job.name}</p>
                        <p className="text-sm text-gray-600">{job.base_model}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Progress value={job.progress_percentage} className="w-20" />
                      <p className="text-xs text-gray-600 mt-1">{job.progress_percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="datasets">
          <Card>
            <CardHeader>
              <CardTitle>Training Datasets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {datasets.map((dataset) => (
                  <div key={dataset.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{dataset.name}</h3>
                      <p className="text-sm text-gray-600">
                        {dataset.data_type} • {dataset.size_mb} MB • {dataset.sample_count} samples
                      </p>
                    </div>
                    <Badge variant={dataset.status === 'ready' ? 'default' : 'secondary'}>
                      {dataset.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training">
          <div className="space-y-4">
            {trainingJobs.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="w-5 h-5" />
                      <span>{job.name}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {job.status === 'training' && (
                        <Button size="sm" variant="outline">
                          <Pause className="w-4 h-4" />
                        </Button>
                      )}
                      {job.status === 'completed' && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{job.progress_percentage}%</span>
                    </div>
                    <Progress value={job.progress_percentage} />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Base Model:</span>
                        <p className="font-medium">{job.base_model}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <p className="font-medium">{job.status}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="models">
          <Card>
            <CardHeader>
              <CardTitle>Fine-Tuned Models</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No fine-tuned models yet</p>
                <p className="text-sm text-gray-500">Complete a training job to see your models here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}