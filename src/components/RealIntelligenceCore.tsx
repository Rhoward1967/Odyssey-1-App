import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import { Brain, Zap, Target, TrendingUp } from 'lucide-react';

interface IntelligenceMetrics {
  analysisAccuracy: number;
  learningRate: number;
  decisionQuality: number;
  knowledgeBase: number;
}

interface ProcessingTask {
  id: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: any;
  startTime: number;
}

export default function RealIntelligenceCore() {
  const [metrics, setMetrics] = useState<IntelligenceMetrics>({
    analysisAccuracy: 0,
    learningRate: 0,
    decisionQuality: 0,
    knowledgeBase: 0
  });
  
  const [tasks, setTasks] = useState<ProcessingTask[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Real intelligence calculation based on actual performance
  const calculateRealMetrics = async () => {
    try {
      // Get actual system performance data
      const completedTasks = tasks.filter(t => t.status === 'completed');
      const errorTasks = tasks.filter(t => t.status === 'error');
      
      const successRate = completedTasks.length / Math.max(1, tasks.length);
      const avgProcessingTime = completedTasks.reduce((sum, task) => 
        sum + (Date.now() - task.startTime), 0) / Math.max(1, completedTasks.length);
      
      setMetrics({
        analysisAccuracy: Math.round(successRate * 100),
        learningRate: Math.max(0, 100 - (errorTasks.length * 10)),
        decisionQuality: Math.round((successRate * 0.7 + (avgProcessingTime < 5000 ? 0.3 : 0.1)) * 100),
        knowledgeBase: Math.min(100, completedTasks.length * 2)
      });
    } catch (error) {
      console.error('Error calculating metrics:', error);
    }
  };

  // Real AI processing function
  const processWithRealAI = async (taskType: string, data: any) => {
    const taskId = Date.now().toString();
    const newTask: ProcessingTask = {
      id: taskId,
      type: taskType,
      status: 'pending',
      startTime: Date.now()
    };
    
    setTasks(prev => [...prev, newTask]);
    setIsProcessing(true);
    
    try {
      // Update task status
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: 'processing' } : t
      ));
      
      // Call real AI processing function
      const { data: result, error } = await supabase.functions.invoke('real-ai-processor', {
        body: { task: taskType, data, context: { timestamp: Date.now() } }
      });
      
      if (error) throw error;
      
      // Update task with results
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: 'completed', result } : t
      ));
      
      return result;
    } catch (error) {
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: 'error' } : t
      ));
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  // Test real AI capabilities
  const runIntelligenceTest = async () => {
    const testData = {
      requirements: [
        { name: 'Software Development', cost: 50000, duration: 45 },
        { name: 'Testing & QA', cost: 15000, duration: 20 }
      ],
      budget: 75000,
      timeline: 90,
      competitors: [
        { name: 'Competitor A', score: 0.7 },
        { name: 'Competitor B', score: 0.8 }
      ]
    };
    
    await processWithRealAI('analyze_bid', testData);
  };

  useEffect(() => {
    calculateRealMetrics();
  }, [tasks]);

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            Real Intelligence Core
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.analysisAccuracy}%</div>
              <div className="text-sm text-gray-600">Analysis Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.learningRate}%</div>
              <div className="text-sm text-gray-600">Learning Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{metrics.decisionQuality}%</div>
              <div className="text-sm text-gray-600">Decision Quality</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{metrics.knowledgeBase}%</div>
              <div className="text-sm text-gray-600">Knowledge Base</div>
            </div>
          </div>
          
          <Button 
            onClick={runIntelligenceTest}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? 'Processing...' : 'Run Intelligence Test'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Processing Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tasks.slice(-5).map(task => (
              <div key={task.id} className="flex items-center justify-between p-2 border rounded">
                <span className="font-medium">{task.type}</span>
                <Badge variant={
                  task.status === 'completed' ? 'default' :
                  task.status === 'error' ? 'destructive' :
                  task.status === 'processing' ? 'secondary' : 'outline'
                }>
                  {task.status}
                </Badge>
              </div>
            ))}
            {tasks.length === 0 && (
              <p className="text-gray-500 text-center py-4">No tasks processed yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}