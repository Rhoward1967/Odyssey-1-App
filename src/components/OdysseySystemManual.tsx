import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { BookOpen, Code, Database, Shield, Zap, Brain, Settings, Users } from 'lucide-react';

interface ManualSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  content: string;
  category: string;
}

export const OdysseySystemManual: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('overview');

  const manualSections: ManualSection[] = [
    {
      id: 'overview',
      title: 'System Overview',
      icon: BookOpen,
      category: 'General',
      content: `ODYSSEY-1 is an advanced AI system designed for government contracting automation. Built with React 18, TypeScript, Tailwind CSS, and Supabase backend. Features include automated bidding, compliance checking, cost optimization, and intelligent document generation. The system operates autonomously while maintaining human oversight capabilities.`
    },
    {
      id: 'architecture',
      title: 'Technical Architecture',
      icon: Code,
      category: 'Technical',
      content: `Frontend: React 18 with TypeScript, Tailwind CSS, Vite build system. Backend: Supabase PostgreSQL with Edge Functions, Real-time subscriptions. Authentication: Supabase Auth with Google OAuth. Deployment: Vercel with automatic CI/CD. Component architecture follows modern React patterns with custom hooks and context providers.`
    },
    {
      id: 'database',
      title: 'Database Systems',
      icon: Database,
      category: 'Technical',
      content: `Tables: profiles, bids, bid_specifications, appointments, subscriptions, spending_transactions, chat_messages, media_items. Storage: bid-documents, system-backups, logos, media-workstation. Edge Functions: 18 deployed functions handling payments, communications, AI processing. RLS enabled on all tables.`
    },
    {
      id: 'security',
      title: 'Security Protocols',
      icon: Shield,
      category: 'Security',
      content: `FedRAMP equivalent security standards. Row Level Security on all database operations. Encrypted data transmission. OAuth 2.0 authentication. API key management. Audit logging for all system operations. Compliance with federal data protection requirements.`
    },
    {
      id: 'automation',
      title: 'Automation Engine',
      icon: Zap,
      category: 'Operations',
      content: `Auto-wake on user activity detection. Auto-sleep after 5 minutes inactivity. Intelligent bid monitoring. Automated compliance checking. Cost optimization algorithms. Document generation workflows. Notification systems via Twilio integration.`
    },
    {
      id: 'intelligence',
      title: 'AI Capabilities',
      icon: Brain,
      category: 'Intelligence',
      content: `Machine learning algorithms for bid success prediction. Natural language processing for document analysis. Predictive analytics for cost optimization. Self-learning from user interactions. Autonomous decision-making with human oversight. Continuous system evolution and improvement.`
    },
    {
      id: 'operations',
      title: 'System Operations',
      icon: Settings,
      category: 'Operations',
      content: `24/7 autonomous operation capability. Real-time system monitoring. Automated backup systems. Performance optimization. Resource management. Error handling and recovery. Maintenance scheduling and execution.`
    },
    {
      id: 'user_guide',
      title: 'User Interface',
      icon: Users,
      category: 'User Guide',
      content: `Responsive design for all devices. Intuitive navigation with sidebar menu. Real-time status indicators. Interactive dashboards. Form validation and error handling. Accessibility compliance. Multi-language support preparation.`
    }
  ];

  const categories = [...new Set(manualSections.map(section => section.category))];

  return (
    <div className="space-y-6">
      <Card className="bg-black/40 border-purple-500/30">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-3">
            <BookOpen className="h-6 w-6 text-purple-400" />
            ODYSSEY-1 SYSTEM MANUAL
          </CardTitle>
          <Badge className="mx-auto bg-green-600/20 text-green-300">
            Complete Documentation Available
          </Badge>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 bg-slate-800/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-lg text-white">Sections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {categories.map(category => (
              <div key={category} className="space-y-1">
                <h4 className="text-sm font-semibold text-purple-300">{category}</h4>
                {manualSections
                  .filter(section => section.category === category)
                  .map(section => (
                    <Button
                      key={section.id}
                      variant={activeSection === section.id ? "default" : "ghost"}
                      className="w-full justify-start text-left h-auto py-2"
                      onClick={() => setActiveSection(section.id)}
                    >
                      <section.icon className="h-4 w-4 mr-2" />
                      <span className="text-xs">{section.title}</span>
                    </Button>
                  ))}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 bg-slate-800/50 border-purple-500/20">
          <CardContent className="p-6">
            {manualSections
              .filter(section => section.id === activeSection)
              .map(section => (
                <div key={section.id} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <section.icon className="h-6 w-6 text-purple-400" />
                    <h2 className="text-xl font-bold text-white">{section.title}</h2>
                    <Badge className="bg-purple-600/20 text-purple-300">
                      {section.category}
                    </Badge>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};