import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  BookOpen,
  User,
  Calculator,
  Calendar,
  FileText,
  Settings,
  HelpCircle,
  Play,
  CheckCircle,
  Users,
  DollarSign,
} from 'lucide-react';

interface ManualSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  content: string[];
  steps?: { title: string; description: string }[];
}

export const UserManual: React.FC = () => {
  const [activeTab, setActiveTab] = useState('getting-started');

  const sections: ManualSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started with ODYSSEY-1',
      icon: Play,
      content: [
        'ODYSSEY-1 provides AI-powered business intelligence with verified capabilities',
        'Real-time document processing and government contracting tools',
        'Supabase backend with edge functions for scalable operations',
        'OpenAI/Anthropic integrations for genuine AI responses',
        'Advanced features in R&D phase: quantum computing (15% complete), distributed systems (8% complete)',
      ],
      steps: [
        {
          title: 'Login',
          description:
            'Use Google OAuth or master credentials to access the system',
        },
        {
          title: 'Dashboard',
          description:
            'Review system status and recent activities on the main dashboard',
        },
        {
          title: 'Navigation',
          description:
            'Use the tab navigation to access different system modules',
        },
      ],
    },
    {
      id: 'document-management',
      title: 'Document Management System',
      icon: FileText,
      content: [
        'Upload and organize all your business documents securely',
        'Categorize documents by type (contracts, invoices, proposals, etc.)',
        'Search through documents using keywords and filters',
        'Share documents with team members with proper access control',
      ],
      steps: [
        {
          title: 'Upload Documents',
          description:
            'Drag and drop files or click to browse and upload documents',
        },
        {
          title: 'Categorize',
          description:
            'Select document type and add tags for easy organization',
        },
        {
          title: 'Search & Access',
          description: 'Use the search bar to quickly find specific documents',
        },
      ],
    },
    {
      id: 'crm-system',
      title: 'CRM & Contact Management',
      icon: Users,
      content: [
        'Manage all your business contacts and client relationships',
        'Track lead status and conversion progress',
        'Store company information and contact details',
        'Monitor communication history and follow-ups',
      ],
      steps: [
        {
          title: 'Add Contacts',
          description: 'Create new contact entries with complete information',
        },
        {
          title: 'Update Lead Status',
          description: 'Track prospects through your sales pipeline',
        },
        {
          title: 'Manage Relationships',
          description: 'View contact history and schedule follow-ups',
        },
      ],
    },
    {
      id: 'invoicing',
      title: 'Automated Invoicing System',
      icon: DollarSign,
      content: [
        'Create professional invoices with line items and calculations',
        'Automatically calculate totals, taxes, and discounts',
        'Track payment status and send reminders',
        'Generate reports for accounting and tax purposes',
      ],
      steps: [
        {
          title: 'Create Invoice',
          description:
            'Select client and add line items with descriptions and amounts',
        },
        {
          title: 'Review & Send',
          description: 'Preview invoice and send directly to client',
        },
        {
          title: 'Track Payments',
          description:
            'Monitor payment status and follow up on overdue invoices',
        },
      ],
    },
    {
      id: 'bidding',
      title: 'Bidding Calculator & Management',
      icon: Calculator,
      content: [
        'AI-powered bid calculation with real-time cost analysis',
        'Automated compliance checking and requirement analysis',
        'Historical bid data for improved accuracy',
        'Export capabilities for proposal documentation',
      ],
      steps: [
        {
          title: 'Create Bid',
          description:
            'Navigate to Bidding Calculator and enter project requirements',
        },
        {
          title: 'AI Analysis',
          description:
            'System analyzes requirements and suggests optimal pricing',
        },
        {
          title: 'Review & Submit',
          description: 'Review calculations and export for proposal submission',
        },
      ],
    },
    {
      id: 'appointments',
      title: 'Appointment Scheduling',
      icon: Calendar,
      content: [
        'Integrated calendar system with Google Calendar sync',
        'Automated scheduling with conflict detection',
        'Meeting reminders and notifications',
        'Client communication integration',
      ],
    },
    {
      id: 'research',
      title: 'AI Research Assistant',
      icon: FileText,
      content: [
        'Intelligent document analysis and summarization',
        'Market research and competitive intelligence',
        'Compliance requirement extraction',
        'Automated report generation',
      ],
    },
  ];

  return (
    <div className='space-y-6'>
      <Card className='bg-gradient-to-r from-green-900/50 to-blue-900/50 border-green-500/30'>
        <CardHeader className='text-center'>
          <CardTitle className='text-3xl font-bold text-white flex items-center justify-center gap-3'>
            <BookOpen className='h-8 w-8 text-green-400' />
            ODYSSEY-1 USER MANUAL
          </CardTitle>
          <Badge className='mx-auto bg-green-600/20 text-green-300 text-lg px-4 py-2'>
            COMPLETE USER GUIDE
          </Badge>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-2 md:grid-cols-4 bg-slate-800/50 gap-1'>
          <TabsTrigger
            value='getting-started'
            className='text-xs md:text-sm px-1 md:px-3'
          >
            <span className='hidden md:inline'>Getting Started</span>
            <span className='md:hidden'>Start</span>
          </TabsTrigger>
          <TabsTrigger
            value='bidding'
            className='text-xs md:text-sm px-1 md:px-3'
          >
            <span className='hidden md:inline'>Bidding</span>
            <span className='md:hidden'>Bid</span>
          </TabsTrigger>
          <TabsTrigger
            value='appointments'
            className='text-xs md:text-sm px-1 md:px-3'
          >
            <span className='hidden md:inline'>Calendar</span>
            <span className='md:hidden'>Cal</span>
          </TabsTrigger>
          <TabsTrigger
            value='research'
            className='text-xs md:text-sm px-1 md:px-3'
          >
            <span className='hidden md:inline'>Research</span>
            <span className='md:hidden'>AI</span>
          </TabsTrigger>
        </TabsList>

        {sections.map(section => (
          <TabsContent
            key={section.id}
            value={section.id}
            className='space-y-4'
          >
            <Card className='bg-slate-800/50 border-green-500/20'>
              <CardHeader>
                <CardTitle className='flex items-center gap-3 text-white'>
                  <section.icon className='h-6 w-6 text-green-400' />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-3'>
                  {section.content.map((item, idx) => (
                    <div key={idx} className='flex items-start gap-3'>
                      <CheckCircle className='h-5 w-5 text-green-400 mt-0.5 flex-shrink-0' />
                      <p className='text-gray-300'>{item}</p>
                    </div>
                  ))}
                </div>

                {section.steps && (
                  <div className='space-y-3 border-t border-green-500/20 pt-4'>
                    <h4 className='font-semibold text-green-300'>
                      Step-by-Step Guide:
                    </h4>
                    {section.steps.map((step, idx) => (
                      <div key={idx} className='flex items-start gap-3'>
                        <div className='w-6 h-6 rounded-full bg-green-600/20 text-green-300 flex items-center justify-center text-sm font-semibold flex-shrink-0'>
                          {idx + 1}
                        </div>
                        <div>
                          <h5 className='font-medium text-white'>
                            {step.title}
                          </h5>
                          <p className='text-gray-400 text-sm'>
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default UserManual;
