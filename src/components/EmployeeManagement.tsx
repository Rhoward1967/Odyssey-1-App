import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Search, FileText, Clock, MapPin } from 'lucide-react';

export default function EmployeeManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const employees = [
    {
      id: 1,
      name: 'Maria Rodriguez',
      position: 'Senior Cleaner',
      department: 'Cleaning',
      status: 'Active',
      hireDate: '2022-03-15',
      payRate: 18.50,
      hoursThisWeek: 40,
      phone: '(555) 123-4567',
      email: 'maria.r@hjs.com'
    },
    {
      id: 2,
      name: 'James Wilson',
      position: 'Team Lead',
      department: 'Operations',
      status: 'Active',
      hireDate: '2021-08-22',
      payRate: 22.00,
      hoursThisWeek: 45,
      phone: '(555) 234-5678',
      email: 'james.w@hjs.com'
    },
    {
      id: 3,
      name: 'Sarah Chen',
      position: 'Floor Specialist',
      department: 'Cleaning',
      status: 'Training',
      hireDate: '2024-02-01',
      payRate: 16.00,
      hoursThisWeek: 32,
      phone: '(555) 345-6789',
      email: 'sarah.c@hjs.com'
    }
  ];

  const onboardingTasks = [
    { task: 'Complete I-9 Form', completed: true },
    { task: 'Submit W-4', completed: true },
    { task: 'Background Check', completed: false },
    { task: 'Safety Training', completed: false },
    { task: 'Equipment Assignment', completed: false }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Employee Management</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Full Name" />
              <Input placeholder="Email Address" />
              <Input placeholder="Phone Number" />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                  <SelectItem value="admin">Administration</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Position Title" />
              <Input placeholder="Pay Rate" type="number" step="0.01" />
              <Button className="w-full">Create Employee Profile</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="cleaning">Cleaning</SelectItem>
            <SelectItem value="operations">Operations</SelectItem>
            <SelectItem value="admin">Administration</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">Employee Directory</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="documents">HR Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <div className="grid gap-4">
            {employees.map((employee) => (
              <Card key={employee.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{employee.name}</h3>
                        <p className="text-gray-600">{employee.position} • {employee.department}</p>
                        <p className="text-sm text-gray-500">Hired: {employee.hireDate}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge variant={employee.status === 'Active' ? 'default' : 'secondary'}>
                        {employee.status}
                      </Badge>
                      <div className="text-sm text-gray-600">
                        <p>${employee.payRate}/hr</p>
                        <p>{employee.hoursThisWeek}h this week</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-1" />
                        Profile
                      </Button>
                      <Button variant="outline" size="sm">
                        <Clock className="w-4 h-4 mr-1" />
                        Timesheet
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="onboarding">
          <Card>
            <CardHeader>
              <CardTitle>New Employee Onboarding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold">Sarah Chen</h3>
                    <p className="text-sm text-gray-600">Floor Specialist • Started Feb 1, 2024</p>
                  </div>
                  <Badge variant="outline">In Progress</Badge>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold">Onboarding Checklist:</h4>
                  {onboardingTasks.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded border-2 ${item.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                        {item.completed && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>}
                      </div>
                      <span className={item.completed ? 'line-through text-gray-500' : ''}>{item.task}</span>
                    </div>
                  ))}
                </div>
                
                <Button className="w-full">Send Reminder Email</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Employee Forms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  W-4 Tax Forms
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  I-9 Employment Forms
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Direct Deposit Forms
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>HR Policies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Employee Handbook
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Safety Guidelines
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Benefits Information
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}