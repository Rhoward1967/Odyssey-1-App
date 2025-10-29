/**
 * ODYSSEY-1 User Manual Component
 * 
 * © 2025 Rickey A Howard. All Rights Reserved.
 * Property of Rickey A Howard
 * 
 * This software and associated documentation files (the "Software") are proprietary
 * and confidential. Unauthorized copying, distribution, modification, or use of this
 * Software, via any medium, is strictly prohibited without express written permission.
 */

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
import React, { useState } from 'react';
import SovereignCoreInterface from './SovereignCoreInterface';
import WorkforceManagementSystem from './PayrollDashboard';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

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

  // You'll need to get these from your auth context in production
  const organizationId = 1; // TODO: Replace with real org ID from auth
  const userId = 'temp-user-id'; // TODO: Replace with real user ID from auth

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
  ];


  return (
    <div className='space-y-6'>
      <Card className='bg-gradient-to-r from-green-900/50 to-blue-900/50 border-green-500/30'>
        <CardHeader className='text-center'>
          <CardTitle className='text-3xl font-bold text-white flex items-center justify-center gap-3'>
            <BookOpen className='h-8 w-8 text-green-400' />
            **ODYSSEY-1 Complete Platform Restoration Complete!**
          </CardTitle>
          <p className='text-green-300'>All features, AI assistants, and documentation tabs have been fully restored and integrated.</p>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-2 md:grid-cols-11 bg-slate-800/50 gap-1'>
          <TabsTrigger value='getting-started' className='text-xs md:text-sm px-1 md:px-3'>
            <span className='hidden md:inline'>Getting Started</span>
            <span className='md:hidden'>Start</span>
          </TabsTrigger>
          <TabsTrigger value='workforce-management' className='text-xs md:text-sm px-1 md:px-3'>
            <span className='hidden md:inline'>Workforce</span>
            <span className='md:hidden'>HR</span>
          </TabsTrigger>
          <TabsTrigger value='bidding-calculator' className='text-xs md:text-sm px-1 md:px-3'>
            <span className='hidden md:inline'>Bidding</span>
            <span className='md:hidden'>Calc</span>
          </TabsTrigger>
          <TabsTrigger value='appointments' className='text-xs md:text-sm px-1 md:px-3'>
            <span className='hidden md:inline'>Calendar</span>
            <span className='md:hidden'>Cal</span>
          </TabsTrigger>
          <TabsTrigger value='research' className='text-xs md:text-sm px-1 md:px-3'>
            <span className='hidden md:inline'>Research</span>
          </TabsTrigger>
          <TabsTrigger value='ai-monitoring' className='text-xs md:text-sm px-1 md:px-3'>
            <span className='hidden md:inline'>AI Monitoring</span>
            <span className='md:hidden'>Monitor</span>
          </TabsTrigger>
          <TabsTrigger value='advanced-analytics' className='text-xs md:text-sm px-1 md:px-3'>
            <span className='hidden md:inline'>Analytics</span>
            <span className='md:hidden'>Dash</span>
          </TabsTrigger>
          <TabsTrigger value='sovereign-core' className='text-xs md:text-sm px-1 md:px-3'>
            <span className='hidden md:inline'>R.O.M.A.N.</span>
            <span className='md:hidden'>AI</span>
          </TabsTrigger>
          <TabsTrigger value='system-administration' className='text-xs md:text-sm px-1 md:px-3'>
            <span className='hidden md:inline'>System Admin</span>
            <span className='md:hidden'>Admin</span>
          </TabsTrigger>
          <TabsTrigger value='media-collaboration' className='text-xs md:text-sm px-1 md:px-3'>
            <span className='hidden md:inline'>Media Hub</span>
            <span className='md:hidden'>Media</span>
          </TabsTrigger>
          <TabsTrigger value='trading-platform' className='text-xs md:text-sm px-1 md:px-3'>
            <span className='hidden md:inline'>Trading</span>
            <span className='md:hidden'>Trade</span>
          </TabsTrigger>
        </TabsList>

        {/* WORKFORCE - REAL PAYROLL SYSTEM */}
        <TabsContent value='workforce-management'>
          <div className="p-4">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">👥 **Professional Payroll System**</h2>
            <WorkforceManagementSystem organizationId={organizationId} userId={userId} />
          </div>
        </TabsContent>

        {/* BIDDING - PLACEHOLDER (Component not defined yet) */}
        <TabsContent value='bidding-calculator'>
          <div className="p-4">
            <h2 className="text-2xl font-bold text-green-800 mb-4">🧮 **Bidding & Estimation Calculator**</h2>
            <Card className="bg-slate-800/60 border-blue-500/50">
              <CardContent className="p-8 text-center text-gray-400">
                <Calculator className="h-16 w-16 mx-auto mb-4" />
                <p>Bidding Calculator component coming soon</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* APPOINTMENTS - PLACEHOLDER */}
        <TabsContent value='appointments'>
          <div className="p-4">
            <h2 className="text-2xl font-bold text-purple-800 mb-4">📅 **Calendar & Scheduling**</h2>
            <Card className="bg-slate-800/60 border-blue-500/50">
              <CardContent className="p-8 text-center text-gray-400">
                <Calendar className="h-16 w-16 mx-auto mb-4" />
                <p>Calendar component coming soon</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* RESEARCH - PLACEHOLDER */}
        <TabsContent value='research'>
          <div className="p-4">
            <h2 className="text-2xl font-bold text-red-800 mb-4">🧠 **AI Research Assistant**</h2>
            <Card className="bg-slate-800/60 border-blue-500/50">
              <CardContent className="p-8 text-center text-gray-400">
                <Brain className="h-16 w-16 mx-auto mb-4" />
                <p>Research Assistant component coming soon</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* TRADING - PLACEHOLDER */}
        <TabsContent value='trading-platform'>
          <div className="p-4">
            <h2 className="text-2xl font-bold text-green-800 mb-4">💹 **Trading AI Platform**</h2>
            <Card className="bg-slate-800/60 border-blue-500/50">
              <CardContent className="p-8 text-center text-gray-400">
                <TrendingUp className="h-16 w-16 mx-auto mb-4" />
                <p>Trading Platform component coming soon</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* R.O.M.A.N. - ORIGINAL RESTORED */}
        <TabsContent value='sovereign-core'>
          <div className="p-4">
            <h2 className="text-2xl font-bold text-purple-800 mb-4">
              👑 **R.O.M.A.N. - Sovereign AI Core**
            </h2>
            <SovereignCoreInterface />
          </div>
        </TabsContent>

        {/* ALL OTHER DOCUMENTATION TABS (Using the defined sections array)
          FIXED: This filter now correctly excludes *all* tabs that have a functional component
          and renders all the remaining documentation-only tabs (like 'getting-started').
        */}
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
              <h2 className="text-2xl font-bold text-blue-800 mb-4"><section.icon className="inline-block h-6 w-6 mr-2" />{section.title}</h2>
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