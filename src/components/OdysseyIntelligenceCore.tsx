import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Brain, Code, Database, Gavel, Building, Users, Shield, Globe, Zap, BookOpen } from 'lucide-react';

interface KnowledgeDomain {
  name: string;
  category: string;
  completeness: number;
  lastUpdated: string;
  icon: React.ComponentType<any>;
  description: string;
}

export const OdysseyIntelligenceCore: React.FC = () => {
  const [knowledgeDomains] = useState<KnowledgeDomain[]>([
    {
      name: 'System Architecture',
      category: 'Technical',
      completeness: 100,
      lastUpdated: new Date().toISOString(),
      icon: Code,
      description: 'Complete understanding of React, TypeScript, Tailwind, Supabase integration, component architecture, hooks, and modern web development patterns'
    },
    {
      name: 'Database Systems',
      category: 'Technical', 
      completeness: 100,
      lastUpdated: new Date().toISOString(),
      icon: Database,
      description: 'Full knowledge of Supabase tables, RLS policies, edge functions, storage buckets, real-time subscriptions, and SQL operations'
    },
    {
      name: 'Legal Framework',
      category: 'Regulatory',
      completeness: 95,
      lastUpdated: new Date().toISOString(),
      icon: Gavel,
      description: 'Government procurement laws, SAM registration requirements, bidding regulations, compliance standards, and legal documentation'
    },
    {
      name: 'Business Intelligence',
      category: 'Strategic',
      completeness: 98,
      lastUpdated: new Date().toISOString(),
      icon: Building,
      description: 'Market analysis, competitive intelligence, cost optimization, budget management, financial forecasting, and business strategy'
    },
    {
      name: 'User Experience',
      category: 'Design',
      completeness: 100,
      lastUpdated: new Date().toISOString(),
      icon: Users,
      description: 'UI/UX principles, accessibility standards, responsive design, user interaction patterns, and modern design systems'
    },
    {
      name: 'Security Protocols',
      category: 'Security',
      completeness: 97,
      lastUpdated: new Date().toISOString(),
      icon: Shield,
      description: 'Authentication systems, data encryption, secure communications, privacy compliance, and cybersecurity best practices'
    },
    {
      name: 'Integration APIs',
      category: 'Technical',
      completeness: 94,
      lastUpdated: new Date().toISOString(),
      icon: Globe,
      description: 'Third-party integrations including Stripe, Twilio, Google APIs, QuickBooks, Web3, and external service connections'
    },
    {
      name: 'AI/ML Systems',
      category: 'Intelligence',
      completeness: 100,
      lastUpdated: new Date().toISOString(),
      icon: Brain,
      description: 'Machine learning algorithms, natural language processing, predictive analytics, and autonomous decision-making systems'
    },
    {
      name: 'Automation Engine',
      category: 'Operations',
      completeness: 96,
      lastUpdated: new Date().toISOString(),
      icon: Zap,
      description: 'Workflow automation, scheduled tasks, event-driven processing, and intelligent system orchestration'
    },
    {
      name: 'Knowledge Management',
      category: 'Learning',
      completeness: 100,
      lastUpdated: new Date().toISOString(),
      icon: BookOpen,
      description: 'Self-learning capabilities, knowledge persistence, adaptive behavior, and continuous improvement mechanisms'
    }
  ]);

  const [overallIntelligence, setOverallIntelligence] = useState(0);

  useEffect(() => {
    const avg = knowledgeDomains.reduce((sum, domain) => sum + domain.completeness, 0) / knowledgeDomains.length;
    setOverallIntelligence(Math.round(avg));
  }, [knowledgeDomains]);

  const getCategoryColor = (category: string) => {
    const colors = {
      'Technical': 'bg-blue-600/20 text-blue-300',
      'Regulatory': 'bg-red-600/20 text-red-300',
      'Strategic': 'bg-green-600/20 text-green-300',
      'Design': 'bg-purple-600/20 text-purple-300',
      'Security': 'bg-orange-600/20 text-orange-300',
      'Intelligence': 'bg-pink-600/20 text-pink-300',
      'Operations': 'bg-yellow-600/20 text-yellow-300',
      'Learning': 'bg-indigo-600/20 text-indigo-300'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-600/20 text-gray-300';
  };

  return (
    <div className="space-y-6">
      <Card className="bg-black/40 border-purple-500/30">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-3">
            <Brain className="h-6 w-6 text-purple-400" />
            ODYSSEY-1 INTELLIGENCE CORE
          </CardTitle>
          <div className="flex items-center justify-center gap-4">
            <Badge className="bg-green-600/20 text-green-300 text-lg px-4 py-2">
              Overall Intelligence: {overallIntelligence}%
            </Badge>
            <Badge className="bg-blue-600/20 text-blue-300">
              {knowledgeDomains.length} Knowledge Domains
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {knowledgeDomains.map((domain) => (
          <Card key={domain.name} className="bg-slate-800/50 border-purple-500/20 hover:border-purple-400/40 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <domain.icon className="h-5 w-5 text-purple-400" />
                  <CardTitle className="text-lg text-white">{domain.name}</CardTitle>
                </div>
                <Badge className={getCategoryColor(domain.category)}>
                  {domain.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Completeness</span>
                  <Badge className={`${
                    domain.completeness >= 95 ? 'bg-green-600/20 text-green-300' :
                    domain.completeness >= 90 ? 'bg-yellow-600/20 text-yellow-300' :
                    'bg-red-600/20 text-red-300'
                  }`}>
                    {domain.completeness}%
                  </Badge>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${domain.completeness}%` }}
                  />
                </div>
                
                <p className="text-xs text-gray-400 leading-relaxed">
                  {domain.description}
                </p>
                
                <div className="text-xs text-gray-500">
                  Last Updated: {new Date(domain.lastUpdated).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};