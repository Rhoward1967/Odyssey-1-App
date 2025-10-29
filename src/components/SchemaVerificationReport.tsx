import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { checkRLSFunction, detectExistingTables, getSystemHealth } from '@/lib/supabase/schema-detector';
import { AlertCircle, CheckCircle, Database, RefreshCw, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TableStatus {
  table_name: string;
  exists: boolean;
  error?: string;
  sample_columns?: string[];
}

interface SystemHealth {
  database_connected: boolean;
  rls_function_exists: boolean;
  critical_tables_ready: boolean;
  workforce_system_ready: boolean;
}

export default function SchemaVerificationReport() {
  const [tableStatuses, setTableStatuses] = useState<TableStatus[]>([]);
  const [rlsStatus, setRlsStatus] = useState<{ exists: boolean; error?: string } | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(false);

  const runVerification = async () => {
    setLoading(true);
    try {
      const [tables, rls, health] = await Promise.all([
        detectExistingTables(),
        checkRLSFunction(),
        getSystemHealth()
      ]);
      
      setTableStatuses(tables);
      setRlsStatus(rls);
      setSystemHealth(health);
    } catch (error) {
      console.error('Schema verification failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runVerification();
  }, []);

  const existingTables = tableStatuses.filter(t => t.exists);
  const missingTables = tableStatuses.filter(t => !t.exists);

  return (
    <div className="space-y-6">
      {/* Header with System Health */}
      <Card className={`${
        systemHealth?.workforce_system_ready 
          ? 'bg-gradient-to-r from-green-600 to-blue-600' 
          : 'bg-gradient-to-r from-orange-600 to-red-600'
        } text-white`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6" />
            Database Schema Verification Report
            {systemHealth?.workforce_system_ready && (
              <Badge className="bg-white/20 text-white ml-auto">SYSTEM READY</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <Button 
              onClick={runVerification} 
              disabled={loading}
              variant="secondary"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Scanning...' : 'Re-scan Database'}
            </Button>
            
            {tableStatuses.length > 0 && (
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {existingTables.length}/{tableStatuses.length} Tables Ready
                </Badge>
                {systemHealth && (
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    RLS: {systemHealth.rls_function_exists ? 'ACTIVE' : 'MISSING'}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Critical System Status */}
      {systemHealth && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className={systemHealth.database_connected ? 'border-green-500' : 'border-red-500'}>
            <CardContent className="p-4 text-center">
              {systemHealth.database_connected ? (
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              ) : (
                <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              )}
              <p className="font-semibold">Database</p>
              <p className="text-sm text-gray-600">
                {systemHealth.database_connected ? 'Connected' : 'Disconnected'}
              </p>
            </CardContent>
          </Card>

          <Card className={systemHealth.rls_function_exists ? 'border-green-500' : 'border-orange-500'}>
            <CardContent className="p-4 text-center">
              {systemHealth.rls_function_exists ? (
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              ) : (
                <AlertCircle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              )}
              <p className="font-semibold">RLS Function</p>
              <p className="text-sm text-gray-600">
                {systemHealth.rls_function_exists ? 'Available' : 'Missing'}
              </p>
            </CardContent>
          </Card>

          <Card className={systemHealth.critical_tables_ready ? 'border-green-500' : 'border-red-500'}>
            <CardContent className="p-4 text-center">
              {systemHealth.critical_tables_ready ? (
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              ) : (
                <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              )}
              <p className="font-semibold">Core Tables</p>
              <p className="text-sm text-gray-600">
                {systemHealth.critical_tables_ready ? 'Ready' : 'Missing'}
              </p>
            </CardContent>
          </Card>

          <Card className={systemHealth.workforce_system_ready ? 'border-green-500' : 'border-orange-500'}>
            <CardContent className="p-4 text-center">
              {systemHealth.workforce_system_ready ? (
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              ) : (
                <AlertCircle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              )}
              <p className="font-semibold">Workforce System</p>
              <p className="text-sm text-gray-600">
                {systemHealth.workforce_system_ready ? 'Operational' : 'Partial'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Success Message */}
      {existingTables.length === tableStatuses.length && tableStatuses.length > 0 && (
        <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8" />
              <div>
                <h3 className="font-bold text-lg">🎉 ALL SYSTEMS OPERATIONAL!</h3>
                <p>Complete database schema deployed - HR/Payroll system ready for full testing</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Tables */}
      {existingTables.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Operational Tables ({existingTables.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {existingTables.map((table) => (
                <div key={table.table_name} className="border rounded-lg p-3 bg-green-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{table.table_name}</h4>
                    <Badge variant="default">READY</Badge>
                  </div>
                  {table.sample_columns && table.sample_columns.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Available columns:</p>
                      <div className="flex flex-wrap gap-1">
                        {table.sample_columns.slice(0, 3).map((col) => (
                          <Badge key={col} variant="outline" className="text-xs">
                            {col}
                          </Badge>
                        ))}
                        {table.sample_columns.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{table.sample_columns.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Missing Tables Warning */}
      {missingTables.length > 0 && (
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Missing Tables ({missingTables.length}) - CRITICAL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {missingTables.map((table) => (
                <div key={table.table_name} className="border rounded-lg p-3 bg-red-50">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{table.table_name}</h4>
                    <Badge variant="destructive">MISSING</Badge>
                  </div>
                  {table.error && (
                    <p className="text-xs text-red-600 mt-1">{table.error}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Immediate Actions Required</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {!systemHealth?.workforce_system_ready && (
              <div className="bg-orange-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-orange-800 mb-2">🚨 CRITICAL - System Not Ready:</p>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Navigate to <strong>/workforce</strong> to test current functionality</li>
                  <li>• Deploy missing tables if any are shown above</li>
                  <li>• Verify RLS function if missing</li>
                  <li>• Test employee and time tracking workflows</li>
                </ul>
              </div>
            )}

            {systemHealth?.workforce_system_ready && (
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-green-800 mb-2">✅ READY FOR TESTING:</p>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Go to <strong>/workforce</strong> for unified HR/Payroll system</li>
                  <li>• Test <strong>/calculator</strong> for government bidding</li>
                  <li>• All core business functions are operational</li>
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
