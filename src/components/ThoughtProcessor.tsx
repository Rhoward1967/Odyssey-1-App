import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

interface ProcessingStep {
  name: string;
  status: 'pending' | 'processing' | 'complete';
  result?: string;
}

export const ThoughtProcessor: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { name: 'Tokenization', status: 'pending' },
    { name: 'Syntax Analysis', status: 'pending' },
    { name: 'Semantic Analysis', status: 'pending' },
    { name: 'Knowledge Integration', status: 'pending' },
    { name: 'Inference Engine', status: 'pending' }
  ]);
  const [inferences, setInferences] = useState<string[]>([]);

  const processThought = async () => {
    if (!inputText.trim()) return;
    
    setIsProcessing(true);
    setInferences([]);
    
    // Reset steps
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending', result: undefined })));
    
    // Simulate processing each step
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSteps(prev => prev.map((step, index) => 
        index === i 
          ? { ...step, status: 'processing' }
          : index < i 
            ? { ...step, status: 'complete' }
            : step
      ));
      
      await new Promise(resolve => setTimeout(resolve, 400));
      
      setSteps(prev => prev.map((step, index) => 
        index === i ? { ...step, status: 'complete', result: getStepResult(i, inputText) } : step
      ));
    }
    
    // Generate inferences
    const newInferences = generateInferences(inputText);
    setInferences(newInferences);
    setIsProcessing(false);
  };

  const getStepResult = (stepIndex: number, text: string): string => {
    switch (stepIndex) {
      case 0: return `Tokens: ${text.toLowerCase().split(' ').length}`;
      case 1: return 'Structure identified';
      case 2: return 'Semantic roles mapped';
      case 3: return 'Knowledge graph updated';
      case 4: return 'New facts deduced';
      default: return 'Complete';
    }
  };

  const generateInferences = (text: string): string[] => {
    const inferences = [];
    if (text.includes('meeting')) inferences.push('Calendar event detected');
    if (text.includes('moved') || text.includes('changed')) inferences.push('Schedule modification required');
    if (text.includes('urgent')) inferences.push('High priority classification');
    return inferences.length > 0 ? inferences : ['Semantic analysis complete'];
  };

  return (
    <Card className="bg-gray-800/50 border-blue-500/30">
      <CardHeader>
        <CardTitle className="text-blue-400 flex items-center gap-2">
          🧠 Odyssey-1 Thought Processor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text for deep comprehension analysis..."
            className="bg-gray-700/50 border-gray-600"
            disabled={isProcessing}
          />
          <Button 
            onClick={processThought}
            disabled={isProcessing || !inputText.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isProcessing ? 'Processing...' : 'Analyze'}
          </Button>
        </div>
        
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded bg-gray-700/30">
              <span className="text-sm">{step.name}</span>
              <div className="flex items-center gap-2">
                {step.result && <span className="text-xs text-gray-400">{step.result}</span>}
                <Badge 
                  variant={step.status === 'complete' ? 'default' : step.status === 'processing' ? 'secondary' : 'outline'}
                  className={
                    step.status === 'complete' ? 'bg-green-600' :
                    step.status === 'processing' ? 'bg-yellow-600' : 'bg-gray-600'
                  }
                >
                  {step.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        
        {inferences.length > 0 && (
          <div className="mt-4 p-3 rounded bg-blue-900/30 border border-blue-500/30">
            <h4 className="text-blue-300 font-medium mb-2">Inferred Facts:</h4>
            <ul className="space-y-1">
              {inferences.map((inference, index) => (
                <li key={index} className="text-sm text-blue-200">• {inference}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};