import React, { useState, useEffect } from 'react';
import { DollarSign, Calculator, FileText, CreditCard, Settings, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { supabase } from '@/lib/supabase';

interface PayrollCalculation {
  employeeId: string;
  grossPay: number;
  netPay: number;
  totalDeductions: number;
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  medicare: number;
}

interface PayrollRule {
  id: string;
  ruleType: string;
  ruleValue: number;
  ruleCondition: any;
  active: boolean;
}

export default function AdvancedPayrollSystem() {
  const [payrollData, setPayrollData] = useState<PayrollCalculation[]>([]);
  const [payrollRules, setPayrollRules] = useState<PayrollRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');

  const [calculationForm, setCalculationForm] = useState({
    employeeId: '',
    regularHours: 0,
    overtimeHours: 0,
    hourlyRate: 0,
    payPeriod: new Date().toISOString().split('T')[0] + '_' + new Date().toISOString().split('T')[0]
  });

  const [ruleForm, setRuleForm] = useState({
    employeeId: '',
    ruleType: 'overtime',
    ruleValue: 0,
    ruleCondition: {},
    effectiveDate: new Date().toISOString().split('T')[0]
  });

  const calculatePayroll = async () => {
    if (!calculationForm.employeeId) {
      alert('Please select an employee');
      return;
    }

    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke('advanced-payroll-processor', {
        body: {
          action: 'calculate_payroll',
          employeeId: calculationForm.employeeId,
          payPeriod: calculationForm.payPeriod,
          payrollData: calculationForm
        }
      });

      if (data?.success) {
        setPayrollData([...payrollData, data.payroll]);
        alert('Payroll calculated successfully!');
      }
    } catch (error) {
      console.error('Error calculating payroll:', error);
      alert('Error calculating payroll');
    }
    setLoading(false);
  };

  const generatePaystub = async (employeeId: string) => {
    setLoading(true);
    try {
      const employeePayroll = payrollData.find(p => p.employeeId === employeeId);
      
      const { data } = await supabase.functions.invoke('advanced-payroll-processor', {
        body: {
          action: 'generate_paystub',
          employeeId,
          payPeriod: calculationForm.payPeriod,
          payrollData: {
            ...employeePayroll,
            employeeName: `Employee ${employeeId}`
          }
        }
      });

      if (data?.success) {
        // In a real app, this would open/download the paystub
        alert('Paystub generated successfully!');
      }
    } catch (error) {
      console.error('Error generating paystub:', error);
    }
    setLoading(false);
  };

  const processDirectDeposit = async (employeeId: string) => {
    setLoading(true);
    try {
      const employeePayroll = payrollData.find(p => p.employeeId === employeeId);
      
      const { data } = await supabase.functions.invoke('advanced-payroll-processor', {
        body: {
          action: 'process_direct_deposit',
          employeeId,
          payrollData: {
            netPay: employeePayroll?.netPay || 0,
            routingNumber: '123456789',
            accountNumber: '9876543210'
          }
        }
      });

      if (data?.success) {
        alert(`Direct deposit processed: $${employeePayroll?.netPay}`);
      }
    } catch (error) {
      console.error('Error processing direct deposit:', error);
    }
    setLoading(false);
  };

  const createPayrollRule = async () => {
    if (!ruleForm.employeeId || !ruleForm.ruleType) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke('advanced-payroll-processor', {
        body: {
          action: 'create_payroll_rule',
          ruleData: ruleForm
        }
      });

      if (data?.success) {
        setPayrollRules([...payrollRules, data.rule]);
        setRuleForm({
          employeeId: '',
          ruleType: 'overtime',
          ruleValue: 1.5,
          ruleCondition: {},
          effectiveDate: new Date().toISOString().split('T')[0]
        });
        alert('Payroll rule created successfully!');
      }
    } catch (error) {
      console.error('Error creating payroll rule:', error);
    }
    setLoading(false);
  };

  const bulkProcessPayroll = async () => {
    setLoading(true);
    try {
      const mockEmployees = [
        { id: 'emp1', hours: 80, hourlyRate: 15.00 },
        { id: 'emp2', hours: 75, hourlyRate: 16.50 },
        { id: 'emp3', hours: 85, hourlyRate: 14.75 }
      ];

      const { data } = await supabase.functions.invoke('advanced-payroll-processor', {
        body: {
          action: 'bulk_payroll_processing',
          payrollData: { employees: mockEmployees }
        }
      });

      if (data?.success) {
        alert(`Bulk payroll processed for ${data.processedCount} employees`);
      }
    } catch (error) {
      console.error('Error processing bulk payroll:', error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <DollarSign className="h-6 w-6" />
          Advanced Payroll System
        </h2>
        <Button onClick={bulkProcessPayroll} disabled={loading}>
          <Users className="h-4 w-4 mr-2" />
          Bulk Process
        </Button>
      </div>

      <Tabs defaultValue="calculator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="paystubs">Paystubs</TabsTrigger>
          <TabsTrigger value="deposits">Direct Deposit</TabsTrigger>
          <TabsTrigger value="rules">Payroll Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Payroll Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Employee ID"
                  value={calculationForm.employeeId}
                  onChange={(e) => setCalculationForm({...calculationForm, employeeId: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    placeholder="Regular Hours"
                    value={calculationForm.regularHours}
                    onChange={(e) => setCalculationForm({...calculationForm, regularHours: parseFloat(e.target.value)})}
                  />
                  <Input
                    type="number"
                    placeholder="Overtime Hours"
                    value={calculationForm.overtimeHours}
                    onChange={(e) => setCalculationForm({...calculationForm, overtimeHours: parseFloat(e.target.value)})}
                  />
                </div>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Hourly Rate"
                  value={calculationForm.hourlyRate}
                  onChange={(e) => setCalculationForm({...calculationForm, hourlyRate: parseFloat(e.target.value)})}
                />
                <Input
                  placeholder="Pay Period (YYYY-MM-DD_YYYY-MM-DD)"
                  value={calculationForm.payPeriod}
                  onChange={(e) => setCalculationForm({...calculationForm, payPeriod: e.target.value})}
                />
                <Button onClick={calculatePayroll} disabled={loading} className="w-full">
                  Calculate Payroll
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payroll Results</CardTitle>
              </CardHeader>
              <CardContent>
                {payrollData.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No payroll calculations yet</p>
                ) : (
                  <div className="space-y-4">
                    {payrollData.map((payroll, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Employee: {payroll.employeeId}</h4>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => generatePaystub(payroll.employeeId)}>
                              <FileText className="h-3 w-3 mr-1" />
                              Paystub
                            </Button>
                            <Button size="sm" onClick={() => processDirectDeposit(payroll.employeeId)}>
                              <CreditCard className="h-3 w-3 mr-1" />
                              Deposit
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p>Gross Pay: <span className="font-medium">${payroll.grossPay}</span></p>
                            <p>Federal Tax: <span className="text-red-600">${payroll.federalTax}</span></p>
                            <p>State Tax: <span className="text-red-600">${payroll.stateTax}</span></p>
                          </div>
                          <div>
                            <p>Social Security: <span className="text-red-600">${payroll.socialSecurity}</span></p>
                            <p>Medicare: <span className="text-red-600">${payroll.medicare}</span></p>
                            <p className="font-medium">Net Pay: <span className="text-green-600">${payroll.netPay}</span></p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Create Payroll Rule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Employee ID"
                  value={ruleForm.employeeId}
                  onChange={(e) => setRuleForm({...ruleForm, employeeId: e.target.value})}
                />
                <Select value={ruleForm.ruleType} onValueChange={(value) => setRuleForm({...ruleForm, ruleType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overtime">Overtime Multiplier</SelectItem>
                    <SelectItem value="bonus">Performance Bonus</SelectItem>
                    <SelectItem value="deduction">Custom Deduction</SelectItem>
                    <SelectItem value="holiday">Holiday Pay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Rule Value"
                  value={ruleForm.ruleValue}
                  onChange={(e) => setRuleForm({...ruleForm, ruleValue: parseFloat(e.target.value)})}
                />
                <Input
                  type="date"
                  value={ruleForm.effectiveDate}
                  onChange={(e) => setRuleForm({...ruleForm, effectiveDate: e.target.value})}
                />
              </div>
              <Button onClick={createPayrollRule} disabled={loading} className="w-full">
                Create Rule
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}