import TimeTrackingSystem from '@/components/TimeTrackingSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Clock, DollarSign, FileText, Users } from 'lucide-react';

export default function Payroll() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Payroll Management System</h1>
        <div className="text-right">
          <p className="text-sm text-gray-600">Current Pay Period</p>
          <p className="text-lg font-semibold">March 1-15, 2024</p>
        </div>
      </div>

      <Tabs defaultValue="timeclock" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="timeclock">
            <Clock className="w-4 h-4 mr-2" />
            Time Clock
          </TabsTrigger>
          <TabsTrigger value="employees">
            <Users className="w-4 h-4 mr-2" />
            Employees
          </TabsTrigger>
          <TabsTrigger value="calculation">
            <Calculator className="w-4 h-4 mr-2" />
            Pay Calculation
          </TabsTrigger>
          <TabsTrigger value="approval">
            <FileText className="w-4 h-4 mr-2" />
            Timesheet Approval
          </TabsTrigger>
          <TabsTrigger value="processing">
            <DollarSign className="w-4 h-4 mr-2" />
            Payroll Processing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeclock">
          <TimeTrackingSystem />
        </TabsContent>

        <TabsContent value="employees">
          {/* Employee roster with pay rates */}
          <Card>
            <CardHeader>
              <CardTitle>Employee Roster & Pay Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Employee management interface goes here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculation">
          {/* Pay calculation engine */}
          <Card>
            <CardHeader>
              <CardTitle>Pay Period Calculations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Wage calculation interface goes here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approval">
          {/* Timesheet approval workflow */}
          <Card>
            <CardHeader>
              <CardTitle>Timesheet Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Manager approval interface goes here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing">
          {/* Final payroll processing */}
          <Card>
            <CardHeader>
              <CardTitle>Payroll Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Final payroll generation goes here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
