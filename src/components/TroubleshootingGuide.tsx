import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  AlertTriangle, Wrench, Bug, Server, Database, Zap, 
  RefreshCw, Shield, Network, Clock, FileX, Users
} from 'lucide-react';

interface TroubleshootingItem {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  symptoms: string[];
  causes: string[];
  solutions: string[];
  prevention: string;
}

export const TroubleshootingGuide: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('system');

  const troubleshootingItems: TroubleshootingItem[] = [
    {
      id: 'auth_failure',
      title: 'Authentication System Failures',
      severity: 'critical',
      symptoms: [
        'Users cannot log in with valid credentials',
        'JWT tokens expiring immediately',
        'Google OAuth redirects failing',
        'Session persistence issues'
      ],
      causes: [
        'Supabase Auth service outage',
        'Incorrect environment variables',
        'CORS configuration issues',
        'JWT secret key rotation'
      ],
      solutions: [
        'Check Supabase dashboard for service status',
        'Verify SUPABASE_URL and SUPABASE_ANON_KEY',
        'Update CORS settings in Supabase',
        'Regenerate and update JWT secrets',
        'Clear browser cache and cookies'
      ],
      prevention: 'Monitor auth service health, maintain backup auth methods, regular credential rotation'
    },
    {
      id: 'database_connection',
      title: 'Database Connection Issues',
      severity: 'critical',
      symptoms: [
        'Database queries timing out',
        'Connection pool exhaustion',
        'RLS policy violations',
        'Data sync failures'
      ],
      causes: [
        'Database server overload',
        'Network connectivity issues',
        'Incorrect RLS policies',
        'Connection string misconfiguration'
      ],
      solutions: [
        'Scale database resources in Supabase',
        'Check network connectivity',
        'Review and update RLS policies',
        'Verify connection string format',
        'Implement connection pooling'
      ],
      prevention: 'Monitor database performance, implement proper indexing, regular RLS policy audits'
    },
    {
      id: 'edge_function_errors',
      title: 'Edge Function Failures',
      severity: 'high',
      symptoms: [
        'Function timeouts (>60 seconds)',
        'Memory limit exceeded errors',
        'CORS errors in browser console',
        'Function deployment failures'
      ],
      causes: [
        'Inefficient code execution',
        'Memory leaks in functions',
        'Missing CORS headers',
        'Deployment configuration errors'
      ],
      solutions: [
        'Optimize function code for performance',
        'Add proper memory management',
        'Include corsHeaders in all responses',
        'Review deployment logs',
        'Test functions locally before deployment'
      ],
      prevention: 'Code reviews, performance testing, monitoring function metrics'
    }
  ];

  const systemChecks = [
    { name: 'Supabase Connection', command: 'curl -I https://your-project.supabase.co', status: 'healthy' },
    { name: 'Edge Functions', command: 'supabase functions list', status: 'healthy' },
    { name: 'Database Health', command: 'SELECT 1', status: 'healthy' },
    { name: 'Auth Service', command: 'supabase auth users list', status: 'healthy' }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-red-900/50 to-orange-900/50 border-red-500/30">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <Wrench className="h-8 w-8 text-red-400" />
            ODYSSEY-1 TROUBLESHOOTING GUIDE
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
          <TabsTrigger value="system">System Issues</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-4">
          {troubleshootingItems.map(item => (
            <Card key={item.id} className="bg-slate-800/50 border-red-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                  {item.title}
                  <Badge className={`ml-auto ${
                    item.severity === 'critical' ? 'bg-red-600/20 text-red-300' :
                    item.severity === 'high' ? 'bg-orange-600/20 text-orange-300' :
                    item.severity === 'medium' ? 'bg-yellow-600/20 text-yellow-300' :
                    'bg-blue-600/20 text-blue-300'
                  }`}>
                    {item.severity.toUpperCase()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-red-300 mb-2">Symptoms</h4>
                  <ul className="space-y-1">
                    {item.symptoms.map((symptom, idx) => (
                      <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                        <Bug className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                        {symptom}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-orange-300 mb-2">Solutions</h4>
                  <ol className="space-y-1">
                    {item.solutions.map((solution, idx) => (
                      <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                        <span className="text-orange-400 font-mono text-xs mt-1">{idx + 1}.</span>
                        {solution}
                      </li>
                    ))}
                  </ol>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="diagnostics" className="space-y-4">
          <Card className="bg-slate-800/50 border-green-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Server className="h-6 w-6 text-green-400" />
                System Health Checks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemChecks.map((check, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-700/50 rounded">
                    <div>
                      <p className="text-white font-medium">{check.name}</p>
                      <code className="text-xs text-gray-400">{check.command}</code>
                    </div>
                    <Badge className="bg-green-600/20 text-green-300">
                      {check.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};