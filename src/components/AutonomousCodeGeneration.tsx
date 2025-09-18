import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

const AutonomousCodeGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [activeProjects, setActiveProjects] = useState(12);
  const [codeQuality, setCodeQuality] = useState(98.7);
  const [linesGenerated, setLinesGenerated] = useState(2847392);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveProjects(prev => prev + Math.floor(Math.random() * 3) - 1);
      setCodeQuality(prev => Math.min(99.9, prev + (Math.random() - 0.5) * 0.1));
      setLinesGenerated(prev => prev + Math.floor(Math.random() * 1000));
      
      if (isGenerating) {
        setGenerationProgress(prev => (prev + Math.random() * 5) % 100);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isGenerating]);

  const frameworks = ['React', 'Vue', 'Angular', 'Svelte', 'Next.js', 'Django', 'FastAPI', 'Express'];
  const languages = ['TypeScript', 'Python', 'Rust', 'Go', 'Java', 'C++', 'Swift', 'Kotlin'];

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-purple-300">Autonomous Code Generation</span>
          <Badge variant="outline" className="border-purple-400 text-purple-300">
            AI-POWERED
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-gray-400">Active Projects</div>
            <div className="text-2xl font-bold text-purple-300">{activeProjects}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-400">Code Quality</div>
            <div className="text-2xl font-bold text-green-400">{codeQuality.toFixed(1)}%</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Lines Generated Today</span>
            <span className="text-blue-400">{linesGenerated.toLocaleString()}</span>
          </div>
          <Progress value={75} className="h-2" />
        </div>

        {isGenerating && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Generation Progress</span>
              <span className="text-purple-400">{generationProgress.toFixed(0)}%</span>
            </div>
            <Progress value={generationProgress} className="h-2" />
          </div>
        )}

        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-300">Supported Frameworks</div>
          <div className="flex flex-wrap gap-2">
            {frameworks.map((framework, index) => (
              <Badge key={index} variant="secondary" className="bg-purple-900/30 text-purple-300 border-purple-500/30">
                {framework}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-300">Languages</div>
          <div className="flex flex-wrap gap-2">
            {languages.map((language, index) => (
              <Badge key={index} variant="secondary" className="bg-pink-900/30 text-pink-300 border-pink-500/30">
                {language}
              </Badge>
            ))}
          </div>
        </div>

        <Button 
          onClick={() => setIsGenerating(!isGenerating)}
          className={`w-full ${isGenerating ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'}`}
        >
          {isGenerating ? 'Stop Generation' : 'Start Autonomous Generation'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AutonomousCodeGeneration;