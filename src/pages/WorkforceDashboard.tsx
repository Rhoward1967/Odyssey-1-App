import AdminTimeOverride from '@/components/AdminTimeOverride';
import CustomerManagement from '@/components/CustomerManagement';
import EmployeeManagement from '@/components/EmployeeManagement';
import HandbookContent from '@/components/HandbookContent';
import PayrollProcessing from '@/components/PayrollProcessing';
import TimeTrackingSystem from '@/components/TimeTrackingSystem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getEmployees, type Employee } from '@/lib/supabase/hr-actions';
import {
    AlertCircle,
    BarChart3,
    BookOpen,
    Building,
    Calendar,
    Clock,
    DollarSign,
    Plus,
    Users
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function WorkforceDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const result = await getEmployees();
      if (result.success && result.employees) {
        setEmployees(result.employees);
      }
    } catch (error) {
      console.error('Failed to load employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const workforceStats = {
    totalEmployees: employees.length,
    activeToday: employees.filter(emp => emp.status === 'active').length,
    clockedIn: 0,
    pendingTimesheets: 0,
    payrollDue: 3,
    overtimeHours: 0
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Workforce Management</h1>
            <p className="text-gray-600">Unified HR, Payroll & Time Management System</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Current Time</p>
          <p className="text-xl font-mono">{currentTime.toLocaleTimeString()}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="employees">
            <Users className="w-4 h-4 mr-2" />
            Employees
          </TabsTrigger>
          <TabsTrigger value="time">
            <Clock className="w-4 h-4 mr-2" />
            Time & Attendance
          </TabsTrigger>
          <TabsTrigger value="schedule">
            <Calendar className="w-4 h-4 mr-2" />
            Scheduling
          </TabsTrigger>
          <TabsTrigger value="payroll">
            <DollarSign className="w-4 h-4 mr-2" />
            Payroll
          </TabsTrigger>
          <TabsTrigger value="handbook">
            <BookOpen className="w-4 h-4 mr-2" />
            Handbook
          </TabsTrigger>
          <TabsTrigger value="customers">
            <Building className="w-4 h-4 mr-2" />
            Clients
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Employees</p>
                    <p className="text-2xl font-bold">{workforceStats.totalEmployees}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Clocked In</p>
                    <p className="text-2xl font-bold">{workforceStats.clockedIn}</p>
                  </div>
                  <Clock className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                    <p className="text-2xl font-bold">{workforceStats.pendingTimesheets}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Payroll Due</p>
                    <p className="text-2xl font-bold">{workforceStats.payrollDue} days</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {employees.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="font-semibold mb-2">No Employees Added Yet</h3>
                <p className="text-gray-600 mb-4">Add your first employee to start using the workforce management system</p>
                <Button onClick={() => setActiveTab('employees')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Employee
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="employees">
          <EmployeeManagement />
        </TabsContent>

        <TabsContent value="time" className="space-y-6">
          {employees.length > 0 ? (
            <>
              <AdminTimeOverride />
              <TimeTrackingSystem />
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="font-semibold mb-2">No Employees to Track</h3>
                <p className="text-gray-600 mb-4">Add employees first to use time tracking features</p>
                <Button onClick={() => setActiveTab('employees')}>
                  <Users className="h-4 w-4 mr-2" />
                  Add Employees
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Employee Scheduling</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Employee scheduling interface</p>
                <p className="text-sm">Google Calendar integration ready</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll">
          <PayrollProcessing />
        </TabsContent>

        <TabsContent value="handbook">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Handbook Sections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['cover', 'welcome', 'about'].map((section) => (
                    <Button
                      key={section}
                      variant="ghost"
                      className="w-full justify-start text-left"
                    >
                      {section.charAt(0).toUpperCase() + section.slice(1)}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
            <div className="lg:col-span-3">
              <HandbookContent activeSection="cover" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="customers">
          <CustomerManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
