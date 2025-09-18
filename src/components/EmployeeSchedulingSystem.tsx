import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { supabase } from '@/lib/supabase';

interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  hourlyRate: number;
}

interface Shift {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  startTime: string;
  endTime: string;
  department: string;
  position: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'missed';
}

export default function EmployeeSchedulingSystem() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(new Date().toISOString().split('T')[0]);

  const [newEmployee, setNewEmployee] = useState({
    name: '',
    department: '',
    position: '',
    hourlyRate: 0
  });

  const [newShift, setNewShift] = useState({
    employeeId: '',
    date: '',
    startTime: '',
    endTime: '',
    department: '',
    position: ''
  });

  useEffect(() => {
    loadEmployees();
    loadShifts();
  }, []);

  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name');
      
      if (!error && data) {
        setEmployees(data);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadShifts = async () => {
    try {
      const { data, error } = await supabase
        .from('employee_shifts')
        .select('*')
        .order('date', { ascending: true });
      
      if (!error && data) {
        setShifts(data);
      }
    } catch (error) {
      console.error('Error loading shifts:', error);
    }
  };

  const addEmployee = async () => {
    if (!newEmployee.name || !newEmployee.department) {
      alert('Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('employees')
        .insert([newEmployee])
        .select()
        .single();

      if (!error && data) {
        setEmployees([...employees, data]);
        setNewEmployee({ name: '', department: '', position: '', hourlyRate: 0 });
        alert('Employee added successfully!');
      }
    } catch (error) {
      console.error('Error adding employee:', error);
    }
    setLoading(false);
  };

  const scheduleShift = async () => {
    if (!newShift.employeeId || !newShift.date || !newShift.startTime || !newShift.endTime) {
      alert('Please fill in all shift details');
      return;
    }

    const employee = employees.find(emp => emp.id === newShift.employeeId);
    if (!employee) return;

    setLoading(true);
    try {
      const shiftData = {
        ...newShift,
        employeeName: employee.name,
        department: employee.department,
        position: employee.position,
        status: 'scheduled'
      };

      const { data, error } = await supabase
        .from('employee_shifts')
        .insert([shiftData])
        .select()
        .single();

      if (!error && data) {
        setShifts([...shifts, data]);
        setNewShift({ employeeId: '', date: '', startTime: '', endTime: '', department: '', position: '' });
        alert('Shift scheduled successfully!');
      }
    } catch (error) {
      console.error('Error scheduling shift:', error);
    }
    setLoading(false);
  };

  const getWeekDates = (startDate: string) => {
    const dates = [];
    const start = new Date(startDate);
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const weekDates = getWeekDates(selectedWeek);
  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
          <Calendar className="h-6 w-6" />
          Employee Scheduling System
        </h2>
      </div>

      <Tabs defaultValue="schedule" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-black/20">
          <TabsTrigger value="schedule" className="text-white data-[state=active]:bg-blue-500/30">Schedule View</TabsTrigger>
          <TabsTrigger value="create" className="text-white data-[state=active]:bg-green-500/30">Create Shift</TabsTrigger>
          <TabsTrigger value="employees" className="text-white data-[state=active]:bg-purple-500/30">Manage Employees</TabsTrigger>
          <TabsTrigger value="reports" className="text-white data-[state=active]:bg-orange-500/30">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-6">
          <Card className="bg-black/20 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Weekly Schedule
              </CardTitle>
              <div className="flex gap-4 items-center">
                <Input
                  type="date"
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  className="bg-black/20 border-white/20 text-white"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {weekDates.map((date, index) => (
                  <div key={date} className="border border-white/20 rounded-lg p-3 min-h-[200px]">
                    <h3 className="text-white font-medium text-center mb-2">
                      {weekDays[index]}
                      <br />
                      <span className="text-sm text-gray-300">{date}</span>
                    </h3>
                    <div className="space-y-2">
                      {shifts
                        .filter(shift => shift.date === date)
                        .map(shift => (
                          <div key={shift.id} className="bg-blue-500/20 rounded p-2 text-xs text-white">
                            <div className="font-medium">{shift.employeeName}</div>
                            <div>{shift.startTime} - {shift.endTime}</div>
                            <div className="text-gray-300">{shift.position}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card className="bg-black/20 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Schedule New Shift
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={newShift.employeeId} onValueChange={(value) => setNewShift({...newShift, employeeId: value})}>
                <SelectTrigger className="bg-black/20 border-white/20 text-white">
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name} - {emp.position}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="grid grid-cols-3 gap-4">
                <Input
                  type="date"
                  value={newShift.date}
                  onChange={(e) => setNewShift({...newShift, date: e.target.value})}
                  className="bg-black/20 border-white/20 text-white"
                />
                <Input
                  type="time"
                  placeholder="Start Time"
                  value={newShift.startTime}
                  onChange={(e) => setNewShift({...newShift, startTime: e.target.value})}
                  className="bg-black/20 border-white/20 text-white"
                />
                <Input
                  type="time"
                  placeholder="End Time"
                  value={newShift.endTime}
                  onChange={(e) => setNewShift({...newShift, endTime: e.target.value})}
                  className="bg-black/20 border-white/20 text-white"
                />
              </div>
              
              <Button onClick={scheduleShift} disabled={loading} className="w-full">
                <Clock className="h-4 w-4 mr-2" />
                Schedule Shift
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <Card className="bg-black/20 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                Add New Employee
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Employee Name"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                  className="bg-black/20 border-white/20 text-white"
                />
                <Input
                  placeholder="Department"
                  value={newEmployee.department}
                  onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                  className="bg-black/20 border-white/20 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Position"
                  value={newEmployee.position}
                  onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                  className="bg-black/20 border-white/20 text-white"
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Hourly Rate"
                  value={newEmployee.hourlyRate}
                  onChange={(e) => setNewEmployee({...newEmployee, hourlyRate: parseFloat(e.target.value)})}
                  className="bg-black/20 border-white/20 text-white"
                />
              </div>
              <Button onClick={addEmployee} disabled={loading} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Current Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {employees.map(emp => (
                  <div key={emp.id} className="flex justify-between items-center p-3 bg-white/5 rounded">
                    <div className="text-white">
                      <div className="font-medium">{emp.name}</div>
                      <div className="text-sm text-gray-300">{emp.position} - {emp.department}</div>
                    </div>
                    <div className="text-white">${emp.hourlyRate}/hr</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card className="bg-black/20 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Schedule Reports</CardTitle>
            </CardHeader>
            <CardContent className="text-white">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{employees.length}</div>
                  <div className="text-sm">Total Employees</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{shifts.length}</div>
                  <div className="text-sm">Scheduled Shifts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {shifts.filter(s => s.status === 'completed').length}
                  </div>
                  <div className="text-sm">Completed Shifts</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}