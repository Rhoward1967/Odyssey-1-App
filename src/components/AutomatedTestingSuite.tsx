import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, CheckCircle, XCircle, Clock, Zap, TestTube, Shield } from 'lucide-react';

interface TestResult {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'running' | 'pending';
  duration: number;
  category: 'unit' | 'integration' | 'e2e' | 'security';
  error?: string;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  coverage: number;
  status: 'passed' | 'failed' | 'running';
}

export default function AutomatedTestingSuite() {
  const [isRunning, setIsRunning] = useState(false);
  const [testSuites, setTestSuites] = useState<TestSuite[]>([
    {
      name: 'Unit Tests',
      coverage: 94,
      status: 'passed',
      tests: [
        { id: '1', name: 'API Authentication', status: 'passed', duration: 120, category: 'unit' },
        { id: '2', name: 'Data Validation', status: 'passed', duration: 85, category: 'unit' },
        { id: '3', name: 'Component Rendering', status: 'passed', duration: 200, category: 'unit' },
        { id: '4', name: 'State Management', status: 'failed', duration: 150, category: 'unit', error: 'State not updating correctly' }
      ]
    },
    {
      name: 'Integration Tests',
      coverage: 87,
      status: 'passed',
      tests: [
        { id: '5', name: 'Database Connection', status: 'passed', duration: 340, category: 'integration' },
        { id: '6', name: 'API Endpoints', status: 'passed', duration: 280, category: 'integration' },
        { id: '7', name: 'File Upload', status: 'passed', duration: 450, category: 'integration' }
      ]
    },
    {
      name: 'E2E Tests',
      coverage: 78,
      status: 'running',
      tests: [
        { id: '8', name: 'User Registration Flow', status: 'passed', duration: 2300, category: 'e2e' },
        { id: '9', name: 'Payment Processing', status: 'running', duration: 0, category: 'e2e' },
        { id: '10', name: 'Dashboard Navigation', status: 'pending', duration: 0, category: 'e2e' }
      ]
    },
    {
      name: 'Security Tests',
      coverage: 92,
      status: 'passed',
      tests: [
        { id: '11', name: 'SQL Injection Protection', status: 'passed', duration: 180, category: 'security' },
        { id: '12', name: 'XSS Prevention', status: 'passed', duration: 160, category: 'security' },
        { id: '13', name: 'Authentication Security', status: 'passed', duration: 220, category: 'security' }
      ]
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'running': return <Clock className="w-4 h-4 text-blue-600 animate-spin" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-600';
      case 'failed': return 'bg-red-100 text-red-600';
      case 'running': return 'bg-blue-100 text-blue-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'unit': return <TestTube className="w-4 h-4" />;
      case 'integration': return <Zap className="w-4 h-4" />;
      case 'e2e': return <Play className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      default: return <TestTube className="w-4 h-4" />;
    }
  };

  const runAllTests = () => {
    setIsRunning(true);
    // Simulate test execution
    setTimeout(() => {
      setIsRunning(false);
    }, 5000);
  };

  const totalTests = testSuites.reduce((acc, suite) => acc + suite.tests.length, 0);
  const passedTests = testSuites.reduce((acc, suite) => 
    acc + suite.tests.filter(test => test.status === 'passed').length, 0);
  const failedTests = testSuites.reduce((acc, suite) => 
    acc + suite.tests.filter(test => test.status === 'failed').length, 0);
  const overallCoverage = Math.round(testSuites.reduce((acc, suite) => acc + suite.coverage, 0) / testSuites.length);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Automated Testing Suite</h1>
        <div className="flex gap-2">
          <Button onClick={runAllTests} disabled={isRunning} className="bg-blue-600 hover:bg-blue-700">
            {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isRunning ? 'Running...' : 'Run All Tests'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tests</p>
                <p className="text-2xl font-bold">{totalTests}</p>
              </div>
              <TestTube className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Passed</p>
                <p className="text-2xl font-bold text-green-600">{passedTests}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{failedTests}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Coverage</p>
                <p className="text-2xl font-bold">{overallCoverage}%</p>
              </div>
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="unit">Unit Tests</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
          <TabsTrigger value="e2e">E2E Tests</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {testSuites.map((suite, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    {getCategoryIcon(suite.tests[0]?.category)}
                    <span className="ml-2">{suite.name}</span>
                  </CardTitle>
                  <Badge className={getStatusColor(suite.status)}>
                    {suite.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Coverage: {suite.coverage}%</span>
                    <span>{suite.tests.filter(t => t.status === 'passed').length}/{suite.tests.length} passed</span>
                  </div>
                  <Progress value={suite.coverage} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {testSuites.map((suite) => (
          <TabsContent key={suite.name.toLowerCase().replace(/\s+/g, '')} value={suite.name.toLowerCase().replace(/\s+/g, '')} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{suite.name} Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {suite.tests.map((test) => (
                    <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(test.status)}
                        <div>
                          <div className="font-medium">{test.name}</div>
                          {test.error && <div className="text-sm text-red-600">{test.error}</div>}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {test.duration > 0 ? `${test.duration}ms` : '-'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}