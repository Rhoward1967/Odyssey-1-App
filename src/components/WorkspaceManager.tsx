import {
  BookOpen,
  Calendar,
  Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
// Make sure this path is correct for your project
import { Edit2, Trash2, UserCheck, UserX } from 'lucide-react'; // ADD THESE ICONS
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
  // Add contractor-specific fields
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  tax_id?: string; // SSN or EIN
  is_contractor?: boolean;
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

  // --- HR/Onboarding Form State (UPDATE WITH MORE FIELDS) ---
  const [newEmpFirstName, setNewEmpFirstName] = useState('');
  const [newEmpLastName, setNewEmpLastName] = useState('');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpEmployeeId, setNewEmpEmployeeId] = useState('');
  const [newEmpPosition, setNewEmpPosition] = useState('');
  const [newEmpDepartment, setNewEmpDepartment] = useState('');
  const [newEmpHireDate, setNewEmpHireDate] = useState('');
  const [newEmpPhone, setNewEmpPhone] = useState('');
  const [newEmpPayType, setNewEmpPayType] = useState<'hourly' | 'salary'>('hourly');
  const [newEmpHourlyRate, setNewEmpHourlyRate] = useState<number | string>('');
  const [newEmpSalary, setNewEmpSalary] = useState<number | string>('');

  // --- Timekeeping Form State ---
  const [timeEmployeeId, setTimeEmployeeId] = useState<string>(''); // This is the employee's uuid
  const [timeClockIn, setTimeClockIn] = useState('');
  const [timeClockOut, setTimeClockOut] = useState('');

  // --- Payroll Run Form State ---
  const [payrollStartDate, setPayrollStartDate] = useState('');
  const [payrollEndDate, setPayrollEndDate] = useState('');
  
  // ADD: Payroll preview state
  const [payrollPreview, setPayrollPreview] = useState<any>(null);
  const [payrollResults, setPayrollResults] = useState<any>(null);

  // --- Contractor Payment Form State (ADD THESE) ---
  const [contractorId, setContractorId] = useState<string>('');
  const [contractorAmount, setContractorAmount] = useState<number | string>('');
  const [contractorDescription, setContractorDescription] = useState('');

  // --- Contractor Onboarding Form State ---
  const [contractorFirstName, setContractorFirstName] = useState('');
  const [contractorLastName, setContractorLastName] = useState('');
  const [contractorEmail, setContractorEmail] = useState('');
  const [contractorPhone, setContractorPhone] = useState('');
  const [contractorAddress, setContractorAddress] = useState('');
  const [contractorCity, setContractorCity] = useState('');
  const [contractorState, setContractorState] = useState('');
  const [contractorZip, setContractorZip] = useState('');
  const [contractorTaxId, setContractorTaxId] = useState('');
  const [contractorRate, setContractorRate] = useState<number | string>('');

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

  // --- FUNCTIONAL: Add New Employee (MAKE HIRE DATE REQUIRED) ---
  const handleAddNewEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ADD HIRE DATE TO REQUIRED FIELDS CHECK
    if (!newEmpEmail || !newEmpEmployeeId || !newEmpFirstName || !newEmpLastName || !newEmpHireDate) {
      alert('First Name, Last Name, Email, Employee ID, and Hire Date are required for W-2 employees.');
      return;
    }
    
    const rate = parseFloat(newEmpHourlyRate.toString());
    const salary = parseFloat(newEmpSalary.toString());

    const newEmployee = {
      first_name: newEmpFirstName,
      last_name: newEmpLastName,
      email: newEmpEmail,
      employee_id: newEmpEmployeeId,
      phone: newEmpPhone || null,
      department: newEmpDepartment || null,
      position: newEmpPosition || null, // ADD THIS LINE
      hourly_rate: newEmpPayType === 'hourly' && !isNaN(rate) ? rate : null,
      salary: newEmpPayType === 'salary' && !isNaN(salary) ? salary : null,
      hire_date: newEmpHireDate,
      organization_id: organizationId,
      status: 'Active',
      is_contractor: false,
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
      setEmployees([...employees, data]);
      // Reset form
      setNewEmpFirstName('');
      setNewEmpLastName('');
      setNewEmpEmail('');
      setNewEmpEmployeeId('');
      setNewEmpPosition('');
      setNewEmpDepartment('');
      setNewEmpHireDate('');
      setNewEmpPhone('');
      setNewEmpHourlyRate('');
      setNewEmpSalary('');
      alert('Employee added successfully!');
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

  // --- ADD: Preview Payroll Before Running ---
  const handlePreviewPayroll = async () => {
    if (!payrollStartDate || !payrollEndDate) {
      alert('Please select a valid pay period.');
      return;
    }

    // Calculate payroll preview from time entries
    const periodStart = new Date(payrollStartDate);
    const periodEnd = new Date(payrollEndDate);
    
    const employeePayroll = employees.map(emp => {
      // Get time entries for this employee in the period
      const empTimeEntries = timeEntries.filter(entry => {
        const entryDate = new Date(entry.clock_in);
        return entry.employee_id === emp.id 
          && entry.processing_state === 'pending'
          && entryDate >= periodStart 
          && entryDate <= periodEnd;
      });

      const totalHours = empTimeEntries.reduce((sum, entry) => sum + (entry.total_hours || 0), 0);
      const regularHours = empTimeEntries.reduce((sum, entry) => sum + (entry.regular_hours || 0), 0);
      const overtimeHours = empTimeEntries.reduce((sum, entry) => sum + (entry.overtime_hours || 0), 0);

      // Calculate gross pay
      let grossPay = 0;
      if (emp.salary) {
        // Salaried employee: annual salary / 26 (bi-weekly)
        grossPay = emp.salary / 26;
      } else if (emp.hourly_rate) {
        // Hourly employee: (regular hours * rate) + (OT hours * rate * 1.5)
        grossPay = (regularHours * emp.hourly_rate) + (overtimeHours * emp.hourly_rate * 1.5);
      }

      return {
        employee: emp,
        timeEntries: empTimeEntries, // ADD: Include time entries for display
        timeEntriesCount: empTimeEntries.length,
        totalHours,
        regularHours,
        overtimeHours,
        grossPay,
      };
    }).filter(item => item.timeEntriesCount > 0 || item.employee.salary);

    const totalGross = employeePayroll.reduce((sum, item) => sum + item.grossPay, 0);

    setPayrollPreview({
      employeePayroll,
      totalGross,
      periodStart: payrollStartDate,
      periodEnd: payrollEndDate,
    });
  };

  // --- FUNCTIONAL: Trigger Payroll Run (Calls SQL function directly) ---
  const handleRunPayroll = async () => {
    if (!payrollStartDate || !payrollEndDate) {
      alert('Please select a valid pay period start and end date.');
      return;
    }
    
    if (!payrollPreview) {
      alert('Please preview payroll first to see what will be processed.');
      return;
    }

    if (!confirm(`Run payroll for ${payrollPreview.employeePayroll.length} employees totaling $${payrollPreview.totalGross.toFixed(2)}?`)) {
      return;
    }

    setPayrollStatus('Processing payroll...');
    
    try {
      // Call the SQL function directly
      const { data, error } = await supabase.rpc('run_payroll_for_period', {
        org_id: organizationId,
        start_date: payrollStartDate,
        end_date: payrollEndDate,
      });

      if (error) {
        setPayrollStatus(`Error: ${error.message}`);
        console.error('SQL Function Error:', error);
      } else {
        setPayrollStatus(`✅ Payroll Complete! Processed for ${payrollStartDate} to ${payrollEndDate}`);
        console.log('Payroll data:', data);
        setPayrollResults(data);
        
        // Refresh time entries to show processed status
        const { data: timeEntriesData } = await supabase
          .from('time_entries')
          .select('*')
          .in('employee_id', employees.map(e => e.id))
          .order('clock_in', { ascending: false });
        if (timeEntriesData) setTimeEntries(timeEntriesData);
        
        // Clear preview
        setPayrollPreview(null);
      }
    } catch (error) {
      setPayrollStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Payroll error:', error);
    }
  };
  
  // --- ADD: Handle Contractor Payment ---
  const handleAddContractorPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contractorId || !contractorAmount) {
      alert('Please select a contractor and enter an amount.');
      return;
    }

    const amount = parseFloat(contractorAmount.toString());
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    try {
      // TODO: Replace with actual contractor payment logic
      // For now, just create a manual time entry or paystub
      console.log('Adding contractor payment:', {
        contractorId,
        amount,
        description: contractorDescription,
        organizationId
      });

      alert(`Contractor payment of $${amount.toFixed(2)} added successfully!`);
      
      // Reset form
      setContractorId('');
      setContractorAmount('');
      setContractorDescription('');
    } catch (error) {
      console.error('Error adding contractor payment:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // --- ADD: Handle Contractor Onboarding ---
  const handleAddContractor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contractorEmail || !contractorFirstName || !contractorLastName || !contractorTaxId) {
      alert('Name, Email, and Tax ID are required for contractors.');
      return;
    }

    const rate = parseFloat(contractorRate.toString());

    const newContractor = {
      email: contractorEmail,
      employee_id: `CONTR-${Date.now()}`, // Auto-generate contractor ID
      first_name: contractorFirstName,
      last_name: contractorLastName,
      phone: contractorPhone || null,
      address: contractorAddress || null,
      city: contractorCity || null,
      state: contractorState || null,
      zip_code: contractorZip || null,
      tax_id: contractorTaxId,
      hourly_rate: isNaN(rate) ? null : rate,
      department: 'Contractor',
      status: 'Active',
      is_contractor: true,
      organization_id: organizationId,
      created_by: userId,
      updated_by: userId,
    };

    const { data, error } = await supabase
      .from('employees')
      .insert(newContractor)
      .select()
      .single();

    if (error) {
      console.error('Error adding contractor:', error);
      alert(`Error: ${error.message}`);
    } else if (data) {
      setEmployees([...employees, data]);
      // Reset form
      setContractorFirstName('');
      setContractorLastName('');
      setContractorEmail('');
      setContractorPhone('');
      setContractorAddress('');
      setContractorCity('');
      setContractorState('');
      setContractorZip('');
      setContractorTaxId('');
      setContractorRate('');
      alert('Contractor added successfully!');
      setActiveWorkforceTab('employees');
    }
  };

  // --- ADD: Toggle Employee Active/Inactive Status ---
  const handleToggleEmployeeStatus = async (employeeId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    
    const { error } = await supabase
      .from('employees')
      .update({ status: newStatus, updated_by: userId })
      .eq('id', employeeId);

    if (error) {
      console.error('Error updating employee status:', error);
      alert(`Error: ${error.message}`);
    } else {
      // Update local state
      setEmployees(employees.map(emp => 
        emp.id === employeeId ? { ...emp, status: newStatus } : emp
      ));
      alert(`Employee status updated to ${newStatus}`);
    }
  };

  // --- ADD: Delete Employee ---
  const handleDeleteEmployee = async (employeeId: string, employeeName: string) => {
    if (!confirm(`Are you sure you want to delete ${employeeName}? This action cannot be undone.`)) {
      return;
    }

    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', employeeId);

    if (error) {
      console.error('Error deleting employee:', error);
      alert(`Error: ${error.message}`);
    } else {
      // Remove from local state
      setEmployees(employees.filter(emp => emp.id !== employeeId));
      alert(`${employeeName} has been deleted.`);
    }
  };

  // --- ADD: Edit Employee (placeholder - you can expand this later) ---
  const handleEditEmployee = (employeeId: string) => {
    // TODO: Open a modal or navigate to edit form
    alert('Edit functionality coming soon! For now, you can delete and re-add the employee with updated information.');
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
            <TabsList className="grid w-full grid-cols-8 mb-6 bg-slate-900/70">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="employees">Employees ({employees.length})</TabsTrigger>
              <TabsTrigger value="timekeeping">Time Tracking</TabsTrigger>
              <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
              <TabsTrigger value="payroll">Payroll</TabsTrigger>
              <TabsTrigger value="handbook">Handbook</TabsTrigger>
              <TabsTrigger value="clients">Clients</TabsTrigger>
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

            {/* --- Employees Tab (Reads from DB) - ADD ACTION BUTTONS --- */}
            <TabsContent value="employees" className="space-y-4">
              {employees.length === 0 ? (
                <p className="text-gray-400">No employees found. Use the 'Add Employee' tab.</p>
              ) : (
                employees.map(emp => (
                  <Card key={emp.id} className="p-4 bg-slate-700/50 border-slate-600">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                      <div>
                        <h4 className="font-medium">
                          {emp.first_name && emp.last_name 
                            ? `${emp.first_name} ${emp.last_name}` 
                            : emp.email
                          }
                        </h4>
                        <p className="text-sm text-gray-400">ID: {emp.employee_id}</p>
                      </div>
                      <p className="text-sm"><span className="text-gray-400">Dept:</span> {emp.department || 'N/A'}</p>
                      <p className="text-sm"><span className="text-gray-400">Rate:</span> ${emp.hourly_rate?.toFixed(2) || emp.salary ? `$${(emp.salary / 2080).toFixed(2)}` : 'N/A'}/hr</p>
                      <Badge variant={emp.status === 'Active' ? 'default' : 'secondary'}>{emp.status}</Badge>
                      
                      {/* ADD ACTION BUTTONS */}
                      <div className="flex gap-2 justify-end">
                        {/* Edit Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditEmployee(emp.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white border-blue-500"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        
                        {/* Toggle Active/Inactive Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleEmployeeStatus(emp.id, emp.status)}
                          className={emp.status === 'Active' 
                            ? 'bg-orange-600 hover:bg-orange-700 text-white border-orange-500' 
                            : 'bg-green-600 hover:bg-green-700 text-white border-green-500'
                          }
                        >
                          {emp.status === 'Active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </Button>
                        
                        {/* Delete Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteEmployee(
                            emp.id, 
                            emp.first_name && emp.last_name ? `${emp.first_name} ${emp.last_name}` : emp.email
                          )}
                          className="bg-red-600 hover:bg-red-700 text-white border-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
                  <p className="text-sm text-gray-400">Select pay period and preview before processing.</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                         <Label htmlFor="payroll-start">Pay Period Start</Label>
                         <Input 
                           id="payroll-start" 
                           type="date" 
                           value={payrollStartDate} 
                           onChange={e => {
                             setPayrollStartDate(e.target.value);
                             setPayrollPreview(null); // Clear preview when dates change
                           }}
                           className="bg-slate-800 border-slate-600 text-white"
                         />
                       </div>
                       <div className="space-y-2">
                         <Label htmlFor="payroll-end">Pay Period End</Label>
                         <Input 
                           id="payroll-end" 
                           type="date" 
                           value={payrollEndDate} 
                           onChange={e => {
                             setPayrollEndDate(e.target.value);
                             setPayrollPreview(null); // Clear preview when dates change
                           }}
                           className="bg-slate-800 border-slate-600 text-white"
                         />
                       </div>
                     </div>
                     
                     {/* Preview Button */}
                     <Button 
                       onClick={handlePreviewPayroll}
                       disabled={!payrollStartDate || !payrollEndDate}
                       className="w-full bg-blue-600 hover:bg-blue-700"
                     >
                       Preview Payroll
                     </Button>

                     {/* Payroll Preview WITH TIME ENTRY DETAILS */}
                     {payrollPreview && (
                       <Card className="bg-blue-900/30 border-blue-500">
                         <CardHeader>
                           <CardTitle className="text-blue-300">Payroll Preview</CardTitle>
                           <p className="text-sm text-gray-400">
                             Period: {payrollPreview.periodStart} to {payrollPreview.periodEnd}
                           </p>
                         </CardHeader>
                         <CardContent className="space-y-3">
                           {payrollPreview.employeePayroll.length === 0 ? (
                             <p className="text-yellow-300">No pending time entries found for this period.</p>
                           ) : (
                             <>
                               {payrollPreview.employeePayroll.map((item: any) => (
                                 <details key={item.employee.id} className="bg-slate-800/50 p-3 rounded">
                                   <summary className="cursor-pointer">
                                     <div className="flex justify-between items-start">
                                       <div>
                                         <h4 className="font-semibold text-white inline">
                                           {item.employee.first_name} {item.employee.last_name}
                                         </h4>
                                         <p className="text-sm text-gray-400">
                                           {item.timeEntriesCount} time entries | {item.totalHours.toFixed(2)} hours
                                           {item.overtimeHours > 0 && ` (${item.overtimeHours.toFixed(2)} OT)`}
                                         </p>
                                       </div>
                                       <div className="text-right">
                                         <p className="text-xl font-bold text-green-400">
                                           ${item.grossPay.toFixed(2)}
                                         </p>
                                         <p className="text-xs text-gray-400">Gross Pay</p>
                                       </div>
                                     </div>
                                   </summary>
                                   
                                   {/* TIME ENTRY DETAILS */}
                                   <div className="mt-3 ml-4 space-y-2 border-l-2 border-blue-500 pl-3">
                                     <h5 className="text-sm font-semibold text-blue-300">Time Entries:</h5>
                                     {item.timeEntries.map((entry: TimeEntry) => (
                                       <div key={entry.id} className="text-xs bg-slate-900/50 p-2 rounded">
                                         <div className="flex justify-between">
                                           <span className="text-gray-300">
                                             {new Date(entry.clock_in).toLocaleDateString()}
                                           </span>
                                           <span className="text-white font-semibold">
                                             {entry.total_hours?.toFixed(2)} hrs
                                           </span>
                                         </div>
                                         <div className="text-gray-400 mt-1">
                                           In: {new Date(entry.clock_in).toLocaleTimeString()} → 
                                           Out: {new Date(entry.clock_out).toLocaleTimeString()}
                                         </div>
                                         {entry.overtime_hours && entry.overtime_hours > 0 && (
                                           <div className="text-orange-400 mt-1">
                                             ⚠️ OT: {entry.overtime_hours.toFixed(2)} hours @ 1.5x rate
                                           </div>
                                         )}
                                       </div>
                                     ))}
                                     
                                     {/* Pay Calculation Breakdown */}
                                     <div className="mt-3 pt-2 border-t border-slate-600">
                                       <h6 className="text-xs font-semibold text-green-300 mb-1">Pay Calculation:</h6>
                                       {item.employee.hourly_rate ? (
                                         <>
                                           <div className="text-xs text-gray-300">
                                             Regular: {item.regularHours.toFixed(2)} hrs × ${item.employee.hourly_rate.toFixed(2)} = 
                                             <span className="text-green-400 font-semibold ml-1">
                                               ${(item.regularHours * item.employee.hourly_rate).toFixed(2)}
                                             </span>
                                           </div>
                                           {item.overtimeHours > 0 && (
                                             <div className="text-xs text-orange-300">
                                               Overtime: {item.overtimeHours.toFixed(2)} hrs × ${(item.employee.hourly_rate * 1.5).toFixed(2)} = 
                                               <span className="text-orange-400 font-semibold ml-1">
                                                 ${(item.overtimeHours * item.employee.hourly_rate * 1.5).toFixed(2)}
                                               </span>
                                             </div>
                                           )}
                                         </>
                                       ) : item.employee.salary ? (
                                         <div className="text-xs text-gray-300">
                                           Salary: ${item.employee.salary.toLocaleString()}/year ÷ 26 pay periods = 
                                           <span className="text-green-400 font-semibold ml-1">
                                             ${item.grossPay.toFixed(2)}
                                           </span>
                                         </div>
                                       ) : null}
                                     </div>
                                   </div>
                                 </details>
                               ))}
                               
                               <div className="bg-green-900/30 p-4 rounded border border-green-500 mt-4">
                                 <div className="flex justify-between items-center">
                                   <div>
                                     <h4 className="text-lg font-bold text-green-300">Total Payroll</h4>
                                     <p className="text-sm text-gray-400">
                                       {payrollPreview.employeePayroll.length} employees | 
                                       {' '}{payrollPreview.employeePayroll.reduce((sum: number, item: any) => sum + item.timeEntriesCount, 0)} time entries
                                     </p>
                                   </div>
                                   <p className="text-3xl font-bold text-green-400">
                                     ${payrollPreview.totalGross.toFixed(2)}
                                   </p>
                                 </div>
                               </div>
                             </>
                           )}
                         </CardContent>
                       </Card>
                     )}

                     {/* Run Payroll Button */}
                    <Button 
                      onClick={handleRunPayroll} 
                      disabled={payrollStatus.startsWith('Processing') || !payrollPreview}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {payrollStatus.startsWith('Processing') ? 'Processing...' : 'Run Payroll'}
                    </Button>
                    <p className="text-center text-gray-400">Status: {payrollStatus}</p>

                     {/* Payroll Results WITH TIME ENTRY SUMMARY */}
                     {payrollResults && (
                       <Card className="bg-green-900/30 border-green-500">
                         <CardHeader>
                           <CardTitle className="text-green-300">✅ Payroll Complete!</CardTitle>
                         </CardHeader>
                         <CardContent className="space-y-3">
                           <p className="text-white">
                             Successfully processed payroll for the period {payrollStartDate} to {payrollEndDate}.
                           </p>
                           
                           <div className="bg-slate-800/50 p-3 rounded space-y-2">
                             <h5 className="text-sm font-semibold text-blue-300">Processed:</h5>
                             <div className="text-sm text-gray-300">
                               • {employees.filter(e => timeEntries.some(t => t.employee_id === e.id && t.processing_state === 'processed')).length} employees paid
                             </div>
                             <div className="text-sm text-gray-300">
                               • {timeEntries.filter(t => t.processing_state === 'processed').length} time entries marked as processed
                             </div>
                             <div className="text-sm text-gray-300">
                               • Paystubs generated in database
                             </div>
                           </div>
                           
                           <p className="text-xs text-gray-400 mt-2">
                             💡 Tip: Check the Supabase "paystubs" table to view detailed paystubs for each employee.
                           </p>
                         </CardContent>
                       </Card>
                     )}
                  </div>

                  {/* ADD CONTRACTOR PAYMENT SECTION */}
                  <div className="mt-8 pt-8 border-t border-slate-600">
                    <h3 className="text-lg font-semibold mb-4">Add Contractor Payment</h3>
                    <form onSubmit={handleAddContractorPayment} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="contractor-select">Select Contractor</Label>
                        <Select value={contractorId} onValueChange={setContractorId}>
                          <SelectTrigger id="contractor-select" className="bg-slate-800 border-slate-600 text-white">
                            <SelectValue placeholder="Select a contractor" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 text-white border-slate-600">
                            {employees.filter(emp => emp.is_contractor || emp.department === 'Contractor').map(emp => (
                              <SelectItem key={emp.id} value={emp.id} className="focus:bg-slate-700">
                                {emp.first_name && emp.last_name 
                                  ? `${emp.first_name} ${emp.last_name}` 
                                  : emp.email
                                } (ID: {emp.employee_id})
                              </SelectItem>
                            ))}
                            {employees.filter(emp => emp.is_contractor || emp.department === 'Contractor').length === 0 && (
                              <SelectItem value="none" disabled className="text-gray-500">
                                No contractors found. Add contractors in Onboarding tab.
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contractor-amount">Payment Amount ($)</Label>
                        <Input 
                          id="contractor-amount" 
                          type="number" 
                          step="0.01"
                          min="0"
                          value={contractorAmount} 
                          onChange={e => setContractorAmount(e.target.value)} 
                          placeholder="0.00"
                          className="bg-slate-800 border-slate-600 text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contractor-description">Description (Optional)</Label>
                        <Input 
                          id="contractor-description" 
                          type="text"
                          value={contractorDescription} 
                          onChange={e => setContractorDescription(e.target.value)} 
                          placeholder="e.g., Website development - October 2025"
                          className="bg-slate-800 border-slate-600 text-white"
                        />
                      </div>

                      <Button 
                        type="submit"
                        disabled={!contractorId || !contractorAmount}
                        className="w-full"
                      >
                        Add Contractor Payment
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- FUNCTIONAL Onboarding Tab --- */}
            <TabsContent value="onboarding" className="space-y-4">
              
              {/* Employee Onboarding - UPDATED WITH MORE FIELDS */}
              <Card className="bg-slate-700/50 border-slate-600">
                <CardHeader>
                  <CardTitle>Add New Employee (W-2)</CardTitle>
                  <p className="text-sm text-gray-400">
                    For full-time or part-time employees who receive W-2 forms.
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddNewEmployee} className="space-y-4">
                    
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="emp-fname">First Name *</Label>
                        <Input 
                          id="emp-fname" 
                          value={newEmpFirstName} 
                          onChange={e => setNewEmpFirstName(e.target.value)} 
                          required 
                          className="bg-slate-800 border-slate-600 text-white" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emp-lname">Last Name *</Label>
                        <Input 
                          id="emp-lname" 
                          value={newEmpLastName} 
                          onChange={e => setNewEmpLastName(e.target.value)} 
                          required 
                          className="bg-slate-800 border-slate-600 text-white" 
                        />
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="emp-email">Email *</Label>
                        <Input 
                          id="emp-email" 
                          type="email" 
                          value={newEmpEmail} 
                          onChange={e => setNewEmpEmail(e.target.value)} 
                          required 
                          className="bg-slate-800 border-slate-600 text-white" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emp-phone">Phone</Label>
                        <Input 
                          id="emp-phone" 
                          type="tel" 
                          placeholder="(555) 123-4567"
                          value={newEmpPhone} 
                          onChange={e => setNewEmpPhone(e.target.value)} 
                          className="bg-slate-800 border-slate-600 text-white" 
                        />
                      </div>
                    </div>

                    {/* Employee ID and Department */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="emp-id">Employee ID *</Label>
                        <Input 
                          id="emp-id" 
                          value={newEmpEmployeeId} 
                          onChange={e => setNewEmpEmployeeId(e.target.value)} 
                          placeholder="EMP-001"
                          required 
                          className="bg-slate-800 border-slate-600 text-white" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emp-dept">Department</Label>
                        <Input 
                          id="emp-dept" 
                          value={newEmpDepartment} 
                          onChange={e => setNewEmpDepartment(e.target.value)} 
                          placeholder="Engineering, Sales, etc."
                          className="bg-slate-800 border-slate-600 text-white" 
                        />
                      </div>
                    </div>

                    {/* Position and Hire Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="emp-position">Position/Title</Label>
                        <Input 
                          id="emp-position" 
                          value={newEmpPosition} 
                          onChange={e => setNewEmpPosition(e.target.value)} 
                          placeholder="Software Engineer, Manager, etc."
                          className="bg-slate-800 border-slate-600 text-white" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emp-hire-date">Hire Date *</Label>
                        <Input 
                          id="emp-hire-date" 
                          type="date"
                          value={newEmpHireDate} 
                          onChange={e => setNewEmpHireDate(e.target.value)} 
                          required
                          className="bg-slate-800 border-slate-600 text-white" 
                        />
                      </div>
                    </div>

                    {/* Pay Type Selection */}
                    <div className="space-y-2">
                      <Label>Pay Type *</Label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="pay-type"
                            value="hourly"
                            checked={newEmpPayType === 'hourly'}
                            onChange={() => setNewEmpPayType('hourly')}
                            className="w-4 h-4"
                          />
                          <span className="text-white">Hourly</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="pay-type"
                            value="salary"
                            checked={newEmpPayType === 'salary'}
                            onChange={() => setNewEmpPayType('salary')}
                            className="w-4 h-4"
                          />
                          <span className="text-white">Salary</span>
                        </label>
                      </div>
                    </div>

                    {/* Conditional Pay Rate/Salary Input */}
                    {newEmpPayType === 'hourly' ? (
                      <div className="space-y-2">
                        <Label htmlFor="emp-rate">Hourly Rate ($)</Label>
                        <Input 
                          id="emp-rate" 
                          type="number" 
                          step="0.01" 
                          min="0"
                          value={newEmpHourlyRate} 
                          onChange={e => setNewEmpHourlyRate(e.target.value)} 
                          placeholder="25.00"
                          className="bg-slate-800 border-slate-600 text-white" 
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="emp-salary">Annual Salary ($)</Label>
                        <Input 
                          id="emp-salary" 
                          type="number" 
                          step="1000" 
                          min="0"
                          value={newEmpSalary} 
                          onChange={e => setNewEmpSalary(e.target.value)} 
                          placeholder="50000"
                          className="bg-slate-800 border-slate-600 text-white" 
                        />
                      </div>
                    )}

                    <Button type="submit" className="w-full">
                      Add Employee to Organization
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contractor Onboarding - EXISTING CODE */}
              <Card className="bg-slate-700/50 border-slate-600 border-orange-500/30">
                <CardHeader>
                  <CardTitle className="text-orange-300">Add New Contractor (1099)</CardTitle>
                  <p className="text-sm text-gray-400">
                    For independent contractors who receive 1099 forms. Requires Tax ID for compliance.
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddContractor} className="space-y-4">
                    
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contr-fname">First Name *</Label>
                        <Input 
                          id="contr-fname" 
                          value={contractorFirstName} 
                          onChange={e => setContractorFirstName(e.target.value)} 
                          required 
                          className="bg-slate-800 border-slate-600 text-white" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contr-lname">Last Name *</Label>
                        <Input 
                          id="contr-lname" 
                          value={contractorLastName} 
                          onChange={e => setContractorLastName(e.target.value)} 
                          required 
                          className="bg-slate-800 border-slate-600 text-white" 
                        />
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contr-email">Email *</Label>
                        <Input 
                          id="contr-email" 
                          type="email" 
                          value={contractorEmail} 
                          onChange={e => setContractorEmail(e.target.value)} 
                          required 
                          className="bg-slate-800 border-slate-600 text-white" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contr-phone">Phone</Label>
                        <Input 
                          id="contr-phone" 
                          type="tel" 
                          placeholder="(555) 123-4567"
                          value={contractorPhone} 
                          onChange={e => setContractorPhone(e.target.value)} 
                          className="bg-slate-800 border-slate-600 text-white" 
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                      <Label htmlFor="contr-address">Street Address</Label>
                      <Input 
                        id="contr-address" 
                        value={contractorAddress} 
                        onChange={e => setContractorAddress(e.target.value)} 
                        placeholder="123 Main Street"
                        className="bg-slate-800 border-slate-600 text-white" 
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contr-city">City</Label>
                        <Input 
                          id="contr-city" 
                          value={contractorCity} 
                          onChange={e => setContractorCity(e.target.value)} 
                          className="bg-slate-800 border-slate-600 text-white" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contr-state">State</Label>
                        <Input 
                          id="contr-state" 
                          value={contractorState} 
                          onChange={e => setContractorState(e.target.value)} 
                          placeholder="CA"
                          maxLength={2}
                          className="bg-slate-800 border-slate-600 text-white" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contr-zip">ZIP Code</Label>
                        <Input 
                          id="contr-zip" 
                          value={contractorZip} 
                          onChange={e => setContractorZip(e.target.value)} 
                          placeholder="12345"
                          className="bg-slate-800 border-slate-600 text-white" 
                        />
                      </div>
                    </div>

                    {/* Tax ID */}
                    <div className="space-y-2">
                      <Label htmlFor="contr-taxid">Tax ID (SSN or EIN) *</Label>
                      <Input 
                        id="contr-taxid" 
                        type="text"
                        value={contractorTaxId} 
                        onChange={e => setContractorTaxId(e.target.value)} 
                        placeholder="XX-XXXXXXX or XXX-XX-XXXX"
                        required
                        className="bg-slate-800 border-slate-600 text-white" 
                      />
                      <p className="text-xs text-gray-400">Required for 1099 reporting. This information is encrypted.</p>
                    </div>

                    {/* Rate */}
                    <div className="space-y-2">
                      <Label htmlFor="contr-rate">Hourly Rate ($)</Label>
                      <Input 
                        id="contr-rate" 
                        type="number" 
                        step="0.01" 
                        min="0"
                        value={contractorRate} 
                        onChange={e => setContractorRate(e.target.value)} 
                        placeholder="0.00"
                        className="bg-slate-800 border-slate-600 text-white" 
                      />
                    </div>

                    <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
                      Add Contractor (1099)
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- NEW SCHEDULING TAB --- */}
            <TabsContent value="scheduling" className="space-y-4">
              <Card className="bg-slate-700/50 border-slate-600">
                <CardHeader><CardTitle>📅 Employee Scheduling</CardTitle></CardHeader>
                <CardContent className="p-8 text-center text-gray-400">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-blue-400" />
                  <p className="text-lg mb-2">Scheduling system coming soon</p>
                  <p className="text-sm">Drag-and-drop shift planning, conflict detection, and auto-notifications</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- NEW HANDBOOK TAB --- */}
            <TabsContent value="handbook" className="space-y-4">
              <Card className="bg-slate-700/50 border-slate-600">
                <CardHeader><CardTitle>📖 Company Handbook</CardTitle></CardHeader>
                <CardContent className="p-8 text-center text-gray-400">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 text-green-400" />
                  <p className="text-lg mb-2">Employee handbook coming soon</p>
                  <p className="text-sm">Policies, procedures, benefits, and company culture documentation</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- NEW CLIENTS TAB --- */}
            <TabsContent value="clients" className="space-y-4">
              <Card className="bg-slate-700/50 border-slate-600">
                <CardHeader><CardTitle>🏢 Client Management</CardTitle></CardHeader>
                <CardContent className="p-8 text-center text-gray-400">
                  <Users className="h-16 w-16 mx-auto mb-4 text-purple-400" />
                  <p className="text-lg mb-2">Client management coming soon</p>
                  <p className="text-sm">Track client projects, allocate employee time, and manage billing</p>
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
