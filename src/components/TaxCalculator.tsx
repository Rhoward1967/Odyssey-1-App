import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, DollarSign, FileText, AlertCircle } from 'lucide-react';

export default function TaxCalculator() {
  const [payrollData, setPayrollData] = useState({
    grossPay: 0,
    payPeriod: 'biweekly',
    state: 'FL',
    filingStatus: 'single',
    allowances: 0
  });

  const [taxCalculation, setTaxCalculation] = useState({
    federalTax: 0,
    stateTax: 0,
    ficaTax: 0,
    medicareTax: 0,
    totalTax: 0,
    netPay: 0
  });

  const calculateTaxes = () => {
    const gross = payrollData.grossPay;
    
    // Federal tax calculation (simplified)
    const federalRate = payrollData.filingStatus === 'single' ? 0.12 : 0.10;
    const federalTax = gross * federalRate;
    
    // State tax (Florida has no state income tax)
    const stateTax = payrollData.state === 'FL' ? 0 : gross * 0.05;
    
    // FICA (Social Security) - 6.2%
    const ficaTax = gross * 0.062;
    
    // Medicare - 1.45%
    const medicareTax = gross * 0.0145;
    
    const totalTax = federalTax + stateTax + ficaTax + medicareTax;
    const netPay = gross - totalTax;

    setTaxCalculation({
      federalTax,
      stateTax,
      ficaTax,
      medicareTax,
      totalTax,
      netPay
    });
  };

  const taxForms = [
    { form: 'Form 941', description: 'Quarterly Federal Tax Return', dueDate: 'Quarterly' },
    { form: 'Form 940', description: 'Federal Unemployment Tax', dueDate: 'Annual' },
    { form: 'W-2 Forms', description: 'Employee Wage Statements', dueDate: 'January 31' },
    { form: '1099-NEC', description: 'Contractor Payments', dueDate: 'January 31' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Calculator className="h-8 w-8 text-blue-600" />
          Tax Calculator & Compliance
        </h1>
        <Button>
          <FileText className="w-4 h-4 mr-2" />
          Generate Tax Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Payroll Tax Calculator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="grossPay">Gross Pay</Label>
              <Input
                id="grossPay"
                type="number"
                step="0.01"
                value={payrollData.grossPay}
                onChange={(e) => setPayrollData({...payrollData, grossPay: parseFloat(e.target.value) || 0})}
                placeholder="Enter gross pay amount"
              />
            </div>

            <div>
              <Label htmlFor="payPeriod">Pay Period</Label>
              <Select value={payrollData.payPeriod} onValueChange={(value) => setPayrollData({...payrollData, payPeriod: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="state">State</Label>
              <Select value={payrollData.state} onValueChange={(value) => setPayrollData({...payrollData, state: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FL">Florida</SelectItem>
                  <SelectItem value="GA">Georgia</SelectItem>
                  <SelectItem value="AL">Alabama</SelectItem>
                  <SelectItem value="SC">South Carolina</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="filingStatus">Filing Status</Label>
              <Select value={payrollData.filingStatus} onValueChange={(value) => setPayrollData({...payrollData, filingStatus: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="married">Married Filing Jointly</SelectItem>
                  <SelectItem value="head">Head of Household</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={calculateTaxes} className="w-full">
              <Calculator className="w-4 h-4 mr-2" />
              Calculate Taxes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tax Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>Gross Pay:</span>
                <span className="font-semibold">${payrollData.grossPay.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                <span>Federal Tax:</span>
                <span className="font-semibold text-red-600">-${taxCalculation.federalTax.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                <span>State Tax:</span>
                <span className="font-semibold text-blue-600">-${taxCalculation.stateTax.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                <span>FICA (Social Security):</span>
                <span className="font-semibold text-yellow-600">-${taxCalculation.ficaTax.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                <span>Medicare Tax:</span>
                <span className="font-semibold text-purple-600">-${taxCalculation.medicareTax.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded border-t-2 border-orange-200">
                <span className="font-bold">Total Taxes:</span>
                <span className="font-bold text-orange-600">-${taxCalculation.totalTax.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 rounded border-2 border-green-200">
                <span className="font-bold text-lg">Net Pay:</span>
                <span className="font-bold text-lg text-green-600">${taxCalculation.netPay.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Tax Compliance & Forms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {taxForms.map((form, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">{form.form}</p>
                  <p className="text-sm text-gray-600">{form.description}</p>
                  <p className="text-xs text-orange-600">Due: {form.dueDate}</p>
                </div>
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-1" />
                  Generate
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}