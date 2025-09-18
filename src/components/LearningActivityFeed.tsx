import React, { useState, useEffect } from 'react';
import { Activity, BookOpen, Globe, Lightbulb, Target } from 'lucide-react';

interface LearningEvent {
  id: string;
  type: 'discovery' | 'synthesis' | 'validation' | 'integration' | 'breakthrough';
  title: string;
  description: string;
  domain: string;
  confidence: number;
  timestamp: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
}

export const LearningActivityFeed: React.FC = () => {
  const [learningEvents, setLearningEvents] = useState<LearningEvent[]>([
    {
      id: '1',
      type: 'breakthrough',
      title: 'Novel Pattern Recognition in Quantum States',
      description: 'Discovered new correlation between quantum entanglement patterns and computational efficiency',
      domain: 'Quantum Computing',
      confidence: 94.7,
      timestamp: new Date().toISOString(),
      impact: 'critical'
    },
    {
      id: '2',
      type: 'synthesis',
      title: 'Cross-Domain Knowledge Integration',
      description: 'Successfully merged blockchain consensus mechanisms with neural network training protocols',
      domain: 'Distributed AI',
      confidence: 87.3,
      timestamp: new Date(Date.now() - 45000).toISOString(),
      impact: 'high'
    },
    {
      id: '3',
      type: 'discovery',
      title: 'Emergent Behavior in Multi-Agent Systems',
      description: 'Identified previously unknown coordination patterns in decentralized learning networks',
      domain: 'Multi-Agent AI',
      confidence: 78.9,
      timestamp: new Date(Date.now() - 120000).toISOString(),
      impact: 'medium'
    }
  ]);

  const [realTimeMetrics, setRealTimeMetrics] = useState({
    currentFocus: 'Quantum-Classical Hybrid Algorithms',
    learningVelocity: 73.2,
    knowledgeGrowth: 12.7,
    activeConnections: 847
  });

  useEffect(() => {
    const interval = setInterval(() => {
      // Add new learning events periodically
      if (Math.random() > 0.7) {
        const newEvent: LearningEvent = {
          id: Date.now().toString(),
          type: ['discovery', 'synthesis', 'validation', 'integration'][Math.floor(Math.random() * 4)] as any,
          title: [
            'Advanced Pattern Recognition Breakthrough',
            'Cross-Domain Knowledge Synthesis',
            'Novel Algorithm Optimization',
            'Emergent Behavior Analysis'
          ][Math.floor(Math.random() * 4)],
          description: 'Autonomous learning system has identified new patterns and correlations in the data stream',
          domain: ['Quantum AI', 'Neural Networks', 'Blockchain', 'Cryptography'][Math.floor(Math.random() * 4)],
          confidence: Math.random() * 40 + 60,
          timestamp: new Date().toISOString(),
          impact: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any
        };

        setLearningEvents(prev => [newEvent, ...prev.slice(0, 9)]);
      }

      // Update real-time metrics
      setRealTimeMetrics(prev => ({
        ...prev,
        learningVelocity: prev.learningVelocity + (Math.random() - 0.5) * 5,
        knowledgeGrowth: prev.knowledgeGrowth + Math.random() * 2,
        activeConnections: prev.activeConnections + Math.floor((Math.random() - 0.5) * 20)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'discovery': return <Globe className="w-5 h-5 text-blue-400" />;
      case 'synthesis': return <Lightbulb className="w-5 h-5 text-yellow-400" />;
      case 'validation': return <Target className="w-5 h-5 text-green-400" />;
      case 'integration': return <BookOpen className="w-5 h-5 text-purple-400" />;
      case 'breakthrough': return <Activity className="w-5 h-5 text-red-400" />;
      default: return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'border-red-500 bg-red-500/10';
      case 'high': return 'border-orange-500 bg-orange-500/10';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10';
      case 'low': return 'border-green-500 bg-green-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6 rounded-xl">
      <div className="flex items-center mb-6">
        <Activity className="w-8 h-8 text-cyan-400 mr-3" />
        <h2 className="text-2xl font-bold text-white">Real-Time Learning Feed</h2>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-black/30 rounded-lg p-3">
          <div className="text-sm text-gray-400">Current Focus</div>
          <div className="text-cyan-400 font-medium text-sm">{realTimeMetrics.currentFocus}</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3">
          <div className="text-sm text-gray-400">Learning Velocity</div>
          <div className="text-green-400 font-mono">{realTimeMetrics.learningVelocity.toFixed(1)}/hr</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3">
          <div className="text-sm text-gray-400">Knowledge Growth</div>
          <div className="text-blue-400 font-mono">+{realTimeMetrics.knowledgeGrowth.toFixed(1)}%</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3">
          <div className="text-sm text-gray-400">Active Connections</div>
          <div className="text-purple-400 font-mono">{realTimeMetrics.activeConnections}</div>
        </div>
      </div>

      {/* Learning Events Feed */}
      <div className="bg-black/30 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Learning Activities</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {learningEvents.map(event => (
            <div key={event.id} className={`border-l-4 ${getImpactColor(event.impact)} p-4 rounded-r-lg`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  {getEventIcon(event.type)}
                  <h4 className="text-white font-medium ml-2">{event.title}</h4>
                </div>
                <div className="text-right">
                  <div className="text-cyan-400 text-sm">{event.confidence.toFixed(1)}%</div>
                  <div className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
              
              <p className="text-gray-300 text-sm mb-2">{event.description}</p>
              
              <div className="flex justify-between items-center">
                <span className="text-xs bg-blue-600/30 text-blue-300 px-2 py-1 rounded">{event.domain}</span>
                <span className="text-xs text-gray-500 capitalize">{event.type} • {event.impact} impact</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LearningActivityFeed;