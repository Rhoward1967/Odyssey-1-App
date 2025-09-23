import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PayrollDashboard from '@/components/PayrollDashboard';
import AdvancedPayrollSystem from '@/components/AdvancedPayrollSystem';
import ComprehensiveHRSystem from '@/components/ComprehensiveHRSystem';

const TestPayrollAndHR: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <h1 className="text-3xl font-bold mb-6">Payroll and HR Systems Test</h1>
      
      <Tabs defaultValue="payroll-dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="payroll-dashboard">Payroll Dashboard</TabsTrigger>
          <TabsTrigger value="advanced-payroll">Advanced Payroll</TabsTrigger>
          <TabsTrigger value="hr-system">HR System</TabsTrigger>
        </TabsList>
        
        <TabsContent value="payroll-dashboard" className="mt-6">
          <PayrollDashboard />
        </TabsContent>
        
        <TabsContent value="advanced-payroll" className="mt-6">
          <AdvancedPayrollSystem />
        </TabsContent>
        
        <TabsContent value="hr-system" className="mt-6">
          <ComprehensiveHRSystem />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestPayrollAndHR;