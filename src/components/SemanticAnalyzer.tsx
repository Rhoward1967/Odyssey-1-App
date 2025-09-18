import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface SemanticRole {
  role: string;
  entity: string;
  confidence: number;
}

interface AnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  complexity: number;
  entities: string[];
  semanticRoles: SemanticRole[];
  keyPhrases: string[];
}

export const SemanticAnalyzer: React.FC = () => {
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult>({
    sentiment: 'neutral',
    complexity: 0.7,
    entities: ['system', 'user', 'process'],
    semanticRoles: [
      { role: 'Agent', entity: 'Odyssey-1', confidence: 0.95 },
      { role: 'Action', entity: 'analyze', confidence: 0.88 },
      { role: 'Patient', entity: 'text input', confidence: 0.92 }
    ],
    keyPhrases: ['semantic understanding', 'knowledge integration', 'inference engine']
  });

  const [processingModules] = useState([
    { name: 'NLP Tokenizer', status: 'active', accuracy: 94 },
    { name: 'Syntax Parser', status: 'active', accuracy: 89 },
    { name: 'Entity Recognizer', status: 'active', accuracy: 91 },
    { name: 'Role Identifier', status: 'active', accuracy: 87 }
  ]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-600' : 'bg-gray-600';
  };

  return (
    <Card className="bg-gray-800/50 border-cyan-500/30">
      <CardHeader>
        <CardTitle className="text-cyan-400 flex items-center gap-2">
          🔍 Semantic Analysis Engine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-cyan-300 font-medium">Processing Modules</h4>
            {processingModules.map((module, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded bg-gray-700/30">
                <span className="text-sm">{module.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{module.accuracy}%</span>
                  <Badge className={getStatusColor(module.status)}>
                    {module.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h4 className="text-cyan-300 font-medium">Analysis Metrics</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Complexity</span>
                  <span>{(currentAnalysis.complexity * 100).toFixed(0)}%</span>
                </div>
                <Progress value={currentAnalysis.complexity * 100} className="h-2" />
              </div>
              
              <div className="p-2 rounded bg-gray-700/30">
                <span className="text-sm">Sentiment: </span>
                <span className={`font-medium ${getSentimentColor(currentAnalysis.sentiment)}`}>
                  {currentAnalysis.sentiment}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-cyan-300 font-medium mb-2">Semantic Roles</h4>
          <div className="grid grid-cols-1 gap-2">
            {currentAnalysis.semanticRoles.map((role, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded bg-cyan-900/20">
                <div>
                  <span className="text-cyan-200 font-medium">{role.role}:</span>
                  <span className="ml-2 text-gray-300">{role.entity}</span>
                </div>
                <Badge variant="outline" className="border-cyan-500/50">
                  {(role.confidence * 100).toFixed(0)}%
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-cyan-300 font-medium mb-2">Key Phrases</h4>
          <div className="flex flex-wrap gap-2">
            {currentAnalysis.keyPhrases.map((phrase, index) => (
              <Badge key={index} variant="secondary" className="bg-cyan-900/30 text-cyan-200">
                {phrase}
              </Badge>
            ))}
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-cyan-300">{currentAnalysis.entities.length}</div>
          <div className="text-xs text-gray-400">Entities Identified</div>
        </div>
      </CardContent>
    </Card>
  );
};