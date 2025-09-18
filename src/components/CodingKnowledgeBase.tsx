import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const CodingKnowledgeBase = () => {
  const [activeKnowledge, setActiveKnowledge] = useState(0);
  
  const codingDomains = [
    {
      name: "React & Frontend",
      mastery: 98,
      concepts: ["Hooks", "Context", "Suspense", "Concurrent Features", "Server Components"],
      recentLearning: "React 19 Compiler optimizations"
    },
    {
      name: "AI/ML Frameworks",
      mastery: 95,
      concepts: ["TensorFlow", "PyTorch", "Transformers", "LangChain", "Vector Databases"],
      recentLearning: "Multi-modal AI architectures"
    },
    {
      name: "Backend Systems",
      mastery: 92,
      concepts: ["Node.js", "Python", "Microservices", "GraphQL", "Database Design"],
      recentLearning: "Distributed system patterns"
    },
    {
      name: "DevOps & Cloud",
      mastery: 89,
      concepts: ["Docker", "Kubernetes", "AWS", "CI/CD", "Infrastructure as Code"],
      recentLearning: "Serverless edge computing"
    }
  ];

  const aiKnowledge = [
    {
      category: "Neural Networks",
      depth: 97,
      areas: ["CNNs", "RNNs", "Transformers", "GANs", "Diffusion Models"],
      applications: ["Computer Vision", "NLP", "Generative AI"]
    },
    {
      category: "Machine Learning",
      depth: 94,
      areas: ["Supervised Learning", "Unsupervised Learning", "Reinforcement Learning"],
      applications: ["Predictive Analytics", "Clustering", "Optimization"]
    },
    {
      category: "AI Ethics & Safety",
      depth: 91,
      areas: ["Bias Detection", "Explainable AI", "Privacy Preservation"],
      applications: ["Responsible AI", "Fairness Metrics", "Safety Protocols"]
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveKnowledge(prev => (prev + 1) % codingDomains.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-blue-300">ODYSSEY-1 Technical Knowledge Base</CardTitle>
          <p className="text-gray-300">Comprehensive coding and AI technology mastery</p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="coding" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="coding">Coding Domains</TabsTrigger>
              <TabsTrigger value="ai">AI Knowledge</TabsTrigger>
            </TabsList>
            
            <TabsContent value="coding" className="space-y-4">
              {codingDomains.map((domain, index) => (
                <Card key={index} className={`transition-all duration-300 ${
                  index === activeKnowledge ? 'border-blue-400 bg-blue-900/10' : 'border-gray-600'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-blue-300">{domain.name}</h3>
                      <Badge variant="secondary">{domain.mastery}% Mastery</Badge>
                    </div>
                    <Progress value={domain.mastery} className="mb-3" />
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {domain.concepts.map((concept, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {concept}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-green-400">
                        📚 Currently Learning: {domain.recentLearning}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="ai" className="space-y-4">
              {aiKnowledge.map((knowledge, index) => (
                <Card key={index} className="border-purple-500/30">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-purple-300">{knowledge.category}</h3>
                      <Badge variant="secondary">{knowledge.depth}% Depth</Badge>
                    </div>
                    <Progress value={knowledge.depth} className="mb-3" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-1">Core Areas</h4>
                        <div className="flex flex-wrap gap-1">
                          {knowledge.areas.map((area, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-1">Applications</h4>
                        <div className="flex flex-wrap gap-1">
                          {knowledge.applications.map((app, i) => (
                            <Badge key={i} variant="outline" className="text-xs text-green-400">
                              {app}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CodingKnowledgeBase;