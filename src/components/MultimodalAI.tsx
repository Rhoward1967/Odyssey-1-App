import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

const MultimodalAI = () => {
  const [activeModalities, setActiveModalities] = useState(7);
  const [processingLoad, setProcessingLoad] = useState(84);
  const [fusionAccuracy, setFusionAccuracy] = useState(96.8);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTask, setCurrentTask] = useState('Image-Text Analysis');

  useEffect(() => {
    const interval = setInterval(() => {
      setProcessingLoad(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 10)));
      setFusionAccuracy(prev => Math.max(90, Math.min(99.9, prev + (Math.random() - 0.5) * 0.5)));
      
      const tasks = ['Image-Text Analysis', 'Audio-Visual Sync', 'Speech-Gesture Recognition', 'Document Understanding', 'Video Summarization'];
      setCurrentTask(tasks[Math.floor(Math.random() * tasks.length)]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const modalities = [
    { name: 'Vision', status: 'active', accuracy: 98.2 },
    { name: 'Audio', status: 'active', accuracy: 97.5 },
    { name: 'Text', status: 'active', accuracy: 99.1 },
    { name: 'Speech', status: 'active', accuracy: 96.8 },
    { name: 'Gesture', status: 'active', accuracy: 94.3 },
    { name: 'Sensor', status: 'processing', accuracy: 95.7 },
    { name: 'Biometric', status: 'standby', accuracy: 93.2 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'processing': return 'bg-yellow-500';
      case 'standby': return 'bg-gray-500';
      default: return 'bg-red-500';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-blue-300">Multi-Modal AI Interface</span>
          <Badge variant="outline" className="border-blue-400 text-blue-300">
            FUSION-AI
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-gray-400">Active Modalities</div>
            <div className="text-2xl font-bold text-blue-300">{activeModalities}/7</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-400">Fusion Accuracy</div>
            <div className="text-2xl font-bold text-green-400">{fusionAccuracy.toFixed(1)}%</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Processing Load</span>
            <span className="text-blue-400">{processingLoad}%</span>
          </div>
          <Progress value={processingLoad} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="text-sm text-gray-400">Current Task</div>
          <div className="text-lg font-medium text-purple-300">{currentTask}</div>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-300">Modality Status</div>
          <div className="grid grid-cols-2 gap-2">
            {modalities.map((modality, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(modality.status)}`}></div>
                  <span className="text-sm text-gray-300">{modality.name}</span>
                </div>
                <span className="text-xs text-gray-400">{modality.accuracy}%</span>
              </div>
            ))}
          </div>
        </div>

        <Button 
          onClick={() => setIsProcessing(!isProcessing)}
          className={`w-full ${isProcessing ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isProcessing ? 'Stop Processing' : 'Start Multi-Modal Analysis'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MultimodalAI;