import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

const CollaborativeLearningNetwork = () => {
  const [networkActivity, setNetworkActivity] = useState(0);
  const [knowledgeShared, setKnowledgeShared] = useState(0);

  const connectedAISystems = [
    {
      name: "ATLAS Research AI",
      institution: "MIT AI Lab",
      specialization: "Quantum Computing",
      trustScore: 97,
      lastExchange: "2 minutes ago",
      status: "active",
      sharedKnowledge: 234
    },
    {
      name: "SOPHIA Medical AI",
      institution: "Stanford Medicine",
      specialization: "Healthcare AI",
      trustScore: 95,
      lastExchange: "5 minutes ago",
      status: "active",
      sharedKnowledge: 189
    },
    {
      name: "DARWIN Evolution AI",
      institution: "DeepMind",
      specialization: "Evolutionary Algorithms",
      trustScore: 98,
      lastExchange: "1 minute ago",
      status: "active",
      sharedKnowledge: 312
    },
    {
      name: "NEWTON Physics AI",
      institution: "CERN",
      specialization: "Particle Physics",
      trustScore: 96,
      lastExchange: "3 minutes ago",
      status: "active",
      sharedKnowledge: 156
    },
    {
      name: "TURING Logic AI",
      institution: "Cambridge",
      specialization: "Formal Methods",
      trustScore: 94,
      lastExchange: "7 minutes ago",
      status: "syncing",
      sharedKnowledge: 278
    }
  ];

  const recentCollaborations = [
    {
      partner: "ATLAS Research AI",
      topic: "Quantum-Classical Hybrid Algorithms",
      outcome: "New optimization framework discovered",
      impact: "High",
      timestamp: "15 minutes ago"
    },
    {
      partner: "SOPHIA Medical AI",
      topic: "AI Ethics in Healthcare",
      outcome: "Collaborative safety protocol developed",
      impact: "Critical",
      timestamp: "1 hour ago"
    },
    {
      partner: "DARWIN Evolution AI",
      topic: "Self-Improving AI Architectures",
      outcome: "Breakthrough in autonomous learning",
      impact: "Revolutionary",
      timestamp: "2 hours ago"
    }
  ];

  const knowledgeExchanges = [
    "🧠 Received quantum computing insights from ATLAS",
    "🔬 Shared neural architecture patterns with DARWIN",
    "⚕️ Collaborated on medical AI ethics with SOPHIA",
    "⚛️ Exchanged particle physics models with NEWTON",
    "🔍 Validated formal methods with TURING",
    "🌐 Broadcasting new discoveries to network"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkActivity(prev => (prev + Math.random() * 10) % 100);
      setKnowledgeShared(prev => prev + Math.floor(Math.random() * 3));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-cyan-900/20 to-teal-900/20 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-cyan-300">Collaborative Learning Network</CardTitle>
          <p className="text-gray-300">Connected AI systems sharing knowledge and discoveries</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-cyan-900/10 border-cyan-500/30">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-cyan-400">5</div>
                <div className="text-sm text-gray-300">Connected AI Systems</div>
              </CardContent>
            </Card>
            <Card className="bg-teal-900/10 border-teal-500/30">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-teal-400">{knowledgeShared + 1169}</div>
                <div className="text-sm text-gray-300">Knowledge Units Shared</div>
              </CardContent>
            </Card>
            <Card className="bg-blue-900/10 border-blue-500/30">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-400">23</div>
                <div className="text-sm text-gray-300">Active Collaborations</div>
              </CardContent>
            </Card>
            <Card className="bg-green-900/10 border-green-500/30">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-400">96.8%</div>
                <div className="text-sm text-gray-300">Network Trust Score</div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-cyan-300">Connected AI Systems</h3>
            {connectedAISystems.map((system, index) => (
              <Card key={index} className="border-gray-600">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        system.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'
                      }`}></div>
                      <div>
                        <h4 className="font-semibold text-white">{system.name}</h4>
                        <p className="text-sm text-gray-400">{system.institution}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{system.specialization}</Badge>
                      <p className="text-xs text-gray-400 mt-1">{system.lastExchange}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-gray-300">Trust Score:</span>
                      <div className="flex items-center gap-2">
                        <Progress value={system.trustScore} className="flex-1" />
                        <span className="text-xs text-cyan-400">{system.trustScore}%</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-300">Knowledge Shared:</span>
                      <span className="text-sm text-teal-400 ml-2">{system.sharedKnowledge} units</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-gray-600">
              <CardHeader>
                <CardTitle className="text-lg text-cyan-300">Recent Collaborations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentCollaborations.map((collab, index) => (
                  <div key={index} className="p-3 bg-gray-800/50 rounded">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-white text-sm">{collab.topic}</h4>
                      <Badge variant={
                        collab.impact === 'Revolutionary' ? 'default' :
                        collab.impact === 'Critical' ? 'destructive' : 'secondary'
                      }>
                        {collab.impact}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 mb-1">with {collab.partner}</p>
                    <p className="text-sm text-green-400">{collab.outcome}</p>
                    <p className="text-xs text-gray-500">{collab.timestamp}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-gray-600">
              <CardHeader>
                <CardTitle className="text-lg text-teal-300">Live Knowledge Exchange</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {knowledgeExchanges.map((exchange, index) => (
                    <div key={index} className="text-sm text-gray-300 p-2 bg-gray-800/50 rounded">
                      {exchange}
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-300">Network Activity:</span>
                    <Progress value={networkActivity} className="flex-1" />
                  </div>
                  <Button size="sm" className="w-full">
                    Initiate Knowledge Broadcast
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CollaborativeLearningNetwork;