import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Brain, Play, Pause, Square, TrendingDown, Clock, Cpu } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface TrainingJob {
  id: string;
  name: string;
  status: string;
  progress_percentage: number;
  epochs_completed: number;
  total_epochs: number;
  loss_history: number[];
  base_model: string;
  started_at: string;
}

interface TrainingMonitorProps {
  jobId?: string;
}

export default function TrainingMonitor({ jobId }: TrainingMonitorProps) {
  const [job, setJob] = useState<TrainingJob | null>(null);
  const [lossData, setLossData] = useState<Array<{ epoch: number; loss: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (jobId) {
      loadJobData();
      const interval = setInterval(loadJobData, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }
  }, [jobId]);

  const loadJobData = async () => {
    if (!jobId) return;

    try {
      const { data, error } = await supabase
        .from('training_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) throw error;
      
      setJob(data);
      
      // Process loss history for chart
      if (data.loss_history && Array.isArray(data.loss_history)) {
        const chartData = data.loss_history.map((loss: number, index: number) => ({
          epoch: index + 1,
          loss: loss
        }));
        setLossData(chartData);
      }
    } catch (error) {
      console.error('Error loading job data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJobControl = async (action: 'pause' | 'resume' | 'stop') => {
    if (!job) return;

    try {
      const { data, error } = await supabase.functions.invoke('model-training-manager', {
        body: {
          action: action === 'pause' ? 'pause_training' : action === 'resume' ? 'resume_training' : 'stop_training',
          data: { jobId: job.id }
        }
      });

      if (error) throw error;
      loadJobData();
    } catch (error) {
      console.error('Error controlling job:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'training': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'paused': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No training job selected</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-6 h-6" />
              <span>{job.name}</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
              {job.status === 'training' && (
                <div className="flex space-x-1">
                  <Button size="sm" variant="outline" onClick={() => handleJobControl('pause')}>
                    <Pause className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleJobControl('stop')}>
                    <Square className="w-4 h-4" />
                  </Button>
                </div>
              )}
              {job.status === 'paused' && (
                <Button size="sm" variant="outline" onClick={() => handleJobControl('resume')}>
                  <Play className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Base Model</p>
                <p className="font-medium">{job.base_model}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-medium">
                  {job.started_at ? formatDuration(job.started_at) : 'Not started'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Current Loss</p>
                <p className="font-medium">
                  {lossData.length > 0 ? lossData[lossData.length - 1].loss.toFixed(4) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Training Progress</span>
              <span>{job.epochs_completed}/{job.total_epochs} epochs ({job.progress_percentage}%)</span>
            </div>
            <Progress value={job.progress_percentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {lossData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Training Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lossData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="epoch" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="loss" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Training Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-48 overflow-y-auto">
            <div>Starting training job: {job.name}</div>
            <div>Base model: {job.base_model}</div>
            <div>Epochs: {job.total_epochs}</div>
            {job.status === 'training' && (
              <>
                <div>Epoch {job.epochs_completed}/{job.total_epochs} completed</div>
                <div>Current progress: {job.progress_percentage}%</div>
              </>
            )}
            {job.status === 'completed' && (
              <div className="text-green-500">Training completed successfully!</div>
            )}
            {job.status === 'failed' && (
              <div className="text-red-500">Training failed. Check error logs.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}