import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle2, XCircle, Clock, Zap } from 'lucide-react';

interface ValidationProcess {
  id: string;
  source: string;
  content: string;
  confidence: number;
  status: 'validating' | 'verified' | 'rejected' | 'cross-referencing';
  crossReferences: number;
  timestamp: string;
}

export const KnowledgeValidationEngine: React.FC = () => {
  const [validationQueue, setValidationQueue] = useState<ValidationProcess[]>([
    {
      id: '1',
      source: 'arXiv:2024.0123',
      content: 'Novel quantum error correction using topological qubits',
      confidence: 0,
      status: 'validating',
      crossReferences: 0,
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      source: 'Nature AI Review',
      content: 'Transformer architecture improvements for reasoning',
      confidence: 87.3,
      status: 'cross-referencing',
      crossReferences: 12,
      timestamp: new Date(Date.now() - 60000).toISOString()
    },
    {
      id: '3',
      source: 'MIT Technology Review',
      content: 'Breakthrough in room-temperature superconductors',
      confidence: 23.1,
      status: 'rejected',
      crossReferences: 3,
      timestamp: new Date(Date.now() - 120000).toISOString()
    }
  ]);

  const [validationMetrics, setValidationMetrics] = useState({
    processed: 1247,
    verified: 1089,
    rejected: 158,
    accuracy: 94.7
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setValidationQueue(prev => prev.map(item => {
        if (item.status === 'validating') {
          const newConfidence = Math.min(item.confidence + Math.random() * 15, 100);
          const newCrossRefs = item.crossReferences + Math.floor(Math.random() * 3);
          
          let newStatus = item.status;
          if (newConfidence > 80) newStatus = 'verified';
          else if (newConfidence > 40) newStatus = 'cross-referencing';
          else if (newConfidence < 30 && newCrossRefs > 5) newStatus = 'rejected';

          return {
            ...item,
            confidence: newConfidence,
            crossReferences: newCrossRefs,
            status: newStatus
          };
        }
        return item;
      }));

      setValidationMetrics(prev => ({
        ...prev,
        processed: prev.processed + Math.floor(Math.random() * 3),
        accuracy: Math.min(prev.accuracy + (Math.random() - 0.5) * 0.1, 100)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'validating': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'verified': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'cross-referencing': return <Zap className="w-4 h-4 text-blue-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validating': return 'from-yellow-500 to-orange-500';
      case 'verified': return 'from-green-500 to-emerald-500';
      case 'rejected': return 'from-red-500 to-pink-500';
      case 'cross-referencing': return 'from-blue-500 to-cyan-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6 rounded-xl">
      <div className="flex items-center mb-6">
        <Shield className="w-8 h-8 text-green-400 mr-3" />
        <h2 className="text-2xl font-bold text-white">Knowledge Validation Engine</h2>
      </div>

      {/* Validation Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-black/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-cyan-400">{validationMetrics.processed}</div>
          <div className="text-sm text-gray-400">Processed</div>
        </div>
        <div className="bg-black/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{validationMetrics.verified}</div>
          <div className="text-sm text-gray-400">Verified</div>
        </div>
        <div className="bg-black/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{validationMetrics.rejected}</div>
          <div className="text-sm text-gray-400">Rejected</div>
        </div>
        <div className="bg-black/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{validationMetrics.accuracy.toFixed(1)}%</div>
          <div className="text-sm text-gray-400">Accuracy</div>
        </div>
      </div>

      {/* Validation Queue */}
      <div className="bg-black/30 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Active Validation Queue</h3>
        <div className="space-y-3">
          {validationQueue.map(item => (
            <div key={item.id} className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {getStatusIcon(item.status)}
                  <span className="text-white font-medium ml-2">{item.source}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">{item.crossReferences} refs</span>
                  <span className="text-cyan-400 font-mono">{item.confidence.toFixed(1)}%</span>
                </div>
              </div>
              
              <p className="text-gray-300 text-sm mb-3">{item.content}</p>
              
              <div className="flex items-center justify-between">
                <div className="w-full bg-gray-700 rounded-full h-2 mr-4">
                  <div 
                    className={`bg-gradient-to-r ${getStatusColor(item.status)} h-2 rounded-full transition-all duration-1000`}
                    style={{ width: `${item.confidence}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 capitalize">{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};