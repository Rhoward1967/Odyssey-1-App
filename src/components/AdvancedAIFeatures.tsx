import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Zap, Target, Cpu, Settings, Play } from 'lucide-react';

export default function AdvancedAIFeatures() {
  const [models] = useState([
    { name: 'GPT-4 Turbo', status: 'active', accuracy: 94, speed: 'Fast' },
    { name: 'Claude-3 Opus', status: 'active', accuracy: 96, speed: 'Medium' },
    { name: 'Gemini Pro', status: 'standby', accuracy: 92, speed: 'Very Fast' }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Advanced AI Features</h2>
          <p className="text-muted-foreground">Next-generation AI capabilities and model management</p>
        </div>
        <Badge variant="outline" className="bg-purple-50 text-purple-700">
          <Brain className="h-3 w-3 mr-1" />
          AI Engine Active
        </Badge>
      </div>

      <Tabs defaultValue="models" className="space-y-4">
        <TabsList>
          <TabsTrigger value="models">AI Models</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {models.map((model, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{model.name}</CardTitle>
                  <Badge variant={model.status === 'active' ? 'default' : 'secondary'}>
                    {model.status}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Accuracy:</span>
                    <span className="font-medium">{model.accuracy}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Speed:</span>
                    <span className="font-medium">{model.speed}</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <Settings className="h-3 w-3 mr-1" />
                    Configure
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Custom Model Training</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Train specialized models for your specific use cases
                </div>
                <Button className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Start Training
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fine-Tuning</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Optimize existing models with your data
                </div>
                <Button variant="outline" className="w-full">
                  <Target className="h-4 w-4 mr-2" />
                  Fine-Tune Model
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Optimization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Cpu className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="font-medium">CPU Usage</div>
                  <div className="text-2xl font-bold">45%</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <div className="font-medium">Response Time</div>
                  <div className="text-2xl font-bold">120ms</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Brain className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <div className="font-medium">Accuracy</div>
                  <div className="text-2xl font-bold">94.2%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}