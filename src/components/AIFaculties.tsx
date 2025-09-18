import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

const FACULTIES = [
  {
    id: 'perception',
    name: 'Perception Faculty',
    icon: '👁️',
    description: 'Ingests and pre-processes all data (text, audio, visual) into structured format',
    status: 'active',
    processes: ['Natural Language Processing', 'Computer Vision', 'Audio Analysis', 'Data Structuring']
  },
  {
    id: 'memory',
    name: 'Memory Faculty',
    icon: '🧠',
    description: 'Manages living memory through decoupled knowledge base with real-time updates',
    status: 'active',
    processes: ['Knowledge Storage', 'Memory Retrieval', 'Context Management', 'Learning Integration']
  },
  {
    id: 'reasoning',
    name: 'Reasoning Faculty',
    icon: '🤔',
    description: 'Core logical processor that synthesizes information and draws new conclusions',
    status: 'active',
    processes: ['Logical Analysis', 'Pattern Recognition', 'Inference Generation', 'Problem Solving']
  },
  {
    id: 'safety',
    name: 'Safety Faculty',
    icon: '🛡️',
    description: 'Continuous auditing system ensuring actions align with Sovereign Principles',
    status: 'active',
    processes: ['Principle Validation', 'Risk Assessment', 'Ethical Compliance', 'Output Verification']
  },
  {
    id: 'action',
    name: 'Action Faculty',
    icon: '⚡',
    description: 'Translates AI plans into tangible outputs and executable actions',
    status: 'active',
    processes: ['Plan Execution', 'Output Generation', 'System Integration', 'Result Delivery']
  }
];

export function AIFaculties() {
  const [activeFaculty, setActiveFaculty] = useState<string>('perception');
  const [processingStates, setProcessingStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setProcessingStates(prev => {
        const newStates = { ...prev };
        FACULTIES.forEach(faculty => {
          newStates[faculty.id] = Math.random() > 0.7;
        });
        return newStates;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const currentFaculty = FACULTIES.find(f => f.id === activeFaculty);

  return (
    <div className="space-y-6">
      {/* Faculty Overview */}
      <Card className="bg-gradient-to-br from-purple-900/90 to-indigo-900/90 border-2 border-cyan-500/50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">🧠</span>
            AI Faculties System
          </CardTitle>
          <p className="text-gray-300">
            Interconnected specialized modules handling specific intellectual tasks
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {FACULTIES.map((faculty) => (
              <Button
                key={faculty.id}
                variant={activeFaculty === faculty.id ? "default" : "outline"}
                className={`h-auto p-4 flex flex-col items-center gap-2 ${
                  activeFaculty === faculty.id 
                    ? 'bg-amber-600 hover:bg-amber-700' 
                    : 'bg-black/30 border-gray-600 hover:border-purple-500'
                }`}
                onClick={() => setActiveFaculty(faculty.id)}
              >
                <span className="text-2xl">{faculty.icon}</span>
                <span className="text-xs text-center font-medium">{faculty.name}</span>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    processingStates[faculty.id] ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                  }`}></div>
                  <span className="text-xs text-gray-300">
                    {processingStates[faculty.id] ? 'Processing' : 'Idle'}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Faculty Details */}
      {currentFaculty && (
        <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-purple-500/50">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
              <span className="text-2xl">{currentFaculty.icon}</span>
              {currentFaculty.name}
              <Badge className="bg-green-600/20 text-green-300">
                {currentFaculty.status.toUpperCase()}
              </Badge>
            </CardTitle>
            <p className="text-gray-300">{currentFaculty.description}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-amber-300">Active Processes</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentFaculty.processes.map((process, index) => (
                  <div key={index} className="bg-black/30 p-3 rounded border border-purple-500/30">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm font-medium">{process}</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          Math.random() > 0.5 ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'
                        }`}></div>
                        <span className="text-xs text-gray-400">
                          {Math.random() > 0.5 ? 'Active' : 'Standby'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cognitive Process Flow */}
      <Card className="bg-gradient-to-br from-indigo-900/90 to-purple-900/90 border-2 border-amber-500/50">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
            <span className="text-2xl">🔄</span>
            Cognitive Process Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-black/30 p-3 rounded border border-blue-500/30">
              <span className="text-blue-400 font-medium">1. Perception</span>
              <span className="text-gray-300 text-sm">Raw data → Structured format</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-gray-400">↓</span>
            </div>
            <div className="flex items-center justify-between bg-black/30 p-3 rounded border border-green-500/30">
              <span className="text-green-400 font-medium">2. Memory</span>
              <span className="text-gray-300 text-sm">Knowledge retrieval & context</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-gray-400">↓</span>
            </div>
            <div className="flex items-center justify-between bg-black/30 p-3 rounded border border-purple-500/30">
              <span className="text-purple-400 font-medium">3. Reasoning</span>
              <span className="text-gray-300 text-sm">Analysis & plan formulation</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-gray-400">↓</span>
            </div>
            <div className="flex items-center justify-between bg-black/30 p-3 rounded border border-red-500/30">
              <span className="text-red-400 font-medium">4. Safety</span>
              <span className="text-gray-300 text-sm">Principle validation & compliance</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-gray-400">↓</span>
            </div>
            <div className="flex items-center justify-between bg-black/30 p-3 rounded border border-yellow-500/30">
              <span className="text-yellow-400 font-medium">5. Action</span>
              <span className="text-gray-300 text-sm">Plan execution & output</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}