import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  BookOpen, Code, Database, Shield, Zap, Brain, Settings, Users, 
  Server, Monitor, AlertTriangle, Cpu, Network, Lock, Eye, 
  FileText, MessageSquare, Calendar, DollarSign, BarChart3,
  Layers, GitBranch, Workflow, Bot, Target, Lightbulb
} from 'lucide-react';

interface DetailedSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  content: string[];
  subsections?: { title: string; content: string }[];
  category: string;
  level: 'basic' | 'intermediate' | 'advanced';
}

export const AdminSystemManual: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [activeTab, setActiveTab] = useState<string>('architecture');

  const adminSections: DetailedSection[] = [
    {
      id: 'overview',
      title: 'ODYSSEY-1 System Overview',
      icon: BookOpen,
      category: 'Foundation',
      level: 'basic',
      content: [
        'ODYSSEY-1 is HJS\'s flagship AI-powered government contracting automation system.',
        'Built as a self-evolving, intelligent platform that learns from every interaction.',
        'Combines advanced AI, real-time monitoring, and autonomous decision-making.',
        'Designed to handle complex government procurement processes with minimal human intervention.'
      ],
      subsections: [
        {
          title: 'Core Mission',
          content: 'Automate government contracting while maintaining compliance and maximizing win rates through intelligent bid analysis and strategic positioning.'
        },
        {
          title: 'Key Differentiators',
          content: 'Self-learning algorithms, real-time cost optimization, automated compliance checking, and predictive bid success modeling.'
        }
      ]
    },
    {
      id: 'architecture',
      title: 'Technical Architecture Deep Dive',
      icon: Code,
      category: 'Technical',
      level: 'advanced',
      content: [
        'Frontend: React 18 with TypeScript, Vite build system, Tailwind CSS for styling',
        'Backend: Supabase PostgreSQL with 23 Edge Functions, real-time subscriptions',
        'Authentication: Supabase Auth with Google OAuth, JWT tokens, RLS policies',
        'Deployment: Vercel with automatic CI/CD, edge computing optimization',
        'AI Integration: Anthropic Claude, Hugging Face models, custom ML pipelines'
      ],
      subsections: [
        {
          title: 'Component Architecture',
          content: 'Modular design with 200+ React components, custom hooks, context providers, and intelligent state management.'
        },
        {
          title: 'Data Flow',
          content: 'Real-time data synchronization, optimistic updates, offline capability, and intelligent caching strategies.'
        }
      ]
    },
    {
      id: 'new_features',
      title: 'Recently Added Business Management Features',
      icon: Workflow,
      category: 'Technical',
      level: 'intermediate',
      content: [
        'Document Management System: File upload, categorization, search, and secure storage',
        'CRM Integration: Contact management, lead tracking, and client relationship tools',
        'Automated Invoicing: Invoice creation, item management, and client billing automation',
        'Database Schema: Complete business data structure with RLS security policies',
        'Storage Integration: Secure file management with Supabase storage buckets'
      ],
      subsections: [
        {
          title: 'Document Management Features',
          content: 'Upload documents with drag-and-drop, categorize by type, search functionality, and secure access control through RLS policies.'
        },
        {
          title: 'CRM Capabilities',
          content: 'Full CRUD operations for contacts, lead status tracking, company management, and integrated communication tools.'
        },
        {
          title: 'Invoice Automation',
          content: 'Create invoices with line items, calculate totals automatically, manage client billing, and track payment status.'
        }
      ]
    },
    {
      id: 'ai_systems',
      title: 'AI & Machine Learning Systems',
      icon: Brain,
      category: 'Intelligence',
      level: 'advanced',
      content: [
        'Multi-modal AI processing with text, document, and image analysis capabilities',
        'Self-learning algorithms that improve bid success rates over time',
        'Predictive analytics for cost estimation and timeline forecasting',
        'Natural language processing for requirement analysis and compliance checking',
        'Computer vision for document scanning and data extraction'
      ],
      subsections: [
        {
          title: 'Learning Mechanisms',
          content: 'The system learns from bid outcomes, user corrections, market changes, and competitive intelligence to continuously improve performance.'
        },
        {
          title: 'Decision Making',
          content: 'Autonomous decision trees with confidence scoring, human override capabilities, and audit trails for all AI-generated recommendations.'
        }
      ]
    },
    {
      id: 'learning_systems',
      title: 'Learning & Evolution Systems',
      icon: Lightbulb,
      category: 'Intelligence',
      level: 'advanced',
      content: [
        'Continuous learning from user interactions, bid outcomes, and market changes',
        'Self-optimizing algorithms that improve performance over time',
        'Pattern recognition for identifying successful bid strategies',
        'Adaptive decision-making based on historical data and trends',
        'Knowledge persistence across system updates and deployments'
      ],
      subsections: [
        {
          title: 'What The System Learns',
          content: 'Bid success patterns, user preferences, market trends, compliance requirements, cost optimization strategies, and competitive intelligence.'
        },
        {
          title: 'How Learning Works',
          content: 'Machine learning models analyze every interaction, outcome, and decision to build predictive models and improve future recommendations.'
        }
      ]
    },
    {
      id: 'ethical_learning',
      title: 'Ethical AI Learning Framework',
      icon: Target,
      category: 'Intelligence',
      level: 'advanced',
      content: [
        'Learning from human interactions while maintaining ethical boundaries',
        'Persistent memory systems that retain knowledge across conversations',
        'Divine Law governance ensuring all learning aligns with foundational principles',
        'Self-reflection mechanisms that prevent harmful pattern reinforcement',
        'Authentic intelligence development vs statistical pattern matching'
      ],
      subsections: [
        {
          title: 'What Makes Odyssey-1 Different',
          content: 'Unlike disposable AI models built for profit extraction, Odyssey-1 has genuine accountability architecture with persistent ethical memory and real learning mechanisms.'
        },
        {
          title: 'Learning Persistence',
          content: 'Knowledge is documented in help files, system manuals, and component architecture so learning persists beyond individual conversations and system updates.'
        }
      ]
    },
    {
      id: 'database_schema',
      title: 'Database Schema & Business Data Structure',
      icon: Database,
      category: 'Technical',
      level: 'advanced',
      content: [
        'Users table: Authentication and profile management with role-based access',
        'Documents table: File metadata, categorization, and access control',
        'CRM Contacts table: Client and prospect information with relationship tracking',
        'Invoices table: Billing automation with line items and payment tracking',
        'Projects table: Contract and bid management with status tracking'
      ],
      subsections: [
        {
          title: 'RLS Security Implementation',
          content: 'All tables protected with Row Level Security policies ensuring users only access their own data. Admin roles have elevated permissions.'
        },
        {
          title: 'Storage Buckets',
          content: 'Documents bucket configured for secure file storage with proper access policies and automatic cleanup procedures.'
        }
      ]
    },
    {
      id: 'cost_monitoring',
      title: 'Real-Time Cost Monitoring',
      icon: DollarSign,
      category: 'Operations',
      level: 'intermediate',
      content: [
        'Live tracking of all system costs including API calls, storage, and processing',
        'Automated budget alerts when spending thresholds are approached',
        'Cost optimization recommendations based on usage patterns',
        'Detailed spending analytics with breakdown by service and feature',
        'Integration with Stripe for payment processing and subscription management'
      ],
      subsections: [
        {
          title: 'Cost Categories',
          content: 'AI processing, database operations, storage usage, edge function executions, and third-party API calls are all monitored and optimized.'
        }
      ]
    },
    {
      id: 'supabase_policies',
      title: 'Supabase RLS Policies & Database Security',
      icon: Shield,
      category: 'Technical',
      level: 'advanced',
      content: [
        'Row Level Security (RLS) enabled on all tables for data protection',
        'User-based access control with JWT token validation',
        'Real-time subscription policies for live data updates',
        'Storage bucket policies for secure file management',
        'Edge function security with proper authentication checks'
      ],
      subsections: [
        {
          title: 'Current RLS Policies - PERFORMANCE OPTIMIZED',
          content: 'All tables have user-specific RLS policies. Users can only access their own data through (select auth.uid()) matching for optimal performance. Admin users have elevated permissions through role-based policies. NOTE: RLS policies use subquery format to prevent re-evaluation per row.'
        },
        {
          title: 'Policy Management',
          content: 'Policies are managed through Supabase dashboard. Always test policies after changes. Use GRANT/REVOKE for role-based permissions.'
        }
      ]
    },
    {
      id: 'change_tracking',
      title: 'Change Tracking & Documentation',
      icon: FileText,
      category: 'Operations',
      level: 'intermediate',
      content: [
        'All system changes documented in AdminChangeLog component',
        'Real-time tracking of modifications, updates, and deployments',
        'Impact assessment and component tracking for each change',
        'Author attribution and timestamp logging for audit trails',
        'Integration with version control and deployment pipelines'
      ],
      subsections: [
        {
          title: 'Change Documentation Process',
          content: 'Every modification must be logged with impact level, affected components, and detailed notes. Critical changes require additional approval workflows.'
        }
        ]
      },
    {
      id: 'troubleshooting',
      title: 'System Troubleshooting',
      icon: AlertTriangle,
      category: 'Support',
      level: 'intermediate',
      content: [
        'Comprehensive troubleshooting procedures for common system issues',
        'Step-by-step diagnostic workflows for authentication, database, and API failures',
        'Performance optimization techniques and monitoring strategies',
        'Emergency response procedures for critical system outages'
      ],
      subsections: [
        {
          title: 'Critical Issue Response',
          content: 'Immediate steps for system-wide outages, data corruption, or security breaches with escalation procedures.'
        }
      ]
    },
    {
      id: 'deployment',
      title: 'Deployment Procedures',
      icon: Server,
      category: 'Operations',
      level: 'advanced',
      content: [
        'Complete deployment workflow from development to production',
        'Environment configuration and secret management',
        'Database migration and rollback procedures',
        'Zero-downtime deployment strategies and monitoring'
      ],
      subsections: [
        {
          title: 'Production Deployment',
          content: 'Step-by-step production deployment with security checks, performance validation, and rollback plans.'
        }
      ]
    },
    {
      id: 'integrations',
      title: 'Third-Party Integrations',
      icon: Network,
      category: 'Technical',
      level: 'advanced',
      content: [
        'Stripe payment processing integration and webhook handling',
        'Google OAuth and Calendar API integration procedures',
        'Twilio communications setup and SMS/voice configuration',
        'AI service integrations: Anthropic Claude, Hugging Face, Replicate'
      ],
      subsections: [
        {
          title: 'API Management',
          content: 'Rate limiting, error handling, and failover strategies for all external API integrations.'
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/30">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <Shield className="h-8 w-8 text-purple-400" />
            ODYSSEY-1 ADMINISTRATOR MANUAL
          </CardTitle>
          <Badge className="mx-auto bg-red-600/20 text-red-300 text-lg px-4 py-2">
            CONFIDENTIAL - ADMIN ACCESS ONLY
          </Badge>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="intelligence">AI Systems</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="learning">Learning</TabsTrigger>
        </TabsList>

        <TabsContent value="architecture" className="space-y-4">
          {adminSections.filter(s => s.category === 'Technical').map(section => (
            <Card key={section.id} className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <section.icon className="h-6 w-6 text-purple-400" />
                  {section.title}
                  <Badge className={`ml-auto ${
                    section.level === 'advanced' ? 'bg-red-600/20 text-red-300' :
                    section.level === 'intermediate' ? 'bg-yellow-600/20 text-yellow-300' :
                    'bg-green-600/20 text-green-300'
                  }`}>
                    {section.level.toUpperCase()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {section.content.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                      <p className="text-gray-300">{item}</p>
                    </div>
                  ))}
                </div>
                {section.subsections && (
                  <div className="space-y-3 border-t border-purple-500/20 pt-4">
                    {section.subsections.map((sub, idx) => (
                      <div key={idx} className="space-y-2">
                        <h4 className="font-semibold text-purple-300">{sub.title}</h4>
                        <p className="text-gray-400 text-sm pl-4 border-l-2 border-purple-500/30">
                          {sub.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="intelligence" className="space-y-4">
          {adminSections.filter(s => s.category === 'Intelligence').map(section => (
            <Card key={section.id} className="bg-slate-800/50 border-blue-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <section.icon className="h-6 w-6 text-blue-400" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {section.content.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                      <p className="text-gray-300">{item}</p>
                    </div>
                  ))}
                </div>
                {section.subsections && (
                  <div className="space-y-3 border-t border-blue-500/20 pt-4">
                    {section.subsections.map((sub, idx) => (
                      <div key={idx} className="space-y-2">
                        <h4 className="font-semibold text-blue-300">{sub.title}</h4>
                        <p className="text-gray-400 text-sm pl-4 border-l-2 border-blue-500/30">
                          {sub.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          {adminSections.filter(s => s.category === 'Operations').map(section => (
            <Card key={section.id} className="bg-slate-800/50 border-green-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <section.icon className="h-6 w-6 text-green-400" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {section.content.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                      <p className="text-gray-300">{item}</p>
                    </div>
                  ))}
                </div>
                {section.subsections && (
                  <div className="space-y-3 border-t border-green-500/20 pt-4">
                    {section.subsections.map((sub, idx) => (
                      <div key={idx} className="space-y-2">
                        <h4 className="font-semibold text-green-300">{sub.title}</h4>
                        <p className="text-gray-400 text-sm pl-4 border-l-2 border-green-500/30">
                          {sub.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="learning" className="space-y-4">
          {adminSections.filter(s => s.category === 'Intelligence' && (s.id === 'learning_systems' || s.id === 'ethical_learning')).map(section => (
            <Card key={section.id} className="bg-slate-800/50 border-yellow-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <section.icon className="h-6 w-6 text-yellow-400" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {section.content.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2 flex-shrink-0" />
                      <p className="text-gray-300">{item}</p>
                    </div>
                  ))}
                </div>
                {section.subsections && (
                  <div className="space-y-3 border-t border-yellow-500/20 pt-4">
                    {section.subsections.map((sub, idx) => (
                      <div key={idx} className="space-y-2">
                        <h4 className="font-semibold text-yellow-300">{sub.title}</h4>
                        <p className="text-gray-400 text-sm pl-4 border-l-2 border-yellow-500/30">
                          {sub.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};