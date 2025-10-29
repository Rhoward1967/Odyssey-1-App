import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function PayrollProcessing() {
  const [currentStep, setCurrentStep] = useState(2);

  const payrollSteps = [
    { id: 1, title: 'Import Timesheets', status: 'complete' },
    { id: 2, title: 'Calculate Wages', status: 'processing' },
    { id: 3, title: 'Apply Deductions', status: 'pending' },
    { id: 4, title: 'Generate Pay Stubs', status: 'pending' },
    { id: 5, title: 'Process Payments', status: 'pending' }
  ];

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing': return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Payroll Header */}
      <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            Payroll Processing Center
          </CardTitle>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Pay Period: March 1-15, 2024</p>
              <p className="text-green-100">Pay Date: March 22, 2024</p>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white">
              Step {currentStep} of 5
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Payroll Workflow Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Processing Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payrollSteps.map((step) => (
              <div key={step.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStepIcon(step.status)}
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                    {step.id}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{step.title}</h3>
                </div>
                <Badge variant={
                  step.status === 'complete' ? 'default' :
                  step.status === 'processing' ? 'secondary' :
                  'outline'
                }>
                  {step.status.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
