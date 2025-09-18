import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, CreditCard, Shield, CheckCircle, AlertCircle } from 'lucide-react';

export default function DirectDepositManager() {
  const [activeTab, setActiveTab] = useState('accounts');

  const bankAccounts = [
    { id: 1, name: 'Primary Business Account', bank: 'Wells Fargo', account: '****1234', routing: '121000248', status: 'verified', balance: 125000.00 },
    { id: 2, name: 'Payroll Account', bank: 'Bank of America', account: '****5678', routing: '026009593', status: 'verified', balance: 85000.00 },
    { id: 3, name: 'Tax Withholding Account', bank: 'Chase Bank', account: '****9012', routing: '021000021', status: 'pending', balance: 45000.00 }
  ];

  const employeeAccounts = [
    { id: 1, name: 'Maria Rodriguez', account: '****4567', bank: 'Wells Fargo', status: 'active', amount: 1850.00 },
    { id: 2, name: 'James Wilson', account: '****8901', bank: 'Chase', status: 'active', amount: 2100.00 },
    { id: 3, name: 'Sarah Chen', account: '****2345', bank: 'Bank of America', status: 'pending', amount: 1950.00 },
    { id: 4, name: 'Michael Brown', account: '****6789', bank: 'Credit Union', status: 'active', amount: 1750.00 }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Direct Deposit Management</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => alert('Security settings will be implemented')}>
            <Shield className="w-4 h-4 mr-2" />
            Security Settings
          </Button>
          <Button onClick={() => alert('Add bank account form will be implemented')}>
            <CreditCard className="w-4 h-4 mr-2" />
            Add Bank Account
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="accounts">Company Accounts</TabsTrigger>
          <TabsTrigger value="employees">Employee Setup</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-6">
          <div className="grid gap-4">
            {bankAccounts.map((account) => (
              <Card key={account.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <Building2 className="w-8 h-8 text-blue-500" />
                      <div>
                        <h3 className="font-semibold">{account.name}</h3>
                        <p className="text-sm text-gray-600">{account.bank} • {account.account}</p>
                        <p className="text-sm text-gray-500">Routing: {account.routing}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={account.status === 'verified' ? 'default' : 'secondary'}>
                        {account.status === 'verified' ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <AlertCircle className="w-3 h-3 mr-1" />
                        )}
                        {account.status}
                      </Badge>
                      <p className="text-lg font-bold mt-2">${account.balance.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Add New Bank Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input id="accountName" placeholder="e.g., Payroll Account" />
                </div>
                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input id="bankName" placeholder="e.g., Wells Fargo" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="routingNumber">Routing Number</Label>
                  <Input id="routingNumber" placeholder="9-digit routing number" />
                </div>
                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input id="accountNumber" placeholder="Account number" />
                </div>
              </div>
              <Button className="w-full">Add Account & Verify</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <div className="grid gap-4">
            {employeeAccounts.map((employee) => (
              <Card key={employee.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{employee.name}</h3>
                      <p className="text-sm text-gray-600">{employee.bank} • {employee.account}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                        {employee.status}
                      </Badge>
                      <p className="font-bold">${employee.amount.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="processing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Direct Deposit Processing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Processing Schedule</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="biweekly">Bi-weekly (Every 2 weeks)</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="semimonthly">Semi-monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Next Processing Date</Label>
                  <Input type="date" />
                </div>
              </div>
              <Button className="w-full" size="lg">
                Process Direct Deposits
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}