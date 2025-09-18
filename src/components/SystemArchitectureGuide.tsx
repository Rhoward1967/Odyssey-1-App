import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Server, Database, Code, Zap, Shield, Network, 
  Layers, GitBranch, Bot, Eye, FileText 
} from 'lucide-react';

export const SystemArchitectureGuide: React.FC = () => {
  const architectureComponents = [
    {
      name: 'Frontend Layer',
      icon: Code,
      description: 'React 18 + TypeScript + Tailwind CSS',
      details: [
        '200+ React components with TypeScript',
        'Custom hooks for state management',
        'Real-time UI updates via Supabase subscriptions',
        'Responsive design with mobile-first approach',
        'Advanced form validation and error handling'
      ]
    },
    {
      name: 'Backend Services',
      icon: Server,
      description: 'Supabase Edge Functions + PostgreSQL',
      details: [
        '23 deployed Edge Functions for serverless computing',
        'PostgreSQL database with 12 tables',
        'Real-time subscriptions for live updates',
        'Row Level Security (RLS) on all tables',
        'Automated backup systems'
      ]
    },
    {
      name: 'AI Processing Layer',
      icon: Bot,
      description: 'Multi-model AI integration',
      details: [
        'Anthropic Claude for advanced reasoning',
        'Hugging Face models for specialized tasks',
        'Custom ML pipelines for bid analysis',
        'Computer vision for document processing',
        'NLP for requirement extraction'
      ]
    },
    {
      name: 'Security Framework',
      icon: Shield,
      description: 'Enterprise-grade security',
      details: [
        'OAuth 2.0 with Google integration',
        'JWT token management',
        'Encrypted data transmission',
        'Audit logging for all operations',
        'FedRAMP-equivalent standards'
      ]
    }
  ];

  const dataFlow = [
    { step: 1, process: 'User Input', description: 'Form submission or system interaction' },
    { step: 2, process: 'Validation', description: 'Client-side and server-side validation' },
    { step: 3, process: 'AI Processing', description: 'Intelligent analysis and recommendations' },
    { step: 4, process: 'Database Update', description: 'Secure data persistence with RLS' },
    { step: 5, process: 'Real-time Sync', description: 'Live updates to all connected clients' }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <Layers className="h-6 w-6 text-blue-400" />
            System Architecture Guide
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {architectureComponents.map((component, idx) => (
          <Card key={idx} className="bg-slate-800/50 border-blue-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <component.icon className="h-5 w-5 text-blue-400" />
                {component.name}
              </CardTitle>
              <p className="text-blue-300 text-sm">{component.description}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {component.details.map((detail, detailIdx) => (
                  <li key={detailIdx} className="flex items-start gap-2 text-gray-300 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                    {detail}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-800/50 border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <GitBranch className="h-5 w-5 text-blue-400" />
            Data Flow Architecture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-between items-center gap-4">
            {dataFlow.map((flow, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-blue-600/20 border-2 border-blue-400 flex items-center justify-center text-blue-300 font-bold mb-2">
                  {flow.step}
                </div>
                <h4 className="font-semibold text-white text-sm">{flow.process}</h4>
                <p className="text-gray-400 text-xs mt-1 max-w-24">{flow.description}</p>
                {idx < dataFlow.length - 1 && (
                  <div className="hidden md:block w-8 h-0.5 bg-blue-400/50 mt-4" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};