import React, { useState, useEffect } from 'react';
import { Brain, Cpu, Database, TrendingUp, Zap, Settings, Play, Pause, BarChart3 } from 'lucide-react';

interface TrainingJob {
  id: string;
  name: string;
  model: string;
  status: 'running' | 'completed' | 'failed' | 'queued';
  progress: number;
  epoch: number;
  maxEpochs: number;
  loss: number;
  accuracy: number;
  learningRate: number;
  batchSize: number;
  startTime: string;
  estimatedCompletion: string;
  gpuUtilization: number;
}

const AIModelTrainingHub: React.FC = () => {
  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([
    {
      id: '1',
      name: 'Quantum-Classical Hybrid Network',
      model: 'QC-Transformer-7B',
      status: 'running',
      progress: 67.3,
      epoch: 134,
      maxEpochs: 200,
      loss: 0.0234,
      accuracy: 94.7,
      learningRate: 0.0001,
      batchSize: 32,
      startTime: new Date(Date.now() - 8400000).toISOString(),
      estimatedCompletion: new Date(Date.now() + 3600000).toISOString(),
      gpuUtilization: 87.3
    },
    {
      id: '2',
      name: 'Multi-Modal Knowledge Encoder',
      model: 'MMKE-12B',
      status: 'running',
      progress: 23.8,
      epoch: 47,
      maxEpochs: 150,
      loss: 0.0567,
      accuracy: 89.2,
      learningRate: 0.00005,
      batchSize: 16,
      startTime: new Date(Date.now() - 3600000).toISOString(),
      estimatedCompletion: new Date(Date.now() + 7200000).toISOString(),
      gpuUtilization: 92.1
    },
    {
      id: '3',
      name: 'Autonomous Reasoning Engine',
      model: 'ARE-3B',
      status: 'completed',
      progress: 100,
      epoch: 300,
      maxEpochs: 300,
      loss: 0.0089,
      accuracy: 97.8,
      learningRate: 0.0002,
      batchSize: 64,
      startTime: new Date(Date.now() - 18000000).toISOString(),
      estimatedCompletion: new Date(Date.now() - 1800000).toISOString(),
      gpuUtilization: 0
    }
  ]);

  const [systemMetrics, setSystemMetrics] = useState({
    totalGPUs: 8,
    activeGPUs: 6,
    memoryUsage: 73.4,
    computeUtilization: 84.7,
    powerConsumption: 2847,
    trainingHours: 47293,
    modelsDeployed: 23
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTrainingJobs(prev => prev.map(job => {
        if (job.status === 'running') {
          const newProgress = Math.min(100, job.progress + Math.random() * 2);
          const newEpoch = Math.min(job.maxEpochs, job.epoch + Math.floor(Math.random() * 3));
          return {
            ...job,
            progress: newProgress,
            epoch: newEpoch,
            loss: Math.max(0.001, job.loss - Math.random() * 0.005),
            accuracy: Math.min(99.9, job.accuracy + Math.random() * 0.5),
            gpuUtilization: Math.max(0, Math.min(100, job.gpuUtilization + (Math.random() - 0.5) * 10)),
            status: newProgress >= 100 ? 'completed' : 'running'
          };
        }
        return job;
      }));

      setSystemMetrics(prev => ({
        ...prev,
        memoryUsage: Math.max(0, Math.min(100, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        computeUtilization: Math.max(0, Math.min(100, prev.computeUtilization + (Math.random() - 0.5) * 8)),
        powerConsumption: Math.max(0, prev.powerConsumption + Math.floor((Math.random() - 0.5) * 200)),
        trainingHours: Math.max(0, prev.trainingHours + Math.random() * 2)
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="w-5 h-5 text-green-400" />;
      case 'completed': return <BarChart3 className="w-5 h-5 text-blue-400" />;
      case 'failed': return <Pause className="w-5 h-5 text-red-400" />;
      case 'queued': return <Settings className="w-5 h-5 text-yellow-400" />;
      default: return <Brain className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'border-green-500 bg-green-500/10';
      case 'completed': return 'border-blue-500 bg-blue-500/10';
      case 'failed': return 'border-red-500 bg-red-500/10';
      case 'queued': return 'border-yellow-500 bg-yellow-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 p-6 rounded-xl">
      <div className="flex items-center mb-6">
        <Brain className="w-8 h-8 text-cyan-400 mr-3" />
        <h2 className="text-2xl font-bold text-white">AI Model Training Hub</h2>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-black/30 rounded-lg p-3">
          <div className="flex items-center mb-2">
            <Cpu className="w-4 h-4 text-cyan-400 mr-2" />
            <div className="text-sm text-gray-400">GPU Cluster</div>
          </div>
          <div className="text-cyan-400 font-mono">{systemMetrics.activeGPUs}/{systemMetrics.totalGPUs} Active</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3">
          <div className="flex items-center mb-2">
            <Database className="w-4 h-4 text-green-400 mr-2" />
            <div className="text-sm text-gray-400">Memory Usage</div>
          </div>
          <div className="text-green-400 font-mono">{systemMetrics.memoryUsage.toFixed(1)}%</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3">
          <div className="flex items-center mb-2">
            <TrendingUp className="w-4 h-4 text-blue-400 mr-2" />
            <div className="text-sm text-gray-400">Compute Usage</div>
          </div>
          <div className="text-blue-400 font-mono">{systemMetrics.computeUtilization.toFixed(1)}%</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3">
          <div className="flex items-center mb-2">
            <Zap className="w-4 h-4 text-yellow-400 mr-2" />
            <div className="text-sm text-gray-400">Power Draw</div>
          </div>
          <div className="text-yellow-400 font-mono">{systemMetrics.powerConsumption}W</div>
        </div>
      </div>

      {/* Training Jobs */}
      <div className="space-y-4">
        {trainingJobs.map(job => (
          <div key={job.id} className={`border-l-4 ${getStatusColor(job.status)} p-4 rounded-r-lg`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                {getStatusIcon(job.status)}
                <div className="ml-3">
                  <h3 className="text-white font-semibold">{job.name}</h3>
                  <div className="text-sm text-gray-400">{job.model}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-cyan-400 font-mono text-lg">{job.progress.toFixed(1)}%</div>
                <div className="text-xs text-gray-500 capitalize">{job.status}</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${job.progress}%` }}
              />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-400">Epoch</div>
                <div className="text-white font-mono">{job.epoch}/{job.maxEpochs}</div>
              </div>
              <div>
                <div className="text-gray-400">Loss</div>
                <div className="text-red-300 font-mono">{job.loss.toFixed(4)}</div>
              </div>
              <div>
                <div className="text-gray-400">Accuracy</div>
                <div className="text-green-300 font-mono">{job.accuracy.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-gray-400">GPU Usage</div>
                <div className="text-yellow-300 font-mono">{Math.max(0, job.gpuUtilization).toFixed(1)}%</div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between text-xs text-gray-500">
              <span>Started: {new Date(job.startTime).toLocaleString()}</span>
              {job.status === 'running' && (
                <span>ETA: {new Date(job.estimatedCompletion).toLocaleTimeString()}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIModelTrainingHub;