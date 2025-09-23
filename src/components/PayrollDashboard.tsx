import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, DollarSign, Users, Clock, FileText, AlertTriangle, Building2, Brain } from 'lucide-react';
import DirectDepositManager from './DirectDepositManager';
import AIPayrollProcessor from './AIPayrollProcessor';
import PayrollTutorialBot from './PayrollTutorialBot';

export default function PayrollDashboard() {
  const [payPeriod, setPayPeriod] = useState('current');
  const [activeTab, setActiveTab] = useState('overview');

  // Remove all fake data - system should be ready for real employees
  const payrollStats = {
    totalEmployees: 0,
    contractors: 0,
    totalHours: 0,
    grossPay: 0,
    netPay: 0,
    taxes: 0,
    benefits: 0
  };

  const paySchedules: any[] = [];
  const complianceItems: any[] = [];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold">Advanced Payroll System</h1>
        <div className="flex flex-col space-y-2 sm:flex-row sm:gap-3 sm:space-y-0">
          <Select value={payPeriod} onValueChange={setPayPeriod}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Period</SelectItem>
              <SelectItem value="previous">Previous Period</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2 sm:gap-3">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => alert('Export functionality will be implemented')}>
              <FileText className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">Export</span>
            </Button>
            <Button size="sm" className="flex-1 sm:flex-none" onClick={() => alert('AI Payroll processing will be implemented')}>
              <Brain className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">AI Process</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Employees</p>
                <p className="text-2xl font-bold">{payrollStats.totalEmployees}</p>
                <p className="text-xs text-gray-500">+{payrollStats.contractors} contractors</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold">{payrollStats.totalHours.toLocaleString()}</p>
              </div>
              <Clock className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gross Pay</p>
                <p className="text-2xl font-bold">${payrollStats.grossPay.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Net Pay</p>
                <p className="text-2xl font-bold">${payrollStats.netPay.toLocaleString()}</p>
              </div>
              <Building2 className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto">
          <TabsList className="flex w-max min-w-full">
            <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 sm:px-4">Overview</TabsTrigger>
            <TabsTrigger value="tutorial" className="text-xs sm:text-sm px-2 sm:px-4">Tutorial</TabsTrigger>
            <TabsTrigger value="schedules" className="text-xs sm:text-sm px-2 sm:px-4">Pay Schedules</TabsTrigger>
            <TabsTrigger value="deposits" className="text-xs sm:text-sm px-2 sm:px-4">Direct Deposit</TabsTrigger>
            <TabsTrigger value="ai-processor" className="text-xs sm:text-sm px-2 sm:px-4">AI Processor</TabsTrigger>
            <TabsTrigger value="compliance" className="text-xs sm:text-sm px-2 sm:px-4">Compliance</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pay Period Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Gross Pay:</span>
                  <span className="font-semibold">${payrollStats.grossPay.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Federal Taxes:</span>
                  <span className="font-semibold">-${(payrollStats.taxes * 0.6).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>State Taxes:</span>
                  <span className="font-semibold">-${(payrollStats.taxes * 0.25).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>FICA:</span>
                  <span className="font-semibold">-${(payrollStats.taxes * 0.15).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Benefits:</span>
                  <span className="font-semibold">-${payrollStats.benefits.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Net Pay:</span>
                  <span>${payrollStats.netPay.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                    <span className="text-sm">Payroll processed for 03/15/2024</span>
                    <Badge variant="secondary">Completed</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded">
                    <span className="text-sm">Tax filing due 04/15/2024</span>
                    <Badge variant="outline">Upcoming</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                    <span className="text-sm">New employee onboarded</span>
                    <Badge>Recent</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tutorial">
          <PayrollTutorialBot />
        </TabsContent>

        <TabsContent value="schedules">
          <div className="space-y-6">
            {paySchedules.map((schedule, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-lg">{schedule.type}</h3>
                      <p className="text-sm text-gray-600">{schedule.employees} employees</p>
                      <p className="text-sm text-gray-500">Next payment: {schedule.nextDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">${schedule.amount.toLocaleString()}</p>
                      <Button size="sm" className="mt-2">Process Payment</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="deposits">
          <DirectDepositManager />
        </TabsContent>

        <TabsContent value="ai-processor">
          <AIPayrollProcessor />
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Compliance Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">{item.item}</p>
                      <p className="text-sm text-gray-600">Due: {item.dueDate}</p>
                    </div>
                    <Badge variant={item.status === 'current' ? 'default' : 'destructive'}>
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}