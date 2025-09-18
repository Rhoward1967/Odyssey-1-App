import React, { useState, useEffect } from 'react';
import { Brain, Database, Search, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

interface KnowledgeDomain {
  id: string;
  name: string;
  confidence: number;
  lastUpdated: string;
  sources: number;
  concepts: string[];
}

interface LearningActivity {
  id: string;
  type: 'research' | 'validation' | 'integration' | 'synthesis';
  topic: string;
  status: 'active' | 'completed' | 'validating';
  confidence: number;
  timestamp: string;
  sources: string[];
}

export const AutonomousKnowledgeCore: React.FC = () => {
  const [knowledgeDomains, setKnowledgeDomains] = useState<KnowledgeDomain[]>([
    {
      id: '1',
      name: 'Quantum Computing',
      confidence: 94.2,
      lastUpdated: new Date().toISOString(),
      sources: 847,
      concepts: ['Quantum Entanglement', 'Superposition', 'Quantum Gates', 'Decoherence']
    },
    {
      id: '2',
      name: 'Machine Learning',
      confidence: 97.8,
      lastUpdated: new Date(Date.now() - 300000).toISOString(),
      sources: 1203,
      concepts: ['Neural Networks', 'Deep Learning', 'Reinforcement Learning', 'Transfer Learning']
    },
    {
      id: '3',
      name: 'Blockchain Technology',
      confidence: 89.6,
      lastUpdated: new Date(Date.now() - 600000).toISOString(),
      sources: 623,
      concepts: ['Consensus Mechanisms', 'Smart Contracts', 'DeFi', 'Layer 2 Solutions']
    }
  ]);

  const [currentLearning, setCurrentLearning] = useState<LearningActivity[]>([
    {
      id: '1',
      type: 'research',
      topic: 'Quantum Error Correction Advances',
      status: 'active',
      confidence: 0,
      timestamp: new Date().toISOString(),
      sources: ['arXiv.org', 'Nature Quantum', 'IBM Research']
    },
    {
      id: '2',
      type: 'validation',
      topic: 'GPT-4 Architecture Improvements',
      status: 'validating',
      confidence: 78.5,
      timestamp: new Date(Date.now() - 120000).toISOString(),
      sources: ['OpenAI Papers', 'Google Research', 'Microsoft Research']
    }
  ]);

  const [totalKnowledge, setTotalKnowledge] = useState(0);
  const [learningRate, setLearningRate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate autonomous learning
      setCurrentLearning(prev => prev.map(activity => ({
        ...activity,
        confidence: activity.status === 'active' ? 
          Math.min(activity.confidence + Math.random() * 5, 100) : activity.confidence
      })));

      // Update knowledge domains
      setKnowledgeDomains(prev => prev.map(domain => ({
        ...domain,
        confidence: Math.min(domain.confidence + Math.random() * 0.1, 100),
        sources: domain.sources + Math.floor(Math.random() * 3)
      })));

      // Update metrics
      setTotalKnowledge(prev => prev + Math.random() * 10);
      setLearningRate(Math.random() * 100 + 50);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6 rounded-xl">
      <div className="flex items-center mb-6">
        <Brain className="w-8 h-8 text-cyan-400 mr-3" />
        <h2 className="text-2xl font-bold text-white">Autonomous Knowledge Acquisition</h2>
        <div className="ml-auto flex items-center space-x-4">
          <div className="text-cyan-400">
            <span className="text-sm">Learning Rate:</span>
            <span className="ml-2 font-mono">{learningRate.toFixed(1)}/min</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Knowledge Domains */}
        <div className="bg-black/30 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Knowledge Domains
          </h3>
          <div className="space-y-3">
            {knowledgeDomains.map(domain => (
              <div key={domain.id} className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-white font-medium">{domain.name}</h4>
                  <span className="text-cyan-400 text-sm">{domain.confidence.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${domain.confidence}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{domain.sources} sources</span>
                  <span>{new Date(domain.lastUpdated).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Learning Activities */}
        <div className="bg-black/30 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Active Learning
          </h3>
          <div className="space-y-3">
            {currentLearning.map(activity => (
              <div key={activity.id} className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {activity.status === 'active' && <TrendingUp className="w-4 h-4 text-green-400 mr-2" />}
                    {activity.status === 'validating' && <AlertTriangle className="w-4 h-4 text-yellow-400 mr-2" />}
                    {activity.status === 'completed' && <CheckCircle className="w-4 h-4 text-blue-400 mr-2" />}
                    <span className="text-white text-sm font-medium">{activity.topic}</span>
                  </div>
                  <span className="text-cyan-400 text-xs">{activity.confidence.toFixed(1)}%</span>
                </div>
                <div className="text-xs text-gray-400 mb-2">
                  Sources: {activity.sources.join(', ')}
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-cyan-500 h-1 rounded-full transition-all duration-1000"
                    style={{ width: `${activity.confidence}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};