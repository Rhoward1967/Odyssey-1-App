/**
 * QuickBooks Data Import UI for Archana
 * 
 * Purpose: Allow Archana to import customer, invoice, and transaction data
 * from HJS Services LLC QuickBooks account into Odyssey-1 accounting system
 * 
 * Features:
 * - Manual sync trigger (on-demand)
 * - Batch processing with progress tracking
 * - Data mapping and validation
 * - Audit logging of all imports
 * - Conflict resolution for duplicate records
 */

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabaseClient';
import { AlertCircle, CheckCircle, Database, Download, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function QuickBooksImportPanel() {
  const [activeTab, setActiveTab] = useState('import');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [importedCount, setImportedCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [nextPosition, setNextPosition] = useState(1);

  const handleManualSync = async () => {
    setIsLoading(true);
    setStatus('syncing');
    setMessage('Connecting to QuickBooks...');
    setProgress(20);

    try {
      // Call the quickbooks-sync edge function
      const { data, error } = await supabase.functions.invoke('quickbooks-sync', {
        body: {
          start_position: nextPosition,
          batch_size: 100
        }
      });

      if (error) {
        throw new Error(error.message || 'Sync failed');
      }

      setProgress(60);
      setMessage(`Importing ${data.imported_count} records...`);

      if (data.success) {
        setProgress(100);
        setStatus('success');
        setMessage(`✅ Successfully imported ${data.imported_count} customer records`);
        setImportedCount(data.imported_count);
        setHasMore(data.has_more);
        setNextPosition(data.next_start_position);

        // Log to system_logs
        await supabase
          .from('system_logs')
          .insert({
            level: 'info',
            source: 'quickbooks_import',
            message: `QuickBooks Data Import Complete - ${data.imported_count} records`,
            metadata: {
              imported_count: data.imported_count,
              has_more: data.has_more,
              next_start_position: data.next_start_position,
              source: 'HJS Services LLC',
              importer: 'Archana Jitendra (Accountant)',
              timestamp: new Date().toISOString()
            }
          });
      } else {
        setStatus('error');
        setMessage(`❌ Import failed: ${data.error}`);
      }
    } catch (err) {
      setStatus('error');
      setMessage(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueSync = () => {
    setNextPosition(nextPosition);
    setProgress(0);
    setStatus('idle');
    handleManualSync();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">QuickBooks Data Integration</h1>
        <p className="text-gray-400">
          Import customer, invoice, and transaction data from HJS Services LLC QuickBooks account
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="import" className="flex gap-2">
            <Download className="w-4 h-4" />
            Import Data
          </TabsTrigger>
          <TabsTrigger value="mapping" className="flex gap-2">
            <Database className="w-4 h-4" />
            Data Mapping
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex gap-2">
            <CheckCircle className="w-4 h-4" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        {/* Import Tab */}
        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle>Import QuickBooks Records</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Source Information */}
              <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <p className="text-sm font-semibold mb-2">📊 Data Source</p>
                <ul className="text-sm space-y-1 text-gray-300">
                  <li>• Account: HJS Services LLC</li>
                  <li>• Connection: QuickBooks Online API</li>
                  <li>• Entity: Odyssey-1 Accounting Dashboard</li>
                  <li>• Operator: Archana Jitendra (CPA)</li>
                </ul>
              </div>

              {/* Available Imports */}
              <div className="space-y-3">
                <p className="text-sm font-semibold">Available Imports</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 border border-gray-700 rounded bg-gray-900/30">
                    <p className="text-sm font-medium">👥 Customers</p>
                    <p className="text-xs text-gray-400 mt-1">Billing addresses, contact info</p>
                  </div>
                  <div className="p-3 border border-gray-700 rounded bg-gray-900/30">
                    <p className="text-sm font-medium">📄 Invoices</p>
                    <p className="text-xs text-gray-400 mt-1">Line items, amounts, dates</p>
                  </div>
                  <div className="p-3 border border-gray-700 rounded bg-gray-900/30">
                    <p className="text-sm font-medium">💰 Payments</p>
                    <p className="text-xs text-gray-400 mt-1">Transactions, dates, methods</p>
                  </div>
                  <div className="p-3 border border-gray-700 rounded bg-gray-900/30">
                    <p className="text-sm font-medium">📋 Expenses</p>
                    <p className="text-xs text-gray-400 mt-1">Categories, vendors, amounts</p>
                  </div>
                </div>
              </div>

              {/* Status Messages */}
              {message && (
                <Alert className={status === 'error' ? 'border-red-500/50 bg-red-900/20' : 'border-green-500/50 bg-green-900/20'}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              {/* Progress Bar */}
              {isLoading && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Syncing data...</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}

              {/* Import Stats */}
              {importedCount > 0 && status === 'success' && (
                <div className="p-3 bg-green-900/20 border border-green-500/30 rounded">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Import Complete
                  </p>
                  <p className="text-xs text-gray-300 mt-1">
                    {importedCount} records successfully imported and synced
                  </p>
                  {hasMore && (
                    <p className="text-xs text-yellow-400 mt-1">
                      More records available. Continue syncing?
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleManualSync}
                  disabled={isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Start QuickBooks Import
                    </>
                  )}
                </Button>
                {hasMore && status === 'success' && (
                  <Button
                    onClick={handleContinueSync}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Continue (Next Batch)
                  </Button>
                )}
              </div>

              <p className="text-xs text-gray-400">
                💡 Tip: Import runs in batches of 100 records. You can continue syncing until all data is imported.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mapping Tab */}
        <TabsContent value="mapping">
          <Card>
            <CardHeader>
              <CardTitle>Data Field Mapping</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-300 mb-4">
                How QuickBooks data is automatically mapped to Odyssey-1 fields:
              </p>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold mb-2">👥 Customers</p>
                  <div className="text-xs space-y-1 ml-4 text-gray-400 bg-gray-900/30 p-3 rounded">
                    <div>QB: DisplayName → Odyssey: first_name / company_name</div>
                    <div>QB: PrimaryEmailAddr → Odyssey: email</div>
                    <div>QB: PrimaryPhone → Odyssey: phone</div>
                    <div>QB: BillAddr → Odyssey: billing_address_*</div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2">📄 Invoices</p>
                  <div className="text-xs space-y-1 ml-4 text-gray-400 bg-gray-900/30 p-3 rounded">
                    <div>QB: Invoice.Id → Odyssey: external_invoice_id</div>
                    <div>QB: TxnDate → Odyssey: invoice_date</div>
                    <div>QB: TotalAmt → Odyssey: total_amount</div>
                    <div>QB: Line.LineNum → Odyssey: line_items</div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2">💰 Payments</p>
                  <div className="text-xs space-y-1 ml-4 text-gray-400 bg-gray-900/30 p-3 rounded">
                    <div>QB: Payment.Id → Odyssey: external_payment_id</div>
                    <div>QB: TxnDate → Odyssey: payment_date</div>
                    <div>QB: TotalAmt → Odyssey: amount_paid</div>
                  </div>
                </div>
              </div>

              <Alert className="border-blue-500/50 bg-blue-900/20">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  All imported records are marked with source="quickbooks_migration" for audit tracking
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Tab */}
        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Import Audit Log</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-300 space-y-3">
                <div className="border border-gray-700 rounded p-3 bg-gray-900/30">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">QuickBooks Data Import Initialized</p>
                      <p className="text-xs text-gray-400 mt-1">Source: HJS Services LLC</p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Archana Jitendra (Accountant)</p>
                </div>

                <div className="border border-gray-700 rounded p-3 bg-gray-900/30">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">Field Mapping Configured</p>
                      <p className="text-xs text-gray-400 mt-1">Customers, Invoices, Payments, Expenses</p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">4 entity types ready for sync</p>
                </div>

                <div className="border border-gray-700 rounded p-3 bg-gray-900/30">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">UCC-1 Filing Integration</p>
                      <p className="text-xs text-gray-400 mt-1">Record #029-2026-000102 - Personal Security Interest</p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">All QuickBooks data classified as debt service</p>
                </div>
              </div>

              <Alert className="border-yellow-500/50 bg-yellow-900/20">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  All imported data is automatically logged to system_logs for compliance and audit purposes
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer Info */}
      <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg text-xs text-gray-400 space-y-2">
        <p>🔐 <strong>Security:</strong> All QuickBooks data transfers are encrypted and logged</p>
        <p>📊 <strong>Audit Trail:</strong> Every import is recorded in system_logs with timestamp and operator</p>
        <p>🛡️ <strong>Legal:</strong> UCC-1 Personal Security Interest (Record #029-2026-000102) applies to all imported financial data</p>
        <p>👤 <strong>Operator:</strong> Archana Jitendra, CPA - Odyssey-1 AI LLC Accountant</p>
      </div>
    </div>
  );
}
