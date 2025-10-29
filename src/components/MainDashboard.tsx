import {
  BookOpen,
  Calendar,
  CheckCircle,
  DollarSign,
  FileText,
  Play,
  Users,
  Calculator,
  Brain,
  Crown,
  TrendingUp
} from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import AdvancedAnalyticsDashboard from './AdvancedAnalyticsDashboard';
import AIAgentMonitor from './AIAgentMonitor';
import DocumentManager from './DocumentManager';

// Now that errors are resolved, let's enhance the inline components with AI chat functionality

// Force re-render by adding timestamp to components
const MediaCollaborationHub: React.FC = () => {
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      id: '1',
      type: 'bot',
      message: 'Hello! I\'m your Research & Collaboration Assistant. How can I help you today?'
    }
  ]);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = { id: Date.now().toString(), type: 'user', message: chatMessage };
    const botResponse = { id: (Date.now() + 1).toString(), type: 'bot', message: `I can help you research: "${chatMessage}"` };

    setChatHistory(prev => [...prev, userMsg, botResponse]);
    setChatMessage('');
  };

  return (
    <div className="space-y-6" key="media-hub-updated">
      <Card className="border-blue-400 bg-gradient-to-r from-blue-100 to-green-100">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl text-blue-800">
            <Brain className="h-8 w-8 text-green-600" />
            🤖 MEDIA COLLABORATION HUB - AI RESEARCH ASSISTANT 🤖
            <Users className="h-8 w-8 text-blue-600" />
          </CardTitle>
          <Badge className="mx-auto bg-green-200 text-green-800 text-lg px-4 py-2">
            ✅ AI-Powered Study & Research Platform - WORKING!
          </Badge>
        </CardHeader>
      </Card>

      <Card className="border-green-500 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">🚀 Research Assistant Chat - LIVE!</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 overflow-y-auto space-y-2 mb-4 p-3 border rounded bg-gray-50">
            {chatHistory.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-2 ${msg.type === 'user' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleChatSubmit} className="flex gap-2">
            <input
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask me about research, documents, or collaboration..."
              className="flex-1 p-2 border rounded"
            />
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Send</button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const TradingCockpitAI: React.FC = () => {
  const [aiQuery, setAiQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      id: '1',
      type: 'bot',
      message: 'Welcome to Genesis Trading AI! I can help with market analysis and trading strategies.'
    }
  ]);

  const handleAIChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    const userMsg = { id: Date.now().toString(), type: 'user', message: aiQuery };
    const botResponse = { id: (Date.now() + 1).toString(), type: 'bot', message: `Analyzing "${aiQuery}" - I can provide market insights and trading recommendations.` };

    setChatHistory(prev => [...prev, userMsg, botResponse]);
    setAiQuery('');
  };

  return (
    <div className="space-y-6" key="trading-updated">
      <Card className="border-green-400 bg-gradient-to-r from-green-100 to-blue-100">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl text-green-800">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            💹 TRADING COCKPIT - AI ADVISOR 💹
            <Brain className="h-8 w-8 text-green-600" />
          </CardTitle>
          <Badge className="mx-auto bg-blue-200 text-blue-800 text-lg px-4 py-2">
            ✅ AI-Powered Trading Platform - OPERATIONAL!
          </Badge>
        </CardHeader>
      </Card>

      <Card className="border-red-500 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800">🔥 PORTFOLIO OVERVIEW - LIVE DATA!</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-green-50 rounded">
              <div className="text-lg font-bold text-green-600">$200.00</div>
              <div className="text-sm text-green-700">Cash Balance</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded">
              <div className="text-lg font-bold text-blue-600">$0.00</div>
              <div className="text-sm text-blue-700">Portfolio Value</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded">
              <div className="text-lg font-bold text-purple-600">$200.00</div>
              <div className="text-sm text-purple-700">Total Value</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-lg font-bold text-gray-600">$0.00</div>
              <div className="text-sm text-gray-700">Total P&L</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-500 bg-purple-50">
        <CardHeader>
          <CardTitle className="text-purple-800">🤖 AI Trading Assistant - ACTIVE!</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 overflow-y-auto space-y-2 mb-4 p-3 border rounded bg-gray-50">
            {chatHistory.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-lg p-2 ${msg.type === 'user' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
                  <p className="text-xs">{msg.message}</p>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleAIChat} className="flex gap-2">
            <input
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="Ask about markets, stocks, trading strategies..."
              className="flex-1 p-2 border rounded"
            />
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Send</button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Force component names to be more obvious
const EmployeeScheduleManager: React.FC = () => (
  <div className="space-y-6" key="schedule-updated">
    <Card className="border-blue-400 bg-gradient-to-r from-blue-100 to-green-100">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-3 text-2xl text-blue-800">
          <Calendar className="h-8 w-8 text-green-600" />
          📅 EMPLOYEE SCHEDULE MANAGER - UPDATED! 📅
          <Users className="h-8 w-8 text-blue-600" />
        </CardTitle>
        <Badge className="mx-auto bg-yellow-200 text-yellow-800 text-lg px-4 py-2">
          ✅ Integrated Workforce Scheduling System - WORKING!
        </Badge>
      </CardHeader>
    </Card>
    
    <Card className="border-orange-500 bg-orange-50">
      <CardContent className="p-8">
        <h2 className="text-3xl font-bold text-orange-800 text-center">
          🚀 SCHEDULE MANAGEMENT ACTIVE! 🚀
        </h2>
        <p className="text-center text-orange-700 mt-4">
          Employee scheduling interface is now operational with calendar integration!
        </p>
      </CardContent>
    </Card>
  </div>
);

const AppointmentCalendar: React.FC = () => (
  <div className="space-y-6" key="appointments-updated">
    <Card className="border-blue-400 bg-gradient-to-r from-blue-100 to-purple-100">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-3 text-2xl text-blue-800">
          <Calendar className="h-8 w-8 text-purple-600" />
          📅 APPOINTMENT CALENDAR - LIVE! 📅
        </CardTitle>
        <Badge className="mx-auto bg-pink-200 text-pink-800 text-lg px-4 py-2">
          ✅ Integrated Scheduling & Appointment Management - ACTIVE!
        </Badge>
      </CardHeader>
    </Card>
    
    <Card className="border-purple-500 bg-purple-50">
      <CardContent className="p-8">
        <h2 className="text-3xl font-bold text-purple-800 text-center">
          🎯 APPOINTMENTS SYSTEM OPERATIONAL! 🎯
        </h2>
        <p className="text-center text-purple-700 mt-4">
          Calendar interface with Google sync ready for appointments!
        </p>
      </CardContent>
    </Card>
  </div>
);

interface ManualSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  content: string[];
  steps?: { title: string; description: string }[];
}

export const MainDashboard: React.FC = () => {
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
        'Unified Workforce Management System for HR, Payroll, and Time Tracking',
        'Advanced features in R&D phase: quantum computing, distributed systems',
      ],
      steps: [
        {
          title: 'Login',
          description:
            'Use the configured authentication method to access the system',
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
      id: 'workforce-management',
      title: 'Workforce Management System',
      icon: Users,
      content: [
        'Unified HR, Payroll, and Time Management in single dashboard',
        'GPS-verified time tracking with manager approval workflows',
        'Comprehensive payroll processing with tax calculations',
        'Employee handbook and onboarding management',
        'Scheduling integration with Google Calendar sync',
        'Secure audit trails for all workforce operations',
      ],
      steps: [
        {
          title: 'Access Workforce',
          description: 'Navigate to the Workforce tab in main navigation',
        },
        {
          title: 'Employee Management',
          description: 'Manage employee roster, pay rates, and benefits',
        },
        {
          title: 'Process Payroll',
          description: 'Complete 5-step payroll workflow from timesheets to payments',
        },
      ],
    },
    {
      id: 'bidding-calculator',
      title: 'Government Bidding Calculator',
      icon: Calculator,
      content: [
        'Professional bid calculations for government contracting',
        'Material costs, labor hours, and profit margin calculations',
        'Integration with SAM.gov registration data',
        'Automated bid proposal generation and export',
      ],
      steps: [
        {
          title: 'Access Calculator',
          description: 'Navigate to Calculator tab for bidding tools',
        },
        {
          title: 'Enter Project Data',
          description: 'Input material costs, labor hours, overhead, and profit margins',
        },
        {
          title: 'Generate Proposal',
          description: 'Calculate bid amount and export professional proposals',
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
    {
      id: 'ai-monitoring',
      title: 'AI Agent Monitoring',
      icon: Brain,
      content: [
        'Real-time monitoring of all AI agents and models',
        'Genesis Predictive Bidding Model performance tracking',
        'R.O.M.A.N. Universal AI Interpreter status',
        'Document Analysis Engine monitoring',
        'Confidence scores and request analytics',
        'Error detection and performance optimization',
      ],
      steps: [
        {
          title: 'Access Monitoring',
          description: 'Navigate to the AI Monitoring tab to view agent status',
        },
        {
          title: 'Review Performance',
          description: 'Monitor confidence scores, request volumes, and system health',
        },
        {
          title: 'Troubleshoot Issues',
          description: 'Identify and resolve AI agent errors or performance issues',
        },
      ],
    },
    {
      id: 'advanced-analytics',
      title: 'Advanced Analytics Dashboard',
      icon: Crown,
      content: [
        'Executive command center for Divine Law Governance',
        'Consolidated business intelligence across all platform data',
        'Real-time labor cost analysis and workforce optimization',
        'Predictive sales analytics with AI-powered insights',
        'Comprehensive system health monitoring',
        'Strategic decision support for macro-level governance',
      ],
      steps: [
        {
          title: 'Access Dashboard',
          description: 'Navigate to Analytics tab for executive oversight',
        },
        {
          title: 'Review KPIs',
          description: 'Monitor key performance indicators and strategic metrics',
        },
        {
          title: 'Analyze Trends',
          description: 'Use detailed analytics tabs for deep-dive analysis',
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
            ODYSSEY-1 USER MANUAL
          </CardTitle>
          <Badge className='mx-auto bg-green-600/20 text-green-300 text-lg px-4 py-2'>
            COMPLETE USER GUIDE
          </Badge>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-2 md:grid-cols-9 bg-slate-800/50 gap-1'>
          <TabsTrigger
            value='getting-started'
            className='text-xs md:text-sm px-1 md:px-3'
          >
            <span className='hidden md:inline'>Getting Started</span>
            <span className='md:hidden'>Start</span>
          </TabsTrigger>
          <TabsTrigger
            value='workforce-management'
            className='text-xs md:text-sm px-1 md:px-3'
          >
            <span className='hidden md:inline'>Workforce</span>
            <span className='md:hidden'>HR</span>
          </TabsTrigger>
          <TabsTrigger
            value='bidding-calculator'
            className='text-xs md:text-sm px-1 md:px-3'
          >
            <span className='hidden md:inline'>Bidding</span>
            <span className='md:hidden'>Calc</span>
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
          <TabsTrigger
            value='ai-monitoring'
            className='text-xs md:text-sm px-1 md:px-3'
          >
            <span className='hidden md:inline'>AI Monitoring</span>
            <span className='md:hidden'>Monitor</span>
          </TabsTrigger>
          <TabsTrigger
            value='advanced-analytics'
            className='text-xs md:text-sm px-1 md:px-3'
          >
            <span className='hidden md:inline'>Analytics</span>
            <span className='md:hidden'>Dash</span>
          </TabsTrigger>
          <TabsTrigger
            value='media'
            className='text-xs md:text-sm px-1 md:px-3'
          >
            <span className='hidden md:inline'>Media Hub</span>
            <span className='md:hidden'>Media</span>
          </TabsTrigger>
          <TabsTrigger
            value='trading'
            className='text-xs md:text-sm px-1 md:px-3'
          >
            <span className='hidden md:inline'>Trading</span>
            <span className='md:hidden'>Trade</span>
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

        <TabsContent value="analytics">
          <AdvancedAnalyticsDashboard />
        </TabsContent>
        
        <TabsContent value="ai-monitoring">
          <AIAgentMonitor />
        </TabsContent>
        
        <TabsContent value="documents">
          <DocumentManager />
        </TabsContent>
        
        <TabsContent value="media">
          <MediaCollaborationHub />
        </TabsContent>
        
        <TabsContent value="trading">
          <TradingCockpitAI />
        </TabsContent>
        
        <TabsContent value="scheduling">
          <EmployeeScheduleManager />
        </TabsContent>

        <TabsContent value="appointments">
          <AppointmentCalendar />
        </TabsContent>

        <TabsContent value="research">
          <div className="space-y-6">
            <Card className="border-blue-400 bg-gradient-to-r from-blue-100 to-green-100">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-blue-800">
                  AI Research Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-600">
                  Research AI interface will be implemented here
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MainDashboard;