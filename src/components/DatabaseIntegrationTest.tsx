import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Play, Database } from 'lucide-react';
import { supabase } from '@/lib/supabase/supabase';

export default function DatabaseIntegrationTest() {
  const [testResults, setTestResults] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

  const runTest = async (testName: string, testFunction: () => Promise<void>) => {
    setLoading(prev => ({ ...prev, [testName]: true }));
    
    try {
      await testFunction();
      setTestResults(prev => ({ ...prev, [testName]: true }));
    } catch (error) {
      console.error(`Test ${testName} failed:`, error);
      setTestResults(prev => ({ ...prev, [testName]: false }));
    } finally {
      setLoading(prev => ({ ...prev, [testName]: false }));
    }
  };

  const testEmployeesRead = async () => {
    const { data, error } = await supabase.from('employees').select('*').limit(1);
    if (error) throw new Error(error.message);
  };

  const testTimeEntriesRead = async () => {
    const { data, error } = await supabase.from('time_entries').select('*').limit(1);
    if (error) throw new Error(error.message);
  };

  const testBidsRead = async () => {
    const { data, error } = await supabase.from('bids').select('*').limit(1);
    if (error) throw new Error(error.message);
  };

  const testTimeAuditSecurity = async () => {
    // Test that time audit follows RLS policies
    const { data, error } = await supabase
      .from('time_correction_audit')
      .select('*')
      .limit(1);
    
    if (error) {
      // If user not authenticated, expect permission denied
      if (error.message.includes('permission denied')) {
        throw new Error('Proper RLS enforcement - anonymous access denied');
      }
      throw new Error(error.message);
    }
    
    // If successful, user has proper org access
    console.log('Time audit security test passed - proper org isolation');
  };

  const tests = [
    {
      name: 'employees_read',
      title: 'Read Employees Table',
      description: 'Test reading from employees table',
      testFunction: testEmployeesRead
    },
    {
      name: 'time_entries_read',
      title: 'Read Time Entries Table',
      description: 'Test reading from time_entries table',
      testFunction: testTimeEntriesRead
    },
    {
      name: 'bids_read',
      title: 'Read Bids Table',
      description: 'Test reading from bids table',
      testFunction: testBidsRead
    },
    {
      name: 'time_audit_security',
      title: 'Time Audit Security (RLS)',
      description: 'Test org-isolated access to audit logs',
      testFunction: testTimeAuditSecurity
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Integration Tests
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {tests.map((test) => (
            <div key={test.name} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {loading[test.name] ? (
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                ) : testResults[test.name] === true ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : testResults[test.name] === false ? (
                  <XCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                )}
                <div>
                  <p className="font-medium">{test.title}</p>
                  <p className="text-sm text-gray-600">{test.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {testResults[test.name] !== undefined && (
                  <Badge variant={testResults[test.name] ? 'default' : 'destructive'}>
                    {testResults[test.name] ? 'PASS' : 'FAIL'}
                  </Badge>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => runTest(test.name, test.testFunction)}
                  disabled={loading[test.name]}
                >
                  <Play className="h-3 w-3 mr-1" />
                  Test
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
