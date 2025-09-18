import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Brain, Cpu, Database, Eye, Lightbulb, Zap } from 'lucide-react';

interface CognitiveProcess {
  id: string;
  input: string;
  perception: string;
  knowledge: string;
  reasoning: string;
  action: string;
  learning: string;
  timestamp: Date;
}

export const IntellectualOrchestrator: React.FC = () => {
  const [input, setInput] = useState('');
  const [processes, setProcesses] = useState<CognitiveProcess[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeModule, setActiveModule] = useState<string | null>(null);

  const knowledgeBase = {
    weather: "Advanced meteorological data and forecasting algorithms",
    science: "Comprehensive scientific knowledge across multiple domains",
    philosophy: "Deep understanding of philosophical frameworks and reasoning",
    mathematics: "Advanced mathematical concepts and problem-solving methods",
    technology: "Current technological trends and computational principles"
  };

  const simulateCognitiveProcess = async (inputData: string) => {
    setIsProcessing(true);
    const processId = Date.now().toString();
    
    // Simulate each cognitive step with delays
    setActiveModule('perception');
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const perception = `Analyzed input: "${inputData}" - Detected query type and context`;
    
    setActiveModule('knowledge');
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const relevantKnowledge = Object.keys(knowledgeBase).find(key => 
      inputData.toLowerCase().includes(key)
    ) || 'general';
    const knowledge = knowledgeBase[relevantKnowledge as keyof typeof knowledgeBase] || 
      "General knowledge retrieval and contextual understanding";
    
    setActiveModule('reasoning');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const reasoning = `Formulated response strategy based on input analysis and knowledge context`;
    
    setActiveModule('action');
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const action = `Generated comprehensive response addressing: ${inputData}`;
    
    setActiveModule('learning');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const learning = "Updated neural pathways and knowledge associations";
    
    const newProcess: CognitiveProcess = {
      id: processId,
      input: inputData,
      perception,
      knowledge,
      reasoning,
      action,
      learning,
      timestamp: new Date()
    };
    
    setProcesses(prev => [newProcess, ...prev.slice(0, 4)]);
    setActiveModule(null);
    setIsProcessing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      simulateCognitiveProcess(input.trim());
      setInput('');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-300">
            <Brain className="w-6 h-6" />
            AI Intellectual System Orchestrator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter query to process through cognitive system..."
              className="bg-black/30 border-purple-500/30 text-purple-100"
              disabled={isProcessing}
            />
            <Button 
              type="submit" 
              disabled={isProcessing || !input.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isProcessing ? 'Processing...' : 'Process'}
            </Button>
          </form>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { name: 'perception', icon: Eye, label: 'Perception' },
              { name: 'knowledge', icon: Database, label: 'Knowledge' },
              { name: 'reasoning', icon: Cpu, label: 'Reasoning' },
              { name: 'action', icon: Zap, label: 'Action' },
              { name: 'learning', icon: Lightbulb, label: 'Learning' }
            ].map(({ name, icon: Icon, label }) => (
              <div 
                key={name}
                className={`p-3 rounded-lg border transition-all ${
                  activeModule === name 
                    ? 'bg-purple-600/30 border-purple-400 animate-pulse' 
                    : 'bg-black/20 border-purple-500/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-purple-300" />
                  <span className="text-sm text-purple-200">{label}</span>
                </div>
                {activeModule === name && (
                  <Badge className="mt-1 bg-purple-500 text-xs">Active</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {processes.length > 0 && (
        <Card className="bg-black/30 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-purple-300">Cognitive Process History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {processes.map((process) => (
                <div key={process.id} className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-purple-600">{process.input}</Badge>
                    <span className="text-xs text-purple-400">
                      {process.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-purple-300">Perception:</span> <span className="text-purple-100">{process.perception}</span></div>
                    <div><span className="text-purple-300">Knowledge:</span> <span className="text-purple-100">{process.knowledge}</span></div>
                    <div><span className="text-purple-300">Reasoning:</span> <span className="text-purple-100">{process.reasoning}</span></div>
                    <div><span className="text-purple-300">Action:</span> <span className="text-purple-100">{process.action}</span></div>
                    <div><span className="text-purple-300">Learning:</span> <span className="text-purple-100">{process.learning}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};