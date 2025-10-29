import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ErrorTracker() {
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const testCommonOperations = async () => {
    setLoading(true);
    const detectedErrors: string[] = [];

    try {
      // Test employees_public access
      const { error: empError } = await supabase
        .from('employees_public')
        .select('*')
        .limit(1);
      
      if (empError) {
        detectedErrors.push(`employees_public: ${empError.message}`);
      }

      // Test time_correction_audit access  
      const { error: auditError } = await supabase
        .from('time_correction_audit')
        .select('*')
        .limit(1);
      
      if (auditError) {
        detectedErrors.push(`time_correction_audit: ${auditError.message}`);
      }

      // Test RPC function calls (if any)
      try {
        const { error: rpcError } = await supabase.rpc('is_user_org_admin', { user_id: 'test' });
        if (rpcError && !rpcError.message.includes('permission denied')) {
          detectedErrors.push(`RPC is_user_org_admin: ${rpcError.message}`);
        }
      } catch (err) {
        // Expected to fail due to security hardening
      }

      setErrors(detectedErrors);
    } catch (error) {
      console.error('Error testing operations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testCommonOperations();
  }, []);

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertTriangle className="h-5 w-5" />
          Active Error Tracking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {errors.length === 0 ? (
            <p className="text-green-700">No errors detected in common operations</p>
          ) : (
            <div className="space-y-2">
              <p className="font-semibold text-orange-800">{errors.length} Error(s) Detected:</p>
              {errors.map((error, index) => (
                <div key={index} className="bg-white p-2 rounded border text-sm">
                  {error}
                </div>
              ))}
            </div>
          )}
          
          <Button 
            onClick={testCommonOperations}
            disabled={loading}
            size="sm"
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {loading ? 'Testing...' : 'Re-test Operations'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
