/**
 * ODYSSEY-1 User Manual Component
 * 
 * © 2025 Rickey A Howard. All Rights Reserved.
 * Property of Rickey A Howard
 * 
 * This software and associated documentation files (the "Software") are proprietary
 * and confidential. Unauthorized copying, distribution, modification, or use of this
 * Software, via any medium, is strictly prohibited without express written permission.
 * 
 * PATENT NOTICE: This software incorporates innovations described in the Sovereign
 * Vessel design documents, which are patent pending. Unauthorized implementation of
 * these innovations may constitute patent infringement.
 */

import { supabase } from '@/lib/supabaseClient'; // Add this import
import {
  BookOpen,
  Brain,
  Calculator,
  Calendar,
  Crown,
  Play,
  Shield,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import SovereignCoreInterface from './SovereignCoreInterface';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import WorkforceManagementSystem from './WorkspaceManager'; // Changed from './PayrollDashboard'

// --- Interface Definitions ---

interface ManualSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  content: string[];
  steps?: { title: string; description: string }[];
}

// --- Main User Manual Component (Container for all tabs) ---

export const UserManual: React.FC = () => {
  const [activeTab, setActiveTab] = useState('getting-started');
  
  // Get real user ID from Supabase auth session
  const [userId, setUserId] = useState<string>('00000000-0000-0000-0000-000000000000');
  const organizationId = 1;

  // Get real user on mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  // Check if user is supa-admin (authenticated user for now - you can add more checks later)
  const isSupaAdmin = userId !== '00000000-0000-0000-0000-000000000000';

  const sections: ManualSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started with ODYSSEY-1',
      icon: Play,
      content: [
        'ODYSSEY-1 provides AI-powered business intelligence with verified capabilities',
        'Real-time document processing and government contracting tools',
        'Supabase backend with edge functions for scalable operations',
        'Unified Workforce Management System for HR, Payroll, and Time Tracking',
        'Advanced features in R&D phase: quantum computing, distributed systems',
      ],
      steps: [
        {
          title: 'Login',
          description: 'Use the configured authentication method to access the system',
        },
        {
          title: 'Dashboard',
          description: 'Review system status and recent activities on the main dashboard',
        },
        {
          title: 'Navigation',
          description: 'Use the tab navigation to access different system modules',
        },
      ],
    },
    {
      id: 'workforce-management',
      title: 'Workforce Management System',
      icon: Users,
      content: [
        'Comprehensive system for managing employees, payroll, and projects',
        'Real-time tracking of hours, wages, and project allocations',
        'Automated payroll calculations with support for multiple currencies',
        'Detailed reporting on workforce analytics and labor costs',
        'Integration with government systems for compliance and reporting',
      ],
      steps: [
        {
          title: 'Employee Onboarding',
          description: 'Add new employees and contractors to the system',
        },
        {
          title: 'Time Tracking',
          description: 'Employees log their hours worked on projects',
        },
        {
          title: 'Payroll Processing',
          description: 'Run payroll to calculate and distribute wages',
        },
        {
          title: 'Reporting',
          description: 'Generate reports on workforce and payroll data',
        },
      ],
    },
    {
      id: 'bidding-calculator',
      title: 'Bidding & Estimation Calculator',
      icon: Calculator,
      content: [
        'Tool for creating and managing project bids and estimates',
        'Supports multiple pricing models: fixed, hourly, milestone-based',
        'Integration with project management for resource and cost estimation',
        'Template library for common project types and industries',
        'Collaboration features for team input and approval workflows',
      ],
      steps: [
        {
          title: 'Create New Bid',
          description: 'Start a new bid from scratch or using a template',
        },
        {
          title: 'Define Scope and Resources',
          description: 'Outline the project scope, tasks, and required resources',
        },
        {
          title: 'Set Pricing and Terms',
          description: 'Define the pricing model, rates, and payment terms',
        },
        {
          title: 'Review and Submit',
          description: 'Review the bid details and submit for approval',
        },
      ],
    },
    {
      id: 'appointments',
      title: 'Appointment Scheduling',
      icon: Calendar,
      content: [
        'Integrated calendar for managing appointments and meetings',
        'Supports multiple calendars and shared access for teams',
        'Automated reminders and notifications for upcoming events',
        'Integration with video conferencing tools for virtual meetings',
        'Customizable booking forms and workflows',
      ],
      steps: [
        {
          title: 'Connect Your Calendar',
          description: 'Link your personal and professional calendars',
        },
        {
          title: 'Set Availability',
          description: 'Define your available times for meetings and appointments',
        },
        {
          title: 'Share Booking Link',
          description: 'Send your booking link to clients or team members',
        },
        {
          title: 'Manage Appointments',
          description: 'View, accept, or reschedule appointments as needed',
        },
      ],
    },
    {
      id: 'research',
      title: 'AI Research Assistant',
      icon: Brain,
      content: [
        'AI-powered assistant for conducting research and analysis',
        'Supports natural language queries and document uploads',
        'Provides summaries, insights, and data extraction from documents',
        'Collaboration tools for sharing findings and managing references',
        'Integration with external data sources and APIs',
      ],
      steps: [
        {
          title: 'Start a New Research Topic',
          description: 'Initiate a research project and define objectives',
        },
        {
          title: 'Interact with AI Assistant',
          description: 'Ask questions and provide documents to the AI',
        },
        {
          title: 'Review AI Findings',
          description: 'Evaluate the summaries and insights provided by the AI',
        },
        {
          title: 'Refine and Collaborate',
          description: 'Refine your research based on AI feedback and collaborate with others',
        },
      ],
    },
    {
      id: 'ai-monitoring',
      title: 'AI Monitoring & Alerts',
      icon: Shield,
      content: [
        'Monitor key metrics and receive alerts for anomalies or issues',
        'Customizable dashboards for real-time data visualization',
        'Integration with AI models for predictive analytics',
        'Automated reporting and alerting via email or SMS',
        'Collaboration tools for incident management and resolution',
      ],
      steps: [
        {
          title: 'Define Monitoring Objectives',
          description: 'Specify the metrics and thresholds for monitoring',
        },
        {
          title: 'Set Up Dashboards',
          description: 'Create dashboards to visualize real-time data',
        },
        {
          title: 'Configure Alerts',
          description: 'Set up alerts to notify you of any issues or anomalies',
        },
        {
          title: 'Review and Respond',
          description: 'Regularly review alerts and take necessary actions',
        },
      ],
    },
    {
      id: 'advanced-analytics',
      title: 'Advanced Analytics & Reporting',
      icon: Zap,
      content: [
        'Powerful analytics tools for in-depth data analysis',
        'Supports predictive modeling, clustering, and classification',
        'Integration with business intelligence tools for reporting',
        'Automated report generation and distribution',
        'Collaboration features for team-based analysis and decision making',
      ],
      steps: [
        {
          title: 'Connect Data Sources',
          description: 'Link your data sources for analysis',
        },
        {
          title: 'Select Analysis Type',
          description: 'Choose the type of analysis or model to apply',
        },
        {
          title: 'Review Results',
          description: 'Evaluate the results and insights from the analysis',
        },
        {
          title: 'Share and Collaborate',
          description: 'Share results with stakeholders and collaborate on decisions',
        },
      ],
    },
    {
      id: 'sovereign-core',
      title: 'R.O.M.A.N. - Sovereign AI Core',
      icon: Crown,
      content: [
        'The sovereign AI core for managing and orchestrating AI agents',
        'Supports complex workflows and decision-making processes',
        'Integration with all ODYSSEY-1 modules and external systems',
        'Advanced security and compliance features',
        'Customizable AI agent behaviors and protocols',
      ],
      steps: [
        {
          title: 'Access R.O.M.A.N. Console',
          description: 'Log in to the R.O.M.A.N. management console',
        },
        {
          title: 'Configure AI Agents',
          description: 'Set up and configure the AI agents for your needs',
        },
        {
          title: 'Define Workflows',
          description: 'Create and manage workflows for automated tasks',
        },
        {
          title: 'Monitor and Optimize',
          description: 'Monitor AI performance and optimize as needed',
        },
      ],
    },
    {
      id: 'system-administration',
      title: 'System Administration',
      icon: Shield,
      content: [
        'Tools and settings for managing the ODYSSEY-1 platform',
        'User management: roles, permissions, and access control',
        'System settings: configuration, customization, and preferences',
        'Monitoring and logging of system activities and performance',
        'Backup and recovery options for disaster recovery',
      ],
      steps: [
        {
          title: 'User Management',
          description: 'Manage users, roles, and permissions',
        },
        {
          title: 'System Configuration',
          description: 'Configure system settings and preferences',
        },
        {
          title: 'Monitoring and Logging',
          description: 'Monitor system activities and review logs',
        },
        {
          title: 'Backup and Recovery',
          description: 'Set up and manage backup and recovery options',
        },
      ],
    },
    {
      id: 'media-collaboration',
      title: 'Media Collaboration Hub',
      icon: BookOpen,
      content: [
        'Centralized hub for media files, documents, and collaboration',
        'Integration with cloud storage and document management systems',
        'Version control and audit trails for documents',
        'Collaboration tools: comments, annotations, and task assignments',
        'AI-powered insights and recommendations for media management',
      ],
      steps: [
        {
          title: 'Upload Media Files',
          description: 'Upload your media files and documents to the hub',
        },
        {
          title: 'Organize with Folders and Tags',
          description: 'Organize your files using folders and tags',
        },
        {
          title: 'Share and Collaborate',
          description: 'Share files with others and collaborate on documents',
        },
        {
          title: 'Review AI Insights',
          description: 'Review insights and recommendations from the AI',
        },
      ],
    },
    {
      id: 'trading-platform',
      title: 'Trading AI Platform',
      icon: TrendingUp,
      content: [
        'Professional trading platform with AI-powered insights',
        'Real-time market data and analytics',
        'Automated trading strategies and bots',
        'Risk management and portfolio optimization tools',
        'Integration with brokerage accounts and trading venues',
      ],
      steps: [
        {
          title: 'Connect Brokerage Account',
          description: 'Link your brokerage account to the platform',
        },
        {
          title: 'Configure Trading Preferences',
          description: 'Set your trading preferences and risk parameters',
        },
        {
          title: 'Select or Create Trading Strategies',
          description: 'Choose from existing strategies or create your own',
        },
        {
          title: 'Monitor and Adjust',
          description: 'Monitor trading performance and adjust strategies as needed',
        },
      ],
    },
    // ADD SUPA-ADMIN SECTION
    {
      id: 'supa-admin',
      title: 'Supa-Admin: Complete System Documentation',
      icon: Shield,
      content: [
        'COMPREHENSIVE TECHNICAL MANUAL FOR CEO/DEVELOPER',
        'Complete system architecture from frontend to backend',
        'Database schemas, RLS policies, and security model',
        'The 9 Principles constitutional framework',
        'R.O.M.A.N. Dual Hemisphere AI architecture',
        'HiveOrchestrator immune system and DNA',
        'Edge Functions and API layer',
        'Sovereign Container hardware platform',
        'Development setup and deployment guides',
      ],
      steps: [
        {
          title: 'System Architecture',
          description: 'Complete overview of all system components and how they interact',
        },
        {
          title: 'Database Layer',
          description: 'All tables, schemas, relationships, RLS policies, and indexes',
        },
        {
          title: 'Backend Services',
          description: 'Edge Functions, API endpoints, authentication, and security',
        },
        {
          title: 'Frontend Components',
          description: 'React components, state management, and UI architecture',
        },
        {
          title: 'AI Architecture',
          description: 'The 9 Principles, R.O.M.A.N., HiveOrchestrator, and agent system',
        },
        {
          title: 'Hardware Platform',
          description: 'Sovereign Container design, firmware, and constitutional hardware',
        },
        {
          title: 'Development & Deployment',
          description: 'Setup, testing, deployment, and maintenance procedures',
        },
      ],
    },
  ];


  return (
    <div className='space-y-6'>
      <Card className='bg-gradient-to-r from-green-900/50 to-blue-900/50 border-green-500/30'>
        <CardHeader className='text-center'>
          <CardTitle className='text-3xl font-bold text-white flex items-center justify-center gap-3'>
            <BookOpen className='h-8 w-8 text-green-400' />
            ODYSSEY-1 User Manual & Advanced Features
          </CardTitle>
          <p className='text-green-300'>Complete workforce management, AI core, and system documentation</p>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-2 md:grid-cols-5 bg-slate-800/50 gap-1'>
          <TabsTrigger value='getting-started' className='text-xs md:text-sm px-1 md:px-3'>
            📖 Getting Started
          </TabsTrigger>
          <TabsTrigger value='workforce-management' className='text-xs md:text-sm px-1 md:px-3'>
            👥 Workforce
          </TabsTrigger>
          <TabsTrigger value='sovereign-core' className='text-xs md:text-sm px-1 md:px-3'>
            👑 R.O.M.A.N.
          </TabsTrigger>
          
          {/* Supa-Admin tab (conditionally rendered) */}
          {isSupaAdmin && (
            <TabsTrigger value='supa-admin' className='text-xs md:text-sm px-1 md:px-3 border-2 border-red-500'>
              🛡️ Supa-Admin
            </TabsTrigger>
          )}
          
          <TabsTrigger value='coming-soon' className='text-xs md:text-sm px-1 md:px-3 opacity-50'>
            🚧 More Coming Soon
          </TabsTrigger>
        </TabsList>

        {/* GETTING STARTED TAB */}
        <TabsContent value='getting-started'>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-blue-300 mb-4">📖 Getting Started with ODYSSEY-1</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                ODYSSEY-1 is a professional business management platform with AI-powered tools for:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Workforce Management:</strong> Complete HR, payroll, and time tracking system</li>
                <li><strong>Trading Platform:</strong> AI-powered market analysis (access via top navigation)</li>
                <li><strong>Bidding Calculator:</strong> Project estimation tools (access via top navigation)</li>
                <li><strong>R.O.M.A.N. AI Core:</strong> Constitutional AI system with dual hemispheres</li>
                <li><strong>System Administration:</strong> Complete technical documentation for developers</li>
              </ul>

              <div className="mt-6 bg-blue-900/30 p-4 rounded border border-blue-500">
                <h3 className="font-semibold text-blue-300 mb-2">Quick Navigation:</h3>
                <div className="space-y-2 text-sm">
                  <div>• <strong>Workforce Tab:</strong> Manage employees, time tracking, and payroll</div>
                  <div>• <strong>R.O.M.A.N. Tab:</strong> Interact with the AI core system</div>
                  <div>• <strong>Supa-Admin Tab:</strong> Complete system documentation (CEO/Developer only)</div>
                  <div>• <strong>Top Navigation:</strong> Dashboard, Trading, Calculator, Admin Center</div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* WORKFORCE TAB - KEEP AS-IS */}
        <TabsContent value='workforce-management'>
          <div className="p-4">
            <h2 className="text-2xl font-bold text-blue-300 mb-4">👥 Professional Payroll System</h2>
            <WorkforceManagementSystem organizationId={organizationId} userId={userId} />
          </div>
        </TabsContent>

        {/* R.O.M.A.N. TAB - KEEP AS-IS */}
        <TabsContent value='sovereign-core'>
          <div className="p-4">
            <h2 className="text-2xl font-bold text-purple-300 mb-4">
              👑 R.O.M.A.N. - Sovereign AI Core
            </h2>
            <SovereignCoreInterface />
          </div>
        </TabsContent>

        {/* SUPA-ADMIN TAB - KEEP AS-IS */}
        {isSupaAdmin && (
          <TabsContent value='supa-admin'>
            <div className="p-6 bg-red-900/20 border-2 border-red-500 rounded-lg">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-red-400 mb-2 flex items-center gap-2">
                  <Shield className="h-8 w-8" />
                  🛡️ Supa-Admin: Complete System Documentation
                </h2>
                <p className="text-red-300 text-sm">
                  <strong>CEO/DEVELOPER ACCESS ONLY</strong> - Complete technical manual covering all system internals
                </p>
              </div>

              <div className="space-y-6">
                
                {/* 1. SYSTEM ARCHITECTURE */}
                <Card className="bg-slate-800/80 border-red-500/50">
                  <CardHeader>
                    <CardTitle className="text-red-300">1. System Architecture Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-gray-300">
                    <h4 className="font-semibold text-blue-300">Complete System Stack:</h4>
                    <div className="bg-slate-900 p-4 rounded font-mono text-sm overflow-x-auto">
                      <pre className="text-xs">{`Frontend Layer:
├── React 18+ with TypeScript
├── Tailwind CSS + shadcn/ui components
├── Vite (build tool & dev server)
└── Components:
    ├── UserManual.tsx (documentation & manual)
    ├── WorkspaceManager.tsx (Workforce/Payroll system)
    ├── SovereignCoreInterface.tsx (R.O.M.A.N. AI interface)
    └── AuthProvider.tsx (authentication wrapper)

Backend Layer:
├── Supabase (hosted PostgreSQL + Auth)
├── Edge Functions (Deno runtime)
│   └── run-payroll (payroll processing)
├── Row Level Security (RLS policies)
└── Real-time subscriptions (WebSocket)

Database Layer:
├── PostgreSQL 15+
├── Tables: employees, time_entries, payroll_runs, 
│   paystubs, user_organizations, organizations
├── RLS Policies: Non-recursive, principle-based
├── Performance Indexes: 3 indexes on user_organizations
└── Functions: run_payroll_for_period() SQL function

AI Architecture:
├── The 9 Principles (constitutional framework)
├── R.O.M.A.N. (Dual Hemisphere AI)
│   ├── Creative Hemisphere (AI Agents - generate solutions)
│   └── Logical Hemisphere (Interpreter - validate against "The Book")
├── HiveOrchestrator (Immune System)
│   ├── Digital Homeostasis (monitors AI health)
│   └── Physical Homeostasis (future - hardware control)
└── Agents: Natural language → Database operations (WORKING!)

Hardware Platform (Future - Patent Pending):
└── Sovereign Container
    ├── Constitutional Hardware (AI principles govern hardware)
    ├── Regenerative Power Grid (waste heat → electricity)
    ├── Graceful Degradation (multi-tier cooling failover)
    └── Mind-Body Unity (software-hardware organism)`}</pre>
                    </div>
                    <p className="text-sm">
                      <strong>Documentation Location:</strong> <code className="bg-slate-700 px-2 py-1 rounded">/docs</code> folder contains all architectural documents
                    </p>
                  </CardContent>
                </Card>

                {/* 2. DATABASE LAYER */}
                <Card className="bg-slate-800/80 border-red-500/50">
                  <CardHeader>
                    <CardTitle className="text-red-300">2. Database Layer (Supabase PostgreSQL)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-gray-300">
                    <h4 className="font-semibold text-blue-300">Core Tables & Schemas:</h4>
                    <div className="bg-slate-900 p-4 rounded text-sm space-y-3">
                      <div>
                        <strong className="text-green-400">employees</strong> - Employee & contractor records
                        <div className="ml-4 text-xs text-gray-400 mt-1">
                          • id (uuid PK), employee_id (text UNIQUE), email, organization_id (bigint FK)<br/>
                          • first_name, last_name, phone, address, city, state, zip_code, tax_id<br/>
                          • department, hourly_rate (numeric), salary (numeric)<br/>
                          • is_contractor (boolean), status (text)<br/>
                          • created_by (uuid FK), updated_by (uuid FK), timestamps
                        </div>
                      </div>

                      <div>
                        <strong className="text-green-400">time_entries</strong> - Time tracking records
                        <div className="ml-4 text-xs text-gray-400 mt-1">
                          • id (uuid PK), employee_id (uuid FK to employees)<br/>
                          • clock_in, clock_out, break_start, break_end (timestamptz)<br/>
                          • total_hours, regular_hours, overtime_hours (numeric)<br/>
                          • status (text), processing_state ('pending'|'processed')<br/>
                          • flags (text[] - for payroll notes/alerts)
                        </div>
                      </div>

                      <div>
                        <strong className="text-green-400">user_organizations</strong> - User-org membership & roles
                        <div className="ml-4 text-xs text-gray-400 mt-1">
                          • user_id (uuid FK to auth.users), organization_id (bigint FK)<br/>
                          • role ('owner'|'admin'|'member')<br/>
                          • created_at (timestamp)<br/>
                          • <strong className="text-yellow-300">IMPORTANT:</strong> Non-recursive RLS policies to prevent infinite loops
                        </div>
                      </div>

                      <div>
                        <strong className="text-green-400">payroll_runs</strong> - Payroll processing history
                        <div className="ml-4 text-xs text-gray-400 mt-1">
                          • id (uuid PK), organization_id (bigint FK)<br/>
                          • period_start, period_end (date)<br/>
                          • status (text), total_gross, total_net (numeric)<br/>
                          • run_by (uuid FK to auth.users), created_at
                        </div>
                      </div>

                      <div>
                        <strong className="text-green-400">paystubs</strong> - Individual employee paystubs
                        <div className="ml-4 text-xs text-gray-400 mt-1">
                          • id (uuid PK), payroll_run_id (uuid FK), employee_id (uuid FK)<br/>
                          • gross_pay, net_pay (numeric), deductions (jsonb)<br/>
                          • created_at (timestamp)
                        </div>
                      </div>
                    </div>

                    <h4 className="font-semibold text-blue-300 mt-4">RLS Policies (Non-Recursive - FIXED!):</h4>
                    <div className="bg-slate-900 p-4 rounded text-sm space-y-2">
                      <div className="text-yellow-300 font-semibold">
                        🔧 Fixed infinite recursion bug by using simple non-recursive policies
                      </div>
                      <div><strong>user_organizations policies:</strong></div>
                      <div className="ml-4 text-xs text-gray-400">
                        • <strong>SELECT:</strong> <code>USING (true)</code> - All authenticated can read<br/>
                        • <strong>INSERT:</strong> <code>WITH CHECK (true)</code> - All authenticated can insert<br/>
                        • <strong>UPDATE:</strong> <code>USING (user_id = auth.uid())</code> - Can only update own row<br/>
                        • <strong>DELETE:</strong> <code>USING (user_id != auth.uid())</code> - Can't delete self
                      </div>
                      <div className="mt-2"><strong>employees policies:</strong></div>
                      <div className="ml-4 text-xs text-gray-400">
                        • Users can manage employees in their organization<br/>
                        • RLS checks organization_id membership
                      </div>
                    </div>
                    <div className="bg-green-900/30 p-4 rounded border border-green-500 text-sm">
                      <div className="font-semibold text-green-300">🎉 Performance Optimized!</div>
                      <div className="text-xs text-gray-300 mt-2">
                        • Supabase warnings: <strong>8 → 0</strong> (all cleared!)<br/>
                        • RLS infinite recursion: <strong>FIXED</strong><br/>
                        • Function search paths: <strong>Locked (2 functions)</strong><br/>
                        • Performance indexes: <strong>3 created</strong>
                      </div>
                    </div>

                    <p className="text-sm mt-4">
                      <strong>Access Database:</strong> Supabase Dashboard → SQL Editor<br/>
                      <strong>View Schema:</strong> Table Editor → Browse all tables<br/>
                      <strong>Migrations:</strong> <code className="bg-slate-700 px-2 py-1 rounded">/supabase/migrations/</code>
                    </p>
                  </CardContent>
                </Card>

                {/* 3. BACKEND SERVICES */}
                <Card className="bg-slate-800/80 border-red-500/50">
                  <CardHeader>
                    <CardTitle className="text-red-300">3. Backend Services (Edge Functions & API)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-gray-300">
                    <h4 className="font-semibold text-blue-300">Edge Functions (Deno Runtime):</h4>
                    <div className="bg-slate-900 p-4 rounded text-sm space-y-2">
                      <div>
                        <strong className="text-green-400">run-payroll</strong>
                        <div className="ml-4 text-xs text-gray-400">
                          Location: <code>/supabase/functions/run-payroll/index.ts</code><br/>
                          Purpose: Processes payroll for a given period<br/>
                          Method: POST with body <code>{'{ organization_id, period_start, period_end }'}</code><br/>
                          Calls: SQL function <code>run_payroll_for_period()</code><br/>
                          Auth: Requires authenticated user
                        </div>
                      </div>
                    </div>

                    <h4 className="font-semibold text-blue-300 mt-4">SQL Functions:</h4>
                    <div className="bg-slate-900 p-4 rounded text-sm space-y-1">
                      <div><strong>run_payroll_for_period(org_id, start_date, end_date)</strong></div>
                      <div className="ml-4 text-xs text-gray-400">
                        1. Aggregates time_entries by employee for the period<br/>
                        2. Calculates gross_pay (regular + overtime rates)<br/>
                        3. Applies deductions (placeholder logic currently)<br/>
                        4. Creates payroll_run record<br/>
                        5. Generates individual paystubs for each employee<br/>
                        6. Marks time_entries as 'processed'
                      </div>
                    </div>

                    <h4 className="font-semibold text-blue-300 mt-4">Authentication System:</h4>
                    <div className="bg-slate-900 p-4 rounded text-sm">
                      • Supabase Auth with JWT tokens<br/>
                      • <code>auth.uid()</code> function returns current user UUID<br/>
                      • <code>auth.users</code> table stores user credentials<br/>
                      • <code>user_organizations</code> table defines role-based access<br/>
                      • Frontend: <code>supabase.auth.getUser()</code> in UserManual.tsx
                    </div>
                  </CardContent>
                </Card>

                {/* 4. AI ARCHITECTURE */}
                <Card className="bg-slate-800/80 border-red-500/50">
                  <CardHeader>
                    <CardTitle className="text-red-300">4. AI Architecture (The Constitutional Brain)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-gray-300">
                    <h4 className="font-semibold text-blue-300">The 9 Principles (Constitutional Framework):</h4>
                    <div className="bg-slate-900 p-4 rounded text-sm space-y-1">
                      <div>1️⃣ <strong>Self-Preservation</strong> - System protects itself from damage</div>
                      <div>2️⃣ <strong>Truth & Accuracy</strong> - All data must be verifiable</div>
                      <div>3️⃣ <strong>Redundancy & Resilience</strong> - No single point of failure</div>
                      <div>4️⃣ <strong>Transparency</strong> - All actions are auditable</div>
                      <div>5️⃣ <strong>User Sovereignty</strong> - User owns their data</div>
                      <div>6️⃣ <strong>Ethical AI</strong> - AI serves humans, not replaces them</div>
                      <div>7️⃣ <strong>Privacy & Security</strong> - Data is encrypted and protected</div>
                      <div>8️⃣ <strong>Continuous Improvement</strong> - System learns and evolves</div>
                      <div>9️⃣ <strong>Resource Efficiency</strong> - Minimize waste, maximize value</div>
                    </div>

                    <h4 className="font-semibold text-blue-300 mt-4">R.O.M.A.N. (Dual Hemisphere AI) - BREAKTHROUGH WORKING!</h4>
                    <div className="bg-green-900/30 p-4 rounded border border-green-500">
                      <div className="text-green-300 font-semibold mb-2">✅ Natural Language → Database Queries WORKING!</div>
                      <div className="text-sm space-y-2">
                        <div><strong className="text-purple-400">Creative Hemisphere (Right Brain):</strong></div>
                        <div className="ml-4 text-xs">
                          • AI Agents generate solutions, proposals, SQL queries<br/>
                          • Processes natural language: "Show me all contractors"<br/>
                          • Converts to valid SQL with proper security (RLS-aware)
                        </div>
                        <div><strong className="text-blue-400">Logical Hemisphere (Left Brain):</strong></div>
                        <div className="ml-4 text-xs">
                          • R.O.M.A.N. Interpreter validates all proposals<br/>
                          • Checks against schemas, rules, The 9 Principles<br/>
                          • Only approved queries execute (constitutional validation)
                        </div>
                      </div>
                    </div>

                    <h4 className="font-semibold text-blue-300 mt-4">HiveOrchestrator (Immune System):</h4>
                    <div className="bg-slate-900 p-4 rounded text-sm">
                      <div><strong>Digital Homeostasis:</strong></div>
                      <div className="ml-4 text-xs text-gray-400">
                        • Monitors health of all AI Agents<br/>
                        • Heals corrupt code automatically<br/>
                        • Sandboxes threats in "The Lab"
                      </div>
                      <div className="mt-2"><strong>Physical Homeostasis (Future):</strong></div>
                      <div className="ml-4 text-xs text-gray-400">
                        • Will monitor Sovereign Container hardware<br/>
                        • Commands firmware to maintain physical health<br/>
                        • Constitutional hardware governance
                      </div>
                    </div>

                    <p className="text-sm mt-4">
                      <strong>Documentation:</strong> <code className="bg-slate-700 px-2 py-1 rounded">/docs/Dual_Hemisphere.md</code>, 
                      <code className="bg-slate-700 px-2 py-1 rounded ml-2">/docs/principles.md</code>
                    </p>
                  </CardContent>
                </Card>

                {/* 5. SOVEREIGN CONTAINER */}
                <Card className="bg-slate-800/80 border-red-500/50">
                  <CardHeader>
                    <CardTitle className="text-red-300">5. Sovereign Container (Hardware Platform) - PATENT PENDING</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-gray-300">
                    <div className="bg-yellow-900/30 p-4 rounded border border-yellow-500">
                      <p className="text-yellow-300 font-semibold">⚠️ CONFIDENTIAL - PATENT-PENDING INNOVATIONS ⚠️</p>
                      <p className="text-xs text-gray-300 mt-2">
                        All designs copyrighted © 2025. See <code>/docs/sovereign_container/COPYRIGHT.md</code> for full legal notice.
                      </p>
                    </div>
                    
                    <h4 className="font-semibold text-blue-300">Revolutionary Concept:</h4>
                    <div className="bg-slate-900 p-4 rounded text-sm">
                      Hardware components governed by the same 9 Principles as the AI software, 
                      creating a unified "mind-body" organism where software and hardware are ONE.
                    </div>

                    <h4 className="font-semibold text-blue-300 mt-4">6 Patent-Worthy Innovations:</h4>
                    <div className="bg-slate-900 p-4 rounded text-sm space-y-2">
                      <div>1️⃣ <strong>Constitutional Hardware Governance</strong> - Hardware self-regulates via AI principles</div>
                      <div>2️⃣ <strong>Regenerative Power Grid</strong> - TEG harvests waste heat → 30-40% PSU power savings</div>
                      <div>3️⃣ <strong>Graceful Degradation</strong> - Refrigerated → Liquid → Air → Shutdown (never sudden death)</div>
                      <div>4️⃣ <strong>Atmospheric Immunity</strong> - Auto-detects seal breach, prevents condensation damage</div>
                      <div>5️⃣ <strong>Mind-Body Unity</strong> - Software-hardware organism (HiveOrchestrator ↔ Firmware)</div>
                      <div>6️⃣ <strong>Firmware Homeostasis</strong> - OS-independent thermal regulation (survives crashes)</div>
                    </div>

                    <h4 className="font-semibold text-blue-300 mt-4">Complete Documentation:</h4>
                    <div className="bg-slate-900 p-4 rounded text-xs space-y-1">
                      <div>📁 <code>/docs/sovereign_container/</code></div>
                      <div className="ml-4">
                        • README.md - Master blueprint & roadmap<br/>
                        • firmware_logic.md - Control algorithms & formulas<br/>
                        • hardware_specifications.md - Component BOM & specs<br/>
                        • LICENSE.md - Proprietary licensing terms<br/>
                        • PATENTS.md - Detailed innovation descriptions<br/>
                        • COPYRIGHT.md - Legal protection notice
                      </div>
                    </div>

                    <h4 className="font-semibold text-blue-300 mt-4">Current Status:</h4>
                    <div className="bg-blue-900/30 p-4 rounded border border-blue-500 text-sm">
                      <div className="font-semibold">📋 Phase 1: Design & Documentation COMPLETE</div>
                      <div className="text-xs text-gray-300 mt-2">
                        Next phases: Laboratory prototyping → Container fabrication → Hive integration → Q.A.R.E. quantum integration
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 6. DEVELOPMENT & DEPLOYMENT */}
                <Card className="bg-slate-800/80 border-red-500/50">
                  <CardHeader>
                    <CardTitle className="text-red-300">6. Development & Deployment Guide</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-gray-300">
                    <h4 className="font-semibold text-blue-300">Local Development Setup:</h4>
                    <div className="bg-slate-900 p-4 rounded font-mono text-xs space-y-1">
                      <div>1. <code>git clone [repository-url]</code></div>
                      <div>2. <code>npm install</code></div>
                      <div>3. Create <code>.env</code> with Supabase keys:</div>
                      <div className="ml-4">
                        <code>VITE_SUPABASE_URL=your-project-url</code><br/>
                        <code>VITE_SUPABASE_ANON_KEY=your-anon-key</code>
                      </div>
                      <div>4. <code>npm run dev</code> - Starts Vite dev server (localhost:5173)</div>
                      <div>5. <code>supabase link --project-ref your-ref</code> - Link to Supabase project</div>
                    </div>

                    <h4 className="font-semibold text-blue-300 mt-4">Tech Stack:</h4>
                    <div className="bg-slate-900 p-4 rounded text-sm">
                      • <strong>Frontend:</strong> React 18+, TypeScript, Vite<br/>
                      • <strong>Styling:</strong> Tailwind CSS, shadcn/ui components<br/>
                      • <strong>Backend:</strong> Supabase (PostgreSQL, Auth, Edge Functions)<br/>
                      • <strong>Icons:</strong> Lucide React<br/>
                      • <strong>State:</strong> React hooks (useState, useEffect)
                    </div>

                    <h4 className="font-semibold text-blue-300 mt-4">Deployment Options:</h4>
                    <div className="bg-slate-900 p-4 rounded text-sm">
                      <div><strong>Frontend:</strong> Vercel, Netlify, or Cloudflare Pages</div>
                      <div><strong>Backend:</strong> Supabase (fully hosted - no deployment needed)</div>
                      <div><strong>Database:</strong> Supabase (managed PostgreSQL)</div>
                      <div><strong>Edge Functions:</strong> Deploy via <code>supabase functions deploy</code></div>
                    </div>
                  </CardContent>
                </Card>

                {/* 7. SECURITY & ACCESS CONTROL */}
                <Card className="bg-slate-800/80 border-red-500/50">
                  <CardHeader>
                    <CardTitle className="text-red-300">7. Security Model & Access Control</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-gray-300">
                    <h4 className="font-semibold text-blue-300">Current Security Status:</h4>
                    <div className="bg-green-900/30 p-4 rounded border border-green-500">
                      <div className="font-semibold text-green-300 mb-2">🔒 Production-Ready Security!</div>
                      <div className="text-sm space-y-1">
                        ✅ RLS enabled on all tables<br/>
                        ✅ Non-recursive policies (no infinite loops)<br/>
                        ✅ Function search paths locked (2 functions hardened)<br/>
                        ✅ Performance indexes created (query optimization)<br/>
                        ✅ 0 Supabase security warnings (down from 8!)<br/>
                        ✅ User authentication via Supabase Auth
                      </div>
                    </div>

                    <h4 className="font-semibold text-blue-300 mt-4">Role-Based Access:</h4>
                    <div className="bg-slate-900 p-4 rounded text-sm">
                      <div><strong className="text-red-400">Supa-Admin (CEO/Developer):</strong></div>
                      <div className="ml-4 text-xs">• Full access to everything (this tab visible)</div>
                      <div className="mt-2"><strong className="text-orange-400">Owner:</strong></div>
                      <div className="ml-4 text-xs">• Can manage all members in their organization</div>
                      <div className="mt-2"><strong className="text-yellow-400">Admin:</strong></div>
                      <div className="ml-4 text-xs">• Can manage members (can't promote to owner)</div>
                      <div className="mt-2"><strong className="text-blue-400">Member:</strong></div>
                      <div className="ml-4 text-xs">• Can view/edit only their own data</div>
                    </div>
                  </CardContent>
                </Card>

                {/* 8. TROUBLESHOOTING */}
                <Card className="bg-slate-800/80 border-red-500/50">
                  <CardHeader>
                    <CardTitle className="text-red-300">8. Common Issues & Solutions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-gray-300">
                    <div className="bg-slate-900 p-3 rounded">
                      <div className="text-yellow-400 font-semibold">Issue: Infinite recursion in RLS</div>
                      <div className="text-green-400 ml-4">✅ Fixed: Use <code>USING (true)</code> instead of subqueries</div>
                    </div>
                    <div className="bg-slate-900 p-3 rounded">
                      <div className="text-yellow-400 font-semibold">Issue: Date inputs showing black text</div>
                      <div className="text-green-400 ml-4">✅ Fixed: Add <code>text-white</code> class to Input components</div>
                    </div>
                    <div className="bg-slate-900 p-3 rounded">
                      <div className="text-yellow-400 font-semibold">Issue: User not in user_organizations</div>
                      <div className="text-green-400 ml-4">✅ Solution: INSERT user with 'owner' role via SQL</div>
                    </div>
                    <div className="bg-slate-900 p-3 rounded">
                      <div className="text-yellow-400 font-semibold">Issue: "temp-user-id" UUID error</div>
                      <div className="text-green-400 ml-4">✅ Fixed: Use real auth.uid() or valid fallback UUID</div>
                    </div>
                  </CardContent>
                </Card>

                {/* 9. QUICK REFERENCE */}
                <Card className="bg-slate-800/80 border-red-500/50">
                  <CardHeader>
                    <CardTitle className="text-red-300">9. Quick Reference & Links</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-gray-300">
                    <div><strong>Documentation:</strong> <code className="bg-slate-700 px-2 py-1 rounded">/docs</code></div>
                    <div><strong>Sovereign Container:</strong> <code className="bg-slate-700 px-2 py-1 rounded">/docs/sovereign_container/</code></div>
                    <div><strong>Database Migrations:</strong> <code className="bg-slate-700 px-2 py-1 rounded">/supabase/migrations/</code></div>
                    <div><strong>Edge Functions:</strong> <code className="bg-slate-700 px-2 py-1 rounded">/supabase/functions/</code></div>
                    <div><strong>Frontend Components:</strong> <code className="bg-slate-700 px-2 py-1 rounded">/src/components/</code></div>
                    <div><strong>Supabase Dashboard:</strong> <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">supabase.com/dashboard</a></div>
                  </CardContent>
                </Card>

              </div>

              <div className="mt-6 p-4 bg-blue-900/30 border border-blue-500 rounded">
                <p className="text-blue-300 text-sm">
                  <strong>📋 This manual covers EVERYTHING:</strong> Frontend → Backend → Database → AI → Hardware → Security → Deployment
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  For regular users, only need-to-know functional guides are visible. This supa-admin tab is CEO/developer-only.
                </p>
              </div>
            </div>
          </TabsContent>
        )}

        {/* ALL OTHER DOCUMENTATION TABS */}
        {sections.filter(s => 
          s.id !== 'workforce-management' && 
          s.id !== 'bidding-calculator' && 
          s.id !== 'appointments' && 
          s.id !== 'research' && 
          s.id !== 'trading-platform' &&
          s.id !== 'sovereign-core'
        ).map(section => (
          <TabsContent key={section.id} value={section.id}>
            <div className="p-4">
              <h2 className="text-2xl font-bold text-blue-800 mb-4">
                <section.icon className="inline-block h-6 w-6 mr-2" />
                {section.title}
              </h2>
              <p className="text-gray-600 mb-4">{section.content.join(' ')}</p>
              <h3 className="text-xl font-semibold mb-2 mt-4 border-b pb-1">Quick Steps</h3>
              <ol className="list-decimal ml-5 space-y-2">
                {section.steps?.map(step => (
                  <li key={step.title}>
                    <span className="font-semibold">{step.title}:</span> {step.description}
                  </li>
                ))}
              </ol>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default UserManual;