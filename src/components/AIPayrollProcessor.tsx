import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, CheckCircle, AlertTriangle, Clock, DollarSign, FileText } from 'lucide-react';

export default function AIPayrollProcessor() {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const aiChecks = [
    { id: 1, check: 'Time sheet validation', status: 'completed', issues: 0 },
    { id: 2, check: 'Overtime calculations', status: 'completed', issues: 2 },
    { id: 3, check: 'Tax withholding accuracy', status: 'completed', issues: 0 },
    { id: 4, check: 'Benefits deductions', status: 'completed', issues: 1 },
    { id: 5, check: 'Compliance verification', status: 'processing', issues: 0 },
    { id: 6, check: 'Direct deposit validation', status: 'pending', issues: 0 }
  ];

  const payrollSummary = {
    totalEmployees: 24,
    regularHours: 3680,
    overtimeHours: 156,
    grossPay: 87420.00,
    totalDeductions: 23180.50,
    netPay: 64239.50,
    estimatedTaxes: 18640.20
  };

  const aiRecommendations = [
    { type: 'warning', message: 'Maria Rodriguez has 12.5 hours of overtime - verify approval', action: 'Review' },
    { type: 'info', message: 'Consider adjusting James Wilson schedule to reduce overtime costs', action: 'Optimize' },
    { type: 'alert', message: 'Sarah Chen missing W-4 form - cannot process direct deposit', action: 'Contact' }
  ];

  const handleProcessPayroll = () => {
    setProcessing(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setProcessing(false);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-purple-500" />
          <h1 className="text-3xl font-bold">AI Payroll Processor</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Review Reports
          </Button>
          <Button onClick={handleProcessPayroll} disabled={processing}>
            <DollarSign className="w-4 h-4 mr-2" />
            {processing ? 'Processing...' : 'Run AI Payroll'}
          </Button>
        </div>
      </div>

      {processing && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Processing Payroll</h3>
                <Badge variant="secondary">{progress}%</Badge>
              </div>
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-gray-600">
                AI is validating timesheets, calculating taxes, and preparing direct deposits...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>AI Validation Checks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiChecks.map((check) => (
              <div key={check.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  {check.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {check.status === 'processing' && <Clock className="w-5 h-5 text-yellow-500 animate-spin" />}
                  {check.status === 'pending' && <Clock className="w-5 h-5 text-gray-400" />}
                  <span className="text-sm">{check.check}</span>
                </div>
                <div className="flex items-center gap-2">
                  {check.issues > 0 && (
                    <Badge variant="destructive">{check.issues} issues</Badge>
                  )}
                  <Badge variant={
                    check.status === 'completed' ? 'default' : 
                    check.status === 'processing' ? 'secondary' : 'outline'
                  }>
                    {check.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payroll Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-xl font-bold">{payrollSummary.totalEmployees}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Regular Hours</p>
                <p className="text-xl font-bold">{payrollSummary.regularHours.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Overtime Hours</p>
                <p className="text-xl font-bold text-orange-600">{payrollSummary.overtimeHours}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Gross Pay</p>
                <p className="text-xl font-bold">${payrollSummary.grossPay.toLocaleString()}</p>
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between">
                <span>Gross Pay:</span>
                <span className="font-semibold">${payrollSummary.grossPay.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Deductions:</span>
                <span className="font-semibold">-${payrollSummary.totalDeductions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Net Pay:</span>
                <span>${payrollSummary.netPay.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {aiRecommendations.map((rec, index) => (
            <Alert key={index} className={
              rec.type === 'warning' ? 'border-orange-200 bg-orange-50' :
              rec.type === 'alert' ? 'border-red-200 bg-red-50' :
              'border-blue-200 bg-blue-50'
            }>
              <AlertDescription className="flex justify-between items-center">
                <span>{rec.message}</span>
                <Button size="sm" variant="outline">{rec.action}</Button>
              </AlertDescription>
            </Alert>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}