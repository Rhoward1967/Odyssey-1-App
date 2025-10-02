import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  Wrench,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Play,
  Pause,
  Settings,
  Zap,
  Shield,
  Code,
} from 'lucide-react';

interface AutoFixIssue {
  id: string;
  type: 'deployment' | 'environment' | 'build' | 'security';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  autoFixable: boolean;
  status: 'detected' | 'fixing' | 'fixed' | 'failed';
  solution?: string;
}

export default function AutoFixSystem() {
  const [issues, setIssues] = useState<AutoFixIssue[]>([
    {
      id: '1',
      type: 'deployment',
      severity: 'critical',
      description: 'Missing VERCEL_TOKEN in GitHub secrets',
      autoFixable: false,
      status: 'detected',
      solution: 'Add VERCEL_TOKEN to GitHub repository secrets',
    },
    {
      id: '2',
      type: 'environment',
      severity: 'high',
      description: 'VITE_SUPABASE_URL not set in production',
      autoFixable: true,
      status: 'detected',
      solution: 'Auto-configure from detected Supabase project',
    },
    {
      id: '3',
      type: 'build',
      severity: 'medium',
      description: 'TypeScript strict mode warnings',
      autoFixable: true,
      status: 'fixed',
      solution: 'Applied type fixes and null checks',
    },
    {
      id: '4',
      type: 'security',
      severity: 'high',
      description: 'Exposed API keys in client code',
      autoFixable: true,
      status: 'fixing',
      solution: 'Moving sensitive keys to server-side environment',
    },
  ]);

  const [autoFixEnabled, setAutoFixEnabled] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  const runAutoFix = async (issueId: string) => {
    setIssues(prev =>
      prev.map(issue =>
        issue.id === issueId ? { ...issue, status: 'fixing' } : issue
      )
    );

    // Simulate auto-fix process
    await new Promise(resolve => setTimeout(resolve, 3000));

    setIssues(prev =>
      prev.map(issue =>
        issue.id === issueId
          ? { ...issue, status: Math.random() > 0.2 ? 'fixed' : 'failed' }
          : issue
      )
    );
  };

  const runFullScan = async () => {
    setIsScanning(true);
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Add new detected issues
    const newIssue: AutoFixIssue = {
      id: Date.now().toString(),
      type: 'build',
      severity: 'low',
      description: 'Unused imports detected in 3 files',
      autoFixable: true,
      status: 'detected',
      solution: 'Remove unused import statements',
    };

    setIssues(prev => [...prev, newIssue]);
    setIsScanning(false);
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: 'bg-red-600',
      high: 'bg-orange-600',
      medium: 'bg-yellow-600',
      low: 'bg-blue-600',
    };
    return colors[severity as keyof typeof colors];
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      deployment: <Zap className='h-4 w-4' />,
      environment: <Settings className='h-4 w-4' />,
      build: <Code className='h-4 w-4' />,
      security: <Shield className='h-4 w-4' />,
    };
    return icons[type as keyof typeof icons];
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      detected: 'bg-yellow-600',
      fixing: 'bg-blue-600',
      fixed: 'bg-green-600',
      failed: 'bg-red-600',
    };
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status}
      </Badge>
    );
  };

  const criticalIssues = issues.filter(i => i.severity === 'critical').length;
  const autoFixableIssues = issues.filter(
    i => i.autoFixable && i.status === 'detected'
  ).length;
  const fixedIssues = issues.filter(i => i.status === 'fixed').length;

  return (
    <div className='space-y-4 px-2 py-2 sm:px-6 sm:py-6 max-w-full overflow-x-hidden'>
      <Card className='bg-black/20 backdrop-blur-sm border-orange-500/30'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-white flex items-center gap-2'>
              <Wrench className='h-6 w-6 text-orange-400' />
              Auto-Fix System
            </CardTitle>
            <div className='flex items-center gap-2'>
              <Button
                onClick={() => setAutoFixEnabled(!autoFixEnabled)}
                size='sm'
                variant={autoFixEnabled ? 'default' : 'outline'}
                className={
                  autoFixEnabled ? 'bg-green-600 hover:bg-green-700' : ''
                }
              >
                {autoFixEnabled ? (
                  <Play className='h-4 w-4 mr-2' />
                ) : (
                  <Pause className='h-4 w-4 mr-2' />
                )}
                {autoFixEnabled ? 'Enabled' : 'Disabled'}
              </Button>
              <Button
                onClick={runFullScan}
                disabled={isScanning}
                size='sm'
                className='bg-blue-600 hover:bg-blue-700'
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`}
                />
                Scan
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-2 md:grid-cols-3 md:gap-4 mb-4 md:mb-6'>
            <Card className='bg-black/30 border-red-500/30'>
              <CardContent className='p-4'>
                <div className='flex items-center gap-2'>
                  <AlertTriangle className='h-5 w-5 text-red-400' />
                  <div>
                    <p className='text-sm text-gray-300'>Critical Issues</p>
                    <p className='text-2xl font-bold text-white'>
                      {criticalIssues}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='bg-black/30 border-blue-500/30'>
              <CardContent className='p-4'>
                <div className='flex items-center gap-2'>
                  <Wrench className='h-5 w-5 text-blue-400' />
                  <div>
                    <p className='text-sm text-gray-300'>Auto-Fixable</p>
                    <p className='text-2xl font-bold text-white'>
                      {autoFixableIssues}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='bg-black/30 border-green-500/30'>
              <CardContent className='p-4'>
                <div className='flex items-center gap-2'>
                  <CheckCircle className='h-5 w-5 text-green-400' />
                  <div>
                    <p className='text-sm text-gray-300'>Fixed</p>
                    <p className='text-2xl font-bold text-white'>
                      {fixedIssues}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className='space-y-2 md:space-y-4'>
            {issues.map(issue => (
              <Card key={issue.id} className='bg-black/30 border-gray-600/30'>
                <CardContent className='p-4'>
                  <div className='flex flex-wrap items-start justify-between gap-2'>
                    <div className='flex items-start gap-3 flex-1 min-w-0'>
                      {getTypeIcon(issue.type)}
                      <div className='flex-1 min-w-0'>
                        <div className='flex flex-wrap items-center gap-2 mb-1'>
                          <h4 className='text-white font-medium break-words max-w-[140px] sm:max-w-none'>
                            {issue.description}
                          </h4>
                          <Badge className={getSeverityColor(issue.severity)}>
                            {issue.severity}
                          </Badge>
                        </div>
                        {issue.solution && (
                          <p className='text-sm text-gray-300 break-words max-w-[180px] sm:max-w-none'>
                            {issue.solution}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className='flex flex-col sm:flex-row items-end gap-2 flex-shrink-0'>
                      {getStatusBadge(issue.status)}
                      {issue.autoFixable && issue.status === 'detected' && (
                        <Button
                          onClick={() => runAutoFix(issue.id)}
                          size='sm'
                          className='bg-orange-600 hover:bg-orange-700'
                        >
                          <Wrench className='h-3 w-3 mr-1' />
                          Fix
                        </Button>
                      )}
                    </div>
                  </div>
                  {issue.status === 'fixing' && (
                    <div className='mt-3'>
                      <Progress value={66} className='h-2' />
                      <p className='text-xs text-gray-400 mt-1'>
                        Applying fix...
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
