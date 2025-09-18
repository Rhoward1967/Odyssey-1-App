import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Rocket, Server, Database, Shield, Code, 
  CheckCircle, AlertCircle, Terminal, Globe, Lock
} from 'lucide-react';

interface DeploymentStep {
  id: string;
  title: string;
  description: string;
  commands: string[];
  notes: string[];
  critical: boolean;
}

export const DeploymentGuide: React.FC = () => {
  const [activePhase, setActivePhase] = useState('preparation');

  const deploymentPhases = {
    preparation: [
      {
        id: 'env_setup',
        title: 'Environment Configuration',
        description: 'Set up all required environment variables and secrets',
        commands: [
          'supabase login',
          'supabase init',
          'supabase start',
          'supabase secrets set ANTHROPIC_API_KEY=your_key'
        ],
        notes: [
          'Ensure all API keys are properly configured',
          'Test database connection before proceeding',
          'Verify Stripe webhooks are configured'
        ],
        critical: true
      },
      {
        id: 'database_migration',
        title: 'Database Schema Deployment',
        description: 'Deploy all tables, RLS policies, and functions',
        commands: [
          'supabase db push',
          'supabase functions deploy',
          'supabase db reset --linked'
        ],
        notes: [
          'Backup existing data before migration',
          'Test all RLS policies after deployment',
          'Verify edge functions are responding'
        ],
        critical: true
      }
    ],
    deployment: [
      {
        id: 'frontend_build',
        title: 'Frontend Application Build',
        description: 'Build and optimize the React application',
        commands: [
          'npm install',
          'npm run build',
          'npm run preview'
        ],
        notes: [
          'Ensure all TypeScript errors are resolved',
          'Test build locally before deployment',
          'Verify all environment variables are included'
        ],
        critical: true
      },
      {
        id: 'vercel_deploy',
        title: 'Vercel Deployment',
        description: 'Deploy to Vercel with proper configuration',
        commands: [
          'vercel login',
          'vercel --prod',
          'vercel domains add your-domain.com'
        ],
        notes: [
          'Configure custom domain if required',
          'Set up SSL certificates',
          'Test all routes after deployment'
        ],
        critical: false
      }
    ],
    monitoring: [
      {
        id: 'health_checks',
        title: 'Post-Deployment Health Checks',
        description: 'Verify all systems are operational',
        commands: [
          'curl -f https://your-app.vercel.app/health',
          'supabase functions list',
          'supabase db inspect'
        ],
        notes: [
          'Check all authentication flows',
          'Test critical user journeys',
          'Verify real-time features are working'
        ],
        critical: true
      }
    ]
  };

  const securityChecklist = [
    'RLS policies enabled on all tables',
    'JWT secrets properly configured',
    'API keys stored in Supabase secrets',
    'CORS settings configured correctly',
    'SSL certificates active',
    'Environment variables secured'
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-500/30">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <Rocket className="h-8 w-8 text-blue-400" />
            ODYSSEY-1 DEPLOYMENT GUIDE
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs value={activePhase} onValueChange={setActivePhase}>
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
          <TabsTrigger value="preparation">Preparation</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        {Object.entries(deploymentPhases).map(([phase, steps]) => (
          <TabsContent key={phase} value={phase} className="space-y-4">
            {steps.map((step, idx) => (
              <Card key={step.id} className="bg-slate-800/50 border-blue-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-600/20 rounded-full">
                      <span className="text-blue-300 font-bold">{idx + 1}</span>
                    </div>
                    {step.title}
                    {step.critical && (
                      <Badge className="bg-red-600/20 text-red-300">CRITICAL</Badge>
                    )}
                  </CardTitle>
                  <p className="text-gray-400">{step.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-blue-300 mb-3">Commands</h4>
                    <div className="space-y-2">
                      {step.commands.map((command, cmdIdx) => (
                        <div key={cmdIdx} className="bg-slate-900/50 p-3 rounded border border-slate-600">
                          <code className="text-green-300 font-mono text-sm">{command}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-yellow-300 mb-2">Important Notes</h4>
                    <ul className="space-y-1">
                      {step.notes.map((note, noteIdx) => (
                        <li key={noteIdx} className="text-gray-300 text-sm flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>

      <Card className="bg-slate-800/50 border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            <Shield className="h-6 w-6 text-green-400" />
            Security Deployment Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {securityChecklist.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};