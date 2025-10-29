import {
  Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
// Make sure this path is correct for your project
import { supabase } from '../lib/supabaseClient';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

// --- Interfaces matching your Supabase Schema ---
interface Employee {
  id: string; // uuid PK
  employee_id: string; // unique text id
  email: string;
  organization_id: number; // bigint FK to organizations.id
  supervisor_id?: string; // uuid FK (self-ref)
  department?: string;
  hourly_rate?: number; // numeric/real
  salary?: number; // numeric/real
  status: string; // text
  created_by?: string; // uuid FK to auth.users
  updated_by?: string; // uuid FK to auth.users
}

interface TimeEntry {
  id: string; // uuid PK
  employee_id: string; // uuid FK to employees.id
  clock_in: string; // timestamptz
  clock_out: string; // timestamptz
  break_start?: string; // timestamptz
  break_end?: string; // timestamptz
  total_hours?: number; // numeric/real
  regular_hours?: number; // numeric/real
  overtime_hours?: number; // numeric/real
  status: string; // text ('active', 'completed', 'edited', 'flagged')
  processing_state?: 'pending' | 'processed' | null; // text (nullable, from Option A)
  flags?: string[]; // text[] or jsonb?
}

// --- Component Props (Org ID is bigint, User ID is uuid) ---
interface WorkforceManagementProps {
  organizationId: number; // bigint
  userId: string;         // uuid
}

// --- THE FUNCTIONAL COMPONENT ---

export const WorkforceManagementSystem: React.FC<WorkforceManagementProps> = ({ organizationId, userId }) => {
  const [activeWorkforceTab, setActiveWorkforceTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  // --- REAL DATA STATE ---
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [payrollStatus, setPayrollStatus] = useState<string>('Idle'); // Idle, Processing, Complete, Error

  // --- HR/Onboarding Form State ---
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpEmployeeId, setNewEmpEmployeeId] = useState('');
  const [newEmpDepartment, setNewEmpDepartment] = useState('');
  const [newEmpHourlyRate, setNewEmpHourlyRate] = useState<number | string>(''); // Use string for input flexibility

  // --- Timekeeping Form State ---
  const [timeEmployeeId, setTimeEmployeeId] = useState<string>(''); // This is the employee's uuid
  const [timeClockIn, setTimeClockIn] = useState('');
  const [timeClockOut, setTimeClockOut] = useState('');

  // --- Payroll Run Form State ---
  const [payrollStartDate, setPayrollStartDate] = useState('');
  const [payrollEndDate, setPayrollEndDate] = useState('');

  // --- DATA LOADING (Tied to organizationId) ---
  useEffect(() => {
    if (!organizationId) {
      setIsLoading(false); // Can't load without org ID
      return;
    } 

    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        // Fetch employees for this organization
        const { data: employeesData, error: employeesError } = await supabase
          .from('employees')
          .select('*')
          .eq('organization_id', organizationId);
        
        if (employeesError) throw employeesError;
        const fetchedEmployees = employeesData || [];
        setEmployees(fetchedEmployees);

        // Fetch time entries only if employees exist
        if (fetchedEmployees.length > 0) {
          const employeeUuids = fetchedEmployees.map(e => e.id);
          const { data: timeEntriesData, error: timeEntriesError } = await supabase
            .from('time_entries')
            .select('*')
            .in('employee_id', employeeUuids)
            .order('clock_in', { ascending: false }); // Show recent first
          
          if (timeEntriesError) throw timeEntriesError;
          setTimeEntries(timeEntriesData || []);
        } else {
          setTimeEntries([]); // No employees, so no time entries
        }
      } catch (error) {
        console.error('Error loading data:', (error as Error).message);
        // Optionally set an error state here to show in the UI
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAllData();
  }, [organizationId]); // Refetch if the org changes

  // --- FUNCTIONAL: Add New Employee (Saves to DB) ---
  const handleAddNewEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpEmail || !newEmpEmployeeId) {
      alert('Email and Employee ID are required.');
      return;
    }
    
    const rate = parseFloat(newEmpHourlyRate.toString()); // Convert string input to number

    const newEmployee = {
      email: newEmpEmail,
      employee_id: newEmpEmployeeId,
      department: newEmpDepartment || null, // Handle optional field
      hourly_rate: isNaN(rate) ? null : rate, // Handle invalid number input
      organization_id: organizationId,
      status: 'Active',
      created_by: userId,
      updated_by: userId,
    };

    const { data, error } = await supabase
      .from('employees')
      .insert(newEmployee)
      .select()
      .single();

    if (error) {
      console.error('Error adding employee:', error);
      alert(`Error: ${error.message}`);
    } else if (data) {
      setEmployees([...employees, data]); // Add to local state
      // Reset form
      setNewEmpEmail('');
      setNewEmpEmployeeId('');
      setNewEmpDepartment('');
      setNewEmpHourlyRate('');
      setActiveWorkforceTab('employees');
    }
  };

  // --- FUNCTIONAL: Log New Time Entry (Saves to DB, uses processing_state) ---
  const handleLogTime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!timeEmployeeId || !timeClockIn || !timeClockOut) {
      alert('Please select an employee and set valid clock-in/out times.');
      return;
    }

    const clockInTime = new Date(timeClockIn);
    const clockOutTime = new Date(timeClockOut);

    if (clockOutTime <= clockInTime) {
      alert('Clock-out time must be after clock-in time.');
      return;
    }

    // Basic calculation (replace with more robust logic if needed)
    const totalMillis = clockOutTime.getTime() - clockInTime.getTime();
    const totalHours = totalMillis / (1000 * 60 * 60);
    // You'll need more complex logic here based on your payroll_rules
    // For now, simple daily OT over 8 hours
    const regularHours = Math.min(totalHours, 8); 
    const overtimeHours = Math.max(totalHours - 8, 0);

    const newTimeEntry = {
      employee_id: timeEmployeeId,
      clock_in: clockInTime.toISOString(),
      clock_out: clockOutTime.toISOString(),
      total_hours: totalHours,
      regular_hours: regularHours,
      overtime_hours: overtimeHours,
      status: 'completed', // Using your schema's value
      processing_state: 'pending' as const, // Set the new state for payroll
    };

    const { data, error } = await supabase
      .from('time_entries')
      .insert(newTimeEntry)
      .select()
      .single();
    
    if (error) {
      console.error('Error logging time:', error);
      alert(`Error: ${error.message}`);
    } else if (data) {
      setTimeEntries([data, ...timeEntries]); // Add to start of list
      // Reset form
      setTimeEmployeeId('');
      setTimeClockIn('');
      setTimeClockOut('');
    }
  };

  // --- FUNCTIONAL: Trigger Payroll Run (Calls Edge Function) ---
  const handleRunPayroll = async () => {
    if (!payrollStartDate || !payrollEndDate) {
      alert('Please select a valid pay period start and end date.');
      return;
    }
    setPayrollStatus('1. Requesting payroll run...');
    
    // Call the Edge Function, which then calls the SQL function
    const { data, error } = await supabase.functions.invoke('run-payroll', {
      body: { 
        organization_id: organizationId,
        period_start: payrollStartDate, 
        period_end: payrollEndDate
      }
    });

    if (error) {
      setPayrollStatus(`Error: ${error.message}`);
      console.error('Edge Function Error:', error);
    } else {
      // Assuming the function returns { status: 'success', message: '...', ... }
      setPayrollStatus(`Run Complete: ${data?.message || 'Check logs'}`);
      // Refresh data after payroll runs
      // Consider more targeted refresh (e.g., only time entries and paystubs)
      // await fetchAllData(); 
    }
  };
  
  // --- RENDER ---
  if (isLoading) {
    return <p className="text-white p-4">Loading Workforce Data...</p>;
  }

  return (
    <div className="space-y-6 text-white">
      <Card className="border-blue-500/50 bg-slate-800/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-300">
            <Users className="h-6 w-6" />
            Workforce Management
          </CardTitle>
          <p className="text-sm text-gray-400">Manage employees, time tracking, and payroll for your organization.</p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeWorkforceTab} onValueChange={setActiveWorkforceTab}>
            <TabsList className="grid w-full grid-cols-5 mb-6 bg-slate-900/70">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="employees">Employees ({employees.length})</TabsTrigger>
              <TabsTrigger value="timekeeping">Time Tracking</TabsTrigger>
              <TabsTrigger value="payroll">Payroll</TabsTrigger>
              <TabsTrigger value="onboarding">Add Employee</TabsTrigger>
            </TabsList>

            {/* --- Overview Tab --- */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <Card className="bg-blue-900/50 p-4 rounded-lg">
                   <CardTitle className="text-2xl font-bold text-blue-300">{employees.length}</CardTitle>
                   <CardContent className="p-0 text-sm text-blue-400">Total Employees</CardContent>
                 </Card>
                 <Card className="bg-orange-900/50 p-4 rounded-lg">
                   <CardTitle className="text-2xl font-bold text-orange-300">
                     {timeEntries.filter(t => t.processing_state === 'pending').length}
                   </CardTitle>
                   <CardContent className="p-0 text-sm text-orange-400">Pending Time Entries</CardContent>
                 </Card>
                 {/* Add more overview cards as needed */}
              </div>
            </TabsContent>

            {/* --- Employees Tab (Reads from DB) --- */}
            <TabsContent value="employees" className="space-y-4">
              {employees.length === 0 ? (
                <p className="text-gray-400">No employees found. Use the 'Add Employee' tab.</p>
              ) : (
                employees.map(emp => (
                  <Card key={emp.id} className="p-4 bg-slate-700/50 border-slate-600">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <div>
                        <h4 className="font-medium">{emp.email}</h4>
                        <p className="text-sm text-gray-400">ID: {emp.employee_id}</p>
                      </div>
                      <p className="text-sm"><span className="text-gray-400">Dept:</span> {emp.department || 'N/A'}</p>
                      <p className="text-sm"><span className="text-gray-400">Rate:</span> ${emp.hourly_rate?.toFixed(2) || 'N/A'}/hr</p>
                      <Badge variant={emp.status === 'Active' ? 'default' : 'secondary'}>{emp.status}</Badge>
                      {/* Add Edit/Terminate buttons here */}
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* --- FUNCTIONAL Timekeeping Tab --- */}
            <TabsContent value="timekeeping" className="space-y-6">
              <Card className="bg-slate-700/50 border-slate-600">
                <CardHeader><CardTitle>Log New Time Entry</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handleLogTime} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="time-employee-select">Employee</Label>
                      <Select value={timeEmployeeId} onValueChange={setTimeEmployeeId}>
                        <SelectTrigger id="time-employee-select" className="bg-slate-800 border-slate-600">
                          <SelectValue placeholder="Select an employee" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 text-white border-slate-600">
                          {employees.map(emp => (
                            <SelectItem key={emp.id} value={emp.id} className="focus:bg-slate-700">
                              {emp.email} (ID: {emp.employee_id})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="time-clock-in">Clock In</Label>
                        <Input id="time-clock-in" type="datetime-local" value={timeClockIn} onChange={e => setTimeClockIn(e.target.value)} className="bg-slate-800 border-slate-600" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time-clock-out">Clock Out</Label>
                        <Input id="time-clock-out" type="datetime-local" value={timeClockOut} onChange={e => setTimeClockOut(e.target.value)} className="bg-slate-800 border-slate-600" />
                      </div>
                    </div>
                    <Button type="submit">Log Time Entry</Button>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Recent Time Entries</h3>
                 {timeEntries.length === 0 ? (
                   <p className="text-gray-400">No time entries logged yet.</p>
                 ) : (
                    timeEntries.slice(0, 10).map(entry => ( // Show last 10
                      <Card key={entry.id} className="p-3 bg-slate-900/50 border-slate-700">
                        <div className="flex justify-between items-center">
                          <div>
                            <p>{employees.find(e => e.id === entry.employee_id)?.email || 'Unknown Employee'}</p>
                            <p className="text-sm text-gray-400">
                              In: {new Date(entry.clock_in).toLocaleString()} | 
                              Out: {new Date(entry.clock_out).toLocaleString()} |
                              Hours: {entry.total_hours?.toFixed(2) ?? 'N/A'}
                            </p>
                          </div>
                          <Badge 
                            className={entry.processing_state === 'pending' ? 'bg-orange-600' : 'bg-green-600'}
                          >
                            {entry.processing_state || 'N/A'}
                          </Badge>
                        </div>
                      </Card>
                    ))
                 )}
              </div>
            </TabsContent>

            {/* --- FUNCTIONAL Payroll Tab --- */}
            <TabsContent value="payroll" className="space-y-4">
              <Card className="bg-slate-700/50 border-slate-600">
                <CardHeader>
                  <CardTitle>Run Payroll</CardTitle>
                  <p className="text-sm text-gray-400">Select pay period and initiate payroll processing via secure backend function.</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                         <Label htmlFor="payroll-start">Pay Period Start</Label>
                         <Input id="payroll-start" type="date" value={payrollStartDate} onChange={e => setPayrollStartDate(e.target.value)} className="bg-slate-800 border-slate-600" />
                       </div>
                       <div className="space-y-2">
                         <Label htmlFor="payroll-end">Pay Period End</Label>
                         <Input id="payroll-end" type="date" value={payrollEndDate} onChange={e => setPayrollEndDate(e.target.value)} className="bg-slate-800 border-slate-600" />
                       </div>
                     </div>
                    <Button 
                      onClick={handleRunPayroll} 
                      disabled={payrollStatus.startsWith('Processing') || !payrollStartDate || !payrollEndDate}
                      className="w-full"
                    >
                      {payrollStatus.startsWith('Processing') ? 'Processing...' : 'Run Payroll'}
                    </Button>
                    <p className="text-center text-gray-400">Status: {payrollStatus}</p>
                  </div>
                </CardContent>
              </Card>
              {/* Add section to display results from payroll_runs table */}
            </TabsContent>

            {/* --- FUNCTIONAL Onboarding Tab --- */}
            <TabsContent value="onboarding" className="space-y-4">
              <Card className="bg-slate-700/50 border-slate-600">
                <CardHeader>
                  <CardTitle>Add New Employee</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddNewEmployee} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="emp-email">Employee Email</Label>
                      <Input id="emp-email" type="email" value={newEmpEmail} onChange={e => setNewEmpEmail(e.target.value)} required className="bg-slate-800 border-slate-600" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emp-id">Employee ID (Unique Text)</Label>
                      <Input id="emp-id" value={newEmpEmployeeId} onChange={e => setNewEmpEmployeeId(e.target.value)} required className="bg-slate-800 border-slate-600" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emp-dept">Department</Label>
                      <Input id="emp-dept" value={newEmpDepartment} onChange={e => setNewEmpDepartment(e.target.value)} className="bg-slate-800 border-slate-600" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emp-rate">Hourly Rate ($)</Label>
                      <Input id="emp-rate" type="number" step="0.01" value={newEmpHourlyRate} onChange={e => setNewEmpHourlyRate(e.target.value)} className="bg-slate-800 border-slate-600" />
                    </div>
                    {/* Add inputs for salary, employment_type etc. if needed */}
                    <Button type="submit">Add Employee to Organization</Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkforceManagementSystem;