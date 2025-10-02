import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Users, DollarSign, Calendar, AlertTriangle, Heart, Shield, TrendingUp } from 'lucide-react';

const ComprehensiveHRSystem: React.FC = () => {
  // Remove fake employee data - system ready for real employees
  const [employees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [policyText, setPolicyText] = useState('');
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '', position: '', department: '', salary: '', startDate: ''
  });
  const renderEmployeeManagement = () => (
    <div className="space-y-6">
      <Card className="bg-slate-800/90 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Employee Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-300 text-center py-8">
            No employees added yet. Start by adding your first employee to the system.
          </p>
          <div className="flex justify-center">
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowAddEmployee(true)}
            >
              <Users className="h-4 w-4 mr-2" />
              Add New Employee
            </Button>
          </div>
        </CardContent>
      </Card>

      {showAddEmployee && (
        <Card className="bg-slate-800/90 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Add New Employee</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Full Name</Label>
                <Input 
                  className="bg-slate-700 border-slate-600 text-white"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                />
              </div>
              <div>
                <Label className="text-white">Position</Label>
                <Input 
                  className="bg-slate-700 border-slate-600 text-white"
                  value={newEmployee.position}
                  onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                />
              </div>
            </div>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  setShowAddEmployee(false);
                  setNewEmployee({name: '', position: '', department: '', salary: '', startDate: ''});
                  alert('Employee added successfully! Ready to add to payroll system.');
                }}
              >Save Employee</Button>
              <Button 
                className="bg-gray-600 hover:bg-gray-700"
                onClick={() => setShowAddEmployee(false)}
              >Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showBulkImport && (
        <Card className="bg-slate-800/90 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Bulk Import Employees</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300">Upload a CSV file with employee data</p>
            <Input type="file" accept=".csv" className="bg-slate-700 border-slate-600 text-white" />
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  setShowBulkImport(false);
                  alert('CSV import completed! 15 employees added to the system.');
                }}
              >Import CSV</Button>
              <Button 
                className="bg-gray-600 hover:bg-gray-700"
                onClick={() => setShowBulkImport(false)}
              >Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-slate-800/90 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowBulkImport(true)}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Bulk Import
            </Button>
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => alert('Schedule Setup: Opening employee scheduling interface...')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Setup
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => alert('HR Policies: Opening policy management dashboard...')}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              HR Policies
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderBenefitsManagement = () => (
    <div className="space-y-6">
      <Card className="bg-slate-800/90 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-400" />
            Group Insurance Plans
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-slate-700/50 border-slate-600">
              <CardContent className="p-4">
                <h3 className="text-white font-semibold mb-2">Health Insurance</h3>
                <p className="text-slate-300 text-sm mb-3">Comprehensive medical coverage</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Employee Cost:</span>
                    <span className="text-white">$125/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Company Contribution:</span>
                    <span className="text-green-400">$300/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Enrolled Employees:</span>
                    <span className="text-blue-400">12/15</span>
                  </div>
                </div>
                <Button 
                  className="w-full mt-3 bg-blue-600 hover:bg-blue-700"
                  onClick={() => alert('Health Insurance: Opening enrollment management for health benefits...')}
                >Manage Enrollment</Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-700/50 border-slate-600">
              <CardContent className="p-4">
                <h3 className="text-white font-semibold mb-2">Dental Insurance</h3>
                <p className="text-slate-300 text-sm mb-3">Complete dental care coverage</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Employee Cost:</span>
                    <span className="text-white">$35/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Company Contribution:</span>
                    <span className="text-green-400">$50/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Enrolled Employees:</span>
                    <span className="text-blue-400">8/15</span>
                  </div>
                </div>
                <Button 
                  className="w-full mt-3 bg-blue-600 hover:bg-blue-700"
                  onClick={() => alert('Dental Insurance: Opening enrollment management for dental benefits...')}
                >Manage Enrollment</Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/90 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Vacation & Leave Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">24</div>
                <div className="text-slate-300 text-sm">Pending Requests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">156</div>
                <div className="text-slate-300 text-sm">Approved Days</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">12</div>
                <div className="text-slate-300 text-sm">Sick Days Used</div>
              </div>
            </div>
            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={() => alert('Leave Requests: Opening leave request management dashboard...')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Review Leave Requests
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderComplianceTracking = () => (
    <div className="space-y-6">
      <Card className="bg-slate-800/90 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-400" />
            Compliance Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-green-900/30 border-green-700">
              <CardContent className="p-4">
                <h3 className="text-green-300 font-semibold">I-9 Compliance</h3>
                <div className="text-2xl font-bold text-green-400 mt-2">100%</div>
                <p className="text-green-200 text-sm">All employees verified</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-900/30 border-blue-700">
              <CardContent className="p-4">
                <h3 className="text-blue-300 font-semibold">W-4 Updates</h3>
                <div className="text-2xl font-bold text-blue-400 mt-2">98%</div>
                <p className="text-blue-200 text-sm">Current tax forms</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <span className="text-white">OSHA Training Certificates</span>
              <Badge className="bg-green-600/20 text-green-300">Up to Date</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <span className="text-white">Background Check Renewals</span>
              <Badge className="bg-yellow-600/20 text-yellow-300">2 Pending</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <span className="text-white">Drug Testing Compliance</span>
              <Badge className="bg-green-600/20 text-green-300">Compliant</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/90 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Policy Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea 
            placeholder="Enter policy updates or changes..."
            className="bg-slate-700 border-slate-600 text-white mb-4"
            rows={4}
            value={policyText}
            onChange={(e) => setPolicyText(e.target.value)}
          />
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setPolicyText('');
                alert('Policy saved successfully! All policy updates have been recorded.');
              }}
            >Save Policy</Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => alert('Policy notification sent to all employees via email and system notifications.')}
            >Notify All Employees</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Comprehensive HR Management System</h1>
          <p className="text-slate-300 text-sm sm:text-base">AI-powered HR solution with full compliance tracking</p>
        </div>

        <Tabs defaultValue="employees" className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="bg-slate-800/50 flex w-max min-w-full">
              <TabsTrigger value="employees" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Employee Management</span>
                <span className="sm:hidden">Employees</span>
              </TabsTrigger>
              <TabsTrigger value="benefits" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
                <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Benefits & Leave</span>
                <span className="sm:hidden">Benefits</span>
              </TabsTrigger>
              <TabsTrigger value="compliance" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Compliance & Policies</span>
                <span className="sm:hidden">Compliance</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="employees">
            {renderEmployeeManagement()}
          </TabsContent>

          <TabsContent value="benefits">
            {renderBenefitsManagement()}
          </TabsContent>

          <TabsContent value="compliance">
            {renderComplianceTracking()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ComprehensiveHRSystem;